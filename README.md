# JELA (Japanese Education Learning App) 🇯🇵

JELA là ứng dụng học tiếng Nhật toàn diện tích hợp Trí tuệ nhân tạo (AI) cục bộ để hỗ trợ tra cứu từ điển, quản lý Hán tự theo cấp độ JLPT, và tự động tạo câu hỏi trắc nghiệm ôn tập thông minh (Spaced Repetition System).

---

## 🛠️ Chuẩn bị môi trường & Tải về (Prerequisites)

Để khởi chạy dự án, máy tính của bạn cần cài đặt sẵn các công cụ sau:

1. **Java Development Kit (JDK 17)**:
   - Tải về: [Eclipse Temurin JDK 17 (Khuyên dùng)](https://adoptium.net/temurin/releases/?version=17) hoặc [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/#java17)
2. **Node.js (LTS v18 hoặc mới hơn)**:
   - Tải về: [Node.js Official Website](https://nodejs.org/)
3. **Python (v3.10 hoặc mới hơn)**:
   - Tải về: [Python Official Website](https://www.python.org/downloads/)
4. **PostgreSQL (Hệ quản trị cơ sở dữ liệu)**:
   - Tải về: [PostgreSQL Official Website](https://www.postgresql.org/download/)
   - *Yêu cầu: Khởi tạo sẵn một Database trống tên là `jela_db`.*
   - *Thông tin cấu hình mặc định (có thể chỉnh sửa trong file [application.properties](file:///d:/study/8/PRM393/project/JELA_Japanese-Education-Learning-App/jela-api/src/main/resources/application.properties)):*
     - DB URL: `jdbc:postgresql://localhost:5432/jela_db`
     - Username: `postgres`
     - Password: `12345`
5. **Ollama (Công cụ chạy Mô hình ngôn ngữ lớn LLM cục bộ)**:
   - Tải về: [Ollama Official Website](https://ollama.com/)

---

## 🚀 Hướng dẫn khởi chạy nhanh nhất (Với run-all.bat)

Sau khi cài đặt xong các công cụ trên, bạn chỉ cần nhấp đúp file:

```bash
run-all.bat
```

**Cơ chế hoạt động tự động của script:**
- Tự động kiểm tra và cài đặt các thư viện Python cho dịch vụ AI (`jela-ai/requirements.txt`).
- Tự động kiểm tra và chạy `npm install` để tải thư viện Frontend nếu thư mục `node_modules` chưa tồn tại.
- Tự động khởi chạy Ollama và tải về/chạy mô hình ngôn ngữ lớn `qwen2.5:3b` nếu máy của bạn chưa có sẵn.
- Khởi chạy dịch vụ AI (`jela-ai` - Cổng `8000`).
- Khởi chạy Backend API (`jela-api` - Cổng `8080` - tự động tạo bảng dữ liệu).
- Khởi chạy Giao diện Web (`jela-web` - Cổng `5173`).

*Sau khi chạy, giao diện học tập sẽ hiển thị tại: http://localhost:5173*
