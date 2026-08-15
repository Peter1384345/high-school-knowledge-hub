// 最终验证：index.html 内嵌数据 + 页面结构（升级版）
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script id="app-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.log('❌ 未找到内嵌数据块'); process.exit(1); }
const payload = JSON.parse(m[1]);
const data = payload.subjects;
const enrich = payload.enrich || {};
const textbook = payload.textbook || {};
const toc = payload.toc || {};
console.log('✅ 内嵌 JSON 解析成功, 学科数:', data.length);
let items = 0, modules = 0, enrichCount = 0, covered = 0, tbCount = 0, tbCovered = 0, tocUnits = 0, tocSecs = 0;
data.forEach((s) => {
  const mods = s.periods.reduce((n, p) => n + p.modules.length, 0);
  const its = s.periods.reduce((n, p) => n + p.modules.reduce((x, mo) => x + (mo.keyPoints || []).length + (mo.difficultPoints || []).length + (mo.examPoints || []).length, 0), 0);
  modules += mods; items += its;
  const e = enrich[s.id] || {};
  const tb = textbook[s.id] || {};
  enrichCount += Object.keys(e).length;
  Object.values(toc[s.id] || {}).forEach((arr) => (arr || []).forEach((b) => (b.units || []).forEach((u) => { tocUnits++; tocSecs += (u.sections || []).length; })));
  s.periods.forEach((p, pi) => p.modules.forEach((mo, mi) => {
    const arr = tb[pi + '|' + mi] || [];
    if (arr.length >= 8) tbCovered++;
    tbCount += arr.length;
    [['keyPoints', 'k'], ['difficultPoints', 'd'], ['examPoints', 'e']].forEach(([ck, cl]) => {
      (mo[ck] || []).forEach((_, ii) => { if (e[pi + '|' + mi + '|' + cl + '|' + ii] && e[pi + '|' + mi + '|' + cl + '|' + ii].explain) covered++; });
    });
  }));
  console.log(`  - ${s.icon} ${s.name}: ${s.periods.length} 学段 / ${mods} 模块 / ${its} 条`);
});
console.log(`合计: ${data.length} 科 / ${modules} 模块 / ${items + tbCount} 条知识点（含课本 ${tbCount}） / 讲解层 ${covered}/${items} / 课本模块覆盖 ${tbCovered}/${modules} / 教材目录 ${tocUnits} 单元 ${tocSecs} 节`);
// 页面结构检查
const checks = {
  '书香水墨背景 .inkwash': html.includes('class="inkwash"'),
  '实物照片背景 .photo-bg': html.includes('photo-bg') && html.includes('images.unsplash.com'),
  '照片失败回退 no-photo': html.includes('no-photo'),
  '照片预加载 PHOTO_OK': html.includes('PHOTO_OK'),
  '科目动态背景 body[data-bg]': html.includes('body[data-bg="chinese"]') && html.includes('setBgMode'),
  '科目专属配色 MODE_COLORS': html.includes('MODE_COLORS'),
  '科目页面整体染色 body[data-bg]--bg': html.includes('body[data-bg="math"]{--bg') && html.includes('body[data-bg="chemistry"]{--bg'),
  '科目水印大字 SUBJ_WM': html.includes('SUBJ_WM'),
  '可见度增强 BOOST': html.includes('BOOST'),
  '语文诗词元素': html.includes('落霞与孤鹜齐飞'),
  '真实场景背景 initScene': html.includes('function initScene'),
  '噪点颗粒 drawNoise': html.includes('drawNoise') && html.includes('createPattern'),
  '云层 drawClouds': html.includes('drawClouds'),
  '暗角 drawVignette': html.includes('drawVignette'),
  '前景纵深 drawForeground': html.includes('drawForeground'),
  '朝阳光线': html.includes('朝阳光线'),
  '渐变天空场景 SCENES': html.includes('const SCENES'),
  '语文山水晨雾飞鸟': html.includes("mode === 'home' || mode === 'chinese'") && html.includes('birds'),
  '学科特色元素 drawSubjectEls': html.includes('drawSubjectEls'),
  '语文竖排诗词+印章': html.includes('落霞与孤鹜齐飞') && html.includes('墨竹'),
  '数学公式辉光+勾股圆': html.includes('勾股圆') && html.includes('a^2+b^2=c^2'),
  '英语大字字母+单词': html.includes("'A', 'B', 'C'") && html.includes('knowledge'),
  '物理公式+发光原子': html.includes('发光原子') && html.includes('F=ma'),
  '化学球棍分子+苯环': html.includes('ball(') && html.includes('C6H12O6'),
  '生物DNA+细胞': html.includes('DNA 双螺旋') && html.includes('细胞'),
  '数学星空星座网格': html.includes('星座连线'),
  '英语海面帆船': html.includes('s.sea'),
  '物理极光夜空': html.includes('aurora'),
  '化学暖光气泡': html.includes('气泡（化学）'),
  '生物草地光线落叶': html.includes('meadow'),
  '五级掌握 + 间隔重复': html.includes('openReview') && html.includes('reviewRate') && html.includes('LV_NAMES'),
  '复习角标 reviewBadge': html.includes('reviewBadge'),
  '印章 .seal': html.includes('class="seal"'),
  '书法字体 (Kaiti)': html.includes('Kaiti SC'),
  '宣纸底色': html.includes('#f6f1e6'),
  '朱砂色 #a63a2b': html.includes('a63a2b'),
  '搜索框': html.includes('id="searchInput"'),
  '主题切换': html.includes('id="themeBtn"'),
  '随机复习': html.includes('id="randomBtn"'),
  '知识图谱视图 #graphView': html.includes('id="graphView"'),
  '电子课本视图': html.includes('etb-body') && html.includes('etb-toc'),
  '五级掌握圆点 lv1-lv5': html.includes('lv5') && html.includes('lv1'),
  '讲解面板 .it-detail': html.includes('class="it-detail"'),
  '响应式断点': html.includes('@media (max-width:900px)'),
};
let allOk = true;
for (const [k, v] of Object.entries(checks)) { console.log((v ? '✅' : '❌') + ' ' + k); if (!v) allOk = false; }
// 无占位符残留
if (html.includes('__DATA_JSON__')) { console.log('❌ 仍有占位符残留'); allOk = false; } else { console.log('✅ 无占位符残留'); }
// 数据块安全性
const dataBlock = m[1];
if (/[<>]/.test(dataBlock)) { console.log('❌ 数据块含未转义的 < 或 >'); allOk = false; } else { console.log('✅ 数据块无裸 < >（已安全转义）'); }
// 脚本块数量应为 2
const scriptTags = html.match(/<script[\s>]/g) || [];
if (scriptTags.length === 2) { console.log('✅ 脚本块数量正确 (2)'); } else { console.log('❌ 脚本块数量异常: ' + scriptTags.length); allOk = false; }
console.log(allOk && data.length === 6 && covered === items && tbCovered === modules && tocUnits >= 100 ? '\n🎉 最终验证全部通过' : '\n❌ 存在未通过项');
process.exit(allOk && data.length === 6 && covered === items && tbCovered === modules && tocUnits >= 100 ? 0 : 1);
