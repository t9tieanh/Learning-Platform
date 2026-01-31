import axiosClient from '@/lib/axiosClient.lib'

class EventTrackerService {
    async trackingEvent(eventName: string, courseId?: string) {
        const payload: { eventName: string; courseId?: string } = { eventName }
        if (courseId) payload.courseId = courseId

        const response = await axiosClient.axiosInstance.post('user/track-event', payload)
        return response.data
    }
}

export default new EventTrackerService();