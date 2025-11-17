import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, FileText, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import userService from "@/services/user/user.service";
import { DataAdminHome } from "@/types/user";
import { toast } from "sonner";

export default function Dashboard() {
  const [data, setData] = useState<DataAdminHome | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userService.getAdminHome();
        if (!active) return;
        setData(res.result ?? null);
      } catch (e: any) {
        if (!active) return;
        const msg = e?.response?.data?.message || e?.message || "Không thể tải dữ liệu admin";
        setError(msg);
        toast.error(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false };
  }, []);

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
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between ">
              <CardDescription className="text-sm font-medium">Tổng khóa học</CardDescription>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{data?.courseCnt ?? (loading ? '…' : 0)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Giảng viên</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{data?.instructorCnt ?? (loading ? '…' : 0)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Chứng chỉ chờ duyệt</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Clock className="h-5 w-5 text-warning text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{data?.certificateCnt ?? (loading ? '…' : 0)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 gradient-card group hover:-translate-y-1 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">Bài blog</CardDescription>
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mt-2">{data?.blogCnt ?? (loading ? '…' : 0)}</CardTitle>
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
            {/* Backend chưa trả danh sách chi tiết ở API này; có thể thay bằng fetch riêng nếu cần */}
            {data?.courseCnt ?? 0} khóa học đang chờ được xem xét
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Placeholder section: remove or replace with real list when available */}
          {true ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Không có khóa học nào chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Example mapping; replace when you have actual list */}
              {[].map((course: any) => (
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
