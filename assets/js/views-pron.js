/* ============================================================
   views-pron.js — Module 2: Phát âm
   ------------------------------------------------------------
   • Đọc & máy chấm theo TỪ (Web Speech API): xanh=đúng, đỏ=sai
   • Minimal pairs: nghe phân biệt + tự đọc
   • Bảng 44 âm với mẹo cho người Việt
   • Tiến bộ theo từng âm
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;
  const U = () => Views.util;

  Views.pron = function () {
    const root = h("div");
    home(root);
    return root;
  };

  function tabs(root, active) {
    const T = [["read", "🎯 Đọc & chấm"], ["pairs", "👂 Minimal pairs"], ["chart", "🔤 44 âm"], ["progress", "📈 Theo âm"]];
    return h("div", { class: "row gap-sm mt-1", style: { flexWrap: "wrap" } },
      T.map(([id, label]) => h("button", {
        class: "btn btn--sm " + (id === active ? "btn--primary" : "btn--ghost"),
        onClick: () => { if (id === "read") home(root); else if (id === "pairs") pairsView(root); else if (id === "chart") chartView(root); else progressView(root); },
      }, label)));
  }

  /* ---------------- Đọc & chấm điểm ---------------- */
  function home(root) {
    root.innerHTML = "";
    root.appendChild(tabs(root, "read"));

    if (!REC.STT.supported()) {
      root.appendChild(h("div", { class: "card callout callout--amber" }, [
        h("div", { class: "callout__icon" }, "⚠"),
        h("div", { class: "small" }, "Trình duyệt này không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge (có mạng) để máy chấm hoạt động."),
      ]));
    }

    const avg = Store.pronAvg(7);
    root.appendChild(h("div", { class: "grid grid--3" }, [
      U().statCard("Điểm TB 7 ngày", avg == null ? "—" : avg + "%", "mục tiêu tháng 1: ≥ 75%"),
      U().statCard("Lượt luyện", String(Store.get().pron.history.length), "tổng cộng"),
      U().statCard("Mục tiêu hôm nay", "10 phút", "2–3 bài đọc"),
    ]));

    // chọn bài đọc
    root.appendChild(U().sectionTitle("Chọn bài đọc"));
    const drillBox = h("div", { class: "card", style: { padding: "6px 0" } });
    CONTENT.DRILLS.forEach((d) => {
      drillBox.appendChild(h("a", { class: "task-row", href: "javascript:;", onClick: () => readSession(root, drillWords(d), d.title, d.note) }, [
        h("span", { class: "task-row__icon" }, "▸"),
        h("span", { class: "task-row__label" }, [d.title, h("div", { class: "small muted" }, d.note)]),
        h("span", { class: "task-row__meta small muted" }, "›"),
      ]));
    });
    // câu tự nhập
    drillBox.appendChild(h("a", { class: "task-row", href: "javascript:;", onClick: () => customText(root) }, [
      h("span", { class: "task-row__icon" }, "✎"),
      h("span", { class: "task-row__label" }, ["Tự nhập câu / đoạn của bạn", h("div", { class: "small muted" }, "VD: một đoạn trong bài thuyết trình")]),
      h("span", { class: "task-row__meta small muted" }, "›"),
    ]));
    root.appendChild(drillBox);
  }

  function drillWords(d) {
    if (d.fromVocabLevel) {
      const pool = Store.cards().filter((c) => c.level === d.fromVocabLevel && !/\s/.test(c.term));
      return UI.shuffle(pool).slice(0, 20).map((c) => c.term);
    }
    // bỏ ký hiệu trọng âm viết hoa khi chấm
    return d.words.map((w) => w.toLowerCase());
  }

  function customText(root) {
    const ta = h("textarea", { class: "textarea", rows: 4, placeholder: "Dán câu tiếng Anh cần luyện…" });
    UI.modal({
      title: "Bài đọc tự nhập",
      body: ta,
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Luyện", variant: "primary", onClick: () => {
            const t = ta.value.trim();
            if (!t) return false;
            readSession(root, [t], "Bài tự nhập", "");
          } },
      ],
    });
  }

  // words: mảng "đơn vị đọc" — từng từ hoặc cả câu
  function readSession(root, units, title, note) {
    let idx = 0;
    const scores = [];
    const t0 = Date.now();
    let curListener = null;
    // rời trang giữa chừng → tắt micro
    if (global.App && App.onCleanup) App.onCleanup(() => { if (curListener) { curListener.stop(); curListener = null; } });
    // gộp từ đơn thành nhóm 5 từ mỗi lượt cho đỡ vụn
    const isWords = units.length > 1 && units.every((u) => !/\s/.test(u));
    const chunks = [];
    if (isWords) for (let i = 0; i < units.length; i += 5) chunks.push(units.slice(i, i + 5).join("  "));
    else chunks.push(...units);

    function show() {
      root.innerHTML = "";
      if (idx >= chunks.length) return finish();
      const text = chunks[idx];
      root.appendChild(h("div", { class: "between mt-1" }, [
        h("span", { class: "small muted" }, title + " · lượt " + (idx + 1) + "/" + chunks.length),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => finish() }, "Kết thúc"),
      ]));
      const stage = h("div", { class: "card flash-stage" }, [
        note ? h("div", { class: "small muted" }, note) : null,
        h("div", { class: "read-target", id: "read-target" }, text.split(/\s+/).map((w) => h("span", { class: "w" }, w + " "))),
        h("div", { class: "row gap-sm center mt-2" }, [
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.speak(text) }, "🔊 Nghe mẫu"),
        ]),
      ]);
      root.appendChild(stage);

      const status = h("div", { class: "center small muted mt-1" }, "Nhấn nút rồi ĐỌC TO đoạn trên");
      root.appendChild(status);
      const ctrl = h("div", { class: "center mt-1" });
      root.appendChild(ctrl);

      let listener = null;
      const startBtn = h("button", { class: "btn btn--primary", onClick: start }, "🎙 Bắt đầu đọc");
      ctrl.appendChild(startBtn);

      function start() {
        ctrl.innerHTML = "";
        status.textContent = "🔴 Đang nghe… đọc to, rõ, xong thì nhấn Dừng";
        const stopBtn = h("button", { class: "btn btn--danger", onClick: () => { if (listener) listener.stop(); } }, "■ Dừng");
        ctrl.appendChild(stopBtn);
        listener = curListener = REC.STT.listen({
          continuous: true,
          onPartial: (t) => { status.textContent = "Nghe được: " + t.slice(-80); },
          onEnd: (err, finalText) => {
            listener = curListener = null;
            // lỗi micro mà chưa nghe được gì → KHÔNG chấm 0%, cho thử lại
            if (err && !finalText) {
              status.textContent = "⚠ Micro lỗi (" + err + ") — kiểm tra quyền micro rồi thử lại";
              ctrl.innerHTML = "";
              ctrl.appendChild(h("button", { class: "btn btn--primary", onClick: start }, "↻ Thử lại"));
              return;
            }
            grade(finalText || "");
          },
        });
      }

      function grade(heard) {
        const res = REC.scoreAgainst(text, heard);
        const hits = REC.phonemeHits(res.marks);
        Store.logPron(res.score, text, hits);
        scores.push(res.score);
        // tô màu
        const target = stage.querySelector("#read-target");
        target.innerHTML = "";
        res.marks.forEach((m) => target.appendChild(h("span", { class: "w " + (m.ok ? "w-ok" : "w-bad") }, m.w + " ")));
        status.innerHTML = "";
        status.appendChild(h("div", null, [
          h("span", { style: { fontWeight: 700, fontSize: "1.3rem" } }, res.score + "%"),
          h("span", { class: "small muted" }, "  · máy nghe: “" + (res.heard || "—") + "”"),
        ]));
        ctrl.innerHTML = "";
        ctrl.appendChild(h("div", { class: "row gap-sm center" }, [
          h("button", { class: "btn btn--ghost", onClick: start }, "↻ Đọc lại"),
          h("button", { class: "btn btn--primary", onClick: () => { idx++; show(); } }, "Tiếp →"),
        ]));
      }
    }

    function finish() {
      Store.logActivity("pron", Math.max(1, Math.round((Date.now() - t0) / 60000)));
      root.innerHTML = "";
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      root.appendChild(h("div", { class: "empty" }, [
        h("div", { class: "empty__icon" }, avg >= 75 ? "🏆" : "✓"),
        h("div", { style: { fontWeight: 700, fontSize: "1.3rem" } }, "Điểm trung bình: " + avg + "%"),
        h("div", { class: "small muted" }, scores.length + " lượt đọc" + (avg >= 75 ? " · Đạt chuẩn đầu ra tháng 1 (≥75%)!" : " · Mục tiêu: ≥ 75%")),
        h("button", { class: "btn btn--primary mt-2", onClick: () => home(root) }, "← Về Phát âm"),
      ]));
    }
    show();
  }

  /* ---------------- Minimal pairs ---------------- */
  function pairsView(root) {
    root.innerHTML = "";
    root.appendChild(tabs(root, "pairs"));
    root.appendChild(h("p", { class: "small muted" },
      "Cặp tối thiểu cho lỗi đặc thù người Việt. Luyện 2 bước: (1) NGHE app đọc 1 từ, chọn đúng từ; (2) tự ĐỌC cả cặp."));
    CONTENT.MINIMAL_PAIRS.forEach((set) => {
      const card = h("div", { class: "card" }, [
        h("div", { class: "between" }, [
          h("div", { style: { fontWeight: 700 } }, set.title),
          h("button", { class: "btn btn--primary btn--sm", onClick: () => pairQuiz(root, set) }, "▶ Luyện nghe"),
        ]),
        h("div", { class: "small muted" }, set.note),
        h("div", { class: "row gap-sm mt-1", style: { flexWrap: "wrap" } },
          set.pairs.map(([a, b]) => h("span", { class: "chip", onClick: () => { UI.speak(a); setTimeout(() => UI.speak(b), 1100); }, style: { cursor: "pointer" }, title: "Nghe cả cặp" },
            a + " · " + b + " 🔊"))),
      ]);
      root.appendChild(card);
    });
  }

  function pairQuiz(root, set) {
    let i = 0, ok = 0;
    const rounds = [];
    // mỗi cặp 1 lượt, thứ tự ngẫu nhiên từ nào được đọc
    set.pairs.forEach(([a, b]) => rounds.push({ a, b, target: Math.random() < 0.5 ? a : b }));
    function show() {
      root.innerHTML = "";
      if (i >= rounds.length) {
        Store.logActivity("pron", 2);
        root.appendChild(h("div", { class: "empty" }, [
          h("div", { class: "empty__icon" }, ok >= rounds.length * 0.8 ? "🏆" : "✓"),
          h("div", { style: { fontWeight: 700 } }, "Nghe đúng " + ok + "/" + rounds.length),
          h("div", { class: "small muted" }, ok < rounds.length * 0.8 ? "Chưa vững — luyện lại bộ này ngày mai." : "Tốt! Chuyển sang tự đọc cả cặp."),
          h("button", { class: "btn btn--primary mt-2", onClick: () => pairsView(root) }, "← Về Minimal pairs"),
        ]));
        return;
      }
      const r = rounds[i];
      root.appendChild(h("div", { class: "small muted mt-1" }, set.title + " · câu " + (i + 1) + "/" + rounds.length));
      const stage = h("div", { class: "card flash-stage" }, [
        h("div", { class: "small muted" }, "App đọc MỘT trong hai từ — bạn nghe thấy từ nào?"),
        h("button", { class: "btn btn--ghost mt-1", onClick: () => UI.Speech.ttsSpeak(r.target, { rate: 0.9 }) }, "🔊 Nghe lại"),
        h("div", { class: "row gap-sm center mt-2" }, [
          h("button", { class: "btn btn--primary", style: { minWidth: "120px" }, onClick: () => pick(r.a) }, r.a),
          h("button", { class: "btn btn--primary", style: { minWidth: "120px" }, onClick: () => pick(r.b) }, r.b),
        ]),
      ]);
      root.appendChild(stage);
      UI.Speech.ttsSpeak(r.target, { rate: 0.9 });
      function pick(w) {
        const correct = w === r.target;
        if (correct) ok++;
        UI.toast(correct ? "✓ Đúng: " + r.target : "✗ Sai — app đọc: " + r.target, correct ? "accent" : undefined);
        i++; setTimeout(show, 600);
      }
    }
    show();
  }

  /* ---------------- Bảng 44 âm ---------------- */
  function chartView(root) {
    root.innerHTML = "";
    root.appendChild(tabs(root, "chart"));
    CONTENT.PHONEMES.forEach((g) => {
      root.appendChild(U().sectionTitle(g.g));
      const grid = h("div", { class: "grid grid--2" });
      g.items.forEach((p) => {
        grid.appendChild(h("div", { class: "card phoneme-card" + (p.hard ? " phoneme-card--hard" : "") }, [
          h("div", { class: "between" }, [
            h("span", { class: "phoneme-ipa" }, "/" + p.ipa + "/"),
            p.hard ? h("span", { class: "badge badge--rose" }, "hay sai") : null,
          ]),
          h("div", { class: "small" }, [h("strong", null, "Ví dụ: "),
            h("span", { class: "phoneme-ex", onClick: () => UI.speak(p.ex.split(",")[0]), style: { cursor: "pointer" } }, p.ex + " 🔊")]),
          h("div", { class: "small muted" }, p.vn),
        ]));
      });
      root.appendChild(grid);
    });
  }

  /* ---------------- Tiến bộ theo âm ---------------- */
  function progressView(root) {
    root.innerHTML = "";
    root.appendChild(tabs(root, "progress"));
    const phon = Store.get().pron.phon;
    const keys = REC.TRACKED.filter((k) => phon[k] && phon[k].n >= 3);
    if (!keys.length) {
      root.appendChild(h("div", { class: "empty" }, [
        h("div", { class: "empty__icon" }, "📈"),
        h("div", { class: "small muted" }, "Chưa đủ dữ liệu. Luyện các bài Đọc & chấm — app sẽ thống kê độ chính xác theo từng âm."),
      ]));
      return;
    }
    keys.sort((a, b) => (phon[a].ok / phon[a].n) - (phon[b].ok / phon[b].n));
    const card = h("div", { class: "card" });
    keys.forEach((k) => {
      const p = phon[k];
      const pct = Math.round((p.ok / p.n) * 100);
      card.appendChild(h("div", { class: "mt-1" }, [
        h("div", { class: "between small" }, [
          h("span", null, [h("strong", null, "/" + k + "/"), " · " + p.n + " từ"]),
          h("span", { class: pct < 60 ? "text-bad" : (pct >= 80 ? "text-ok" : "") }, pct + "%"),
        ]),
        UI.bar(pct, pct < 60 ? "amber" : "accent"),
      ]));
    });
    root.appendChild(card);
    root.appendChild(h("p", { class: "small muted" }, "Âm dưới 60%: mở tab Minimal pairs và luyện bộ tương ứng mỗi ngày 5 phút."));
  }
})(window);
