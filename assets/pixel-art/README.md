# Thần Giới — Pixel Art Asset Pack v1

## Nguyên tắc
- Tài sản được vẽ thủ công dưới dạng pixel bằng SVG rect; không dùng icon font, thư viện icon, emoji hoặc ảnh stock.
- Nền trong suốt; hình học theo lưới pixel, `shape-rendering="crispEdges"`.
- Mỗi đối tượng là một nhóm SVG có ID riêng để có thể trích xuất hoặc chuyển sang sprite sheet PNG sau này.
- Không thay đổi logic mô phỏng trong giai đoạn tạo bộ tài sản.

## Atlas
File: `atlas-v1.svg`
- 16×16 pixel logic cho mỗi sprite, 2× scale trong atlas.
- Các nhóm: cây sồi, cây thông, cây bạch dương, cây lá vàng, cây cọ, bụi cây, bụi hoa, đá, nhà gỗ, nhà mái ngói, trang trại, tháp canh, lâu đài.
- Sprite IDs: oak, pine, birch, autumn, palm, bush, flower, rock, hut, cottage, farm, watchtower, castle.

## Bảng màu
- Lá xanh đậm / sáng: `#397b32`, `#63a94b`
- Gỗ: `#81512e`, `#9b6a43`, `#c28a58`
- Đá: `#777f87`, `#aeb8bd`
- Mái và điểm nhấn: đỏ, vàng, tím.

## Tình trạng tích hợp
- Atlas đã được nạp trong renderer bằng `Image` và crop từng sprite theo tọa độ nguồn.
- Cây sồi, thông, bạch dương và cây lá vàng được dùng cho các ô rừng.
- Nhà gỗ, nhà mái ngói, tháp canh và lâu đài được dùng theo cấp thành phố.
- Có fallback pixel primitives nếu atlas chưa tải xong.

## Việc tiếp theo
1. Tách và kiểm tra sprite độc lập trên nhiều kích thước màn hình điện thoại.
2. Bổ sung biến thể theo mùa, cấp độ nhà ở và quốc gia.
3. Xây dựng bộ tile địa hình, trang trại, tường thành, cầu và hoạt ảnh nước.
4. Thay dần các glyph/emoji còn lại trong công cụ bản đồ bằng artwork tự vẽ.
