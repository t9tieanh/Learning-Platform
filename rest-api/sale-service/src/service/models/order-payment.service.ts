import prismaService from '~/service/utils/prisma.service';
import ApiError from '~/middleware/ApiError';
import { OrderStatus, OrderType } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import vnpayService from '~/service/utils/vnpay.service';
import momoService from '../utils/momo.service';
import payosService, { PayosReturnQuery } from '../utils/payos.service';
import rabbitMQService from '~/service/utils/rabbitmq.service';
import redisService, { SagaResult } from '~/service/utils/redis.service';
import orderFulfillmentService from '~/service/utils/order-fulfillment.service';
import orderRefundNotificationService from '~/service/utils/order-refund-notification.service';
import { createEnvelope } from '~/sagas/events/envelope';
import { VipRegisterCreatedPayload } from '~/sagas/buy_vip/vip.dtos';
import { VipMessageType } from '~/sagas/buy_vip/vip.events';
import { PaymentProviderEnum } from '~/enums/paymentProvider.enum';
import { env } from '~/config/env';
import Logger from '~/utils/logger';
import { Webhook } from '@payos/node';

const SAGA_TIMEOUT_MS = 30_000
const RETURN_URL_SAGA_TIMEOUT_MS = env.RETURN_URL_SAGA_TIMEOUT_MS

class OrderPaymentService {
    async verifyOrderForMomo(query: any) {
        return this.handleVerify(query, PaymentProviderEnum.MOMO);
    }

    async verifyOrderForVnPay(query: any) {
        return this.handleVerify(query, PaymentProviderEnum.VNPAY);
    }

    async verifyVipOrderForMomo(query: any) {
        return this.handleVerifyVip(query, PaymentProviderEnum.MOMO);
    }

    async verifyVipOrderForVnpay(query: any) {
        return this.handleVerifyVip(query, PaymentProviderEnum.VNPAY);
    }

    async verifyOrderForPayos(query: any) {
        return this.handleVerify(query, PaymentProviderEnum.PAYOS);
    }

    async verifyVipOrderForPayos(query: any) {
        return this.handleVerifyVip(query, PaymentProviderEnum.PAYOS);
    }

    async handlePayosWebhook(body: Webhook): Promise<{ alreadyCompleted: boolean; refundNotified: boolean }> {
        const webhookData = await payosService.verifyWebhook(body);

        if (this.isPayosConfirmValidationPing(webhookData.orderCode)) {
            Logger.info('PayOS webhook validation ping acknowledged (test orderCode)');
            return { alreadyCompleted: false, refundNotified: false };
        }

        let order: Awaited<ReturnType<typeof payosService.resolveOrderFromWebhook>>['order'];
        let orderId: string;
        try {
            const resolved = await payosService.resolveOrderFromWebhook(webhookData);
            order = resolved.order;
            orderId = resolved.orderId;
        } catch (err) {
            if (err instanceof ApiError && err.status === StatusCodes.NOT_FOUND) {
                Logger.info('PayOS webhook validation ping acknowledged');
                return { alreadyCompleted: false, refundNotified: false };
            }
            throw err;
        }

        if (order.status === OrderStatus.Completed) {
            return { alreadyCompleted: true, refundNotified: false };
        }

        if (await orderFulfillmentService.isSagaTriggered(orderId)) {
            Logger.info(`PayOS webhook: saga already triggered for ${orderId}`);
            return { alreadyCompleted: false, refundNotified: false };
        }

        if (order.status === OrderStatus.Cancel) {
            Logger.info(`PayOS webhook: order ${orderId} already cancelled`);
            return { alreadyCompleted: false, refundNotified: false };
        }

        if (order.type === OrderType.VIP_SUBSCRIPTION) {
            return this.handlePayosVipWebhook(order, orderId);
        }

        const triggerResult = await orderFulfillmentService.triggerOrderFulfillment(orderId, 'webhook');

        if (triggerResult.triggered) {
            Logger.info(
                `PayOS webhook: fulfillment triggered for ${orderId} (alreadyExisted=${triggerResult.alreadyExisted ?? false})`
            );
            return { alreadyCompleted: false, refundNotified: false };
        }

        Logger.error(`PayOS webhook: could not trigger fulfillment for ${orderId}: ${triggerResult.reason}`);
        await orderRefundNotificationService.sendPaymentRefundNotify(orderId);
        return { alreadyCompleted: false, refundNotified: true };
    }

