import { openExternalWebView, openPage } from '@/utils/navigation';

export function navigateByLink(options: {
  linkType?: string;
  linkTarget?: string;
  title?: string;
  hasCategories?: boolean;
}) {
  const { linkType, linkTarget, title, hasCategories } = options;
  switch (linkType) {
    case 'INTERNAL':
      if (linkTarget) openPage(linkTarget);
      break;
    case 'PRODUCT':
      if (linkTarget) openPage(`/pages/product/detail/index?productId=${encodeURIComponent(linkTarget)}`);
      break;
    case 'STORE':
      openPage('/pages/store/list/index');
      break;
    case 'ORDER':
      openPage('/pages/customer/orders/index');
      break;
    case 'NOTICE':
      openPage('/pages/help/shooting-notice/index');
      break;
    case 'WECHAT_SERVICE':
      openPage('/pages/help/contact-service/index');
      break;
    case 'EXTERNAL':
      if (linkTarget) {
        openExternalWebView(linkTarget, title || '外部页面');
      } else {
        uni.showToast({ title: '外部链接未配置', icon: 'none' });
      }
      break;
    case 'SAMPLES':
      if (!hasCategories) {
        uni.showToast({ title: '样片分类待配置', icon: 'none' });
      }
      break;
    default:
      break;
  }
}

export function goStoreList() {
  openPage('/pages/store/list/index');
}

export function goOrderList() {
  openPage('/pages/customer/orders/index');
}
