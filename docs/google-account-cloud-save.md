# Tài khoản Google và Cloud Save — Thần Giới

## Đã thêm trong nhánh này
- Giao diện tài khoản tại sảnh game.
- Google OAuth qua Supabase Auth; phiên đăng nhập được lưu trong trình duyệt.
- Đăng nhập, đăng xuất, tên và ảnh đại diện Google.
- Khi nhấn nút lưu game hiện tại, bản lưu cục bộ vẫn được tạo; nếu đã đăng nhập, bản lưu được tải lên Supabase Storage.
- Có danh sách nhiều bản đồ đám mây; mỗi bản đồ có thể tải về, đổi tên hoặc xóa riêng.
- Tự động lưu cục bộ khi thế giới sang tháng mới; nếu đã đăng nhập, tự đồng bộ lên đám mây sau mỗi 3 tháng trong game. Nút Lưu vẫn đồng bộ ngay lập tức.
- Chưa thể bật đăng nhập thật cho tới khi chủ dự án cấu hình Supabase và Google OAuth.

## Cấu hình bắt buộc
1. Tạo project Supabase.
2. Authentication → Providers: bật Google, nhập OAuth Client ID/Secret từ Google Cloud Console.
3. Authentication → URL Configuration: thêm URL GitHub Pages vào Site URL và Redirect URLs.
4. Chạy toàn bộ `supabase/schema.sql` trong SQL Editor.
5. Project Settings → API: lấy Project URL và anon/publishable key, điền vào `src/cloud-config.js`.
6. Chỉ dùng anon/publishable key ở frontend. Tuyệt đối không dùng `service_role`.
7. Publish các file mới cùng game; đăng nhập Google rồi nhấn nút lưu hiện có để đồng bộ.

## Bảo vệ dữ liệu
- Local save `than-gioi-save` vẫn là bản dự phòng khi mất mạng hoặc đăng nhập lỗi.
- Bucket private, giới hạn file 50 MB.
- RLS giới hạn metadata theo `auth.uid()`; Storage policies giới hạn file theo thư mục UUID tài khoản.
- Tải bản đồ từ cloud sẽ sao lưu bản lưu local hiện tại vào khóa `than-gioi-save-before-cloud-restore`, rồi chạy luồng tải game cũ.
- Mỗi thế giới có `W.cloudId` riêng; danh sách cloud lưu nhiều thế giới độc lập. Đổi tên cập nhật cả metadata và dữ liệu thế giới; xóa sẽ xóa tệp trong Storage và dòng metadata tương ứng.
- Tự động lưu chỉ chạy khi thời gian mô phỏng tiến sang tháng mới; nếu game đang tạm dừng thì không tạo bản lưu lặp lại. Bản cục bộ vẫn hoạt động khi chưa đăng nhập hoặc mất mạng.
- Bản lưu sử dụng đúng cấu trúc hiện tại của game: `T`, `O`, `X`, `RV`, `n`, `c`, `cfg`, `W`, `CD`, `BL`, `RD`.

## Việc tiếp theo trước khi gọi là hoàn thiện hoàn toàn
- Các thế giới mới có `W.cloudId` riêng; bản lưu cũ được cấp ID khi đồng bộ lần đầu.
- Phát hiện xung đột khi mở cùng một thế giới trên nhiều thiết bị; hiện tại thiết bị lưu sau cùng sẽ ghi đè bản cloud.
- Versioned migration và bản sao lưu trước khi chuyển schema game.
- Bảng xếp hạng phải dùng RPC/Edge Function để kiểm tra điểm ở phía server, không tin dữ liệu client gửi trực tiếp.


## Bảng xếp hạng online

- Bảng xếp hạng được hiển thị riêng bên dưới các chế độ ở sảnh chính, không nằm trong khung tài khoản.
- Người chơi cần đăng nhập Google và đồng bộ bản đồ bằng nút **Lưu** trong game để gửi/cập nhật thành tích.
- Điểm văn minh hiện tính theo công thức: `dân số × 10 + công nghệ cao nhất × 1.000 + năm thế giới × 5`.
- Bảng chỉ công khai tên hiển thị, tên thế giới và chỉ số thành tích; không lưu hoặc hiển thị email.
- Sau khi cập nhật mã nguồn, chạy lại `supabase/schema.sql` trong SQL Editor để tạo bảng `leaderboard` và các chính sách RLS.
- Điểm hiện do trình duyệt gửi lên, phù hợp bảng xếp hạng cộng đồng cơ bản; muốn chống gian lận chặt chẽ cần chuyển tính điểm sang Edge Function/server có xác thực.
