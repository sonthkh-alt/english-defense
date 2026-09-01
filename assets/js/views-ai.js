/* ============================================================
   views-ai.js — Module 4: Luyện nói với AI (Speaking Coach)
   ------------------------------------------------------------
   Người học NÓI (speech-to-text) → Claude phản hồi văn bản +
   đọc to (TTS). 3 chế độ: hội thoại · sửa lỗi · nhập vai hội đồng.
   ============================================================ */
(function (global) {
  "use strict";
  const Views = global.Views = global.Views || {};
  const { h } = UI;

  const MODES = [
    { id: "talk", label: "💬 Hội thoại", desc: "Trò chuyện học thuật tự nhiên — AI hỏi từng câu, nhẹ nhàng sửa bằng cách nhắc lại đúng." },
    { id: "correct", label: "✏ Sửa lỗi", desc: "AI chỉ ra tối đa 3 lỗi mỗi lượt (ngữ pháp, từ chưa chuẩn học thuật) + gợi ý cách nói trang trọng hơn." },
    { id: "committee", label: "🎓 Nhập vai hội đồng", desc: "AI đóng vai giáo sư phản biện, hỏi xoáy về nghiên cứu của bạn — mỗi lần một câu." },
  ];

  Views.coach = function () {
    const root = h("div");
    if (!AI.ready()) {
      root.appendChild(needKey());
      return root;
    }
    picker(root);
    return root;
  };

  function needKey() {
    return h("div", { class: "card callout callout--amber" }, [
      h("div", { class: "callout__icon" }, "🔑"),
      h("div", null, [
        h("div", { style: { fontWeight: 700 } }, "Cần Anthropic API key"),
        h("p", { class: "small muted" }, "Module này gọi Claude làm giáo viên hội thoại. Nhập API key trong Cài đặt (chỉ lưu trên máy bạn). Các module Từ vựng / Phát âm / Shadowing vẫn dùng được không cần AI."),
        h("a", { class: "btn btn--primary btn--sm", href: "#/settings" }, "→ Mở Cài đặt"),
      ]),
    ]);
  }

  function picker(root) {
    root.innerHTML = "";
    root.appendChild(h("p", { class: "small muted mt-1" },
      "Chọn chế độ. Nói bằng micro (khuyên dùng) hoặc gõ. AI trả lời ngắn ở mức B1 để bạn theo kịp, và đọc to câu trả lời."));
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
      picker(root);
    }
  }
})(window);
