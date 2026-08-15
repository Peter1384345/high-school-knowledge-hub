// 验证线上 GitHub Pages 页面内容
const url = 'https://peter1384345.github.io/high-school-knowledge-hub/';
const r = await fetch(url);
const t = await r.text();
console.log('HTTP', r.status, '|', (t.length / 1024).toFixed(1), 'KB');
console.log('标题:', /<title>([^<]+)<\/title>/.exec(t)?.[1]);
const ids = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
const found = ids.filter((id) => t.includes('"id":"' + id + '"'));
console.log('内嵌数据学科:', found.join(', '), '(' + found.length + '/6)');
console.log('功能检查: 搜索框=' + t.includes('searchInput') + ' 粒子画布=' + t.includes('id="fx"') + ' 主题切换=' + t.includes('themeBtn') + ' 随机复习=' + t.includes('randomBtn'));
const ok = r.status === 200 && found.length === 6 && t.includes('searchInput') && t.includes('themeBtn');
console.log(ok ? '\n🎉 线上部署验证通过' : '\n❌ 线上部署存在问题');
process.exit(ok ? 0 : 1);
