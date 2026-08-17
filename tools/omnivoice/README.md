# 🎙️ Gói giọng OmniVoice (render sẵn)

Tạo audio phát âm **chất lượng cao bằng [OmniVoice](https://github.com/k2-fsa/OmniVoice)** (TTS 600+ ngôn ngữ của nhóm Next-gen Kaldi, Xiaomi AI Lab) rồi **đóng gói file `.wav` vào app**.

**Vì sao render sẵn?** OmniVoice chạy Python/GPU, **không có bản trình duyệt** — web tĩnh không gọi trực tiếp lúc chạy được. Render sẵn 1 lần → app phát file có sẵn: chất lượng cao, **chạy cả offline**, đáng tin cho dùng hằng ngày.

App tự nhận diện: mỗi văn bản được băm bằng **FNV-1a** thành `<key>.wav`. Khi bấm 🔊, nếu có `assets/audio/<key>.wav` thì phát nó; không có thì tự dùng giọng người bản xứ (Dictionary API) hoặc TTS. Hàm băm giống hệt trong `assets/js/ui.js`, `generate.mjs`, `render.py`.

---

## Cách 1 — Google Colab GPU (khuyên dùng, MIỄN PHÍ, không giới hạn)

1. Ở máy, tạo danh sách văn bản rồi commit/đẩy lên GitHub:
   ```bash
   node tools/omnivoice/generate.mjs dump words     # hoặc: sentences | all
   ```
   (tạo `tools/omnivoice/texts.json`)
2. Mở [Google Colab](https://colab.research.google.com) → Runtime → Change runtime type → **GPU (T4)**.
3. Chạy các ô sau:
   ```python
   !pip -q install omnivoice soundfile torch
   !git clone https://github.com/sonthkh-alt/english-defense.git
   %cd english-defense
   !python tools/omnivoice/render.py
   ```
4. Tải thư mục `assets/audio/` về, đưa vào dự án, commit & push. Xong — app tự dùng.

> Có thể chạy lại nhiều lần (bỏ qua file đã có). `all` gồm cả câu ví dụ, câu hỏi, câu mẫu → gói to hơn.

## Cách 2 — Máy có GPU NVIDIA (CUDA)
```bash
node tools/omnivoice/generate.mjs dump all
pip install omnivoice soundfile torch
python tools/omnivoice/render.py
```
> Yêu cầu Python 3.10–3.12 + PyTorch 2.8+. (Máy hiện tại đang Python 3.14 — PyTorch chưa hỗ trợ, nên dùng Colab hoặc tạo môi trường Python 3.12.)

## Cách 3 — HF Space (không cần cài, nhưng có HẠN MỨC GPU/IP)
```bash
node tools/omnivoice/generate.mjs words
```
Gọi bản demo Hugging Face của OmniVoice. **Có hạn mức GPU theo IP** → mỗi lần chỉ render được một ít rồi báo lỗi; chạy lại sau (resumable) để bù dần. Phù hợp để thử, không phù hợp render cả gói một lần.

---

## Giọng
Cố định cho toàn gói (một "người đọc" nhất quán): **Nữ · Thanh niên · Anh‑Mỹ**.
Đổi trong `render.py` (`INSTRUCT`) và `generate.mjs` (`VOICE`) nếu muốn giọng khác (nam, Anh‑Anh…).

## Bật/tắt trong app
Cài đặt → Audio → *Gói giọng OmniVoice*. Bật (mặc định) sẽ ưu tiên gói khi có file.
