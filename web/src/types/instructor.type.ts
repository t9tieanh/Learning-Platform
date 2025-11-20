export interface InstructorStatistic {
    totalCourse: number
    totalStudent: number
    totalBlog: number
}

export interface InstructorMonthlyStat {
    month: number
    revenue: number
    profit: number
    studentCount: number
}

export interface InstructorChart {
    year: string
    monthlyData: InstructorMonthlyStat[]
}
