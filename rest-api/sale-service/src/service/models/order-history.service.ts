import prismaService from '~/service/utils/prisma.service';
import { OrderStatus } from '@prisma/client';
import courseClient from '~/grpc/courseClient.grpc';

class OrderHistoryService {
    async getOrderHistoryByUserId(userId: string): Promise<{
        id: string;
        total: number;
        created_at: Date;
        items: {
            course_id: string;
            // price: number;
            // title: string;
            // instructor_name: string;
            // instructor_id: string;
            course_name: string;
            image: string;
        }[];
    }[]> {
        const orderHistory = await prismaService.order.findMany({
            where: { 
                user_id: userId,
                status: OrderStatus.Completed
            },
            select: {
                id: true,
                total: true,
                created_at: true,
                items: {
                    select: {
                        course_id: true,
                        price: true
                    }
                }
            }
        })

        // get infomation of course
        const courseIds = Array.from(new Set(orderHistory.flatMap(order => order.items.map(item => item.course_id))))
        // call course service to get course details
        const courses = await courseClient.getBulkCourses(courseIds)
        const courseMap = new Map<string, any>(courses.map(course => [course.id, course]))
        // enrich order items with course details
        return orderHistory.map(order => {
            const enrichedItems = order.items.map(item => {
                const course = courseMap.get(item.course_id) || {}
                return {
                    course_id: item.course_id,
                    // price: item.price, // price save of order in sale service
                    // title: course.title || '',
                    // instructor_name: course.instructor?.name || '',
                    // instructor_id: course.instructor?.id || '',
                    course_name: course.title || '',
                    image: course.thumbnail_url || ''
                }
            })
            return {
                id: order.id,
                total: order.total,
                created_at: order.created_at,
                items: enrichedItems
            }
        })
    }
}

export default new OrderHistoryService();