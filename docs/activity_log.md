# Nhật ký hoạt động & Báo cáo công việc (Activity Log)
*Dự án: JELA (Japanese Education Learning App)*
*Thành viên thực hiện: **MinY-496** (vminhy0609@gmail.com)*

---

## 1. Phương pháp nhận diện đóng góp của cá nhân
Để đảm bảo tính chính xác khi tổng hợp báo cáo và phân biệt giữa các thay đổi của bạn với các thành viên khác trong nhóm (như *Vĩnh Hùng*, *Huy LG*, *HuyDev123*), chúng ta sử dụng hai nguồn thông tin chính dưới đây:

### Cách 1: Sử dụng Git History (Độ chính xác tuyệt đối về code)
Git tự động ghi lại tác giả (`Author`) cho mỗi commit. Để lấy chính xác các thay đổi **chỉ do bạn thực hiện**, bạn có thể chạy lệnh Git sau trong terminal:
```bash
git log --author="MinY-496\|vminhy0609@gmail.com" --name-status --pretty=format:"%n[COMMIT %h] - Ngày: %ad - Nội dung: %s" --date=short
```
* **Lý do chính xác:** Bộ lọc `--author` sẽ lọc bỏ hoàn toàn các thay đổi do người khác Merge hoặc Pull về máy bạn. Chỉ những dòng code thực sự được commit bằng tài khoản git của bạn mới được thống kê.

### Cách 2: Lịch sử hội thoại với Trợ lý AI (Độ chính xác về ý tưởng & thiết kế)
Các cuộc trò chuyện giúp ghi lại các phần việc mang tính thảo luận, sửa lỗi trực tiếp, thiết kế cơ sở dữ liệu và phân tích nghiệp vụ trước khi code được commit:
* **Kanji Learning System Integration (17/06 - 29/06):** Thiết kế và tích hợp hệ thống học Kanji.
* **Import Data on Startup (29/06 - 30/06):** Lập kế hoạch, tạo nhánh mới và phát triển tính năng tự động nạp dữ liệu từ các file CSV/JSON vào PostgreSQL lúc khởi động ứng dụng.

---

## 2. Nhật ký công việc chi tiết (Tổng hợp theo ngày/giai đoạn)

### Giai đoạn 1: Xây dựng tính năng Từ điển (Dictionary Feature)
*Thời gian: Từ 07/06/2026 đến 14/06/2026*

| Ngày | Công việc đã làm | Commit liên quan | Các file đã chỉnh sửa/thêm mới |
| :--- | :--- | :--- | :--- |
| **07/06/2026** | **Xây dựng tính năng tìm kiếm từ điển cơ bản**<br>- Thiết lập cấu trúc Entity `Dictionary`. <br>- Tạo repository, service và controller để tìm kiếm từ vựng.<br>- Cấu hình Security cho phép truy cập endpoint tìm kiếm. | `9dd92d4`<br>`282aec5` | - `jela-api/src/main/java/com/jela/api/config/SecurityConfig.java`<br>- `jela-api/src/main/java/com/jela/api/controller/DictionaryController.java`<br>- `jela-api/src/main/java/com/jela/api/dto/response/DictionarySearchResponse.java`<br>- `jela-api/src/main/java/com/jela/api/entity/Dictionary.java`<br>- `jela-api/src/main/java/com/jela/api/repository/DictionaryRepository.java`<br>- `jela-api/src/main/java/com/jela/api/service/DictionaryService.java`<br>- `jela-api/src/main/resources/application.properties`<br>- `jela-api/src/main/resources/db/migration/V1__init_auth_schema.sql` |
| **10/06/2026** | **Bổ dung API tìm kiếm từ điển theo ID**<br>- Phát triển API lấy thông tin chi tiết của từ vựng qua định danh ID. | `2ca9e04` | - Chỉnh sửa logic trong luồng Dictionary Service. |
| **12/06/2026** | **Xây dựng Lịch sử tìm kiếm & Danh sách từ vựng cá nhân**<br>- Tạo Entity và API lưu lịch sử tra cứu của người dùng (`DictionaryHistory`).<br>- Tạo Entity và API cho phép người dùng tạo danh sách từ vựng yêu thích (`UserDictionaryList`).<br>- Thêm mới các DTO request/response tương ứng. | `2a5c591` | - `jela-api/.../controller/DictionaryHistoryController.java`<br>- `jela-api/.../controller/UserDictionaryListController.java`<br>- `jela-api/.../dto/request/AddWordToNewListRequest.java`<br>- `jela-api/.../dto/request/addWordToListRequest.java`<br>- `jela-api/.../dto/response/DictionaryHistoryResponse.java`<br>- `jela-api/.../dto/response/DictionaryListSummaryResponse.java`<br>- `jela-api/.../entity/DictionaryHistory.java`<br>- `jela-api/.../entity/DictionaryHistoryId.java`<br>- `jela-api/.../entity/UserDictionaryList.java`<br>- `jela-api/.../repository/DictionaryHistoryRepository.java`<br>- `jela-api/.../repository/UserDictionaryListRepository.java`<br>- `jela-api/.../service/DictionaryHistoryService.java`<br>- `jela-api/.../service/UserDictionaryListService.java`<br>- `jela-api/src/main/resources/db/migration/V2__create_dictionary_history.sql` |
| **13/06/2026** | **Chuẩn hóa cấu trúc Database & Merge Code**<br>- Đổi tên DB & refactor tên bảng (thay thế `V2__create_dictionary_history.sql` bằng `V2__create_dictionary_kanji.sql`).<br>- Đổi tên class DTO để tuân thủ quy chuẩn Java CamelCase (`AddWordToListRequest`).<br>- Trộn nhánh tính năng từ điển vào nhánh chung. | `ac0d635`<br>`bd6d525`<br>`cb4471c` | - `jela-api/src/main/resources/application.properties`<br>- `jela-api/.../dto/request/AddWordToListRequest.java`<br>- `jela-api/.../entity/UserDictionaryList.java`<br>- `jela-api/src/main/resources/db/migration/V2__create_dictionary_kanji.sql` |
| **14/06/2026** | **Khôi phục lỗi di trú dữ liệu (Database Migration)**<br>- Khôi phục file cấu trúc schema xác thực ban đầu (`V1__init_auth_schema.sql`) để tránh lỗi xung đột cơ sở dữ liệu. | `6555b86` | - `jela-api/src/main/resources/db/migration/V1__init_auth_schema.sql` |

