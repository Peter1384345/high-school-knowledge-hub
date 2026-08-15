// 验证线上新版功能（讲解层/三级掌握/知识图谱/科幻背景）
const url = 'https://peter1384345.github.io/high-school-knowledge-hub/';
const r = await fetch(url);
const t = await r.text();
console.log('HTTP', r.status, '|', (t.length / 1024).toFixed(1), 'KB');
const checks = {
  '知识图谱视图': t.includes('id="graphView"') && t.includes('id="gvSvg"'),
  '图谱力导向代码': t.includes('simTick') && t.includes('CROSS_RULES'),
  '讲解面板': t.includes('class="it-detail"'),
  '三级掌握': t.includes('lv1') && t.includes('lv2') && t.includes('hs_mastery'),
  '讲解层内嵌(enrich)': t.includes('"enrich"') && t.includes('"explain"'),
  '科幻星云': t.includes('class="nebula"'),
  '透视网格': t.includes('class="grid-floor"'),
  '故障风标题': t.includes('.glitch'),
  '扫描线': t.includes('.scanlines'),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) { console.log((v ? '✅' : '❌') + ' ' + k); if (!v) ok = false; }
// 随机取一个讲解条目确认内容存在
const enrichMatch = t.match(/"explain":"([^"]{20,60})/);
console.log('讲解内容示例: ' + (enrichMatch ? enrichMatch[1] + '…' : '(未找到)'));
console.log(ok && r.status === 200 ? '\n🎉 线上新版验证通过' : '\n❌ 存在未通过项');
process.exit(ok && r.status === 200 ? 0 : 1);
