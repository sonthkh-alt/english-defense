/* ============================================================
   content.js — Nội dung luyện tập tĩnh
   ------------------------------------------------------------
   • PHONEMES: 44 âm tiếng Anh (nhóm, ví dụ, mẹo cho người Việt)
   • MINIMAL_PAIRS: cặp tối thiểu cho lỗi đặc thù người Việt
   • DRILLS: bộ đọc âm cuối / cụm phụ âm / đuôi -ed, -s
   • DEFENSE_TYPES: 8 dạng câu hỏi hội đồng + khung trả lời
     (ngân hàng câu lấy từ SEED.QUESTIONS — 130 câu, 10 trục)
   • RESCUE: câu xử lý tình huống (xin nhắc lại, xin thời gian…)
   • SHADOW_LIB: thư viện shadowing theo giai đoạn — video NGƯỜI
     THẬT (ưu tiên) + câu mẫu giọng OmniVoice render sẵn (offline)
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------------- 44 ÂM TIẾNG ANH ---------------- */
  // vn: mẹo riêng cho người Việt · hard: âm người Việt hay sai
  const PHONEMES = [
    { g: "Nguyên âm ngắn", items: [
      { ipa: "ɪ", ex: "ship, policy, statistic", vn: "Ngắn, miệng thả lỏng — KHÔNG kéo dài như /iː/." , hard: true },
      { ipa: "e", ex: "bed, method, spend", vn: "Gần 'e' tiếng Việt, ngắn gọn." },
      { ipa: "æ", ex: "tax, data, analysis", vn: "Mở miệng rộng hơn 'e' — giữa 'a' và 'e'.", hard: true },
      { ipa: "ʌ", ex: "budget, public, fund", vn: "Như 'ă' nói nhanh." },
      { ipa: "ɒ", ex: "policy, cost, option", vn: "Tròn môi, ngắn (giọng Anh)." },
      { ipa: "ʊ", ex: "good, look, full", vn: "Ngắn, KHÔNG chu môi dài như /uː/.", hard: true },
      { ipa: "ə", ex: "about, admin, data", vn: "Âm 'ơ' nhẹ nhất — xuất hiện ở âm tiết KHÔNG nhấn.", hard: true },
    ]},
    { g: "Nguyên âm dài", items: [
      { ipa: "iː", ex: "team, fee, leave", vn: "Kéo dài, môi bành ra như cười.", hard: true },
      { ipa: "ɑː", ex: "chart, part, large", vn: "Mở miệng to, kéo dài." },
      { ipa: "ɔː", ex: "report, law, reform", vn: "Tròn môi, kéo dài." },
      { ipa: "uː", ex: "school, rule, group", vn: "Chu môi, kéo dài." },
      { ipa: "ɜː", ex: "service, work, term", vn: "'Ơ' kéo dài, lưỡi giữa.", hard: true },
    ]},
    { g: "Nguyên âm đôi", items: [
      { ipa: "eɪ", ex: "rate, data, evaluate", vn: "Trượt từ 'e' sang 'i'." },
      { ipa: "aɪ", ex: "price, analyze, provide", vn: "Trượt từ 'a' sang 'i'." },
      { ipa: "ɔɪ", ex: "employ, point, choice", vn: "Trượt từ 'o' sang 'i'." },
      { ipa: "aʊ", ex: "outcome, account, allow", vn: "Trượt từ 'a' sang 'u'." },
      { ipa: "əʊ", ex: "growth, low, program", vn: "Trượt từ 'ơ' sang 'u' — KHÔNG đọc là 'ô' thuần.", hard: true },
      { ipa: "ɪə", ex: "year, career, period", vn: "Trượt từ 'i' sang 'ơ'." },
      { ipa: "eə", ex: "share, area, compare", vn: "Trượt từ 'e' sang 'ơ'." },
      { ipa: "ʊə", ex: "sure, secure, tour", vn: "Trượt từ 'u' sang 'ơ'." },
    ]},
    { g: "Phụ âm khó với người Việt", items: [
      { ipa: "θ", ex: "theory, growth, method", vn: "Lưỡi ĐẶT GIỮA hai hàm răng, thổi hơi — không phải /t/ hay /s/.", hard: true },
      { ipa: "ð", ex: "this, the, although", vn: "Như /θ/ nhưng RUNG dây thanh — không phải /d/.", hard: true },
      { ipa: "z", ex: "zero, analyze, taxes", vn: "Như /s/ nhưng RUNG — giữ rung cả ở CUỐI từ.", hard: true },
      { ipa: "s", ex: "sample, costs, statistics", vn: "Đừng nuốt /s/ ở cuối từ — 'costs' có 2 âm /s/.", hard: true },
      { ipa: "ʃ", ex: "share, information, administration", vn: "'S' nặng, chu môi.", hard: true },
      { ipa: "ʒ", ex: "measure, decision, vision", vn: "Như /ʃ/ nhưng rung.", hard: true },
      { ipa: "tʃ", ex: "research, chart, achieve", vn: "'Ch' bật mạnh hơi.", hard: true },
      { ipa: "dʒ", ex: "budget, manage, project", vn: "Như /tʃ/ nhưng rung — giữ rõ ở cuối: 'manage'.", hard: true },
      { ipa: "v", ex: "value, evaluate, improve", vn: "Răng trên chạm môi dưới, RUNG — không phải /f/ hay 'gi'.", hard: true },
      { ipa: "l", ex: "level, local, model", vn: "Cuối từ vẫn phải cong lưỡi chạm lợi — 'level' không thành 'leven'.", hard: true },
      { ipa: "r", ex: "research, result, rural", vn: "Cong lưỡi, không chạm lợi, không rung kiểu 'r' Việt." },
    ]},
    { g: "Phụ âm còn lại", items: [
      { ipa: "p", ex: "policy, public, gap", vn: "Bật hơi mạnh đầu từ; cuối từ khép môi rõ." },
      { ipa: "b", ex: "budget, benefit, job", vn: "Rung; cuối từ vẫn khép môi." },
      { ipa: "t", ex: "tax, impact, result", vn: "Cuối từ bật nhẹ — không nuốt.", hard: true },
      { ipa: "d", ex: "data, fund, standard", vn: "Cuối từ vẫn rung nhẹ.", hard: true },
      { ipa: "k", ex: "market, risk, work", vn: "Cuối từ bật nhẹ — 'risk' có /s/+/k/.", hard: true },
      { ipa: "g", ex: "growth, budget, big", vn: "Rung, cuối từ vẫn rõ." },
      { ipa: "f", ex: "fiscal, reform, staff", vn: "Răng trên chạm môi dưới, không rung." },
      { ipa: "h", ex: "high, however, household", vn: "Thổi hơi nhẹ." },
      { ipa: "m", ex: "model, form, system", vn: "Khép môi." },
      { ipa: "n", ex: "nation, plan, common", vn: "Lưỡi chạm lợi." },
      { ipa: "ŋ", ex: "funding, planning, strong", vn: "'Ng' — không thêm /g/ thừa phía sau." },
      { ipa: "w", ex: "work, welfare, one", vn: "Chu môi rồi mở." },
      { ipa: "j", ex: "year, university, value", vn: "Như 'd' nhẹ trong 'da' giọng Nam." },
    ]},
  ];

  /* ---------------- MINIMAL PAIRS (cặp tối thiểu) ---------------- */
  // Mỗi bộ: âm đối lập + các cặp từ. Dùng cho nghe phân biệt & đọc.
  const MINIMAL_PAIRS = [
    { id: "i-long-short", a: "iː", b: "ɪ", title: "/iː/ dài — /ɪ/ ngắn",
      note: "Đọc sai làm đổi nghĩa: 'leave' (rời đi) ≠ 'live' (sống).",
      pairs: [["sheep","ship"],["leave","live"],["seat","sit"],["reach","rich"],["feel","fill"],["heat","hit"]] },
    { id: "th-t", a: "θ", b: "t", title: "/θ/ — /t/",
      note: "Lưỡi giữa hai hàm răng cho /θ/. 'three' ≠ 'tree'.",
      pairs: [["three","tree"],["thin","tin"],["thought","taught"],["math","mat"],["thank","tank"],["both","boat"]] },
    { id: "th-s", a: "θ", b: "s", title: "/θ/ — /s/",
      note: "'think' ≠ 'sink'. /θ/ thổi hơi qua lưỡi, /s/ qua răng.",
      pairs: [["think","sink"],["thing","sing"],["mouth","mouse"],["path","pass"],["worth","worse"],["theme","seem"]] },
    { id: "dh-d", a: "ð", b: "d", title: "/ð/ — /d/",
      note: "'they' ≠ 'day'. /ð/ lưỡi giữa răng và rung.",
      pairs: [["they","day"],["then","den"],["though","dough"],["there","dare"],["breathe","breed"],["worthy","wordy"]] },
    { id: "s-z-final", a: "s", b: "z", title: "/s/ — /z/ cuối từ",
      note: "Giữ RUNG cho /z/: 'price' ≠ 'prize', 'ice' ≠ 'eyes'.",
      pairs: [["price","prize"],["ice","eyes"],["race","raise"],["bus","buzz"],["place","plays"],["loose","lose"]] },
    { id: "final-drop", a: "…s", b: "—", title: "Âm cuối bị nuốt",
      note: "Người Việt hay bỏ âm cuối — đọc cả hai và giữ âm cuối rõ.",
      pairs: [["rice","rye"],["mice","my"],["cars","car"],["costs","cost"],["risks","risk"],["trends","trend"]] },
    { id: "sh-s", a: "ʃ", b: "s", title: "/ʃ/ — /s/",
      note: "'she' ≠ 'see'. /ʃ/ chu môi.",
      pairs: [["she","see"],["show","so"],["sheet","seat"],["shine","sign"],["shelf","self"],["shore","sore"]] },
    { id: "ch-sh", a: "tʃ", b: "ʃ", title: "/tʃ/ — /ʃ/",
      note: "'chair' ≠ 'share'. /tʃ/ bật hơi.",
      pairs: [["chair","share"],["watch","wash"],["chip","ship"],["cheap","sheep"],["catch","cash"],["choose","shoes"]] },
    { id: "u-long-short", a: "uː", b: "ʊ", title: "/uː/ dài — /ʊ/ ngắn",
      note: "'pool' ≠ 'pull', 'fool' ≠ 'full'.",
      pairs: [["pool","pull"],["fool","full"],["Luke","look"],["food","foot"],["suit","soot"],["cooed","could"]] },
    { id: "e-ae", a: "e", b: "æ", title: "/e/ — /æ/",
      note: "'men' ≠ 'man'. /æ/ mở miệng rộng hơn.",
      pairs: [["men","man"],["bed","bad"],["send","sand"],["guess","gas"],["pen","pan"],["lend","land"]] },
    { id: "l-n-final", a: "l", b: "n", title: "/l/ — /n/ cuối từ",
      note: "Cuối từ /l/ phải cong lưỡi: 'mail' ≠ 'main'.",
      pairs: [["mail","main"],["fill","fin"],["bell","Ben"],["coal","cone"],["hole","hone"],["tall","ton"]] },
    { id: "p-b-final", a: "p", b: "b", title: "/p/ — /b/ cuối từ",
      note: "'cap' ≠ 'cab' — /b/ rung nhẹ trước khi khép môi.",
      pairs: [["cap","cab"],["rope","robe"],["lap","lab"],["rip","rib"],["mop","mob"],["tap","tab"]] },
    { id: "t-d-final", a: "t", b: "d", title: "/t/ — /d/ cuối từ",
      note: "'seat' ≠ 'seed', 'write' ≠ 'ride'.",
      pairs: [["seat","seed"],["write","ride"],["bet","bed"],["sent","send"],["hat","had"],["coat","code"]] },
    { id: "k-g-final", a: "k", b: "g", title: "/k/ — /g/ cuối từ",
      note: "'back' ≠ 'bag', 'pick' ≠ 'pig'.",
      pairs: [["back","bag"],["pick","pig"],["duck","dug"],["lock","log"],["tack","tag"],["rack","rag"]] },
  ];

  /* ---------------- BỘ ĐỌC (drills) ---------------- */
  const DRILLS = [
    { id: "final-s", title: "Đuôi -s/-es (/s/, /z/, /ɪz/)",
      note: "costs=/s/ · firms=/z/ · increases=/ɪz/. Đọc rõ từng đuôi.",
      words: ["costs","firms","taxes","increases","indicates","prices","budgets","reforms","policies","analyses","outcomes","statistics"] },
    { id: "final-ed", title: "Đuôi -ed (/t/, /d/, /ɪd/)",
      note: "based=/t/ · reformed=/d/ · allocated=/ɪd/.",
      words: ["allocated","based","reformed","estimated","reduced","targeted","implemented","increased","managed","adopted","assessed","designed"] },
    { id: "clusters", title: "Cụm phụ âm",
      note: "Không chèn nguyên âm: 'strategy' không phải 'sờ-tra-te-gy'.",
      words: ["strategy","structure","spend","trends","costs","risks","strengths","implement","transcript","framework","project","district"] },
    { id: "stress", title: "Trọng âm từ dài",
      note: "Nhấn đúng âm tiết viết HOA — sai trọng âm là khó hiểu nhất.",
      words: ["eCOnomy","MAnagement","adminisTRAtion","deVElopment","sigNIficant","methoDOlogy","eVAluation","impleMENtation","organiZAtion","university","staTIStics","aCAdemic"] },
    { id: "core-200", title: "200 từ học thuật lõi (bài kiểm tra tháng 1)",
      note: "Bộ từ chấm điểm đầu ra tháng 1 — lấy từ nhóm từ vựng cấp 1.",
      fromVocabLevel: 1 },
  ];

  /* ---------------- 8 DẠNG CÂU HỎI PHẢN BIỆN ---------------- */
  // axes: gộp từ ngân hàng SEED.QUESTIONS (10 trục → 8 dạng)
  const DEFENSE_TYPES = [
    { id: "method", title: "Về phương pháp", icon: "🔬", axes: ["method"],
      frame: ["Restate: \"If I understand correctly, you are asking why I chose this method.\"",
              "Justify: nêu 2 lý do chọn phương pháp (phù hợp câu hỏi nghiên cứu + dữ liệu sẵn có).",
              "Acknowledge: thừa nhận phương pháp khác cũng khả thi, nêu lý do không chọn.",
              "Close: \"For these reasons, I believe this method fits my research question best.\""] },
    { id: "data", title: "Về dữ liệu", icon: "📊", axes: ["data"],
      frame: ["Source: nguồn dữ liệu, thời gian, cỡ mẫu.",
              "Quality: cách làm sạch, kiểm tra độ tin cậy.",
              "Limits: hạn chế của dữ liệu và cách xử lý.",
              "Close: \"The data are sufficient to answer the research question.\""] },
    { id: "novelty", title: "Về tính mới", icon: "✨", axes: ["novelty"],
      frame: ["Gap: các nghiên cứu trước dừng ở đâu.",
              "New: điểm mới của tôi (bối cảnh / dữ liệu / phương pháp / phát hiện).",
              "Evidence: dẫn 1 kết quả cụ thể chứng minh điểm mới.",
              "Close: \"This is the first study to … in the context of …\""] },
    { id: "limits", title: "Về hạn chế", icon: "⚠", axes: ["limits"],
      frame: ["Acknowledge: \"I acknowledge that limitation.\" — KHÔNG phòng thủ.",
              "Mitigate: đã làm gì để giảm ảnh hưởng.",
              "Impact: hạn chế KHÔNG làm thay đổi kết luận chính vì sao.",
              "Future: hạn chế này mở ra hướng nghiên cứu tiếp."] },
    { id: "practice", title: "Về ứng dụng thực tiễn", icon: "🏗", axes: ["policy", "apply"],
      frame: ["Who: ai dùng được kết quả (cơ quan, cấp nào).",
              "What: khuyến nghị cụ thể số 1, 2, 3.",
              "Feasible: tính khả thi trong nguồn lực hiện có.",
              "Close: \"The recommendations are actionable within the current framework.\""] },
    { id: "theory", title: "Về lý thuyết nền", icon: "🏛", axes: ["framework"],
      frame: ["Name: khung lý thuyết đã dùng và tác giả gốc.",
              "Why: vì sao phù hợp với bối cảnh nghiên cứu.",
              "Adapt: đã điều chỉnh gì cho bối cảnh Việt Nam.",
              "Alt: lý thuyết thay thế và lý do không chọn."] },
    { id: "contribution", title: "Về đóng góp", icon: "🎯", axes: ["findings", "urgency"],
      frame: ["Academic: đóng góp học thuật (lấp khoảng trống nào).",
              "Practical: đóng góp thực tiễn (chính sách, quản lý).",
              "Rank: đóng góp quan trọng nhất là gì.",
              "Close: \"My study makes three contributions. First…\""] },
    { id: "future", title: "Về hướng nghiên cứu tiếp", icon: "➡", axes: ["next"],
      frame: ["Direct: hướng mở rộng trực tiếp từ hạn chế.",
              "Broaden: mở rộng phạm vi / đối tượng / thời gian.",
              "Method: phương pháp mới có thể áp dụng.",
              "Close: \"That is a promising direction for future research.\""] },
  ];

  /* ---------------- CÂU XỬ LÝ TÌNH HUỐNG (rescue) ---------------- */
  // Lấy từ SEED.PHRASES (36 câu — TẤT CẢ có audio OmniVoice render sẵn).
  const RESCUE_CATS = {
    "Khi chưa nghe rõ / cần thời gian": "Xin nhắc lại · xin thời gian",
    "Khi không chắc / không có dữ liệu": "Khi không chắc / thiếu dữ liệu",
    "Đồng ý / phản biện lịch sự": "Bảo vệ quan điểm lịch sự",
    "Khép lại câu trả lời": "Khép lại câu trả lời",
  };
  function rescueGroups() {
    const out = [];
    if (typeof SEED !== "undefined" && SEED.PHRASES) {
      SEED.PHRASES.forEach((g) => {
        if (RESCUE_CATS[g.cat]) out.push({ cat: RESCUE_CATS[g.cat], items: g.items });
      });
    }
    if (!out.length) out.push({ cat: "Xin nhắc lại", items: [
      { en: "Could you please rephrase the question?", vi: "Thầy/cô có thể diễn đạt lại câu hỏi được không ạ?" },
      { en: "May I take a moment to think?", vi: "Cho tôi một chút để suy nghĩ được không ạ?" },
    ]});
    return out;
  }

  /* ---------------- THƯ VIỆN SHADOWING ---------------- */
  // Ưu tiên video NGƯỜI THẬT (chuẩn nhất). Câu mẫu dùng giọng
  // OmniVoice render sẵn (offline) khi có trong gói audio.
  const yt = (id) => "https://www.youtube-nocookie.com/embed/" + id + "?cc_load_policy=1&rel=0&enablejsapi=1";
  const SHADOW_LIB = {
    // theo giai đoạn 1..4
    videos: {
      1: [
        { id: "voa-econ", t: "VOA — Economics Report (đọc chậm 1/3)", y: "W7LiPCh5Zlw", src: "VOA Learning English",
          note: "DỄ NHẤT: người thật đọc chậm, rõ từng âm cuối — lý tưởng cho tháng 1–3.", mins: 5 },
        { id: "bbc-6min", t: "BBC 6 Minute English", y: "fcN0BXzK8bg", src: "BBC Learning English",
          note: "Hội thoại 2 người, tốc độ vừa, có phụ đề + giải thích từ vựng.", mins: 6 },
      ],
      2: [
        { id: "cc-econ1", t: "Crash Course Econ #1 — Intro to Economics", y: "3ez10ADR_gM", src: "CrashCourse",
          note: "Người thật nói tốc độ tự nhiên, phụ đề tốt — nền từ vựng chuyên ngành.", mins: 12 },
        { id: "cc-econ2", t: "Crash Course Econ #2 — Specialization & Trade", y: "NI9TLDIPVcs", src: "CrashCourse",
          note: "Luyện bắt ý chính + shadowing đoạn 30–60 giây.", mins: 9 },
      ],
      3: [
        { id: "cc-econ3", t: "Crash Course Econ #3 — Systems & Macro", y: "B43YEW2FvDs", src: "CrashCourse",
          note: "Shadowing đoạn dài 2–3 phút — bắt nhịp trọng âm câu của người bản xứ.", mins: 10 },
        { id: "cc-econ5", t: "Crash Course Econ #5 — Macroeconomics", y: "d8uTB5XorBw", src: "CrashCourse",
          note: "Tốc độ nhanh — kiểm soát tốc độ & ngắt nghỉ theo diễn giả.", mins: 11 },
      ],
      4: [
        { id: "ted-econ", t: "TED — Economics (chọn bài có phụ đề)", link: "https://www.ted.com/topics/economics", src: "TED",
          note: "Chọn 1 bài TED 10–15 phút; nhại cách diễn giả trả lời & dẫn dắt.", mins: 14 },
        { id: "lse-qa", t: "LSE Public Lectures — phần Q&A thật", link: "https://www.lse.ac.uk/Events", src: "LSE",
          note: "QUAN TRỌNG: nghe phần HỎI–ĐÁP thật để quen giọng đa dạng của giám khảo.", mins: 15 },
      ],
    },
  };

  // Câu mẫu shadowing theo giai đoạn — lấy từ SEED (câu ví dụ chuyên ngành
  // + kho câu thuyết trình/Q&A). TẤT CẢ đều có audio OmniVoice render sẵn.
  function phrasesByCat(cats, limit) {
    const out = [];
    if (typeof SEED !== "undefined" && SEED.PHRASES) {
      SEED.PHRASES.forEach((g) => { if (cats.indexOf(g.cat) >= 0) g.items.forEach((it) => out.push(it)); });
    }
    return out.slice(0, limit || 8);
  }
  function shadowSentences(stage) {
    if (stage === 1) {
      // câu ví dụ ngắn của từ vựng cấp 1 (xoay theo ngày để không lặp mãi)
      const pool = (typeof SEED !== "undefined" && SEED.VOCAB ? SEED.VOCAB : [])
        .filter((v) => (v.lvl || 2) === 1 && v.e && v.ev)
        .map((v) => ({ en: v.e, vi: v.ev }));
      if (!pool.length) return [];
      const day = Math.floor(Date.now() / 86400000);
      const start = (day * 6) % pool.length;
      const out = [];
      for (let i = 0; i < Math.min(6, pool.length); i++) out.push(pool[(start + i) % pool.length]);
      return out;
    }
    if (stage === 2) return phrasesByCat(["Mở đầu bài thuyết trình", "Chuyển ý (signposting)"]);
    if (stage === 3) return phrasesByCat(["Mô tả số liệu / hình", "Nhấn mạnh & kết luận", "Mời và mở phần hỏi đáp"]);
    return phrasesByCat(["Khi chưa nghe rõ / cần thời gian", "Khi không chắc / không có dữ liệu", "Đồng ý / phản biện lịch sự"]);
  }

  // Giọng đọc TTS đa dạng cho tháng 9 (nghe câu hỏi nhiều giọng)
  const ACCENT_HINTS = [
    { key: "en-US", label: "Giọng Mỹ" },
    { key: "en-GB", label: "Giọng Anh" },
    { key: "en-IN", label: "Giọng Ấn Độ" },
    { key: "en-AU", label: "Giọng Úc" },
  ];

  global.CONTENT = { PHONEMES, MINIMAL_PAIRS, DRILLS, DEFENSE_TYPES, rescueGroups, SHADOW_LIB, shadowSentences, ACCENT_HINTS, yt };
})(window);
