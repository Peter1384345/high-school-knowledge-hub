import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const ids = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
const CATS = [['keyPoints', 'k'], ['difficultPoints', 'd'], ['examPoints', 'e']];

let ok = true;
let totalItems = 0, totalModules = 0, totalPeriods = 0;
let totalEnrich = 0, totalCovered = 0, totalTextbook = 0;
let totalTocUnits = 0, totalTocSecs = 0;

for (const id of ids) {
  const p = path.join(root, 'data', id + '.json');
  if (!fs.existsSync(p)) { console.log(`❌ MISSING ${p}`); ok = false; continue; }
  let d;
  try { d = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log(`❌ INVALID ${p}: ${e.message}`); ok = false; continue; }

  const bad = [];
  if (!d.id || !d.name || !Array.isArray(d.periods) || !d.periods.length) bad.push('顶层结构缺失');
  let mods = 0, items = 0, counts = { keyPoints: 0, difficultPoints: 0, examPoints: 0 };
  const expKeys = [];
  d.periods.forEach((per, pi) => {
    if (!per.period) bad.push(`periods[${pi}] 缺 period`);
    if (!Array.isArray(per.modules) || !per.modules.length) bad.push(`${per.period || 'periods[' + pi + ']'} 缺 modules`);
    (per.modules || []).forEach((m, mi) => {
      mods++;
      if (!m.title) bad.push(`${per.period}/modules[${mi}] 缺 title`);
      for (const [ck, cl] of CATS) {
        const arr = m[ck];
        if (!Array.isArray(arr) || !arr.length) { bad.push(`${per.period}/${m.title || mi} 缺${ck}`); continue; }
        arr.forEach((t, ii) => {
          items++;
          counts[ck]++;
          expKeys.push(pi + '|' + mi + '|' + cl + '|' + ii);
          if (typeof t !== 'string' || !t.trim()) bad.push(`${per.period}/${m.title}/${ck}: 空条目`);
          else if (/[<>&"]/.test(t)) bad.push(`${per.period}/${m.title}/${ck} 含非法字符: ${t.slice(0, 30)}`);
        });
      }
    });
  });

  /* 讲解层校验 */
  const ep = path.join(root, 'data', 'enrich-' + id + '.json');
  let enrich = {};
  if (fs.existsSync(ep)) {
    try { enrich = JSON.parse(fs.readFileSync(ep, 'utf8')); }
    catch (e) { bad.push('enrich JSON 非法: ' + e.message); ok = false; }
  } else {
    bad.push('缺少 enrich-' + id + '.json');
    ok = false;
  }
  let covered = 0, missExplain = 0, extraKeys = 0, unsafeChars = 0;
  for (const k of expKeys) {
    const e = enrich[k];
    if (e && typeof e.explain === 'string' && e.explain.trim()) covered++;
    else { missExplain++; bad.push(`${k} 缺 explain: ${e ? '(有记录缺explain)' : '(无记录)'}`); }
    if (e) for (const f of ['explain', 'example', 'tip']) {
      const v = e[f];
      // 构建时会对 < > & 做 \u003c 转义，页面显示安全；此处仅拦截会破坏 JSON/HTML 的英文双引号
      if (typeof v === 'string' && (v.includes('"') || v.includes('</'))) { unsafeChars++; bad.push(`${k}.${f} 含危险字符`); }
    }
  }
  for (const k of Object.keys(enrich)) if (!expKeys.includes(k)) { extraKeys++; }
  totalEnrich += expKeys.length; totalCovered += covered;
  /* 课本知识点校验 */
  const tp = path.join(root, 'data', 'textbook-' + id + '.json');
  let tb = {};
  if (fs.existsSync(tp)) {
    try { tb = JSON.parse(fs.readFileSync(tp, 'utf8')); }
    catch (e) { bad.push('textbook JSON 非法: ' + e.message); ok = false; }
  } else {
    bad.push('缺少 textbook-' + id + '.json');
    ok = false;
  }
  let tbCovered = 0, tbPoints = 0, tbMin = 999, tbExtra = 0;
  const tbKeys = [];
  d.periods.forEach((per, pi) => (per.modules || []).forEach((m, mi) => tbKeys.push(pi + '|' + mi)));
  for (const k of tbKeys) {
    const arr = tb[k];
    if (Array.isArray(arr) && arr.length >= 8) { tbCovered++; tbPoints += arr.length; tbMin = Math.min(tbMin, arr.length); }
    else { bad.push(`课本知识点 ${k} 缺失或不足 8 条（${Array.isArray(arr) ? arr.length : '无'}）`); }
  }
  for (const k of Object.keys(tb)) if (!tbKeys.includes(k)) tbExtra++;
  totalTextbook += tbPoints;

  /* 电子课本目录校验 */
  const tp2 = path.join(root, 'data', 'toc-' + id + '.json');
  let toc = {};
  if (fs.existsSync(tp2)) {
    try { toc = JSON.parse(fs.readFileSync(tp2, 'utf8')); }
    catch (e) { bad.push('toc JSON 非法: ' + e.message); ok = false; }
  } else {
    bad.push('缺少 toc-' + id + '.json');
    ok = false;
  }
  let tocP = 0, tocUnits = 0, tocSecs = 0, tocBadRef = 0;
  d.periods.forEach((per, pi) => {
    const arr = toc[String(pi)];
    if (!Array.isArray(arr) || !arr.length) { bad.push(`toc period ${pi} 缺失`); return; }
    tocP++;
    arr.forEach((b) => {
      if (!b.book) bad.push(`toc ${pi} 缺 book 名`);
      (b.units || []).forEach((u) => {
        if (!u.unit) { bad.push(`toc ${pi}/${b.book} 缺 unit 名`); return; }
        tocUnits++;
        const secs = u.sections || [];
        if (secs.length < 2) bad.push(`toc 单元「${u.unit}」节数不足 2（${secs.length}）`);
        secs.forEach((sx) => {
          tocSecs++;
          if (sx.module) {
            const parts = sx.module.split('|');
            const mpi = Number(parts[0]), mmi = Number(parts[1]);
            if (!d.periods[mpi] || !d.periods[mpi].modules[mmi]) { tocBadRef++; bad.push(`toc 节「${sx.sec}」module 引用无效: ${sx.module}`); }
          }
        });
      });
    });
  });
  totalTocUnits += tocUnits; totalTocSecs += tocSecs;

  totalItems += items; totalModules += mods; totalPeriods += d.periods.length;
  console.log(`${d.icon || ''} ${d.name}: periods=${d.periods.length} modules=${mods} items=${items}（重点${counts.keyPoints}/难点${counts.difficultPoints}/考点${counts.examPoints}） | 讲解层 ${covered}/${expKeys.length}${extraKeys ? '（多余键 ' + extraKeys + '）' : ''} | 课本知识点 ${tbCovered}/${tbKeys.length}（${tbPoints} 条${tbMin < 999 ? '，最少 ' + tbMin : ''}${tbExtra ? '，多余键 ' + tbExtra : ''}） | 目录 ${tocP}/${d.periods.length} 学段 ${tocUnits} 单元 ${tocSecs} 节${tocBadRef ? '（无效引用 ' + tocBadRef + '）' : ''}`);
  if (bad.length) {
    ok = false;
    console.log('   问题:');
    bad.slice(0, 25).forEach((b) => console.log('   - ' + b));
  }
}
console.log(`\n合计: ${ids.length} 科 / ${totalPeriods} 学段 / ${totalModules} 模块 / ${totalItems} 条知识点 / 讲解层覆盖 ${totalCovered}/${totalEnrich} / 课本知识点 ${totalTextbook} 条 / 教材目录 ${totalTocUnits} 单元 ${totalTocSecs} 节`);
console.log(ok ? '✅ 全部数据通过校验' : '❌ 存在需要修复的问题');
process.exit(ok ? 0 : 1);
