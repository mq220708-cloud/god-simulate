# Tài khoản Google và Cloud Save — Thần Giới

## Đã thêm trong nhánh này
- Giao diện tài khoản tại sảnh game.
- Google OAuth qua Supabase Auth; phiên đăng nhập được lưu trong trình duyệt.
- Đăng nhập, đăng xuất, tên và ảnh đại diện Google.
- Khi nhấn nút lưu game hiện tại, bản lưu cục bộ vẫn được tạo; nếu đã đăng nhập, bản lưu được tải lên Supabase Storage.
- Có danh sách bản đồ đám mây và nút tải về, dùng lại luồng tải cũ của game.
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
- Bản lưu sử dụng đúng cấu trúc hiện tại của game: `T`, `O`, `X`, `RV`, `n`, `c`, `cfg`, `W`, `CD`, `BL`, `RD`.

## Việc tiếp theo trước khi gọi là hoàn thiện hoàn toàn
- Các thế giới mới có `W.cloudId` riêng; bản lưu cũ được cấp ID khi đồng bộ lần đầu.
- Hỗ trợ nhiều slot thế giới, đổi tên và xóa.
- Tự động lưu định kỳ có debounce; phát hiện xung đột khi mở cùng thế giới trên nhiều thiết bị.
- Versioned migration và bản sao lưu trước khi chuyển schema game.
- Bảng xếp hạng phải dùng RPC/Edge Function để kiểm tra điểm ở phía server, không tin dữ liệu client gửi trực tiếp.
