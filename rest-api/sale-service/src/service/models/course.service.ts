import prismaService from '../utils/prisma.service';

class CourseService {
    async hasPurchasedCourse(courseId: string, userId: string): Promise<boolean> {
        const count = await prismaService.order_Item.count({
            where: {
                course_id: courseId,
                order: {
                  user_id: userId,
                   status: 'COMPLETED'
                }
            }
        });
        return count > 0;
    }
}

export default new CourseService();