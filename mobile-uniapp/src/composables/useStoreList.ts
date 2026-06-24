import { ref } from 'vue';
import type { StoreItem, StoreListParams } from '@/types/home';
import { getStoreList } from '@/api/home';

export function useStoreList() {
  const stores = ref<StoreItem[]>([]);
  const loading = ref(false);
  const locating = ref(false);
  const error = ref('');
  const keyword = ref('');
  const locationEnabled = ref(false);
  const locationError = ref('');
  const userLocation = ref<{ lat: number; lng: number } | null>(null);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  function formatDistance(meters?: number): string {
    if (meters === undefined || meters === null) {
      return '';
    }
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  function statusLabel(status: StoreItem['status']): string {
    const map: Record<string, string> = {
      OPEN: '营业中',
      CLOSED: '休息中',
      PAUSED: '暂停预约',
      HIDDEN: '暂不展示',
    };
    return map[status] || status;
  }

  function isStoreOpen(status: StoreItem['status']): boolean {
    return status === 'OPEN';
  }

  function navigateToCall(phone?: string) {
    if (!phone) {
      uni.showToast({ title: '暂无联系电话', icon: 'none' });
      return;
    }
    uni.makePhoneCall({ phoneNumber: phone });
  }

  function navigateToMap(store: StoreItem) {
    if (!store.latitude || !store.longitude) {
      uni.showToast({ title: '暂无位置信息', icon: 'none' });
      return;
    }
    uni.openLocation({
      latitude: store.latitude,
      longitude: store.longitude,
      name: store.name,
      address: store.address,
    });
  }

  function distanceBetweenMeters(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
  ) {
    const earthRadius = 6371000;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const deltaLat = (to.lat - from.lat) * Math.PI / 180;
    const deltaLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(deltaLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function applyDistanceSort() {
    if (!userLocation.value) {
      stores.value = sortByOperation(stores.value);
      return;
    }
    stores.value = stores.value
      .map((store) => {
        if (store.latitude === undefined || store.longitude === undefined) {
          return store;
        }
        return {
          ...store,
          distance: distanceBetweenMeters(userLocation.value as { lat: number; lng: number }, {
            lat: store.latitude,
            lng: store.longitude,
          }),
        };
      })
      .sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) {
          return (a.sort ?? a.sortOrder ?? 0) - (b.sort ?? b.sortOrder ?? 0);
        }
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
  }

  function sortByOperation(items: StoreItem[]) {
    return [...items].sort((a, b) => (a.sort ?? a.sortOrder ?? 0) - (b.sort ?? b.sortOrder ?? 0));
  }

  async function requestLocation(brandCode?: string) {
    if (locating.value) {
      return;
    }
    locating.value = true;
    locationError.value = '';
    try {
      const position = await new Promise<any>((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject,
        });
      });
      userLocation.value = {
        lat: Number(position.latitude),
        lng: Number(position.longitude),
      };
      locationEnabled.value = true;
      await loadStores({
        brandCode,
        keyword: keyword.value || undefined,
        lat: userLocation.value.lat,
        lng: userLocation.value.lng,
      });
    } catch {
      userLocation.value = null;
      locationEnabled.value = false;
      locationError.value = '未授权定位，已按门店推荐顺序展示';
      uni.showToast({ title: locationError.value, icon: 'none' });
      applyDistanceSort();
    } finally {
      locating.value = false;
    }
  }

  async function loadStores(params: StoreListParams = {}) {
    loading.value = true;
    error.value = '';
    try {
      const result = await getStoreList(params);
      stores.value = Array.isArray(result) ? result : [];
      applyDistanceSort();
    } catch (e: any) {
      error.value = e?.message || '加载门店列表失败';
    } finally {
      loading.value = false;
    }
  }

  async function searchStores(brandCode: string, kw?: string) {
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = undefined;
    }
    const trimmed = (kw ?? keyword.value).trim();
    keyword.value = trimmed;
    await loadStores({ brandCode, keyword: trimmed || undefined });
  }

  function searchStoresDebounced(brandCode: string, kw?: string, delay = 200) {
    const nextKeyword = kw ?? keyword.value;
    keyword.value = nextKeyword;
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      void searchStores(brandCode, nextKeyword);
    }, delay);
  }

  return {
    stores,
    loading,
    locating,
    error,
    keyword,
    locationEnabled,
    locationError,
    formatDistance,
    statusLabel,
    isStoreOpen,
    navigateToCall,
    navigateToMap,
    requestLocation,
    loadStores,
    searchStores,
    searchStoresDebounced,
  };
}
