/* ============================================================
   rec.js — Ghi âm (MediaRecorder) + Nhận dạng giọng nói
   (Web Speech API) + chấm điểm khớp từ + IndexedDB lưu bản thu
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------------- Ghi âm ---------------- */
  // Rec.start() → Promise; Rec.stop() → Promise<{blob,url,secs}>
  const Rec = (function () {
    let mr = null, chunks = [], stream = null, t0 = 0;
    async function start() {
      if (mr) await stop(); // chờ recorder cũ đóng hẳn, tránh giết stream mới
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.start(250);
      t0 = Date.now();
    }
    function stop() {
      return new Promise((resolve) => {
        if (!mr) return resolve(null);
        const rec = mr, st = stream, myChunks = chunks;
        mr = null; stream = null; // tách khỏi biến chung TRƯỚC khi chờ onstop
        rec.onstop = () => {
          const blob = new Blob(myChunks, { type: rec.mimeType || "audio/webm" });
          const secs = Math.round((Date.now() - t0) / 1000);
          if (st) st.getTracks().forEach((t) => t.stop());
          resolve({ blob, url: URL.createObjectURL(blob), secs });
        };
        try { rec.stop(); } catch (e) { if (st) st.getTracks().forEach((t) => t.stop()); resolve(null); }
      });
    }
    function isRecording() { return !!mr; }
    function supported() { return !!(navigator.mediaDevices && global.MediaRecorder); }
    return { start, stop, isRecording, supported };
  })();

  /* ---------------- Nhận dạng giọng nói (STT) ---------------- */
  // STT.listen({onPartial, onEnd(err, text), continuous}) → {stop}
  // onEnd LUÔN được gọi đúng một lần (kể cả khi lỗi micro).
  const STT = (function () {
    const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
    function supported() { return !!SR; }
    function listen(opts) {
      opts = opts || {};
      if (!SR) {
        // LUÔN gọi onEnd bất đồng bộ — để listen() trả về handle trước,
        // tránh race "listener = listen(...)" ghi đè sau khi onEnd đã chạy
        if (opts.onEnd) setTimeout(() => opts.onEnd("unsupported", ""), 0);
        return { stop: () => {} };
      }
      const r = new SR();
      r.lang = "en-US";
      r.continuous = !!opts.continuous;
      r.interimResults = true;
      r.maxAlternatives = 1;
      let finalText = "", finished = false;
      // Mọi lối ra (lỗi, kết thúc, start hỏng) đều qua đây — gọi ĐÚNG 1 lần,
      // và luôn BẤT ĐỒNG BỘ để caller kịp giữ handle trả về từ listen()
      function finish(err) {
        if (finished) return;
        finished = true;
        if (opts.onEnd) setTimeout(() => opts.onEnd(err || null, finalText.trim()), 0);
      }
      r.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t + " ";
          else interim += t;
        }
        if (opts.onPartial && !finished) opts.onPartial((finalText + interim).trim());
      };
      r.onerror = (e) => finish(e.error || "error");
      r.onend = () => finish(null);
      try { r.start(); } catch (e) { finish("start-failed"); }
      return { stop: () => { try { r.stop(); } catch (e) { finish(null); } } };
    }
    return { supported, listen };
  })();

  /* ---------------- Chấm điểm khớp từ ---------------- */
  const NUMWORDS = { 0:"zero",1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten" };
  function normWords(s) {
    return String(s).toLowerCase()
      .replace(/\d+/g, (d) => NUMWORDS[+d] || d)
      .replace(/[^a-z'\s]/g, " ")
      .split(/\s+/).filter(Boolean);
  }
  // So khớp LCS giữa từ đích và từ nhận dạng.
  // Trả về {score(0..100), marks:[{w, ok}], heard}
  function scoreAgainst(targetText, heardText) {
    const T = normWords(targetText), H = normWords(heardText || "");
    const rawTarget = String(targetText).trim().split(/\s+/);
    if (!T.length) return { score: 0, marks: [], heard: heardText || "" };
    // LCS DP
    const n = T.length, m = H.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = T[i] === H[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    // truy vết: đánh dấu từ đích có khớp không
    const okIdx = new Set();
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (T[i] === H[j]) { okIdx.add(i); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    // marks bám theo từ HIỂN THỊ (rawTarget); map theo chỉ số từ chuẩn hóa
    const marks = [];
    let k = 0;
    rawTarget.forEach((w) => {
      const norm = normWords(w);
      if (!norm.length) { marks.push({ w, ok: true }); return; }
      let ok = true;
      norm.forEach(() => { if (!okIdx.has(k)) ok = false; k++; });
      marks.push({ w, ok });
    });
    const score = Math.round((okIdx.size / n) * 100);
    return { score, marks, heard: heardText || "" };
  }

  // Đếm âm (IPA) đúng/sai từ kết quả chấm — để theo dõi tiến bộ theo âm.
  // ipaOf(word) → chuỗi IPA hoặc "".
  const TRACKED = ["θ","ð","z","s","ʃ","ʒ","tʃ","dʒ","v","l","iː","ɪ","uː","ʊ","æ","ə","ɜː","əʊ"];
  let ipaMap = null;
  function ipaOf(word) {
    if (!ipaMap && typeof SEED !== "undefined" && SEED.VOCAB) {
      ipaMap = new Map();
      SEED.VOCAB.forEach((v) => { if (v.ipa) ipaMap.set(String(v.t).toLowerCase(), v.ipa); });
    }
    return (ipaMap && ipaMap.get(String(word).toLowerCase())) || "";
  }
  function phonemeHits(marks) {
    const hits = {};
    marks.forEach((m) => {
      const ipa = ipaOf(m.w.replace(/[^a-zA-Z'-]/g, ""));
      if (!ipa) return;
      TRACKED.forEach((p) => {
        if (ipa.indexOf(p) >= 0) {
          const h = hits[p] || (hits[p] = { ok: 0, n: 0 });
          h.n++; if (m.ok) h.ok++;
        }
      });
    });
    return hits;
  }

  /* ---------------- IndexedDB: lưu bản thu tiến bộ ---------------- */
  const DB_NAME = "english-defense-audio", STORE = "recordings";
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  const Vault = {
    async save(rec) { // {id,date,kind,note,secs,blob}
      const db = await openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(rec);
        tx.oncomplete = () => res(rec);
        tx.onerror = () => rej(tx.error);
      });
    },
    async list() {
      const db = await openDB();
      return new Promise((res, rej) => {
        const out = [];
        const tx = db.transaction(STORE, "readonly");
        const cur = tx.objectStore(STORE).openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c) { const { blob, ...meta } = c.value; out.push(meta); c.continue(); }
          else res(out.sort((a, b) => (a.date < b.date ? 1 : -1)));
        };
        cur.onerror = () => rej(cur.error);
      });
    },
    async get(id) {
      const db = await openDB();
      return new Promise((res, rej) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => rej(req.error);
      });
    },
    async remove(id) {
      const db = await openDB();
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    },
  };

  global.REC = { Rec, STT, scoreAgainst, phonemeHits, normWords, Vault, TRACKED };
})(window);
