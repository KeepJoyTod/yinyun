const test = require('node:test');
const assert = require('node:assert/strict');

const albumStateModule = import('../src/pages/pickup/albums/album-state.mjs');

test('empty active albums are labeled as waiting for upload', () => {
  return albumStateModule.then(({ getAlbumAvailabilityLabel, getAlbumActionLabel }) => {
    assert.equal(
      getAlbumAvailabilityLabel({ status: 'ACTIVE', assetCount: 0 }),
      '待开放',
    );
    assert.equal(
      getAlbumActionLabel({ status: 'ACTIVE', assetCount: 0 }),
      '查看状态',
    );
  });
});

test('albums with visible assets remain viewable for customers', () => {
  return albumStateModule.then(({ getAlbumAvailabilityLabel, getAlbumActionLabel }) => {
    assert.equal(
      getAlbumAvailabilityLabel({ status: 'ACTIVE', assetCount: 2 }),
      '可查看',
    );
    assert.equal(
      getAlbumActionLabel({ status: 'ACTIVE', assetCount: 2 }),
      '打开相册',
    );
  });
});

test('delivered albums show explicit delivered state in album list', () => {
  return albumStateModule.then(({ getAlbumAvailabilityLabel, getAlbumActionLabel }) => {
    assert.equal(
      getAlbumAvailabilityLabel({ status: 'DELIVERED', assetCount: 2 }),
      '已交付',
    );
    assert.equal(
      getAlbumAvailabilityLabel({ status: 'ACTIVE', selectionStatus: 'DELIVERED', assetCount: 2 }),
      '已交付',
    );
    assert.equal(
      getAlbumActionLabel({ status: 'DELIVERED', assetCount: 2 }),
      '打开相册',
    );
  });
});

test('delivered albums expose final delivery steps for the album list', () => {
  return albumStateModule.then(({ getAlbumDeliverySteps }) => {
    assert.deepEqual(
      getAlbumDeliverySteps({ status: 'ACTIVE', selectionStatus: 'DELIVERED', assetCount: 2 }),
      [
        { title: '相册已建立', copy: '取片码已绑定', active: true },
        { title: '照片已开放', copy: '可预览保存', active: true },
        { title: '已交付', copy: '可查看保存', active: true },
      ],
    );
  });
});

test('expired and disabled album status labels are still explicit', () => {
  return albumStateModule.then(({ getAlbumAvailabilityLabel, getAlbumActionLabel }) => {
    assert.equal(getAlbumAvailabilityLabel({ status: 'EXPIRED', assetCount: 2 }), '已过期');
    assert.equal(getAlbumAvailabilityLabel({ status: 'DISABLED', assetCount: 2 }), '不可用');
    assert.equal(getAlbumActionLabel({ status: 'EXPIRED', assetCount: 2 }), '查看状态');
  });
});

test('album list empty and error states give operator-independent customer actions', () => {
  return albumStateModule.then(({ getAlbumListRecoverySteps }) => {
    assert.deepEqual(
      getAlbumListRecoverySteps({ loadFailed: false }),
      [
        { title: '刷新相册', copy: '门店刚上传照片时，刷新后会自动出现。' },
        { title: '重新登录', copy: '确认手机号和取片码是否来自同一家门店。' },
        { title: '联系门店', copy: '请门店核对手机号、取片码和相册有效期。' },
      ],
    );
    assert.deepEqual(
      getAlbumListRecoverySteps({ loadFailed: true }),
      [
        { title: '重新加载', copy: '网络恢复后重新获取当前手机号的相册。' },
        { title: '重新登录', copy: '取片码过期或输错时，重新输入即可校验。' },
        { title: '联系门店', copy: '请门店确认相册是否已开放给当前手机号。' },
      ],
    );
  });
});
