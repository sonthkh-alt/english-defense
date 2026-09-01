/* ============================================================
   roadmap.js — LỘ TRÌNH 12 THÁNG (theo đặc tả EAP)
   ------------------------------------------------------------
   Mục tiêu cuối: trình bày luận văn 25 phút + trả lời phản biện
   trực tiếp bằng tiếng Anh trước hội đồng (CEFR B2 nói–nghe
   trong phạm vi chuyên ngành hẹp).
   Mỗi tháng: mục tiêu, trọng tâm từng tuần, bài kiểm tra đầu ra,
   và cấu phần buổi học hằng ngày (interleaving).
   ============================================================ */
(function (global) {
  "use strict";

  const STAGES = [
    { id: 1, name: "Nền móng", months: [1, 2, 3], color: "brand",
      desc: "Phát âm 44 âm, nghe nền tảng, 1.200 từ AWL, ngữ pháp học thuật thiết yếu." },
    { id: 2, name: "Chuyên ngành", months: [4, 5, 6], color: "violet",
      desc: "800 từ chuyên ngành + phương pháp nghiên cứu, ngôn ngữ diễn ngôn học thuật." },
    { id: 3, name: "Trình bày", months: [7, 8, 9], color: "amber",
      desc: "Xây và hoàn thiện bài thuyết trình 25 phút, nghe hiểu câu hỏi đa giọng." },
    { id: 4, name: "Phản biện", months: [10, 11, 12], color: "rose",
      desc: "8 dạng câu hỏi hội đồng, trả lời câu hỏi bất ngờ, mô phỏng toàn phần." },
  ];

  // mix: tỷ trọng gợi ý cho "việc hôm nay" — các module xen kẽ trong 1 buổi
  const MONTHS = [
    { m: 1, stage: 1, title: "Phát âm & nghe nền tảng",
      goal: "Nắm 44 âm tiếng Anh, sửa các âm người Việt hay sai (/θ/ /ð/, âm cuối, cụm phụ âm), trọng âm từ & câu.",
      weeks: [
        "Nguyên âm đơn + minimal pairs /iː–ɪ/, /uː–ʊ/; ghi âm mốc gốc (baseline)",
        "Phụ âm khó: /θ/ /ð/ /z/ /s/; âm cuối -s/-t/-d/-k",
        "Cụm phụ âm đầu & cuối; đuôi -ed, -s",
        "Trọng âm từ dài + trọng âm câu; tổng ôn 44 âm",
      ],
      output: "Đọc đúng 200 từ học thuật cơ bản — máy chấm phát âm đạt ≥ 75%.",
      outputTest: { type: "pron", target: 75, n: 20, label: "Đọc 20 từ ngẫu nhiên từ bộ 200 từ, điểm nhận dạng ≥ 75%" },
      mix: { pron: 3, vocab: 2, shadow: 1 },
      newPerDay: 8, vocabLevels: [1] },

    { m: 2, stage: 1, title: "600 từ AWL (sublist 1–5) + mẫu câu học thuật",
      goal: "Từ vựng học thuật lõi + 30 mẫu câu cơ bản. Bắt đầu shadowing câu ngắn 10–15 giây. Từ tháng này, buổi nào cũng phải NÓI ra tiếng.",
      weeks: [
        "AWL nhóm 1 + mẫu câu giới thiệu bản thân",
        "AWL nhóm 2 + mẫu câu mô tả công việc",
        "AWL nhóm 3 + shadowing câu 10–15 giây",
        "Ôn tổng + nói 10 câu tự giới thiệu (ghi âm)",
      ],
      output: "Nói được 10 câu tự giới thiệu bản thân và lĩnh vực nghiên cứu.",
      outputTest: { type: "speak", minutes: 1.5, label: "Ghi âm 10 câu tự giới thiệu — nghe lại và tự đối chiếu mẫu" },
      mix: { vocab: 3, pron: 1, shadow: 1, speak: 1 },
      newPerDay: 12, vocabLevels: [1, 2] },

    { m: 3, stage: 1, title: "600 từ AWL (sublist 6–10) + ngữ pháp học thuật",
      goal: "Hoàn thành 1.200 từ AWL. Ngữ pháp văn phong học thuật: hiện tại đơn/hoàn thành, bị động, mệnh đề quan hệ, so sánh, điều kiện.",
      weeks: [
        "AWL nhóm 4 + thì trong mô tả nghiên cứu",
        "AWL nhóm 5 + câu bị động (\"The data were collected…\")",
        "AWL nhóm 6 + mệnh đề quan hệ & so sánh",
        "Câu điều kiện + nói 2 phút về đề tài (ghi âm)",
      ],
      output: "Nói liên tục 2 phút về đề tài nghiên cứu.",
      outputTest: { type: "speak", minutes: 2, label: "Ghi âm nói liên tục 2 phút về đề tài — không quá 5 lần dừng dài" },
      mix: { vocab: 3, shadow: 1, speak: 2 },
      newPerDay: 12, vocabLevels: [1, 2] },

    { m: 4, stage: 2, title: "400 từ chuyên ngành QLKT & hành chính công",
      goal: "Public administration, governance, fiscal decentralization, policy implementation, digital transformation… Nghe bài giảng học thuật có phụ đề.",
      weeks: [
        "Quản trị công & bộ máy (governance, accountability…)",
        "Tài khóa & phân cấp (fiscal decentralization, budget…)",
        "Cải cách & chuyển đổi số (administrative reform, e-government…)",
        "Đánh giá hiệu quả (performance evaluation, KPI…) + kiểm tra nghe",
      ],
      output: "Nghe hiểu 60% một bài giảng 10 phút.",
      outputTest: { type: "listen", target: 60, label: "Nghe bài giảng 10 phút trong thư viện Shadowing, tự chấm % hiểu ≥ 60%" },
      mix: { vocab: 3, shadow: 2, speak: 1 },
      newPerDay: 14, vocabLevels: [1, 2, 3] },

    { m: 5, stage: 2, title: "400 từ phương pháp nghiên cứu",
      goal: "Methodology, sampling, regression, correlation, validity, reliability, qualitative/quantitative… Shadowing đoạn 30–60 giây.",
      weeks: [
        "Thiết kế nghiên cứu & chọn mẫu",
        "Thống kê mô tả & tương quan",
        "Hồi quy & kiểm định",
        "Độ tin cậy/giá trị + mô tả phương pháp của mình 3 phút",
      ],
      output: "Mô tả được phương pháp nghiên cứu của mình trong 3 phút.",
      outputTest: { type: "speak", minutes: 3, label: "Ghi âm 3 phút mô tả phương pháp — dùng ≥ 10 thuật ngữ chuyên ngành" },
      mix: { vocab: 3, shadow: 2, speak: 1 },
      newPerDay: 14, vocabLevels: [1, 2, 3, 4] },

    { m: 6, stage: 2, title: "Ngôn ngữ diễn ngôn học thuật",
      goal: "Mở đầu, chuyển ý (signposting), dẫn số liệu, mô tả biểu đồ, nêu hạn chế, kết luận, đề xuất.",
      weeks: [
        "Mở đầu & giới thiệu cấu trúc bài",
        "Chuyển ý + dẫn số liệu, mô tả biểu đồ",
        "Nêu hạn chế + kết luận + đề xuất",
        "Ghép lại: trình bày 5 phút phần mở đầu luận văn",
      ],
      output: "Trình bày 5 phút phần mở đầu luận văn.",
      outputTest: { type: "speak", minutes: 5, label: "Ghi âm 5 phút phần mở đầu — có đủ: bối cảnh, mục tiêu, cấu trúc" },
      mix: { vocab: 2, shadow: 2, speak: 2 },
      newPerDay: 10, vocabLevels: [1, 2, 3, 4] },

    { m: 7, stage: 3, title: "Xây dựng bài thuyết trình",
      goal: "Chia luận văn 6 phần, mỗi tuần hoàn thiện & luyện nói 1–2 phần. Shadowing đoạn dài 2–3 phút.",
      weeks: [
        "Phần 1–2: Mở đầu + Tổng quan (viết & luyện nói)",
        "Phần 3: Phương pháp",
        "Phần 4: Kết quả",
        "Ôn 3 phần đầu — nói trôi chảy không nhìn kịch bản",
      ],
      output: "Nói trôi chảy 3 phần đầu của bài thuyết trình.",
      outputTest: { type: "speak", minutes: 10, label: "Ghi âm 3 phần đầu (~10 phút) — chỉ nhìn slide, không đọc kịch bản" },
      mix: { speak: 3, shadow: 2, vocab: 1 },
      newPerDay: 8, vocabLevels: [1, 2, 3, 4] },

    { m: 8, stage: 3, title: "Hoàn thiện toàn bài 25 phút",
      goal: "Nói không nhìn kịch bản, chỉ nhìn slide. Kiểm soát tốc độ, ngắt nghỉ, nhấn trọng âm câu.",
      weeks: [
        "Phần 5: Thảo luận + Phần 6: Kết luận",
        "Ghép toàn bài — chạy thử lần 1 (có bấm giờ)",
        "Sửa các đoạn vấp; luyện ngắt nghỉ & tốc độ",
        "Chạy toàn bài 25 phút — tối đa 5 lần vấp",
      ],
      output: "Nói toàn bài 25 phút, tối đa 5 lần vấp.",
      outputTest: { type: "speak", minutes: 25, label: "Ghi âm toàn bài 25 phút — đếm số lần vấp ≤ 5" },
      mix: { speak: 4, shadow: 1, vocab: 1 },
      newPerDay: 6, vocabLevels: [1, 2, 3, 4] },

    { m: 9, stage: 3, title: "Nghe hiểu câu hỏi phản biện",
      goal: "Luyện nghe câu hỏi với nhiều giọng (Anh, Mỹ, Ấn, Việt, Nhật), nhiều tốc độ. Mẫu câu xử lý tình huống: xin nhắc lại, xin làm rõ, xin thời gian.",
      weeks: [
        "Nghe câu hỏi giọng chuẩn (chậm → nhanh)",
        "Nghe giọng không chuẩn + câu cứu nguy",
        "Nghe & chép lại câu hỏi (dictation)",
        "Kiểm tra: nghe 20 câu hỏi, hiểu đúng ≥ 80%",
      ],
      output: "Nghe hiểu chính xác 80% câu hỏi phản biện.",
      outputTest: { type: "listen", target: 80, label: "Bài nghe 20 câu hỏi trong Mô phỏng — chọn đúng ý chính ≥ 16/20" },
      mix: { listen: 3, speak: 2, vocab: 1 },
      newPerDay: 6, vocabLevels: [1, 2, 3, 4] },

    { m: 10, stage: 4, title: "Cấu trúc trả lời phản biện",
      goal: "8 dạng câu hỏi hội đồng (phương pháp, dữ liệu, tính mới, hạn chế, ứng dụng, lý thuyết nền, đóng góp, hướng tiếp theo) — mỗi dạng một khung trả lời.",
      weeks: [
        "Dạng 1–2: Phương pháp + Dữ liệu",
        "Dạng 3–4: Tính mới + Hạn chế",
        "Dạng 5–6: Ứng dụng + Lý thuyết nền",
        "Dạng 7–8: Đóng góp + Hướng tiếp theo — trả lời 20 câu chuẩn bị trước",
      ],
      output: "Trả lời được 20 câu hỏi chuẩn bị trước.",
      outputTest: { type: "defense", n: 20, label: "Trong Mô phỏng: trả lời 20 câu từ ngân hàng — tự đánh dấu đạt" },
      mix: { speak: 3, listen: 2, vocab: 1 },
      newPerDay: 5, vocabLevels: [1, 2, 3, 4] },

    { m: 11, stage: 4, title: "Trả lời câu hỏi bất ngờ",
      goal: "AI sinh câu hỏi phản biện ngẫu nhiên từ tóm tắt luận văn — trả lời ngay không chuẩn bị, 2–4 phút/câu.",
      weeks: [
        "Câu hỏi bất ngờ mức dễ (2 phút/câu)",
        "Mức trung bình (3 phút/câu)",
        "Mức khó + câu hỏi kép",
        "Chạy chuỗi 8 câu liên tiếp không nghỉ",
      ],
      output: "Trả lời 2–4 phút cho câu hỏi chưa từng thấy.",
      outputTest: { type: "defense", n: 8, label: "Phiên hỏi bất ngờ 8 câu với AI — điểm trung bình ≥ 6/10" },
      mix: { speak: 4, listen: 1, vocab: 1 },
      newPerDay: 4, vocabLevels: [1, 2, 3, 4] },

    { m: 12, stage: 4, title: "Mô phỏng toàn phần",
      goal: "Mỗi tuần 1 buổi bảo vệ giả lập đầy đủ: trình bày 25 phút + 8–10 câu phản biện + phản hồi chi tiết.",
      weeks: [
        "Mô phỏng lần 1 + phân tích phản hồi",
        "Mô phỏng lần 2 — sửa 3 điểm yếu nhất",
        "Mô phỏng lần 3 — tăng độ khó câu hỏi",
        "Mô phỏng lần 4 — tổng duyệt cuối cùng",
      ],
      output: "Hoàn thành 4 buổi mô phỏng đạt chuẩn.",
      outputTest: { type: "defense", n: 4, label: "4 phiên mô phỏng đầy đủ, điểm trung bình ≥ 7/10" },
      mix: { speak: 3, listen: 2, vocab: 1 },
      newPerDay: 3, vocabLevels: [1, 2, 3, 4] },
  ];

  // Nhãn tiếng Việt cho các cấu phần buổi học
  const MIX_LABELS = {
    vocab: { label: "Từ vựng (FSRS)", icon: "✎", route: "vocab" },
    pron: { label: "Phát âm", icon: "🎙", route: "pron" },
    shadow: { label: "Shadowing", icon: "🗣", route: "shadow" },
    speak: { label: "Nói với AI / ghi âm", icon: "✦", route: "coach" },
    listen: { label: "Nghe câu hỏi", icon: "👂", route: "defense" },
  };

  function monthOf(dayNumber) {
    if (dayNumber == null) return 1;
    return Math.min(12, Math.max(1, Math.ceil(dayNumber / 30.4)));
  }
  function month(m) { return MONTHS[Math.min(12, Math.max(1, m)) - 1]; }
  function stageOf(m) { return STAGES[month(m).stage - 1]; }

  global.ROADMAP = { STAGES, MONTHS, MIX_LABELS, monthOf, month, stageOf };
})(window);
