import defaultSettings, { APP_TITLE } from '@/settings';
import { useSettingsStore } from '@/store/modules/settings';

/**
 * 动态修改标题
 */
export const useDynamicTitle = () => {
  const settingsStore = useSettingsStore();
  if (settingsStore.dynamicTitle) {
    document.title = settingsStore.title + ' - ' + APP_TITLE;
  } else {
    document.title = defaultSettings.title as string;
  }
};
