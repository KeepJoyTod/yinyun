export const ASSET_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待选' },
  { key: 'selected', label: '已选' },
  { key: 'error', label: '异常' },
];

function mapAssetKey(asset) {
  return String(asset?.assetId || '');
}

function normalizeSelectedIds(selectedAssetIds) {
  if (selectedAssetIds instanceof Set) {
    return selectedAssetIds;
  }
  return new Set((Array.isArray(selectedAssetIds) ? selectedAssetIds : []).map((id) => String(id)));
}

export function getAssetFilterKey(asset, selectedAssetIds = [], previewLoadMap = {}) {
  const assetKey = mapAssetKey(asset);
  const selectedSet = normalizeSelectedIds(selectedAssetIds);
  if (previewLoadMap[assetKey] === 'error') {
    return 'error';
  }
  if (selectedSet.has(assetKey)) {
    return 'selected';
  }
  return 'pending';
}

export function countAssetsByFilter(assets = [], selectedAssetIds = [], previewLoadMap = {}) {
  const source = Array.isArray(assets) ? assets : [];
  const selectedSet = normalizeSelectedIds(selectedAssetIds);
  return source.reduce(
    (counts, asset) => {
      const filterKey = getAssetFilterKey(asset, selectedSet, previewLoadMap);
      counts.all += 1;
      counts[filterKey] += 1;
      return counts;
    },
    {
      all: 0,
      pending: 0,
      selected: 0,
      error: 0,
    },
  );
}

export function createAssetFilterItems(assets = [], selectedAssetIds = [], previewLoadMap = {}) {
  const counts = countAssetsByFilter(assets, selectedAssetIds, previewLoadMap);
  return ASSET_FILTERS.map((filter) => ({
    ...filter,
    count: counts[filter.key] || 0,
  }));
}

export function filterAssetsByKey(assets = [], filterKey = 'all', selectedAssetIds = [], previewLoadMap = {}) {
  const source = Array.isArray(assets) ? assets : [];
  const normalizedFilterKey = String(filterKey || 'all');
  if (normalizedFilterKey === 'all') {
    return source;
  }
  const selectedSet = normalizeSelectedIds(selectedAssetIds);
  return source.filter((asset) => getAssetFilterKey(asset, selectedSet, previewLoadMap) === normalizedFilterKey);
}

export function getAssetFilterEmptyCopy(filterKey = 'all') {
  if (filterKey === 'selected') {
    return '还没有选择照片，点照片右上角“选择”即可加入精修清单。';
  }
  if (filterKey === 'error') {
    return '当前没有加载异常的照片。';
  }
  if (filterKey === 'pending') {
    return '当前没有待选择照片。';
  }
  return '当前相册暂无照片。';
}

export function getSelectedSequence(asset, selectedAssetIds = []) {
  const assetKey = mapAssetKey(asset);
  if (!assetKey) {
    return 0;
  }
  const source = Array.isArray(selectedAssetIds) ? selectedAssetIds : Array.from(selectedAssetIds || []);
  const index = source.map((id) => String(id)).indexOf(assetKey);
  return index >= 0 ? index + 1 : 0;
}

export function getSelectionSummary(selectedCount = 0, totalCount = 0, submittedCount = 0, selectionStatus = '') {
  const selected = Math.max(0, Number(selectedCount) || 0);
  const total = Math.max(0, Number(totalCount) || 0);
  const submitted = Math.max(0, Number(submittedCount) || 0);
  const status = String(selectionStatus || '').toUpperCase();
  if (status === 'DELIVERED') {
    return {
      title: `已交付 ${selected || submitted} / ${total} 张`,
      subtitle: '门店已完成本次精修交付，如需调整请联系门店',
      submitted: true,
      status,
    };
  }
  if (status === 'RETOUCHING') {
    return {
      title: `精修中 ${selected || submitted} / ${total} 张`,
      subtitle: '门店正在按这份清单处理照片',
      submitted: true,
      status,
    };
  }
  if (status === 'SUBMITTED' || submitted > 0) {
    return {
      title: `已提交 ${submitted || selected} / ${total} 张`,
      subtitle: '门店会按这份清单安排精修，可继续调整后再次提交',
      submitted: true,
      status: status || 'SUBMITTED',
    };
  }
  if (selected > 0) {
    return {
      title: `已选 ${selected} / ${total} 张`,
      subtitle: '提交后门店会按你的选择安排精修',
      submitted: false,
      status: status || 'DRAFT',
    };
  }
  return {
    title: `已选 0 / ${total} 张`,
    subtitle: '点照片右上角“选择”，按想精修的顺序加入清单',
    submitted: false,
    status: status || 'DRAFT',
  };
}

