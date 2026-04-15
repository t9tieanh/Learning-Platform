import axiosClient from '@/lib/axiosClient.lib'

class EventTrackerService {
  async trackingEvent(eventName: string, payloadOrCourseId?: Record<string, string> | string) {
    const data: {
      eventName: string
      payload?: Record<string, string>
    } = {
      eventName
    }

    if (typeof payloadOrCourseId === 'string' && payloadOrCourseId) {
      data.payload = {
        courseId: payloadOrCourseId
      }
    }

    if (payloadOrCourseId && typeof payloadOrCourseId !== 'string') {
      data.payload = payloadOrCourseId
    }

    const response = await axiosClient.axiosInstance.post('user/track-event', data)
    return response.data
  }
}

export default new EventTrackerService()
