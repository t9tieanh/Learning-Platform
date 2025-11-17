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
import { Certificate } from "@/types/mockData";
import certificateService from "@/services/certificate/certificate.service";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"confirmed" | "reject">("confirmed");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOption, setRejectOption] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const REJECT_PRESETS = [
    "Thông tin không khớp",
    "Hình ảnh mờ/không rõ",
    "Liên kết không hợp lệ",
    "Không đúng khóa học",
    "Khác",
  ];

  useEffect(() => {
    if (selectedCert) {
      console.log("selectedCert updated:", selectedCert);
    }
  }, [selectedCert]);

  useEffect(() => {
    let active = true;
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await certificateService.adminGetCertificates();
        console.log('RESPONSE', res)
        if (!active) return;
        const items = res.result ?? [];
        const mapped: Certificate[] = items.map((c: any) => ({
          id: c.id,
          userName: c.userName ?? '—',
          userEmail: c.userEmail ?? '-',
          courseName: c.title ?? '—',
          courseId: c.courseId ?? '',
          submittedAt: c.issueDate ?? new Date().toISOString(),
          status: (String(c.status).toLowerCase() as any) || 'pending',
          certificateUrl: c.credentialUrl,
          imageUrl: c.imageUrl,
          organization: c.organization,
          reason: c.reason ?? undefined,
        }));
        setCertificates(mapped);
      } catch (e: any) {
        if (!active) return;
        const msg = e?.response?.data?.message || e?.message || 'Lỗi tải danh sách chứng chỉ';
        setError(msg);
        toast.error(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCertificates();
    return () => { active = false };
  }, []);

  const handleAction = (cert: Certificate, type: "confirmed" | "reject") => {
    setSelectedCert(cert);
    setActionType(type);
    setRejectOption(null);
    setRejectReason("");
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedCert) return;
    const newStatus = actionType === "confirmed" ? "confirmed" : "rejected";

    // Determine reason to send
    const effectiveReason =
      newStatus === "rejected"
        ? (rejectOption === "Khác" ? rejectReason.trim() : (rejectOption || "")).trim()
        : "";

    try {
      setConfirmLoading(true);
      const res = await certificateService.updateCertificate(
        selectedCert.id,
        newStatus,
        effectiveReason
      );
      if (res.code && res.code !== 200) {
        throw new Error(res.message || "Cập nhật chứng chỉ thất bại");
      }

      // Update local state
      setCertificates(
        certificates.map((c) =>
          c.id === selectedCert.id
            ? { ...c, status: newStatus, reason: newStatus === "rejected" ? effectiveReason : undefined }
            : c
        )
      );

      toast.success(
        newStatus === "confirmed" ? "Đã xác nhận chứng chỉ" : "Đã từ chối chứng chỉ"
      );
      setShowDialog(false);
      setRejectReason("");
      setRejectOption(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể cập nhật chứng chỉ";
      toast.error(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusBadge = (status: Certificate["status"], reason?: string) => {
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
      case "confirmed":
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
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300 cursor-help"
                >
                  Từ chối
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reason?.trim() ? reason : "Không có lý do"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải danh sách chứng chỉ...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
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
                  <TableCell className="py-4 px-4 font-medium text-gray-900">{cert.userName} ({cert.userEmail})</TableCell>
                  <TableCell className="py-4 px-4 text-gray-700">{cert.courseName}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-500">
                    {new Date(cert.submittedAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="py-4 px-4">{getStatusBadge(cert.status, cert.reason)}</TableCell>
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
                            onClick={() => handleAction(cert, "confirmed")}
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
        )}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg rounded-xl p-6 bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {actionType === "confirmed" ? "Xác nhận chứng chỉ?" : "Từ chối chứng chỉ?"}
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
                  <p className="flex items-center gap-2">
                    <strong>Trạng thái:</strong> {getStatusBadge(selectedCert.status, selectedCert.reason)}
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
                    <div className="mt-2 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {REJECT_PRESETS.map((opt) => (
                          <Button
                            key={opt}
                            type="button"
                            variant={rejectOption === opt ? "default" : "outline"}
                            className={
                              rejectOption === opt
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : ""
                            }
                            onClick={() => setRejectOption(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                      {rejectOption === "Khác" && (
                        <Textarea
                          placeholder="Nhập lý do..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={4}
                          className="border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400"
                        />
                      )}
                    </div>
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
              disabled={
                confirmLoading ||
                (actionType === "reject" && (
                  !rejectOption || (rejectOption === "Khác" && !rejectReason.trim())
                ))
              }
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {confirmLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
