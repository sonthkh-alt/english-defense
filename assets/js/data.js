/* ============================================================
   data.js — Nội dung tĩnh của lộ trình (từ kế hoạch gốc)
   Không phụ thuộc localStorage. Chỉ đọc.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---- Các giai đoạn của lộ trình 12 tháng ---- */
  const PHASES = [
    {
      id: 0,
      name: "Khởi động & Chẩn đoán",
      months: "Tuần 1–2",
      monthStart: 0, monthEnd: 0.5,
      color: "sky",
      goals: [
        "Ghi âm nói 2 phút về công việc → mốc gốc để so sánh.",
        "Nắm các lỗi phát âm điển hình của người Việt.",
        "Thiết lập bộ công cụ AI + sổ tay thuật ngữ.",
      ],
      milestone: "File ghi âm gốc + 50 từ chuyên ngành cốt lõi.",
    },
    {
      id: 1,
      name: "Nền phát âm + NGHE mạnh + Từ vựng",
      months: "Tháng 1–3",
      monthStart: 0, monthEnd: 3,
      color: "brand",
      goals: [
        "Nghe (ưu tiên #1): mỗi ngày nghe có chủ đích; xen bài giảng kinh tế & đoạn hỏi–đáp ngắn.",
        "Phát âm: âm cuối, cụm phụ âm, trọng âm từ.",
        "Shadowing: nhại audio chuyên ngành hằng ngày.",
        "Từ vựng: 5 từ/ngày, dựng sổ tay thuật ngữ quản lý kinh tế.",
        "Nói: đọc to tài liệu; nói 5–7 câu về đề tài.",
      ],
      milestone: "Nghe hiểu ~50–60% bài giảng nhập môn; nói liền mạch 5–7 câu về lĩnh vực của mình.",
    },
    {
      id: 2,
      name: "Làm chủ bài thuyết trình + Nghe Q&A",
      months: "Tháng 4–6",
      monthStart: 3, monthEnd: 6,
      color: "violet",
      goals: [
        "Viết bản thảo bài thuyết trình đề tài bằng tiếng Anh (AI sửa cho dễ nói).",
        "Đọc to → ghi âm → sửa → lặp, tiến tới nói không cầm giấy từng phần.",
        "Nghe chuyển hướng sang Q&A: bắt ý câu hỏi hội thảo.",
        "Bắt đầu dựng ngân hàng câu hỏi.",
      ],
      milestone: "Trình bày trôi chảy 10–15 phút (còn nhìn dàn ý); nghe hiểu câu hỏi đơn giản.",
    },
    {
      id: 3,
      name: "Thuyết trình lưu loát + HỎI–ĐÁP trọng tâm",
      months: "Tháng 7–9",
      monthStart: 6, monthEnd: 9,
      color: "amber",
      goals: [
        "Thuộc và trình bày lưu loát, ít nhìn giấy, đúng thời lượng.",
        "Ngân hàng câu hỏi mở rộng 80–100 câu; luyện từ chuẩn bị → ứng biến.",
        "Mô phỏng hỏi–đáp với AI (voice) mỗi ngày.",
        "Thuộc lòng bộ câu cứu nguy đến mức phản xạ.",
      ],
      milestone: "Trả lời bình tĩnh, rõ ràng các câu đã lường trước; dùng được câu cứu nguy khi bí.",
    },
    {
      id: 4,
      name: "Mô phỏng bảo vệ toàn phần",
      months: "Tháng 10–12",
      monthStart: 9, monthEnd: 12,
      color: "accent",
      goals: [
        "Diễn tập bảo vệ đầy đủ: thuyết trình + hội đồng ảo hỏi câu hóc búa, bất ngờ.",
        "Ưu tiên mời người thật đóng vai giám khảo ít nhất 3–4 buổi.",
        "Xử lý câu chưa nghe rõ, kiểm soát thời gian, giảm run, ngôn ngữ cơ thể.",
      ],
      milestone: "Hoàn thành trọn vẹn ít nhất 2 buổi mô phỏng bảo vệ không 'đứng hình'.",
    },
  ];

  /* ---- Khung ngày mẫu (65 phút) — checklist mặc định hằng ngày ---- */
  const DAILY_BLOCKS = [
    { id: "listen", title: "Nghe có chủ đích", dur: 20, icon: "🎧", desc: "Bài giảng / đoạn Q&A chuyên ngành", cat: "listen" },
    { id: "shadow", title: "Shadowing + Phát âm", dur: 15, icon: "🗣", desc: "Nhại audio, luyện âm cuối / trọng âm", cat: "speak" },
    { id: "vocab", title: "Từ vựng", dur: 10, icon: "✎", desc: "5 từ mới + ôn từ cũ", cat: "vocab" },
    { id: "speak", title: "Nói về đề tài", dur: 15, icon: "💬", desc: "Nói về đề tài / (từ GĐ3) mock Q&A với AI", cat: "speak" },
    { id: "review", title: "Ôn nhanh", dur: 5, icon: "↻", desc: "Điểm lại từ & câu trong ngày", cat: "review" },
  ];

  /* ---- 10 trục câu hỏi bảo vệ ---- */
  const QUESTION_AXES = [
    { id: "urgency",   title: "Tính cấp thiết / Lý do chọn đề tài", en: "Why is this topic important now?", icon: "🔥" },
    { id: "novelty",   title: "Tính mới / Đóng góp", en: "What is new compared to previous studies?", icon: "✨" },
    { id: "framework", title: "Khung lý thuyết", en: "Which theoretical framework did you use, and why?", icon: "🏛" },
    { id: "method",    title: "Phương pháp nghiên cứu", en: "Why did you choose this method?", icon: "🔬" },
    { id: "data",      title: "Dữ liệu & Độ tin cậy", en: "Where is your data from? Sample size? Reliability?", icon: "📊" },
    { id: "findings",  title: "Kết quả chính", en: "What are your key findings?", icon: "🎯" },
    { id: "limits",    title: "Hạn chế", en: "What are the limitations of your study?", icon: "⚠" },
    { id: "policy",    title: "Đóng góp thực tiễn / Khuyến nghị chính sách", en: "What are the policy implications?", icon: "🏗" },
    { id: "apply",     title: "Khả năng ứng dụng & Nhân rộng", en: "Can this be applied elsewhere?", icon: "🌐" },
    { id: "next",      title: "Hướng nghiên cứu tiếp theo", en: "What are the next steps?", icon: "➡" },
  ];

  /* ---- Bộ câu cứu nguy ---- */
  const RESCUE_PHRASES = [
    { en: "Could you please rephrase the question?", vi: "Xin thầy/cô nhắc lại câu hỏi được không ạ?" },
    { en: "If I understand correctly, you are asking about…", vi: "Nếu tôi hiểu đúng, thầy/cô đang hỏi về…" },
    { en: "May I take a moment to think?", vi: "Cho tôi một chút để suy nghĩ." },
    { en: "That is an interesting point. Let me address it in two parts.", vi: "Đây là điểm thú vị. Tôi xin trả lời làm hai ý." },
    { en: "I would like to clarify what you mean by…", vi: "Tôi muốn làm rõ ý thầy/cô về…" },
  ];

  /* ---- Bộ công cụ AI ---- */
  const AI_TOOLS = [
    { purpose: "Tạo audio mẫu để shadowing", how: "TTS đọc bản thảo của bạn, giọng chuẩn, tốc độ chậm → nhại theo.", icon: "🔊" },
    { purpose: "Kiểm tra phát âm có dễ hiểu không", how: "Nói vào speech-to-text; nếu gõ sai từ → chỗ đó chưa rõ. Khách quan.", icon: "🎙" },
    { purpose: "Sửa văn nói", how: "AI viết lại bản thảo thành câu ngắn, dễ đọc miệng, đúng văn phong học thuật.", icon: "✍" },
    { purpose: "Sinh ngân hàng câu hỏi", how: "\"Đóng vai hội đồng giáo sư kinh tế, đặt câu hỏi phản biện cho đề tài [X] bằng tiếng Anh.\"", icon: "❓" },
    { purpose: "Hội đồng ảo (voice)", how: "Chế độ hội thoại giọng nói: AI hỏi tiếng Anh, bạn trả lời trực tiếp, AI chấm & sửa.", icon: "🎭" },
    { purpose: "Luyện nghe câu hỏi", how: "Nhờ AI đọc to từng câu hỏi ở nhiều tốc độ / giọng để tập bắt ý.", icon: "👂" },
  ];

  /* ---- Kế hoạch tuần 1 chi tiết ---- */
  const WEEK1 = [
    { day: "Thứ 2", theme: "Chẩn đoán", total: 65, tasks: [
      { dur: 15, text: "Ghi âm 2 phút nói về công việc → LƯU làm mốc gốc." },
      { dur: 15, text: "Nhờ AI chỉ ra 3 điểm yếu lớn nhất." },
      { dur: 20, text: "Nghe 1 video kinh tế nhập môn (~5'), lần 1 có phụ đề, lần 2 không." },
      { dur: 15, text: "Lập sổ tay: 10 từ chuyên ngành cốt lõi." },
    ]},
    { day: "Thứ 3", theme: "Phát âm âm cuối + nghe", total: 70, tasks: [
      { dur: 25, text: "Luyện âm cuối bị nuốt: -s, -t, -d, -k, -th (20 cặp từ, đọc to)." },
      { dur: 20, text: "Nghe lại video hôm qua, chép 3 câu nghe được." },
      { dur: 15, text: "Shadowing 1 đoạn 1 phút, nhại 5 lần." },
      { dur: 10, text: "5 từ mới + đặt câu." },
    ]},
    { day: "Thứ 4", theme: "Nghe câu hỏi", total: 70, tasks: [
      { dur: 25, text: "Nghe 1 đoạn Q&A hội thảo ngắn (nhờ AI đọc 5 câu hỏi mẫu, nhiều tốc độ)." },
      { dur: 20, text: "Tập bắt ý mỗi câu hỏi, viết lại bằng tiếng Việt." },
      { dur: 15, text: "Shadowing." },
      { dur: 10, text: "5 từ mới." },
    ]},
    { day: "Thứ 5", theme: "Nói về đề tài", total: 70, tasks: [
      { dur: 20, text: "Viết 6 câu tiếng Anh mô tả đề tài (AI sửa cho dễ nói)." },
      { dur: 20, text: "Đọc to, ghi âm, nghe lại, sửa." },
      { dur: 20, text: "Nghe có chủ đích 1 đoạn mới." },
      { dur: 10, text: "Ôn từ tuần." },
    ]},
    { day: "Thứ 6", theme: "Trọng âm & ngữ điệu", total: 70, tasks: [
      { dur: 20, text: "Trọng âm từ dài: e-CO-no-my, ma-na-GE-ment, ad-mi-ni-STRA-tion." },
      { dur: 20, text: "Nghe + shadowing đoạn quen, so với đầu tuần." },
      { dur: 20, text: "Học thuộc 3 câu cứu nguy đầu tiên." },
      { dur: 10, text: "5 từ mới." },
    ]},
    { day: "Thứ 7", theme: "Thực chiến với AI", total: 75, tasks: [
      { dur: 30, text: "Voice mode với AI: nói về công việc, để AI hỏi lại 4–5 câu đơn giản bằng tiếng Anh." },
      { dur: 20, text: "Nghe lại, nhờ AI nhận xét." },
      { dur: 15, text: "Dùng thử 1 câu cứu nguy khi bí." },
      { dur: 10, text: "Ôn từ." },
    ]},
    { day: "Chủ nhật", theme: "Nghỉ chủ động + tổng kết", total: 20, tasks: [
      { dur: 10, text: "Nghe nhẹ 1 audio đã quen, không học mới." },
      { dur: 5, text: "Ghi nhật ký: tuần làm được gì, chỗ nào khó nhất." },
      { dur: 5, text: "Đối chiếu quỹ giờ: có ngày nào hụt cần bù tuần sau không." },
    ]},
  ];

  /* ---- Nguyên tắc cốt lõi ---- */
  const PRINCIPLES = [
    { icon: "🎯", title: "Học hẹp, không học rộng", text: "Mọi thứ xoay quanh đề tài + tình huống bảo vệ. Bỏ qua tiếng Anh đời sống." },
    { icon: "💡", title: "\"Được hiểu\" hơn \"nói hay\"", text: "Rõ ràng, dễ hiểu là đủ; không cần giọng bản xứ." },
    { icon: "🔁", title: "Nghe & nói mỗi ngày", text: "Ngay từ ngày đầu tiên, không trì hoãn." },
    { icon: "🔥", title: "Không ngày nào bằng không", text: "Ngày bận: tối thiểu 10' lõi. Ngày rảnh: học bù." },
    { icon: "🤖", title: "Tận dụng tối đa AI", text: "Audio mẫu, chấm phát âm, sinh câu hỏi, hội đồng ảo." },
  ];

  /* ---- Chỉ số đo tiến bộ ---- */
  const PROGRESS_METRICS = [
    { period: "Hằng tuần", text: "Ghi âm 1 phút nói về đề tài, so với tuần trước.", icon: "📅" },
    { period: "Hằng tháng", text: "Nói lại đúng chủ đề '2 phút giới thiệu công việc' của tuần 1 → nghe rõ tiến bộ.", icon: "🗓" },
    { period: "Chỉ số NGHE", text: "% câu hỏi bắt được ý đúng ngay lần nghe đầu.", icon: "👂" },
    { period: "Chỉ số NÓI", text: "% speech-to-text gõ đúng lời bạn.", icon: "🎙" },
  ];

  /* ---- Rủi ro & phương án ---- */
  const RISKS = [
    { risk: "Nghe không kịp câu hỏi (rủi ro #1)", plan: "Dồn nhiều công nhất vào nghe + ngân hàng câu hỏi + câu cứu nguy." },
    { risk: "Mốc 12 tháng cố định — không có tháng 'trôi'", plan: "Nếu cuối tháng 6 nghe hiểu câu hỏi còn dưới ~50%, cân nhắc thuê gia sư người thật chuyên hỏi–đáp cho 3–4 tháng cuối." },
    { risk: "Ngày quá bận", plan: "Giữ tối thiểu 10' lõi; ngày rảnh học bù — đã tính sẵn trong cơ chế." },
  ];

  global.APP_DATA = {
    PHASES, DAILY_BLOCKS, QUESTION_AXES, RESCUE_PHRASES,
    AI_TOOLS, WEEK1, PRINCIPLES, PROGRESS_METRICS, RISKS,
    META: {
      start: "~IELTS 3.5 (nghe–đọc hiểu cơ bản, nói còn yếu)",
      goal: "Thuyết trình VÀ hỏi–đáp hoàn toàn bằng tiếng Anh trước hội đồng, đề tài quản lý kinh tế",
      budget: "60–75 phút/buổi sáng sớm · 6 ngày/tuần",
      constraint: "Mốc 12 tháng CỐ ĐỊNH — không có đường lui song ngữ ở phần vấn đáp",
      totalDays: 365,
    },
  };
})(window);
