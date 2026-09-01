/* ============================================================
   views-defense.js — Module 5: Mô phỏng bảo vệ + luyện nghe
   câu hỏi phản biện + ngân hàng 8 dạng câu hỏi
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;
  const U = () => Views.util;

  const CRIT = [["content", "Nội dung"], ["fluency", "Trôi chảy"], ["pron", "Phát âm"], ["vocab", "Từ chuyên ngành"], ["strategy", "Ứng xử"]];

  // Ngân hàng câu theo dạng (gộp từ SEED.QUESTIONS theo axes)
  function bankOf(type) {
    const out = [];
    (type.axes || []).forEach((ax) => {
      ((typeof SEED !== "undefined" && SEED.QUESTIONS && SEED.QUESTIONS[ax]) || []).forEach((q) => out.push(q));
    });
    return out;
  }
  function allBank() {
    const out = [];
    CONTENT.DEFENSE_TYPES.forEach((t) => bankOf(t).forEach((q) => out.push({ t, q })));
    return out;
  }

  Views.defense = function () {
    const root = h("div");
    home(root, "sim");
    return root;
  };

  function tabs(root, active) {
    const T = [["sim", "🎓 Mô phỏng"], ["bank", "📋 8 dạng câu hỏi"], ["listen", "👂 Luyện nghe"], ["rescue", "⛑ Câu cứu nguy"], ["history", "📈 Lịch sử"]];
    return h("div", { class: "row gap-sm mt-1", style: { flexWrap: "wrap" } },
      T.map(([id, label]) => h("button", {
        class: "btn btn--sm " + (id === active ? "btn--primary" : "btn--ghost"),
        onClick: () => home(root, id),
      }, label)));
  }

  function home(root, tab) {
    root.innerHTML = "";
    root.appendChild(tabs(root, tab));
    if (tab === "bank") return bankView(root);
    if (tab === "listen") return listenView(root);
    if (tab === "rescue") return rescueView(root);
    if (tab === "history") return historyView(root);
    return simHome(root);
  }

  /* ================= NGÂN HÀNG 8 DẠNG ================= */
  function bankView(root) {
    root.appendChild(h("p", { class: "small muted" },
      "8 dạng câu hỏi hội đồng thường gặp — mỗi dạng có KHUNG trả lời. Nguyên tắc: đọc câu hỏi → TỰ nghĩ câu trả lời (nói to) → mới xem khung gợi ý."));
    CONTENT.DEFENSE_TYPES.forEach((t) => {
      const qs = bankOf(t);
      const body = h("div", { class: "hidden" });
      const card = h("div", { class: "card" }, [
        h("div", { class: "between", style: { cursor: "pointer" }, onClick: () => body.classList.toggle("hidden") }, [
          h("div", { style: { fontWeight: 700 } }, t.icon + " " + t.title),
          h("span", { class: "small muted" }, qs.length + " câu ▾"),
        ]),
        body,
      ]);
      body.appendChild(h("div", { class: "callout callout--accent mt-1" }, [
        h("div", { class: "callout__icon" }, "🧭"),
        h("div", { class: "small" }, [h("strong", null, "Khung trả lời: "),
          h("ol", { class: "mb-0", style: { paddingLeft: "18px" } }, t.frame.map((f) => h("li", null, f)))]),
      ]));
      qs.forEach((q) => {
        const ansBox = h("div", { class: "hidden small muted mt-1" }, "→ " + (q.a || ""));
        body.appendChild(h("div", { class: "q-item" }, [
          h("div", { class: "q-item__en" }, q.q),
          h("div", { class: "q-item__vi small muted" }, q.v || ""),
          h("div", { class: "row gap-sm mt-1" }, [
            h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.speak(q.q) }, "🔊"),
            h("button", { class: "btn btn--ghost btn--sm", onClick: () => ansBox.classList.toggle("hidden") }, "Khung gợi ý"),
          ]),
          ansBox,
        ]));
      });
      root.appendChild(card);
    });
  }

  /* ================= LUYỆN NGHE CÂU HỎI (tháng 9) ================= */
  function listenView(root) {
    root.appendChild(h("div", { class: "card" }, [
      h("p", { class: "small muted" },
        "Nghe câu hỏi phản biện với NHIỀU GIỌNG và tốc độ khác nhau (mô phỏng hội đồng thật). Nghe xong chọn đúng Ý NGHĨA của câu hỏi. Mục tiêu tháng 9: đúng ≥ 80%."),
      h("div", { class: "row gap-sm", style: { flexWrap: "wrap" } }, [
        h("button", { class: "btn btn--primary", onClick: () => listenQuiz(root, 0.8) }, "▶ Bài nghe 10 câu (chậm)"),
        h("button", { class: "btn btn--primary", onClick: () => listenQuiz(root, 1.0) }, "▶ 10 câu (tốc độ thật)"),
        h("button", { class: "btn btn--accent", onClick: () => listenQuiz(root, 1.15) }, "▶ 10 câu (nhanh + giọng lạ)"),
      ]),
    ]));
    root.appendChild(h("p", { class: "small muted" },
      "Mẹo: trên Windows/Edge có nhiều giọng en-GB/en-IN/en-AU — app sẽ đổi giọng ngẫu nhiên từng câu để bạn quen đa giọng."));
  }

  function listenQuiz(root, rate) {
    const pool = allBank();
    if (pool.length < 4) { UI.toast("Chưa có ngân hàng câu hỏi"); return; }
    const picks = shuffle(pool).slice(0, 10);
    const voices = UI.Speech.englishVoices();
    let i = 0, ok = 0;
    const t0 = Date.now();

    function speakQ(q) {
      const v = voices.length ? voices[Math.floor(Math.random() * voices.length)] : null;
      if (v) UI.Speech.testVoice(v, q, rate);
      else UI.Speech.ttsSpeak(q, { rate });
    }

    function show() {
      root.innerHTML = "";
      if (i >= picks.length) {
        Store.logActivity("defense", Math.max(2, Math.round((Date.now() - t0) / 60000)));
        const pct = Math.round((ok / picks.length) * 100);
        root.appendChild(h("div", { class: "empty" }, [
          h("div", { class: "empty__icon" }, pct >= 80 ? "🏆" : "✓"),
          h("div", { style: { fontWeight: 700, fontSize: "1.3rem" } }, "Nghe đúng " + ok + "/" + picks.length + " (" + pct + "%)"),
          h("div", { class: "small muted" }, pct >= 80 ? "Đạt chuẩn đầu ra tháng 9!" : "Mục tiêu: ≥ 80% — luyện mỗi ngày một bài."),
          h("button", { class: "btn btn--primary mt-2", onClick: () => home(root, "listen") }, "← Về Luyện nghe"),
        ]));
        return;
      }
      const cur = picks[i];
      // 3 lựa chọn nghĩa tiếng Việt
      const opts = shuffle([cur, ...shuffle(pool.filter((p) => p !== cur)).slice(0, 2)]);
      root.appendChild(h("div", { class: "small muted mt-1" }, "Câu " + (i + 1) + "/" + picks.length));
      root.appendChild(h("div", { class: "card flash-stage" }, [
        h("div", { class: "small muted" }, "🎧 Nghe câu hỏi (không nhìn chữ) — câu hỏi có nghĩa là gì?"),
        h("button", { class: "btn btn--ghost mt-1", onClick: () => speakQ(cur.q.q) }, "🔊 Nghe lại"),
        h("div", { class: "mt-2", style: { display: "grid", gap: "8px" } },
          opts.map((o) => h("button", { class: "btn btn--ghost", style: { textAlign: "left", whiteSpace: "normal" }, onClick: () => pick(o) },
            o.q.v || o.q.q))),
      ]));
      speakQ(cur.q.q);
      function pick(o) {
        const correct = o === cur;
        if (correct) ok++;
        UI.toast(correct ? "✓ Đúng" : "✗ Sai — câu hỏi: " + (cur.q.v || cur.q.q), correct ? "accent" : undefined);
        i++; setTimeout(show, 800);
      }
    }
    show();
  }

  /* ================= CÂU CỨU NGUY ================= */
  function rescueView(root) {
    root.appendChild(h("p", { class: "small muted" },
      "Học THUỘC LÒNG các câu này — khi chưa nghe rõ hoặc cần thời gian, chúng giúp bạn không 'đứng hình'."));
    CONTENT.rescueGroups().forEach((g) => {
      const card = h("div", { class: "card" }, [h("div", { style: { fontWeight: 700 } }, g.cat)]);
      g.items.forEach((it) => {
        card.appendChild(h("div", { class: "phrase-card" }, [
          h("div", { class: "phrase-en" }, it.en),
          h("div", { class: "phrase-vi small muted" }, it.vi),
          h("button", { class: "btn btn--ghost btn--sm mt-1", onClick: () => UI.speak(it.en) }, "🔊 Nghe & nhại 3 lần"),
        ]));
      });
      root.appendChild(card);
    });
  }

  /* ================= MÔ PHỎNG ================= */
  function simHome(root) {
    const s = Store.settings();
    root.appendChild(h("div", { class: "card" }, [
      h("div", { style: { fontWeight: 700 } }, "🎓 Mô phỏng bảo vệ"),
      h("p", { class: "small muted" },
        "AI đọc tóm tắt luận văn của bạn, sinh câu hỏi phản biện theo 8 dạng, bạn trả lời bằng LỜI NÓI trong thời gian giới hạn, AI chấm 5 tiêu chí (nội dung · trôi chảy · phát âm · từ chuyên ngành · ứng xử)."),
      !s.topicSummary ? h("div", { class: "callout callout--amber" }, [
        h("div", { class: "callout__icon" }, "📝"),
        h("div", { class: "small" }, ["Chưa có tóm tắt luận văn. ", h("a", { href: "#/settings" }, "Vào Cài đặt"), " dán tóm tắt (tiếng Việt hoặc Anh) để AI sinh câu hỏi sát đề tài."]),
      ]) : null,
      !AI.ready() ? h("div", { class: "callout callout--amber mt-1" }, [
        h("div", { class: "callout__icon" }, "🔑"),
        h("div", { class: "small" }, ["Chưa có API key — vẫn luyện được với NGÂN HÀNG 130 câu có sẵn (tự chấm). ", h("a", { href: "#/settings" }, "Thêm key"), " để AI sinh câu hỏi mới và chấm điểm."]),
      ]) : null,
      h("div", { class: "row gap-sm mt-2", style: { flexWrap: "wrap" } }, [
        h("button", { class: "btn btn--primary", onClick: () => startSim(root, { n: 1 }) }, "⚡ 1 câu bất ngờ (3 phút)"),
        h("button", { class: "btn btn--primary", onClick: () => startSim(root, { n: 5 }) }, "▶ Phiên 5 câu"),
        h("button", { class: "btn btn--accent", onClick: () => startSim(root, { n: 8, full: true }) }, "🏛 Bảo vệ đầy đủ (25' + 8 câu)"),
      ]),
    ]));

    // trạng thái mục tiêu tháng 12
    const sims = Store.sims();
    const fullSims = sims.filter((x) => x.mode === "full");
    root.appendChild(h("div", { class: "grid grid--3" }, [
      U().statCard("Phiên đã chạy", String(sims.length), "mọi chế độ"),
      U().statCard("Mô phỏng đầy đủ", fullSims.length + " / 4", "mục tiêu tháng 12"),
      U().statCard("Điểm gần nhất", sims.length ? sims[sims.length - 1].avg + "/10" : "—", "trung bình 5 tiêu chí"),
    ]));
  }

  async function startSim(root, opts) {
    const s = Store.settings();
    root.innerHTML = "";
    root.appendChild(h("div", { class: "center mt-2 small muted" }, "Đang chuẩn bị bộ câu hỏi…"));

    // Lấy câu hỏi: AI (nếu có key + tóm tắt) hoặc ngân hàng
    let questions = [];
    if (AI.ready() && s.topicSummary) {
      try {
        const txt = await AI.chat([{ role: "user", content: AI.genQuestionsPrompt(s.topicSummary, opts.n, opts.full ? "increasing difficulty" : "mixed") }], null, 2000);
        const arr = AI.parseJSON(txt);
        if (Array.isArray(arr)) questions = arr.filter((q) => q && q.q).slice(0, opts.n);
      } catch (e) { UI.toast("AI lỗi (" + e.message + ") — dùng ngân hàng câu sẵn"); }
    }
    if (!questions.length) {
      questions = shuffle(allBank()).slice(0, opts.n).map((x) => ({ q: x.q.q, vi: x.q.v || "", hint: x.q.a || "", type: x.t.id }));
    }
    runSim(root, questions, opts);
  }

  function runSim(root, questions, opts) {
    let qi = 0;
    const answers = []; // {q, a}
    let listener = null, timerId = null;
    const ANSWER_SECS = opts.n === 1 ? 240 : 180;

    // Bước 0 (bảo vệ đầy đủ): hẹn giờ trình bày 25'
    if (opts.full && !opts._presented) {
      root.innerHTML = "";
      root.appendChild(h("div", { class: "card flash-stage" }, [
        h("div", { style: { fontWeight: 700, fontSize: "1.1rem" } }, "Bước 1 — Trình bày 25 phút"),
        h("p", { class: "small muted" }, "Mở slide của bạn và trình bày như thật. Đồng hồ đếm ngược 25 phút. (Có thể bỏ qua nếu chỉ luyện hỏi–đáp.)"),
        h("div", { class: "daily-timer", id: "pres-timer" }, "25:00"),
        h("div", { class: "row gap-sm center mt-2" }, [
          h("button", { class: "btn btn--primary", onClick: startPres }, "▶ Bắt đầu trình bày"),
          h("button", { class: "btn btn--ghost", onClick: () => { opts._presented = true; runSim(root, questions, opts); } }, "Bỏ qua → vào hỏi–đáp"),
        ]),
      ]));
      function startPres(e) {
        let left = 25 * 60;
        e.target.disabled = true;
        const el = root.querySelector("#pres-timer");
        const iv = setInterval(() => {
          left--;
          el.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
          if (left <= 0) { clearInterval(iv); UI.toast("Hết 25 phút — chuyển sang hỏi đáp"); opts._presented = true; runSim(root, questions, opts); }
        }, 1000);
        const skip = h("button", { class: "btn btn--accent mt-2", onClick: () => { clearInterval(iv); opts._presented = true; runSim(root, questions, opts); } }, "✓ Đã trình bày xong → hỏi–đáp");
        root.querySelector(".flash-stage").appendChild(skip);
      }
      return;
    }

    function showQ() {
      cleanup();
      root.innerHTML = "";
      if (qi >= questions.length) return grade();
      const q = questions[qi];
      root.appendChild(h("div", { class: "between mt-1" }, [
        h("span", { class: "small muted" }, "Câu hỏi " + (qi + 1) + "/" + questions.length),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => { cleanup(); home(root, "sim"); } }, "✕ Hủy phiên"),
      ]));

      const viBox = h("div", { class: "small muted hidden" }, q.vi || "");
      const hintBox = h("div", { class: "small muted hidden" }, q.hint ? "Gợi ý: " + q.hint : "");
      const stage = h("div", { class: "card flash-stage" }, [
        h("div", { class: "small muted" }, "🎧 Nghe câu hỏi như trong phòng bảo vệ:"),
        h("div", { class: "q-item__en mt-1", style: { fontSize: "1.1rem" } }, q.q),
        viBox, hintBox,
        h("div", { class: "row gap-sm center mt-1", style: { flexWrap: "wrap" } }, [
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.Speech.ttsSpeak(q.q, { rate: 0.95 }) }, "🔊 Nghe lại"),
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => viBox.classList.toggle("hidden") }, "Dịch"),
          q.hint ? h("button", { class: "btn btn--ghost btn--sm", onClick: () => hintBox.classList.toggle("hidden") }, "Gợi ý khung") : null,
        ]),
      ]);
      root.appendChild(stage);

      const timerEl = h("div", { class: "daily-timer" }, fmtSecs(ANSWER_SECS));
      const status = h("div", { class: "small muted center" }, "Nhấn nút và TRẢ LỜI THÀNH TIẾNG (2–4 phút). Dùng câu cứu nguy nếu cần.");
      const transcript = h("div", { class: "small", style: { whiteSpace: "pre-wrap", minHeight: "40px" } }, "");
      const ctrl = h("div", { class: "row gap-sm center mt-1" });
      root.appendChild(h("div", { class: "card center" }, [timerEl, status, ctrl, transcript]));

      const startBtn = h("button", { class: "btn btn--primary", onClick: startAnswer }, "🎙 Bắt đầu trả lời");
      ctrl.appendChild(startBtn);
      UI.Speech.ttsSpeak(q.q, { rate: 0.95 });

      function startAnswer() {
        ctrl.innerHTML = "";
        let left = ANSWER_SECS;
        timerId = setInterval(() => {
          left--;
          timerEl.textContent = fmtSecs(left);
          if (left <= 0) stopAnswer();
        }, 1000);
        let heard = "";
        if (REC.STT.supported()) {
          status.textContent = "🔴 Đang nghe câu trả lời…";
          listener = REC.STT.listen({
            continuous: true,
            onPartial: (t) => { heard = t; transcript.textContent = t.slice(-300); },
            onEnd: (err, finalText) => { listener = null; commit(finalText || heard); },
          });
        } else {
          status.textContent = "Không có nhận dạng giọng nói — trả lời to, xong gõ tóm tắt câu trả lời vào ô dưới.";
          const ta = h("textarea", { class: "textarea mt-1", rows: 3, placeholder: "Gõ lại ý chính câu trả lời của bạn (tiếng Anh)…" });
          transcript.appendChild(ta);
          ta.oninput = () => { heard = ta.value; };
        }
        ctrl.appendChild(h("button", { class: "btn btn--danger", onClick: stopAnswer }, "■ Xong câu trả lời"));

        function stopAnswer() {
          clearInterval(timerId); timerId = null;
          if (listener) { listener.stop(); } // commit sẽ chạy trong onEnd
          else commit(heard);
        }
        function commit(text) {
          answers.push({ q: q.q, a: (text || "").trim() });
          qi++;
          showQ();
        }
      }
    }

    async function grade() {
      root.innerHTML = "";
      root.appendChild(h("div", { class: "center mt-2 small muted" }, "Đang chấm điểm…"));
      let result = null;
      if (AI.ready()) {
        try {
          const prompt = opts.n === 1
            ? AI.scoreAnswerPrompt(answers[0].q, answers[0].a)
            : AI.scoreSessionPrompt(answers);
          const txt = await AI.chat([{ role: "user", content: prompt }], null, 1800);
          result = AI.parseJSON(txt);
        } catch (e) { UI.toast("AI chấm lỗi: " + e.message); }
      }
      if (result && result.scores) showResult(result);
      else manualScore();
    }

    function showResult(r) {
      const sim = Store.addSim({
        mode: opts.full ? "full" : (opts.n === 1 ? "quick" : "qa"),
        n: answers.length, scores: r.scores, note: r.comment || "",
      });
      Store.logActivity("defense", opts.full ? 35 : answers.length * 4);
      root.innerHTML = "";
      root.appendChild(h("div", { class: "card" }, [
        h("div", { class: "center" }, [
          h("div", { style: { fontSize: "2.2rem", fontWeight: 800 } }, sim.avg + "/10"),
          h("div", { class: "small muted" }, "trung bình 5 tiêu chí · " + answers.length + " câu"),
        ]),
        h("div", { class: "mt-2" }, CRIT.map(([k, label]) => h("div", { class: "mt-1" }, [
          h("div", { class: "between small" }, [h("span", null, label), h("strong", null, (r.scores[k] || 0) + "/10")]),
          UI.bar((r.scores[k] || 0) * 10, (r.scores[k] || 0) >= 7 ? "accent" : "amber"),
        ]))),
        r.comment ? h("div", { class: "callout mt-2" }, [h("div", { class: "callout__icon" }, "💬"), h("div", { class: "small" }, r.comment)]) : null,
        Array.isArray(r.improvements) ? h("div", { class: "mt-1 small" }, [
          h("strong", null, "3 việc cần cải thiện:"),
          h("ol", { style: { paddingLeft: "18px" } }, r.improvements.slice(0, 3).map((x) => h("li", null, x))),
        ]) : null,
        r.betterAnswer ? h("div", { class: "callout callout--accent mt-1" }, [
          h("div", { class: "callout__icon" }, "★"),
          h("div", { class: "small" }, [h("strong", null, "Câu trả lời mẫu: "), r.betterAnswer,
            h("div", { class: "mt-1" }, h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.Speech.ttsSpeak(r.betterAnswer) }, "🔊 Nghe & shadowing"))]),
        ]) : null,
        h("div", { class: "center mt-2" }, h("button", { class: "btn btn--primary", onClick: () => home(root, "sim") }, "← Về Mô phỏng")),
      ]));
    }

    function manualScore() {
      root.innerHTML = "";
      const sliders = {};
      const box = h("div", { class: "card" }, [
        h("div", { style: { fontWeight: 700 } }, "Tự chấm điểm (không có AI)"),
        h("p", { class: "small muted" }, "Nghe lại trong đầu phần trả lời của bạn và chấm trung thực 1–10 từng tiêu chí."),
      ]);
      CRIT.forEach(([k, label]) => {
        const val = h("strong", null, "5");
        const sl = h("input", { class: "input", type: "range", min: 1, max: 10, value: 5, onInput: (e) => { val.textContent = e.target.value; } });
        sliders[k] = sl;
        box.appendChild(h("div", { class: "mt-1" }, [h("div", { class: "between small" }, [h("span", null, label), val]), sl]));
      });
      box.appendChild(h("div", { class: "center mt-2" }, h("button", {
        class: "btn btn--primary", onClick: () => {
          const scores = {};
          CRIT.forEach(([k]) => scores[k] = +sliders[k].value);
          Store.addSim({ mode: opts.full ? "full" : (opts.n === 1 ? "quick" : "qa"), n: answers.length, scores, note: "tự chấm" });
          Store.logActivity("defense", opts.full ? 35 : answers.length * 4);
          UI.toast("Đã lưu phiên ✓", "accent");
          home(root, "history");
        },
      }, "Lưu kết quả")));
      root.appendChild(box);
    }

    function cleanup() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      if (listener) { const l = listener; listener = null; l.stop(); }
    }
    function fmtSecs(x) { return Math.floor(x / 60) + ":" + String(x % 60).padStart(2, "0"); }
    showQ();
  }

  /* ================= LỊCH SỬ ================= */
  function historyView(root) {
    const sims = Store.sims().slice().reverse();
    if (!sims.length) {
      root.appendChild(h("div", { class: "empty" }, [
        h("div", { class: "empty__icon" }, "📈"),
        h("div", { class: "small muted" }, "Chưa có phiên mô phỏng nào. Chạy phiên đầu tiên để có mốc so sánh."),
      ]));
      return;
    }
    root.appendChild(h("div", { class: "card" }, [
      h("div", { class: "stat__label" }, "Điểm trung bình theo thời gian"),
      U().sparkline(Store.sims().map((s) => s.avg), { color: "var(--rose, #f43f5e)" }),
    ]));
    const modeLabel = { full: "Đầy đủ", qa: "Hỏi–đáp", quick: "1 câu" };
    sims.forEach((s) => {
      root.appendChild(h("div", { class: "card" }, [
        h("div", { class: "between" }, [
          h("div", null, [
            h("strong", null, s.avg + "/10"), " · ", modeLabel[s.mode] || s.mode, " · " + s.n + " câu",
            h("div", { class: "small muted" }, s.date),
          ]),
          h("div", { class: "small muted", style: { textAlign: "right" } },
            CRIT.map(([k, l]) => l.slice(0, 4) + " " + (s.scores[k] || "–")).join(" · ")),
        ]),
        s.note ? h("div", { class: "small muted mt-1" }, s.note.slice(0, 300)) : null,
      ]));
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
})(window);
