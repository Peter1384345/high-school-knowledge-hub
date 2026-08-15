// 讲解层质量抽查
import fs from 'node:fs';
for (const id of ['chinese', 'english', 'math', 'physics']) {
  const m = JSON.parse(fs.readFileSync('data/enrich-' + id + '.json', 'utf8'));
  const keys = Object.keys(m);
  let bad = 0, withExample = 0, avgLen = 0;
  for (const k of keys) {
    for (const f of ['explain', 'example', 'tip']) {
      const v = m[k][f];
      if (v && /[<>&"]/.test(v)) { bad++; if (bad <= 3) console.log('  非法字符', id, k, f, v.slice(0, 40)); }
    }
    if (m[k].example) withExample++;
    avgLen += (m[k].explain || '').length;
  }
  console.log(id + ': 键数=' + keys.length + ' 非法字符=' + bad + ' 含例题=' + (withExample / keys.length * 100).toFixed(0) + '% 讲解平均长度=' + Math.round(avgLen / keys.length) + '字');
}
// 展示数学两个示例
const m = JSON.parse(fs.readFileSync('data/enrich-math.json', 'utf8'));
console.log('\n示例 2|2|k|0（圆锥曲线重点）:', JSON.stringify(m['2|2|k|0']));
console.log('\n示例 3|1|d|1（导数难点）:', JSON.stringify(m['3|1|d|1']));
