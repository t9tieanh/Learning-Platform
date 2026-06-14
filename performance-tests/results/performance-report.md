# Báo Cáo Kiểm Thử Hiệu Năng

Ngày tổng hợp: `2026-06-13`

## 1. Mục tiêu

Kiểm thử hiệu năng được thực hiện bằng `k6` trên các API và flow quan trọng của hệ thống học trực tuyến, bao gồm:

- `smoke test`
- `load test`
- `stress test`
- `spike test`
- `api flow test`
- `admin dashboard test`
- `instructor dashboard test`

Mục tiêu của đợt kiểm thử này là đánh giá khả năng đáp ứng của hệ thống theo từng mục tiêu tải khác nhau, đồng thời theo dõi các chỉ số chính như thời gian phản hồi, tỷ lệ lỗi và tỷ lệ check thành công.

## 2. Phạm vi và nguồn dữ liệu

Báo cáo này được tổng hợp trực tiếp từ các file JSON trong thư mục [performance-tests/results](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results):

- [smoke-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/smoke-summary.json)
- [load-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/load-summary.json)
- [stress-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/stress-summary.json)
- [spike-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/spike-summary.json)
- [api-flow-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/api-flow-summary.json)
- [admin-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/admin-summary.json)
- [instructor-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/instructor-summary.json)

Lưu ý:

- Hai file [admin-dashboard-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/admin-dashboard-summary.json) và [instructor-dashboard-summary.json](/home/ducsang4869/HCMUTE/Learning-Platform/performance-tests/results/instructor-dashboard-summary.json) không được đưa vào bảng tổng hợp vì metrics đang rỗng hoặc không đồng nhất với các file summary chính.
- Hiện tại chưa thấy kết quả `soak` và `browser` trong thư mục `results`, vì vậy hai kịch bản này chưa được đưa vào phần đánh giá tổng hợp.

## 3. Tiêu chí đánh giá

Báo cáo sử dụng các chỉ số sau:

- `VU tối đa`: số lượng virtual users tối đa trong kịch bản
- `Số request`: tổng số HTTP requests đã gửi
- `Số iteration`: tổng số vòng lặp đã thực thi
- `Avg`: thời gian phản hồi trung bình của request
- `P95`: 95% request có thời gian phản hồi nhỏ hơn hoặc bằng giá trị này
- `Max`: thời gian phản hồi lớn nhất
- `Tỷ lệ lỗi`: giá trị `http_req_failed`
- `Tỷ lệ check thành công`: giá trị `checks`

## 4. Bảng tổng hợp kết quả

| Kịch bản | VU tối đa | Số request | Số iteration | Avg (ms) | P95 (ms) | Max (ms) | Tỷ lệ lỗi | Tỷ lệ check thành công |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Smoke | 1 | 11 | 2 | 4711.02 | 18831.40 | 30001.06 | 9.09% | 100.00% |
| Load | 50 | 1692 | 336 | 5767.11 | 15125.94 | 30001.44 | 2.42% | 97.64% |
| Stress | 300 | 13793 | 6889 | 8121.90 | 19465.49 | 30001.40 | 3.18% | 96.82% |
| Spike | 300 | 2529 | 1261 | 8900.39 | 24249.21 | 30001.38 | 3.72% | 96.28% |
| API Flow | 5 | 121 | 23 | 4452.27 | 10332.84 | 30000.20 | 0.83% | 98.98% |
| Admin Dashboard | 3 | 22 | 4 | 8897.48 | 30000.56 | 30001.22 | 18.18% | 88.24% |
| Instructor Dashboard | 3 | 56 | 8 | 3218.77 | 8514.18 | 20939.59 | 0.00% | 100.00% |

## 5. Nhận xét kết quả

### 5.1. Smoke test

- Kịch bản smoke có `1 VU`, chủ yếu dùng để xác nhận các endpoint cơ bản vẫn phản hồi.
- Mức `checks` đạt `100%`, tuy nhiên `tỷ lệ lỗi` vẫn ở mức `9.09%`, cho thấy vẫn tồn tại request lỗi trong kịch bản khởi động nhanh.
- `P95` đạt `18831.40 ms`, cao hơn rất nhiều so với mức threshold mong muốn cho smoke test. Điều này cho thấy hệ thống vẫn chưa ổn định ở một số request đầu vào.

### 5.2. Load test

- Kịch bản load đạt tối đa `50 VU`, tạo ra `1692` requests và `336` iterations.
- `Avg` đạt `5767.11 ms`, `P95` đạt `15125.94 ms`, cho thấy độ trễ phản hồi còn khá cao khi mô phỏng tải bình thường.
- `Tỷ lệ lỗi` là `2.42%`, vượt mức mong muốn `1%` nếu đối chiếu với threshold load test đã đặt trong script.
- Kết quả này cho thấy hệ thống hoạt động được ở tải vừa phải, nhưng chưa đạt mức ổn định tốt nếu xét theo response time và error rate.

