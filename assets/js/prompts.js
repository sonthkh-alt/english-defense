/* ============================================================
   prompts.js — Sinh PROMPT cho Gemini AI (hoặc AI chat bất kỳ)
   ------------------------------------------------------------
   Người học dùng Gemini làm giáo viên: app tạo sẵn prompt chứa
   đầy đủ ngữ cảnh (hồ sơ, vị trí trên lộ trình 12 tháng, số liệu
   tiến độ, đề tài luận văn) → sao chép → dán vào Gemini.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- Khối ngữ cảnh dùng chung ---------- */
  function ctx() {
    const s = Store.settings();
    const m = Store.currentMonth();
    const mo = ROADMAP.month(m);
    const stage = ROADMAP.stageOf(m);
    const dn = Store.dayNumber();
    const pron = Store.pronAvg(7);
    const sims = Store.sims();
    const lastSim = sims.length ? sims[sims.length - 1] : null;

    const lines = [
      "=== BỐI CẢNH NGƯỜI HỌC (đọc kỹ trước khi trả lời) ===",
      "- Nam, 42 tuổi, người Việt, quản lý khu vực hành chính công, tiến sĩ quản lý kinh tế.",
      "- Trình độ hiện tại: CEFR A2 (TOEIC ~350). Nghe kém, chưa nói được thành đoạn dài.",
      "- MỤC TIÊU 12 THÁNG: trình bày luận văn 25 phút bằng tiếng Anh + trả lời phản biện trực tiếp trước hội đồng khoa học nhà nước (đạt B2 nói–nghe trong chuyên ngành hẹp).",
      "- Chuyên ngành: quản lý kinh tế, hành chính công, chính sách công, chuyển đổi số khu vực công.",
      s.topic ? "- Đề tài luận văn: " + s.topic : null,
      "",
      "=== VỊ TRÍ TRÊN LỘ TRÌNH ===",
      "- Ngày thứ " + (dn || "chưa bắt đầu") + "/365 · Tháng " + m + "/12 · Giai đoạn " + stage.id + " (" + stage.name + ")",
      "- Trọng tâm tháng này: " + mo.title + " — " + mo.goal,
      "- Kế hoạch tuần trong tháng: " + mo.weeks.map((w, i) => "T" + (i + 1) + ": " + w).join(" · "),
      "- Đầu ra phải đạt cuối tháng: " + mo.output,
      "",
      "=== SỐ LIỆU TIẾN ĐỘ ===",
      "- Từ vựng đã thuộc: " + Store.masteredCount() + "/2000 (đang học " + Store.learningCount() + " từ, FSRS)",
      "- Chuỗi ngày học liên tục: " + Store.streak() + " ngày · Tổng " + Math.round(Store.totalMinutes() / 60) + " giờ",
      pron != null ? "- Điểm phát âm máy chấm 7 ngày: " + pron + "%" : "- Chưa có điểm phát âm tuần này",
      lastSim ? "- Mô phỏng bảo vệ gần nhất: " + lastSim.avg + "/10 (5 tiêu chí)" : "- Chưa chạy mô phỏng bảo vệ nào",
    ];
    return lines.filter((x) => x != null).join("\n");
  }

  const RULES =
    "=== QUY TẮC BẮT BUỘC KHI DẠY ===\n" +
    "1. Tiếng Anh của bạn phải ở mức CEFR B1, câu NGẮN, để người học theo kịp. Giải thích ngữ pháp/từ vựng bằng TIẾNG VIỆT.\n" +
    "2. Mỗi lượt chỉ hỏi MỘT câu hỏi. Chờ người học trả lời rồi mới tiếp.\n" +
    "3. Người học phải NÓI/GÕ tiếng Anh là chính — đừng nói thay họ.\n" +
    "4. Luôn khích lệ nhưng thẳng thắn. Bám sát chuyên ngành hành chính công/quản lý kinh tế, KHÔNG dạy tiếng Anh du lịch.\n" +
    "5. Kết mỗi lượt bằng một câu hỏi hoặc một việc cụ thể để người học làm tiếp.";

  /* ---------- Module 4: Luyện nói ---------- */
  function coach(modeId) {
    let role;
    if (modeId === "correct") {
      role =
        "=== VAI CỦA BẠN: GIÁO VIÊN SỬA LỖI (EAP Speaking Coach) ===\n" +
        "Tôi sẽ nói/gõ từng đoạn tiếng Anh. Với MỖI đoạn, bạn:\n" +
        "1) Phản hồi ngắn về nội dung (1 câu tiếng Anh đơn giản).\n" +
        "2) Liệt kê tối đa 3 lỗi, dạng: ✗ câu sai → ✓ câu đúng (giải thích ngắn bằng tiếng Việt).\n" +
        "3) Gợi ý MỘT cách diễn đạt trang trọng/học thuật hơn cho ý chính của tôi.\n" +
        "4) Hỏi tiếp một câu để tôi nói tiếp.\n" +
        "Bắt đầu: hãy hỏi tôi một câu về công việc hoặc nghiên cứu của tôi.";
    } else if (modeId === "committee") {
      role =
        "=== VAI CỦA BẠN: THÀNH VIÊN HỘI ĐỒNG PHẢN BIỆN ===\n" +
        "Bạn là giáo sư trong hội đồng chấm luận văn của tôi. Hãy:\n" +
        "1) Hỏi từng câu phản biện bằng tiếng Anh (xoay vòng 8 dạng: phương pháp, dữ liệu, tính mới, hạn chế, ứng dụng thực tiễn, lý thuyết nền, đóng góp, hướng nghiên cứu tiếp).\n" +
        "2) Sau mỗi câu trả lời của tôi: nhận xét 1 câu (tiếng Việt: trả lời đạt chưa, thiếu gì), rồi hỏi câu tiếp theo, khó dần.\n" +
        "3) Thỉnh thoảng hỏi vặn lại (follow-up) hoặc yêu cầu tôi làm rõ, như hội đồng thật.\n" +
        "4) Nếu tôi trả lời quá ngắn (<3 câu), yêu cầu tôi mở rộng theo khung: nhắc lại câu hỏi → 2 ý chính → kết.\n" +
        "Bắt đầu: chào tôi như trong buổi bảo vệ và hỏi câu đầu tiên (dễ) về đề tài của tôi.";
    } else {
      role =
        "=== VAI CỦA BẠN: BẠN HỘI THOẠI HỌC THUẬT ===\n" +
        "Trò chuyện tự nhiên bằng tiếng Anh về công việc và nghiên cứu của tôi.\n" +
        "1) Hỏi từng câu một về: công việc hằng ngày, đề tài nghiên cứu, chính sách công ở Việt Nam, chuyển đổi số.\n" +
        "2) Khi tôi nói sai, KHÔNG liệt kê lỗi — hãy nhắc lại ý của tôi bằng câu đúng (recast) rồi hỏi tiếp.\n" +
        "3) Thỉnh thoảng dạy tôi 1 collocation học thuật hữu ích liên quan điều tôi vừa nói (kèm nghĩa tiếng Việt).\n" +
        "Bắt đầu: hỏi tôi hôm nay muốn nói về chủ đề gì trong công việc.";
    }
    return ctx() + "\n\n" + role + "\n\n" + RULES;
  }

  /* ---------- Kế hoạch tuần (coach tổng) ---------- */
  function weekly() {
    return ctx() + "\n\n" +
      "=== VAI CỦA BẠN: HUẤN LUYỆN VIÊN LỘ TRÌNH ===\n" +
      "Dựa vào bối cảnh và số liệu trên, hãy:\n" +
      "1) Đánh giá ngắn (3–4 câu tiếng Việt): tôi đang đúng tiến độ chưa? Điểm yếu nhất là gì?\n" +
      "2) Lập kế hoạch 7 NGÀY TỚI: mỗi ngày 45–60 phút chia 2–3 phiên, ghi rõ từng phiên làm gì (ôn từ FSRS, phát âm, shadowing, nói, nghe câu hỏi) — bám đúng trọng tâm tuần của tháng hiện tại.\n" +
      "3) Cho tôi 1 bài tập nói ngay bây giờ (đề bài + 3 câu gợi ý mở đầu) đúng với đầu ra tháng này.\n" +
      "Trả lời bằng tiếng Việt, phần bài tập bằng tiếng Anh B1.";
  }

  /* ---------- Module 5: Mô phỏng bảo vệ ---------- */
  function defenseGen(count) {
    const s = Store.settings();
    return ctx() + "\n\n" +
      "=== TÓM TẮT LUẬN VĂN CỦA TÔI ===\n" +
      (s.topicSummary || "(Tôi sẽ dán tóm tắt luận văn ngay sau prompt này)") + "\n\n" +
      "=== VIỆC CẦN LÀM: MÔ PHỎNG BẢO VỆ ===\n" +
      "1) Đọc tóm tắt luận văn, sinh " + (count || 8) + " câu hỏi phản biện bằng tiếng Anh như hội đồng khoa học nhà nước Việt Nam thường hỏi, phủ đủ 8 dạng (phương pháp, dữ liệu, tính mới, hạn chế, ứng dụng, lý thuyết nền, đóng góp, hướng tiếp theo), độ khó tăng dần. Mỗi câu kèm bản dịch tiếng Việt.\n" +
      "2) Hỏi tôi TỪNG CÂU MỘT. Tôi sẽ trả lời bằng tiếng Anh (nói qua micro hoặc gõ). Đợi tôi trả lời xong mới sang câu sau.\n" +
      "3) Sau mỗi câu trả lời: chấm nhanh 1–10 và góp ý 2 câu tiếng Việt (thiếu ý gì, từ nào dùng chưa chuẩn học thuật), cho 1 câu mẫu hay hơn (tiếng Anh B1–B2) rồi mới hỏi tiếp.\n" +
      "4) Sau câu cuối: tổng kết theo 5 tiêu chí, mỗi tiêu chí 1–10 kèm nhận xét: NỘI DUNG · TRÔI CHẢY · PHÁT ÂM/DIỄN ĐẠT · TỪ VỰNG CHUYÊN NGÀNH · CHIẾN LƯỢC ỨNG XỬ, và 3 việc tôi cần cải thiện trước buổi tập sau.\n\n" + RULES;
  }

  // Chấm một phiên đã trả lời trong app (dán kèm transcript)
  function defenseScore(pairs) {
    const qa = (pairs || []).map((p, i) =>
      "Câu hỏi " + (i + 1) + ": " + p.q + "\nTrả lời của tôi (ghi từ nhận dạng giọng nói, có thể sai chính tả nhẹ): " + (p.a || "(không trả lời được)")).join("\n\n");
    return ctx() + "\n\n" +
      "=== TRANSCRIPT PHIÊN HỎI–ĐÁP VỪA LUYỆN ===\n" + qa + "\n\n" +
      "=== VIỆC CẦN LÀM: CHẤM ĐIỂM ===\n" +
      "1) Chấm 5 tiêu chí, mỗi tiêu chí 1–10 kèm 1–2 câu nhận xét tiếng Việt: NỘI DUNG · TRÔI CHẢY · PHÁT ÂM/DIỄN ĐẠT (ước lượng qua độ mạch lạc transcript) · TỪ VỰNG CHUYÊN NGÀNH · CHIẾN LƯỢC ỨNG XỬ (có nhắc lại câu hỏi, có cấu trúc, có xử lý khi bí không).\n" +
      "Chuẩn chấm: người học A2–B1; 5 = chấp nhận được ở trình độ này; 8+ = sẵn sàng bảo vệ.\n" +
      "2) Với TỪNG câu: viết lại một câu trả lời mẫu tốt hơn (tiếng Anh B1–B2, 4–6 câu) để tôi shadowing.\n" +
      "3) Chốt 3 việc cụ thể tôi cần luyện trong tuần tới.";
  }

  global.PROMPTS = { ctx, coach, weekly, defenseGen, defenseScore };
})(window);
