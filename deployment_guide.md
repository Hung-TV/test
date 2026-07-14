# Hướng dẫn kết nối JELA (Vercel & Render) không cần Env

Tài liệu này xác nhận cấu hình trực tiếp đã được cài đặt trong mã nguồn để kết nối **Frontend (Vercel)** và **Backend (Render)** phục vụ mục đích kiểm thử nhanh mà không cần thiết lập biến môi trường thủ công.

---

## 1. Cấu hình đã được hardcode làm giá trị mặc định (Fallback):

### Ở Frontend (`jela-web`):
- Địa chỉ gọi API mặc định trong [axiosClient.js](file:///c:/Users/tatvi/test/jela-web/src/api/axiosClient.js) và [dictionaryApi.js](file:///c:/Users/tatvi/test/jela-web/src/api/dictionaryApi.js) đã được chuyển thành:
  `https://test-6z9h.onrender.com/api`
- Vercel sẽ tự động sử dụng URL này khi build mà không cần bạn cấu hình biến `VITE_API_BASE_URL`.

### Ở Backend (`jela-api`):
- Danh sách nguồn gửi yêu cầu được phép (CORS) và Link Client mặc định trong [application.properties](file:///c:/Users/tatvi/test/jela-api/src/main/resources/application.properties) đã được cập nhật thành:
  `https://test-xw2z.vercel.app`
- Backend trên Render sẽ tự động chấp nhận kết nối từ Frontend Vercel của bạn mà không cần thêm biến `JELA_CORS_ALLOWED_ORIGINS`.

---

## 2. Cách chạy cục bộ (Local) nếu cần:
Mặc dù đã cấu hình cứng cho Server production làm mặc định, bạn vẫn có thể chạy local bình thường bằng cách sử dụng các tệp `.env` như cũ. Biến môi trường local sẽ tự động ghi đè (override) các giá trị hardcode này:
- FE (cục bộ): sử dụng file `.env` trỏ về `http://localhost:8080/api`
- BE (cục bộ): sử dụng biến hệ thống hoặc chạy trực tiếp sẽ tự nhận cổng `localhost:5173`.
