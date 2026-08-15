// 验证 Unsplash 直链图片可用性（status + content-type + 大小）
const candidates = [
  ['语文-雾山', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=70'],
  ['语文-雾山2', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=70'],
  ['数学-黑板公式', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1600&q=70'],
  ['数学-黑板2', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&q=70'],
  ['英语-图书馆', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=70'],
  ['英语-书架2', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=70'],
  ['物理-银河', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=70'],
  ['物理-极光', 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1600&q=70'],
  ['化学-实验室', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=70'],
  ['化学-试剂2', 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1600&q=70'],
  ['生物-森林', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=70'],
  ['生物-绿叶2', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&q=70'],
  ['首页-书桌', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=70'],
  ['首页-书房2', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=70'],
];
for (const [name, url] of candidates) {
  try {
    const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) });
    const ct = r.headers.get('content-type') || '';
    const len = r.headers.get('content-length') || '?';
    console.log((r.status === 200 && ct.startsWith('image') ? '✅' : '❌') + ' ' + name + ' | ' + r.status + ' | ' + ct + ' | ' + len + 'B');
  } catch (e) {
    console.log('❌ ' + name + ' | ERR ' + e.message);
  }
}
