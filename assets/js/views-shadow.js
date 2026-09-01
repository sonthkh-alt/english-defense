/* ============================================================
   views-shadow.js — Module 3: Shadowing
   ------------------------------------------------------------
   Ưu tiên nhại NGƯỜI THẬT qua video bản xứ (chuẩn nhất):
   3 bước: nghe lấy ý → nghe + phụ đề → shadowing (nói đè).
   Điều khiển tốc độ + lặp đoạn A–B ngay trên video YouTube.
   Ghi âm và nghe lại để so với bản gốc.
   Chế độ 2 (offline): câu mẫu giọng OmniVoice render sẵn.
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;
  const U = () => Views.util;

  /* ---------- điều khiển YouTube iframe (postMessage) ---------- */
  function ytPlayer(iframe) {
    let current = 0, dur = 0;
    function cmd(func, args) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: args || [] }), "*");
      } catch (e) {}
    }
    function onMsg(e) {
      if (!String(e.origin).includes("youtube")) return;
      try {
        const d = JSON.parse(e.data);
        if (d.info && typeof d.info.currentTime === "number") current = d.info.currentTime;
        if (d.info && typeof d.info.duration === "number") dur = d.info.duration;
      } catch (err) {}
    }
    window.addEventListener("message", onMsg);
    iframe.addEventListener("load", () => {
      try { iframe.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*"); } catch (e) {}
    });
    return {
      play: () => cmd("playVideo"),
      pause: () => cmd("pauseVideo"),
      seek: (t) => cmd("seekTo", [t, true]),
      rate: (r) => cmd("setPlaybackRate", [r]),
      time: () => current,
      destroy: () => window.removeEventListener("message", onMsg),
    };
  }

  /* ================= TRANG CHÍNH ================= */
  Views.shadow = function () {
    const root = h("div");
    home(root);
    return root;
  };

  function stageOfMonth() { return ROADMAP.month(Store.currentMonth()).stage; }

  function home(root) {
    root.innerHTML = "";
    const st = stageOfMonth();
    root.appendChild(h("div", { class: "card callout" }, [
      h("div", { class: "callout__icon" }, "🗣"),
      h("div", { class: "small" }, [
        h("strong", null, "Quy trình shadowing (nhại người thật): "),
        "① nghe lấy ý (không phụ đề) → ② nghe + đọc phụ đề → ③ nói đè theo diễn giả, chậm hơn ~0,5 giây → ④ ghi âm & so với bản gốc. ",
        h("span", { class: "muted" }, "Độ dài theo tháng: T2: 10–15s · T5: 30–60s · T7+: 2–3 phút."),
      ]),
    ]));

    // --- Video người thật theo giai đoạn ---
    root.appendChild(U().sectionTitle("Video người bản xứ — giai đoạn " + st,
      h("span", { class: "small muted" }, "chuẩn nhất để nhại")));
    const vids = [];
    for (let s = 1; s <= 4; s++) (CONTENT.SHADOW_LIB.videos[s] || []).forEach((v) => vids.push({ v, s }));
    const box = h("div", { class: "card", style: { padding: "6px 0" } });
    vids.forEach(({ v, s }) => {
      const stat = Store.shadowStat("vid:" + v.id);
      box.appendChild(h("a", {
        class: "task-row" + (s > st ? " task-row--locked" : ""), href: "javascript:;",
        onClick: () => (v.y ? videoSession(root, v) : window.open(v.link, "_blank")),
      }, [
        h("span", { class: "task-row__icon" }, s < st ? "✓" : (s === st ? "▶" : "🔒")),
        h("span", { class: "task-row__label" }, [
          v.t + " · " + v.mins + "p",
          h("div", { class: "small muted" }, "GĐ" + s + " · " + v.src + " — " + v.note),
        ]),
        h("span", { class: "task-row__meta small muted" }, stat.n ? stat.n + " lần" : "›"),
      ]));
    });
    root.appendChild(box);

    // --- Video tự thêm ---
    const custom = Store.get().shadow.custom;
    root.appendChild(U().sectionTitle("Video / bài của bạn",
      h("button", { class: "btn btn--ghost btn--sm", onClick: () => addCustomModal(root) }, "✚ Thêm")));
    if (custom.length) {
      const cbox = h("div", { class: "card", style: { padding: "6px 0" } });
      custom.forEach((it) => {
        cbox.appendChild(h("a", { class: "task-row", href: "javascript:;", onClick: () => videoSession(root, { id: it.id, t: it.title, y: it.y, src: "của bạn", note: "", mins: 0, transcript: it.transcript }) }, [
          h("span", { class: "task-row__icon" }, "▶"),
          h("span", { class: "task-row__label" }, it.title),
          h("span", { class: "task-row__meta" },
            h("button", { class: "icon-btn", onClick: (e) => { e.stopPropagation(); Store.deleteShadowCustom(it.id); home(root); } }, "🗑")),
        ]));
      });
      root.appendChild(cbox);
    } else {
      root.appendChild(h("p", { class: "small muted" }, "Dán link YouTube bài giảng đúng chuyên ngành của bạn (kèm transcript nếu có) để luyện sát đề tài nhất."));
    }

    // --- Câu mẫu OmniVoice (offline) ---
    root.appendChild(U().sectionTitle("Câu mẫu giọng OmniVoice (offline)",
      h("span", { class: "small muted" }, "khi không tiện mở video")));
    const sbox = h("div", { class: "card", style: { padding: "6px 0" } });
    for (let s = 1; s <= 4; s++) {
      const stat = Store.shadowStat("sen:" + s);
      sbox.appendChild(h("a", {
        class: "task-row" + (s > st ? " task-row--locked" : ""), href: "javascript:;",
        onClick: () => sentenceSession(root, s),
      }, [
        h("span", { class: "task-row__icon" }, s <= st ? "▶" : "🔒"),
        h("span", { class: "task-row__label" }, "Bộ câu giai đoạn " + s + " (6 câu)"),
        h("span", { class: "task-row__meta small muted" }, stat.n ? stat.n + " lần" : "›"),
      ]));
    }
    root.appendChild(sbox);
  }

  function addCustomModal(root) {
    const url = h("input", { class: "input", placeholder: "https://www.youtube.com/watch?v=…" });
    const title = h("input", { class: "input", placeholder: "Tên bài (VD: Bài giảng phân cấp tài khóa)" });
    const tr = h("textarea", { class: "textarea", rows: 4, placeholder: "Transcript (tùy chọn) — dán phụ đề để vừa nghe vừa dò" });
    UI.modal({
      title: "Thêm video shadowing",
      body: h("div", null, [
        h("div", { class: "field" }, [h("label", { class: "small" }, "Link YouTube *"), url]),
        h("div", { class: "field" }, [h("label", { class: "small" }, "Tên bài"), title]),
        h("div", { class: "field" }, [h("label", { class: "small" }, "Transcript"), tr]),
      ]),
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Thêm", variant: "primary", onClick: () => {
            const m = String(url.value).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
            if (!m) { UI.toast("Link YouTube không hợp lệ"); return false; }
            Store.addShadowCustom({ title: title.value.trim() || "Video của tôi", y: m[1], transcript: tr.value.trim() });
            home(root);
          } },
      ],
    });
  }

  /* ================= PHIÊN VIDEO (người thật) ================= */
  function videoSession(root, v) {
    root.innerHTML = "";
    const t0 = Date.now();
    let player = null, loopA = null, loopB = null, loopTimer = null, recObj = null;

    root.appendChild(h("div", { class: "between mt-1" }, [
      h("span", { class: "small", style: { fontWeight: 600 } }, v.t),
      h("button", { class: "btn btn--ghost btn--sm", onClick: leave }, "← Thư viện"),
    ]));

    const iframe = h("iframe", {
      class: "shadow-frame", src: CONTENT.yt(v.y),
      allow: "autoplay; encrypted-media", allowfullscreen: "true",
      title: v.t,
    });
    root.appendChild(h("div", { class: "video-wrap" }, iframe));
    player = ytPlayer(iframe);

    // --- 3 bước ---
    const steps = h("div", { class: "card" }, [
      h("div", { class: "small", style: { fontWeight: 700 } }, "3 bước (làm theo thứ tự):"),
      stepRow("① Nghe lấy ý — KHÔNG bật phụ đề, cố hiểu 50%"),
      stepRow("② Nghe + phụ đề (nút CC trên video) — dò từng câu"),
      stepRow("③ Shadowing — nói đè theo, chậm hơn ~0,5 giây; đoạn khó thì lặp A–B"),
    ]);
    root.appendChild(steps);
    function stepRow(text) {
      const cb = h("input", { type: "checkbox" });
      return h("label", { class: "check-item small" }, [cb, h("span", null, " " + text)]);
    }

    // --- điều khiển tốc độ + A-B loop ---
    const rates = [0.5, 0.75, 1, 1.25];
    const ctrl = h("div", { class: "card" }, [
      h("div", { class: "row gap-sm", style: { flexWrap: "wrap", alignItems: "center" } }, [
        h("span", { class: "small muted" }, "Tốc độ:"),
        ...rates.map((r) => h("button", {
          class: "btn btn--sm " + (r === 1 ? "btn--primary" : "btn--ghost"),
          onClick: (e) => {
            player.rate(r);
            ctrl.querySelectorAll(".btn").forEach((b) => b.classList.replace("btn--primary", "btn--ghost"));
            e.target.classList.replace("btn--ghost", "btn--primary");
          },
        }, r + "x")),
      ]),
      h("div", { class: "row gap-sm mt-1", style: { flexWrap: "wrap", alignItems: "center" } }, [
        h("span", { class: "small muted" }, "Lặp đoạn khó:"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: setA }, "Ⓐ Đánh dấu đầu"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: setB }, "Ⓑ Đánh dấu cuối"),
        h("button", { class: "btn btn--danger btn--sm", onClick: clearLoop }, "✕ Bỏ lặp"),
        h("span", { class: "small muted", id: "loop-status" }, "chưa đặt"),
      ]),
      h("p", { class: "small muted mb-0 mt-1" }, "Mẹo: nếu nút không tác động, bấm ▶ trên video một lần rồi thử lại (YouTube cần video đang chạy)."),
    ]);
    root.appendChild(ctrl);

    function setA() { loopA = player.time(); updateLoop(); }
    function setB() { loopB = player.time(); startLoop(); updateLoop(); }
    function updateLoop() {
      const el = ctrl.querySelector("#loop-status");
      el.textContent = (loopA != null ? "A=" + fmt(loopA) : "chưa đặt") + (loopB != null ? " → B=" + fmt(loopB) : "");
    }
    function fmt(t) { return Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0"); }
    function startLoop() {
      clearInterval(loopTimer);
      if (loopA == null || loopB == null || loopB <= loopA) return;
      loopTimer = setInterval(() => { if (player.time() >= loopB) player.seek(loopA); }, 400);
    }
    function clearLoop() { loopA = loopB = null; clearInterval(loopTimer); updateLoop(); }

    // --- transcript (nếu có) ---
    if (v.transcript) {
      root.appendChild(h("div", { class: "card" }, [
        h("div", { class: "small", style: { fontWeight: 700 } }, "Transcript"),
        h("div", { class: "small", style: { whiteSpace: "pre-wrap", maxHeight: "220px", overflow: "auto" } }, v.transcript),
      ]));
    }

    // --- ghi âm so sánh ---
    const recBox = h("div", { class: "card" });
    root.appendChild(recBox);
    renderRec();
    function renderRec() {
      recBox.innerHTML = "";
      recBox.appendChild(h("div", { class: "small", style: { fontWeight: 700 } }, "Ghi âm shadowing của bạn"));
      if (!REC.Rec.supported()) { recBox.appendChild(h("p", { class: "small muted" }, "Trình duyệt không hỗ trợ ghi âm.")); return; }
      const row = h("div", { class: "row gap-sm mt-1", style: { flexWrap: "wrap" } });
      recBox.appendChild(row);
      if (!REC.Rec.isRecording()) {
        row.appendChild(h("button", { class: "btn btn--primary btn--sm", onClick: async () => { try { await REC.Rec.start(); renderRec(); } catch (e) { UI.toast("Không truy cập được micro"); } } }, "● Ghi âm"));
      } else {
        row.appendChild(h("button", { class: "btn btn--danger btn--sm", onClick: async () => { recObj = await REC.Rec.stop(); renderRec(); } }, "■ Dừng"));
        row.appendChild(h("span", { class: "small muted" }, "đang ghi — shadowing song song với video…"));
      }
      if (recObj) {
        recBox.appendChild(h("audio", { controls: "controls", src: recObj.url, class: "mt-1", style: { width: "100%" } }));
        recBox.appendChild(h("div", { class: "row gap-sm mt-1" }, [
          h("button", {
            class: "btn btn--ghost btn--sm", onClick: async () => {
              await REC.Vault.save({ id: "rec-" + Date.now(), date: Store.today(), kind: "shadow", note: v.t, secs: recObj.secs, blob: recObj.blob });
              UI.toast("Đã lưu bản thu để so tiến bộ ✓", "accent");
            },
          }, "💾 Lưu bản thu"),
          h("span", { class: "small muted" }, recObj.secs + " giây — nghe lại và so nhịp/ngắt nghỉ với bản gốc"),
        ]));
      }
    }

    root.appendChild(h("div", { class: "center mt-2" },
      h("button", {
        class: "btn btn--accent", onClick: () => {
          Store.shadowDone("vid:" + v.id);
          Store.logActivity("shadow", Math.max(3, Math.round((Date.now() - t0) / 60000)));
          UI.toast("Đã tính buổi shadowing hôm nay ✓", "accent");
          leave();
        },
      }, "✓ Hoàn thành buổi shadowing")));

    function leave() {
      clearInterval(loopTimer);
      if (player) player.destroy();
      home(root);
    }
  }

  /* ================= PHIÊN CÂU MẪU (OmniVoice) ================= */
  function sentenceSession(root, stage) {
    const sents = CONTENT.shadowSentences(stage) || [];
    let idx = 0, mode = 1; // 1 nghe · 2 nghe+đọc · 3 shadowing
    const t0 = Date.now();
    let recObj = null;

    function show() {
      root.innerHTML = "";
      if (idx >= sents.length) {
        Store.shadowDone("sen:" + stage);
        Store.logActivity("shadow", Math.max(2, Math.round((Date.now() - t0) / 60000)));
        root.appendChild(h("div", { class: "empty" }, [
          h("div", { class: "empty__icon" }, "✓"),
          h("div", { style: { fontWeight: 700 } }, "Xong bộ câu giai đoạn " + stage + "!"),
          h("button", { class: "btn btn--primary mt-2", onClick: () => home(root) }, "← Thư viện"),
        ]));
        return;
      }
      const s = sents[idx];
      root.appendChild(h("div", { class: "between mt-1" }, [
        h("span", { class: "small muted" }, "Câu " + (idx + 1) + "/" + sents.length + " · GĐ" + stage),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => home(root) }, "← Thư viện"),
      ]));

      root.appendChild(h("div", { class: "row gap-sm mt-1" }, [1, 2, 3].map((m) =>
        h("button", {
          class: "btn btn--sm " + (m === mode ? "btn--primary" : "btn--ghost"),
          onClick: () => { mode = m; show(); },
        }, m === 1 ? "① Nghe" : m === 2 ? "② Nghe + đọc" : "③ Shadowing"))));

      const stage2 = h("div", { class: "card flash-stage" });
      if (mode >= 2) {
        stage2.appendChild(h("div", { class: "daily-sentence" }, s.en));
        stage2.appendChild(h("div", { class: "small muted" }, s.vi));
      } else {
        stage2.appendChild(h("div", { class: "daily-sentence muted" }, "🎧 Chỉ nghe — cố hiểu trước khi xem chữ"));
      }
      stage2.appendChild(h("div", { class: "row gap-sm center mt-2", style: { flexWrap: "wrap" } }, [
        h("button", { class: "btn btn--primary btn--sm", onClick: () => UI.speak(s.en) }, "🔊 Phát"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.Speech.ttsSpeak(s.en, { rate: 0.65 }) }, "🐢 Chậm 0.65x"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => { UI.speak(s.en); setTimeout(() => UI.speak(s.en), 3500); } }, "🔁 Lặp 2 lần"),
      ]));
      root.appendChild(stage2);

      if (mode === 3) {
        const recBox = h("div", { class: "card center" });
        root.appendChild(recBox);
        renderRec(recBox, s);
      }

      root.appendChild(h("div", { class: "row gap-sm center mt-2" }, [
        idx > 0 ? h("button", { class: "btn btn--ghost", onClick: () => { idx--; recObj = null; show(); } }, "← Trước") : null,
        h("button", { class: "btn btn--primary", onClick: () => { idx++; recObj = null; show(); } }, "Câu tiếp →"),
      ]));
      if (mode === 1) UI.speak(s.en);
    }

    function renderRec(box, s) {
      box.innerHTML = "";
      box.appendChild(h("div", { class: "small muted" }, "Phát audio rồi NÓI ĐÈ theo (trễ ~0,5 giây). Ghi âm để so."));
      if (!REC.Rec.supported()) return;
      const row = h("div", { class: "row gap-sm center mt-1" });
      box.appendChild(row);
      if (!REC.Rec.isRecording()) {
        row.appendChild(h("button", {
          class: "btn btn--primary btn--sm", onClick: async () => {
            try { await REC.Rec.start(); UI.speak(s.en); renderRec(box, s); } catch (e) { UI.toast("Không truy cập được micro"); }
          },
        }, "● Ghi + phát mẫu"));
      } else {
        row.appendChild(h("button", { class: "btn btn--danger btn--sm", onClick: async () => { recObj = await REC.Rec.stop(); renderRec(box, s); } }, "■ Dừng"));
      }
      if (recObj) {
        box.appendChild(h("audio", { controls: "controls", src: recObj.url, class: "mt-1", style: { width: "100%" } }));
        box.appendChild(h("button", { class: "btn btn--ghost btn--sm mt-1", onClick: () => { UI.speak(s.en); } }, "🔊 Nghe lại bản gốc để so"));
      }
    }
    show();
  }
})(window);
