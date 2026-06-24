const TAB_PAGE_PATHS = new Set([
  '/pages/home/index',
  '/pages/store/list/index',
  '/pages/customer/orders/index',
  '/pages/pickup/albums/index',
  '/pages/my/index',
]);

export function isTabPageUrl(url: string): boolean {
  const path = String(url || '').split('?')[0];
  return TAB_PAGE_PATHS.has(path);
}

export function openPage(url: string) {
  if (isTabPageUrl(url)) {
    uni.switchTab({ url: url.split('?')[0] });
    return;
  }
  uni.navigateTo({ url });
}

export function openExternalWebView(url: string, title = '外部页面') {
  const target = String(url || '').trim();
  if (!/^https?:\/\//i.test(target)) {
    uni.showToast({ title: '外部链接未配置', icon: 'none' });
    return;
  }
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent(target)}&title=${encodeURIComponent(title)}`,
  });
}

export function replacePage(url: string) {
  if (isTabPageUrl(url)) {
    uni.switchTab({ url: url.split('?')[0] });
    return;
  }
  uni.redirectTo({ url });
}
