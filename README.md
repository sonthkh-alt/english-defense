# 🎓 English Defense — Bảo vệ luận văn bằng tiếng Anh (12 tháng)

> Ứng dụng web học tiếng Anh **cá nhân hóa** cho người học A2 (TOEIC ~350) với mục tiêu sau **12 tháng**: **trình bày luận văn 25 phút + trả lời phản biện trực tiếp** trước hội đồng khoa học — tương đương **CEFR B2 nói–nghe trong phạm vi chuyên ngành hẹp** (quản lý kinh tế · hành chính công · chính sách công · chuyển đổi số khu vực công).

Web app tĩnh, chạy trực tiếp trên trình duyệt, **không cần server, không cần cài đặt**. Dữ liệu học lưu cục bộ (localStorage + IndexedDB), **xuất/nhập file .json** để sao lưu. Cài được như **PWA**, các module không cần AI chạy **offline**.

## ✨ 6 module chính

| Module | Chức năng |
|---|---|
| **◎ Bảng điều khiển** | Vị trí trên lộ trình 12 tháng, % tháng hiện tại, streak, tổng giờ học, biểu đồ tiến bộ (thẻ ôn/ngày · điểm phát âm · điểm mô phỏng), danh sách **việc hôm nay** (xen kẽ theo tháng), cảnh báo chậm tiến độ. |
| **✎ Từ vựng (FSRS)** | **2.007 mục** nạp sẵn (AWL 1–10 · kinh tế & chính sách · hành chính công & chuyển đổi số · phương pháp nghiên cứu · collocation · câu chức năng; 4 cấp dễ→khó theo tháng), thuật toán **FSRS-4.5**, thẻ **2 chiều** (ưu tiên Việt→Anh), chế độ **NÓI TO** (nhận dạng giọng nói đối chiếu), đếm từ thuộc / mục tiêu 2.000. Luôn **truy hồi trước, xem đáp án sau**. |
| **🎙 Phát âm** | Máy chấm theo TỪ (Web Speech API): xanh=đúng, đỏ=sai; bộ đọc đuôi -s/-ed, cụm phụ âm, trọng âm; **14 bộ minimal pairs** cho lỗi đặc thù người Việt; bảng **44 âm** kèm mẹo; theo dõi tiến bộ theo từng âm. |
| **🗣 Shadowing** | Ưu tiên **nhại NGƯỜI THẬT** qua video bản xứ (VOA → BBC → CrashCourse → TED/LSE theo giai đoạn): quy trình 3 bước, chỉnh tốc độ, **lặp đoạn A–B**, ghi âm so với bản gốc, thêm video của riêng bạn (kèm transcript). Chế độ offline: câu mẫu **giọng OmniVoice render sẵn**. |
| **✦ Luyện nói với AI** | Phương án chính: **GEMINI** (miễn phí) — app sinh prompt chứa hồ sơ + vị trí lộ trình + tiến độ, bạn dán vào Gemini để luyện (4 chế độ: kế hoạch tuần · hội thoại · sửa lỗi · nhập vai hội đồng). Tùy chọn: chat ngay trong app qua Anthropic API. |
| **🎓 Mô phỏng bảo vệ** | Với **Gemini**: prompt mô phỏng đầy đủ (sinh câu hỏi 8 dạng, hỏi từng câu, chấm 5 tiêu chí); hoặc mô phỏng trong app có bấm giờ + ghi transcript rồi nhờ Gemini chấm. AI đọc tóm tắt luận văn → sinh câu hỏi theo **8 dạng** (phương pháp, dữ liệu, tính mới, hạn chế, ứng dụng, lý thuyết, đóng góp, hướng tiếp); hẹn giờ 25' trình bày + 3'/câu trả lời; chấm **5 tiêu chí** (nội dung · trôi chảy · phát âm · từ chuyên ngành · ứng xử) + 3 việc cần cải thiện + câu trả lời mẫu; lưu lịch sử so tiến bộ. Kèm **ngân hàng 130 câu** + khung trả lời, **luyện nghe câu hỏi đa giọng**, **câu cứu nguy**. |

