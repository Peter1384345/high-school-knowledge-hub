// 用 git blob API 获取远程 index.html 原文并校验
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const token = process.env.GH_TOKEN;
const blobSha = process.argv[2];
const r = await fetch('https://api.github.com/repos/Peter1384345/high-school-knowledge-hub/git/blobs/' + blobSha, {
  headers: { Authorization: 'Bearer ' + token, 'User-Agent': 'dsh-deploy', Accept: 'application/vnd.github.raw' },
});
const remote = Buffer.from(await r.arrayBuffer());
const local = fs.readFileSync('index.html');
const rh = createHash('sha256').update(remote).digest('hex');
const lh = createHash('sha256').update(local).digest('hex');
console.log('远程 blob:', remote.length, 'bytes, sha256:', rh);
console.log('本地文件:', local.length, 'bytes, sha256:', lh);
console.log(rh === lh ? '✅ 远程内容与本地完全一致' : '❌ 不一致');
process.exit(rh === lh ? 0 : 1);
