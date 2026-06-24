import { ref } from 'vue';
import type { HomeBanner, HomeCategory, HomeMenuItem } from '@/types/home';
import { getHomeData } from '@/api/home';

export function useHome() {
  const brandName = ref('影约云');
  const brandLogo = ref('');
  const brandSummary = ref('专业摄影预约平台，为您安排门店、套餐与拍摄服务。');
  const banners = ref<HomeBanner[]>([]);
  const categories = ref<HomeCategory[]>([]);
  const menuItems = ref<HomeMenuItem[]>([]);
  const serviceNotice = ref('');
  const loading = ref(false);
  const error = ref('');

  async function loadHome(brandCode: string) {
    loading.value = true;
    error.value = '';
    try {
      const data = await getHomeData(brandCode);
      brandName.value = data.brand?.name || brandName.value;
      brandLogo.value = data.brand?.logo || data.brand?.logoUrl || '';
      brandSummary.value = data.brand?.summary || data.brand?.description || brandSummary.value;
      banners.value = data.banners || [];
      categories.value = data.categories || [];
      menuItems.value = data.menuItems || [];
      serviceNotice.value = data.serviceNotice || '';
    } catch (e: any) {
      error.value = e?.message || '加载首页失败';
    } finally {
      loading.value = false;
    }
  }

  return {
    brandName,
    brandLogo,
    brandSummary,
    banners,
    categories,
    menuItems,
    serviceNotice,
    loading,
    error,
    loadHome,
  };
}
