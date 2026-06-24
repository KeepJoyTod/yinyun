import { ref } from 'vue';
import type { ProductCategory, ProductItem, StoreItem } from '@/types/home';
import { getStoreProducts } from '@/api/home';

export function useStoreProducts() {
  const store = ref<StoreItem | null>(null);
  const categories = ref<ProductCategory[]>([]);
  const products = ref<ProductItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  const activeCategoryId = ref('');

  const filteredProducts = ref<ProductItem[]>([]);

  function filterByCategory(categoryId: string) {
    activeCategoryId.value = categoryId;
    if (!categoryId) {
      filteredProducts.value = products.value;
    } else {
      filteredProducts.value = products.value.filter(
        (p) => p.categoryId === categoryId,
      );
    }
  }

  function formatPrice(price: number): string {
    return `¥${price.toFixed(0)}`;
  }

  function formatOriginalPrice(price?: number): string {
    if (!price) {
      return '';
    }
    return `¥${price.toFixed(0)}`;
  }

  function statusLabel(status?: StoreItem['status'] | string): string {
    const map: Record<string, string> = {
      OPEN: '营业中',
      CLOSED: '休息中',
      PAUSED: '暂停预约',
      HIDDEN: '暂不展示',
    };
    return status ? map[status] || status : '门店状态待确认';
  }

  async function loadStoreProducts(storeId: string) {
    loading.value = true;
    error.value = '';
    activeCategoryId.value = '';
    try {
      const data = await getStoreProducts(storeId);
      store.value = data.store;
      categories.value = data.categories || [];
      products.value = data.products || [];
      filteredProducts.value = products.value;
    } catch (e: any) {
      error.value = e?.message || '加载商品列表失败';
    } finally {
      loading.value = false;
    }
  }

  return {
    store,
    categories,
    products,
    filteredProducts,
    loading,
    error,
    activeCategoryId,
    filterByCategory,
    formatPrice,
    formatOriginalPrice,
    statusLabel,
    loadStoreProducts,
  };
}
