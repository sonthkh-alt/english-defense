/* ============================================================
   views-core.js — Dashboard (Module 6) + Lộ trình + Cài đặt
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;

  /* ---------- helpers dùng chung ---------- */
  function sparkline(values, opts) {
    opts = opts || {};
    const w = opts.w || 220, hh = opts.h || 48, pad = 4;
    const svgNS = "http://www.w3.org/2000/svg";
    const wrap = h("div", { class: "spark" });
    if (!values.length) { wrap.appendChild(h("div", { class: "small muted" }, "Chưa có dữ liệu")); return wrap; }
    const max = Math.max(1, ...values), min = Math.min(0, ...values);
    const pts = values.map((v, i) => {
      const x = pad + (i * (w - 2 * pad)) / Math.max(1, values.length - 1);
      const y = hh - pad - ((v - min) / (max - min || 1)) * (hh - 2 * pad);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + hh);
    svg.setAttribute("class", "spark__svg");
    const poly = document.createElementNS(svgNS, "polyline");
    poly.setAttribute("points", pts.join(" "));
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", opts.color || "var(--brand)");
    poly.setAttribute("stroke-width", "2.5");
    poly.setAttribute("stroke-linecap", "round");
    poly.setAttribute("stroke-linejoin", "round");
    svg.appendChild(poly);
    if (values.length === 1) {
      const c = document.createElementNS(svgNS, "circle");
      const [cx, cy] = pts[0].split(",");
      c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", "3");
      c.setAttribute("fill", opts.color || "var(--brand)");
      svg.appendChild(c);
    }
    wrap.appendChild(svg);
    return wrap;
  }

  function sectionTitle(text, extra) {
    return h("div", { class: "between mt-2", style: { alignItems: "baseline" } }, [
      h("h2", { class: "section-title" }, text), extra || null,
    ]);
  }

  function statCard(label, value, foot, cls) {
    return h("div", { class: "card stat" + (cls ? " " + cls : "") }, [
      h("div", { class: "stat__label" }, label),
      h("div", { class: "stat__value" }, value),
      foot ? h("div", { class: "stat__foot" }, foot) : null,
    ]);
  }

  function fmtMin(mins) {
    if (mins < 60) return mins + " phút";
    return Math.floor(mins / 60) + " giờ " + (mins % 60 ? (mins % 60) + "p" : "");
  }

  Views.util = { sparkline, sectionTitle, statCard, fmtMin };

  /* ================= DASHBOARD ================= */
  Views.dashboard = function () {
    const root = h("div");
    const dn = Store.dayNumber();

    // Chưa bắt đầu → thẻ khởi động
    if (dn == null) {
      root.appendChild(h("div", { class: "card callout callout--accent" }, [
        h("div", { class: "callout__icon" }, "🚀"),
        h("div", null, [
          h("div", { style: { fontWeight: 700 } }, "Bắt đầu lộ trình 12 tháng"),
          h("p", { class: "small muted" }, "Nhấn nút để lấy hôm nay làm Ngày 1. Mỗi ngày 45–60 phút, chia 2–3 phiên ngắn."),
          h("button", { class: "btn btn--primary", onClick: () => { Store.ensureStartDate(); App.render(); } }, "Bắt đầu từ hôm nay"),
        ]),
      ]));
    }

    const m = Store.currentMonth();
    const month = ROADMAP.month(m);
    const stage = ROADMAP.stageOf(m);

    // Cảnh báo chậm tiến độ
    if (Store.behindSchedule()) {
      root.appendChild(h("div", { class: "card callout callout--amber" }, [
        h("div", { class: "callout__icon" }, "⚠"),
        h("div", null, [
          h("div", { style: { fontWeight: 700 } }, "Đang chậm so với lộ trình"),
          h("p", { class: "small muted mb-0" },
            "Bạn học " + Store.totalStudyDays() + "/" + dn + " ngày. Hãy giữ nhịp tối thiểu: mỗi ngày mở app ôn hết thẻ đến hạn (10 phút)."),
        ]),
      ]));
    }

    // Vị trí trên lộ trình
    root.appendChild(h("div", { class: "card" }, [
      h("div", { class: "between" }, [
        h("div", null, [
          h("div", { class: "eyebrow" }, "Giai đoạn " + stage.id + " — " + stage.name),
          h("h2", { class: "mt-0", style: { marginBottom: "4px" } }, "Tháng " + m + ": " + month.title),
          h("p", { class: "small muted" }, month.goal),
          h("div", { class: "small" }, [
            h("strong", null, "Đầu ra tháng này: "), month.output,
            " ", h("a", { href: "#/roadmap", class: "small" }, "Xem lộ trình →"),
          ]),
        ]),
        h("div", { class: "center", style: { flexShrink: 0 } },
          UI.ring(Store.monthProgress(), { size: 92, sublabel: "tháng " + m })),
      ]),
    ]));

    // Số liệu nhanh
    const acc = Store.recentAccuracy();
    root.appendChild(h("div", { class: "grid grid--4" }, [
      statCard("Ngày trên lộ trình", (dn || 0) + " / 365", "bắt đầu " + (Store.settings().startDate || "—")),
      statCard("Chuỗi ngày học", Store.streak() + " 🔥", Store.totalStudyDays() + " ngày có học"),
      statCard("Từ đã thuộc", Store.masteredCount() + " / 2000", Store.learningCount() + " từ đang học"),
      statCard("Tổng thời gian", fmtMin(Store.totalMinutes()), acc != null ? ("đúng 7 ngày: " + acc + "%") : "—"),
    ]));

    // Việc hôm nay (interleaving theo mix của tháng)
    const due = Store.dueCount();
    const newLeft = Math.max(0, Store.newPerDay() - Store.newIntroducedToday());
    const acts = Store.todayActs();
    const tasks = [];
    tasks.push({ icon: "✎", route: "vocab", label: "Ôn " + due + " thẻ đến hạn" + (newLeft ? " + học " + newLeft + " từ mới" : ""),
                 done: due === 0 && newLeft === 0, meta: "FSRS" });
    Object.keys(month.mix).forEach((k) => {
      if (k === "vocab") return;
      const ml = ROADMAP.MIX_LABELS[k];
      if (!ml) return;
      const doneN = acts[k === "listen" ? "defense" : (k === "speak" ? "coach" : k)] || 0;
      tasks.push({ icon: ml.icon, route: ml.route, label: ml.label + " — " + month.mix[k] * 5 + " phút",
                   done: doneN > 0, meta: doneN > 0 ? "đã làm hôm nay ✓" : null });
    });

    root.appendChild(sectionTitle("Việc hôm nay", h("span", { class: "small muted" }, "45–60 phút · chia 2–3 phiên")));
    const list = h("div", { class: "card", style: { padding: "6px 0" } });
    tasks.forEach((t) => {
      list.appendChild(h("a", { class: "task-row" + (t.done ? " task-row--done" : ""), href: "#/" + t.route }, [
        h("span", { class: "task-row__icon" }, t.icon),
        h("span", { class: "task-row__label" }, t.label),
        h("span", { class: "task-row__meta small muted" }, t.done ? "✓" : (t.meta || "›")),
      ]));
    });
    root.appendChild(list);

    // Biểu đồ tiến bộ
    root.appendChild(sectionTitle("Tiến bộ 14 ngày"));
    const days = [];
    for (let i = 13; i >= 0; i--) days.push(Store.isoDate(new Date(Date.now() - i * 86400000)));
    const stats = Store.get().stats;
    const revSeries = days.map((d) => (stats[d] ? stats[d].rev : 0));
    const pronSeries = days.map((d) => (stats[d] && stats[d].pronN ? Math.round(stats[d].pronSum / stats[d].pronN) : null))
      .filter((x) => x != null);
    const simSeries = Store.sims().slice(-10).map((s) => s.avg);
    root.appendChild(h("div", { class: "grid grid--3" }, [
      h("div", { class: "card" }, [h("div", { class: "stat__label" }, "Thẻ ôn mỗi ngày"), sparkline(revSeries), h("div", { class: "small muted" }, "hôm nay: " + revSeries[revSeries.length - 1])]),
      h("div", { class: "card" }, [h("div", { class: "stat__label" }, "Điểm phát âm"), sparkline(pronSeries, { color: "var(--accent, #10b981)" }), h("div", { class: "small muted" }, pronSeries.length ? ("gần nhất: " + pronSeries[pronSeries.length - 1] + "%") : "chưa luyện")]),
      h("div", { class: "card" }, [h("div", { class: "stat__label" }, "Điểm mô phỏng (10 phiên)"), sparkline(simSeries, { color: "var(--rose, #f43f5e)" }), h("div", { class: "small muted" }, simSeries.length ? ("gần nhất: " + simSeries[simSeries.length - 1] + "/10") : "chưa mô phỏng")]),
    ]));

    return root;
  };

  /* ================= LỘ TRÌNH 12 THÁNG ================= */
  Views.roadmap = function () {
    const root = h("div");
    const cur = Store.currentMonth();

    root.appendChild(h("div", { class: "card callout" }, [
      h("div", { class: "callout__icon" }, "◈"),
      h("div", null, [
        h("div", { style: { fontWeight: 700 } }, "Mục tiêu 12 tháng"),
        h("p", { class: "small muted mb-0" },
          "Trình bày luận văn 25 phút + trả lời phản biện trực tiếp bằng tiếng Anh trước hội đồng. " +
          "Tương đương CEFR B2 nói–nghe trong phạm vi chuyên ngành hẹp (quản lý kinh tế · hành chính công · chính sách công · chuyển đổi số)."),
      ]),
    ]));

    ROADMAP.STAGES.forEach((st) => {
      root.appendChild(sectionTitle("Giai đoạn " + st.id + " — " + st.name,
        h("span", { class: "small muted" }, "Tháng " + st.months[0] + "–" + st.months[st.months.length - 1])));
      root.appendChild(h("p", { class: "small muted", style: { marginTop: "-6px" } }, st.desc));

      st.months.forEach((mi) => {
        const mo = ROADMAP.month(mi);
        const test = Store.monthTest(mi);
        const isCur = mi === cur;
        const card = h("div", { class: "card month-card" + (isCur ? " month-card--cur" : "") });
        card.appendChild(h("div", { class: "between" }, [
          h("div", null, [
            h("div", { class: "eyebrow" }, "Tháng " + mi + (isCur ? " · ĐANG HỌC" : "")),
            h("div", { style: { fontWeight: 700, fontSize: "1.05rem" } }, mo.title),
          ]),
          test ? h("span", { class: "badge badge--accent" }, "✓ Đạt đầu ra") :
                 (mi < cur ? h("span", { class: "badge badge--amber" }, "Chưa kiểm tra") : null),
        ]));
        card.appendChild(h("p", { class: "small muted" }, mo.goal));
        const wk = h("ol", { class: "small week-list" });
        mo.weeks.forEach((w, i) => wk.appendChild(h("li", null, [h("strong", null, "Tuần " + (i + 1) + ": "), w])));
        card.appendChild(wk);
        card.appendChild(h("div", { class: "callout callout--accent", style: { marginTop: "8px" } }, [
          h("div", { class: "callout__icon" }, "🎯"),
          h("div", { class: "small" }, [
            h("strong", null, "Đầu ra: "), mo.output, h("br"),
            h("span", { class: "muted" }, mo.outputTest.label),
            h("div", { class: "mt-1" }, [
              test
                ? h("span", { class: "small muted" }, "Hoàn thành " + test.date + (test.score != null ? " · " + test.score : ""))
                : h("button", {
                    class: "btn btn--sm " + (mi <= cur ? "btn--primary" : "btn--ghost"),
                    onClick: () => confirmMonthTest(mi, mo),
                  }, "Đánh dấu đạt đầu ra"),
            ]),
          ]),
        ]));
        root.appendChild(card);
      });
    });
    return root;
  };

  function confirmMonthTest(mi, mo) {
    UI.modal({
      title: "Đầu ra tháng " + mi,
      desc: mo.outputTest.label,
      body: h("p", { class: "small muted" },
        "Tự đánh giá trung thực: chỉ đánh dấu khi bạn đã LÀM bài kiểm tra (ghi âm/đo điểm) và đạt mức yêu cầu. " +
        "Gợi ý: dùng module Phát âm (bài đọc), Shadowing (nghe), hoặc Mô phỏng (hỏi–đáp) để đo."),
      actions: [
        { label: "Chưa đạt", variant: "ghost" },
        { label: "Đã đạt ✓", variant: "primary", onClick: () => { Store.setMonthTest(mi, null); UI.toast("Đã ghi nhận đầu ra tháng " + mi, "accent"); App.render(); } },
      ],
    });
  }

  /* ================= CÀI ĐẶT ================= */
  Views.settings = function () {
    const root = h("div");
    const s = Store.settings();

    // Hồ sơ & lộ trình
    root.appendChild(sectionTitle("Hồ sơ & lộ trình"));
    root.appendChild(h("div", { class: "card" }, [
      field("Tên đề tài / luận văn", h("input", { class: "input", value: s.topic, onChange: (e) => Store.setSetting("topic", e.target.value) })),
      field("Tóm tắt luận văn (cho AI sinh câu hỏi phản biện — tiếng Việt hoặc Anh)",
        h("textarea", { class: "textarea", rows: 5, onChange: (e) => Store.setSetting("topicSummary", e.target.value) }, s.topicSummary || "")),
      field("Ngày bắt đầu lộ trình (Ngày 1)", h("input", { class: "input", type: "date", value: s.startDate || "", onChange: (e) => { Store.setSetting("startDate", e.target.value || null); } })),
      field("Số từ mới mỗi ngày (0 = theo lộ trình tháng: " + ROADMAP.month(Store.currentMonth()).newPerDay + ")",
        h("input", { class: "input", type: "number", min: 0, max: 40, value: s.newPerDayOverride || 0, onChange: (e) => Store.setSetting("newPerDayOverride", +e.target.value || 0) })),
    ]));

    // Âm thanh
    root.appendChild(sectionTitle("Âm thanh & giọng đọc"));
    const voiceSel = h("select", { class: "input", onChange: (e) => Store.setSetting("voiceURI", e.target.value) });
    voiceSel.appendChild(h("option", { value: "" }, "Tự chọn giọng tốt nhất"));
    UI.Speech.rankedVoices().forEach((v) => {
      voiceSel.appendChild(h("option", { value: v.voiceURI, selected: s.voiceURI === v.voiceURI ? "selected" : null },
        v.name + " (" + v.lang + ", " + UI.Speech.voiceQuality(v) + ")"));
    });
    root.appendChild(h("div", { class: "card" }, [
      h("label", { class: "check-item" }, [
        h("input", { type: "checkbox", checked: s.omniPack ? "checked" : null, onChange: (e) => Store.setSetting("omniPack", e.target.checked) }),
        h("span", null, [" Gói giọng OmniVoice render sẵn ", h("span", { class: "small muted" }, "(" + UI.Speech.packCount() + " audio, offline — ưu tiên cho CÂU)")]),
      ]),
      h("label", { class: "check-item" }, [
        h("input", { type: "checkbox", checked: s.humanAudio ? "checked" : null, onChange: (e) => Store.setSetting("humanAudio", e.target.checked) }),
        h("span", null, [" Bản thu người bản xứ cho TỪ đơn ", h("span", { class: "small muted" }, "(Free Dictionary API, cần mạng)")]),
      ]),
      field("Giọng TTS dự phòng", voiceSel),
      field("Tốc độ đọc TTS (" + s.speechRate + ")", h("input", { class: "input", type: "range", min: 0.6, max: 1.1, step: 0.05, value: s.speechRate, onChange: (e) => Store.setSetting("speechRate", +e.target.value) })),
      h("button", { class: "btn btn--ghost btn--sm", onClick: () => UI.speak("Thank you for the opportunity to present my research today.") }, "🔊 Nghe thử"),
    ]));

    // AI
    root.appendChild(sectionTitle("AI"));
    root.appendChild(h("div", { class: "card" }, [
      h("p", { class: "small" }, [
        h("strong", null, "Phương án chính: Gemini AI (miễn phí, không cần cài gì). "),
        "Vào trang Luyện nói với AI hoặc Mô phỏng bảo vệ → bấm Sao chép prompt → dán vào Gemini. Prompt đã chứa hồ sơ, lộ trình và tiến độ của bạn.",
      ]),
      h("p", { class: "small muted" },
        "Tùy chọn thêm (không bắt buộc): nhập Anthropic API key để trò chuyện và chấm điểm NGAY TRONG app. Key chỉ lưu trên máy bạn (localStorage), gửi thẳng tới api.anthropic.com — không qua máy chủ trung gian."),
      field("Anthropic API key", h("input", { class: "input", type: "password", placeholder: "sk-ant-…", value: s.apiKey, onChange: (e) => Store.setSetting("apiKey", e.target.value.trim()) })),
      field("Model", h("input", { class: "input", value: s.aiModel || "claude-sonnet-4-6", onChange: (e) => Store.setSetting("aiModel", e.target.value.trim() || "claude-sonnet-4-6") })),
      h("button", {
        class: "btn btn--ghost btn--sm",
        onClick: async (e) => {
          const btn = e.target; btn.disabled = true; btn.textContent = "Đang kiểm tra…";
          try { await AI.chat([{ role: "user", content: "Reply with exactly: OK" }], null, 10); UI.toast("Kết nối AI thành công ✓", "accent"); }
          catch (err) { UI.toast(err.message); }
          btn.disabled = false; btn.textContent = "Kiểm tra kết nối";
        },
      }, "Kiểm tra kết nối"),
    ]));

    // Dữ liệu
    root.appendChild(sectionTitle("Sao lưu & dữ liệu"));
    root.appendChild(h("div", { class: "card" }, [
      h("p", { class: "small muted" }, "Toàn bộ dữ liệu học nằm trong trình duyệt. Xuất file .json mỗi tuần để không mất tiến độ."),
      h("div", { class: "row gap-sm" }, [
        h("button", { class: "btn btn--primary btn--sm", onClick: exportData }, "⬇ Xuất dữ liệu (.json)"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: importData }, "⬆ Nhập dữ liệu"),
        h("button", {
          class: "btn btn--danger btn--sm",
          onClick: () => UI.confirmDialog({
            title: "Xóa toàn bộ dữ liệu?", desc: "Mọi tiến độ học sẽ mất. Hãy xuất file sao lưu trước.",
            confirmLabel: "Xóa hết", danger: true,
            onConfirm: () => { Store.reset(); App.render(); },
          }),
        }, "Xóa dữ liệu"),
      ]),
      h("div", { class: "mt-2" }, [
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => global.installPWA() }, "📱 Cài như ứng dụng (PWA)"),
      ]),
    ]));

    return root;

    function field(label, control) {
      return h("div", { class: "field" }, [h("label", { class: "small", style: { fontWeight: 600 } }, label), control]);
    }
  };

  function exportData() {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "english-defense-" + Store.today() + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importData() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json,application/json";
    input.onchange = () => {
      const f = input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { Store.importJSON(reader.result); UI.toast("Đã nhập dữ liệu ✓", "accent"); App.render(); }
        catch (e) { UI.toast("File không hợp lệ: " + e.message); }
      };
      reader.readAsText(f);
    };
    input.click();
  }
})(window);
