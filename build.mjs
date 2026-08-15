import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(root, 'src', 'template.html');
const outPath = path.join(root, 'index.html');
const ids = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];

const template = fs.readFileSync(templatePath, 'utf8');

const subjects = [];
const enrich = {};
const textbook = {};
const toc = {};
let failed = false;
for (const id of ids) {
  const p = path.join(root, 'data', id + '.json');
  if (!fs.existsSync(p)) { console.error('❌ MISSING ' + p); failed = true; continue; }
  try { subjects.push(JSON.parse(fs.readFileSync(p, 'utf8'))); }
  catch (e) { console.error('❌ INVALID JSON ' + p + ': ' + e.message); failed = true; }

  const ep = path.join(root, 'data', 'enrich-' + id + '.json');
  if (fs.existsSync(ep)) {
    try { enrich[id] = JSON.parse(fs.readFileSync(ep, 'utf8')); console.log('📖 讲解层已加载: enrich-' + id + '.json (' + Object.keys(enrich[id]).length + ' 条)'); }
    catch (e) { console.error('❌ INVALID enrich JSON ' + ep + ': ' + e.message); failed = true; }
  } else {
    console.warn('⚠️ 缺少 enrich-' + id + '.json，该科将无详细讲解');
    enrich[id] = {};
  }

  const tp = path.join(root, 'data', 'textbook-' + id + '.json');
  if (fs.existsSync(tp)) {
    try { textbook[id] = JSON.parse(fs.readFileSync(tp, 'utf8')); console.log('📚 课本知识点已加载: textbook-' + id + '.json (' + Object.keys(textbook[id]).length + ' 模块)'); }
    catch (e) { console.error('❌ INVALID textbook JSON ' + tp + ': ' + e.message); failed = true; }
  } else {
    console.warn('⚠️ 缺少 textbook-' + id + '.json，该科将无课本知识点');
    textbook[id] = {};
  }

  const tp2 = path.join(root, 'data', 'toc-' + id + '.json');
  if (fs.existsSync(tp2)) {
    try { toc[id] = JSON.parse(fs.readFileSync(tp2, 'utf8')); console.log('🗂️ 教材目录已加载: toc-' + id + '.json (' + Object.keys(toc[id]).length + ' 学段)'); }
    catch (e) { console.error('❌ INVALID toc JSON ' + tp2 + ': ' + e.message); failed = true; }
  } else {
    console.warn('⚠️ 缺少 toc-' + id + '.json，该科将无电子课本目录');
    toc[id] = {};
  }
}
if (subjects.length !== ids.length || failed) {
  console.error('❌ 构建中止：请先完成全部六科数据文件');
  process.exit(1);
}

const payload = { subjects, enrich, textbook, toc };
// 转义 < > & 防止破坏 HTML 脚本块
const json = JSON.stringify(payload)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');

if (!template.includes('__DATA_JSON__')) {
  console.error('❌ 模板中未找到占位符 __DATA_JSON__');
  process.exit(1);
}
const out = template.replace('__DATA_JSON__', json);
fs.writeFileSync(outPath, out, 'utf8');

// 提取应用脚本做语法检查
const appScripts = [...out.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (appScripts.length) {
  const tmp = path.join(root, '.check_app.js');
  fs.writeFileSync(tmp, appScripts[appScripts.length - 1], 'utf8');
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'inherit' });
    console.log('✅ 应用脚本语法检查通过');
  } catch (e) {
    console.error('❌ 应用脚本语法检查失败: ' + (e.message || e));
    process.exitCode = 1;
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

console.log('✅ index.html 已生成: ' + outPath + ' (' + (out.length / 1024).toFixed(1) + ' KB)');
