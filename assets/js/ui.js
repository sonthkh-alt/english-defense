/* ============================================================
   ui.js — Tiện ích UI dùng chung (DOM, toast, modal, ring...)
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- DOM helper: h(tag, attrs, children) ---------- */
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "html") el.innerHTML = v;
        else if (k === "text") el.textContent = v;
        else if (k === "dataset") { for (const dk in v) el.dataset[dk] = v[dk]; }
        else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
        else el.setAttribute(k, v);
      }
    }
    appendChildren(el, children);
    return el;
  }
  function appendChildren(el, children) {
    if (children == null) return;
    if (Array.isArray(children)) children.forEach((c) => appendChildren(el, c));
    else if (children instanceof Node) el.appendChild(children);
    else el.appendChild(document.createTextNode(String(children)));
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- Toast ---------- */
  function toast(msg, type) {
    const host = document.getElementById("toast-host");
    const t = h("div", { class: "toast" + (type ? " toast--" + type : "") }, [
      type === "accent" ? "✓ " : "",
      msg,
    ]);
    host.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 300);
    }, 2600);
  }

  /* ---------- Modal ---------- */
  function modal({ title, desc, body, actions, onOpen }) {
    const host = document.getElementById("modal-host");
    host.innerHTML = "";
    const backdrop = h("div", { class: "modal-backdrop" });
    const box = h("div", { class: "modal" });

    if (title) box.appendChild(h("h3", null, title));
    if (desc) box.appendChild(h("p", { class: "modal__desc" }, desc));
    if (body) appendChildren(box, body);

    const acts = h("div", { class: "modal__actions" });
    (actions || []).forEach((a) => {
      const btn = h("button", {
        class: "btn " + (a.variant ? "btn--" + a.variant : "btn--ghost"),
        onClick: () => { if (a.onClick) { const r = a.onClick(); if (r !== false) close(); } else close(); },
      }, a.label);
      acts.appendChild(btn);
    });
    if ((actions || []).length) box.appendChild(acts);

    host.appendChild(backdrop);
    host.appendChild(box);
    host.classList.add("show");
    host.setAttribute("aria-hidden", "false");

    function close() {
      host.classList.remove("show");
      host.setAttribute("aria-hidden", "true");
      host.innerHTML = "";
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    if (onOpen) onOpen(box, close);
    // focus first input
    const firstInput = box.querySelector("input, textarea, select");
    if (firstInput) firstInput.focus();
    return { close };
  }

  function confirmDialog({ title, desc, confirmLabel, danger, onConfirm }) {
    modal({
      title, desc,
      actions: [
        { label: "Hủy", variant: "ghost" },
        { label: confirmLabel || "Xác nhận", variant: danger ? "danger" : "primary", onClick: onConfirm },
      ],
    });
  }

  /* ---------- SVG progress ring ---------- */
  function ring(percent, opts) {
    opts = opts || {};
    const size = opts.size || 92;
    const stroke = opts.stroke || 9;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, percent));
    const offset = c * (1 - pct / 100);
    const color = opts.color || "var(--brand)";
    const wrap = h("div", { class: "ring", style: { width: size + "px", height: size + "px" } });
    wrap.innerHTML =
      '<svg width="' + size + '" height="' + size + '">' +
      '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"></circle>' +
      '<circle class="ring__fill" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" stroke="' + color + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '"></circle>' +
      '</svg>' +
      '<div class="ring__label">' + Math.round(pct) + '%' + (opts.sublabel ? '<small>' + esc(opts.sublabel) + '</small>' : '') + '</div>';
    // animate offset after mount
    requestAnimationFrame(() => {
      const fill = wrap.querySelector(".ring__fill");
      if (fill) fill.style.strokeDashoffset = offset;
    });
    return wrap;
  }

  /* ---------- Linear bar ---------- */
  function bar(percent, variant) {
    const wrap = h("div", { class: "bar" + (variant ? " bar--" + variant : "") });
    const fill = h("div", { class: "bar__fill", style: { width: "0%" } });
    wrap.appendChild(fill);
    requestAnimationFrame(() => { fill.style.width = Math.max(0, Math.min(100, percent)) + "%"; });
    return wrap;
  }

  /* ---------- Format helpers ---------- */
  const WD = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const MO = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];
  function prettyDate(iso) {
    const d = Store.parseISO(iso);
    return WD[d.getDay()] + ", " + d.getDate() + " " + MO[d.getMonth()] + " " + d.getFullYear();
  }
  function shortDate(iso) {
    const d = Store.parseISO(iso);
    return d.getDate() + "/" + (d.getMonth() + 1);
  }

  /* ---------- Speech (đọc audio phát âm chuẩn — Web Speech API) ---------- */
  const Speech = (function () {
    const synth = global.speechSynthesis;
    let voices = [];
    function load() { if (synth) voices = synth.getVoices() || []; }
    if (synth) {
      load();
      if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", load);
      else if ("onvoiceschanged" in synth) synth.onvoiceschanged = load;
    }
    function englishVoices() {
      if (!voices.length) load();
      return voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
    }
    // Ưu tiên giọng chất lượng cao, chuẩn en-US/en-GB
    function pickVoice() {
      const en = englishVoices();
      if (!en.length) return voices[0] || null;
      const pref = (global.Store && Store.settings && Store.settings().voiceURI) || "";
      if (pref) { const f = voices.find((v) => v.voiceURI === pref); if (f) return f; }
      const wanted = [
        "Google US English", "Google UK English Female", "Google UK English Male",
        "Microsoft Aria", "Microsoft Jenny", "Microsoft Michelle", "Microsoft Guy",
        "Samantha", "Microsoft Zira", "Microsoft David",
      ];
      for (const name of wanted) { const f = en.find((v) => v.name && v.name.indexOf(name) !== -1); if (f) return f; }
      const us = en.find((v) => /en[-_]US/i.test(v.lang)); if (us) return us;
      return en[0];
    }
    function speak(text, opts) {
      opts = opts || {};
      if (!synth) { toast("Trình duyệt không hỗ trợ đọc audio"); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        const v = pickVoice();
        if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "en-US"; }
        const rate = opts.rate != null ? opts.rate
          : (global.Store && Store.settings && Store.settings().speechRate) || 0.85;
        u.rate = Math.max(0.5, Math.min(1.2, rate));
        u.pitch = 1;
        synth.speak(u);
      } catch (e) { toast("Không phát được audio"); }
    }
    return { supported: !!synth, speak, englishVoices, pickVoice, reload: load };
  })();

  global.UI = { h, esc, toast, modal, confirmDialog, ring, bar, prettyDate, shortDate, appendChildren, WD, MO, Speech, speak: (t, o) => Speech.speak(t, o) };
})(window);