### 5.3. Stress test

- Kịch bản stress được đẩy lên tới `300 VU`, ghi nhận `13793` requests.
- `Avg` đạt `8121.90 ms`, `P95` đạt `19465.49 ms`, cho thấy độ trễ tăng rõ khi tải hệ thống được đẩy cao.
- `Tỷ lệ lỗi` là `3.18%`, nằm trong mức có thể chấp nhận với stress test, nhưng cho thấy hệ thống bắt đầu suy giảm khi tăng tải.
- Dữ liệu này phù hợp với mục tiêu stress test: tìm giới hạn và quan sát dấu hiệu nghẽn hệ thống.

### 5.4. Spike test

- Kịch bản spike tăng đột ngột lên `300 VU` và tạo `2529` requests.
- `Avg` và `P95` lần lượt là `8900.39 ms` và `24249.21 ms`, là các giá trị cao nhất trong nhóm test truy cập công khai.
- `Tỷ lệ lỗi` đạt `3.72%`, cho thấy hệ thống có thể xử lý lượng tăng đột biến nhưng độ trễ và tỉ lệ lỗi tăng rõ.
- Kịch bản này phản ánh hệ thống chịu được đột biến traffic, nhưng cần tối ưu thêm nếu muốn duy trì trải nghiệm tốt khi có lượng truy cập bất thường.

### 5.5. API flow test

- Kịch bản này mô phỏng flow người dùng thực tế với `5 VU`.
- `Avg` đạt `4452.27 ms`, `P95` đạt `10332.84 ms`, tốt hơn các kịch bản load/stress/spike.
- `Tỷ lệ lỗi` là `0.83%`, `checks` đạt `98.98%`, cho thấy flow nghiệp vụ thực tế đang là kịch bản có kết quả khá nhất trong nhóm test tổng hợp.
- Đây là dấu hiệu tích cực cho các thao tác chính như xem danh sách khóa học, tìm kiếm, xem chi tiết và truy cập khu vực học tập.

### 5.6. Admin dashboard test

- Kịch bản admin dashboard có kết quả xấu nhất trong nhóm role-based.
- `Avg` đạt `8897.48 ms`, `P95` đạt `30000.56 ms`, gần chạm mốc timeout `30s`.
- `Tỷ lệ lỗi` là `18.18%`, `checks` chỉ đạt `88.24%`.
- Kết quả này cho thấy các API dashboard admin cần được ưu tiên tối ưu hoặc kiểm tra lại dữ liệu, query và tài nguyên phía server.

### 5.7. Instructor dashboard test

- Kịch bản instructor dashboard đạt kết quả tốt nhất trong nhóm có xác thực theo role.
- `Avg` đạt `3218.77 ms`, `P95` đạt `8514.18 ms`.
- `Tỷ lệ lỗi` bằng `0%`, `checks` đạt `100%`.
- Đây là kịch bản có độ ổn định tốt nhất trong các test hiện có.

## 6. Đánh giá tổng quan

Từ các kết quả hiện tại, có thể rút ra các nhận định sau:

- Hệ thống vẫn đáp ứng được các kịch bản truy cập thực tế và dashboard instructor ở mức chấp nhận được.
- Các kịch bản tải cao hơn như `load`, `stress`, `spike` cho thấy độ trễ tăng đáng kể, đặc biệt ở chỉ số `P95`.
- `Admin dashboard` là khu vực cần ưu tiên phân tích và tối ưu sớm nhất do có `error rate` cao và response time sát ngưỡng timeout.
- Chưa nên kết luận hệ thống phục vụ ổn định `800` hoặc `1000` người dùng đồng thời, vì kết quả hiện tại mới xác nhận rõ đến các mức test cụ thể trong từng kịch bản, cao nhất là `300 VU`.

## 7. Kiến nghị

- Tối ưu các endpoint có `P95` cao, đặc biệt trong `load`, `stress`, `spike` và `admin dashboard`.
- Phân tích log backend, truy vấn DB, Redis, RabbitMQ và các dịch vụ liên quan tại thời điểm request chậm hoặc fail.
- Chạy bổ sung `soak test` và `browser test`, sau đó cập nhật tiếp báo cáo tổng hợp.
- Nếu mục tiêu là nghiệm thu tải cao hơn, cần bổ sung kịch bản tại `500 VU`, `800 VU` hoặc hơn nữa trên môi trường staging/sandbox được kiểm soát.
