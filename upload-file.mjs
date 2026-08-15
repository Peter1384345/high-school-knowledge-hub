// 通过 GitHub Contents API 上传单个文件（用于 git 推送不可达时的兜底）
// 用法: GH_TOKEN=<token> node upload-file.mjs <相对路径> [提交信息]
import fs from 'node:fs';
const token = process.env.GH_TOKEN;
if (!token) { console.error('❌ GH_TOKEN 未设置'); process.exit(1); }
const owner = process.env.GH_OWNER || 'Peter1384345';
const repo = process.env.GH_REPO || 'high-school-knowledge-hub';
const file = process.argv[2];
const msg = process.argv[3] || '添加文件';
if (!file) { console.error('❌ 缺少文件路径'); process.exit(1); }
if (!fs.existsSync(file)) { console.error('❌ 文件不存在: ' + file); process.exit(1); }
const content = fs.readFileSync(file).toString('base64');
// 先获取已存在文件的 sha（更新时必须提供）
let sha;
try {
  const g = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file)}`, {
    headers: { Authorization: 'Bearer ' + token, 'User-Agent': 'dsh-deploy', Accept: 'application/vnd.github+json' },
  });
  if (g.status === 200) { const gd = await g.json(); sha = gd.sha; }
} catch (e) { /* 视为新建 */ }
const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file)}`, {
  method: 'PUT',
  headers: {
    Authorization: 'Bearer ' + token,
    'User-Agent': 'dsh-deploy',
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: msg, content, sha }),
});
const d = await r.json().catch(() => null);
if (r.status === 201 || r.status === 200) console.log('✅ 已上传: ' + file + ' (commit ' + (d && d.commit ? d.commit.sha.slice(0, 7) : '?') + ')');
else console.log('❌ 上传失败 [' + r.status + ']: ' + JSON.stringify(d).slice(0, 300));
process.exit(r.status === 201 ? 0 : 1);
