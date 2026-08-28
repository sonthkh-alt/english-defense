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
    beginner: [ // GĐ0–1: chậm, rõ, có phụ đề (xếp DỄ nhất trước)
      { t: "VOA — Economics Report", y: "W7LiPCh5Zlw", src: "VOA Learning English",
        url: "https://www.youtube.com/playlist?list=PL-uLtPxrK91M-piPjowair8TBVTp-wI3_",
        note: "DỄ NHẤT: tin kinh tế đọc chậm hơn 1/3 bình thường — hợp để bắt số liệu & thuật ngữ.", mins: 5 },
      { t: "BBC 6 Minute English — Box Set", y: "fcN0BXzK8bg", src: "BBC Learning English",
        url: "https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt",
        note: "Hội thoại ngắn, tốc độ vừa, có phụ đề + giải thích từ vựng. Chuẩn để luyện nghe lấy ý.", mins: 6 },
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

  // ---- Câu mẫu để SHADOWING theo giai đoạn (kèm bản dịch tiếng Việt) ----
  const SHADOW = {
    1: [
      { en: "Public spending on education increased last year.", vi: "Chi tiêu công cho giáo dục đã tăng trong năm ngoái." },
      { en: "The data show a clear upward trend.", vi: "Dữ liệu cho thấy một xu hướng tăng rõ rệt." },
      { en: "Our public budget must be balanced over time.", vi: "Ngân sách công của chúng ta phải cân đối theo thời gian." },
      { en: "This policy aims to reduce rural poverty.", vi: "Chính sách này nhằm giảm nghèo ở nông thôn." },
      { en: "Higher productivity raises living standards.", vi: "Năng suất cao hơn giúp nâng cao mức sống." },
      { en: "The results indicate a significant effect.", vi: "Kết quả cho thấy một tác động có ý nghĩa." },
    ],
    2: [
      { en: "Thank you for the opportunity to present my research.", vi: "Cảm ơn đã cho tôi cơ hội trình bày nghiên cứu của mình." },
      { en: "My presentation is organized into three parts.", vi: "Bài trình bày của tôi gồm ba phần." },
      { en: "Let me now turn to the methodology.", vi: "Bây giờ tôi xin chuyển sang phần phương pháp." },
      { en: "As you can see in this figure, the trend is clear.", vi: "Như quý vị thấy trong hình này, xu hướng rất rõ." },
      { en: "To sum up, my study makes three contributions.", vi: "Tóm lại, nghiên cứu của tôi có ba đóng góp." },
      { en: "This brings me to my main findings.", vi: "Điều này dẫn tôi tới các kết quả chính." },
    ],
    3: [
      { en: "Thank you for your question.", vi: "Cảm ơn câu hỏi của thầy/cô." },
      { en: "If I understand correctly, you are asking about the method.", vi: "Nếu tôi hiểu đúng, thầy/cô đang hỏi về phương pháp." },
      { en: "Let me address that in two parts.", vi: "Tôi xin trả lời làm hai ý." },
      { en: "That is an interesting direction for future research.", vi: "Đó là một hướng thú vị cho nghiên cứu tiếp theo." },
      { en: "The evidence in my study suggests otherwise.", vi: "Bằng chứng trong nghiên cứu của tôi cho thấy điều ngược lại." },
      { en: "May I take a moment to think about that?", vi: "Cho tôi một chút để suy nghĩ về điều đó được không ạ?" },
    ],
    4: [
      { en: "I acknowledge that limitation, and I addressed it with an instrumental variable.", vi: "Tôi thừa nhận hạn chế đó, và đã xử lý bằng một biến công cụ." },
      { en: "While the correlation is strong, I am cautious about claiming causation.", vi: "Dù tương quan mạnh, tôi vẫn thận trọng khi khẳng định quan hệ nhân quả." },
      { en: "My recommendation is feasible within the current budget constraints.", vi: "Khuyến nghị của tôi khả thi trong giới hạn ngân sách hiện tại." },
      { en: "That is beyond the scope of my study, but my findings suggest a direction.", vi: "Điều đó ngoài phạm vi nghiên cứu, nhưng kết quả của tôi gợi mở một hướng đi." },
      { en: "I partly agree; however, the evidence points to a different conclusion.", vi: "Tôi đồng ý một phần; tuy nhiên, bằng chứng chỉ tới một kết luận khác." },
      { en: "Let me clarify the assumption behind that result.", vi: "Tôi xin làm rõ giả định đằng sau kết quả đó." },
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

  // ---- Video NGƯỜI THẬT để nhại (clip ngắn, giọng rõ, có thể nhúng) ----
  const SHADOW_VIDEO = {
    beginner: [
      { t: "VOA — đọc chậm, rõ (lý tưởng để nhại)", y: "W7LiPCh5Zlw", src: "VOA Learning English",
        url: "https://www.youtube.com/playlist?list=PL-uLtPxrK91M-piPjowair8TBVTp-wI3_" },
      { t: "BBC 6 Minute English", y: "fcN0BXzK8bg", src: "BBC Learning English",
        url: "https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt" },
    ],
    inter: [
      { t: "Crash Course Econ #1 — Intro", y: "3ez10ADR_gM", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO" },
      { t: "Crash Course Econ #3 — Systems & Macro", y: "B43YEW2FvDs", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO" },
    ],
    advanced: [
      { t: "Crash Course Econ #5 — Macroeconomics", y: "d8uTB5XorBw", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO" },
      { t: "Crash Course Econ #2 — Trade", y: "NI9TLDIPVcs", src: "CrashCourse",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPNZwz5_o_5uirJ8gQXnhEO" },
    ],
  };

  /* ---------- CHẤM ĐỘ KHÓ & XẾP DỄ → KHÓ ----------
     Mọi kho nội dung (câu shadowing, câu cứu nguy, ngân hàng câu hỏi)
     đều được xếp theo điểm khó tăng dần, để ngày đầu luôn gặp câu dễ
     nhất rồi nâng dần. Điểm dựa trên các yếu tố đo được:
       • số từ                    • số âm tiết trung bình mỗi từ
       • tỉ lệ từ dài (≥3 âm tiết) • số mệnh đề phụ / dấu ngắt
       • số thuật ngữ khó (cấp 3–4 trong gói từ vựng)                */
  function syllables(word) {
    const w = String(word).toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    const m = w.match(/[aeiouy]+/g);
    let n = m ? m.length : 1;
    if (/e$/.test(w) && n > 1) n--;          // 'e' câm cuối từ
    return Math.max(1, n);
  }
  // Thuật ngữ cấp 3–4 trong gói từ vựng → câu chứa chúng khó hơn
  let hardTerms = null;
  function hardTermSet() {
    if (hardTerms) return hardTerms;
    hardTerms = new Set();
    if (typeof SEED !== "undefined" && Array.isArray(SEED.VOCAB)) {
      SEED.VOCAB.forEach((v) => { if ((v.lvl || 2) >= 3) hardTerms.add(String(v.t).toLowerCase()); });
    }
    return hardTerms;
  }
  function difficulty(text) {
    const s = String(text || "").trim();
    if (!s) return 0;
    const words = s.split(/\s+/).filter(Boolean);
    const n = words.length;
    const syl = words.reduce((a, w) => a + syllables(w), 0);
    const avgSyl = syl / Math.max(1, n);
    const longRatio = words.filter((w) => syllables(w) >= 3).length / Math.max(1, n);
    const clauses = (s.match(/[,;:—]|\b(although|while|whereas|however|unless|because|which|that|if)\b/gi) || []).length;
    const low = s.toLowerCase();
    let hard = 0;
    hardTermSet().forEach((t) => { if (low.indexOf(t) >= 0) hard++; });
    return Math.round(n * 2.2 + avgSyl * 8 + longRatio * 22 + clauses * 4 + hard * 6);
  }
  // So sánh ổn định (điểm khó → độ dài → chữ cái) để thứ tự không đổi giữa các lần tải
  function byDifficulty(getText) {
    return (a, b) => {
      const ta = getText(a), tb = getText(b);
      return (difficulty(ta) - difficulty(tb)) || (ta.length - tb.length) || (ta < tb ? -1 : ta > tb ? 1 : 0);
    };
  }
  function sortByDifficulty(arr, getText) {
    return (arr || []).slice().sort(byDifficulty(getText || ((x) => (x && x.en) || String(x))));
  }
  // Xếp các trục câu hỏi theo cấp độ (SEED.AXIS_LEVELS) rồi tới tên trục
  function axesByLevel(axes) {
    const lv = (typeof SEED !== "undefined" && SEED.AXIS_LEVELS) || {};
    return (axes || []).slice().sort((a, b) => ((lv[a] || 2) - (lv[b] || 2)) || (a < b ? -1 : a > b ? 1 : 0));
  }
  // Xếp TẤT CẢ kho nội dung dễ → khó ngay khi tải trang
  function sortAllPools() {
    Object.keys(SHADOW).forEach((k) => { SHADOW[k].sort(byDifficulty((s) => s.en)); });
    Object.keys(SPEAK).forEach((k) => { if (SPEAK[k].axis) SPEAK[k].axis = axesByLevel(SPEAK[k].axis); });
    if (typeof APP_DATA !== "undefined" && Array.isArray(APP_DATA.RESCUE_PHRASES)) {
      APP_DATA.RESCUE_PHRASES.sort(byDifficulty((p) => p.en || ""));
    }
    if (typeof SEED !== "undefined" && SEED.QUESTIONS) {
      Object.keys(SEED.QUESTIONS).forEach((ax) => { SEED.QUESTIONS[ax].sort(byDifficulty((q) => q.q || "")); });
    }
  }
  sortAllPools();

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
      // Kho đã xếp dễ→khó; sắp lại bộ 3 của ngày để luôn tăng dần (kể cả khi xoay vòng)
      return sortByDifficulty(pick3(SHADOW[k], day), (s) => s.en);
    },
    pickShadowVideo(phaseId, day) { return pick(SHADOW_VIDEO[phaseKey(phaseId)], day); },
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

    // ---- Getter cho Roadmap (bài học của từng giai đoạn) ----
    listenPool(phaseId) { return LISTEN[phaseKey(phaseId)] || []; },
    shadowVideoPool(phaseId) { return SHADOW_VIDEO[phaseKey(phaseId)] || []; },
    shadowPool(phaseId) { const k = phaseId <= 1 ? 1 : (phaseId === 2 ? 2 : (phaseId === 3 ? 3 : 4)); return SHADOW[k] || []; },
    speakInfo(phaseId) { return SPEAK[speakKey(phaseId)]; },
    // Nhãn cấp độ nghe theo giai đoạn (dễ → khó)
    levelLabel(phaseId) {
      const k = phaseKey(phaseId);
      return k === "beginner" ? "Cơ bản — chậm, rõ, có phụ đề"
           : k === "inter" ? "Trung cấp — nhanh hơn, học thuật hơn"
           : "Nâng cao — bài giảng thật + phần Hỏi–đáp";
    },
    levelColor(phaseId) {
      const k = phaseKey(phaseId);
      return k === "beginner" ? "accent" : (k === "inter" ? "violet" : "amber");
    },
    // Các cấp từ vựng trọng tâm của giai đoạn (bám 4 cấp trong SEED.LEVELS)
    vocabLevels(phaseId) {
      if (phaseId <= 1) return [1, 2];
      if (phaseId === 2) return [2, 3];
      if (phaseId === 3) return [3, 4];
      return [4];
    },

    // ---- Công cụ xếp DỄ → KHÓ (dùng chung cho store.js & views.js) ----
    difficulty,          // chấm điểm khó của một câu/cụm
    sortByDifficulty,    // sao chép mảng rồi xếp tăng dần
    axesByLevel,         // xếp trục câu hỏi theo cấp độ
    rescuePool() { return (typeof APP_DATA !== "undefined" && APP_DATA.RESCUE_PHRASES) || []; },
    // Nhãn độ khó để hiển thị cho người học
    diffLabel(text) {
      const d = difficulty(text);
      return d < 45 ? { t: "Dễ", c: "accent" } : d < 65 ? { t: "Vừa", c: "violet" } : { t: "Khó", c: "amber" };
    },
  };

  global.LESSONS = Lessons;
})(window);
