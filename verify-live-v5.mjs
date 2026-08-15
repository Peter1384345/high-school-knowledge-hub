// 验证线上：真实场景背景 + 五级掌握/间隔重复
const url = 'https://peter1384345.github.io/high-school-knowledge-hub/';
const r = await fetch(url);
const t = await r.text();
console.log('HTTP', r.status, '|', (t.length / 1024).toFixed(1), 'KB');
const checks = {
  '书香水墨背景 .inkwash': t.includes('class="inkwash"'),
  '实物照片背景 .photo-bg': t.includes('photo-bg') && t.includes('images.unsplash.com'),
  '照片失败回退 no-photo': t.includes('no-photo'),
  '照片预加载 PHOTO_OK': t.includes('PHOTO_OK'),
  '科目动态背景 body[data-bg]': t.includes('body[data-bg="chinese"]') && t.includes('setBgMode'),
  '真实场景背景 initScene': t.includes('function initScene'),
  '噪点颗粒 drawNoise': t.includes('drawNoise') && t.includes('createPattern'),
  '云层 drawClouds': t.includes('drawClouds'),
  '暗角 drawVignette': t.includes('drawVignette'),
  '前景纵深 drawForeground': t.includes('drawForeground'),
  '渐变天空场景 SCENES': t.includes('const SCENES'),
  '语文山水晨雾飞鸟': t.includes("mode === 'home' || mode === 'chinese'") && t.includes('birds'),
  '数学星空星座网格': t.includes('星座连线'),
  '英语海面帆船': t.includes('s.sea'),
  '物理极光夜空': t.includes('aurora'),
  '化学暖光气泡': t.includes('气泡（化学）'),
  '生物草地光线落叶': t.includes('meadow'),
  '五级掌握 + 间隔重复': t.includes('openReview') && t.includes('reviewRate') && t.includes('LV_NAMES'),
  '复习角标 reviewBadge': t.includes('reviewBadge'),
  '印章 .seal': t.includes('class="seal"'),
  '宣纸底色': t.includes('#f6f1e6'),
  '朱砂色': t.includes('a63a2b'),
  '不再有科幻网格/扫描线': !t.includes('grid-floor') && !t.includes('scanlines') && !t.includes('glitchA'),
  '电子课本视图仍在': t.includes('etb-body'),
  '知识图谱仍在': t.includes('id="graphView"'),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) { console.log((v ? '✅' : '❌') + ' ' + k); if (!v) ok = false; }
console.log(ok && r.status === 200 ? '\n🎉 线上书香风验证通过' : '\n❌ 存在未通过项');
process.exit(ok && r.status === 200 ? 0 : 1);
