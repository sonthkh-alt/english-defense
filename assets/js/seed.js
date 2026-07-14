/* ============================================================
   seed.js — GÓI KHỞI ĐỘNG THÁNG 1 (dữ liệu học sẵn)
   ------------------------------------------------------------
   Nguồn tham chiếu (uy tín học thuật):
   • Academic Word List — Averil Coxhead (2000), Victoria University
     of Wellington. https://www.wgtn.ac.nz/lals/resources/academicwordlist
   • EAP Foundation — AWL. https://www.eapfoundation.com/vocab/academic/awllists/
   • IMF Terminology / Glossary (17,000+ entries).
     https://www.imf.org/en/About/Terminology
   • OECD Glossary of Statistical Terms. https://stats.oecd.org/glossary/
   • World Bank Open Knowledge Repository. https://openknowledge.worldbank.org/
   • Câu hỏi bảo vệ: tổng hợp từ hướng dẫn viva/oral-defense của các
     trường (SUBR Graduate School, Grad Coach, BeMo, eloquentscience).
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- Nguồn trích dẫn (hiển thị ở trang Tài nguyên) ---------- */
  const SOURCES = {
    listening: [
      { name: "MIT OpenCourseWare — Economics", url: "https://ocw.mit.edu/courses/economics/", note: "Bài giảng kinh tế đầy đủ của MIT, có video + ghi chú. Nghe bài giảng học thuật thật." },
      { name: "MIT OpenCourseWare — YouTube", url: "https://www.youtube.com/@mitocw", note: "Có phụ đề & chỉnh tốc độ — lý tưởng để shadowing." },
      { name: "Open Yale Courses — Economics", url: "https://oyc.yale.edu/economics", note: "Financial Markets (R. Shiller), Game Theory (B. Polak). Có transcript." },
      { name: "LSE — Public Lectures & Events", url: "https://www.lse.ac.uk/Events", note: "Hội thảo kinh tế/quản lý + phần HỎI–ĐÁP thật (Q&A) để luyện nghe câu hỏi." },
      { name: "TED — Economics", url: "https://www.ted.com/topics/economics", note: "Phụ đề song ngữ, chỉnh tốc độ, độ dài ngắn — hợp giai đoạn đầu." },
      { name: "British Council — LearnEnglish Listening", url: "https://learnenglish.britishcouncil.org/skills/listening", note: "Bài nghe phân theo trình độ, có transcript & bài tập." },
      { name: "edX — Economics", url: "https://www.edx.org/learn/economics", note: "Khoá học từ đại học top, nhiều bài có phụ đề & transcript." },
      { name: "Coursera — Economics", url: "https://www.coursera.org/browse/social-sciences/economics", note: "Khoá nhập môn kinh tế, giọng chuẩn, tốc độ vừa phải." },
    ],
    terminology: [
      { name: "IMF Terminology & Glossary", url: "https://www.imf.org/en/About/Terminology", note: "Chuẩn thuật ngữ tài chính – kinh tế, có bản dịch nhiều thứ tiếng." },
      { name: "OECD Glossary of Statistical Terms", url: "https://stats.oecd.org/glossary/", note: "Định nghĩa chuẩn cho chỉ tiêu & khái niệm kinh tế – thống kê." },
      { name: "World Bank Open Knowledge Repository", url: "https://openknowledge.worldbank.org/", note: "Báo cáo & thuật ngữ quản lý công, phát triển, đánh giá chính sách." },
    ],
    vocabulary: [
      { name: "Academic Word List (Coxhead, 2000)", url: "https://www.wgtn.ac.nz/lals/resources/academicwordlist", note: "570 họ từ học thuật thường gặp — nền của bộ từ vựng gói này." },
      { name: "EAP Foundation — Academic Vocabulary", url: "https://www.eapfoundation.com/vocab/academic/awllists/", note: "AWL chia 10 sublist + bài tập tra cứu." },
    ],
  };

  /* ---------- TỪ VỰNG THÁNG 1 (≈120 từ) ----------
     3 nhóm: (A) Học thuật/nghiên cứu · (B) Kinh tế cốt lõi ·
             (C) Quản lý – quản trị công.
     Cấu trúc: t=term, p=pos, m=nghĩa, e=ví dụ.  */
  const VOCAB = [
    // --- (A) Từ học thuật / nghiên cứu (nền AWL) ---
    { t: "analyze", p: "v.", m: "phân tích", e: "We analyze the data to identify key trends." },
    { t: "approach", p: "n.", m: "cách tiếp cận", e: "This study adopts a quantitative approach." },
    { t: "assess", p: "v.", m: "đánh giá", e: "The model assesses the impact of the policy." },
    { t: "assume", p: "v.", m: "giả định", e: "We assume that markets are competitive." },
    { t: "concept", p: "n.", m: "khái niệm", e: "The core concept of the thesis is efficiency." },
    { t: "conduct", p: "v.", m: "tiến hành", e: "We conducted a survey of 300 firms." },
    { t: "constitute", p: "v.", m: "cấu thành, tạo nên", e: "These factors constitute the framework." },
    { t: "context", p: "n.", m: "bối cảnh", e: "In the context of a developing economy…" },
    { t: "criteria", p: "n.", m: "tiêu chí", e: "The projects were ranked by three criteria." },
    { t: "derive", p: "v.", m: "rút ra, suy ra", e: "We derive the results from the model." },
    { t: "empirical", p: "adj.", m: "thực nghiệm, dựa trên dữ liệu", e: "The claim is supported by empirical evidence." },
    { t: "evaluate", p: "v.", m: "đánh giá", e: "We evaluate the effectiveness of the reform." },
    { t: "evidence", p: "n.", m: "bằng chứng", e: "There is strong evidence of a positive effect." },
    { t: "framework", p: "n.", m: "khung (lý thuyết)", e: "The theoretical framework guides the analysis." },
    { t: "hypothesis", p: "n.", m: "giả thuyết", e: "The main hypothesis is confirmed by the data." },
    { t: "implication", p: "n.", m: "hàm ý, hệ quả", e: "The findings have clear policy implications." },
    { t: "indicate", p: "v.", m: "cho thấy, chỉ ra", e: "The results indicate a significant relationship." },
    { t: "interpret", p: "v.", m: "diễn giải", e: "We interpret the coefficient as an elasticity." },
    { t: "methodology", p: "n.", m: "phương pháp luận", e: "The methodology combines surveys and interviews." },
    { t: "objective", p: "n.", m: "mục tiêu", e: "The main objective is to reduce inefficiency." },
    { t: "parameter", p: "n.", m: "tham số", e: "We estimate the parameters of the model." },
    { t: "phenomenon", p: "n.", m: "hiện tượng", e: "This phenomenon is common in emerging markets." },
    { t: "qualitative", p: "adj.", m: "định tính", e: "We use qualitative interviews for depth." },
    { t: "quantitative", p: "adj.", m: "định lượng", e: "The quantitative results are robust." },
    { t: "robust", p: "adj.", m: "vững chắc, đáng tin", e: "The findings are robust to different specifications." },
    { t: "significant", p: "adj.", m: "có ý nghĩa (thống kê)", e: "The effect is statistically significant." },
    { t: "valid", p: "adj.", m: "có giá trị, hợp lệ", e: "The instrument is valid and reliable." },
    { t: "variable", p: "n.", m: "biến số", e: "The dependent variable is firm performance." },
    { t: "correlate", p: "v.", m: "tương quan", e: "Investment correlates with growth." },
    { t: "estimate", p: "v./n.", m: "ước lượng", e: "We estimate the effect using regression." },
    { t: "sample", p: "n.", m: "mẫu (nghiên cứu)", e: "The sample includes 500 households." },
    { t: "reliability", p: "n.", m: "độ tin cậy", e: "We tested the reliability of the survey." },

    // --- (B) Kinh tế cốt lõi (IMF/OECD/World Bank) ---
    { t: "allocation", p: "n.", m: "sự phân bổ (nguồn lực)", e: "Efficient allocation of resources is essential." },
    { t: "aggregate", p: "adj./n.", m: "tổng gộp, tổng thể", e: "Aggregate demand fell during the recession." },
    { t: "marginal", p: "adj.", m: "cận biên", e: "Firms produce where marginal cost equals price." },
    { t: "equilibrium", p: "n.", m: "trạng thái cân bằng", e: "The market reaches equilibrium at this price." },
    { t: "elasticity", p: "n.", m: "độ co giãn", e: "The price elasticity of demand is low here." },
    { t: "inflation", p: "n.", m: "lạm phát", e: "Inflation eroded household purchasing power." },
    { t: "gross domestic product", p: "n.", m: "tổng sản phẩm quốc nội (GDP)", e: "GDP grew by three percent last year." },
    { t: "fiscal policy", p: "n.", m: "chính sách tài khóa", e: "Fiscal policy was used to stimulate demand." },
    { t: "monetary policy", p: "n.", m: "chính sách tiền tệ", e: "The central bank tightened monetary policy." },
    { t: "budget", p: "n.", m: "ngân sách", e: "The public budget must be balanced over time." },
    { t: "expenditure", p: "n.", m: "chi tiêu, khoản chi", e: "Public expenditure on health increased." },
    { t: "revenue", p: "n.", m: "nguồn thu, doanh thu", e: "Tax revenue is the main source of funding." },
    { t: "deficit", p: "n.", m: "thâm hụt", e: "The budget deficit widened this year." },
    { t: "surplus", p: "n.", m: "thặng dư", e: "The country ran a trade surplus." },
    { t: "subsidy", p: "n.", m: "trợ cấp", e: "The subsidy lowered the price of fuel." },
    { t: "tariff", p: "n.", m: "thuế quan", e: "A high tariff protects domestic producers." },
    { t: "taxation", p: "n.", m: "sự đánh thuế", e: "Progressive taxation reduces inequality." },
    { t: "incentive", p: "n.", m: "động lực, ưu đãi", e: "Tax breaks create incentives to invest." },
    { t: "opportunity cost", p: "n.", m: "chi phí cơ hội", e: "The opportunity cost of the project is high." },
    { t: "supply", p: "n./v.", m: "cung", e: "An increase in supply lowers the price." },
    { t: "demand", p: "n./v.", m: "cầu", e: "Demand for the service rose sharply." },
    { t: "output", p: "n.", m: "sản lượng", e: "Total output expanded after the reform." },
    { t: "productivity", p: "n.", m: "năng suất", e: "Higher productivity raises living standards." },
    { t: "efficiency", p: "n.", m: "hiệu quả", e: "The reform improved allocative efficiency." },
    { t: "equity", p: "n.", m: "công bằng", e: "Policy must balance efficiency and equity." },
    { t: "welfare", p: "n.", m: "phúc lợi", e: "The program raised social welfare." },
    { t: "poverty", p: "n.", m: "nghèo đói", e: "The policy aims to reduce rural poverty." },
    { t: "inequality", p: "n.", m: "bất bình đẳng", e: "Income inequality has grown over time." },
    { t: "growth", p: "n.", m: "tăng trưởng", e: "Sustained growth requires investment." },
    { t: "recession", p: "n.", m: "suy thoái", e: "The economy entered a deep recession." },
    { t: "unemployment", p: "n.", m: "thất nghiệp", e: "Unemployment fell to a record low." },
    { t: "capital", p: "n.", m: "vốn", e: "Firms need capital to expand." },
    { t: "investment", p: "n.", m: "đầu tư", e: "Public investment boosts productivity." },
    { t: "interest rate", p: "n.", m: "lãi suất", e: "A higher interest rate slows borrowing." },
    { t: "exchange rate", p: "n.", m: "tỷ giá hối đoái", e: "A weaker exchange rate helps exporters." },
    { t: "trade", p: "n./v.", m: "thương mại", e: "Open trade expands market access." },
    { t: "externality", p: "n.", m: "ngoại ứng", e: "Pollution is a negative externality." },
    { t: "market failure", p: "n.", m: "thất bại thị trường", e: "Market failure can justify regulation." },
    { t: "public good", p: "n.", m: "hàng hóa công", e: "National defense is a public good." },
    { t: "macroeconomic", p: "adj.", m: "(thuộc) kinh tế vĩ mô", e: "Macroeconomic stability supports growth." },
    { t: "microeconomic", p: "adj.", m: "(thuộc) kinh tế vi mô", e: "The study uses microeconomic data on firms." },
    { t: "econometric", p: "adj.", m: "(thuộc) kinh tế lượng", e: "We apply an econometric model to the panel." },

    // --- (C) Quản lý – Quản trị công ---
    { t: "governance", p: "n.", m: "quản trị (điều hành)", e: "Good governance improves public services." },
    { t: "accountability", p: "n.", m: "trách nhiệm giải trình", e: "Accountability reduces the risk of corruption." },
    { t: "transparency", p: "n.", m: "sự minh bạch", e: "Budget transparency builds public trust." },
    { t: "stakeholder", p: "n.", m: "bên liên quan", e: "We consulted every key stakeholder." },
    { t: "implementation", p: "n.", m: "sự thực thi, triển khai", e: "Weak implementation undermined the policy." },
    { t: "strategy", p: "n.", m: "chiến lược", e: "The strategy focuses on long-term growth." },
    { t: "resource", p: "n.", m: "nguồn lực", e: "Limited resources must be prioritized." },
    { t: "sustainability", p: "n.", m: "tính bền vững", e: "Financial sustainability is a key concern." },
    { t: "decentralization", p: "n.", m: "phân cấp, phân quyền", e: "Fiscal decentralization gave provinces more autonomy." },
    { t: "regulation", p: "n.", m: "quy định, sự điều tiết", e: "The sector operates under strict regulation." },
    { t: "compliance", p: "n.", m: "sự tuân thủ", e: "Compliance costs fell after the reform." },
    { t: "oversight", p: "n.", m: "sự giám sát", e: "Parliamentary oversight ensures accountability." },
    { t: "benchmark", p: "n./v.", m: "chuẩn đối sánh", e: "We benchmark performance against peers." },
    { t: "indicator", p: "n.", m: "chỉ số, chỉ báo", e: "Key indicators track program performance." },
    { t: "monitoring", p: "n.", m: "sự theo dõi, giám sát", e: "Monitoring and evaluation guide adjustments." },
    { t: "decision-making", p: "n.", m: "việc ra quyết định", e: "Data improves public decision-making." },
    { t: "policy", p: "n.", m: "chính sách", e: "The new policy targets small firms." },
    { t: "reform", p: "n./v.", m: "cải cách", e: "The reform modernized the tax system." },
    { t: "institution", p: "n.", m: "thể chế, định chế", e: "Strong institutions support development." },
    { t: "bureaucracy", p: "n.", m: "bộ máy hành chính", e: "Excessive bureaucracy delays projects." },
    { t: "corruption", p: "n.", m: "tham nhũng", e: "Transparency helps curb corruption." },
    { t: "human capital", p: "n.", m: "vốn con người", e: "Education builds human capital." },
    { t: "infrastructure", p: "n.", m: "cơ sở hạ tầng", e: "Infrastructure investment lowers trade costs." },
    { t: "procurement", p: "n.", m: "mua sắm công", e: "Open procurement reduces waste." },
    { t: "audit", p: "n./v.", m: "kiểm toán", e: "An independent audit verified the accounts." },
    { t: "public sector", p: "n.", m: "khu vực công", e: "The public sector employs many workers." },
    { t: "private sector", p: "n.", m: "khu vực tư nhân", e: "The private sector drives innovation." },
    { t: "partnership", p: "n.", m: "quan hệ đối tác (PPP)", e: "A public-private partnership funded the road." },
    { t: "risk management", p: "n.", m: "quản trị rủi ro", e: "Risk management protects public funds." },
    { t: "performance", p: "n.", m: "hiệu suất, kết quả", e: "We measured the performance of each unit." },
    { t: "effectiveness", p: "n.", m: "tính hiệu lực", e: "The study tests the effectiveness of the program." },
    { t: "allocate", p: "v.", m: "phân bổ", e: "The government allocates funds by need." },
    { t: "prioritize", p: "v.", m: "ưu tiên", e: "We prioritize projects with high returns." },
    { t: "mechanism", p: "n.", m: "cơ chế", e: "The market provides a pricing mechanism." },
    { t: "outcome", p: "n.", m: "kết quả (đầu ra cuối)", e: "The reform improved health outcomes." },
    { t: "constraint", p: "n.", m: "ràng buộc, hạn chế", e: "Budget constraints limited the scope." },
    { t: "trade-off", p: "n.", m: "sự đánh đổi", e: "There is a trade-off between growth and equity." },
    { t: "feasible", p: "adj.", m: "khả thi", e: "The plan is technically and financially feasible." },
    { t: "scalable", p: "adj.", m: "có thể nhân rộng", e: "The pilot is scalable to the whole province." },
  ];

  /* ---------- NGÂN HÀNG CÂU HỎI (10 trục × 8 câu = 80) ----------
     q=câu hỏi (EN), v=ý câu hỏi (VI), a=khung trả lời gợi ý (VI). */
  const QUESTIONS = {
    urgency: [
      { q: "Why is this topic important now?", v: "Vì sao đề tài quan trọng ở thời điểm này?", a: "Nêu bối cảnh thực tiễn cấp bách → khoảng trống chưa giải quyết → hệ quả nếu bỏ qua." },
      { q: "What real-world problem does your research address?", v: "Đề tài giải quyết vấn đề thực tế nào?", a: "Mô tả vấn đề cụ thể + đối tượng chịu ảnh hưởng + quy mô." },
      { q: "Who benefits from your findings?", v: "Ai được hưởng lợi từ kết quả?", a: "Nhà hoạch định chính sách, cơ quan quản lý, doanh nghiệp, người dân — nói rõ lợi ích." },
      { q: "Why did you choose this topic personally?", v: "Vì sao bạn chọn đề tài này?", a: "Kết nối động cơ cá nhân/nghề nghiệp với khoảng trống học thuật đã nhận diện." },
      { q: "How does your topic fit current policy debates?", v: "Đề tài gắn với tranh luận chính sách hiện nay ra sao?", a: "Liên hệ với 1–2 tranh luận/chính sách đang nóng và vị trí của bạn trong đó." },
      { q: "Why has this problem not been solved before?", v: "Vì sao vấn đề chưa được giải quyết trước đây?", a: "Do thiếu dữ liệu / phương pháp / bối cảnh mới thay đổi — bạn khắc phục điều nào." },
      { q: "What makes this the right time to study it?", v: "Vì sao đây là thời điểm phù hợp?", a: "Yếu tố mới: dữ liệu sẵn có, cải cách gần đây, hoặc thay đổi bối cảnh." },
      { q: "What happens if this issue is ignored?", v: "Điều gì xảy ra nếu bỏ qua vấn đề này?", a: "Nêu chi phí/rủi ro rõ ràng khi không hành động — tăng tính cấp thiết." },
    ],
    novelty: [
      { q: "What is new compared to previous studies?", v: "Điểm mới so với nghiên cứu trước là gì?", a: "Chỉ rõ 1 đóng góp cốt lõi: dữ liệu mới / phương pháp mới / bối cảnh mới / góc nhìn mới." },
      { q: "What is your original contribution to knowledge?", v: "Đóng góp gốc của bạn cho tri thức là gì?", a: "Một câu súc tích: 'Nghiên cứu đầu tiên chứng minh X trong bối cảnh Y bằng Z.'" },
      { q: "How does your work differ from existing literature?", v: "Khác biệt so với tài liệu hiện có?", a: "So sánh trực tiếp với 2–3 nghiên cứu gần nhất và điểm bạn vượt qua họ." },
      { q: "Is your contribution theoretical or empirical?", v: "Đóng góp thiên lý thuyết hay thực nghiệm?", a: "Xác định rõ; nếu cả hai, tách bạch từng phần." },
      { q: "Could someone have reached the same conclusion earlier?", v: "Người khác có thể đã kết luận tương tự sớm hơn không?", a: "Giải thích điều kiện (dữ liệu/phương pháp) mà trước đây chưa có." },
      { q: "How significant is your contribution?", v: "Đóng góp có ý nghĩa đến mức nào?", a: "Định vị mức độ: lấp khoảng trống hẹp nhưng quan trọng, tránh phóng đại." },
      { q: "What gap in the literature does your study fill?", v: "Lấp khoảng trống nào trong tài liệu?", a: "Nêu khoảng trống cụ thể đã tổng quan và cách bạn lấp." },
      { q: "Why should the committee consider this novel?", v: "Vì sao hội đồng nên xem đây là điểm mới?", a: "Tóm tắt bằng chứng khác biệt + xác nhận chưa ai làm đúng như vậy." },
    ],
    framework: [
      { q: "Which theoretical framework did you use, and why?", v: "Bạn dùng khung lý thuyết nào, vì sao?", a: "Nêu tên lý thuyết + lý do phù hợp với câu hỏi nghiên cứu và bối cảnh." },
      { q: "How does your framework connect to your findings?", v: "Khung lý thuyết gắn với kết quả thế nào?", a: "Cho thấy mỗi giả thuyết bắt nguồn từ lý thuyết và được kiểm chứng ra sao." },
      { q: "Did you consider alternative theories?", v: "Bạn có cân nhắc lý thuyết thay thế không?", a: "Nêu 1–2 lý thuyết khác + lý do không chọn (kém phù hợp/ít giải thích)." },
      { q: "What are the key assumptions of your framework?", v: "Các giả định chính của khung là gì?", a: "Liệt kê giả định cốt lõi + mức độ hợp lý trong bối cảnh của bạn." },
      { q: "How do your concepts translate into variables?", v: "Khái niệm được thao tác hóa thành biến ra sao?", a: "Ánh xạ khái niệm → chỉ báo → biến đo lường cụ thể." },
      { q: "Is your framework suitable for this context?", v: "Khung có phù hợp bối cảnh này không?", a: "Giải thích vì sao phù hợp; nêu điều chỉnh nếu có." },
      { q: "Which scholars underpin your framework?", v: "Học giả nào nền tảng cho khung của bạn?", a: "Dẫn 2–3 tác giả trụ cột và ý tưởng bạn kế thừa." },
      { q: "How would your results change under a different theory?", v: "Kết quả đổi ra sao nếu dùng lý thuyết khác?", a: "Thảo luận ngắn tính vững của kết luận qua lăng kính khác." },
    ],
    method: [
      { q: "Why did you choose this method?", v: "Vì sao chọn phương pháp này?", a: "Gắn phương pháp với câu hỏi nghiên cứu + loại dữ liệu + tính khả thi." },
      { q: "Why not use a qualitative (or quantitative) approach instead?", v: "Vì sao không dùng cách tiếp cận còn lại?", a: "Nêu ưu thế của lựa chọn cho mục tiêu; hoặc giải thích thiết kế hỗn hợp." },
      { q: "How did you ensure validity and reliability?", v: "Bảo đảm giá trị & độ tin cậy thế nào?", a: "Mô tả kiểm định thang đo, tam giác hóa dữ liệu, kiểm tra độ vững." },
      { q: "What are the weaknesses of your method?", v: "Phương pháp có điểm yếu gì?", a: "Thừa nhận thẳng thắn + cách bạn giảm thiểu tác động." },
      { q: "How did you handle bias in your study?", v: "Bạn xử lý thiên lệch ra sao?", a: "Nêu nguồn thiên lệch (chọn mẫu, hồi tưởng, nội sinh) + biện pháp kiểm soát." },
      { q: "Can your method be replicated?", v: "Phương pháp có lặp lại được không?", a: "Khẳng định quy trình minh bạch, dữ liệu/công cụ mô tả đủ để tái lập." },
      { q: "Why this sample and this time period?", v: "Vì sao chọn mẫu và giai đoạn này?", a: "Lý giải tính đại diện + lý do thực tiễn về dữ liệu." },
      { q: "How does your analysis answer your research question?", v: "Phân tích trả lời câu hỏi nghiên cứu ra sao?", a: "Nối từng bước phân tích tới từng câu hỏi/giả thuyết." },
    ],
    data: [
      { q: "Where is your data from?", v: "Dữ liệu lấy từ đâu?", a: "Nêu nguồn (cơ quan thống kê/khảo sát tự thu) + độ tin cậy nguồn." },
      { q: "What is your sample size, and is it sufficient?", v: "Cỡ mẫu bao nhiêu, có đủ không?", a: "Nêu n + biện minh bằng power/độ bão hòa/thông lệ ngành." },
      { q: "How reliable is your data?", v: "Dữ liệu tin cậy đến đâu?", a: "Bàn về sai số đo lường, dữ liệu thiếu, và cách xử lý." },
      { q: "How did you handle missing or outlier data?", v: "Xử lý dữ liệu thiếu / ngoại lai thế nào?", a: "Mô tả quy tắc loại/điền + kiểm tra tính vững sau xử lý." },
      { q: "Is your data representative of the population?", v: "Dữ liệu có đại diện tổng thể không?", a: "Đánh giá cách chọn mẫu + giới hạn suy rộng." },
      { q: "Were there any ethical concerns in data collection?", v: "Có vấn đề đạo đức khi thu thập không?", a: "Nêu đồng thuận, ẩn danh, phê duyệt đạo đức nếu có." },
      { q: "How current is your data?", v: "Dữ liệu cập nhật đến đâu?", a: "Nêu mốc thời gian + vì sao vẫn phù hợp để kết luận." },
      { q: "Could measurement error affect your results?", v: "Sai số đo lường ảnh hưởng kết quả không?", a: "Thừa nhận khả năng + hướng nó làm lệch kết quả (nếu có)." },
    ],
    findings: [
      { q: "What are your key findings?", v: "Kết quả chính là gì?", a: "Nêu 2–3 phát hiện quan trọng nhất, ngắn gọn, có số liệu." },
      { q: "Which finding surprised you most?", v: "Phát hiện nào bất ngờ nhất?", a: "Chọn 1 kết quả ngoài dự đoán + cách bạn lý giải." },
      { q: "Do your results support your hypotheses?", v: "Kết quả có ủng hộ giả thuyết không?", a: "Nói rõ giả thuyết nào được/không được ủng hộ và mức độ." },
      { q: "How do your findings compare to prior research?", v: "So với nghiên cứu trước thì sao?", a: "Chỉ ra điểm trùng khớp và điểm khác, kèm lý do khác biệt." },
      { q: "How confident are you in these results?", v: "Bạn tự tin đến đâu về kết quả?", a: "Gắn với ý nghĩa thống kê + kiểm tra độ vững đã làm." },
      { q: "What is the practical magnitude of your effect?", v: "Độ lớn thực tế của tác động?", a: "Diễn giải hệ số theo ngôn ngữ đời thực, không chỉ 'có ý nghĩa'." },
      { q: "Could your results be explained by another factor?", v: "Có yếu tố khác giải thích kết quả không?", a: "Nêu biến gây nhiễu tiềm tàng + cách bạn kiểm soát." },
      { q: "What is the single most important takeaway?", v: "Thông điệp quan trọng nhất là gì?", a: "Một câu kết luận cô đọng mà hội đồng cần nhớ." },
    ],
    limits: [
      { q: "What are the limitations of your study?", v: "Nghiên cứu có hạn chế gì?", a: "Nêu 2–3 hạn chế thật (dữ liệu/phạm vi/phương pháp) một cách bình tĩnh." },
      { q: "How do these limitations affect your conclusions?", v: "Hạn chế ảnh hưởng kết luận ra sao?", a: "Nói rõ kết luận nào cần thận trọng và mức độ." },
      { q: "If you started again, what would you change?", v: "Nếu làm lại, bạn đổi gì?", a: "Nêu cải tiến cụ thể về thiết kế/dữ liệu/mẫu." },
      { q: "Can your findings be generalized?", v: "Kết quả có thể tổng quát hóa không?", a: "Xác định phạm vi suy rộng hợp lý + điều kiện áp dụng." },
      { q: "What did you leave out of scope, and why?", v: "Bạn để gì ngoài phạm vi, vì sao?", a: "Giải thích ranh giới đề tài để giữ trọng tâm và khả thi." },
      { q: "How would a larger sample change your results?", v: "Mẫu lớn hơn sẽ thay đổi gì?", a: "Bàn về độ chính xác/khả năng phát hiện tác động nhỏ." },
      { q: "Are there threats to internal validity?", v: "Có nguy cơ với giá trị nội tại không?", a: "Nêu nội sinh/đồng thời/chọn mẫu + cách giảm thiểu." },
      { q: "What assumptions might not hold?", v: "Giả định nào có thể không đúng?", a: "Chỉ ra giả định nhạy cảm nhất và hệ quả nếu sai." },
    ],
    policy: [
      { q: "What are the policy implications?", v: "Hàm ý chính sách là gì?", a: "Chuyển kết quả thành 2–3 khuyến nghị hành động cụ thể." },
      { q: "Who should act on your recommendations?", v: "Ai nên hành động theo khuyến nghị?", a: "Chỉ rõ cơ quan/cấp quản lý chịu trách nhiệm thực thi." },
      { q: "Are your recommendations feasible?", v: "Khuyến nghị có khả thi không?", a: "Đánh giá chi phí, năng lực, thời gian thực hiện." },
      { q: "What are the costs and benefits of your proposal?", v: "Chi phí – lợi ích của đề xuất?", a: "Nêu lợi ích kỳ vọng so với chi phí/rủi ro chính." },
      { q: "Could your policy have unintended consequences?", v: "Chính sách có hệ quả ngoài ý muốn không?", a: "Thừa nhận rủi ro phụ + cách theo dõi, điều chỉnh." },
      { q: "How would you measure the success of the policy?", v: "Đo thành công của chính sách thế nào?", a: "Đề xuất chỉ số M&E cụ thể và mốc thời gian." },
      { q: "How does your recommendation fit existing regulation?", v: "Khuyến nghị khớp với quy định hiện hành ra sao?", a: "Chỉ ra điểm tương thích hoặc cần sửa đổi thể chế." },
      { q: "What is the first step you would recommend?", v: "Bước đầu tiên bạn khuyến nghị?", a: "Một hành động ưu tiên, ít tốn kém, tạo đà." },
    ],
    apply: [
      { q: "Can this be applied elsewhere?", v: "Có thể áp dụng nơi khác không?", a: "Nêu điều kiện để chuyển giao + nơi phù hợp nhất." },
      { q: "Would your results hold in another country or sector?", v: "Kết quả có đúng ở nước/ngành khác?", a: "Phân biệt yếu tố phổ quát và yếu tố đặc thù bối cảnh." },
      { q: "What conditions are needed to replicate your success?", v: "Cần điều kiện gì để nhân rộng thành công?", a: "Liệt kê tiền đề: thể chế, dữ liệu, năng lực, nguồn lực." },
      { q: "Is your solution scalable?", v: "Giải pháp có nhân rộng được không?", a: "Bàn chi phí biên khi mở rộng + rào cản quy mô." },
      { q: "How adaptable is your framework to new settings?", v: "Khung linh hoạt với bối cảnh mới đến đâu?", a: "Nêu phần lõi giữ nguyên và phần cần hiệu chỉnh." },
      { q: "What barriers might limit wider adoption?", v: "Rào cản nào cản trở áp dụng rộng?", a: "Nêu rào cản thể chế/chính trị/kỹ thuật và cách vượt." },
      { q: "Have others tried similar approaches?", v: "Đã có ai thử cách tương tự chưa?", a: "Dẫn ví dụ so sánh + bài học rút ra." },
      { q: "Who would you partner with for implementation?", v: "Bạn hợp tác với ai để triển khai?", a: "Nêu đối tác (cơ quan, PPP) và vai trò của họ." },
    ],
    next: [
      { q: "What are the next steps?", v: "Hướng nghiên cứu tiếp theo là gì?", a: "Nêu 2–3 hướng mở rộng logic từ hạn chế hiện tại." },
      { q: "What would you research next?", v: "Bạn sẽ nghiên cứu gì tiếp?", a: "Chọn 1 câu hỏi kế tiếp hấp dẫn + lý do." },
      { q: "How could future studies build on your work?", v: "Nghiên cứu sau kế thừa thế nào?", a: "Gợi dữ liệu/phương pháp/bối cảnh mới để đào sâu." },
      { q: "What new questions did your findings raise?", v: "Kết quả đặt ra câu hỏi mới nào?", a: "Nêu 1–2 câu hỏi mở nảy sinh từ phát hiện." },
      { q: "Would a longitudinal study add value?", v: "Nghiên cứu dài hạn có ích không?", a: "Bàn lợi ích theo dõi theo thời gian để thấy nhân quả." },
      { q: "How would you improve the methodology next time?", v: "Lần tới cải tiến phương pháp thế nào?", a: "Nêu thiết kế mạnh hơn (thực nghiệm, dữ liệu lớn hơn)." },
      { q: "Could this become a longer-term research agenda?", v: "Có thể thành chương trình nghiên cứu dài hạn?", a: "Phác thảo 2–3 giai đoạn nghiên cứu nối tiếp." },
      { q: "What collaboration would strengthen future work?", v: "Hợp tác nào giúp nghiên cứu sau mạnh hơn?", a: "Nêu ngành/đối tác bổ trợ dữ liệu hoặc chuyên môn." },
    ],
  };

  /* ---------- LỘ TRÌNH THÁNG 1 CHI TIẾT (4 tuần) ----------
     Tuần 1 đã có bản chi tiết theo ngày trong app (mục Tuần 1).
     Dưới đây là trọng tâm tuần 2–4 của Giai đoạn 1. */
  const MONTH1_PLAN = [
    { week: 1, theme: "Chẩn đoán & Khởi động", color: "sky",
      focus: "Ghi âm mốc gốc, lập sổ tay 10–50 từ, thiết lập công cụ AI, nghe video kinh tế nhập môn.",
      days: ["Chẩn đoán + ghi âm gốc", "Âm cuối -s/-t/-d/-k/-th", "Nghe câu hỏi mẫu", "Nói 6 câu về đề tài", "Trọng âm từ dài", "Thực chiến voice AI", "Nghỉ chủ động + tổng kết"] },
    { week: 2, theme: "Âm cuối + Nghe nền", color: "brand",
      focus: "Nghe 20'/ngày bài giảng nhập môn (MIT OCW/Yale). Luyện nuốt âm cuối. Shadowing 1 phút/ngày. 5 từ/ngày.",
      days: ["Nghe bài giảng #1 (có phụ đề)", "Nghe lại #1 (không phụ đề) + chép câu", "Cụm phụ âm khó (str-, -nds)", "Shadowing đoạn 1 phút ×5", "Nghe bài mới + 5 từ", "Voice AI: kể về công việc", "Ôn từ tuần + nghe nhẹ"] },
    { week: 3, theme: "Trọng âm & Shadowing chuyên sâu", color: "violet",
      focus: "Trọng âm từ dài (e-CO-no-my, ma-na-GE-ment). Shadowing tăng lên 2 phút. Đọc to tài liệu chuyên ngành.",
      days: ["Trọng âm 10 từ chuyên ngành", "Shadowing 2 phút + ghi âm", "Nghe Q&A hội thảo (LSE) bắt ý", "Đọc to đoạn chuyên ngành", "Nghe + so ghi âm đầu tuần", "Voice AI: 3 câu hỏi đơn giản", "Ôn + nhật ký tuần" ] },
    { week: 4, theme: "Nghe câu hỏi + Nói về đề tài", color: "amber",
      focus: "Chuyển trọng tâm sang bắt Ý câu hỏi. Nói liền mạch 5–7 câu về đề tài. Bắt đầu chạm ngân hàng câu hỏi.",
      days: ["Nghe 5 câu hỏi mẫu nhiều tốc độ", "Viết lại ý câu hỏi bằng tiếng Việt", "Trả lời 3 câu trục 'Tính cấp thiết'", "Nói 7 câu về đề tài (ghi âm)", "Nghe bài giảng + 5 từ", "Mock Q&A ngắn với AI", "Tổng kết tháng 1 + ghi âm so mốc gốc"] },
  ];

  global.SEED = { VOCAB, QUESTIONS, MONTH1_PLAN, SOURCES };
})(window);
