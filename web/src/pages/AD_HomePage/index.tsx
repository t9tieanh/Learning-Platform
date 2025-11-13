import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCourses, mockInstructors, mockCertificates, mockBlogs } from "@/types/mockData";
import { BookOpen, Users, Award, FileText, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = {
    totalCourses: mockCourses.length,
    totalInstructors: mockInstructors.length,
    pendingCertificates: mockCertificates.filter((c) => c.status === "pending").length,
    totalBlogs: mockBlogs.length,
  };

  const pendingCourses = mockCourses.filter((c) => c.status === "pending");

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Tổng quan
        </h2>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi hoạt động của nền tảng
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Tổng khóa học</CardDescription>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{stats.totalCourses}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Giảng viên</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{stats.totalInstructors}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Chứng chỉ chờ duyệt</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Clock className="h-5 w-5 text-warning text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{stats.pendingCertificates}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Bài blog</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{stats.totalBlogs}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Courses */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Khóa học chờ duyệt
          </CardTitle>
          <CardDescription>
            {pendingCourses.length} khóa học đang chờ được xem xét
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Không có khóa học nào chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-primary/30 bg-gradient-to-r from-background to-muted/20 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{course.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Người đăng: {course.instructor}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    Chờ duyệt
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
