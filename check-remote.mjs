// 检查远程仓库最近提交与顶层文件（是否被未知进程污染）
const token = process.env.GH_TOKEN;
const h = { Authorization: 'Bearer ' + token, 'User-Agent': 'dsh-deploy', Accept: 'application/vnd.github+json' };
const commits = await (await fetch('https://api.github.com/repos/Peter1384345/high-school-knowledge-hub/commits?per_page=6', { headers: h })).json();
console.log('最近提交:');
commits.forEach((c) => console.log('  ' + c.sha.slice(0, 8) + ' | ' + c.commit.message.split('\n')[0].slice(0, 70)));
const tree = await (await fetch('https://api.github.com/repos/Peter1384345/high-school-knowledge-hub/git/trees/main?recursive=0', { headers: h })).json();
console.log('远程 main 顶层:');
(tree.tree || []).forEach((t) => console.log('  ' + t.type + ' ' + t.path));
