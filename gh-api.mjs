// GitHub API 辅助脚本：create / pages / status / delete
// 用法: GH_TOKEN=<token> node gh-api.mjs <create|pages|status|delete> [repoName]
const cmd = process.argv[2];
const token = process.env.GH_TOKEN;
if (!token) { console.error('❌ GH_TOKEN 未设置'); process.exit(1); }
const owner = process.env.GH_OWNER || 'Peter1384345';
const repo = process.argv[3] || process.env.GH_REPO || 'high-school-knowledge-hub';
const API = 'https://api.github.com';

async function call(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'User-Agent': 'dsh-deploy',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not json */ }
  return { status: r.status, data, text: text.slice(0, 400) };
}

async function main() {
  switch (cmd) {
    case 'create': {
      const r = await call('POST', '/user/repos', {
        name: repo, private: false, auto_init: false,
        description: '高中全科知识库 · 语数英物化生重点难点考点（单文件网页版）',
        homepage: 'https://' + owner + '.github.io/' + repo + '/',
        has_issues: true, has_wiki: false,
      });
      if (r.status === 201) console.log('✅ 仓库已创建: ' + r.data.full_name + ' (' + r.data.html_url + ')');
      else if (r.status === 422) console.log('⚠️ 仓库可能已存在: ' + JSON.stringify(r.data && r.data.errors ? r.data.errors.map(e => e.message) : r.text));
      else { console.log('❌ 创建失败 [' + r.status + ']: ' + r.text); process.exit(1); }
      break;
    }
    case 'pages': {
      const r = await call('POST', '/repos/' + owner + '/' + repo + '/pages', {
        build_type: 'legacy', source: { branch: 'main', path: '/' },
      });
      if (r.status === 201 || r.status === 200) console.log('✅ Pages 已启用: https://' + owner + '.github.io/' + repo + '/');
      else if (r.status === 409) console.log('⚠️ Pages 状态冲突（可能已启用）: ' + r.text);
      else { console.log('❌ 启用 Pages 失败 [' + r.status + ']: ' + r.text); process.exit(1); }
      break;
    }
    case 'status': {
      const r = await call('GET', '/repos/' + owner + '/' + repo + '/pages');
      if (r.status === 200) {
        const d = r.data;
        console.log('Pages 状态: ' + (d.status || 'unknown'));
        console.log('站点地址: ' + (d.html_url || ''));
        if (d.source) console.log('构建分支: ' + d.source.branch + d.source.path);
      } else console.log('❌ 获取 Pages 状态失败 [' + r.status + ']: ' + r.text);
      break;
    }
    case 'delete': {
      const r = await call('DELETE', '/repos/' + owner + '/' + repo);
      if (r.status === 204) console.log('✅ 仓库已删除');
      else console.log('❌ 删除失败 [' + r.status + ']: ' + r.text);
      break;
    }
    default:
      console.error('未知命令: ' + cmd);
      process.exit(1);
  }
}
main().catch((e) => { console.error('❌ 脚本异常: ' + e.message); process.exit(1); });
