import { Request, Response } from 'express';
import orderService from '~/service/models/order.service';

class TestController {
    public async testMethod(req: Request, res: Response): Promise<Response> {
        // Your test logic here
        const { orderId } = req.params;
        console.log(`Testing order with ID: ${orderId}`);
        const order = await orderService.testConfirmOrder(orderId);
        return res.status(200).json({ message: 'Test method executed successfully' });
    }
}

export default new TestController();