---

### Giai đoạn 2: Tích hợp dữ liệu Kanji & Tự động Import dữ liệu mẫu
*Thời gian: Ngày 30/06/2026*

| Ngày | Công việc đã làm | Commit liên quan | Các file đã chỉnh sửa/thêm mới |
| :--- | :--- | :--- | :--- |
| **30/06/2026** | **Phát triển luồng tự động nạp dữ liệu lúc khởi chạy ứng dụng (Data Importer)**<br>- Tạo nhánh `feature/import-data` từ main.<br>- Chuẩn bị dữ liệu mẫu dạng JSON/CSV cho Kanji và Từ vựng (`data-import/`).<br>- Viết Script Python bổ trợ import dữ liệu trực tiếp (`import_kanji_pg.py`).<br>- Xây dựng cấu trúc Java Reader (`StartupDataImporter`, `DataImportRecordMapper`) đọc file CSV nạp tự động vào PostgreSQL khi khởi động (chỉ chạy ở chế độ dev/test).<br>- Viết Unit Test kiểm thử mapper và nạp thử nghiệm.<br>- Tiến hành gộp nhánh (`Merge`) vào nhánh chính `main`. | `d39416b`<br>`4a5bd10`<br>`aa78ffd` | - **Thêm mới thư mục dữ liệu mẫu:** `data-import/dictionary.csv`, `data-import/example.csv`, `data-import/meaning.csv`, `data-import/kanji_bank_jlpt.json`<br>- **Script bổ trợ:** `data-import/import_kanji_pg.py`<br>- **Mã nguồn Java:** `StartupDataImporter.java`, `DataImportProperties.java`, `DataImportRecordMapper.java` (nằm trong gói `com.jela.api.dataimport`) tại `jela-api`<br>- **Unit Test:** `DataImportRecordMapperTests.java`, `JelaApiApplicationTests.java`<br>- **Cấu hình:** `jela-api/pom.xml`, `application.properties`, `application-test.properties` |

---

## 3. Cách cập nhật nhật ký này trong tương lai
Khi bạn tiếp tục thực hiện dự án này và muốn bổ sung vào bảng trên:
1. Chạy lệnh Git ở mục **1** để xem danh sách commit mới nhất của mình.
2. Thêm một dòng mới vào bảng nhật ký tương ứng với ngày làm việc của bạn.
3. Ghi lại các file chính mà bạn đã trực tiếp chỉnh sửa (lấy từ kết quả lệnh Git).