### Nguyên tắc sư phạm cài sẵn
1. **Retrieval practice** — không bao giờ hiện đáp án trước.
2. **Spaced repetition** — FSRS-4.5 cho toàn bộ thẻ.
3. **Elaboration** — mỗi từ gắn câu ví dụ ngữ cảnh hành chính công + dịch.
4. **Output-first** — từ tháng 2, buổi nào cũng có phần nói ra tiếng.
5. **Interleaving** — "việc hôm nay" trộn nhiều loại bài theo tỷ trọng từng tháng.
6. **Desirable difficulty** — theo dõi độ chính xác 7 ngày, gợi ý tăng/giảm lượng từ mới (vùng tối ưu 70–85%).

### 🔊 Audio 3 lớp (giữ nguyên từ bản trước)
1. **Gói giọng OmniVoice render sẵn** (`assets/audio/` + `manifest.json`, key = FNV-1a của câu) — 715 audio: 274 từ + 274 câu ví dụ + 130 câu hỏi + 37 câu thuyết trình/cứu nguy. Chất lượng cao, offline. Render thêm: xem [tools/omnivoice/](tools/omnivoice/README.md).
2. **Bản thu người bản xứ** cho từ đơn (Free Dictionary API, bật trong Cài đặt).
3. **TTS neural** của trình duyệt (fallback, có nhấn nhá theo mệnh đề).

## 🚀 Dùng hằng ngày (45–60 phút, chia 2–3 phiên)
1. Mở **Bảng điều khiển** → làm lần lượt **Việc hôm nay**.
2. Tối thiểu khi bận: ôn hết thẻ FSRS đến hạn (10').
3. Cuối tháng: làm **bài kiểm tra đầu ra** trong Lộ trình và đánh dấu đạt.
4. Mỗi tuần: **Cài đặt → Xuất dữ liệu** (.json) để sao lưu.

## 🗂️ Cấu trúc dự án
```
English/
├── index.html                  # Shell + điều hướng
├── sw.js                       # PWA offline
├── assets/
│   ├── css/style.css           # Hệ thống thiết kế (sáng/tối)
│   ├── audio/                  # Gói OmniVoice render sẵn + manifest.json
│   └── js/
│       ├── fsrs.js             # Thuật toán FSRS-4.5
│       ├── seed.js             # 274 từ + 130 câu hỏi + 36 câu mẫu (dữ liệu gốc)
│       ├── seed2.js            # +1.733 mục (sinh từ tools/vocab/build_seed2.py)
│       ├── prompts.js          # Sinh prompt cho Gemini (coach, mô phỏng, kế hoạch tuần)
│       ├── roadmap.js          # Lộ trình 12 tháng (mục tiêu, tuần, đầu ra, mix)
│       ├── content.js          # 44 âm, minimal pairs, 8 dạng phản biện, thư viện shadowing
│       ├── store.js            # Trạng thái (localStorage) + di trú v1→v3
│       ├── ui.js               # DOM helper, toast/modal, engine audio 3 lớp
│       ├── rec.js              # Ghi âm, nhận dạng giọng nói, chấm khớp từ, IndexedDB
│       ├── ai.js               # Anthropic API (claude-sonnet-4-6) + prompt
│       ├── views-core.js       # Dashboard · Lộ trình · Cài đặt
│       ├── views-vocab.js      # Module Từ vựng
│       ├── views-pron.js       # Module Phát âm
│       ├── views-shadow.js     # Module Shadowing
│       ├── views-ai.js         # Module Luyện nói với AI
│       ├── views-defense.js    # Module Mô phỏng bảo vệ
│       └── app.js              # Router + theme + PWA
└── tools/
    ├── omnivoice/              # Render gói giọng OmniVoice
    ├── vocab/                  # Bổ sung IPA
    └── test/smoke.js           # Kiểm tra khói (node tools/test/smoke.js)
```

## 🛠️ Công nghệ & ghi chú
- **HTML + CSS + JavaScript thuần** — không build step, chạy cả `file://` lẫn GitHub Pages.
- **AI**: gọi thẳng `api.anthropic.com` từ trình duyệt (header `anthropic-dangerous-direct-browser-access`); API key nhập trong Cài đặt, **chỉ lưu trên máy bạn**.
- Nhận dạng giọng nói cần **Chrome/Edge** (Web Speech API); iPhone: dùng Safari cho TTS, tính năng chấm phát âm hạn chế.
- Deploy: đẩy lên GitHub → Settings → Pages → Deploy from branch `main` (đã kèm workflow trong `.github/workflows/`).

## 📜 Giấy phép
Dự án cá nhân — tự do sử dụng và chỉnh sửa cho việc học của bạn.

---

<p align="center"><em>Học hẹp · Học đều · Không ngày nào bằng không.</em></p>
