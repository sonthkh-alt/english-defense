/* ============================================================
   lessons.js — Nội dung BÀI GIẢNG cho "Buổi học hôm nay"
   ------------------------------------------------------------
   Thiết kế theo phương pháp dạy–học:
   • Nghe: pre-listening (từ khóa) → nghe CÓ phụ đề (lấy ý) →
     nghe KHÔNG phụ đề → chép lại câu (kiểm tra hiểu).
   • Shadowing: nghe mẫu chuẩn → nhại từng câu 5 lần → ghi âm so sánh.
   • Từ vựng: 5 từ/ngày theo lộ trình (dễ→khó), nghe phát âm, kích hoạt.
   • Nói: gợi ý theo giai đoạn + câu mẫu; ghi âm & tự chấm.
   • Ôn: nhớ lại từ hôm nay + đọc to 1 câu cứu nguy.

   Nguồn video (uy tín, ổn định — đã kiểm chứng 2026):
   • BBC Learning English — 6 Minute English
   • VOA Learning English — Economics Report (đọc chậm 1/3)
   • CrashCourse Economics (playlist chính thức)
   • TED / TED-Ed — Economics
   • MIT OpenCourseWare · Open Yale Courses · LSE Public Lectures
   ============================================================ */
(function (global) {
  "use strict";

  const yt = (id) => "https://www.youtube-nocookie.com/embed/" + id + "?cc_load_policy=1&rel=0";

  // ---- Kho video nghe theo trình độ (xoay theo ngày) ----
  const LISTEN = {
    beginner: [ // GĐ0–1: chậm, rõ, có phụ đề
      { t: "BBC 6 Minute English — Box Set", y: "fcN0BXzK8bg", src: "BBC Learning English",
        url: "https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt",
        note: "Hội thoại ngắn, tốc độ vừa, có phụ đề + giải thích từ vựng. Chuẩn để luyện nghe lấy ý.", mins: 6 },
      { t: "VOA — Economics Report", y: "W7LiPCh5Zlw", src: "VOA Learning English",
        url: "https://www.youtube.com/playlist?list=PL-uLtPxrK91M-piPjowair8TBVTp-wI3_",
        note: "Tin kinh tế đọc chậm hơn 1/3 bình thường — hợp để bắt số liệu & thuật ngữ.", mins: 5 },
      { t: "Crash Course Econ #1 — Intro to Economics", y: "3ez10ADR_gM", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO",
        note: "Nhập môn kinh tế, hình ảnh minh họa, phụ đề tốt. Nền cho từ vựng chuyên ngành.", mins: 12 },
      { t: "Crash Course Econ #2 — Specialization & Trade", y: "NI9TLDIPVcs", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO",
        note: "Khái niệm thương mại & lợi thế so sánh — nghe kèm ví dụ trực quan.", mins: 11 },
    ],
    inter: [ // GĐ2: nhanh hơn, học thuật hơn
      { t: "Crash Course Econ #3 — Economic Systems & Macro", y: "B43YEW2FvDs", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO",
        note: "Hệ thống kinh tế & kinh tế vĩ mô. Bắt đầu quen mạch lập luận học thuật.", mins: 10 },
      { t: "Crash Course Econ #5 — Macroeconomics", y: "d8uTB5XorBw", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO",
        note: "GDP, tăng trưởng, chỉ số vĩ mô — nhiều thuật ngữ cốt lõi cho đề tài.", mins: 11 },
      { t: "TED-Ed — Economics Explained (series)", src: "TED-Ed", link: true,
        url: "https://ed.ted.com/worldecon",
        note: "Chuỗi bài ngắn có phụ đề & câu hỏi kèm theo — luyện nghe + kiểm tra hiểu.", mins: 6 },
      { t: "TED Playlist — Understanding World Economics", src: "TED", link: true,
        url: "https://www.ted.com/playlists/272/understanding_world_economics",
        note: "Bài nói của chuyên gia, có transcript & chỉnh tốc độ. Học cả cách trình bày.", mins: 14 },
    ],
    advanced: [ // GĐ3–4: bài giảng thật + phần HỎI–ĐÁP
      { t: "MIT OpenCourseWare — Economics Lectures", src: "MIT OCW", link: true,
        url: "https://ocw.mit.edu/courses/economics/",
        note: "Bài giảng đại học thật, tốc độ tự nhiên. Nghe để quen nhịp học thuật.", mins: 50 },
      { t: "Open Yale Courses — Financial Markets (R. Shiller)", src: "Open Yale Courses", link: true,
        url: "https://oyc.yale.edu/economics",
        note: "Bài giảng có transcript. Chọn 8–10 phút mỗi buổi, nghe kỹ phần lập luận.", mins: 10 },
      { t: "LSE — Public Lectures & Events (có Q&A thật)", src: "LSE", link: true,
        url: "https://www.lse.ac.uk/Events",
        note: "QUAN TRỌNG: nghe phần HỎI–ĐÁP để tập bắt ý câu hỏi giám khảo thật.", mins: 15 },
      { t: "TED — Economics (phân tích diễn giả)", src: "TED", link: true,
        url: "https://www.ted.com/topics/economics",
        note: "Vừa luyện nghe, vừa học cách một diễn giả giỏi trả lời & dẫn dắt.", mins: 14 },
    ],
  };

  // ---- Câu mẫu để SHADOWING theo giai đoạn ----
  const SHADOW = {
    1: [
      "Public spending on education increased last year.",
      "The data show a clear upward trend.",
      "Our public budget must be balanced over time.",
      "This policy aims to reduce rural poverty.",
      "Higher productivity raises living standards.",
      "The results indicate a significant effect.",
    ],
    2: [
      "Thank you for the opportunity to present my research.",
      "My presentation is organized into three parts.",
      "Let me now turn to the methodology.",
      "As you can see in this figure, the trend is clear.",
      "To sum up, my study makes three contributions.",
      "This brings me to my main findings.",
    ],
    3: [
      "Thank you for your question.",
      "If I understand correctly, you are asking about the method.",
      "Let me address that in two parts.",
      "That is an interesting direction for future research.",
      "The evidence in my study suggests otherwise.",
      "May I take a moment to think about that?",
    ],
    4: [
      "I acknowledge that limitation, and I addressed it with an instrumental variable.",
      "While the correlation is strong, I am cautious about claiming causation.",
      "My recommendation is feasible within the current budget constraints.",
      "That is beyond the scope of my study, but my findings suggest a direction.",
      "I partly agree; however, the evidence points to a different conclusion.",
      "Let me clarify the assumption behind that result.",
    ],
  };

  // ---- Gợi ý NÓI theo giai đoạn ----
  const SPEAK = {
    1: {
      prompt: "Giới thiệu công việc & đề tài của bạn bằng 5–7 câu tiếng Anh.",
      starters: [
        "My name is … and I work at …",
        "My research focuses on …",
        "The main problem I study is …",
        "I chose this topic because …",
        "My goal is to …",
      ],
      tip: "Nói chậm, rõ, câu ngắn. Đừng cố dùng câu phức.",
    },
    2: {
      prompt: "Trình bày phần MỞ ĐẦU bài thuyết trình: bối cảnh + mục tiêu + cấu trúc.",
      starters: [
        "Good morning. Thank you for being here.",
        "Today I will present my study on …",
        "The problem is important because …",
        "My presentation has three parts: …",
        "Let me begin with the background.",
      ],
      tip: "Tập nói không cầm giấy phần mở đầu. Ghi âm rồi nghe lại.",
    },
    3: {
      prompt: "Mock Q&A: trả lời 1 câu hỏi bảo vệ dưới đây, có mở–thân–kết.",
      axis: ["urgency", "novelty", "findings", "method"],
      starters: [
        "Thank you for your question.",
        "The short answer is …",
        "Let me give two reasons. First, … Second, …",
        "In summary, …",
      ],
      tip: "Diễn lại câu hỏi trước khi trả lời để chắc mình hiểu đúng.",
    },
    4: {
      prompt: "Mock Q&A khó: trả lời câu hỏi soi kỹ; dùng câu cứu nguy nếu bí.",
      axis: ["data", "limits", "policy", "apply"],
      starters: [
        "That is a fair concern. Let me address it directly.",
        "I acknowledge the limitation; I handled it by …",
        "If I understand correctly, you are asking whether …",
        "To conclude, my answer is …",
      ],
      tip: "Giữ bình tĩnh, kiểm soát thời gian. Không 'đứng hình' — dùng câu cứu nguy.",
    },
  };

  function phaseKey(phaseId) {
    if (phaseId <= 1) return "beginner";
    if (phaseId === 2) return "inter";
    return "advanced";
  }
  function pick(arr, day) { return arr[((day || 1) - 1) % arr.length]; }
  function pick3(arr, day) {
    const n = arr.length, s = ((day || 1) - 1) % n, out = [];
    for (let i = 0; i < 3 && i < n; i++) out.push(arr[(s + i) % n]);
    return out;
  }
  function speakKey(phaseId) { return phaseId <= 1 ? 1 : (phaseId === 2 ? 2 : (phaseId === 3 ? 3 : 4)); }

  const Lessons = {
    yt,
    pickListen(phaseId, day) { return pick(LISTEN[phaseKey(phaseId)], day); },
    pickShadow(phaseId, day) {
      const k = phaseId <= 1 ? 1 : (phaseId === 2 ? 2 : (phaseId === 3 ? 3 : 4));
      return pick3(SHADOW[k], day);
    },
    pickSpeak(phaseId, day) {
      const sp = SPEAK[speakKey(phaseId)];
      const out = { prompt: sp.prompt, starters: sp.starters, tip: sp.tip };
      // Từ GĐ3: kèm 1 câu hỏi thật để mock Q&A
      if (sp.axis && typeof SEED !== "undefined" && SEED.QUESTIONS) {
        const ax = sp.axis[((day || 1) - 1) % sp.axis.length];
        const list = SEED.QUESTIONS[ax] || [];
        if (list.length) {
          const q = list[((day || 1) - 1) % list.length];
          out.question = { en: q.q, vi: q.v, answer: q.a, axis: ax };
        }
      }
      return out;
    },
    pickRescue(day) {
      if (typeof APP_DATA === "undefined" || !APP_DATA.RESCUE_PHRASES) return null;
      const r = APP_DATA.RESCUE_PHRASES;
      return r[((day || 1) - 1) % r.length];
    },
  };

  global.LESSONS = Lessons;
})(window);
