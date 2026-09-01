// Smoke test v3 — shim DOM tối thiểu, chạy: node tools/test/smoke.js
var mkEl = function(tag){
  const _c=[]; const _cls=new Set();
  return {tagName:tag, style:{}, dataset:{}, _children:_c,
    get children(){return _c},
    classList:{_s:_cls,
      add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
      toggle(c,f){ const on = (f===undefined) ? !this._s.has(c) : !!f; on?this._s.add(c):this._s.delete(c); return on; },
      replace(a,b){ if(this._s.has(a)){this._s.delete(a); this._s.add(b);} },
      contains(c){return this._s.has(c)}},
    setAttribute(){}, addEventListener(){}, appendChild(n){_c.push(n);return n},
    append(){}, remove(){}, querySelector(){return null}, querySelectorAll(){return []},
    set textContent(v){this._t=v}, get textContent(){return this._t||''},
    set innerHTML(v){this._h=v; _c.length=0}, get innerHTML(){return this._h||''}};
}
class FakeNode {}
global.Node = FakeNode;
const _mk = mkEl;
mkEl = function(tag){ const o=_mk(tag); Object.setPrototypeOf(o, FakeNode.prototype); return o; };

global.document={createElement:(t)=>mkEl(t), createElementNS:(ns,t)=>mkEl(t),
  createTextNode:(t)=>{const n=mkEl('#text'); n.textContent=String(t); return n;}, createDocumentFragment:()=>mkEl('frag'),
  getElementById:()=>mkEl('div'), querySelector:()=>mkEl('div'), querySelectorAll:()=>[],
  body:mkEl('body'), documentElement:mkEl('html'), addEventListener(){}};
global.window=global; global.addEventListener=()=>{}; global.removeEventListener=()=>{};
global.location={hash:'#/dashboard',protocol:'http:'};
global.navigator={userAgent:'node',language:'vi'};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
global.setInterval=()=>0; global.clearInterval=()=>{}; global.setTimeout=(f)=>0;
global.speechSynthesis=null; global.fetch=undefined; global.TextEncoder=require('util').TextEncoder;
global.performance={now:()=>0};
global.requestAnimationFrame=(f)=>0;
global.cancelAnimationFrame=()=>{};
global.URL={createObjectURL:()=>'blob:x', revokeObjectURL:()=>{}};

function assert(cond,msg){ console.log((cond?'✓ ':'✗ LỖI: ')+msg); if(!cond) process.exitCode=1; }

require('../../assets/js/fsrs.js');
require('../../assets/js/seed.js');
require('../../assets/js/roadmap.js');
require('../../assets/js/content.js');
require('../../assets/js/store.js');
require('../../assets/js/ui.js');
require('../../assets/js/rec.js');
require('../../assets/js/ai.js');
require('../../assets/js/views-core.js');
require('../../assets/js/views-vocab.js');
require('../../assets/js/views-pron.js');
require('../../assets/js/views-shadow.js');
require('../../assets/js/views-ai.js');
require('../../assets/js/views-defense.js');

/* ===== FSRS ===== */
const t = Store.today();
let c = FSRS.newCard(t);
assert(FSRS.isDue(c, t), 'FSRS: thẻ mới đến hạn ngay');
const good = FSRS.review(c, 3, t, Store.daysBetween);
assert(good.state === 'review' && good.due > t, 'FSRS: đánh giá Nhớ → hẹn ngày sau (' + good.due + ')');
const again = FSRS.review(c, 1, t, Store.daysBetween);
assert(again.due === t, 'FSRS: Quên → ôn lại hôm nay');
let long = FSRS.review(c, 3, t, Store.daysBetween);
for (let i = 0; i < 5; i++) long = FSRS.review(long, 3, long.due, Store.daysBetween);
assert(long.s > good.s, 'FSRS: ôn đúng nhiều lần → stability tăng (' + long.s.toFixed(1) + ' ngày)');
const prev = FSRS.previewIntervals(FSRS.newCard(t), t, Store.daysBetween);
assert(prev[4] >= prev[3] && prev[3] >= prev[2], 'FSRS: khoảng cách Dễ ≥ Nhớ ≥ Khó (' + [prev[1],prev[2],prev[3],prev[4]].join('/') + ')');