    /** PayOS sends this sample orderCode when probing the webhook URL during confirm-webhook. */
    private isPayosConfirmValidationPing(orderCode: number): boolean {
        return orderCode === 123;
    }

    private async handlePayosVipWebhook(
        order: { id: string; user_id: string; total: number; status: string },
        orderId: string
    ): Promise<{ alreadyCompleted: boolean; refundNotified: boolean }> {
        if (await orderFulfillmentService.isSagaTriggered(orderId)) {
            Logger.info(`PayOS VIP webhook: saga already triggered for ${orderId}`);
            return { alreadyCompleted: false, refundNotified: false };
        }

        const lockKey = `payment:lock:${orderId}`;
        const locked = await redisService.setLock(lockKey, { provider: PaymentProviderEnum.PAYOS, source: 'webhook' }, 120);
        if (!locked) {
            if (await orderFulfillmentService.isSagaTriggered(orderId)) {
                return { alreadyCompleted: false, refundNotified: false };
            }
            Logger.warn(`PayOS VIP webhook: could not acquire lock for ${orderId}`);
            return { alreadyCompleted: false, refundNotified: false };
        }

        if (await orderFulfillmentService.isSagaTriggered(orderId)) {
            return { alreadyCompleted: false, refundNotified: false };
        }

        await prismaService.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.Processing },
        });

        const correlationId = `viporder-${order.id}`;
        const payload: VipRegisterCreatedPayload = {
            orderId: order.id,
            userId: order.user_id,
            amount: order.total,
            durationMonths: 1,
        };

        const envelope = createEnvelope({
            type: VipMessageType.VIP_REGISTER_CREATED,
            payload,
            correlationId,
        });

        try {
            await rabbitMQService.sendMessageTopic(
                envelope,
                'app_events',
                VipMessageType.VIP_REGISTER_CREATED,
                'topic',
                true
            );
        } catch (err) {
            Logger.error(`PayOS VIP webhook: publish VIP_REGISTER_CREATED failed for ${orderId}: ${err}`);
            await this.markOrderCancel(orderId);
            return { alreadyCompleted: false, refundNotified: true };
        }

        await orderFulfillmentService.markSagaTriggered(orderId, { source: 'webhook', correlationId });
        Logger.info(`PayOS VIP webhook: VIP_REGISTER_CREATED published for ${orderId}`);
        return { alreadyCompleted: false, refundNotified: false };
    }

    /** 
     * Core shared verify flow for MoMo, VNPay and PayOS
     */
    private async handleVerify(query: any, provider: PaymentProviderEnum) {
        let orderId = '';
        let fulfillmentTriggered = false;

        try {
            const { orderId: id } = await this.validatePaymentCallback(query, provider);
            orderId = id;

            const sagaResultPromise = redisService.waitForMessage<SagaResult>(
                `saga:result:${orderId}`,
                RETURN_URL_SAGA_TIMEOUT_MS
            );

            const triggerResult = await orderFulfillmentService.triggerOrderFulfillment(orderId, 'return_url');

            if (!triggerResult.triggered) {
                const message =
                    triggerResult.reason === 'cancelled'
                        ? 'Đơn hàng đã bị hủy'
                        : 'Không thể đẩy event thanh toán';
                await this.markOrderCancel(orderId);
                return this.buildResponse(false, orderId, null, message, '98');
            }

            fulfillmentTriggered = true;

            Logger.info(
                `Waiting for saga result on channel saga:result:${orderId} (timeout: ${RETURN_URL_SAGA_TIMEOUT_MS}ms)`
            );

            try {
                const sagaResult = await sagaResultPromise;

                if (!sagaResult.success) {
                    Logger.error(`Saga failed for order ${orderId}: ${sagaResult.reason}`);
                    return this.buildResponse(
                        false,
                        orderId,
                        null,
                        sagaResult.reason || 'Xử lý giao dịch thất bại',
                        '99'
                    );
                }

                Logger.info(`Saga completed successfully for order ${orderId}`);
                return this.buildResponse(
                    true,
                    orderId,
                    null,
                    `Thanh toán đơn hàng ${orderId} thành công`,
                    '00'
                );
            } catch (sagaWaitErr) {
                Logger.warn(`Saga pending for order ${orderId} (${provider}): ${sagaWaitErr}`);
                return this.buildResponse(
                    true,
                    orderId,
                    null,
                    `Thanh toán đơn hàng ${orderId} thành công`,
                    '00'
                );
            }
        } catch (err: any) {
            Logger.error(`Error verifying order (${provider}): ${err}`);

            if (orderId && !fulfillmentTriggered) {
                await this.markOrderCancel(orderId);
            }

            if (err instanceof ApiError) {
                const rspCode = err.status === StatusCodes.OK ? '00' : String(err.status);
                return this.buildResponse(false, orderId, query, err.message, rspCode);
            }

            return this.buildResponse(false, '', null, 'Lỗi hệ thống', '99');
        }
    }

    /** 
     * Core shared verify flow for VIP subscriptions
     */
    private async handleVerifyVip(query: any, provider: PaymentProviderEnum) {
        let orderId = '';
        try {
            // Step 1. Validate callback and fetch order
            const { order, orderId: id } = await this.validatePaymentCallback(query, provider);
            orderId = id;

            if (await orderFulfillmentService.isSagaTriggered(orderId)) {
                Logger.info(`VIP verify (${provider}): saga already triggered for ${orderId}, treating as success`);
                return this.buildResponse(true, orderId, order, `Thanh toán VIP ${orderId} thành công`, '00');
            }

            const lockKey = `payment:lock:${orderId}`;
            const locked = await redisService.setLock(lockKey, { provider }, 120);
            if (!locked) {
                throw new ApiError(StatusCodes.CONFLICT, 'Đơn hàng đang được xử lý');
            }

            // Step 2. Subscribe BEFORE publishing to avoid race condition
            const sagaResultPromise = redisService.waitForMessage<SagaResult>(
                `saga:result:${orderId}`,
                SAGA_TIMEOUT_MS
            );

            // Step 3. Publish VIP_REGISTER_CREATED event
            const durationMonths = 1;
            const payload: VipRegisterCreatedPayload = {
                orderId: order.id,
                userId: order.user_id,
                amount: order.total,
                durationMonths,
            };

            const envelope = createEnvelope({
                type: VipMessageType.VIP_REGISTER_CREATED,
                payload,
                correlationId: `viporder-${order.id}`,
            });

            try {
                await rabbitMQService.sendMessageTopic(envelope, 'app_events', VipMessageType.VIP_REGISTER_CREATED, 'topic', true);
            } catch (err) {
                Logger.error(`Publish VIP_REGISTER_CREATED failed (${provider}): ${err}`);
                await this.markOrderCancel(orderId);
                return this.buildResponse(false, orderId, null, 'Không thể đẩy event cập nhật VIP', '98');
            }

            // Step 4. Wait for saga result from user-service via Redis Pub/Sub
            Logger.info(`Waiting for VIP saga result on channel saga:result:${orderId} (timeout: ${SAGA_TIMEOUT_MS}ms)`)
            const sagaResult = await sagaResultPromise;

            if (!sagaResult.success) {
                Logger.error(`VIP saga failed for order ${orderId}: ${sagaResult.reason}`);
                return this.buildResponse(false, orderId, null, sagaResult.reason || 'Cập nhật VIP thất bại', '99');
            }

            Logger.info(`VIP saga completed successfully for order ${orderId}`);
            return this.buildResponse(true, orderId, order, `Thanh toán VIP ${orderId} thành công`, '00');

        } catch (err: any) {
            Logger.error(`Error verifying VIP order (${provider}): ${err}`);

            if (err instanceof ApiError && err.status === StatusCodes.OK) {
                let resolvedOrderId = orderId;
                if (!resolvedOrderId && provider === PaymentProviderEnum.PAYOS) {
                    try {
                        const payosResult = await payosService.verifyReturnQuery(query);
                        resolvedOrderId = payosResult.orderId;
                    } catch {
                        // ignore
                    }
                }
                if (resolvedOrderId) {
                    return this.buildResponse(true, resolvedOrderId, null, err.message, '00');
                }
            }

            if (orderId) await this.markOrderCancel(orderId);

            if (err instanceof ApiError) {
                const rspCode = err.status === StatusCodes.OK ? '00' : String(err.status);
                return this.buildResponse(false, orderId, query, err.message, rspCode);
            }

            return this.buildResponse(false, '', null, 'Lỗi hệ thống', '99');
        }
    }

    /** ========== VALIDATORS ========== */
    private async validatePaymentCallback(
        query: any,
        provider: PaymentProviderEnum
    ) {
        if (provider === PaymentProviderEnum.MOMO) return this.validateMomoCallback(query);
        if (provider === PaymentProviderEnum.VNPAY) return this.validateVnpayCallback(query);
        return this.validatePayosCallback(query);
    }

    private async validatePayosCallback(query: PayosReturnQuery) {
        const result = await payosService.verifyReturnQuery(query);
        const order = await this.getOrder(result.orderId);
        if (order.total !== result.amount) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không hợp lệ');
        }
        return { orderId: result.orderId, amount: result.amount, order };
    }

    private async validateMomoCallback(query: any) {
        const result = await momoService.verifyCallback(query);
        if (!result.signatureValid) throw new ApiError(StatusCodes.BAD_REQUEST, 'Chữ ký không hợp lệ');
        if (!result.isSuccess) throw new ApiError(StatusCodes.PAYMENT_REQUIRED, result.message || 'Thanh toán thất bại');

        const order = await this.getOrder(result.orderId);
        if (order.total !== (result.amount || 0)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không hợp lệ');

        return { orderId: result.orderId, amount: result.amount, order };
    }

    private async validateVnpayCallback(query: any) {
        const { orderId, amount, status, isValid } = vnpayService.getCallbackInfo(query);
        if (!isValid) throw new ApiError(StatusCodes.BAD_REQUEST, 'Chữ ký không hợp lệ');
        if (status !== '00') throw new ApiError(StatusCodes.PAYMENT_REQUIRED, 'Thanh toán thất bại');

        const order = await this.getOrder(orderId);
        if (order.total !== amount) throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không hợp lệ');

        return { orderId, amount, order };
    }

    /** ========== HELPERS ========== */
    private async getOrder(orderId: string) {
        const order = await prismaService.order.findUnique({
            where: { id: orderId },
            select: { items: true, id: true, user_id: true, total: true, status: true },
        });
        if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại');
        if (order.status === OrderStatus.Completed)
            throw new ApiError(StatusCodes.OK, 'Đơn hàng đã được xử lý trước đó');
        return order;
    }

    private async markOrderCancel(orderId: string) {
        try {
            await prismaService.order.update({ where: { id: orderId }, data: { status: OrderStatus.Cancel } });
        } catch { /* ignore */ }
    }

    private buildResponse(isSuccess: boolean, orderId: string, rawData: any, message: string, rspCode?: string) {
        return { isSuccess, orderId, rawData, message, rspCode };
    }
}

export default new OrderPaymentService();