export function formatSelectionSubmitTime(value = '') {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getSelectionTimelineCopy(selectionStatus = '', lastSelectionSubmitTime = '') {
  const status = String(selectionStatus || '').toUpperCase();
  const formattedTime = formatSelectionSubmitTime(lastSelectionSubmitTime);
  if (formattedTime) {
    if (status === 'RETOUCHING') {
      return `最近提交 ${formattedTime}，门店精修处理中`;
    }
    if (status === 'DELIVERED') {
      return `最近提交 ${formattedTime}，门店已完成交付`;
    }
    return `最近提交 ${formattedTime}`;
  }
  if (status === 'SUBMITTED' || status === 'RETOUCHING' || status === 'DELIVERED') {
    return '已收到选片清单';
  }
  return '';
}

export function isSelectionLocked(selectionStatus = '') {
  return String(selectionStatus || '').toUpperCase() === 'DELIVERED';
}

export function getSelectionActionState(selectionStatus = '', selectedCount = 0, submitting = false) {
  const locked = isSelectionLocked(selectionStatus);
  if (locked) {
    return {
      locked: true,
      disabled: true,
      label: '已交付',
      toast: '相册已完成交付，如需调整请联系门店',
    };
  }
  return {
    locked: false,
    disabled: submitting || Math.max(0, Number(selectedCount) || 0) <= 0,
    label: submitting ? '提交中' : '提交选片',
    toast: '',
  };
}

export function getAssetTileActionState(asset, selectedAssetIds = [], previewLoadMap = {}, selectionStatus = '') {
  const assetKey = mapAssetKey(asset);
  const sequence = getSelectedSequence(asset, selectedAssetIds);
  const selected = normalizeSelectedIds(selectedAssetIds).has(assetKey);
  const state = previewLoadMap[assetKey];

  if (isSelectionLocked(selectionStatus)) {
    return {
      cornerLabel: state === 'error' ? '待重试' : '已交付',
      previewLabel: state === 'error' ? '预览暂不可用' : state === 'loaded' ? '已交付' : '可查看',
      actionLabel: '查看',
      showSequence: false,
      sequence: 0,
      locked: true,
    };
  }

  let cornerLabel = '可预览';
  if (sequence > 0) {
    cornerLabel = `已选 ${sequence}`;
  } else if (selected) {
    cornerLabel = '已选';
  } else if (state === 'error') {
    cornerLabel = '待重试';
  } else if (state === 'loading' || state === 'ready') {
    cornerLabel = '加载中';
  }

  return {
    cornerLabel,
    previewLabel: state === 'loaded' ? (selected ? '已选择' : '可预览') : '',
    actionLabel: selected ? '取消' : '选择',
    showSequence: sequence > 0,
    sequence,
    locked: false,
  };
}

export function getSelectionGuideContent(selectionStatus = '') {
  if (isSelectionLocked(selectionStatus)) {
    return {
      steps: ['打开照片查看大图', '保存需要的交付照片', '如需调整请联系门店'],
      note: '相册已完成交付，选片清单已锁定。',
    };
  }
  return {
    steps: ['先点照片右上角选择', '选择顺序就是精修顺序', '提交后门店会按顺序处理'],
    note: '提交前可以取消重选，提交后如需调整请联系门店确认。',
  };
}

export function getDeliveryNextStep(input = {}) {
  const totalCount = Math.max(0, Number(input.totalCount || 0));
  const selectedCount = Math.max(0, Number(input.selectedCount || 0));
  const submittedCount = Math.max(0, Number(input.submittedCount || 0));
  const previewFailed = Math.max(0, Number(input.previewFailed || 0));
  const status = String(input.selectionStatus || '').toUpperCase();

  if (totalCount <= 0) {
    return {
      tone: 'waiting',
      title: '等待门店上传照片',
      subtitle: '相册入口已经生效，照片开放后会自动显示。',
      action: '刷新状态',
    };
  }

  if (previewFailed > 0) {
    return {
      tone: 'warning',
      title: `有 ${previewFailed} 张照片需要重试`,
      subtitle: '可以切到“异常”分类，进入大图页重新加载。',
      action: '查看异常',
    };
  }

  if (status === 'DELIVERED') {
    return {
      tone: 'delivered',
      title: '照片已完成交付',
      subtitle: '可以继续查看和保存照片，如需调整请联系门店。',
      action: '查看照片',
    };
  }

  if (status === 'RETOUCHING') {
    return {
      tone: 'retouching',
      title: '门店正在精修',
      subtitle: '已收到你的选片清单，完成后会更新交付状态。',
      action: '查看清单',
    };
  }

  if (status === 'SUBMITTED' || submittedCount > 0) {
    return {
      tone: 'submitted',
      title: '选片清单已提交',
      subtitle: '门店会按这份清单安排精修，你也可以继续调整后再次提交。',
      action: '查看清单',
    };
  }

  if (selectedCount > 0) {
    return {
      tone: 'submit',
      title: `还有 ${selectedCount} 张未提交`,
      subtitle: '提交后门店会按这份清单安排精修。',
      action: '提交选片',
    };
  }

  return {
    tone: 'ready',
    title: '可以开始选片',
    subtitle: '点照片右上角“选择”，按想精修的顺序加入清单。',
    action: '选择照片',
  };
}

export default {
  ASSET_FILTERS,
  getAssetFilterKey,
  countAssetsByFilter,
  createAssetFilterItems,
  filterAssetsByKey,
  getAssetFilterEmptyCopy,
  getSelectedSequence,
  getSelectionSummary,
  formatSelectionSubmitTime,
  getSelectionTimelineCopy,
  isSelectionLocked,
  getSelectionActionState,
  getAssetTileActionState,
  getSelectionGuideContent,
  getDeliveryNextStep,
};
