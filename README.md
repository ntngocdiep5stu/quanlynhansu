# HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
## Smart HRM & Payroll Dashboard (Phiên bản Doanh nghiệp Cao cấp)

Hệ thống Web App thông minh giải quyết triệt để bài toán quản lý phân tán trên nhiều tệp Excel (Hồ sơ, Hợp đồng, Chấm công, Nghỉ phép, Bảng lương), tự động đối soát liên kết 360°, cảnh báo sớm rủi ro nhân sự và phân tích quỹ lương đa chiều bằng Google Gemini AI.

---

### 🌟 6 YẾU TỐ KỸ THUẬT & NGHIỆP VỤ CỐT LÕI

#### 1. Yếu Tố 1 - Vai Trò & Đối Tượng Sử Dụng
- **Tên chính thức:** HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG - CÔNG TY A
- **Đối tượng thụ hưởng:** Ban Giám đốc và Phòng Hành chính - Nhân sự (HCNS).
- **Mục tiêu:** Xóa bỏ sự rời rạc giữa 10 tệp Excel nguồn, kiểm toán tự động công chuẩn 26 ngày, trích nộp BHXH 10.5%, thuế TNCN và tư vấn tham mưu quỹ lương thông minh.

#### 2. Yếu Tố 2 - Giao Diện & Chuyển Động (UI/UX Bento Grid)
- **Bố cục & Màu sắc:** Bento Grid Dashboard kết hợp hiệu ứng kính mờ (Glassmorphism). Sidebar xanh rừng sâu (`#0F291E`), nền chính trắng sứ (`#F8FAFC`), điểm nhấn vàng đồng (`#D97706`). Hỗ trợ chuyển đổi Sáng/Tối (Light/Dark Mode).
- **Thư viện UI:** Tailwind CSS, rounded-2xl phong cách Shadcn UI, bộ biểu tượng Lucide Icons, phông chữ Plus Jakarta Sans & Inter.
- **4 Hiệu ứng chuyển động (Framer Motion):**
  1. Thẻ và bảng dữ liệu trượt từ dưới lên (**Fade-in Up**).
  2. Số liệu KPI nhảy tự động từ 0 lên giá trị thực (**Count-up Number Animation**).
  3. Hiệu ứng nổi 3D nhẹ kèm viền sáng khi rà chuột (**Hover Scale & Subtle Glow**).
  4. Thanh tiến trình và hiệu ứng khung xương (**Skeleton Shimmer**) khi quét dữ liệu hoặc AI đang phân tích.
- **3 Biểu đồ tương tác Recharts (Tooltip VNĐ):**
  1. *Horizontal Bar Chart:* Nhân sự thực tế vs Định biên 6 phòng ban.
  2. *Composed Bar & Line Chart:* Biến động Tổng thu nhập và Thực lĩnh (T07, T08, T09, T10/2026).
  3. *Donut Chart:* Cơ cấu tỷ trọng quỹ lương 6 phòng ban.

#### 3. Yếu Tố 3 - Đầu Vào & Dữ Liệu Thử Nghiệm
- **Nút nhịp thở `⚡ Nạp dữ liệu thử nghiệm`:** Nạp tức thì 50 nhân sự (`TP0001` - `TP0050`), 6 phòng ban, 50 hợp đồng, chấm công & bảng lương Quý 3/2026 kèm hiệu ứng pháo hoa ăn mừng (Confetti).
- **Vùng kéo thả Excel:** Tự động nạp bộ 10 file nguồn (`00_Danh_muc_he_thong.xlsx`, `01_Ho_so_nhan_vien.xlsx`, `02_Hop_dong.xlsx`, `03_Cham_cong_...`, `04_Nghi_phep_...`, `05_Bang_luong_...`).
- **Thanh lọc đa chiều:** 6 phòng ban, 4 kỳ tháng (T07 - T10/2026), trạng thái và tìm kiếm nhanh Mã NV / Họ tên / CCCD.
- **Trợ lý AI Nhân sự Voice & Text:** Hỗ trợ nhập liệu hoặc thu âm giọng nói tiếng Việt qua Web Speech API.

