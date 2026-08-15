// 校验远程 index.html 与本地一致
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const token = process.env.GH_TOKEN;
const r = await fetch('https://api.github.com/repos/Peter1384345/high-school-knowledge-hub/contents/index.html', {
  headers: { Authorization: 'Bearer ' + token, 'User-Agent': 'dsh-deploy', Accept: 'application/vnd.github+json' },
});
const d = await r.json();
const remote = Buffer.from(d.content, 'base64');
const local = fs.readFileSync('index.html');
const rh = createHash('sha256').update(remote).digest('hex');
const lh = createHash('sha256').update(local).digest('hex');
console.log('远程 index.html:', remote.length, 'bytes, sha256:', rh);
console.log('本地 index.html:', local.length, 'bytes, sha256:', lh);
console.log(rh === lh ? '✅ 远程与本地完全一致' : '❌ 不一致（需要重新上传）');
process.exit(rh === lh ? 0 : 1);
