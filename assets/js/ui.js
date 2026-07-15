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
    // Chấm điểm chất lượng giọng — cao = tự nhiên hơn (neural/online/natural)
    function scoreVoice(v) {
      const n = (v.name || "") + " " + (v.voiceURI || "");
      let s = 0;
      if (/natural/i.test(n)) s += 120;
      if (/neural/i.test(n)) s += 110;
      if (/online/i.test(n)) s += 60;   // giọng Microsoft Online = neural
      if (/google/i.test(n)) s += 55;
      if (/siri|samantha/i.test(n)) s += 58;
      if (/\b(aria|jenny|guy|michelle|ana|libby|sonia|ryan|emma|christopher|eric|jane)\b/i.test(n)) s += 35; // tên giọng MS neural
      if (v.localService === false) s += 25; // giọng đám mây thường tự nhiên hơn
      if (/en[-_]US/i.test(v.lang)) s += 12;
      if (/en[-_]GB/i.test(v.lang)) s += 8;
      if (/microsoft (david|zira|mark|hazel)\b/i.test(n)) s -= 30; // giọng cũ, máy móc
      return s;
    }
    function voiceQuality(v) {
      const n = (v.name || "") + " " + (v.voiceURI || "");
      if (/natural|neural|online/i.test(n) || /google|siri/i.test(n) || v.localService === false) return "natural";
      if (/samantha|aria|jenny|guy|michelle/i.test(n)) return "enhanced";
      return "standard";
    }
    // Danh sách giọng en xếp theo chất lượng giảm dần
    function rankedVoices() {
      return englishVoices().slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
    }
    // Ưu tiên giọng tự nhiên nhất (hoặc giọng người dùng đã chọn)
    function pickVoice() {
      const en = englishVoices();
      if (!en.length) return voices[0] || null;
      const pref = (global.Store && Store.settings && Store.settings().voiceURI) || "";
      if (pref) { const f = voices.find((v) => v.voiceURI === pref); if (f) return f; }
      return rankedVoices()[0];
    }
    function humanOn() {
      return !(global.Store && Store.settings && Store.settings().humanAudio === false);
    }
    // ---- Audio NGƯỜI BẢN XỨ THẬT cho TỪ đơn (Free Dictionary API) ----
    const audioCache = {};
    function fetchWordAudio(word) {
      return new Promise((resolve) => {
        const key = String(word).toLowerCase().trim();
        if (key in audioCache) return resolve(audioCache[key]);
        if (/\s/.test(key) || key.length < 2 || typeof fetch === "undefined") { audioCache[key] = null; return resolve(null); }
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(key))
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            let url = null;
            if (Array.isArray(data)) {
              for (const entry of data) {
                for (const ph of (entry.phonetics || [])) {
                  if (ph && ph.audio) {
                    let a = ph.audio; if (a.indexOf("//") === 0) a = "https:" + a;
                    if (/-us\.mp3/i.test(a)) { url = a; break; }
                    if (!url) url = a;
                  }
                }
                if (url && /-us\.mp3/i.test(url)) break;
              }
            }
            audioCache[key] = url; resolve(url);
          })
          .catch(() => { audioCache[key] = null; resolve(null); });
      });
    }
    function playUrl(url) {
      try { const a = new Audio(url); a.play(); return true; } catch (e) { return false; }
    }
    // TTS với NHẤN NHÁ: tách câu theo dấu câu → nhiều utterance → có ngắt nghỉ tự nhiên
    function ttsSpeak(text, opts) {
      opts = opts || {};
      if (!synth) { toast("Trình duyệt không hỗ trợ đọc audio"); return; }
      try {
        synth.cancel();
        const v = pickVoice();
        const rate = opts.rate != null ? opts.rate
          : (global.Store && Store.settings && Store.settings().speechRate) || 0.85;
        const rr = Math.max(0.5, Math.min(1.2, rate));
        const clauses = String(text).match(/[^,;:.!?—]+[,;:.!?—]?/g) || [String(text)];
        clauses.forEach((c) => {
          c = c.trim(); if (!c) return;
          const u = new SpeechSynthesisUtterance(c);
          if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "en-US"; }
          u.rate = rr; u.pitch = 1.0;
          synth.speak(u);
        });
      } catch (e) { toast("Không phát được audio"); }
    }
    // Đầu vào chung: TỪ đơn → thử giọng người thật; CÂU → TTS nhấn nhá
    function speak(text, opts) {
      opts = opts || {};
      const t = String(text).trim();
      const single = t.length > 1 && !/\s/.test(t);
      if (single && humanOn() && !opts.ttsOnly && !opts.rate) {
        fetchWordAudio(t).then((url) => { if (!(url && playUrl(url))) ttsSpeak(t, opts); });
        return;
      }
      ttsSpeak(t, opts);
    }
    // Nghe thử MỘT giọng cụ thể (để chọn trong Cài đặt)
    function testVoice(voice, text, rate) {
      if (!synth) { toast("Trình duyệt không hỗ trợ đọc audio"); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text || "Good morning. Thank you for the opportunity to present my research today.");
        if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-US"; }
        u.rate = Math.max(0.5, Math.min(1.2, rate || (global.Store && Store.settings && Store.settings().speechRate) || 0.85));
        u.pitch = 1.0;
        synth.speak(u);
      } catch (e) { toast("Không phát được audio"); }
    }
    return { supported: !!synth, speak, ttsSpeak, testVoice, fetchWordAudio, englishVoices, rankedVoices, pickVoice, voiceQuality, reload: load };
  })();

  global.UI = { h, esc, toast, modal, confirmDialog, ring, bar, prettyDate, shortDate, appendChildren, WD, MO, Speech, speak: (t, o) => Speech.speak(t, o) };
})(window);