#### 4. Yếu Tố 4 - Quy Tắc Nghiệp Vụ & Mô Hình AI
- **Cấu trúc đọc Excel chuẩn:** Nhận diện dòng tiêu đề tại **Dòng 4**, đọc nhân viên từ **Dòng 5 đến Dòng 54**, tự động loại bỏ dòng **TỔNG CỘNG tại Dòng 55**.
- **Phân loại cảnh báo Đỏ - Vàng - Xanh:**
  - 🔴 **Màu Đỏ (Khẩn cấp):** HĐLĐ sắp hết hạn trong 30 ngày (`TP0021 - Đinh Tuấn Anh`, `TP0035 - Đặng Minh Thịnh`); Kết thúc 2 tháng thử việc cần đánh giá ký chính thức (`TP0008 - Hoàng Thu Thảo`, `TP0049 - Hoàng Văn Nam`).
  - 🟡 **Màu Vàng (Chờ xử lý):** Đơn xin nghỉ phép `Chờ duyệt` (`NP-2026-0515`, `NP-2026-0518`, `NP-2026-0520`); Nhân sự đang thử việc (`TP0023 - Nguyễn Mạnh An`).
  - 🟢 **Màu Xanh (Ổn định):** Nhân sự chính thức, hợp đồng hiệu lực, đơn phép đã duyệt.
- **Đối soát liên kết 360°:** Khóa chính `Mã NV` liên kết 5 chiều: Cá nhân + HĐLĐ + Chấm công OT + Quỹ phép + Chi tiết lương/BHXH/Thuế.
- **Mô hình AI & Fallback đa tầng:**
  - Mô hình chính: Google Gemini (`gemini-3-flash`).
  - Tự động chuyển đổi Fallback khi gặp lỗi `429` (vượt hạn mức): `gemini-3.1-flash-lite` -> `gemini-2.0-flash` với thuật toán Exponential Backoff.
  - Tích hợp Engine Quy tắc Chuyên gia Offline (Expert Rule Engine) bảo đảm hệ thống luôn hoạt động ngay cả khi chưa có Key hoặc mất mạng.

#### 5. Yếu Tố 5 - Đầu Ra & Kết Nối Thực Tế
- **8 Phân hệ Quản trị Sidebar:**
  1. `Bảng điều hành` (Executive Dashboard)
  2. `Việc cần xử lý` (Action Center phân loại Đỏ - Vàng - Xanh)
  3. `Danh sách nhân viên & Hồ sơ 360°` (Slide-over Drawer 360° với 5 tab)
  4. `Hợp đồng lao động` (Contracts Ledger)
  5. `Chấm công & Tăng ca` (Attendance & Overtime)
  6. `Nghỉ phép & Quỹ phép` (Leave Management)
  7. `Bảng lương & Thuế TNCN` (Payroll Ledger)
  8. `Nhập thêm dữ liệu` (Data Upload & Validation Checklist)
- **Xem trước Phiếu lương cá nhân A4/A5:** Bóc tách rõ thu nhập, phụ cấp, OT, trừ BHXH 10.5%, thuế TNCN, thực lĩnh bằng số & bằng chữ.
- **Kết nối hành động thực tế:**
  - 📄 Xuất **Phiếu lương cá nhân** & **Tờ trình đánh giá thử việc** ra file Word (`.docx`) hoặc In PDF.
  - 📊 Xuất bảng lương/công đã lọc ra file Excel (`.xlsx`).
  - 📋 Sao chép nhanh báo cáo vào clipboard.
  - 📅 Tạo lịch nhắc tái ký hợp đồng mở trực tiếp **Google Calendar**.
  - ✉️ Gửi Phiếu lương qua **Gmail** (mở cửa sổ soạn thư điền sẵn email `@congtya.vn`, tiêu đề và chi tiết lương).

#### 6. Yếu Tố 6 - Kiến Trúc & Bảo Mật Khóa API
- Công nghệ: React 18, Vite 6, TypeScript, Tailwind CSS, Recharts, Framer Motion, docx, SheetJS (xlsx), canvas-confetti.
- Hộp thoại `🔑 Cài đặt API Key` lưu an toàn trong `localStorage` (hoặc `.env.local`), có đèn tín hiệu kết nối API.
- Chuẩn bị sẵn sàng cho GitHub & Vercel deployment: `.gitignore` chặn toàn bộ `node_modules/`, `dist/`, `.env`, `.env.local`, `.DS_Store`.

---

### 🚀 Hướng Dẫn Khởi Chạy

```bash
# 1. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 2. Khởi chạy máy chủ phát triển cục bộ
npm run dev

# 3. Mở trình duyệt tại:
# http://localhost:5173
```
