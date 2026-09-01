/* ============================================================
   store.js — Trạng thái người dùng (localStorage) · schema v3
   ------------------------------------------------------------
   Mô hình dữ liệu:
   • settings   — cài đặt (ngày bắt đầu, giọng đọc, API key AI…)
   • cards[]    — thẻ từ vựng, mỗi thẻ 2 chiều FSRS:
                  ev (Anh→Việt, nhận biết) · ve (Việt→Anh, truy hồi)
   • sessions{} — nhật ký ngày học (phút, hoạt động) → streak
   • stats{}    — số liệu theo ngày (ôn đúng/sai, điểm phát âm…)
   • pron       — thống kê theo âm + lịch sử điểm
   • shadow     — tiến độ shadowing
   • sims[]     — lịch sử mô phỏng bảo vệ (điểm 5 tiêu chí)
   • monthTests — kết quả bài kiểm tra đầu ra từng tháng
   Di trú tự động từ schema cũ (english-defense::v1).
   ============================================================ */
(function (global) {
  "use strict";

  const KEY = "english-defense::v3";
  const OLD_KEY = "english-defense::v1";
  const SCHEMA = 3;

  /* ---------- Date helpers ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return isoDate(new Date()); }
  function parseISO(s) { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); }
  function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }

  function defaultState() {
    return {
      schema: SCHEMA,
      settings: {
        startDate: null,
        theme: "light",
        name: "",
        topic: "",           // tên đề tài
        topicSummary: "",    // tóm tắt luận văn (cho AI sinh câu hỏi)
        speechRate: 0.85,
        voiceURI: "",
        humanAudio: false,   // bản thu người thật (Dictionary API) cho từ đơn
        omniPack: true,      // gói giọng OmniVoice render sẵn
        apiKey: "",          // Anthropic API key (chỉ lưu cục bộ)
        aiModel: "claude-sonnet-4-6",
        newPerDayOverride: 0, // 0 = theo lộ trình tháng
        dailyGoalMin: 50,
      },
      cards: [],       // xem newCardObj()
      sessions: {},    // sessions[date] = {minutes, studied, acts:{vocab,pron,shadow,coach,defense}}
      stats: {},       // stats[date] = {rev, ok, newC, pronSum, pronN}
      pron: { phon: {}, history: [] },  // phon[ipa]={ok,n} · history=[{date,score,text}]
      shadow: { done: {}, custom: [] }, // done[itemKey]={n,last} · custom=[{id,title,y|url,transcript}]
      sims: [],        // [{id,date,mode,scores:{content,fluency,pron,vocab,strategy},avg,note,n}]
      monthTests: {},  // monthTests[m] = {done, date, score}
      coachLog: [],    // [{id,date,mode,turns}] — tóm tắt phiên nói với AI
      seededVersion: 0,
    };
  }

  function newCardObj(src) {
    // src: {term,pos,meaning,ipa,icon,example,exampleVi,level,group,groupName}
    return Object.assign({
      id: uid(), term: "", pos: "", meaning: "", ipa: "", icon: "",
      example: "", exampleVi: "", collocations: "", level: 2, group: "", groupName: "",
      custom: false, suspended: false, created: today(),
      ev: FSRS.newCard(today()), ve: FSRS.newCard(today()),
      intro: null, // ISO ngày thẻ được đưa vào học (null = còn trong hàng đợi)
    }, src || {});
  }

  /* ---------- load & migrate ---------- */
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
      const old = localStorage.getItem(OLD_KEY);
      if (old) return migrateV1(JSON.parse(old));
      return defaultState();
    } catch (e) {
      console.warn("Store load failed, resetting:", e);
      return defaultState();
    }
  }

  function migrate(s) {
    const base = defaultState();
    const m = Object.assign({}, base, s);
    m.settings = Object.assign({}, base.settings, s.settings || {});
    m.pron = Object.assign({}, base.pron, s.pron || {});
    m.shadow = Object.assign({}, base.shadow, s.shadow || {});
    // v3.1: state chỉ giữ thẻ ĐÃ HỌC hoặc tự thêm — thẻ chưa học phục vụ
    // thẳng từ SEED/SEED2 (giảm ~90% dung lượng ghi localStorage mỗi lần ôn)
    m.cards = (s.cards || []).filter((c) => c.intro || c.custom);
    m.schema = SCHEMA;
    return m;
  }

  // Di trú từ app cũ (v1/v2): giữ settings, sessions (streak + phút học),
  // chuyển vocab → cards (backfill IPA/icon/dịch từ SEED), và cất mọi dữ
  // liệu tự soạn (câu hỏi, nhật ký, câu cứu nguy, xp) vào state.legacy để
  // KHÔNG mất gì cả.
  function migrateV1(old) {
    const s = defaultState();
    const os = old.settings || {};
    ["startDate", "theme", "topic", "name", "speechRate", "voiceURI", "humanAudio", "omniPack"]
      .forEach((k) => { if (os[k] !== undefined) s.settings[k] = os[k]; });
    // schema 1 chưa có lần ép humanAudio=false (từ đơn dùng TTS) → ép lại
    if ((old.schema || 1) < 2) s.settings.humanAudio = false;
    s.sessions = {};
    Object.keys(old.sessions || {}).forEach((d) => {
      const o = old.sessions[d];
      const nBlocks = o.blocks ? Object.values(o.blocks).filter(Boolean).length : 0;
      s.sessions[d] = {
        // app cũ suy phút từ block hoàn thành (~13'/block) khi không nhập tay
        minutes: o.minutes || nBlocks * 13,
        studied: !!(o.studied || o.daily60 || nBlocks > 0),
        acts: {},
      };
    });
    // vocab cũ: hộp Leitner box(1..5) → stability ước lượng; tra ngược SEED
    // để bổ sung IPA/icon/dịch cho từ lưu trước bản f18b792
    const boxS = { 1: 0.5, 2: 1.5, 3: 4, 4: 10, 5: 21 };
    const seedByTerm = new Map();
    if (typeof SEED !== "undefined" && SEED.VOCAB)
      SEED.VOCAB.forEach((it) => seedByTerm.set(String(it.t).toLowerCase(), it));
    (old.vocab || []).forEach((v) => {
      const sd = seedByTerm.get(String(v.term).toLowerCase()) || {};
      const c = newCardObj({
        term: v.term, pos: v.pos || sd.p || "", meaning: v.meaning || sd.m || "",
        ipa: v.ipa || sd.ipa || "", icon: v.icon || sd.ic || "",
        example: v.example || sd.e || "", exampleVi: v.exampleVi || sd.ev || "",
        level: v.level || sd.lvl || 2, group: v.group || sd.grp || "",
        groupName: v.groupName || sd.grpName || "",
        custom: !v.seeded,
      });
      // chỉ giữ thẻ đã học/tự thêm — thẻ seed chưa học lấy từ SEED khi cần
      if (!v.learnedDate && v.seeded) return;
      c.intro = v.learnedDate || v.created || today();
      const st = boxS[v.box || 1];
      c.ev = FSRS.fromLegacy(st, v.lastReview, v.box || 1, today());
      c.ve = FSRS.fromLegacy(st, v.lastReview, v.box || 1, today());
      s.cards.push(c);
    });
    // dữ liệu tự soạn của app cũ — giữ nguyên vẹn (kèm theo export/import)
    s.legacy = {
      questions: old.questions || {}, journal: old.journal || [],
      rescueCustom: old.rescueCustom || [], rescueMastered: old.rescueMastered || {},
      recordings: old.recordings || [], xp: old.xp || 0,
    };
    return s;
  }

  /* ---------- Kho từ gốc (SEED + SEED2, ~2.000 mục) ----------
     KHÔNG nạp vào state — thẻ chưa học phục vụ thẳng từ đây; chỉ khi
     người học "kích hoạt" thẻ mới được ghi vào state (nhẹ localStorage). */
  let seedCache = null;
  function seedEntries() {
    if (seedCache) return seedCache;
    const out = [];
    [typeof SEED !== "undefined" && SEED.VOCAB, typeof SEED2 !== "undefined" && SEED2.VOCAB]
      .forEach((arr) => { if (arr) arr.forEach((it) => out.push(it)); });
    seedCache = out;
    return out;
  }
  function pseudoCard(it) {
    return { id: "seed:" + it.t, term: it.t, pos: it.p || "", meaning: it.m || "",
             ipa: it.ipa || "", icon: it.ic || "", example: it.e || "", exampleVi: it.ev || "",
             level: it.lvl || 2, group: it.grp || "", groupName: it.grpName || "", seedOnly: true };
  }

  const listeners = new Set();
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error("Persist failed:", e); }
    listeners.forEach((fn) => fn(state));
  }

  function uid() {
    return "id-" + Math.random().toString(36).slice(2, 9) + "-" + Date.now().toString(36);
  }

  /* ---------- daily stat helper ---------- */
  function stat(date) {
    date = date || today();
    let st = state.stats[date];
    if (!st) { st = { rev: 0, ok: 0, pronSum: 0, pronN: 0 }; state.stats[date] = st; }
    return st;
  }
  function session(date) {
    date = date || today();
    let s = state.sessions[date];
    if (!s) { s = { minutes: 0, studied: false, acts: {} }; state.sessions[date] = s; }
    s.acts = s.acts || {};
    return s;
  }

  /* ============================ API ============================ */
  const Store = {
    get: () => state,
    settings: () => state.settings,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    setSetting(k, v) { state.settings[k] = v; persist(); },
    ensureStartDate() {
      if (!state.settings.startDate) { state.settings.startDate = today(); persist(); }
      return state.settings.startDate;
    },

    /* ----- dates ----- */
    today, isoDate, parseISO, daysBetween,
    dayNumber() {
      if (!state.settings.startDate) return null;
      return daysBetween(state.settings.startDate, today()) + 1;
    },
    currentMonth() { return ROADMAP.monthOf(this.dayNumber()); },

    /* ----- sessions & streak ----- */
    logActivity(act, minutes) {
      const s = session();
      s.studied = true;
      s.acts[act] = (s.acts[act] || 0) + 1;
      if (minutes) s.minutes = (s.minutes || 0) + minutes;
      persist();
    },
    dayCounts(date) {
      const s = state.sessions[date];
      return !!(s && (s.studied || s.minutes > 0));
    },
    streak() {
      let count = 0;
      const d = new Date();
      if (!this.dayCounts(isoDate(d))) d.setDate(d.getDate() - 1);
      while (this.dayCounts(isoDate(d))) { count++; d.setDate(d.getDate() - 1); }
      return count;
    },
    totalMinutes() {
      return Object.keys(state.sessions).reduce((sum, d) => sum + (state.sessions[d].minutes || 0), 0);
    },
    totalStudyDays() {
      return Object.keys(state.sessions).filter((d) => this.dayCounts(d)).length;
    },
    todayActs() { return session().acts; },

    /* ----- CARDS / FSRS ----- */
    cards: () => state.cards,
    cardById(id) { return state.cards.find((c) => c.id === id); },
    addCard(src) { const c = newCardObj(src); c.custom = true; c.intro = today(); state.cards.unshift(c); persist(); return c; },
    updateCard(id, patch) { const c = this.cardById(id); if (c) { Object.assign(c, patch); persist(); } },
    deleteCard(id) { state.cards = state.cards.filter((c) => c.id !== id); persist(); },

    // Hàng đợi từ mới: lấy từ kho SEED/SEED2 những mục CHƯA có trong state,
    // lọc theo cấp cho phép của tháng. limit=0 = hết hạn mức → rỗng.
    newQueue(limit) {
      if (limit === 0) return [];
      const m = ROADMAP.month(this.currentMonth());
      const allowed = new Set(m.vocabLevels);
      const have = new Set(state.cards.map((c) => c.term.toLowerCase()));
      const q = seedEntries()
        .filter((it) => allowed.has(it.lvl || 2) && !have.has(String(it.t).toLowerCase()))
        .map(pseudoCard)
        .sort((a, b) => (a.level - b.level));
      return limit == null ? q : q.slice(0, Math.max(0, limit));
    },
    // Toàn bộ kho từ để duyệt/tìm kiếm: thẻ đang học + thẻ chưa học từ seed
    browseList() {
      const have = new Set(state.cards.map((c) => c.term.toLowerCase()));
      const rest = seedEntries()
        .filter((it) => !have.has(String(it.t).toLowerCase()))
        .map(pseudoCard);
      return state.cards.concat(rest);
    },
    newPerDay() {
      const o = state.settings.newPerDayOverride | 0;
      return o > 0 ? o : ROADMAP.month(this.currentMonth()).newPerDay;
    },
    newIntroducedToday() {
      const t = today();
      return state.cards.filter((c) => c.intro === t).length;
    },
    // Kích hoạt thẻ mới. Nhận thẻ giả từ newQueue (seedOnly) → tạo thẻ thật
    // trong state; hoặc nhận id thẻ đã tồn tại.
    introduceCard(pc) {
      if (pc && pc.seedOnly) {
        if (state.cards.some((c) => c.term.toLowerCase() === pc.term.toLowerCase())) return;
        const c = newCardObj({
          term: pc.term, pos: pc.pos, meaning: pc.meaning, ipa: pc.ipa, icon: pc.icon,
          example: pc.example, exampleVi: pc.exampleVi,
          level: pc.level, group: pc.group, groupName: pc.groupName,
        });
        c.intro = today();
        state.cards.push(c);
        persist();
        return;
      }
      const c = this.cardById(pc && pc.id ? pc.id : pc);
      if (c && !c.intro) { c.intro = today(); persist(); }
    },

    // Thẻ đến hạn hôm nay: trả về [{card, dir}] — ưu tiên chiều Việt→Anh
    dueQueue() {
      const t = today();
      const out = [];
      state.cards.forEach((c) => {
        if (!c.intro || c.suspended) return;
        if (FSRS.isDue(c.ve, t)) out.push({ card: c, dir: "ve" });
        if (FSRS.isDue(c.ev, t)) out.push({ card: c, dir: "ev" });
      });
      // xáo theo id để interleave nhóm; trong từng cặp, chiều Việt→Anh (ve,
      // truy hồi — khó hơn) đứng TRƯỚC chiều Anh→Việt
      const key = (x) => x.card.id + (x.dir === "ve" ? "0" : "1");
      out.sort((a, b) => (key(a) > key(b) ? 1 : -1));
      return out;
    },
    dueCount() { return this.dueQueue().length; },

    reviewCard(id, dir, rating) {
      const c = this.cardById(id);
      if (!c) return null;
      c[dir] = FSRS.review(c[dir], rating, today(), daysBetween);
      const st = stat();
      st.rev++; if (rating >= 3) st.ok++;
      persist();
      return c[dir];
    },
    previewIntervals(id, dir) {
      const c = this.cardById(id);
      return c ? FSRS.previewIntervals(c[dir], today(), daysBetween) : null;
    },

    masteredCount() {
      return state.cards.filter((c) => c.intro && FSRS.isMastered(c.ve)).length;
    },
    learningCount() { return state.cards.filter((c) => !!c.intro).length; },
    // độ chính xác 7 ngày gần nhất (desirable difficulty: nhắm 70–80%)
    recentAccuracy() {
      let rev = 0, ok = 0;
      for (let i = 0; i < 7; i++) {
        const d = isoDate(new Date(Date.now() - i * 86400000));
        const st = state.stats[d];
        if (st) { rev += st.rev; ok += st.ok; }
      }
      return rev ? Math.round((ok / rev) * 100) : null;
    },

    /* ----- PRON ----- */
    logPron(score, text, phonHits) {
      const st = stat();
      st.pronSum += score; st.pronN++;
      state.pron.history.push({ date: today(), score: Math.round(score), text: String(text).slice(0, 60) });
      if (state.pron.history.length > 400) state.pron.history = state.pron.history.slice(-400);
      if (phonHits) {
        Object.keys(phonHits).forEach((ipa) => {
          const p = state.pron.phon[ipa] || (state.pron.phon[ipa] = { ok: 0, n: 0 });
          p.ok += phonHits[ipa].ok; p.n += phonHits[ipa].n;
        });
      }
      persist();
    },
    pronAvg(days) {
      days = days || 7;
      const cut = isoDate(new Date(Date.now() - days * 86400000));
      const h = state.pron.history.filter((x) => x.date >= cut);
      if (!h.length) return null;
      return Math.round(h.reduce((s, x) => s + x.score, 0) / h.length);
    },

    /* ----- SHADOW ----- */
    shadowDone(key) {
      const d = state.shadow.done[key] || (state.shadow.done[key] = { n: 0, last: null });
      d.n++; d.last = today(); persist();
    },
    shadowStat(key) { return state.shadow.done[key] || { n: 0, last: null }; },
    addShadowCustom(item) { item.id = uid(); state.shadow.custom.push(item); persist(); return item; },
    deleteShadowCustom(id) { state.shadow.custom = state.shadow.custom.filter((x) => x.id !== id); persist(); },

    /* ----- SIMS (mô phỏng bảo vệ) ----- */
    addSim(sim) {
      sim.id = uid(); sim.date = today();
      const sc = sim.scores || {};
      const vals = ["content", "fluency", "pron", "vocab", "strategy"].map((k) => sc[k] || 0).filter(Boolean);
      sim.avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
      state.sims.push(sim); persist(); return sim;
    },
    sims: () => state.sims,

    /* ----- coach log ----- */
    logCoach(mode, turns) {
      state.coachLog.push({ id: uid(), date: today(), mode, turns });
      if (state.coachLog.length > 200) state.coachLog = state.coachLog.slice(-200);
      persist();
    },

    /* ----- month tests ----- */
    setMonthTest(m, score) { state.monthTests[m] = { done: true, date: today(), score: score == null ? null : score }; persist(); },
    monthTest(m) { return state.monthTests[m] || null; },

    // % hoàn thành tháng hiện tại (ngày trong tháng + bài kiểm tra đầu ra)
    monthProgress() {
      const dn = this.dayNumber();
      if (dn == null) return 0;
      const m = this.currentMonth();
      const dayIn = Math.min(30, dn - Math.round((m - 1) * 30.4));
      let p = (dayIn / 30) * 85;
      if (this.monthTest(m)) p += 15;
      return Math.min(100, Math.round(p));
    },
    // cảnh báo chậm tiến độ: số ngày học / số ngày đã trôi qua < 60%
    behindSchedule() {
      const dn = this.dayNumber();
      if (dn == null || dn < 7) return false;
      return this.totalStudyDays() / dn < 0.6;
    },

    /* ----- backup ----- */
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      // Bản v3 có mảng "cards"; bản cũ (schema 1–2) có mảng "vocab".
      // File không có cả hai → từ chối, KHÔNG ghi đè dữ liệu hiện tại.
      if (parsed && Array.isArray(parsed.cards)) state = migrate(parsed);
      else if (parsed && Array.isArray(parsed.vocab)) state = migrateV1(parsed);
      else throw new Error("File không đúng định dạng sao lưu English Defense");
      persist();
    },
    reset() { state = seedFresh(defaultState()); persist(); },
  };

  global.Store = Store;
})(window);
