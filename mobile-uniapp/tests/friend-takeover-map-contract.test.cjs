const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const workspaceRoot = path.resolve(repoRoot, '..');
const desktopYiyue = 'C:\\Users\\Administrator\\Desktop\\yiyue';

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

test('friend takeover maps keep production and reference project boundaries explicit', () => {
  const repoMap = readText(path.join(repoRoot, 'docs/00-authoritative-friend-project-takeover-20260609.md'));
  const desktopMap = readText(path.join(desktopYiyue, '00-权威入口-朋友项目接手与优化规划.md'));
  const frontendMap = readText(path.join(desktopYiyue, '前端优化/00-权威入口-前端优化地图与计划.md'));
  const miniappMap = readText(path.join(desktopYiyue, '抖音小程序/00-权威入口-抖音小程序地图与计划.md'));
  const combined = [repoMap, desktopMap, frontendMap, miniappMap].join('\n---\n');

  assert.match(combined, /D:\\OtherProject\\CameraApp\\yingyue-cloud-repo/);
  assert.match(combined, /D:\\OtherProject\\CameraApp\\photoshop-master/);
  assert.match(combined, /D:\\OtherProject\\CameraApp\\yuyue-main/);
  assert.match(combined, /正式生产项目|正式开发|正式后台|Production/);
  assert.match(combined, /参考资产|只用于参考|Reference only|Demo/);
  assert.match(combined, /不替换正式后台|Do not replace `admin-ui`/);
  assert.match(combined, /不把 `yuyue-main` 的 Taro 源码替换正式 uni-app|Do not replace `mobile-uniapp`/);
  assert.match(combined, /不迁移.*MinIO|MinIO.*不进入|Do not migrate demo backend, MinIO/);
  assert.match(combined, /不.*公共读|Do not make OSS public-read/);
});

test('friend takeover maps pin official API domain and miniapp import outputs', () => {
  const repoMap = readText(path.join(repoRoot, 'docs/00-authoritative-friend-project-takeover-20260609.md'));
  const desktopMap = readText(path.join(desktopYiyue, '00-权威入口-朋友项目接手与优化规划.md'));
  const miniappMap = readText(path.join(desktopYiyue, '抖音小程序/00-权威入口-抖音小程序地图与计划.md'));
  const combined = [repoMap, desktopMap, miniappMap].join('\n---\n');

  assert.match(combined, /https:\/\/api\.evanshine\.me/);
  assert.match(combined, /wx2a1a34748f56a6c6/);
  assert.match(combined, /tta3c8d5753dac3aae01/);
  assert.match(combined, /mobile-uniapp\\dist\\build\\mp-weixin/);
  assert.match(combined, /mobile-uniapp\\dist\\build\\mp-toutiao/);
  assert.match(combined, /request.*uploadFile.*downloadFile|request、uploadFile、downloadFile/);
  assert.match(combined, /\/client\/photo\/\*/);
  assert.match(combined, /DOUYIN_LIFE/);
  assert.match(combined, /DOUYIN_MINI_APP/);
  assert.match(combined, /WECHAT_MINI_APP/);
});

test('repo README points maintainers to the authoritative friend takeover entry', () => {
  const readme = readText(path.join(repoRoot, 'README.md'));

  assert.match(readme, /docs\/00-authoritative-friend-project-takeover-20260609\.md|docs\\00-authoritative-friend-project-takeover-20260609\.md/);
  assert.match(readme, /photoshop-master/);
  assert.match(readme, /yuyue-main/);
  assert.match(readme, /mobile-uniapp/);
  assert.match(readme, /api\.evanshine\.me/);
});

test('reference project folders exist beside the production repo for map verification', () => {
  assert.ok(fs.existsSync(path.join(workspaceRoot, 'photoshop-master')), 'photoshop-master reference folder should exist');
  assert.ok(fs.existsSync(path.join(workspaceRoot, 'yuyue-main')), 'yuyue-main reference folder should exist');
  assert.ok(fs.existsSync(path.join(repoRoot, 'admin-ui')), 'production admin-ui should exist');
  assert.ok(fs.existsSync(path.join(repoRoot, 'mobile-uniapp')), 'production mobile-uniapp should exist');
});
