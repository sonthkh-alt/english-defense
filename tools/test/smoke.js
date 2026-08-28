// Shim DOM tối thiểu để chạy views.js ngoài trình duyệt
var mkEl = function(tag){
  const _c=[]; const _cls=new Set();
  return {tagName:tag, style:{}, dataset:{}, _children:_c,
    get children(){return _c},
    classList:{_s:_cls,
      add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
      toggle(c,f){ const on = (f===undefined) ? !this._s.has(c) : !!f; on?this._s.add(c):this._s.delete(c); return on; },
      contains(c){return this._s.has(c)}},
    setAttribute(){}, addEventListener(){}, appendChild(n){_c.push(n);return n},
    append(){}, remove(){}, querySelector(){return null}, querySelectorAll(){return []},
    set textContent(v){this._t=v}, get textContent(){return this._t||''},
    set innerHTML(v){this._h=v; _c.length=0}, get innerHTML(){return this._h||''}};
}

// Node "class" giả: mọi object do mkEl tạo đều được coi là Node
class FakeNode {}
global.Node = FakeNode;
const _mk = mkEl;
mkEl = function(tag){ const o=_mk(tag); Object.setPrototypeOf(o, FakeNode.prototype); return o; };

global.document={createElement:(t)=>mkEl(t), createTextNode:(t)=>{const n=mkEl('#text'); n.textContent=String(t); return n;}, createDocumentFragment:()=>mkEl('frag'),
  getElementById:()=>mkEl('div'), querySelector:()=>mkEl('div'), querySelectorAll:()=>[],
  body:mkEl('body'), documentElement:mkEl('html'), addEventListener(){}};
global.window=global; global.location={hash:'#/daily',protocol:'http:'};
global.navigator={userAgent:'node',language:'vi'};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
global.setInterval=()=>0; global.clearInterval=()=>{}; global.setTimeout=(f)=>0;
global.speechSynthesis=null; global.fetch=undefined; global.TextEncoder=require('util').TextEncoder;
global.performance={now:()=>0};
global.requestAnimationFrame=(f)=>0;
global.cancelAnimationFrame=()=>{};

require('../../assets/js/data.js'); require('../../assets/js/seed.js'); require('../../assets/js/lessons.js');
require('../../assets/js/store.js'); require('../../assets/js/ui.js'); require('../../assets/js/views.js');

// nạp gói học rồi kiểm tra 3 trường mới đi tới tận Store
const r=Store.importStarterPack();
console.log('Nạp gói:', JSON.stringify(r));
const v=Store.get().vocab[0];
console.log('Từ đầu tiên:', v.term, '| ipa:', v.ipa, '| icon:', v.icon, '| dịch VD:', (v.exampleVi||'').slice(0,40));
const meta=Store.vocabMeta(v);
console.log('vocabMeta:', JSON.stringify(meta).slice(0,110));
// người dùng CŨ: object thiếu 3 trường → phải tra ngược được từ SEED
const old={term:'criteria', level:1};
console.log('Tra ngược (state cũ):', JSON.stringify(Store.vocabMeta(old)));
// render thử các trang chính
['daily','vocab','today','roadmap','questions'].forEach(name=>{
  try{ const node=Views[name](); console.log('render', name, '→ OK'); }
  catch(e){ console.log('render', name, '→ LỖI:', e.message); }
});

// ===== Kiểm tra CHẾ ĐỘ HỌC TẬP TRUNG =====
function assert(cond,msg){ console.log((cond?'✓ ':'✗ LỖI: ')+msg); if(!cond) process.exitCode=1; }
document.body.classList.remove('is-studying');
Views.daily();                       // đang giữa bài học
assert(document.body.classList.contains('is-studying'), 'Đang học → bật chế độ tập trung (ẩn thanh trên/dưới)');

// Học hết bài → phải TẮT để thấy lại điều hướng
const date=Store.today();
const d=Store.day60(date)||{};
let guard=0;
while(!(Store.day60(date)||{}).complete && guard++<50) Store.day60Advance(date, 12);
Views.daily();
assert(!document.body.classList.contains('is-studying'), 'Học xong → tắt chế độ tập trung');

// Thanh tab dưới phải có trong index.html
const html=require('fs').readFileSync('../../index.html','utf8');
assert(/id="tabbar"/.test(html), 'index.html có thanh tab dưới');
assert(/viewport-fit=cover/.test(html), 'index.html bật viewport-fit=cover (vùng an toàn iPhone)');
const css=require('fs').readFileSync('../../assets/css/style.css','utf8');
assert(/safe-area-inset-bottom/.test(css), 'CSS dùng vùng an toàn thanh Home');
assert(/body\.is-studying/.test(css), 'CSS có quy tắc chế độ tập trung');