/* ===== Store ===== */
assert(Store.cards().length >= 270, 'Store: nạp sẵn ' + Store.cards().length + ' thẻ từ SEED');
assert(Store.dueCount() === 0, 'Store: chưa intro thẻ nào → 0 thẻ đến hạn');
const nq = Store.newQueue(5);
assert(nq.length === 5 && nq.every(x => x.level === 1), 'Store: hàng đợi từ mới tháng 1 chỉ cấp 1');
assert(Store.newQueue(0).length === 0, 'Store: hết hạn mức (limit=0) → hàng đợi rỗng');
Store.introduceCard(nq[0].id);
assert(Store.dueCount() === 2, 'Store: intro 1 thẻ → 2 lượt đến hạn (2 chiều)');
const q0 = Store.dueQueue()[0];
assert(q0.dir === 've', 'Store: chiều Việt→Anh (truy hồi) được ôn TRƯỚC');
Store.reviewCard(q0.card.id, q0.dir, 3);
assert(Store.dueCount() === 1, 'Store: ôn 1 chiều → còn 1 lượt');
Store.logActivity('vocab', 5);
assert(Store.streak() >= 1, 'Store: streak ≥ 1 sau khi học');
assert(Store.currentMonth() >= 1 && ROADMAP.MONTHS.length === 12, 'Roadmap: 12 tháng, tháng hiện tại = ' + Store.currentMonth());

// export/import giữ nguyên dữ liệu
const json = Store.exportJSON();
Store.importJSON(json);
assert(Store.cards().length >= 270 && Store.dueCount() === 1, 'Store: xuất/nhập JSON giữ nguyên trạng thái');

// file hỏng → từ chối, không ghi đè
let threw = false;
try { Store.importJSON('{"foo": 1}'); } catch (e) { threw = true; }
assert(threw && Store.cards().length >= 270, 'Store: file sao lưu sai định dạng bị TỪ CHỐI, dữ liệu còn nguyên');

// di trú bản v1: giữ dữ liệu tự soạn, backfill IPA từ SEED, suy phút từ block
const v1 = {
  schema: 1,
  settings: { startDate: '2026-01-01', humanAudio: true },
  sessions: { '2026-01-02': { blocks: { listen: true, vocab: true }, minutes: 0 } },
  vocab: [
    { term: 'analyze', box: 3, learnedDate: '2026-01-02', seeded: true, lastReview: '2026-08-01' },
    { term: 'myword', meaning: 'nghĩa riêng', box: 1, seeded: false, created: '2026-02-01' },
  ],
  questions: { method: [{ en: 'Why this method?', answer: 'my answer', mastery: 2 }] },
  journal: [{ id: 'j1', title: 'ngày 1' }],
};
Store.importJSON(JSON.stringify(v1));
assert(Store.get().legacy && Store.get().legacy.journal.length === 1 && Store.get().legacy.questions.method.length === 1,
  'Di trú v1: nhật ký + câu trả lời tự soạn được giữ trong legacy');
const az = Store.cards().find(c => c.term === 'analyze');
assert(az && az.ipa && az.meaning && az.intro, 'Di trú v1: từ cũ thiếu IPA/nghĩa được tra ngược từ SEED (' + az.ipa + ')');
assert(Store.cards().some(c => c.term === 'myword' && c.custom), 'Di trú v1: từ tự thêm được giữ');
assert(Store.get().sessions['2026-01-02'].minutes === 26, 'Di trú v1: phút học suy từ 2 block cũ = 26');
assert(Store.settings().humanAudio === false, 'Di trú v1: schema 1 → ép humanAudio=false (từ đơn dùng TTS)');

/* ===== chấm điểm khớp từ ===== */
const r1 = REC.scoreAgainst('The data show a clear upward trend', 'the data show a clear upward trend');
assert(r1.score === 100, 'Chấm: khớp hoàn toàn = 100%');
const r2 = REC.scoreAgainst('The data show a clear upward trend', 'the data a trend');
assert(r2.score > 30 && r2.score < 80 && r2.marks.some(m => !m.ok), 'Chấm: khớp một phần = ' + r2.score + '%, có từ đỏ');
const r3 = REC.scoreAgainst('costs increased in 2020', 'costs increased in twenty twenty');
assert(r3.marks[0].ok, 'Chấm: chuẩn hóa chữ thường/dấu câu hoạt động');

