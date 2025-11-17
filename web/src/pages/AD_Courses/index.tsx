import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCourses, Course } from "@/types/mockData";
import { Eye, BookOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const [courses] = useState<Course[]>(mockCourses);
  const navigate = useNavigate();

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium"
          >
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 font-medium"
          >
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 font-medium"
          >
            Từ chối
          </Badge>
        );
    }
  };

  const stats = {
    total: courses.length,
    pending: courses.filter(c => c.status === "pending").length,
    approved: courses.filter(c => c.status === "approved").length,
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý khóa học
        </h2>
        <p className="text-muted-foreground mt-2">
          Danh sách tất cả khóa học trên hệ thống
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng khóa học</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Tên khóa học</TableHead>
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Người đăng</TableHead>
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Ngày tạo</TableHead>
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Trạng thái</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold py-4 px-4">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                className="group hover:bg-blue-50/40 transition-colors border-b border-gray-100 last:border-0"
              >
                <TableCell className="py-4 px-4 font-medium text-gray-900">
                  {course.title}
                </TableCell>
                <TableCell className="py-4 px-4 text-gray-700">{course.instructor}</TableCell>
                <TableCell className="py-4 px-4 text-gray-600">
                  {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="py-4 px-4">{getStatusBadge(course.status)}</TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/course/${course.id}`)}
                    className="border-gray-200 text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
