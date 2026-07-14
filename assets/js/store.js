/* ============================================================
   store.js — Lưu trạng thái người dùng vào localStorage
   Tất cả dữ liệu học tập cá nhân nằm ở đây.
   ============================================================ */
(function (global) {
  "use strict";

  const KEY = "english-defense::v1";
  const SCHEMA = 1;

  function defaultState() {
    return {
      schema: SCHEMA,
      settings: {
        startDate: null,        // ISO yyyy-mm-dd — ngày bắt đầu lộ trình
        theme: "light",
        topic: "",              // tên đề tài của người dùng
        name: "",
      },
      // sessions[yyyy-mm-dd] = { blocks:{listen:true,...}, minutes:Number, note:String }
      sessions: {},
      // vocab: [{id, term, pos, meaning, example, created, box(1..5), lastReview}]
      vocab: [],
      // questions[axisId] = [{id, en, vi, answer, mastery(0..3)}]
      questions: {},
      // rescue: câu cứu nguy tự thêm + trạng thái thuộc
      rescueCustom: [],
      rescueMastered: {},       // index/id -> true
      // journal: [{id, date, title, body, mood}]
      journal: [],
      // phaseDone: {0:true,...}
      phaseDone: {},
      // recordings: [{id, date, kind, note}] — nhật ký ghi âm đo tiến bộ
      recordings: [],
      // đã nạp gói khởi động tháng 1 chưa
      seeded: false,
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch (e) {
      console.warn("Store load failed, resetting:", e);
      return defaultState();
    }
  }

  function migrate(s) {
    const base = defaultState();
    // shallow-merge để an toàn khi thêm field mới trong tương lai
    const merged = Object.assign({}, base, s);
    merged.settings = Object.assign({}, base.settings, s.settings || {});
    merged.sessions = s.sessions || {};
    merged.vocab = s.vocab || [];
    merged.questions = s.questions || {};
    merged.rescueCustom = s.rescueCustom || [];
    merged.rescueMastered = s.rescueMastered || {};
    merged.journal = s.journal || [];
    merged.phaseDone = s.phaseDone || {};
    merged.recordings = s.recordings || [];
    merged.seeded = !!s.seeded;
    merged.schema = SCHEMA;
    return merged;
  }

  const listeners = new Set();
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Persist failed:", e);
    }
    listeners.forEach((fn) => fn(state));
  }

  /* ---------- Date helpers ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return isoDate(new Date()); }
  function parseISO(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
  function daysBetween(a, b) {
    const MS = 86400000;
    return Math.round((parseISO(b) - parseISO(a)) / MS);
  }

  /* ---------- Public API ---------- */
  const Store = {
    get: () => state,
    settings: () => state.settings,

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // ----- settings -----
    setSetting(k, v) { state.settings[k] = v; persist(); },
    ensureStartDate() {
      if (!state.settings.startDate) { state.settings.startDate = today(); persist(); }
      return state.settings.startDate;
    },

    // ----- date info -----
    today, isoDate, parseISO, daysBetween,
    dayNumber() {
      if (!state.settings.startDate) return null;
      return daysBetween(state.settings.startDate, today()) + 1;
    },
    // giai đoạn hiện tại dựa trên số ngày đã trôi qua.
    // GĐ0 (tuần 1–2) và GĐ1 (tháng 1–3) chồng thời gian, nên dùng
    // ngưỡng theo NGÀY, không theo tháng, để không nhập nhằng.
    currentPhase() {
      const dn = this.dayNumber();
      const P = APP_DATA.PHASES;
      if (dn == null) return P[0];
      if (dn <= 14) return P[0];   // Tuần 1–2: Khởi động
      if (dn <= 90) return P[1];   // Tháng 1–3
      if (dn <= 180) return P[2];  // Tháng 4–6
      if (dn <= 270) return P[3];  // Tháng 7–9
      return P[4];                 // Tháng 10–12
    },

    // ----- sessions (buổi học) -----
    getSession(date) { return state.sessions[date || today()] || null; },
    toggleBlock(date, blockId) {
      date = date || today();
      const s = state.sessions[date] || { blocks: {}, minutes: 0, note: "" };
      s.blocks = s.blocks || {};
      s.blocks[blockId] = !s.blocks[blockId];
      state.sessions[date] = s;
      persist();
      return s;
    },
    setSessionNote(date, note) {
      date = date || today();
      const s = state.sessions[date] || { blocks: {}, minutes: 0, note: "" };
      s.note = note;
      state.sessions[date] = s;
      persist();
    },
    logMinutes(date, minutes) {
      date = date || today();
      const s = state.sessions[date] || { blocks: {}, minutes: 0, note: "" };
      s.minutes = minutes;
      state.sessions[date] = s;
      persist();
    },
    // đánh dấu học xong hôm nay tối thiểu (dùng cho streak khi bận)
    markStudied(date) {
      date = date || today();
      const s = state.sessions[date] || { blocks: {}, minutes: 0, note: "" };
      s.studied = true;
      state.sessions[date] = s;
      persist();
    },
    // 1 ngày được tính "có học" nếu có ít nhất 1 block xong / minutes>0 / studied
    dayCounts(date) {
      const s = state.sessions[date];
      if (!s) return false;
      if (s.studied) return true;
      if (s.minutes > 0) return true;
      return s.blocks && Object.values(s.blocks).some(Boolean);
    },
    // tổng phút của 1 buổi (nếu chưa nhập tay thì cộng từ block hoàn thành)
    sessionMinutes(date) {
      const s = state.sessions[date];
      if (!s) return 0;
      if (s.minutes > 0) return s.minutes;
      if (!s.blocks) return 0;
      return APP_DATA.DAILY_BLOCKS.reduce((sum, b) => sum + (s.blocks[b.id] ? b.dur : 0), 0);
    },
    streak() {
      // đếm ngược từ hôm nay
      let count = 0;
      const d = new Date();
      // nếu hôm nay chưa học nhưng hôm qua có, vẫn tính chuỗi tới hôm qua
      if (!this.dayCounts(isoDate(d))) d.setDate(d.getDate() - 1);
      while (this.dayCounts(isoDate(d))) {
        count++;
        d.setDate(d.getDate() - 1);
      }
      return count;
    },
    totalStudyDays() {
      return Object.keys(state.sessions).filter((d) => this.dayCounts(d)).length;
    },
    totalMinutes() {
      return Object.keys(state.sessions).reduce((sum, d) => sum + this.sessionMinutes(d), 0);
    },

    // ----- phases -----
    togglePhase(id) { state.phaseDone[id] = !state.phaseDone[id]; persist(); },
    isPhaseDone(id) { return !!state.phaseDone[id]; },

    // ----- vocab -----
    addVocab({ term, pos, meaning, example }) {
      const item = {
        id: uid(), term: term.trim(), pos: (pos || "").trim(),
        meaning: (meaning || "").trim(), example: (example || "").trim(),
        created: today(), box: 1, lastReview: null,
      };
      state.vocab.unshift(item);
      persist();
      return item;
    },
    updateVocab(id, patch) {
      const v = state.vocab.find((x) => x.id === id);
      if (v) { Object.assign(v, patch); persist(); }
    },
    deleteVocab(id) { state.vocab = state.vocab.filter((x) => x.id !== id); persist(); },
    reviewVocab(id, remembered) {
      const v = state.vocab.find((x) => x.id === id);
      if (!v) return;
      v.box = remembered ? Math.min(5, (v.box || 1) + 1) : 1;
      v.lastReview = today();
      persist();
    },
    vocabAddedToday() {
      const t = today();
      return state.vocab.filter((v) => v.created === t).length;
    },

    // ----- questions -----
    getQuestions(axisId) { return state.questions[axisId] || []; },
    addQuestion(axisId, { en, vi, answer }) {
      const arr = state.questions[axisId] || (state.questions[axisId] = []);
      const item = { id: uid(), en: en.trim(), vi: (vi || "").trim(), answer: (answer || "").trim(), mastery: 0 };
      arr.push(item);
      persist();
      return item;
    },
    updateQuestion(axisId, id, patch) {
      const arr = state.questions[axisId] || [];
      const q = arr.find((x) => x.id === id);
      if (q) { Object.assign(q, patch); persist(); }
    },
    deleteQuestion(axisId, id) {
      state.questions[axisId] = (state.questions[axisId] || []).filter((x) => x.id !== id);
      persist();
    },
    cycleMastery(axisId, id) {
      const arr = state.questions[axisId] || [];
      const q = arr.find((x) => x.id === id);
      if (q) { q.mastery = ((q.mastery || 0) + 1) % 4; persist(); }
    },
    questionStats() {
      let total = 0, mastered = 0;
      APP_DATA.QUESTION_AXES.forEach((ax) => {
        const arr = state.questions[ax.id] || [];
        total += arr.length;
        mastered += arr.filter((q) => (q.mastery || 0) >= 3).length;
      });
      return { total, mastered };
    },

    // ----- rescue -----
    toggleRescueMastered(key) { state.rescueMastered[key] = !state.rescueMastered[key]; persist(); },
    addRescue({ en, vi }) {
      const item = { id: uid(), en: en.trim(), vi: (vi || "").trim() };
      state.rescueCustom.push(item);
      persist();
      return item;
    },
    deleteRescue(id) { state.rescueCustom = state.rescueCustom.filter((x) => x.id !== id); persist(); },

    // ----- journal -----
    addJournal({ title, body, mood }) {
      const item = { id: uid(), date: today(), title: title.trim(), body: (body || "").trim(), mood: mood || "🙂" };
      state.journal.unshift(item);
      persist();
      return item;
    },
    deleteJournal(id) { state.journal = state.journal.filter((x) => x.id !== id); persist(); },

    // ----- recordings (đo tiến bộ) -----
    addRecording({ kind, note }) {
      const item = { id: uid(), date: today(), kind: kind || "weekly", note: (note || "").trim() };
      state.recordings.unshift(item);
      persist();
      return item;
    },
    deleteRecording(id) { state.recordings = state.recordings.filter((x) => x.id !== id); persist(); },

    // ----- gói khởi động tháng 1 -----
    hasSeeded() { return !!state.seeded; },
    // Nạp SEED: bỏ qua từ/câu đã tồn tại (idempotent). Trả về số lượng đã thêm.
    importStarterPack() {
      if (typeof SEED === "undefined") return { vocab: 0, questions: 0 };
      let addedV = 0, addedQ = 0;
      // vocab — created = "" để không tính vào chỉ tiêu "5 từ hôm nay"
      const existingTerms = new Set(state.vocab.map((v) => v.term.toLowerCase()));
      SEED.VOCAB.forEach((it) => {
        const term = it.t.trim();
        if (existingTerms.has(term.toLowerCase())) return;
        state.vocab.push({
          id: uid(), term: term, pos: it.p || "", meaning: it.m || "", example: it.e || "",
          created: "", box: 1, lastReview: null, seeded: true,
        });
        existingTerms.add(term.toLowerCase());
        addedV++;
      });
      // questions
      APP_DATA.QUESTION_AXES.forEach((ax) => {
        const seedList = (SEED.QUESTIONS[ax.id] || []);
        const arr = state.questions[ax.id] || (state.questions[ax.id] = []);
        const existingEn = new Set(arr.map((q) => q.en.toLowerCase()));
        seedList.forEach((sq) => {
          if (existingEn.has(sq.q.toLowerCase())) return;
          arr.push({ id: uid(), en: sq.q, vi: sq.v || "", answer: sq.a || "", mastery: 0, seeded: true });
          existingEn.add(sq.q.toLowerCase());
          addedQ++;
        });
      });
      state.seeded = true;
      persist();
      return { vocab: addedV, questions: addedQ };
    },

    // ----- backup -----
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      state = migrate(parsed);
      persist();
    },
    reset() { state = defaultState(); persist(); },
  };

  function uid() {
    // không dùng Date.now trong scratchpad? đây là runtime trình duyệt nên OK
    return "id-" + Math.random().toString(36).slice(2, 9) + "-" + (performance.now() | 0).toString(36);
  }

  global.Store = Store;
})(window);
