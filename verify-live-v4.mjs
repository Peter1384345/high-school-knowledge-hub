// 验证线上：电子课本功能
const url = 'https://peter1384345.github.io/high-school-knowledge-hub/';
const r = await fetch(url);
const t = await r.text();
console.log('HTTP', r.status, '|', (t.length / 1024).toFixed(1), 'KB');
const checks = {
  '电子课本视图 (etb-body/etb-toc)': t.includes('etb-body') && t.includes('etb-toc'),
  '目录数据 (toc)': t.includes('"toc"'),
  '语文-必修上册': t.includes('必修上册'),
  '数学-1.1集合的概念': t.includes('1.1 集合的概念'),
  '英语-Unit 1': t.includes('Unit 1'),
  '物理-1.1质点': t.includes('1.1 质点'),
  '化学-1.2离子反应': t.includes('1.2 离子反应'),
  '生物-走近细胞': t.includes('走近细胞'),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) { console.log((v ? '✅' : '❌') + ' ' + k); if (!v) ok = false; }
console.log(ok && r.status === 200 ? '\n🎉 线上电子课本验证通过' : '\n❌ 存在未通过项');
process.exit(ok && r.status === 200 ? 0 : 1);
