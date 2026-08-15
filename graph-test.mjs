// 模拟测试：知识图谱的构建 + 力导向布局收敛性（不依赖浏览器）
import fs from 'node:fs';
const DATA = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology']
  .map((id) => JSON.parse(fs.readFileSync('data/' + id + '.json', 'utf8')));

const CROSS_RULES = [
  ['math', '导数', 'physics', '运动的描述'],
  ['math', '导数', 'physics', '电磁感应'],
  ['math', '三角函数', 'physics', '圆周运动'],
  ['math', '三角函数', 'physics', '交变电流'],
  ['math', '三角函数', 'physics', '机械振动与机械波'],
  ['math', '平面向量', 'physics', '抛体运动'],
  ['math', '平面向量', 'physics', '静电场'],
  ['math', '指数函数', 'physics', '牛顿运动定律'],
  ['math', '随机变量', 'biology', '遗传'],
  ['math', '计数原理', 'biology', '遗传'],
  ['math', '统计', 'biology', '种群'],
  ['math', '圆锥曲线', 'physics', '万有引力'],
  ['physics', '分子动理论', 'chemistry', '物质的量'],
  ['chemistry', '化学反应速率', 'biology', '能量供应'],
  ['chemistry', '氧化还原反应', 'biology', '细胞的能量供应'],
  ['chemistry', '有机化合物基础', 'biology', '组成细胞的分子'],
  ['chemistry', '盐类水解', 'biology', '人体的内环境'],
  ['chemistry', '电化学', 'physics', '恒定电流'],
  ['chemistry', '化学平衡', 'biology', '生态系统'],
  ['physics', '静电场', 'chemistry', '原子结构'],
];

function buildGraph() {
  const nodes = [], edges = [], bySubj = {};
  DATA.forEach((s, si) => {
    bySubj[s.id] = [];
    s.periods.forEach((p, pi) => {
      p.modules.forEach((m, mi) => {
        const items = ['keyPoints', 'difficultPoints', 'examPoints'].reduce((n, c) => n + (m[c] || []).length, 0);
        nodes.push({ id: s.id + '|' + pi + '|' + mi, sid: s.id, si, pi, mi, title: m.title, items, x: 0, y: 0, vx: 0, vy: 0, pinned: false });
        bySubj[s.id].push(nodes[nodes.length - 1]);
      });
    });
  });
  for (const arr of Object.values(bySubj))
    for (let i = 0; i < arr.length - 1; i++) edges.push({ s: arr[i], t: arr[i + 1], cross: false });
  const findNode = (sid, kw) => { const arr = bySubj[sid] || []; for (const n of arr) if (n.title.includes(kw)) return n; return null; };
  const crossMatched = [];
  for (const [a, ka, b, kb] of CROSS_RULES) {
    const na = findNode(a, ka), nb = findNode(b, kb);
    if (na && nb && na !== nb) { edges.push({ s: na, t: nb, cross: true }); crossMatched.push([a + ':' + ka, b + ':' + kb, na.title, nb.title]); }
    else crossMatched.push([a + ':' + ka, b + ':' + kb, '✗未匹配', na ? na.title : '无', nb ? nb.title : '无']);
  }
  const subs = DATA.map((s) => s.id);
  subs.forEach((sid, k) => {
    const arr = bySubj[sid];
    const ang = (k / subs.length) * 6.283;
    const cx = Math.cos(ang) * 260, cy = Math.sin(ang) * 200;
    arr.forEach((n, i) => {
      const a2 = ang + (i / Math.max(1, arr.length)) * 0.9 - 0.45;
      n.x = cx + Math.cos(a2) * 130; n.y = cy + Math.sin(a2) * 100;
    });
  });
  return { nodes, edges, crossMatched };
}

function simTick(nodes, edges) {
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    let dx = a.x - b.x, dy = a.y - b.y;
    let d2 = dx * dx + dy * dy;
    if (d2 < 4) { dx = Math.random() - .5; dy = Math.random() - .5; d2 = 4; }
    const d = Math.sqrt(d2), f = 2400 / d2;
    const fx = dx / d * f, fy = dy / d * f;
    a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
  }
  for (const e of edges) {
    const a = e.s, b = e.t;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const f = (d - 96) * 0.02;
    const fx = dx / d * f, fy = dy / d * f;
    a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
  }
  for (const n of nodes) {
    n.vx += -n.x * 0.012; n.vy += -n.y * 0.012;
    n.vx *= 0.85; n.vy *= 0.85;
    const sp = Math.hypot(n.vx, n.vy);
    if (sp > 4) { n.vx *= 4 / sp; n.vy *= 4 / sp; }
    n.x += n.vx; n.y += n.vy;
  }
}

const g = buildGraph();
console.log('节点数:', g.nodes.length, '/ 边数:', g.edges.length, '（顺序边', g.edges.length - g.crossMatched.length, '/ 跨学科边', g.crossMatched.length, '）');
console.log('跨学科边匹配结果:');
g.crossMatched.forEach((c) => console.log('  [' + c[0] + ' → ' + c[1] + '] ' + (c[2] === '✗未匹配' ? '✗ 未匹配到' : '✓ ' + c[2] + ' ⟷ ' + c[3])));
let nan = false;
for (let t = 0; t < 900; t++) { simTick(g.nodes, g.edges); if (g.nodes.some((n) => !isFinite(n.x) || !isFinite(n.y))) { nan = true; break; } }
if (nan) { console.log('❌ 出现 NaN'); process.exit(1); }
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
for (const n of g.nodes) { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); }
const spread = Math.hypot(maxX - minX, maxY - minY);
console.log('900 tick 后节点范围: x[' + minX.toFixed(0) + ',' + maxX.toFixed(0) + '] y[' + minY.toFixed(0) + ',' + maxY.toFixed(0) + '] 散布', spread.toFixed(0), 'px');
const speeds = g.nodes.map((n) => Math.hypot(n.vx, n.vy));
const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
console.log('平均速度:', avgSpeed.toFixed(4), avgSpeed < 0.5 ? '✅ 已收敛' : '⚠️ 仍在缓慢移动');
console.log(g.nodes.some((n) => Math.abs(n.x) > 3000 || Math.abs(n.y) > 3000) ? '❌ 节点飞出' : '✅ 节点位置有界');
process.exit(0);
