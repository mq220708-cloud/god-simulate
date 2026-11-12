# Thần Giới — Pixel Art Asset Pack v1

## Nguyên tắc
- Tài sản được vẽ thủ công dưới dạng pixel bằng SVG rect; không dùng icon font, thư viện icon, emoji hoặc ảnh stock.
- Nền trong suốt; hình học theo lưới pixel, `shape-rendering="crispEdges"`.
- Mỗi đối tượng là một nhóm SVG có ID riêng để có thể trích xuất hoặc chuyển sang sprite sheet PNG sau này.
- Không thay đổi logic mô phỏng trong giai đoạn tạo bộ tài sản.

## Atlas đang sử dụng
File: `atlas-v2.svg`
- 16×16 pixel cho mỗi sprite, không phóng chi tiết bằng các ô pixel phụ.
- 36 sprite: 13 sprite môi trường/công trình cơ bản và 13 sprite công trình mở rộng (cối xay gió, xưởng gỗ, mỏ đá, kho lương, đền thờ, chợ, doanh trại, tường thành, thư viện, lò rèn, hải cảng, y quán, công xưởng, bộ binh, cung thủ, kỵ binh, pháo, xe tăng, máy bay, tàu chiến, thuyền buồm, đoàn di cư và tên lửa).
- Mỗi màu dùng một path SVG gộp để giảm kích thước tệp.
- Atlas v2 được nén từ khoảng 78 KB xuống khoảng 19 KB (giảm 76%) so với bản SVG rect ban đầu.
- `atlas-v1.svg` là bản thử nghiệm cũ, không còn được renderer tải.

## Bảng màu
- Lá xanh đậm / sáng: `#397b32`, `#63a94b`
- Gỗ: `#81512e`, `#9b6a43`, `#c28a58`
- Đá: `#777f87`, `#aeb8bd`
- Mái và điểm nhấn: đỏ, vàng, tím.

## Tình trạng tích hợp
- Renderer tải atlas v2 bằng `Image` và crop từng sprite 16×16 theo tọa độ nguồn.
- Cây sồi, thông, bạch dương và cây lá vàng được dùng cho các ô rừng.
- Bụi hoa và bụi cây nhỏ xuất hiện thưa trên đồng cỏ phù hợp; đá pixel nhỏ xuất hiện ngẫu nhiên ổn định trên đồi.
- Nhà gỗ, nhà mái ngói, tháp canh và lâu đài được dùng theo cấp thành phố.
- Toàn bộ 15 loại công trình xây dựng hiện có được ánh xạ sang sprite Pixel Art riêng khi hiển thị trên bản đồ; công trình đang xây có hiệu ứng giàn giáo tự vẽ và thanh độ bền.
- 10 sprite quân sự/di chuyển mới được vẽ thủ công trong atlas: infantry, archer, cavalry, cannon, tank, plane, ship, sailboat, migration và missile.
- Renderer hành quân, cơ giới, vận tải biển và giao thương biển dùng sprite riêng; không còn emoji làm hình đơn vị ở các luồng này.
- Thanh công cụ tạo canvas preview theo từng mã công cụ, lấy sprite từ atlas hoặc tự vẽ ô địa hình/phép thuật bằng pixel primitives; nhãn nút đã bỏ emoji mở đầu.
- Khi atlas tải xong, renderer dựng lại chi tiết cho đồng cỏ, rừng và đồi để tránh thiếu sprite do tải bất đồng bộ.
- Có fallback pixel primitives nếu atlas chưa tải xong.

## Việc tiếp theo
1. Tách và kiểm tra sprite độc lập trên nhiều kích thước màn hình điện thoại.
2. Bổ sung biến thể theo mùa, cấp độ nhà ở và quốc gia.
3. Xây dựng bộ tile địa hình, trang trại, tường thành, cầu và hoạt ảnh nước.
4. Thay dần các glyph/emoji còn lại trong công cụ bản đồ bằng artwork tự vẽ.
