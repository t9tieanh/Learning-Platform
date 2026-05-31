import prismaService from '~/service/utils/prisma.service';
import ApiError from '~/middleware/ApiError';
import { OrderStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import vnpayService from '~/service/utils/vnpay.service';
import momoService from '../utils/momo.service';
import payosService, { PayosReturnQuery } from '../utils/payos.service';
import rabbitMQService from '~/service/utils/rabbitmq.service';
import redisService, { SagaResult } from '~/service/utils/redis.service';
import { createEnvelope } from '~/sagas/events/envelope';
import { OrderCreatedPayload } from '~/sagas/order_course/course.dtos';
import { VipRegisterCreatedPayload } from '~/sagas/buy_vip/vip.dtos';
import { CourseMessageType } from '~/sagas/order_course/course.events';
import { VipMessageType } from '~/sagas/buy_vip/vip.events';
import Logger from '~/utils/logger';

const SAGA_TIMEOUT_MS = 30_000

class OrderPaymentService {
    async verifyOrderForMomo(query: any) {
        return this.handleVerify(query, 'momo');
    }

    async verifyOrderForVnPay(query: any) {
        return this.handleVerify(query, 'vnpay');
    }

    async verifyVipOrderForMomo(query: any) {
        return this.handleVerifyVip(query, 'momo');
    }

    async verifyVipOrderForVnpay(query: any) {
        return this.handleVerifyVip(query, 'vnpay');
    }

    async verifyOrderForPayos(query: any) {
        return this.handleVerify(query, 'payos');
    }

    async verifyVipOrderForPayos(query: any) {
        return this.handleVerifyVip(query, 'payos');
    }

    /** 
     * Core shared verify flow for MoMo, VNPay and PayOS
     */
    private async handleVerify(query: any, provider: 'momo' | 'vnpay' | 'payos') {
        let orderId = '';
        try {
            // Step 1. Validate callback and fetch order
            const { order, orderId: id } = await this.validatePaymentCallback(query, provider);
            orderId = id;

            const lockKey = `payment:lock:${orderId}`;
            const locked = await redisService.setLock(lockKey, { provider }, 120);
            if (!locked) {
                throw new ApiError(StatusCodes.CONFLICT, 'Đơn hàng đang được xử lý');
            }

            // Step 2. Mark order as processing
            const updated = await prismaService.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.Processing },
                include: { items: true },
            });

            // Step 3. Subscribe BEFORE publishing to avoid race condition
            const sagaResultPromise = redisService.waitForMessage<SagaResult>(
                `saga:result:${orderId}`,
                SAGA_TIMEOUT_MS
            );

            // Step 4. Publish OrderCreated event
            const payload: OrderCreatedPayload = {
                orderId: updated.id,
                userId: updated.user_id,
                amount: updated.total,
                items: updated.items.map((i: any) => ({ course_id: i.course_id, price: i.price })),
            };

            const envelope = createEnvelope({
                type: CourseMessageType.ORDER_CREATED,
                payload,
                correlationId: `order-${updated.id}`,
            });

            Logger.info(`Publishing ORDER_CREATED: ${JSON.stringify(envelope)}`);

            try {
                await rabbitMQService.sendMessageTopic(envelope, 'app_events', CourseMessageType.ORDER_CREATED, 'topic', true);
            } catch (err) {
                Logger.error(`Publish OrderCreated failed (${provider}): ${err}`);
                await this.markOrderCancel(orderId);
                return this.buildResponse(false, orderId, null, 'Không thể đẩy event thanh toán', '98');
            }

            // Step 5. Wait for saga result via Redis Pub/Sub
            Logger.info(`Waiting for saga result on channel saga:result:${orderId} (timeout: ${SAGA_TIMEOUT_MS}ms)`)
            const sagaResult = await sagaResultPromise;

            if (!sagaResult.success) {
                Logger.error(`Saga failed for order ${orderId}: ${sagaResult.reason}`);
                return this.buildResponse(false, orderId, null, sagaResult.reason || 'Xử lý giao dịch thất bại', '99');
            }

            Logger.info(`Saga completed successfully for order ${orderId}`);
            return this.buildResponse(true, orderId, updated, `Thanh toán đơn hàng ${orderId} thành công`, '00');

        } catch (err: any) {
            Logger.error(`Error verifying order (${provider}): ${err}`);
            if (orderId) await this.markOrderCancel(orderId);

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
    private async handleVerifyVip(query: any, provider: 'momo' | 'vnpay' | 'payos') {
        let orderId = '';
        try {
            // Step 1. Validate callback and fetch order
            const { order, orderId: id } = await this.validatePaymentCallback(query, provider);
            orderId = id;

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
        provider: 'momo' | 'vnpay' | 'payos'
    ) {
        if (provider === 'momo') return this.validateMomoCallback(query);
        if (provider === 'vnpay') return this.validateVnpayCallback(query);
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
