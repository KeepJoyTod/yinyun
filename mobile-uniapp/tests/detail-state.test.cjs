const test = require('node:test');
const assert = require('node:assert/strict');

const detailStateModule = import('../src/pages/pickup/detail/detail-state.mjs');

test('detail asset filters count selected pending and error photos', () => {
  return detailStateModule.then(({ countAssetsByFilter, createAssetFilterItems }) => {
    const assets = [{ assetId: 'a' }, { assetId: 'b' }, { assetId: 'c' }, { assetId: 'd' }];
    const counts = countAssetsByFilter(assets, ['b'], {
      c: 'error',
      d: 'loading',
    });

    assert.deepEqual(counts, {
      all: 4,
      pending: 2,
      selected: 1,
      error: 1,
    });
    assert.deepEqual(
      createAssetFilterItems(assets, ['b'], { c: 'error' }).map((item) => [item.key, item.label, item.count]),
      [
        ['all', '全部', 4],
        ['pending', '待选', 2],
        ['selected', '已选', 1],
        ['error', '异常', 1],
      ],
    );
  });
});

test('detail asset filters return scoped asset lists', () => {
  return detailStateModule.then(({ filterAssetsByKey }) => {
    const assets = [{ assetId: 'a' }, { assetId: 'b' }, { assetId: 'c' }];

    assert.deepEqual(filterAssetsByKey(assets, 'all', ['b'], { c: 'error' }).map((asset) => asset.assetId), ['a', 'b', 'c']);
    assert.deepEqual(filterAssetsByKey(assets, 'pending', ['b'], { c: 'error' }).map((asset) => asset.assetId), ['a']);
    assert.deepEqual(filterAssetsByKey(assets, 'selected', ['b'], { c: 'error' }).map((asset) => asset.assetId), ['b']);
    assert.deepEqual(filterAssetsByKey(assets, 'error', ['b'], { c: 'error' }).map((asset) => asset.assetId), ['c']);
  });
});

test('detail asset filter empty copy gives customer next step', () => {
  return detailStateModule.then(({ getAssetFilterEmptyCopy }) => {
    assert.match(getAssetFilterEmptyCopy('selected'), /还没有选择照片/);
    assert.match(getAssetFilterEmptyCopy('error'), /没有加载异常/);
    assert.match(getAssetFilterEmptyCopy('pending'), /没有待选择照片/);
  });
});

test('detail selection sequence follows the customer selected order', () => {
  return detailStateModule.then(({ getSelectedSequence }) => {
    assert.equal(getSelectedSequence({ assetId: 'a' }, ['b', 'a', 'c']), 2);
    assert.equal(getSelectedSequence({ assetId: 'c' }, new Set(['b', 'a', 'c'])), 3);
    assert.equal(getSelectedSequence({ assetId: 'x' }, ['b', 'a', 'c']), 0);
  });
});

test('detail selection summary reflects draft and submitted states', () => {
  return detailStateModule.then(({ getSelectionSummary }) => {
    assert.deepEqual(getSelectionSummary(0, 8), {
      title: '已选 0 / 8 张',
      subtitle: '点照片右上角“选择”，按想精修的顺序加入清单',
      submitted: false,
      status: 'DRAFT',
    });
    assert.deepEqual(getSelectionSummary(3, 8), {
      title: '已选 3 / 8 张',
      subtitle: '提交后门店会按你的选择安排精修',
      submitted: false,
      status: 'DRAFT',
    });
    assert.deepEqual(getSelectionSummary(3, 8, 3), {
      title: '已提交 3 / 8 张',
      subtitle: '门店会按这份清单安排精修，可继续调整后再次提交',
      submitted: true,
      status: 'SUBMITTED',
    });
    assert.deepEqual(getSelectionSummary(3, 8, 0, 'SUBMITTED'), {
      title: '已提交 3 / 8 张',
      subtitle: '门店会按这份清单安排精修，可继续调整后再次提交',
      submitted: true,
      status: 'SUBMITTED',
    });
  });
});

test('detail selection summary can show backend delivery workflow states', () => {
  return detailStateModule.then(({ getSelectionSummary }) => {
    assert.deepEqual(getSelectionSummary(3, 8, 0, 'RETOUCHING'), {
      title: '精修中 3 / 8 张',
      subtitle: '门店正在按这份清单处理照片',
      submitted: true,
      status: 'RETOUCHING',
    });
    assert.deepEqual(getSelectionSummary(3, 8, 0, 'DELIVERED'), {
      title: '已交付 3 / 8 张',
      subtitle: '门店已完成本次精修交付，如需调整请联系门店',
      submitted: true,
      status: 'DELIVERED',
    });
  });
});

