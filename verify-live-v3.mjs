// 验证线上：课本知识点层
const url = 'https://peter1384345.github.io/high-school-knowledge-hub/';
const r = await fetch(url);
const t = await r.text();
console.log('HTTP', r.status, '|', (t.length / 1024).toFixed(1), 'KB');
const checks = {
  '课本知识点区块样式 (chip-book)': t.includes('chip-book') && t.includes('课本知识点'),
  '内嵌课本数据 (textbook)': t.includes('"textbook"'),
  '语文课本点(0|0)': t.includes('"0|0":['),
  '数学课本点(1|1)': t.includes('"1|1":['),
  '物理课本点(3|0)': t.includes('"3|0":['),
  '化学课本点(0|3)': t.includes('"0|3":['),
  '生物课本点(1|3)': t.includes('"1|3":['),
  '课本点搜索索引': t.includes('课本知识点'),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) { console.log((v ? '✅' : '❌') + ' ' + k); if (!v) ok = false; }
// 提取一条课本知识点内容示例
const m = t.match(/"textbook":\{[^}]*?"0\|0":\["([^"]{15,50})/);
console.log('课本知识点示例: ' + (m ? m[1] + '…' : '(未提取到)'));
console.log(ok && r.status === 200 ? '\n🎉 线上课本知识点验证通过' : '\n❌ 存在未通过项');
process.exit(ok && r.status === 200 ? 0 : 1);