/* ===== nội dung ===== */
// câu shadowing & câu cứu nguy phải có audio trong gói OmniVoice
{
  const packTexts = new Set(JSON.parse(require('fs').readFileSync(__dirname+'/../../tools/omnivoice/texts.json','utf8')).map(t=>t.text));
  let total=0, hit=0;
  for (let s=1; s<=4; s++) {
    const arr = CONTENT.shadowSentences(s);
    assert(arr.length >= 4, 'Shadow GĐ' + s + ': ' + arr.length + ' câu');
    arr.forEach(x => { total++; if (packTexts.has(x.en)) hit++; });
  }
  CONTENT.rescueGroups().forEach(g => g.items.forEach(x => { total++; if (packTexts.has(x.en)) hit++; }));
  assert(hit === total, 'OmniVoice: ' + hit + '/' + total + ' câu shadowing/cứu nguy có audio render sẵn');
}
assert(CONTENT.MINIMAL_PAIRS.length >= 12, 'Content: ' + CONTENT.MINIMAL_PAIRS.length + ' bộ minimal pairs');
const nPhon = CONTENT.PHONEMES.reduce((s,g)=>s+g.items.length,0);
assert(nPhon === 44, 'Content: đủ 44 âm (' + nPhon + ')');
assert(CONTENT.DEFENSE_TYPES.length === 8, 'Content: 8 dạng câu hỏi phản biện');
let bankN = 0;
CONTENT.DEFENSE_TYPES.forEach(tp => tp.axes.forEach(ax => bankN += (SEED.QUESTIONS[ax]||[]).length));
assert(bankN >= 100, 'Content: ngân hàng ' + bankN + ' câu hỏi từ SEED');

/* ===== render các trang ===== */
['dashboard','roadmap','vocab','pron','shadow','coach','defense','settings'].forEach(name=>{
  try{ Views[name](); console.log('✓ render ' + name); }
  catch(e){ console.log('✗ LỖI render ' + name + ': ' + e.message); process.exitCode=1; }
});

/* ===== index.html & sw.js ===== */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../../index.html','utf8');
['fsrs.js','roadmap.js','content.js','rec.js','ai.js','views-core.js','views-vocab.js','views-pron.js','views-shadow.js','views-ai.js','views-defense.js']
  .forEach(f => assert(html.includes(f), 'index.html nạp ' + f));
assert(!html.includes('views.js"') && !html.includes('data.js') && !html.includes('lessons.js'), 'index.html không còn file cũ');
const sw=fs.readFileSync(__dirname+'/../../sw.js','utf8');
assert(sw.includes('views-defense.js') && sw.includes('fsrs.js'), 'sw.js cache các file mới');
// version cache-bust phải đồng bộ giữa sw.js và index.html
const swVer = (sw.match(/VERSION = "([^"]+)"/) || [])[1];
const htmlVers = [...new Set([...html.matchAll(/\?v=([\w.]+)/g)].map(m => m[1]))];
assert(swVer && htmlVers.length === 1 && htmlVers[0] === swVer,
  'Version đồng bộ: sw.js VERSION=' + swVer + ' ↔ index.html ?v=' + htmlVers.join(','));
// start_url trong manifest phải trỏ tới route có thật
const mani = fs.readFileSync(__dirname+'/../../manifest.webmanifest','utf8');
const startRoute = (JSON.parse(mani).start_url.match(/#\/(\w+)/) || [])[1];
const appjs = fs.readFileSync(__dirname+'/../../assets/js/app.js','utf8');
assert(startRoute && appjs.includes(startRoute + ':'), 'manifest start_url → route "' + startRoute + '" tồn tại trong router');
console.log(process.exitCode ? '\nCÓ LỖI' : '\nTẤT CẢ ĐẠT ✓');
