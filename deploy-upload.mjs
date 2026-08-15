// 批量上传文件到 GitHub（Contents API，供 git 推送不可达/证书异常时兜底）
// 用法: GH_TOKEN=<token> node deploy-upload.mjs
import fs from 'node:fs';
const token = process.env.GH_TOKEN;
if (!token) { console.error('❌ GH_TOKEN 未设置'); process.exit(1); }
const owner = process.env.GH_OWNER || 'Peter1384345';
const repo = process.env.GH_REPO || 'high-school-knowledge-hub';
const API = 'https://api.github.com';
const MSG = '升级 v2：科幻界面 + 三级掌握 + 详细讲解层 + 知识关系图谱';

const FILES = [
  'index.html',
  'README.md',
  'build.mjs',
  'validate.mjs',
  'final-check.mjs',
  'enrich-check.mjs',
  'graph-test.mjs',
  'upload-file.mjs',
  'server.mjs',
  'gh-api.mjs',
  '.gitignore',
  'src/template.html',
  'data/enrich-chinese.json',
  'data/enrich-math.json',
  'data/enrich-english.json',
  'data/enrich-physics.json',
  'data/enrich-chemistry.json',
  'data/enrich-biology.json',
  'data/textbook-chinese.json',
  'data/textbook-math.json',
  'data/textbook-english.json',
  'data/textbook-physics.json',
  'data/textbook-chemistry.json',
  'data/textbook-biology.json',
  'data/toc-chinese.json',
  'data/toc-math.json',
  'data/toc-english.json',
  'data/toc-physics.json',
  'data/toc-chemistry.json',
  'data/toc-biology.json',
];

const headers = { Authorization: 'Bearer ' + token, 'User-Agent': 'dsh-deploy', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };

async function api(method, path, body) {
  const r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { status: r.status, data, text: text.slice(0, 300) };
}

let ok = true;
for (const file of FILES) {
  if (!fs.existsSync(file)) { console.log('⚠️ 本地缺失，跳过: ' + file); continue; }
  // 获取已存在文件的 sha
  const existing = await api('GET', '/repos/' + owner + '/' + repo + '/contents/' + encodeURIComponent(file));
  const sha = existing.status === 200 && existing.data ? existing.data.sha : undefined;
  const content = fs.readFileSync(file).toString('base64');
  const put = await api('PUT', '/repos/' + owner + '/' + repo + '/contents/' + encodeURIComponent(file), {
    message: MSG, content, sha,
  });
  if (put.status === 201 || put.status === 200) {
    console.log('✅ ' + file + ' (' + (content.length * 3 / 4 / 1024).toFixed(0) + 'KB)' + (sha ? ' 更新' : ' 新建'));
  } else {
    console.log('❌ ' + file + ' [' + put.status + ']: ' + put.text);
    ok = false;
  }
}
console.log(ok ? '\n🎉 全部文件上传完成' : '\n❌ 存在上传失败');
process.exit(ok ? 0 : 1);