test('detail selection timeline copy formats backend submit time', () => {
  return detailStateModule.then(({ formatSelectionSubmitTime, getSelectionTimelineCopy }) => {
    assert.equal(formatSelectionSubmitTime('2026-06-09T02:30:00Z'), '2026-06-09 10:30');
    assert.equal(getSelectionTimelineCopy('SUBMITTED', '2026-06-09T02:30:00Z'), '最近提交 2026-06-09 10:30');
    assert.equal(getSelectionTimelineCopy('RETOUCHING', '2026-06-09T02:30:00Z'), '最近提交 2026-06-09 10:30，门店精修处理中');
    assert.equal(getSelectionTimelineCopy('DELIVERED', '2026-06-09T02:30:00Z'), '最近提交 2026-06-09 10:30，门店已完成交付');
    assert.equal(getSelectionTimelineCopy('DRAFT', ''), '');
  });
});

test('detail delivery next step gives customer an actionable state', () => {
  return detailStateModule.then(({ getDeliveryNextStep }) => {
    assert.deepEqual(getDeliveryNextStep({ totalCount: 0 }), {
      tone: 'waiting',
      title: '等待门店上传照片',
      subtitle: '相册入口已经生效，照片开放后会自动显示。',
      action: '刷新状态',
    });

    assert.deepEqual(getDeliveryNextStep({ totalCount: 6, selectedCount: 0, previewFailed: 0 }), {
      tone: 'ready',
      title: '可以开始选片',
      subtitle: '点照片右上角“选择”，按想精修的顺序加入清单。',
      action: '选择照片',
    });

    assert.deepEqual(getDeliveryNextStep({ totalCount: 6, selectedCount: 2, submittedCount: 0 }), {
      tone: 'submit',
      title: '还有 2 张未提交',
      subtitle: '提交后门店会按这份清单安排精修。',
      action: '提交选片',
    });

    assert.deepEqual(getDeliveryNextStep({ totalCount: 6, selectedCount: 2, submittedCount: 2, selectionStatus: 'RETOUCHING' }), {
      tone: 'retouching',
      title: '门店正在精修',
      subtitle: '已收到你的选片清单，完成后会更新交付状态。',
      action: '查看清单',
    });

    assert.deepEqual(getDeliveryNextStep({ totalCount: 6, selectedCount: 2, submittedCount: 2, previewFailed: 1 }), {
      tone: 'warning',
      title: '有 1 张照片需要重试',
      subtitle: '可以切到“异常”分类，进入大图页重新加载。',
      action: '查看异常',
    });
  });
});

test('detail selection action is locked after delivery', () => {
  return detailStateModule.then(({ getSelectionActionState, isSelectionLocked }) => {
    assert.equal(isSelectionLocked('DELIVERED'), true);
    assert.equal(isSelectionLocked('SUBMITTED'), false);
    assert.deepEqual(getSelectionActionState('DELIVERED', 2, false), {
      locked: true,
      disabled: true,
      label: '已交付',
      toast: '相册已完成交付，如需调整请联系门店',
    });
    assert.deepEqual(getSelectionActionState('DRAFT', 0, false), {
      locked: false,
      disabled: true,
      label: '提交选片',
      toast: '',
    });
    assert.deepEqual(getSelectionActionState('DRAFT', 2, true), {
      locked: false,
      disabled: true,
      label: '提交中',
      toast: '',
    });
  });
});

test('detail asset tile uses delivery language after album is delivered', () => {
  return detailStateModule.then(({ getAssetTileActionState }) => {
    assert.deepEqual(getAssetTileActionState({ assetId: 'a' }, ['a'], { a: 'loaded' }, 'DELIVERED'), {
      cornerLabel: '已交付',
      previewLabel: '已交付',
      actionLabel: '查看',
      showSequence: false,
      sequence: 0,
      locked: true,
    });
    assert.deepEqual(getAssetTileActionState({ assetId: 'a' }, ['a'], { a: 'loaded' }, 'DRAFT'), {
      cornerLabel: '已选 1',
      previewLabel: '已选择',
      actionLabel: '取消',
      showSequence: true,
      sequence: 1,
      locked: false,
    });
  });
});

test('detail selection guide switches to delivery guide after album is delivered', () => {
  return detailStateModule.then(({ getSelectionGuideContent }) => {
    assert.deepEqual(getSelectionGuideContent('DELIVERED'), {
      steps: ['打开照片查看大图', '保存需要的交付照片', '如需调整请联系门店'],
      note: '相册已完成交付，选片清单已锁定。',
    });
    assert.deepEqual(getSelectionGuideContent('DRAFT'), {
      steps: ['先点照片右上角选择', '选择顺序就是精修顺序', '提交后门店会按顺序处理'],
      note: '提交前可以取消重选，提交后如需调整请联系门店确认。',
    });
  });
});
