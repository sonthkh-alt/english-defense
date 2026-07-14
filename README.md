# 🎓 English Defense — Học tiếng Anh bảo vệ đề tài

> Website học tập cá nhân theo **lộ trình 12 tháng** để **thuyết trình và hỏi–đáp hoàn toàn bằng tiếng Anh** trước hội đồng khoa học. Trọng tâm: **NGHE** & **HỎI–ĐÁP** thời gian thực.

Một web app tĩnh, chạy trực tiếp trên trình duyệt, **không cần server, không cần cài đặt**. Mọi dữ liệu học tập (tiến độ, từ vựng, câu hỏi, nhật ký) được lưu ngay trong trình duyệt của bạn và có thể **xuất/nhập file để sao lưu**.

🔗 **Bản demo trực tuyến:** _(sẽ có sau khi bạn bật GitHub Pages — xem hướng dẫn bên dưới)_

---

## ✨ Tính năng

| Trang | Chức năng |
|---|---|
| **◎ Bảng điều khiển** | Tổng quan: ngày thứ mấy / 365, giai đoạn hiện tại, chuỗi ngày (streak), tổng thời lượng, tiến độ hôm nay bằng vòng tròn động. |
| **◈ Lộ trình 12 tháng** | Timeline 5 giai đoạn từ khởi động → mô phỏng bảo vệ toàn phần, mục tiêu & mốc cuối từng giai đoạn, đánh dấu hoàn thành. |
| **☀ Buổi học hôm nay** | Checklist khung ngày 65 phút (Nghe 20' · Shadowing 15' · Từ vựng 10' · Nói 15' · Ôn 5'), ghi chú tự lưu, chế độ "ngày bận" giữ 10' lõi. |
| **▤ Nhật ký & Chuỗi ngày** | Bản đồ nhiệt (heatmap) 26 tuần, nhật ký học tập theo tâm trạng. |
| **? Ngân hàng câu hỏi** | 10 trục câu hỏi bảo vệ cố định, thêm câu + khung trả lời, theo dõi mức thành thạo, prompt AI sinh câu hỏi. |
| **✎ Sổ tay từ vựng** | Chỉ tiêu 5 từ/ngày, luyện **flashcard** theo hộp Leitner (spaced repetition). |
| **⛑ Câu cứu nguy** | Bộ câu "chữa cháy" khi chưa nghe rõ câu hỏi, đánh dấu thuộc lòng. |
| **✦ Bộ công cụ AI** | Hướng dẫn dùng AI + prompt mẫu sẵn (hội đồng ảo, sửa văn nói, audio shadowing…). |
| **▲ Đo tiến bộ** | Nhật ký ghi âm để so sánh theo thời gian, chỉ số khách quan, rủi ro & phương án. |
| **⚙ Cài đặt** | Đặt ngày bắt đầu, tên đề tài, **sao lưu / khôi phục** dữ liệu (.json), giao diện sáng/tối. |

### Điểm mạnh thiết kế
- 🎨 Giao diện hiện đại, **sáng/tối tự động**, responsive (điện thoại + máy tính).
- 🔒 **Riêng tư tuyệt đối** — dữ liệu không rời khỏi máy bạn (localStorage).
- ⚡ **Không phụ thuộc thư viện ngoài**, tải tức thì, hoạt động cả khi offline.
- ♿ Hỗ trợ bàn phím (gõ `g` rồi `d/r/t/j/q/v/s` để chuyển trang nhanh).

---

## 🚀 Cách sử dụng hàng ngày

1. Mở website vào **buổi sáng sớm** (đúng khung giờ vàng của bạn).
2. Vào **☀ Buổi học hôm nay**, làm lần lượt 5 phần theo khung 65 phút.
3. Thêm **5 từ mới** ở Sổ tay, luyện flashcard các từ cũ.
4. Từ giữa lộ trình: mỗi ngày luyện vài câu ở **Ngân hàng câu hỏi** + mock Q&A với AI.
5. Cuối tuần: ghi **Nhật ký** + thêm 1 **bản thu** ở trang Đo tiến bộ để so sánh.
6. **Không ngày nào bằng không** — ngày bận, bấm "🔥 Ngày bận — chỉ 10' lõi" để giữ chuỗi.

> 💾 **Mẹo an toàn dữ liệu:** mỗi tuần vào **Cài đặt → Xuất dữ liệu** và lưu file `.json` vào Google Drive/OneDrive. Đổi máy thì "Nhập dữ liệu" để đồng bộ.

---

## 🌐 Đưa lên internet với GitHub Pages (miễn phí)

### Cách 1 — Deploy từ nhánh (đơn giản nhất, khuyên dùng)

1. Tạo repository mới trên GitHub (ví dụ tên `english-defense`).
2. Đẩy code lên (xem phần lệnh git bên dưới).
3. Vào repo → **Settings** → **Pages**.
4. Mục **Source**: chọn **Deploy from a branch**.
5. Chọn nhánh **`main`** và thư mục **`/ (root)`** → **Save**.
6. Chờ ~1 phút, website sẽ chạy tại:
   `https://<tên-github-của-bạn>.github.io/english-defense/`

### Cách 2 — GitHub Actions (tự động deploy mỗi lần push)

Repo đã kèm sẵn workflow tại [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
Chỉ cần vào **Settings → Pages → Source → GitHub Actions**. Từ đó mỗi lần `git push`, site tự cập nhật.

---

## 💻 Đẩy code lên GitHub (lần đầu)

```bash
# Trong thư mục dự án (đã có sẵn git init & commit đầu tiên)
git remote add origin https://github.com/<tên-github>/english-defense.git
git branch -M main
git push -u origin main
```

> Nếu chưa cài `git`, tải tại https://git-scm.com. Nếu muốn dùng `gh` (GitHub CLI) để tạo repo tự động: `gh repo create english-defense --public --source=. --push`.

## 🖥️ Chạy thử tại máy (không cần internet)

Chỉ cần **mở file `index.html`** bằng trình duyệt. Xong.

---

## 🗂️ Cấu trúc dự án

```
English/
├── index.html                      # Khung ứng dụng (shell)
├── assets/
│   ├── css/style.css               # Toàn bộ hệ thống thiết kế (sáng/tối)
│   ├── favicon.svg                 # Biểu tượng
│   └── js/
│       ├── data.js                 # Nội dung lộ trình (10 trục câu hỏi, khung ngày…)
│       ├── store.js                # Lưu trạng thái (localStorage) + sao lưu
│       ├── ui.js                   # Tiện ích UI (toast, modal, vòng tiến độ…)
│       ├── views.js                # Render tất cả các trang
│       └── app.js                  # Router + giao diện sáng/tối + khởi tạo
├── ke-hoach-tieng-anh-bao-ve-de-tai.md   # Kế hoạch gốc (nguồn nội dung)
└── .github/workflows/deploy.yml    # Auto-deploy GitHub Pages (tuỳ chọn)
```

---

## 🛠️ Công nghệ

- **HTML + CSS + JavaScript thuần** (vanilla) — không framework, không build step.
- `localStorage` cho dữ liệu cá nhân; export/import JSON để sao lưu.
- Font: Be Vietnam Pro + Lexend (Google Fonts).

## 📜 Giấy phép

Dự án cá nhân — tự do sử dụng và chỉnh sửa cho việc học của bạn.

---

<p align="center"><em>Học hẹp · Học đều · Không ngày nào bằng không.</em></p>
