import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    {/* Title Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">
                            Điều Khoản Sử Dụng
                        </h1>
                    </div>

                    <Separator />

                    {/* Terms Content */}
                    <ScrollArea className="h-auto">
                        <div className="space-y-8 text-foreground">
                            {/* Section 1 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    1. Chấp Nhận Điều Khoản
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Bằng việc truy cập và sử dụng nền tảng khóa học trực tuyến của chúng tôi,
                                    bạn đồng ý tuân theo các điều khoản và điều kiện được quy định dưới đây.
                                    Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này,
                                    vui lòng không sử dụng dịch vụ của chúng tôi.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    2. Đăng Ký Tài Khoản
                                </h2>
                                <div className="space-y-3 text-muted-foreground leading-relaxed">
                                    <p>
                                        Để sử dụng các tính năng của nền tảng, bạn cần tạo tài khoản.
                                        Bạn cam kết:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                                        <li>Bảo mật thông tin tài khoản và mật khẩu của bạn</li>
                                        <li>Chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                                        <li>Thông báo ngay cho chúng tôi nếu phát hiện bất kỳ việc sử dụng trái phép nào</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    3. Quyền Sử Dụng Khóa Học
                                </h2>
                                <div className="space-y-3 text-muted-foreground leading-relaxed">
                                    <p>
                                        Khi mua khóa học, bạn được cấp quyền truy cập không độc quyền,
                                        không thể chuyển nhượng để:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Xem và học nội dung khóa học cho mục đích cá nhân</li>
                                        <li>Tải xuống tài liệu được phép (nếu có)</li>
                                        <li>Tham gia các hoạt động tương tác trong khóa học</li>
                                    </ul>
                                    <p className="mt-3">
                                        Bạn <strong className="text-foreground">không được phép</strong>:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Sao chép, phân phối hoặc công bố nội dung khóa học</li>
                                        <li>Chia sẻ tài khoản với người khác</li>
                                        <li>Tải lên hoặc phân phối lại nội dung trên nền tảng khác</li>
                                        <li>Sử dụng nội dung cho mục đích thương mại</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    4. Thanh Toán
                                </h2>
                                <div className="space-y-3 text-muted-foreground leading-relaxed">
                                    <h3 className="text-lg font-medium text-foreground">4.1 Thanh Toán</h3>
                                    <p>
                                        Tất cả thanh toán phải được thực hiện qua các phương thức thanh toán
                                        được chấp nhận trên nền tảng.
                                    </p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    5. Sở Hữu Trí Tuệ
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Tất cả nội dung trên nền tảng, bao gồm nhưng không giới hạn ở văn bản,
                                    hình ảnh, video, âm thanh, và phần mềm, đều là tài sản của chúng tôi hoặc
                                    các nhà cung cấp nội dung và được bảo vệ bởi luật sở hữu trí tuệ.
                                    Bạn không được sử dụng, sao chép, hoặc phân phối nội dung mà không có sự cho phép bằng văn bản.
                                </p>
                            </section>

                            {/* Section 6 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    6. Hành Vi Người Dùng
                                </h2>
                                <div className="space-y-3 text-muted-foreground leading-relaxed">
                                    <p>Bạn cam kết không:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Sử dụng nền tảng cho mục đích bất hợp pháp</li>
                                        <li>Làm phiền, lạm dụng, hoặc gây hại cho người dùng khác</li>
                                        <li>Đăng tải nội dung không phù hợp, xúc phạm hoặc vi phạm pháp luật</li>
                                        <li>Can thiệp vào hoạt động bình thường của nền tảng</li>
                                        <li>Cố gắng truy cập trái phép vào hệ thống</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    7. Giới Hạn Trách Nhiệm
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Nền tảng được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào.
                                    Chúng tôi không chịu trách nhiệm về:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                                    <li>Sự gián đoạn hoặc lỗi trong dịch vụ</li>
                                    <li>Mất mát hoặc hư hỏng dữ liệu</li>
                                    <li>Kết quả học tập của người dùng</li>
                                    <li>Hành vi của người dùng khác trên nền tảng</li>
                                </ul>
                            </section>

                            {/* Section 8 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    8. Chấm Dứt Tài Khoản
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm
                                    các điều khoản này hoặc có hành vi không phù hợp. Bạn cũng có thể đóng tài khoản
                                    của mình bất cứ lúc nào thông qua cài đặt tài khoản.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    9. Thay Đổi Điều Khoản
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào.
                                    Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên nền tảng.
                                    Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                                </p>
                            </section>

                            {/* Section 10 */}
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-primary">
                                    10. Liên Hệ
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
                                </p>
                                <div className="bg-primary p-4 rounded-lg space-y-2 text-muted-foreground">
                                    <p className="text-white"><strong className="text-slate-300">Email:</strong> learnova@nova.com</p>
                                    <p className="text-white"><strong className="text-slate-300">Điện thoại:</strong> (+84) 123 456 789</p>
                                    <p className="text-white"><strong className="text-slate-300">Địa chỉ:</strong> 123 Đường Man Thiện, Quận 7, TP. HCM</p>
                                </div>
                            </section>
                        </div>
                    </ScrollArea>

                    <Separator />

                    {/* Footer CTA */}
                    <div className="text-center space-y-4 pt-4">
                        <p className="text-muted-foreground">
                            Cảm ơn bạn đã tin tưởng và sử dụng nền tảng của chúng tôi!
                        </p>
                        <Link to="/">
                            <Button size="lg" className="gap-2 mt-2">
                                <ArrowLeft className="h-4 w-4" />
                                Quay về trang chủ
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Terms;
