import prismaService from '~/service/utils/prisma.service';
import ApiError from '~/middleware/ApiError';
import { OrderStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import vnpayService from '~/service/utils/vnpay.service';
import momoService from '../utils/momo.service';
import rabbitMQService from '~/service/utils/rabbitmq.service';
import { createEnvelope } from '~/sagas/events/envelope';
import { OrderCreatedPayload } from '~/sagas/order/dtos';
import { MessageType } from '~/sagas/order/events';

class OrderPaymentService {
    async verifyOrderForMomo(query: any) {
        return this.handleVerify(query, 'momo');
    }

    async verifyOrderForVnPay(query: any) {
        return this.handleVerify(query, 'vnpay');
    }

    /** 
     * Core shared verify flow for both MoMo and VNPay
     */
    private async handleVerify(query: any, provider: 'momo' | 'vnpay') {
        let orderId = '';
        try {
            // Step 1. Validate callback and fetch order
            const { order, orderId: id, amount } =
                provider === 'momo'
                    ? await this.validateMomoCallback(query)
                    : await this.validateVnpayCallback(query);
            orderId = id;

            // Step 2. Mark order as completed
            const updated = await prismaService.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.Completed },
                include: { items: true },
            });

            // Step 3. Publish OrderCreated event
            const payload: OrderCreatedPayload = {
                orderId: updated.id,
                userId: updated.user_id,
                amount: updated.total,
                items: updated.items.map((i: any) => ({
                    course_id: i.course_id,
                    price: i.price,
                })),
            };

            const envelope = createEnvelope({
                type: MessageType.ORDER_CREATED,
                payload,
                correlationId: `order-${updated.id}`,
            });

            try {
                await rabbitMQService.sendMessageTopic(envelope, 'app_events', MessageType.ORDER_CREATED, 'topic', true);
            } catch (err) {
                console.error(`Publish OrderCreated failed (${provider}):`, err);
                await this.markOrderCancel(orderId);
                return this.buildResponse(false, orderId, null, 'Không thể đẩy event thanh toán', '98');
            }

            // Success
            return this.buildResponse(true, orderId, updated, `Thanh toán đơn hàng ${orderId} thành công`, '00');
        } catch (err: any) {
            console.error(`Error verifying order (${provider}):`, err);
            if (orderId) await this.markOrderCancel(orderId);

            if (err instanceof ApiError) {
                const rspCode = err.status === StatusCodes.OK ? '00' : String(err.status);
                return this.buildResponse(false, orderId, query, err.message, rspCode);
            }

            return this.buildResponse(false, '', null, 'Lỗi hệ thống', '99');
        }
    }

    /** ========== VALIDATORS ========== */
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
