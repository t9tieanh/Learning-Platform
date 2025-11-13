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
import { mockInstructors, Instructor } from "@/types/mockData";
import { Lock, Unlock, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>(mockInstructors);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const handleToggleStatus = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
  };

  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.status === "active").length,
    locked: instructors.filter(i => i.status === "locked").length,
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý giảng viên
        </h2>
        <p className="text-muted-foreground mt-2">
          Danh sách người đăng khóa học trên hệ thống
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng giảng viên</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-none shadow-md bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserX className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã khóa</p>
              <p className="text-2xl font-bold">{stats.locked}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Tên</TableHead>
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Email</TableHead>
              <TableHead className="text-gray-700 font-semibold py-4 px-4">Số khóa học</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {instructors.map((instructor) => (
              <TableRow
                key={instructor.id}
                className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0"
              >
                <TableCell className="py-4 px-4 font-medium text-gray-900">
                  {instructor.name}
                </TableCell>
                <TableCell className="py-4 px-4 text-gray-700">
                  {instructor.email}
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                  >
                    {instructor.courseCount} khóa
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
