import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockCertificates, Certificate } from "@/types/mockData";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (selectedCert) {
      console.log("selectedCert updated:", selectedCert);
    }
  }, [selectedCert]);

  const handleAction = (cert: Certificate, type: "approve" | "reject") => {
    setSelectedCert(cert);
    setActionType(type);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!selectedCert) return;

    const newStatus = actionType === "approve" ? "approved" : "rejected";
    setCertificates(
      certificates.map((c) =>
        c.id === selectedCert.id ? { ...c, status: newStatus } : c
      )
    );

    toast.success(
      actionType === "approve"
        ? "Đã xác nhận chứng chỉ"
        : "Đã từ chối chứng chỉ"
    );
    setShowDialog(false);
    setRejectReason("");
  };

  const getStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Đã xác nhận
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Từ chối
          </Badge>
        );
    }
  };


  return (
  <div className="space-y-8 p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Xác nhận chứng chỉ
        </h2>
        <p className="text-muted-foreground mt-2">
          Danh sách chứng chỉ cần xác nhận từ người dùng
        </p>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead className="text-left text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Tên người dùng
              </TableHead>
              <TableHead className="text-left text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Khóa học
              </TableHead>
              <TableHead className="text-left text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Ngày gửi
              </TableHead>
              <TableHead className="text-left text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Trạng thái
              </TableHead>
              <TableHead className="text-left text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Đường dẫn
              </TableHead>
              <TableHead className="text-right text-gray-700 uppercase text-xs font-semibold tracking-wider py-3 px-4">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {certificates.map((cert) => (
              <TableRow
                key={cert.id}
                className="hover:bg-blue-50/20 transition-colors border-b border-gray-100 last:border-0"
              >
                <TableCell className="py-4 px-4 font-medium text-gray-900">{cert.userName}</TableCell>
                <TableCell className="py-4 px-4 text-gray-700">{cert.courseName}</TableCell>
                <TableCell className="py-4 px-4 text-gray-500">
                  {new Date(cert.submittedAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="py-4 px-4">{getStatusBadge(cert.status)}</TableCell>
                <TableCell className="py-4 px-4 text-left">
                  {cert.certificateUrl ? (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Xem chứng chỉ
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Không có</span>
                  )}
                </TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {cert.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
                          onClick={() => handleAction(cert, "approve")}
                        >
                          <Check className="h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1 rounded-lg shadow-sm transition-all"
                          onClick={() => handleAction(cert, "reject")}
                        >
                          <X className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg rounded-xl p-6 bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {actionType === "approve" ? "Xác nhận chứng chỉ?" : "Từ chối chứng chỉ?"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-sm space-y-3">
              {selectedCert && (
                <div className="space-y-2">
                  <p>
                    <strong>Tên người dùng:</strong> {selectedCert.userName}
                  </p>
                  <p>
                    <strong>Khóa học:</strong> {selectedCert.courseName}
                  </p>
                  <p>
                    <strong>Ngày gửi:</strong>{" "}
                    {new Date(selectedCert.submittedAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {getStatusBadge(selectedCert.status)}
                  </p>
                  {selectedCert.organization && (
                    <p>
                      <strong>Nơi cấp:</strong> {selectedCert.organization}
                    </p>
                  )}

                  {/* Hình ảnh chứng chỉ */}
                  {selectedCert.imageUrl ? (
                    <img
                      src={selectedCert.imageUrl}
                      alt="Chứng chỉ"
                      className="w-full rounded-lg border border-gray-200 shadow-sm mt-2"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Không có ảnh</p>
                  )}

                  {/* Link chứng chỉ */}
                  {selectedCert.certificateUrl && (
                    <a
                      href={selectedCert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline mt-2 text-sm"
                    >
                      Mở liên kết chứng chỉ
                    </a>
                  )}

                  {/* Nếu từ chối thì textarea */}
                  {actionType === "reject" && (
                    <Textarea
                      placeholder="Nhập lý do..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 mt-2"
                    />
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmAction}
              disabled={actionType === "reject" && !rejectReason.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
