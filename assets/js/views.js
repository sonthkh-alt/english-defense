/* ============================================================
   views.js — Render từng trang của ứng dụng
   Mỗi hàm trả về 1 DocumentFragment/Node để gắn vào #view
   ============================================================ */
(function (global) {
  "use strict";
  const { h, esc, toast, modal, confirmDialog, ring, bar, prettyDate, shortDate } = UI;
  const D = APP_DATA;

  function frag(children) { const f = document.createDocumentFragment(); UI.appendChildren(f, children); return f; }
  function pageHead(title, sub, eyebrow) {
    return h("div", { class: "page-head" }, [
      eyebrow ? h("span", { class: "eyebrow" }, eyebrow) : null,
      h("h1", null, title),
      sub ? h("p", null, sub) : null,
    ]);
  }
  function reload() { global.App.render(); }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function dashboard() {
    const s = Store.get();
    const dn = Store.dayNumber();
    const phase = Store.currentPhase();
    const streak = Store.streak();
    const studyDays = Store.totalStudyDays();
    const totalMin = Store.totalMinutes();
    const qStats = Store.questionStats();
    const started = !!s.settings.startDate;

    const out = frag([]);

    // Hero
    const hello = s.settings.name ? "Chào " + esc(s.settings.name) + "," : "Chào bạn,";
    out.appendChild(h("div", { class: "page-head" }, [
      h("span", { class: "eyebrow" }, "Bảng điều khiển"),
      h("h1", null, hello + " sẵn sàng cho buổi sáng nay chứ?"),
      h("p", null, started
        ? "Hôm nay là ngày thứ " + dn + " / 365 của lộ trình. Giai đoạn: " + phase.name + "."
        : "Hãy đặt ngày bắt đầu để kích hoạt lộ trình 12 tháng của bạn."),
    ]));

    if (!started) {
      out.appendChild(h("div", { class: "callout callout--amber mb-2" }, [
        h("span", { class: "callout__icon" }, "🚀"),
        h("div", null, [
          h("strong", null, "Bắt đầu ngay hôm nay. "),
          "Nhấn nút bên dưới để đặt hôm nay làm Ngày 1 — mọi thống kê tiến độ sẽ tính từ đó.",
          h("div", { class: "mt-1" }, [
            h("button", { class: "btn btn--primary btn--sm", onClick: () => {
              Store.ensureStartDate(); toast("Đã bắt đầu lộ trình. Ngày 1 — bắt đầu thôi!", "accent"); reload();
            } }, "▶ Bắt đầu lộ trình hôm nay"),
          ]),
        ]),
      ]));
    }

    // Stat tiles
    out.appendChild(h("div", { class: "grid cols-4 mb-2" }, [
      statTile("Chuỗi ngày", streak, "ngày", "🔥", "amber", streak > 0 ? "Giữ lửa mỗi ngày!" : "Học hôm nay để bắt đầu chuỗi"),
      statTile("Tổng ngày học", studyDays, "ngày", "📚", "brand", "Số ngày có học ghi nhận"),
      statTile("Tổng thời lượng", Math.round(totalMin / 60 * 10) / 10, "giờ", "⏱", "sky", totalMin + " phút tích luỹ"),
      statTile("Câu hỏi thành thạo", qStats.mastered, "/ " + qStats.total, "🎯", "accent", "Ngân hàng câu hỏi"),
    ]));

    // Two-column: Today progress + Phase card
    const grid = h("div", { class: "grid cols-2 mb-2" });

    // --- Today card ---
    const sess = Store.getSession() || { blocks: {} };
    const doneBlocks = D.DAILY_BLOCKS.filter((b) => sess.blocks && sess.blocks[b.id]).length;
    const pct = Math.round((doneBlocks / D.DAILY_BLOCKS.length) * 100);
    const todayCard = h("div", { class: "card" }, [
      h("div", { class: "card__head" }, [
        h("div", { class: "card__icon", style: bgSoft("brand") }, "☀"),
        h("h3", null, "Buổi học hôm nay"),
        h("a", { href: "#/today", class: "btn btn--ghost btn--sm", style: { marginLeft: "auto" } }, "Mở →"),
      ]),
      h("div", { class: "ring-wrap" }, [
        ring(pct, { sublabel: doneBlocks + "/" + D.DAILY_BLOCKS.length }),
        h("div", null, [
          h("div", { class: "small muted" }, "Khung ngày mẫu 65 phút"),
          h("div", { style: { fontSize: "15px", fontWeight: 600, margin: "4px 0 10px" } },
            pct === 100 ? "Xuất sắc! Đã hoàn thành buổi học 🎉" : doneBlocks === 0 ? "Chưa bắt đầu — hãy nghe 20 phút đầu tiên" : "Tiếp tục nào, còn " + (D.DAILY_BLOCKS.length - doneBlocks) + " phần"),
          quickCheck(),
        ]),
      ]),
    ]);
    grid.appendChild(todayCard);

    // --- Phase card ---
    const phaseIdx = phase.id;
    const totalMonths = 12;
    const monthNow = dn ? Math.min(12, ((dn - 1) / 30.4)) : 0;
    const overallPct = Math.round((monthNow / totalMonths) * 100);
    grid.appendChild(h("div", { class: "card" }, [
      h("div", { class: "card__head" }, [
        h("div", { class: "card__icon", style: bgSoft(phase.color) }, "◈"),
        h("h3", null, "Giai đoạn hiện tại"),
        h("a", { href: "#/roadmap", class: "btn btn--ghost btn--sm", style: { marginLeft: "auto" } }, "Lộ trình →"),
      ]),
      h("div", { style: { fontSize: "13px", fontWeight: 700, color: "var(--" + phase.color + ")" } }, "GIAI ĐOẠN " + phaseIdx),
      h("div", { style: { fontFamily: "var(--font-head)", fontSize: "18px", fontWeight: 700, margin: "2px 0 4px" } }, phase.name),
      h("div", { class: "small muted mb-1" }, phase.months),
      h("div", { class: "row between small", style: { marginBottom: "6px" } }, [
        h("span", { class: "muted" }, "Tiến độ tổng thể"),
        h("strong", null, started ? overallPct + "%" : "—"),
      ]),
      bar(started ? overallPct : 0),
      h("ul", { class: "phase__goals", style: { marginTop: "14px" } },
        phase.goals.slice(0, 3).map((g) => h("li", null, g))),
    ]));
    out.appendChild(grid);

    // Principles strip
    out.appendChild(h("div", { class: "section-title" }, ["Nguyên tắc cốt lõi", h("span", { class: "tag" }, "kim chỉ nam")]));
    out.appendChild(h("div", { class: "grid cols-3" },
      D.PRINCIPLES.map((p) => h("div", { class: "card hoverable" }, [
        h("div", { style: { fontSize: "22px", marginBottom: "8px" } }, p.icon),
        h("div", { style: { fontWeight: 700, fontSize: "14.5px", marginBottom: "4px" } }, p.title),
        h("div", { class: "small muted" }, p.text),
      ]))
    ));

    // Focus reminder
    out.appendChild(h("div", { class: "callout callout--accent mt-3" }, [
      h("span", { class: "callout__icon" }, "🧭"),
      h("div", null, [
        h("strong", null, "Rào cản lớn nhất không phải NÓI mà là NGHE HIỂU câu hỏi trong thời gian thực. "),
        "Ưu tiên nghe đoạn Q&A hội thảo, dựng ngân hàng câu hỏi, và thuộc lòng bộ câu cứu nguy.",
      ]),
    ]));

    return out;
  }

  function statTile(label, value, unit, icon, color, foot) {
    return h("div", { class: "stat" }, [
      h("div", { class: "row between" }, [
        h("div", { class: "stat__label" }, label),
        h("div", { class: "stat__pill", style: bgSoft(color) }, icon),
      ]),
      h("div", { class: "stat__value" }, [String(value), unit ? h("small", null, " " + unit) : null]),
      foot ? h("div", { class: "stat__foot" }, foot) : null,
    ]);
  }
  function bgSoft(color) { return { background: "var(--" + color + "-soft)", color: "var(--" + color + ")" }; }

  function quickCheck() {
    const wrap = h("div", { class: "row wrap", style: { gap: "6px" } });
    const sess = Store.getSession() || { blocks: {} };
    D.DAILY_BLOCKS.forEach((b) => {
      const on = sess.blocks && sess.blocks[b.id];
      const chip = h("button", {
        class: "chip" + (on ? " active" : ""),
        title: b.title + " · " + b.dur + " phút",
        onClick: () => { Store.toggleBlock(null, b.id); reload(); },
      }, [b.icon, " ", b.dur + "'"]);
      wrap.appendChild(chip);
    });
    return wrap;
  }

  /* ============================================================
     ROADMAP
     ============================================================ */
  function roadmap() {
    const out = frag([]);
    out.appendChild(pageHead("Lộ trình 12 tháng", "5 giai đoạn từ khởi động đến mô phỏng bảo vệ toàn phần. Đánh dấu ✓ khi bạn hoàn thành mục tiêu mỗi giai đoạn.", "Bản đồ hành trình"));

    // Meta card
    out.appendChild(h("div", { class: "grid cols-2 mb-2" }, [
      metaCard("🎯", "Mục tiêu", D.META.goal, "brand"),
      metaCard("⛓", "Ràng buộc", D.META.constraint, "rose"),
      metaCard("📍", "Điểm xuất phát", D.META.start, "sky"),
      metaCard("⏰", "Quỹ thời gian", D.META.budget, "amber"),
    ]));

    const curPhase = Store.currentPhase();
    const tl = h("div", { class: "timeline" });
    D.PHASES.forEach((p) => {
      const done = Store.isPhaseDone(p.id);
      const isCurrent = p.id === curPhase.id && !!Store.get().settings.startDate;
      const el = h("div", { class: "phase" + (done ? " done" : "") + (isCurrent ? " current" : "") }, [
        h("div", { class: "phase__dot" }, done ? "✓" : String(p.id)),
        h("div", { class: "phase__card" }, [
          h("div", { class: "phase__top" }, [
            h("h3", null, "GĐ " + p.id + " · " + p.name),
            h("span", { class: "phase__months" }, p.months),
            isCurrent ? h("span", { class: "badge badge--brand" }, "● Đang ở đây") : null,
            done ? h("span", { class: "badge badge--accent" }, "Hoàn thành") : null,
          ]),
          h("ul", { class: "phase__goals" }, p.goals.map((g) => h("li", null, g))),
          h("div", { class: "phase__milestone" }, [
            h("span", null, "🏁"),
            h("div", null, [h("strong", null, "Mốc cuối: "), p.milestone]),
          ]),
          h("div", { class: "mt-2" }, [
            h("button", {
              class: "btn btn--sm " + (done ? "btn--ghost" : "btn--accent"),
              onClick: () => { Store.togglePhase(p.id); toast(done ? "Đã bỏ đánh dấu" : "Chúc mừng hoàn thành GĐ " + p.id + "! 🎉", done ? null : "accent"); reload(); },
            }, done ? "↺ Bỏ đánh dấu hoàn thành" : "✓ Đánh dấu hoàn thành giai đoạn"),
          ]),
        ]),
      ]);
      tl.appendChild(el);
    });
    out.appendChild(tl);
    return out;
  }
  function metaCard(icon, label, text, color) {
    return h("div", { class: "card", style: { borderLeft: "4px solid var(--" + color + ")" } }, [
      h("div", { class: "row", style: { gap: "8px", marginBottom: "6px" } }, [
        h("span", { style: { fontSize: "16px" } }, icon),
        h("span", { style: { fontWeight: 700, fontSize: "13px", color: "var(--" + color + ")" } }, label),
      ]),
      h("div", { class: "small", style: { color: "var(--text-2)" } }, text),
    ]);
  }

  /* ============================================================
     TODAY — buổi học hôm nay (checklist chi tiết)
     ============================================================ */
  function today() {
    const out = frag([]);
    const date = Store.today();
    const sess = Store.getSession(date) || { blocks: {}, note: "" };
    const doneBlocks = D.DAILY_BLOCKS.filter((b) => sess.blocks && sess.blocks[b.id]).length;
    const pct = Math.round((doneBlocks / D.DAILY_BLOCKS.length) * 100);
    const minPlanned = D.DAILY_BLOCKS.reduce((a, b) => a + b.dur, 0);
    const minDone = D.DAILY_BLOCKS.reduce((a, b) => a + (sess.blocks && sess.blocks[b.id] ? b.dur : 0), 0);
    const phase = Store.currentPhase();

    out.appendChild(h("div", { class: "page-head row between wrap" }, [
      h("div", null, [
        h("span", { class: "eyebrow" }, prettyDate(date)),
        h("h1", null, "Buổi học hôm nay"),
        h("p", null, "Khung ngày mẫu 65 phút · Giai đoạn " + phase.id + ": " + phase.name),
      ]),
      ring(pct, { size: 78, sublabel: minDone + "'/" + minPlanned + "'" }),
    ]));

    // checklist
    const list = h("ul", { class: "check-list" });
    D.DAILY_BLOCKS.forEach((b) => {
      const on = sess.blocks && sess.blocks[b.id];
      list.appendChild(h("li", {
        class: "check-item" + (on ? " done" : ""),
        onClick: () => { Store.toggleBlock(date, b.id); reload(); },
      }, [
        h("div", { class: "check-box" }, on ? "✓" : ""),
        h("div", { class: "check-body" }, [
          h("div", { class: "check-title" }, b.icon + "  " + b.title),
          h("div", { class: "check-meta" }, b.desc),
        ]),
        h("div", { class: "check-dur" }, b.dur + " phút"),
      ]));
    });
    out.appendChild(list);

    // busy-day / rest actions
    out.appendChild(h("div", { class: "row wrap mt-2", style: { gap: "10px" } }, [
      h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
        Store.markStudied(date); toast("Đã ghi nhận: ngày bận vẫn giữ lửa 🔥", "accent"); reload();
      } }, "🔥 Ngày bận — chỉ 10' lõi"),
      h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
        D.DAILY_BLOCKS.forEach((b) => { if (!(sess.blocks && sess.blocks[b.id])) Store.toggleBlock(date, b.id); });
        toast("Hoàn thành cả buổi. Tuyệt vời! 🎉", "accent"); reload();
      } }, "✓ Đánh dấu hoàn thành cả buổi"),
    ]));

    // note
    out.appendChild(h("div", { class: "section-title" }, "Ghi chú buổi học"));
    const ta = h("textarea", {
      class: "textarea", placeholder: "Hôm nay nghe gì? Từ nào khó? Câu hỏi nào luyện? Chỗ nào cần cải thiện…",
    });
    ta.value = sess.note || "";
    let noteTimer;
    ta.addEventListener("input", () => {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { Store.setSessionNote(date, ta.value); }, 500);
    });
    out.appendChild(ta);
    out.appendChild(h("div", { class: "small muted mt-1" }, "💾 Ghi chú tự động lưu."));

    // Phase focus tips
    out.appendChild(h("div", { class: "section-title" }, ["Trọng tâm giai đoạn này", h("span", { class: "tag" }, phase.months)]));
    out.appendChild(h("div", { class: "card" }, [
      h("ul", { class: "phase__goals" }, phase.goals.map((g) => h("li", null, g))),
    ]));

    return out;
  }

  /* ============================================================
     JOURNAL + HEATMAP + STREAK
     ============================================================ */
  function journal() {
    const out = frag([]);
    out.appendChild(pageHead("Nhật ký & Chuỗi ngày", "Theo dõi lịch học và ghi lại cảm nhận, khó khăn, tiến bộ mỗi tuần.", "Kỷ luật buổi sáng"));

    // heatmap
    out.appendChild(h("div", { class: "card mb-2" }, [
      h("div", { class: "card__head" }, [
        h("div", { class: "card__icon", style: bgSoft("accent") }, "▦"),
        h("h3", null, "Lịch học 26 tuần gần nhất"),
        h("span", { class: "badge badge--amber", style: { marginLeft: "auto" } }, "🔥 " + Store.streak() + " ngày liên tục"),
      ]),
      heatmap(),
      h("div", { class: "heat-legend" }, [
        "Ít", h("span", { class: "heat-cell" }), h("span", { class: "heat-cell l1" }),
        h("span", { class: "heat-cell l2" }), h("span", { class: "heat-cell l3" }),
        h("span", { class: "heat-cell l4" }), "Nhiều",
      ]),
    ]));

    // add journal
    out.appendChild(h("div", { class: "section-title row between" }, [
      h("span", null, "Nhật ký học tập"),
      h("button", { class: "btn btn--primary btn--sm", onClick: openJournalModal }, "＋ Ghi nhật ký"),
    ]));

    const entries = Store.get().journal;
    if (!entries.length) {
      out.appendChild(emptyState("📝", "Chưa có nhật ký nào", "Cuối tuần hãy ghi: tuần làm được gì, chỗ nào khó nhất."));
    } else {
      entries.forEach((j) => {
        out.appendChild(h("div", { class: "card mb-1" }, [
          h("div", { class: "row between" }, [
            h("div", { class: "row", style: { gap: "9px" } }, [
              h("span", { style: { fontSize: "20px" } }, j.mood),
              h("div", null, [
                h("div", { style: { fontWeight: 700 } }, j.title || "(không tiêu đề)"),
                h("div", { class: "small muted" }, prettyDate(j.date)),
              ]),
            ]),
            h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
              confirmDialog({ title: "Xoá nhật ký?", desc: "Không thể hoàn tác.", confirmLabel: "Xoá", danger: true,
                onConfirm: () => { Store.deleteJournal(j.id); toast("Đã xoá"); reload(); } });
            } }, "🗑"),
          ]),
          j.body ? h("div", { class: "small mt-1", style: { color: "var(--text-2)", whiteSpace: "pre-wrap" } }, j.body) : null,
        ]));
      });
    }
    return out;
  }

  function openJournalModal() {
    let mood = "🙂";
    const moods = ["😄", "🙂", "😐", "😓", "🔥"];
    const moodRow = h("div", { class: "row", style: { gap: "8px" } });
    const btns = moods.map((m) => {
      const b = h("button", { class: "chip" + (m === mood ? " active" : ""), onClick: () => {
        mood = m; btns.forEach((x, i) => x.classList.toggle("active", moods[i] === mood));
      } }, m);
      return b;
    });
    btns.forEach((b) => moodRow.appendChild(b));
    const title = h("input", { class: "input", placeholder: "VD: Tuần 3 — nghe khá lên rõ" });
    const body = h("textarea", { class: "textarea", placeholder: "Tuần này làm được gì? Chỗ nào khó nhất? Cần bù giờ tuần sau không?" });
    modal({
      title: "Ghi nhật ký học tập",
      body: [
        h("div", { class: "field" }, [h("label", null, "Tâm trạng"), moodRow]),
        h("div", { class: "field" }, [h("label", null, "Tiêu đề"), title]),
        h("div", { class: "field" }, [h("label", null, "Nội dung"), body]),
      ],
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Lưu", variant: "primary", onClick: () => {
          if (!title.value.trim() && !body.value.trim()) { toast("Nhập nội dung đã nhé"); return false; }
          Store.addJournal({ title: title.value, body: body.value, mood });
          toast("Đã lưu nhật ký", "accent"); reload();
        } },
      ],
    });
  }

  function heatmap() {
    // 26 tuần * 7 ngày, kết thúc hôm nay
    const wrap = h("div", { class: "heatmap" });
    const weeks = 26;
    const end = new Date();
    // đưa về cuối tuần (thứ 7) để cột đều
    const totalDays = weeks * 7;
    const start = new Date(end);
    start.setDate(end.getDate() - totalDays + 1);
    // căn theo chủ nhật đầu
    start.setDate(start.getDate() - start.getDay());
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = Store.isoDate(cursor);
      const min = Store.sessionMinutes(iso);
      let lvl = "";
      if (Store.dayCounts(iso)) {
        if (min >= 60) lvl = "l4"; else if (min >= 40) lvl = "l3"; else if (min >= 20) lvl = "l2"; else lvl = "l1";
      }
      const isFuture = cursor > end;
      wrap.appendChild(h("div", {
        class: "heat-cell " + lvl, title: shortDate(iso) + (min ? " · " + min + " phút" : " · nghỉ"),
        style: isFuture ? { opacity: .3 } : null,
      }));
      cursor.setDate(cursor.getDate() + 1);
    }
    return wrap;
  }

  function emptyState(icon, title, sub) {
    return h("div", { class: "empty" }, [
      h("div", { class: "empty__icon" }, icon),
      h("div", { style: { fontWeight: 600, color: "var(--text-2)" } }, title),
      sub ? h("div", { class: "small mt-1" }, sub) : null,
    ]);
  }

  /* ============================================================
     QUESTIONS — ngân hàng câu hỏi 10 trục
     ============================================================ */
  let activeAxis = "urgency";
  function questions() {
    const out = frag([]);
    const stats = Store.questionStats();
    out.appendChild(pageHead("Ngân hàng câu hỏi", "Mục tiêu 80–100 câu. Câu hỏi hội đồng xoáy vào các trục cố định — khi 80% đã 'quen tai', phần bất ngờ còn lại rất nhỏ.", "Vũ khí chống bất ngờ"));

    // progress banner
    const goalPct = Math.min(100, Math.round((stats.total / 90) * 100));
    out.appendChild(h("div", { class: "card mb-2" }, [
      h("div", { class: "row between mb-1" }, [
        h("div", null, [
          h("strong", null, stats.total + " câu"),
          h("span", { class: "muted small" }, "  đã tạo · mục tiêu 80–100"),
        ]),
        h("div", null, [h("strong", { style: { color: "var(--accent)" } }, stats.mastered), h("span", { class: "muted small" }, " câu thành thạo")]),
      ]),
      bar(goalPct, "accent"),
    ]));

    // axis chips
    const chipRow = h("div", { class: "row wrap mb-2", style: { gap: "8px" } });
    D.QUESTION_AXES.forEach((ax) => {
      const count = Store.getQuestions(ax.id).length;
      chipRow.appendChild(h("button", {
        class: "chip" + (ax.id === activeAxis ? " active" : ""),
        onClick: () => { activeAxis = ax.id; reload(); },
      }, [ax.icon, " ", ax.title.split(" / ")[0], count ? h("span", { class: "badge", style: { marginLeft: "4px" } }, String(count)) : null]));
    });
    out.appendChild(chipRow);

    const ax = D.QUESTION_AXES.find((a) => a.id === activeAxis);
    const list = Store.getQuestions(activeAxis);

    out.appendChild(h("div", { class: "card axis-card mb-2" }, [
      h("div", { class: "row between wrap" }, [
        h("div", null, [
          h("div", { style: { fontWeight: 700, fontSize: "16px" } }, ax.icon + "  " + ax.title),
          h("div", { class: "small muted", style: { fontStyle: "italic", marginTop: "3px" } }, "Mẫu: " + ax.en),
        ]),
        h("div", { class: "row", style: { gap: "8px" } }, [
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => genPrompt(ax) }, "🤖 Prompt AI"),
          h("button", { class: "btn btn--primary btn--sm", onClick: () => openQuestionModal(activeAxis) }, "＋ Thêm câu"),
        ]),
      ]),
    ]));

    if (!list.length) {
      out.appendChild(emptyState("❓", "Chưa có câu hỏi cho trục này",
        "Dùng nút 'Prompt AI' để sinh 8–10 câu, rồi thêm vào và luyện đến khi 'nghe là hiểu ngay'."));
    } else {
      list.forEach((q) => out.appendChild(questionItem(activeAxis, q)));
    }
    return out;
  }

  function questionItem(axisId, q) {
    const masteryDots = h("span", { class: "mastery", title: "Mức thành thạo: " + q.mastery + "/3" });
    for (let i = 0; i < 3; i++) masteryDots.appendChild(h("i", { class: i < q.mastery ? "on" : "" }));

    const item = h("div", { class: "q-item" }, [
      h("div", { class: "q-item__en" }, q.en),
      q.vi ? h("div", { class: "q-item__vi" }, "→ " + q.vi) : null,
      q.answer ? h("details", { style: { marginTop: "8px" } }, [
        h("summary", { class: "small", style: { cursor: "pointer", color: "var(--brand)" } }, "Xem khung trả lời"),
        h("div", { class: "small mt-1", style: { color: "var(--text-2)", whiteSpace: "pre-wrap" } }, q.answer),
      ]) : null,
      h("div", { class: "q-item__row" }, [
        masteryDots,
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => { Store.cycleMastery(axisId, q.id); reload(); } }, "◉ Luyện +1"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => openQuestionModal(axisId, q) }, "✎ Sửa"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
          confirmDialog({ title: "Xoá câu hỏi?", confirmLabel: "Xoá", danger: true,
            onConfirm: () => { Store.deleteQuestion(axisId, q.id); toast("Đã xoá"); reload(); } });
        } }, "🗑"),
      ]),
    ]);
    return item;
  }

  function openQuestionModal(axisId, existing) {
    const en = h("textarea", { class: "textarea", style: { minHeight: "60px" }, placeholder: "Câu hỏi tiếng Anh…" });
    const vi = h("input", { class: "input", placeholder: "Nghĩa / ý câu hỏi (tiếng Việt)" });
    const ans = h("textarea", { class: "textarea", placeholder: "Khung trả lời của bạn (gạch đầu dòng ý chính)…" });
    if (existing) { en.value = existing.en; vi.value = existing.vi; ans.value = existing.answer; }
    modal({
      title: existing ? "Sửa câu hỏi" : "Thêm câu hỏi",
      body: [
        h("div", { class: "field" }, [h("label", null, "Câu hỏi (EN) *"), en]),
        h("div", { class: "field" }, [h("label", null, "Ý câu hỏi (VI)"), vi]),
        h("div", { class: "field" }, [h("label", null, "Khung trả lời"), ans]),
      ],
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: existing ? "Cập nhật" : "Thêm", variant: "primary", onClick: () => {
          if (!en.value.trim()) { toast("Nhập câu hỏi đã nhé"); return false; }
          if (existing) { Store.updateQuestion(axisId, existing.id, { en: en.value.trim(), vi: vi.value.trim(), answer: ans.value.trim() }); toast("Đã cập nhật", "accent"); }
          else { Store.addQuestion(axisId, { en: en.value, vi: vi.value, answer: ans.value }); toast("Đã thêm câu hỏi", "accent"); }
          reload();
        } },
      ],
    });
  }

  function genPrompt(ax) {
    const topic = Store.settings().topic || "[đề tài quản lý kinh tế của bạn]";
    const prompt = 'Đóng vai hội đồng giáo sư kinh tế phản biện. Đặt cho tôi 8-10 câu hỏi bằng tiếng Anh về trục "' +
      ax.title + '" (' + ax.en + ') cho đề tài: "' + topic + '". ' +
      'Mỗi câu kèm bản dịch ý sang tiếng Việt và một khung trả lời gợi ý ngắn gọn.';
    modal({
      title: "🤖 Prompt sinh câu hỏi",
      desc: "Sao chép prompt này, dán vào AI (ChatGPT/Claude/Gemini), rồi thêm các câu hay vào ngân hàng.",
      body: [
        h("div", { class: "callout" }, [h("div", { style: { whiteSpace: "pre-wrap", fontSize: "13px" } }, prompt)]),
      ],
      actions: [
        { label: "Đóng", variant: "ghost" },
        { label: "📋 Sao chép", variant: "primary", onClick: () => { copyText(prompt); return false; } },
      ],
    });
  }

  /* ============================================================
     VOCAB — sổ tay từ vựng + flashcard
     ============================================================ */
  let vocabFilter = "all";
  function vocab() {
    const out = frag([]);
    const all = Store.get().vocab;
    const addedToday = Store.vocabAddedToday();

    out.appendChild(h("div", { class: "page-head row between wrap" }, [
      h("div", null, [
        h("span", { class: "eyebrow" }, "Sổ tay thuật ngữ quản lý kinh tế"),
        h("h1", null, "Sổ tay từ vựng"),
        h("p", null, "Mục tiêu 5 từ / ngày. Hôm nay đã thêm " + addedToday + "/5 từ."),
      ]),
      h("div", { class: "row", style: { gap: "8px" } }, [
        all.length ? h("button", { class: "btn btn--ghost btn--sm", onClick: startVocabFlash }, "🎴 Luyện flashcard") : null,
        h("button", { class: "btn btn--primary btn--sm", onClick: () => openVocabModal() }, "＋ Thêm từ"),
      ]),
    ]));

    // daily progress
    out.appendChild(h("div", { class: "card mb-2" }, [
      h("div", { class: "row between mb-1" }, [
        h("strong", null, "Chỉ tiêu hôm nay"),
        h("span", { class: "small muted" }, addedToday + " / 5 từ"),
      ]),
      bar(Math.min(100, (addedToday / 5) * 100)),
      addedToday >= 5 ? h("div", { class: "small mt-1", style: { color: "var(--accent)" } }, "✓ Đã đủ 5 từ hôm nay. Tuyệt!") : null,
    ]));

    // stats + filter
    const boxCounts = [1, 2, 3, 4, 5].map((b) => all.filter((v) => (v.box || 1) === b).length);
    out.appendChild(h("div", { class: "row wrap mb-2", style: { gap: "8px" } }, [
      filterChip("all", "Tất cả (" + all.length + ")"),
      filterChip("new", "Mới (hộp 1-2)"),
      filterChip("learning", "Đang thuộc (3-4)"),
      filterChip("mastered", "Thành thạo (5)"),
    ]));

    let list = all.slice();
    if (vocabFilter === "new") list = all.filter((v) => (v.box || 1) <= 2);
    else if (vocabFilter === "learning") list = all.filter((v) => (v.box || 1) === 3 || (v.box || 1) === 4);
    else if (vocabFilter === "mastered") list = all.filter((v) => (v.box || 1) >= 5);

    if (!all.length) {
      out.appendChild(emptyState("✎", "Sổ tay còn trống",
        "Bắt đầu với 10 từ chuyên ngành cốt lõi. Mỗi từ: nghĩa + 1 câu ví dụ để miệng quen thuật ngữ."));
    } else if (!list.length) {
      out.appendChild(emptyState("🔍", "Không có từ trong bộ lọc này", null));
    } else {
      list.forEach((v) => out.appendChild(vocabRow(v)));
    }
    return out;
  }
  function filterChip(key, label) {
    return h("button", { class: "chip" + (vocabFilter === key ? " active" : ""), onClick: () => { vocabFilter = key; reload(); } }, label);
  }
  function vocabRow(v) {
    const boxColors = ["", "rose", "amber", "sky", "brand", "accent"];
    return h("div", { class: "vocab-row" }, [
      h("div", { class: "flex-1", style: { minWidth: 0 } }, [
        h("div", { class: "row", style: { gap: "8px", alignItems: "baseline" } }, [
          h("span", { class: "vocab-term" }, v.term),
          v.pos ? h("span", { class: "vocab-pos" }, v.pos) : null,
          h("span", { class: "badge badge--" + (boxColors[v.box || 1] || "brand"), title: "Hộp Leitner " + (v.box || 1) }, "Hộp " + (v.box || 1)),
        ]),
        v.meaning ? h("div", { class: "vocab-mean" }, v.meaning) : null,
        v.example ? h("div", { class: "vocab-ex" }, "“" + v.example + "”") : null,
      ]),
      h("div", { class: "row", style: { gap: "6px" } }, [
        h("button", { class: "btn btn--ghost btn--sm", title: "Sửa", onClick: () => openVocabModal(v) }, "✎"),
        h("button", { class: "btn btn--ghost btn--sm", title: "Xoá", onClick: () => {
          confirmDialog({ title: "Xoá từ '" + v.term + "'?", confirmLabel: "Xoá", danger: true,
            onConfirm: () => { Store.deleteVocab(v.id); toast("Đã xoá"); reload(); } });
        } }, "🗑"),
      ]),
    ]);
  }
  function openVocabModal(existing) {
    const term = h("input", { class: "input", placeholder: "VD: allocation" });
    const pos = h("input", { class: "input", placeholder: "n. / v. / adj." });
    const mean = h("input", { class: "input", placeholder: "sự phân bổ (nguồn lực)" });
    const ex = h("textarea", { class: "textarea", style: { minHeight: "60px" }, placeholder: "Efficient resource allocation is key to…" });
    if (existing) { term.value = existing.term; pos.value = existing.pos; mean.value = existing.meaning; ex.value = existing.example; }
    modal({
      title: existing ? "Sửa từ" : "Thêm từ mới",
      body: [
        h("div", { class: "row", style: { gap: "10px" } }, [
          h("div", { class: "field flex-1" }, [h("label", null, "Từ / cụm từ *"), term]),
          h("div", { class: "field", style: { width: "100px" } }, [h("label", null, "Loại từ"), pos]),
        ]),
        h("div", { class: "field" }, [h("label", null, "Nghĩa"), mean]),
        h("div", { class: "field" }, [h("label", null, "Câu ví dụ"), ex]),
      ],
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: existing ? "Cập nhật" : "Thêm", variant: "primary", onClick: () => {
          if (!term.value.trim()) { toast("Nhập từ đã nhé"); return false; }
          if (existing) { Store.updateVocab(existing.id, { term: term.value.trim(), pos: pos.value.trim(), meaning: mean.value.trim(), example: ex.value.trim() }); toast("Đã cập nhật", "accent"); }
          else { Store.addVocab({ term: term.value, pos: pos.value, meaning: mean.value, example: ex.value }); toast("Đã thêm từ mới", "accent"); }
          reload();
        } },
      ],
    });
  }

  function startVocabFlash() {
    const deck = Store.get().vocab.slice();
    // ưu tiên hộp thấp trước
    deck.sort((a, b) => (a.box || 1) - (b.box || 1));
    if (!deck.length) return;
    let idx = 0, flipped = false;

    const stage = h("div", { class: "flash-stage" });
    const card = h("div", { class: "flashcard" });
    stage.appendChild(card);

    function renderCard() {
      const v = deck[idx];
      flipped = false;
      card.className = "flashcard";
      card.innerHTML = "";
      card.appendChild(h("div", { class: "flash-face flash-face--front" }, [
        h("div", { class: "fl-term" }, v.term),
        v.pos ? h("div", { class: "fl-sub" }, v.pos) : null,
        h("div", { class: "flash-hint" }, "Nhấn để lật · " + (idx + 1) + "/" + deck.length),
      ]));
      card.appendChild(h("div", { class: "flash-face flash-face--back" }, [
        h("div", { style: { fontWeight: 700, fontSize: "18px" } }, v.meaning || "(chưa có nghĩa)"),
        v.example ? h("div", { class: "small", style: { fontStyle: "italic", color: "var(--text-2)" } }, "“" + v.example + "”") : null,
        h("div", { class: "flash-hint" }, "Bạn nhớ được không?"),
      ]));
    }
    card.addEventListener("click", () => { flipped = !flipped; card.classList.toggle("flipped", flipped); });
    renderCard();

    function next(remembered) {
      const v = deck[idx];
      Store.reviewVocab(v.id, remembered);
      idx++;
      if (idx >= deck.length) {
        m.close();
        toast("Xong " + deck.length + " thẻ. Giỏi lắm! 🎴", "accent");
        reload();
        return;
      }
      renderCard();
    }

    const m = modal({
      title: "🎴 Luyện flashcard",
      desc: "Lật thẻ, tự nhớ nghĩa, rồi chấm. 'Nhớ' → đẩy lên hộp cao; 'Chưa' → về hộp 1.",
      body: [
        stage,
        h("div", { class: "row", style: { gap: "10px", marginTop: "18px", justifyContent: "center" } }, [
          h("button", { class: "btn btn--danger", onClick: () => next(false) }, "✗ Chưa nhớ"),
          h("button", { class: "btn btn--accent", onClick: () => next(true) }, "✓ Đã nhớ"),
        ]),
      ],
      actions: [{ label: "Đóng", variant: "ghost" }],
    });
  }

  /* ============================================================
     RESCUE — bộ câu cứu nguy
     ============================================================ */
  function rescue() {
    const out = frag([]);
    out.appendChild(pageHead("Bộ câu cứu nguy", "Ngay cả người giỏi cũng có lúc chưa nghe rõ. Những câu này biến khoảnh khắc hoảng loạn thành khoảnh khắc CÓ KIỂM SOÁT. Thuộc đến mức phản xạ.", "Kỹ năng bắt buộc"));

    out.appendChild(h("div", { class: "callout callout--accent mb-2" }, [
      h("span", { class: "callout__icon" }, "💡"),
      h("div", null, [
        h("strong", null, "Kỹ thuật quan trọng nhất: "),
        'Diễn lại câu hỏi trước khi trả lời ("If I understand correctly…") — vừa mua thời gian, vừa xác nhận mình hiểu đúng.',
      ]),
    ]));

    const mastered = Store.get().rescueMastered;
    D.RESCUE_PHRASES.forEach((p, i) => {
      const key = "core-" + i;
      out.appendChild(phraseCard(i + 1, p, key, mastered[key], false));
    });

    // custom phrases
    const custom = Store.get().rescueCustom;
    if (custom.length) {
      out.appendChild(h("div", { class: "section-title" }, "Câu của riêng bạn"));
      custom.forEach((p, i) => {
        const key = p.id;
        out.appendChild(phraseCard("★", p, key, mastered[key], true));
      });
    }

    out.appendChild(h("div", { class: "mt-2" }, [
      h("button", { class: "btn btn--primary btn--sm", onClick: openRescueModal }, "＋ Thêm câu cứu nguy của bạn"),
    ]));

    // mastery summary
    const total = D.RESCUE_PHRASES.length + custom.length;
    const done = Object.values(mastered).filter(Boolean).length;
    out.appendChild(h("div", { class: "card mt-3" }, [
      h("div", { class: "row between mb-1" }, [h("strong", null, "Mức độ thuộc lòng"), h("span", { class: "small muted" }, done + " / " + total)]),
      bar(total ? (done / total) * 100 : 0, "accent"),
    ]));
    return out;
  }

  function phraseCard(num, p, key, isMastered, isCustom) {
    return h("div", { class: "card phrase-card mb-1" }, [
      h("div", { class: "phrase-num" }, String(num)),
      h("div", { class: "flex-1" }, [
        h("div", { class: "phrase-en" }, "“" + p.en + "”"),
        h("div", { class: "phrase-vi" }, p.vi),
      ]),
      h("div", { class: "row", style: { gap: "6px" } }, [
        h("button", {
          class: "btn btn--sm " + (isMastered ? "btn--accent" : "btn--ghost"),
          onClick: () => { Store.toggleRescueMastered(key); reload(); },
        }, isMastered ? "✓ Thuộc" : "Đánh dấu thuộc"),
        isCustom ? h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
          confirmDialog({ title: "Xoá câu này?", confirmLabel: "Xoá", danger: true,
            onConfirm: () => { Store.deleteRescue(p.id); toast("Đã xoá"); reload(); } });
        } }, "🗑") : null,
      ]),
    ]);
  }
  function openRescueModal() {
    const en = h("input", { class: "input", placeholder: "Could you give me a moment?" });
    const vi = h("input", { class: "input", placeholder: "Nghĩa tiếng Việt" });
    modal({
      title: "Thêm câu cứu nguy",
      body: [
        h("div", { class: "field" }, [h("label", null, "Câu tiếng Anh *"), en]),
        h("div", { class: "field" }, [h("label", null, "Nghĩa tiếng Việt"), vi]),
      ],
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Thêm", variant: "primary", onClick: () => {
          if (!en.value.trim()) { toast("Nhập câu đã nhé"); return false; }
          Store.addRescue({ en: en.value, vi: vi.value }); toast("Đã thêm", "accent"); reload();
        } },
      ],
    });
  }

  /* ============================================================
     AI TOOLS
     ============================================================ */
  function aitools() {
    const out = frag([]);
    out.appendChild(pageHead("Bộ công cụ AI", "Lợi thế riêng của bạn. Dùng AI để tạo audio mẫu, chấm phát âm khách quan, sinh câu hỏi và làm hội đồng ảo.", "Tận dụng tối đa AI"));

    out.appendChild(h("div", { class: "grid cols-2" },
      D.AI_TOOLS.map((t) => h("div", { class: "card hoverable" }, [
        h("div", { class: "card__head" }, [
          h("div", { class: "card__icon", style: bgSoft("brand") }, t.icon),
          h("h3", null, t.purpose),
        ]),
        h("div", { class: "small", style: { color: "var(--text-2)" } }, t.how),
      ]))
    ));

    // Ready-made prompts
    out.appendChild(h("div", { class: "section-title" }, ["Prompt mẫu sẵn dùng", h("span", { class: "tag" }, "sao chép nhanh")]));
    const topic = Store.settings().topic || "[đề tài quản lý kinh tế của bạn]";
    const prompts = [
      { title: "🎭 Hội đồng ảo (voice)", text: 'Hãy đóng vai một hội đồng khoa học gồm 3 giáo sư kinh tế đang phản biện luận án của tôi về "' + topic + '". Lần lượt hỏi tôi từng câu bằng tiếng Anh, chờ tôi trả lời, sau đó nhận xét ngắn về nội dung và ngữ pháp rồi hỏi câu tiếp theo. Bắt đầu bằng câu hỏi về tính cấp thiết.' },
      { title: "✍ Sửa văn nói", text: 'Viết lại đoạn dưới đây thành tiếng Anh học thuật nhưng DỄ NÓI: câu ngắn, ít mệnh đề phụ, từ vựng chuẩn ngành kinh tế. Giữ nguyên ý. Đoạn của tôi: [dán bản thảo]' },
      { title: "🔊 Kịch bản audio shadowing", text: 'Chuyển đoạn sau thành kịch bản để tôi shadowing: chia câu ngắn, đánh dấu trọng âm từ khó bằng CHỮ HOA, và ghi chú chỗ cần ngắt hơi. Đoạn: [dán bản thuyết trình]' },
      { title: "👂 Luyện nghe câu hỏi", text: 'Cho tôi 10 câu hỏi phản biện tiếng Anh về "' + topic + '", mỗi câu viết ở 2 mức: (1) diễn đạt chậm rõ, (2) diễn đạt tự nhiên nhanh như hội đồng thật. Kèm ý chính mỗi câu bằng tiếng Việt.' },
    ];
    out.appendChild(h("div", { class: "grid cols-2" },
      prompts.map((p) => h("div", { class: "card" }, [
        h("div", { class: "row between mb-1" }, [
          h("strong", null, p.title),
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => copyText(p.text) }, "📋"),
        ]),
        h("div", { class: "small", style: { color: "var(--text-3)", whiteSpace: "pre-wrap" } }, p.text),
      ]))
    ));
    return out;
  }

  /* ============================================================
     PROGRESS — đo tiến bộ
     ============================================================ */
  function progress() {
    const out = frag([]);
    out.appendChild(pageHead("Đo tiến bộ", "Đo bằng chỉ số khách quan, không cảm tính. Ghi âm định kỳ để nghe rõ mình tiến bộ.", "Bằng chứng, không cảm tính"));

    // metrics cards
    out.appendChild(h("div", { class: "grid cols-2 mb-2" },
      D.PROGRESS_METRICS.map((m) => h("div", { class: "card" }, [
        h("div", { class: "row", style: { gap: "10px", marginBottom: "6px" } }, [
          h("span", { style: { fontSize: "20px" } }, m.icon),
          h("strong", null, m.period),
        ]),
        h("div", { class: "small", style: { color: "var(--text-2)" } }, m.text),
      ]))
    ));

    // recordings log
    out.appendChild(h("div", { class: "section-title row between" }, [
      h("span", null, "Nhật ký ghi âm"),
      h("button", { class: "btn btn--primary btn--sm", onClick: openRecordingModal }, "＋ Ghi lại 1 bản thu"),
    ]));
    out.appendChild(h("div", { class: "callout mb-2" }, [
      h("span", { class: "callout__icon" }, "🎙"),
      h("div", null, "Ghi âm bằng điện thoại/máy tính rồi lưu file. Ở đây ghi lại MỐC & CẢM NHẬN để đối chiếu qua thời gian (VD: 'so với tuần 1, đã nói liền mạch hơn, ít ừm à')."),
    ]));

    const recs = Store.get().recordings;
    if (!recs.length) {
      out.appendChild(emptyState("🎙", "Chưa có bản thu nào", "Tuần 1: ghi âm 2 phút nói về công việc làm MỐC GỐC. Sau đó hằng tuần ghi lại để so sánh."));
    } else {
      const kinds = { baseline: ["Mốc gốc", "rose"], weekly: ["Hằng tuần", "brand"], monthly: ["Hằng tháng", "violet"], mock: ["Mô phỏng bảo vệ", "amber"] };
      recs.forEach((r) => {
        const k = kinds[r.kind] || ["Khác", "sky"];
        out.appendChild(h("div", { class: "card mb-1 row between" }, [
          h("div", null, [
            h("div", { class: "row", style: { gap: "8px" } }, [
              h("span", { class: "badge badge--" + k[1] }, k[0]),
              h("span", { class: "small muted" }, prettyDate(r.date)),
            ]),
            r.note ? h("div", { class: "small mt-1", style: { color: "var(--text-2)", whiteSpace: "pre-wrap" } }, r.note) : null,
          ]),
          h("button", { class: "btn btn--ghost btn--sm", onClick: () => {
            confirmDialog({ title: "Xoá bản thu?", confirmLabel: "Xoá", danger: true,
              onConfirm: () => { Store.deleteRecording(r.id); toast("Đã xoá"); reload(); } });
          } }, "🗑"),
        ]));
      });
    }

    // risks
    out.appendChild(h("div", { class: "section-title" }, ["Rủi ro & Phương án", h("span", { class: "tag" }, "chủ động phòng ngừa")]));
    D.RISKS.forEach((r) => {
      out.appendChild(h("div", { class: "card mb-1", style: { borderLeft: "4px solid var(--rose)" } }, [
        h("div", { class: "row", style: { gap: "8px", marginBottom: "4px" } }, [
          h("span", null, "⚠"), h("strong", null, r.risk),
        ]),
        h("div", { class: "small", style: { color: "var(--text-2)" } }, [h("span", { style: { color: "var(--accent)", fontWeight: 600 } }, "→ Phương án: "), r.plan]),
      ]));
    });
    return out;
  }
  function openRecordingModal() {
    let kind = "weekly";
    const kinds = [["baseline", "Mốc gốc"], ["weekly", "Hằng tuần"], ["monthly", "Hằng tháng"], ["mock", "Mô phỏng bảo vệ"]];
    const row = h("div", { class: "row wrap", style: { gap: "6px" } });
    const chips = kinds.map(([k, label]) => {
      const c = h("button", { class: "chip" + (k === kind ? " active" : ""), onClick: () => {
        kind = k; chips.forEach((x, i) => x.classList.toggle("active", kinds[i][0] === kind));
      } }, label);
      return c;
    });
    chips.forEach((c) => row.appendChild(c));
    const note = h("textarea", { class: "textarea", placeholder: "Cảm nhận / mốc so sánh (VD: nói liền mạch hơn tuần trước, còn vấp ở phần phương pháp)…" });
    modal({
      title: "Ghi lại 1 bản thu",
      body: [
        h("div", { class: "field" }, [h("label", null, "Loại"), row]),
        h("div", { class: "field" }, [h("label", null, "Ghi chú"), note]),
      ],
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: "Lưu", variant: "primary", onClick: () => { Store.addRecording({ kind, note: note.value }); toast("Đã lưu", "accent"); reload(); } },
      ],
    });
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  function settings() {
    const out = frag([]);
    out.appendChild(pageHead("Cài đặt", "Cấu hình lộ trình, sao lưu dữ liệu. Mọi dữ liệu được lưu ngay trong trình duyệt của bạn (localStorage).", "Cá nhân hoá"));

    const s = Store.settings();

    // profile
    const name = h("input", { class: "input", placeholder: "Tên bạn", value: s.name || "" });
    const topic = h("input", { class: "input", placeholder: "VD: Quản lý ngân sách công cấp tỉnh", value: s.topic || "" });
    const start = h("input", { class: "input", type: "date", value: s.startDate || "" });
    name.addEventListener("change", () => { Store.setSetting("name", name.value.trim()); toast("Đã lưu"); });
    topic.addEventListener("change", () => { Store.setSetting("topic", topic.value.trim()); toast("Đã lưu tên đề tài"); });
    start.addEventListener("change", () => { Store.setSetting("startDate", start.value || null); toast("Đã cập nhật ngày bắt đầu"); App.render(); });

    out.appendChild(h("div", { class: "card mb-2" }, [
      h("h3", { class: "mb-2" }, "Hồ sơ & Lộ trình"),
      h("div", { class: "field" }, [h("label", null, "Tên của bạn"), name]),
      h("div", { class: "field" }, [h("label", null, "Tên đề tài (dùng để sinh prompt AI)"), topic]),
      h("div", { class: "field" }, [h("label", null, "Ngày bắt đầu lộ trình"), start,
        h("div", { class: "small muted mt-1" }, "Toàn bộ số ngày & giai đoạn tính từ ngày này.")]),
    ]));

    // backup
    out.appendChild(h("div", { class: "card mb-2" }, [
      h("h3", { class: "mb-1" }, "Sao lưu & Khôi phục dữ liệu"),
      h("div", { class: "small muted mb-2" }, "Dữ liệu lưu trong trình duyệt này. Xuất file JSON để phòng khi đổi máy / xoá cache, hoặc chuyển sang thiết bị khác."),
      h("div", { class: "row wrap", style: { gap: "10px" } }, [
        h("button", { class: "btn btn--primary btn--sm", onClick: exportData }, "⬇ Xuất dữ liệu (.json)"),
        h("button", { class: "btn btn--ghost btn--sm", onClick: importData }, "⬆ Nhập dữ liệu"),
      ]),
    ]));

    // stats snapshot
    out.appendChild(h("div", { class: "card mb-2" }, [
      h("h3", { class: "mb-2" }, "Tổng quan dữ liệu"),
      h("div", { class: "grid cols-3" }, [
        miniStat(Store.totalStudyDays(), "ngày học"),
        miniStat(Store.get().vocab.length, "từ vựng"),
        miniStat(Store.questionStats().total, "câu hỏi"),
        miniStat(Store.get().journal.length, "nhật ký"),
        miniStat(Store.get().recordings.length, "bản thu"),
        miniStat(Store.streak(), "chuỗi ngày"),
      ]),
    ]));

    // danger
    out.appendChild(h("div", { class: "card", style: { borderColor: "var(--rose)" } }, [
      h("h3", { class: "mb-1", style: { color: "var(--rose)" } }, "Vùng nguy hiểm"),
      h("div", { class: "small muted mb-2" }, "Xoá toàn bộ dữ liệu học tập. Không thể hoàn tác — nên xuất sao lưu trước."),
      h("button", { class: "btn btn--danger btn--sm", onClick: () => {
        confirmDialog({ title: "Xoá TẤT CẢ dữ liệu?", desc: "Mọi tiến độ, từ vựng, câu hỏi, nhật ký sẽ mất vĩnh viễn.", confirmLabel: "Xoá tất cả", danger: true,
          onConfirm: () => { Store.reset(); toast("Đã xoá toàn bộ dữ liệu"); App.render(); } });
      } }, "🗑 Xoá toàn bộ dữ liệu"),
    ]));

    out.appendChild(h("div", { class: "callout mt-3" }, [
      h("span", { class: "callout__icon" }, "💡"),
      h("div", null, [
        h("strong", null, "Mẹo dùng đa thiết bị: "),
        "Sau mỗi tuần, 'Xuất dữ liệu' và lưu file vào Google Drive/OneDrive. Khi mở web trên máy khác, 'Nhập dữ liệu' để đồng bộ.",
      ]),
    ]));
    return out;
  }
  function miniStat(v, label) {
    return h("div", { class: "center" }, [
      h("div", { style: { fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "24px" } }, String(v)),
      h("div", { class: "small muted" }, label),
    ]);
  }

  function exportData() {
    const data = Store.exportJSON();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: "english-defense-backup.json" });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast("Đã xuất file sao lưu", "accent");
  }
  function importData() {
    const input = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { Store.importJSON(reader.result); toast("Đã nhập dữ liệu thành công", "accent"); App.render(); }
        catch (e) { toast("File không hợp lệ"); }
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input); input.click(); setTimeout(() => input.remove(), 1000);
  }

  /* ---------- copy helper ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("Đã sao chép vào clipboard", "accent"), fallback);
    } else fallback();
    function fallback() {
      const ta = h("textarea", { style: { position: "fixed", opacity: 0 } }); ta.value = text;
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("Đã sao chép", "accent"); } catch (e) { toast("Không sao chép được"); }
      ta.remove();
    }
  }

  global.Views = {
    dashboard, roadmap, today, journal, questions, vocab, rescue, aitools, progress, settings,
  };
})(window);
