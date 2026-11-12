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

## Việc tiếp theo
1. Tách atlas thành sprite độc lập và kiểm tra tỷ lệ trên màn hình điện thoại.
2. Bổ sung biến thể theo mùa, cấp độ nhà ở và quốc gia.
3. Xây dựng bộ tile địa hình và hoạt ảnh nước.
4. Chỉ sau khi bộ sprite được duyệt mới tích hợp vào renderer bản đồ.
