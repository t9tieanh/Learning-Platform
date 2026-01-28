export const mockAiSuggestions = {
    title: "Hướng dẫn lập trình ReactJS cơ bản cho người mới bắt đầu - Phần 1",
    content: "Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của ReactJS bao gồm Components, Props và State. Bạn sẽ học cách xây dựng một ứng dụng Todo List đơn giản để áp dụng ngay các kiến thức vừa học. Video cũng bao gồm các best practices khi viết code React."
}

export const fetchMockAiSuggestions = (): Promise<typeof mockAiSuggestions> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockAiSuggestions)
        }, 2000)
    })
}
