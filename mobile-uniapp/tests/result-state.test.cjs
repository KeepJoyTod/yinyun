const test = require('node:test');
const assert = require('node:assert/strict');

const resultStateModule = import('../src/pages/pickup/result/result-state.mjs');

test('result state normalizes unknown types to info', () => {
  return resultStateModule.then(({ normalizeResultType }) => {
    assert.equal(normalizeResultType('error'), 'error');
    assert.equal(normalizeResultType('warning'), 'warning');
    assert.equal(normalizeResultType('success'), 'info');
    assert.equal(normalizeResultType(''), 'info');
  });
});

test('result state gives actionable error diagnostics', () => {
  return resultStateModule.then(({ getResultStatusConfig }) => {
    const config = getResultStatusConfig('error');
    assert.equal(config.title, '操作失败');
    assert.equal(config.buttonLabel, '返回重试');
    assert.match(config.reason, /取片信息可能已过期/);
    assert.deepEqual(config.nextSteps, ['重新输入手机号和取片码', '确认取片码没有多输空格', '仍然失败时联系门店核对相册状态']);
  });
});

test('result state gives warning and info next steps', () => {
  return resultStateModule.then(({ getResultStatusConfig }) => {
    const warning = getResultStatusConfig('warning');
    assert.equal(warning.title, '需要处理');
    assert.match(warning.reason, /照片可能仍在上传/);
    assert.deepEqual(warning.nextSteps, ['先返回相册目录查看已有照片', '稍后刷新目录等待门店上传完成', '需要加急时联系门店确认交付时间']);

    const info = getResultStatusConfig('info');
    assert.equal(info.title, '操作成功');
    assert.match(info.reason, /身份校验已完成/);
    assert.deepEqual(info.nextSteps, ['进入相册列表', '打开照片目录', '预览或保存已开放照片']);
  });
});

test('result redirect sends errors to login and non-errors back to albums or redirect', () => {
  return resultStateModule.then(({ getResultRedirectUrl }) => {
    assert.equal(
      getResultRedirectUrl('error', '/pages/pickup/detail/index?albumId=1'),
      '/pages/pickup/login/index?redirect=%2Fpages%2Fpickup%2Fdetail%2Findex%3FalbumId%3D1',
    );
    assert.equal(getResultRedirectUrl('warning', '/pages/pickup/detail/index?albumId=1'), '/pages/pickup/detail/index?albumId=1');
    assert.equal(getResultRedirectUrl('info', ''), '/pages/pickup/albums/index');
  });
});

test('result redirect sanitizes unsafe error redirect targets', () => {
  return resultStateModule.then(({ getResultRedirectUrl }) => {
    assert.equal(getResultRedirectUrl('error', 'https://evil.example/steal'), '/pages/pickup/login/index');
    assert.equal(getResultRedirectUrl('error', '/pages/pickup/login/index?redirect=/pages/pickup/detail/index'), '/pages/pickup/login/index');
    assert.equal(getResultRedirectUrl('error', '/pages/order/index'), '/pages/pickup/login/index');
  });
});
