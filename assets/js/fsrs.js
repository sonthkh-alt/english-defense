/* ============================================================
   fsrs.js — Thuật toán FSRS-4.5 (Free Spaced Repetition Scheduler)
   ------------------------------------------------------------
   Cài đặt gọn cho trình duyệt, không phụ thuộc thư viện ngoài.
   Tham chiếu: https://github.com/open-spaced-repetition/fsrs4anki
   • Mỗi thẻ (theo từng CHIỀU học) giữ: {s, d, due, last, reps, lapses, state}
     - s: stability (ngày), d: difficulty (1..10)
     - due: ISO date đến hạn ôn · last: ISO ngày ôn gần nhất
     - state: "new" | "learning" | "review" | "relearning"
   • Đánh giá 4 mức: 1=Quên · 2=Khó · 3=Nhớ · 4=Dễ
   ============================================================ */
(function (global) {
  "use strict";

  // Trọng số mặc định FSRS-4.5
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031,
             1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const REQUEST_R = 0.9;      // mục tiêu nhớ 90% tại thời điểm ôn
  const MAX_IVL = 365;        // trần khoảng cách (ngày) — lộ trình chỉ 12 tháng

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  function initStability(rating) { return Math.max(0.1, W[rating - 1]); }
  function initDifficulty(rating) { return clamp(W[4] - (rating - 3) * W[5], 1, 10); }

  function retrievability(elapsedDays, s) {
    if (s <= 0) return 0;
    return Math.pow(1 + elapsedDays / (9 * s), -1);
  }

  function nextIntervalDays(s) {
    const ivl = (9 * s * (1 - REQUEST_R)) / REQUEST_R; // = s khi R=0.9
    return clamp(Math.round(ivl), 1, MAX_IVL);
  }

  function nextDifficulty(d, rating) {
    const dPrime = d - W[6] * (rating - 3);
    // mean reversion về initDifficulty(3)
    return clamp(W[7] * initDifficulty(3) + (1 - W[7]) * dPrime, 1, 10);
  }

  function stabilityAfterRecall(d, s, r, rating) {
    const hard = rating === 2 ? W[15] : 1;
    const easy = rating === 4 ? W[16] : 1;
    const inc = Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) *
                (Math.exp(W[10] * (1 - r)) - 1) * hard * easy;
    return Math.max(0.1, s * (1 + inc));
  }

  function stabilityAfterForget(d, s, r) {
    const sNew = W[11] * Math.pow(d, -W[12]) *
                 (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    return clamp(sNew, 0.1, s); // quên thì stability không tăng
  }

  /* ---------- API chính ---------- */
  // Tạo trạng thái thẻ mới (chưa học lần nào) — due = hôm nay
  function newCard(todayISO) {
    return { s: 0, d: 0, due: todayISO, last: null, reps: 0, lapses: 0, state: "new" };
  }

  // Áp một lần đánh giá. today/dueISO là chuỗi yyyy-mm-dd. Trả về state MỚI.
  function review(card, rating, todayISO, daysBetween) {
    rating = clamp(rating | 0, 1, 4);
    const c = Object.assign({}, card);
    const elapsed = c.last ? Math.max(0, daysBetween(c.last, todayISO)) : 0;

    if (c.state === "new" || !c.last) {
      c.s = initStability(rating);
      c.d = initDifficulty(rating);
      c.state = rating === 1 ? "learning" : "review";
    } else {
      const r = retrievability(elapsed, c.s);
      if (rating === 1) {
        c.s = stabilityAfterForget(c.d, c.s, r);
        c.d = nextDifficulty(c.d, rating);
        c.lapses = (c.lapses || 0) + 1;
        c.state = "relearning";
      } else {
        c.s = stabilityAfterRecall(c.d, c.s, r, rating);
        c.d = nextDifficulty(c.d, rating);
        c.state = "review";
      }
    }
    c.reps = (c.reps || 0) + 1;
    c.last = todayISO;

    // Khoảng cách tiếp theo: Quên → ôn lại NGAY hôm nay (học lại trong buổi),
    // các mức khác → theo stability.
    let ivl;
    if (rating === 1) ivl = 0;
    else if (c.state === "learning" || c.reps <= 1) ivl = rating === 4 ? 3 : 1;
    else ivl = nextIntervalDays(c.s);
    if (rating === 2) ivl = Math.max(1, Math.round(ivl * 0.8));

    c.due = addDays(todayISO, ivl);
    return c;
  }

  // Xem trước khoảng cách cho 4 nút (hiển thị "1 ng", "3 ng"…)
  function previewIntervals(card, todayISO, daysBetween) {
    const out = {};
    [1, 2, 3, 4].forEach((r) => {
      const c = review(card, r, todayISO, daysBetween);
      out[r] = Math.max(0, daysBetween(todayISO, c.due));
    });
    return out;
  }

  function addDays(iso, n) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d + n);
    const pad = (x) => (x < 10 ? "0" + x : "" + x);
    return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
  }

  // Tạo trạng thái thẻ từ dữ liệu cũ (di trú hộp Leitner → FSRS).
  // Giữ layout bản ghi thẻ là việc riêng của fsrs.js.
  function fromLegacy(stabilityDays, lastReviewISO, reps, todayISO) {
    const s = Math.max(0.1, stabilityDays || 0.5);
    const last = lastReviewISO || todayISO;
    return { s: s, d: 5, due: addDays(last, Math.round(s)), last: lastReviewISO || null,
             reps: reps || 1, lapses: 0, state: "review" };
  }

  // Thẻ có đến hạn hôm nay không?
  function isDue(card, todayISO) { return !card.due || card.due <= todayISO; }

  // "Đã thuộc" = stability ≥ 21 ngày (nhớ ổn định hơn 3 tuần)
  function isMastered(card) { return card.state === "review" && card.s >= 21; }

  global.FSRS = { newCard, review, previewIntervals, isDue, isMastered, retrievability, addDays, fromLegacy };
})(window);
