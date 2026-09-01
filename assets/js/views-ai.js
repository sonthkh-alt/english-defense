/* ============================================================
   views-ai.js — Module 4: Luyện nói với AI
   ------------------------------------------------------------
   Phương án chính: dùng GEMINI AI (miễn phí) — app sinh sẵn
   PROMPT chứa đầy đủ hồ sơ + vị trí lộ trình + số liệu tiến độ;
   người học sao chép → dán vào Gemini → luyện nói (Gemini app
   trên điện thoại có đàm thoại giọng nói rất tốt).
   Tùy chọn: trò chuyện ngay trong app qua Anthropic API (cần key).
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;

  const GEMINI_URL = "https://gemini.google.com/app";

  const PROMPT_CARDS = [
    { id: "weekly", icon: "🧭", label: "Kế hoạch tuần + bài tập hôm nay",
      desc: "Gemini đánh giá tiến độ của bạn, lập kế hoạch 7 ngày bám lộ trình và giao ngay 1 bài nói.",
      build: () => PROMPTS.weekly() },
    { id: "talk", icon: "💬", label: "Hội thoại học thuật",
      desc: "Trò chuyện về công việc/nghiên cứu — Gemini hỏi từng câu, sửa nhẹ bằng cách nhắc lại đúng.",
      build: () => PROMPTS.coach("talk") },
    { id: "correct", icon: "✏", label: "Sửa lỗi từng câu",
      desc: "Bạn nói/gõ từng đoạn — Gemini chỉ tối đa 3 lỗi, gợi ý cách diễn đạt học thuật hơn.",
      build: () => PROMPTS.coach("correct") },
    { id: "committee", icon: "🎓", label: "Nhập vai hội đồng phản biện",
      desc: "Gemini đóng vai giáo sư, hỏi xoáy 8 dạng câu hỏi, nhận xét sau từng câu trả lời.",
      build: () => PROMPTS.coach("committee") },
  ];

  Views.coach = function () {
    const root = h("div");
    home(root);
    return root;
  };

  function home(root) {
    root.innerHTML = "";

    // Hướng dẫn 4 bước
    root.appendChild(h("div", { class: "card callout" }, [
      h("div", { class: "callout__icon" }, "✦"),
      h("div", { class: "small" }, [
        h("strong", null, "Cách luyện với Gemini (miễn phí): "),
        "① chọn chế độ dưới đây và bấm Sao chép — prompt đã chứa sẵn hồ sơ, vị trí lộ trình tháng " +
        Store.currentMonth() + " và số liệu tiến độ của bạn → ② mở Gemini, dán vào → ③ luyện — trên điện thoại hãy dùng ",
        h("strong", null, "micro / chế độ đàm thoại của app Gemini"),
        " để NÓI thay vì gõ → ④ xong quay lại đây bấm \"Đã luyện xong\" để tính vào chuỗi ngày học.",
      ]),
    ]));

    // Các thẻ prompt
    PROMPT_CARDS.forEach((p) => {
      root.appendChild(h("div", { class: "card" }, [
        h("div", { class: "between" }, [
          h("div", { style: { minWidth: 0 } }, [
            h("div", { style: { fontWeight: 700 } }, p.icon + " " + p.label),
            h("div", { class: "small muted" }, p.desc),
          ]),
          h("div", { class: "row gap-sm", style: { flexShrink: 0 } }, [
            h("button", { class: "btn btn--ghost btn--sm", onClick: () => previewPrompt(p) }, "Xem"),
            h("button", { class: "btn btn--primary btn--sm", onClick: () => UI.copy(p.build()) }, "📋 Sao chép"),
          ]),
        ]),
      ]));
    });

    // Hàng hành động
    root.appendChild(h("div", { class: "card" }, [
      h("div", { class: "row gap-sm", style: { flexWrap: "wrap" } }, [
        h("a", { class: "btn btn--accent", href: GEMINI_URL, target: "_blank", rel: "noopener" }, "Mở Gemini ↗"),
        h("button", {
          class: "btn btn--primary",
          onClick: () => {
            Store.logCoach("gemini", 1);
            Store.logActivity("coach", 15);
            UI.toast("Đã tính buổi luyện nói hôm nay ✓ (+15 phút)", "accent");
            App.render();
          },
        }, "✓ Đã luyện xong với Gemini"),
      ]),
      h("p", { class: "small muted mb-0 mt-1" },
        "Mẹo: trong Gemini, mỗi buổi chỉ cần dán prompt MỘT lần rồi luyện tiếp trong cùng cuộc trò chuyện. Sang buổi mới nên sao chép prompt mới — số liệu tiến độ được cập nhật theo ngày."),
    ]));

    // Tùy chọn: chat ngay trong app (Anthropic)
    root.appendChild(h("div", { class: "card" }, [
      h("div", { class: "between" }, [
        h("div", null, [
          h("div", { style: { fontWeight: 700 } }, "Trò chuyện ngay trong app (tùy chọn)"),
          h("div", { class: "small muted" }, AI.ready()
            ? "Dùng Anthropic API (" + AI.model() + ") — nói bằng micro, AI trả lời và đọc to."
            : "Cần Anthropic API key (nhập trong Cài đặt). Không bắt buộc — Gemini ở trên là đủ."),
        ]),
        AI.ready()
          ? h("button", { class: "btn btn--primary btn--sm", onClick: () => pickInApp(root) }, "Bắt đầu")
          : h("a", { class: "btn btn--ghost btn--sm", href: "#/settings" }, "Cài đặt"),
      ]),
    ]));
  }

  function previewPrompt(p) {
    const text = p.build();
    const ta = h("textarea", { class: "textarea", rows: 14, readonly: "readonly", style: { fontSize: ".8rem" } }, text);
    UI.modal({
      title: p.label,
      body: ta,
      actions: [
        { label: "Đóng", variant: "ghost" },
        { label: "📋 Sao chép", variant: "primary", onClick: () => { UI.copy(text); } },
      ],
    });
  }

  /* ============ Chat trong app (Anthropic — tùy chọn) ============ */
  const MODES = [
    { id: "talk", label: "💬 Hội thoại", desc: "Trò chuyện học thuật tự nhiên — AI hỏi từng câu, nhẹ nhàng sửa bằng cách nhắc lại đúng." },
    { id: "correct", label: "✏ Sửa lỗi", desc: "AI chỉ ra tối đa 3 lỗi mỗi lượt + gợi ý cách nói trang trọng hơn." },
    { id: "committee", label: "🎓 Nhập vai hội đồng", desc: "AI đóng vai giáo sư phản biện, hỏi xoáy về nghiên cứu của bạn." },
  ];

  function pickInApp(root) {
    root.innerHTML = "";
    root.appendChild(h("div", { class: "between mt-1" }, [
      h("span", { class: "small", style: { fontWeight: 700 } }, "Chat trong app"),
      h("button", { class: "btn btn--ghost btn--sm", onClick: () => home(root) }, "← Quay lại"),
    ]));
    MODES.forEach((m) => {
      root.appendChild(h("div", { class: "card" }, [
        h("div", { class: "between" }, [
          h("div", null, [
            h("div", { style: { fontWeight: 700 } }, m.label),
            h("div", { class: "small muted" }, m.desc),
          ]),
          h("button", { class: "btn btn--primary btn--sm", onClick: () => chatView(root, m) }, "Bắt đầu"),
        ]),
      ]));
    });
  }

  function chatView(root, mode) {
    root.innerHTML = "";
    const msgs = [];      // [{role, content}]
    let busy = false, listener = null;
    const t0 = Date.now();
    // rời trang bằng menu → tắt micro
    if (global.App && App.onCleanup) App.onCleanup(() => { if (listener) { listener.stop(); listener = null; } });

    root.appendChild(h("div", { class: "between mt-1" }, [
      h("span", { class: "small", style: { fontWeight: 700 } }, mode.label),
      h("button", { class: "btn btn--ghost btn--sm", onClick: leave }, "← Kết thúc"),
    ]));

    const log = h("div", { class: "chat-log" });
    root.appendChild(log);

    const status = h("div", { class: "small muted center" }, "");
    const input = h("textarea", { class: "textarea", rows: 2, placeholder: "Nói bằng micro hoặc gõ tiếng Anh ở đây…" });
    const micBtn = h("button", { class: "btn btn--accent", onClick: toggleMic }, "🎙 Nói");
    const sendBtn = h("button", { class: "btn btn--primary", onClick: () => send(input.value) }, "Gửi →");
    root.appendChild(status);
    root.appendChild(h("div", { class: "chat-input" }, [input, h("div", { class: "row gap-sm" }, [micBtn, sendBtn])]));
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); } });

    addBubble("ai", mode.id === "committee"
      ? "Good morning. I am a member of your committee. Let's begin: could you briefly introduce your research topic?"
      : "Hello! I'm your speaking coach. Tell me about your research — what is your study about?");
    UI.Speech.ttsSpeak(log.lastChild.textContent);

    function toggleMic() {
      if (!REC.STT.supported()) { UI.toast("Trình duyệt không hỗ trợ nhận dạng giọng nói — hãy gõ."); return; }
      if (listener) { listener.stop(); return; }
      micBtn.textContent = "■ Dừng";
      micBtn.classList.replace("btn--accent", "btn--danger");
      status.textContent = "🔴 Đang nghe… nói tiếng Anh, xong nhấn Dừng";
      listener = REC.STT.listen({
        continuous: true,
        onPartial: (t) => { input.value = t; },
        onEnd: (err, finalText) => {
          listener = null;
          micBtn.textContent = "🎙 Nói";
          micBtn.classList.replace("btn--danger", "btn--accent");
          status.textContent = "";
          if (finalText) send(finalText);
        },
      });
    }

    async function send(text) {
      text = String(text || "").trim();
      if (!text || busy) return;
      input.value = "";
      addBubble("me", text);
      msgs.push({ role: "user", content: text });
      busy = true;
      const typing = addBubble("ai", "…");
      try {
        const reply = await AI.chat(msgs, AI.coachSystem(mode.id), 800);
        typing.remove();
        addBubble("ai", reply);
        msgs.push({ role: "assistant", content: reply });
        // đọc to phần tiếng Anh (bỏ các dòng sửa lỗi ✗/✓ và ghi chú VN)
        const spoken = reply.split("\n").filter((l) => !/[✗✓]|VN:/.test(l)).join(" ").slice(0, 400);
        if (spoken.trim()) UI.Speech.ttsSpeak(spoken);
      } catch (e) {
        typing.remove();
        addBubble("ai", "⚠ " + e.message);
      }
      busy = false;
    }

    function addBubble(who, text) {
      const b = h("div", { class: "bubble bubble--" + who, style: { whiteSpace: "pre-wrap" } }, text);
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }

    function leave() {
      if (listener) listener.stop();
      const turns = msgs.filter((m) => m.role === "user").length;
      if (turns > 0) {
        Store.logCoach(mode.id, turns);
        Store.logActivity("coach", Math.max(2, Math.round((Date.now() - t0) / 60000)));
        UI.toast("Đã ghi nhận buổi nói " + turns + " lượt ✓", "accent");
      }
      home(root);
    }
  }
})(window);
