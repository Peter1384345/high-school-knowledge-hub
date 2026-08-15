// 验证官方电子课本资源链接可访问性
const urls = [
  ['国家中小学智慧教育平台（教育部官方）', 'https://basic.smartedu.cn/'],
  ['人民教育出版社（人教社官网）', 'https://www.pep.com.cn/'],
  ['人教社·中小学教材（pep 教材频道）', 'https://www.pep.com.cn/jc/'],
];
for (const [name, url] of urls) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const text = await r.text().catch(() => '');
    console.log((r.status === 200 ? '✅' : '⚠️') + ' ' + name + ' → ' + r.status + ' | ' + url + (text.includes('教材') || text.includes('教育') ? ' (内容含教材/教育)' : ''));
  } catch (e) {
    console.log('❌ ' + name + ' → ' + url + ' | ' + e.message);
  }
}
