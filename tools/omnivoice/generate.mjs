/* ============================================================
   generate.mjs — Render audio bằng OmniVoice (k2-fsa) qua HF Space
   ------------------------------------------------------------
   OmniVoice (https://github.com/k2-fsa/OmniVoice) là TTS chạy Python/
   server, KHÔNG có bản trình duyệt. Cách dùng cho web tĩnh: render sẵn
   audio một lần rồi đóng gói file vào app (assets/audio/).

   Script này gọi HF Space demo (Gradio REST, endpoint _design_fn),
   giọng thiết kế: Nữ / Thanh niên / Anh-Mỹ, rồi lưu WAV + manifest.json.
   Có thể chạy lại (bỏ qua file đã có). Node 18+ (dùng fetch có sẵn).

   Dùng:  node tools/omnivoice/generate.mjs [words|sentences|all]
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(ROOT, "assets", "audio");
const SPACE = "https://k2-fsa-omnivoice.hf.space";
const DUMP = process.argv[2] === "dump";
const SET = ((DUMP ? process.argv[3] : process.argv[2]) || "words").toLowerCase();

// Giọng cố định cho cả gói (một "người đọc" nhất quán)
const VOICE = {
  gender: "Female / 女",
  age: "Young Adult / 青年",
  pitch: "Moderate Pitch / 中音调",
  style: "Auto",
  accent: "American Accent / 美式口音",
};

// ---- FNV-1a 32-bit (phải KHỚP với hàm trong ui.js) ----
function fnv1a(str) {
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(String(str).trim());
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return ("00000000" + h.toString(16)).slice(-8);
}

// ---- Nạp dữ liệu app để lấy danh sách văn bản cần đọc ----
function loadTexts() {
  const g = { window: {} };
  globalThis.window = g.window;
  const load = (p) => { const code = fs.readFileSync(path.join(ROOT, p), "utf8"); (0, eval)(code); };
  load("assets/js/data.js");
  load("assets/js/seed.js");
  load("assets/js/lessons.js");
  const SEED = g.window.SEED, APP = g.window.APP_DATA;
  const items = [];
  const add = (text, type) => { const t = String(text || "").trim(); if (t) items.push({ key: fnv1a(t), text: t, type }); };

  if (SET === "words" || SET === "all") {
    SEED.VOCAB.forEach((v) => add(v.t, "word"));
  }
  if (SET === "sentences" || SET === "all") {
    SEED.VOCAB.forEach((v) => add(v.e, "example"));
    Object.values(SEED.QUESTIONS).forEach((arr) => arr.forEach((q) => add(q.q, "question")));
    (SEED.PHRASES || []).forEach((g2) => g2.items.forEach((it) => add(it.en, "phrase")));
    (APP.RESCUE_PHRASES || []).forEach((p) => add(p.en, "rescue"));
  }
  // khử trùng lặp theo key
  const seen = new Set(), out = [];
  for (const it of items) { if (!seen.has(it.key)) { seen.add(it.key); out.push(it); } }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function synth(text) {
  const data = [text, "Auto", 32, 2, true, 1, null, true, true,
    VOICE.gender, VOICE.age, VOICE.pitch, VOICE.style, VOICE.accent, "Auto"];
  // 1) enqueue
  const post = await fetch(`${SPACE}/gradio_api/call/_design_fn`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const { event_id } = await post.json();
  if (!event_id) throw new Error("no event_id");
  // 2) lấy kết quả (SSE tự đóng khi xong)
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 180000);
  const res = await fetch(`${SPACE}/gradio_api/call/_design_fn/${event_id}`, { signal: ac.signal });
  const txt = await res.text();
  clearTimeout(to);
  const m = txt.match(/https?:\/\/[^"']*?\.wav/);
  if (!m) throw new Error("no audio url (status: " + (txt.match(/"([^"]*)"\]/)?.[1] || "?") + ")");
  const wav = await fetch(m[0]);
  const buf = Buffer.from(await wav.arrayBuffer());
  if (buf.length < 100) throw new Error("empty wav");
  return buf;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Chế độ dump: chỉ xuất danh sách {key,text} để render.py (Colab/local) dùng
  if (DUMP) {
    const list = loadTexts();
    const p = path.join(__dirname, "texts.json");
    fs.writeFileSync(p, JSON.stringify(list, null, 0));
    console.log("Đã ghi " + list.length + " mục vào " + p);
    return;
  }
  let texts = loadTexts();
  if (process.env.LIMIT) texts = texts.slice(0, parseInt(process.env.LIMIT, 10));
  console.log(`Set="${SET}" · ${texts.length} mục cần render → ${OUT_DIR}`);
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  let done = 0, made = 0, skip = 0, fail = 0;
  const keys = new Set();
  // nạp manifest cũ để cộng dồn
  if (fs.existsSync(manifestPath)) { try { (JSON.parse(fs.readFileSync(manifestPath, "utf8")).keys || []).forEach((k) => keys.add(k)); } catch {} }

  for (const it of texts) {
    done++;
    const file = path.join(OUT_DIR, it.key + ".wav");
    if (fs.existsSync(file) && fs.statSync(file).size > 100) { keys.add(it.key); skip++; continue; }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const buf = await synth(it.text);
        fs.writeFileSync(file, buf);
        keys.add(it.key); made++; ok = true;
        console.log(`[${done}/${texts.length}] ✓ ${it.text.slice(0, 40)}  (${(buf.length / 1024) | 0}KB)`);
      } catch (e) {
        if (attempt === 3) { fail++; console.log(`[${done}/${texts.length}] ✗ ${it.text.slice(0, 40)} — ${e.message}`); }
        else await sleep(1500 * attempt);
      }
    }
    // ghi manifest định kỳ để an toàn
    if (made % 10 === 0) fs.writeFileSync(manifestPath, JSON.stringify({ engine: "omnivoice", voice: VOICE, format: "wav", keys: [...keys] }));
    await sleep(300); // lịch sự với Space cộng đồng
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ engine: "omnivoice", voice: VOICE, format: "wav", keys: [...keys] }, null, 0));
  console.log(`\nXong: tạo mới ${made}, bỏ qua ${skip}, lỗi ${fail}. Tổng trong manifest: ${keys.size}.`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
