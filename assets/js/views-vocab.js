/* ============================================================
   views-vocab.js — Module 1: Từ vựng (FSRS, 2 chiều, nói to)
   ------------------------------------------------------------
   Nguyên tắc: retrieval practice — LUÔN cố nhớ trước khi xem
   đáp án. Chiều Việt→Anh (khó hơn) được ưu tiên. Chế độ "nói to"
   dùng nhận dạng giọng nói để đối chiếu.
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;
  const U = () => Views.util;

  const RATING_LABELS = [null, "Quên", "Khó", "Nhớ", "Dễ"];
  const RATING_CLASS = [null, "btn--danger", "btn--ghost", "btn--primary", "btn--accent"];

  Views.vocab = function () {
    const root = h("div");
    renderHome(root);
    return root;
  };

  function renderHome(root) {
    root.innerHTML = "";
    const due = Store.dueQueue();
    const newLeft = Math.max(0, Store.newPerDay() - Store.newIntroducedToday());
    const newQ = Store.newQueue(newLeft);
    const acc = Store.recentAccuracy();

    root.appendChild(h("div", { class: "grid grid--4" }, [
      U().statCard("Thẻ đến hạn", String(due.length), "ôn ngay hôm nay"),
      U().statCard("Từ mới hôm nay", newQ.length + " / " + Store.newPerDay(), "theo lộ trình tháng " + Store.currentMonth()),
      U().statCard("Đã thuộc", Store.masteredCount() + " / 2000", "nhớ ổn định ≥ 3 tuần"),
      U().statCard("Độ chính xác 7 ngày", acc == null ? "—" : acc + "%",
        acc == null ? "" : (acc > 85 ? "hơi dễ — tăng từ mới" : acc < 65 ? "hơi khó — giảm từ mới" : "vùng học tối ưu ✓")),
    ]));

    const actions = h("div", { class: "card" }, [
      h("div", { class: "row gap-sm", style: { flexWrap: "wrap" } }, [
        h("button", {
          class: "btn btn--primary" + (due.length ? "" : " btn--ghost"),
          disabled: due.length ? null : "disabled",
          onClick: () => startReview(root, false),
        }, "▶ Ôn " + due.length + " thẻ"),
        h("button", {
          class: "btn btn--accent" + (due.length ? "" : " btn--ghost"),
          disabled: due.length && REC.STT.supported() ? null : "disabled",
          onClick: () => startReview(root, true),
          title: REC.STT.supported() ? "" : "Trình duyệt không hỗ trợ nhận dạng giọng nói (dùng Chrome/Edge)",
        }, "🎙 Ôn chế độ NÓI TO"),
        h("button", {
          class: "btn " + (newQ.length ? "btn--ghost" : "btn--ghost"),
          disabled: newQ.length ? null : "disabled",
          onClick: () => startLearnNew(root, newQ),
        }, "✚ Học " + newQ.length + " từ mới"),
        h("button", { class: "btn btn--ghost", onClick: () => renderBrowse(root) }, "☰ Kho từ"),
      ]),
      h("p", { class: "small muted mb-0 mt-1" },
        "Mỗi thẻ học 2 chiều: Việt→Anh (truy hồi, khó hơn, hiệu quả hơn) và Anh→Việt (nhận biết). Thuật toán FSRS tự xếp lịch ôn."),
    ]);
    root.appendChild(actions);

    if (!due.length && !newQ.length) {
      root.appendChild(h("div", { class: "empty" }, [
        h("div", { class: "empty__icon" }, "🎉"),
        h("div", { style: { fontWeight: 600 } }, "Hết việc hôm nay!"),
        h("div", { class: "small muted" }, "Quay lại ngày mai, hoặc luyện Shadowing / Phát âm."),
      ]));
    }
  }

  /* ---------------- Học từ mới ---------------- */
  function startLearnNew(root, queue) {
    let idx = 0;
    const t0 = Date.now();
    function show() {
      root.innerHTML = "";
      if (idx >= queue.length) {
        Store.logActivity("vocab", Math.max(1, Math.round((Date.now() - t0) / 60000)));
        UI.toast("Đã thêm " + queue.length + " từ vào lịch ôn ✓", "accent");
        renderHome(root);
        return;
      }
      const c = queue[idx];
      root.appendChild(h("div", { class: "small muted mt-1" }, "Từ mới " + (idx + 1) + " / " + queue.length + " · nhóm: " + (c.groupName || "—")));
      const card = h("div", { class: "card flash-stage" }, [
        h("div", { class: "vocab-ic vocab-ic--lg" }, c.icon || "📘"),
        h("div", { class: "daily-word" }, c.term),
        h("div", { class: "vocab-ipa" }, c.ipa || ""),
        h("div", { class: "vocab-pos small muted" }, c.pos),
        h("div", { class: "daily-mean" }, c.meaning),
        c.example ? h("div", { class: "vocab-ex mt-2" }, ["“", c.example, "”"]) : null,
        c.exampleVi ? h("div", { class: "vocab-ex-vi small muted" }, c.exampleVi) : null,
        h("div", { class: "row gap-sm center mt-2" }, [
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.speak(c.term) }, "🔊 Từ"),
          c.example ? h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.speak(c.example) }, "🔊 Câu") : null,
        ]),
      ]);
      root.appendChild(card);
      root.appendChild(h("div", { class: "row gap-sm center mt-2" }, [
        h("button", { class: "btn btn--ghost", onClick: () => { idx++; show(); } }, "Bỏ qua"),
        h("button", {
          class: "btn btn--primary", onClick: () => {
            Store.introduceCard(c.id);
            UI.speak(c.term);
            idx++; show();
          },
        }, "Đã đọc to 3 lần → vào lịch ôn ✓"),
      ]));
      root.appendChild(h("p", { class: "small muted center mt-1" }, "Đọc TO từ + câu ví dụ 3 lần trước khi tiếp tục (elaboration: gắn từ vào ngữ cảnh công việc của bạn)."));
      UI.speak(c.term);
    }
    show();
  }

  /* ---------------- Phiên ôn (retrieval practice) ---------------- */
  function startReview(root, speakMode) {
    const queue = Store.dueQueue();
    let done = 0, again = 0;
    const t0 = Date.now();
    let sttStop = null;

    function finish() {
      if (sttStop) { sttStop.stop(); sttStop = null; }
      Store.logActivity("vocab", Math.max(1, Math.round((Date.now() - t0) / 60000)));
      root.innerHTML = "";
      root.appendChild(h("div", { class: "empty" }, [
        h("div", { class: "empty__icon" }, "✓"),
        h("div", { style: { fontWeight: 700, fontSize: "1.2rem" } }, "Xong phiên ôn!"),
        h("div", { class: "small muted" }, done + " thẻ · " + again + " thẻ cần học lại"),
        h("button", { class: "btn btn--primary mt-2", onClick: () => renderHome(root) }, "← Về Từ vựng"),
      ]));
    }

    function show() {
      if (sttStop) { sttStop.stop(); sttStop = null; }
      if (!queue.length) return finish();
      const item = queue[0];
      const c = item.card, dir = item.dir;
      root.innerHTML = "";
      root.appendChild(h("div", { class: "between mt-1" }, [
        h("span", { class: "small muted" }, "Còn " + queue.length + " thẻ · " +
          (dir === "ve" ? "Việt → Anh" + (speakMode ? " · NÓI TO 🎙" : "") : "Anh → Việt")),
        h("button", { class: "btn btn--ghost btn--sm", onClick: finish }, "Kết thúc"),
      ]));

      const stage = h("div", { class: "card flash-stage" });
      root.appendChild(stage);

      if (dir === "ve") {
        // Việt → Anh: hiện nghĩa, phải NHỚ RA / NÓI RA từ tiếng Anh
        stage.appendChild(h("div", { class: "vocab-ic vocab-ic--md" }, c.icon || "📘"));
        stage.appendChild(h("div", { class: "daily-mean", style: { fontSize: "1.3rem" } }, c.meaning));
        stage.appendChild(h("div", { class: "small muted" }, (c.pos || "") + (c.groupName ? " · " + c.groupName : "")));
        if (speakMode) stage.appendChild(h("div", { class: "small muted mt-1" }, "Nói từ tiếng Anh ra tiếng →"));
      } else {
        // Anh → Việt: hiện từ + audio, phải nhớ nghĩa
        stage.appendChild(h("div", { class: "daily-word" }, c.term));
        stage.appendChild(h("div", { class: "vocab-ipa" }, c.ipa || ""));
        stage.appendChild(h("button", { class: "btn btn--ghost btn--sm mt-1", onClick: () => UI.speak(c.term) }, "🔊"));
      }

      const revealBox = h("div", { class: "mt-2 center" });
      root.appendChild(revealBox);

      function reveal(autoRating) {
        revealBox.innerHTML = "";
        // đáp án
        const ans = h("div", { class: "card", style: { textAlign: "center" } });
        if (dir === "ve") {
          ans.appendChild(h("div", { class: "daily-word", style: { fontSize: "1.6rem" } }, c.term));
          ans.appendChild(h("div", { class: "vocab-ipa" }, c.ipa || ""));
          if (c.example) ans.appendChild(h("div", { class: "vocab-ex" }, ["“", c.example, "”"]));
        } else {
          ans.appendChild(h("div", { style: { fontSize: "1.2rem", fontWeight: 700 } }, c.meaning));
          if (c.exampleVi) ans.appendChild(h("div", { class: "small muted" }, c.exampleVi));
        }
        revealBox.appendChild(ans);
        UI.speak(c.term);

        // 4 nút đánh giá + xem trước khoảng cách
        const prev = Store.previewIntervals(c.id, dir) || {};
        const btns = h("div", { class: "row gap-sm center mt-2", style: { flexWrap: "wrap" } });
        [1, 2, 3, 4].forEach((r) => {
          const d = prev[r];
          btns.appendChild(h("button", {
            class: "btn " + RATING_CLASS[r] + (autoRating === r ? " btn-suggested" : ""),
            onClick: () => rate(r),
          }, [RATING_LABELS[r], h("span", { class: "small", style: { opacity: 0.7, marginLeft: "6px" } },
              d === 0 ? "hôm nay" : d + " ng")]));
        });
        revealBox.appendChild(btns);
        // phím tắt 1..4
        document.onkeydown = (e) => {
          if (e.target.matches("input,textarea")) return;
          const r = +e.key;
          if (r >= 1 && r <= 4) { document.onkeydown = null; rate(r); }
        };
      }

      function rate(r) {
        document.onkeydown = null;
        Store.reviewCard(c.id, dir, r);
        queue.shift();
        done++;
        if (r === 1) { again++; queue.push(item); } // học lại cuối phiên
        show();
      }

      if (speakMode && dir === "ve" && REC.STT.supported()) {
        // chế độ NÓI TO: nghe người học nói từ, đối chiếu
        const status = h("div", { class: "small muted center mt-1" }, "🎙 Đang nghe… nói từ tiếng Anh");
        revealBox.appendChild(status);
        sttStop = REC.STT.listen({
          onFinal: (text) => {
            sttStop = null;
            const said = REC.normWords(text).join(" ");
            const target = REC.normWords(c.term).join(" ");
            const ok = said.indexOf(target) >= 0;
            status.textContent = ok ? "✓ Nghe được: “" + text + "”" : "Nghe được: “" + (text || "(không rõ)") + "”";
            status.className = "small center mt-1 " + (ok ? "text-ok" : "text-bad");
            reveal(ok ? 3 : 1);
          },
        });
        revealBox.appendChild(h("button", { class: "btn btn--ghost btn--sm mt-1", onClick: () => { if (sttStop) { sttStop.stop(); } } }, "Dừng nghe / hiện đáp án"));
      } else {
        revealBox.appendChild(h("button", { class: "btn btn--primary btn--block", onClick: () => reveal() },
          dir === "ve" ? "Tôi đã nhớ ra / nói ra → Hiện đáp án" : "Hiện nghĩa"));
        revealBox.appendChild(h("p", { class: "small muted mt-1" }, "Cố nhớ ra trước — đừng vội xem đáp án (retrieval practice)."));
      }
    }
    show();
  }

  /* ---------------- Kho từ (duyệt / thêm) ---------------- */
  function renderBrowse(root) {
    root.innerHTML = "";
    root.appendChild(h("div", { class: "between mt-1" }, [
      h("h2", { class: "section-title" }, "Kho từ (" + Store.cards().length + ")"),
      h("div", { class: "row gap-sm" }, [
        h("button", { class: "btn btn--primary btn--sm", onClick: () => addCardModal(root) }, "✚ Thêm từ"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => renderHome(root) }, "← Quay lại"),
      ]),
    ]));
    const search = h("input", { class: "input", placeholder: "Tìm từ / nghĩa…", onInput: (e) => renderList(e.target.value) });
    root.appendChild(h("div", { class: "card" }, search));
    const listWrap = h("div");
    root.appendChild(listWrap);

    function renderList(q) {
      listWrap.innerHTML = "";
      q = (q || "").toLowerCase().trim();
      let cards = Store.cards();
      if (q) cards = cards.filter((c) => c.term.toLowerCase().includes(q) || c.meaning.toLowerCase().includes(q));
      const groups = new Map();
      cards.forEach((c) => {
        const k = "L" + (c.level || 2) + " · " + (c.groupName || (c.custom ? "Từ tự thêm" : "Khác"));
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(c);
      });
      [...groups.keys()].sort().forEach((g) => {
        listWrap.appendChild(h("div", { class: "eyebrow mt-2" }, g + " (" + groups.get(g).length + ")"));
        const box = h("div", { class: "card", style: { padding: "4px 0" } });
        groups.get(g).slice(0, 100).forEach((c) => {
          box.appendChild(h("div", { class: "vocab-row" }, [
            h("span", { class: "vocab-ic vocab-ic--sm" }, c.icon || "•"),
            h("div", { style: { flex: 1, minWidth: 0 } }, [
              h("div", null, [
                h("span", { class: "vocab-term" }, c.term), " ",
                h("span", { class: "vocab-ipa small" }, c.ipa || ""),
                c.intro ? (FSRS.isMastered(c.ve) ? h("span", { class: "badge badge--accent", style: { marginLeft: "6px" } }, "thuộc") : h("span", { class: "badge badge--sky", style: { marginLeft: "6px" } }, "đang học")) : null,
              ]),
              h("div", { class: "small muted", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.meaning),
            ]),
            h("button", { class: "icon-btn", onClick: () => UI.speak(c.term), title: "Nghe" }, "🔊"),
            c.custom ? h("button", { class: "icon-btn", title: "Xóa", onClick: () => { Store.deleteCard(c.id); renderList(q); } }, "🗑") : null,
          ]));
        });
        listWrap.appendChild(box);
      });
      if (!cards.length) listWrap.appendChild(h("div", { class: "empty" }, [h("div", { class: "empty__icon" }, "🔍"), "Không tìm thấy"]));
    }
    renderList("");
  }

  function addCardModal(root) {
    const term = h("input", { class: "input", placeholder: "supervision" });
    const meaning = h("input", { class: "input", placeholder: "sự giám sát" });
    const pos = h("input", { class: "input", placeholder: "n. / v. / adj." });
    const ex = h("input", { class: "input", placeholder: "Câu ví dụ trong công việc của bạn (elaboration)" });
    UI.modal({
      title: "Thêm từ mới",
      body: h("div", null, [
        h("div", { class: "field" }, [h("label", { class: "small" }, "Từ tiếng Anh *"), term]),
        h("div", { class: "field" }, [h("label", { class: "small" }, "Nghĩa tiếng Việt *"), meaning]),
        h("div", { class: "field" }, [h("label", { class: "small" }, "Từ loại"), pos]),
        h("div", { class: "field" }, [h("label", { class: "small" }, "Câu ví dụ (gắn với ngữ cảnh công việc)"), ex]),
      ]),
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Thêm", variant: "primary", onClick: () => {
            if (!term.value.trim() || !meaning.value.trim()) { UI.toast("Cần cả từ và nghĩa"); return false; }
            Store.addCard({ term: term.value.trim(), meaning: meaning.value.trim(), pos: pos.value.trim(), example: ex.value.trim(), level: 2 });
            UI.toast("Đã thêm ✓", "accent");
            renderBrowse(root);
          } },
      ],
    });
  }
})(window);
