/* ============================================================
   merge_into_seed.mjs — Bổ sung 3 trường vào từng mục SEED.VOCAB:
     ipa : phiên âm quốc tế   (tools/vocab/ipa.json)
     ic  : emoji minh họa     (scratchpad/merged.json + dedup_out.json)
     ev  : dịch tiếng Việt câu ví dụ
   Sửa TRỰC TIẾP assets/js/seed.js theo từng dòng `{ t: "...", ... }`
   nên giữ nguyên định dạng & chú thích sẵn có.

   Chạy: node tools/vocab/merge_into_seed.mjs <scratchpadDir>
   ============================================================ */
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const ROOT = path.resolve(HERE, "..", "..");
const SEED_FILE = path.join(ROOT, "assets", "js", "seed.js");
const IPA_FILE = path.join(HERE, "ipa.json");
const SP = process.argv[2];
if (!SP) { console.error("Thiếu tham số: thư mục scratchpad"); process.exit(1); }

const ipa = JSON.parse(fs.readFileSync(IPA_FILE, "utf8"));
const merged = JSON.parse(fs.readFileSync(path.join(SP, "merged.json"), "utf8"));
const dedupPath = path.join(SP, "dedup_out.json");
const dedup = fs.existsSync(dedupPath) ? JSON.parse(fs.readFileSync(dedupPath, "utf8")) : [];

// Bản đồ dữ liệu theo mặt chữ
const icon = new Map(), exVi = new Map();
merged.forEach((x) => { icon.set(x.t, x.ic); exVi.set(x.t, x.ev); });
dedup.forEach((x) => icon.set(x.t, x.ic));   // bản gán lại đè lên bản đầu

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

let src = fs.readFileSync(SEED_FILE, "utf8");
let done = 0, skip = 0, noIpa = [];

// Mỗi từ vựng nằm trên MỘT dòng dạng: { t: "term", p: "...", m: "...", e: "..." },
src = src.replace(/^(\s*)\{\s*t:\s*"([^"]+)"([^\n]*?)\},?\s*$/gm, (line, indent, term, rest) => {
  if (!icon.has(term)) { skip++; return line; }
  if (/\bic:\s*"/.test(rest)) { skip++; return line; }          // đã bổ sung rồi
  const p = ipa[term] || ipa[term.toLowerCase()] || "";
  if (!p) noIpa.push(term);
  const add = (p ? `, ipa: "${esc(p)}"` : "") +
              `, ic: "${esc(icon.get(term))}"` +
              (exVi.get(term) ? `, ev: "${esc(exVi.get(term))}"` : "");
  done++;
  const comma = line.trimEnd().endsWith(",") ? "," : "";
  return `${indent}{ t: "${term}"${rest.replace(/\s*$/, "")}${add} }${comma}`;
});

fs.writeFileSync(SEED_FILE, src);
console.log(`Đã bổ sung cho ${done} từ (bỏ qua ${skip} dòng không phải từ vựng / đã có).`);
console.log(`Thiếu phiên âm: ${noIpa.length}${noIpa.length ? " → " + noIpa.slice(0, 20).join(", ") : ""}`);
