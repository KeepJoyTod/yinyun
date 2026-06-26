const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const authoritativeTakeoverDoc = readText(path.join(repoRoot, 'docs/00-authoritative-friend-project-takeover-20260609.md'));
const currentExecutionBoardDoc = readText(path.join(repoRoot, 'docs/current-execution-board-20260609.md'));
const mobileReadme = readText(path.join(repoRoot, 'mobile-uniapp/README.md'));
const repoReadme = readText(path.join(repoRoot, 'README.md'));

const combinedDocs = [
  authoritativeTakeoverDoc,
  currentExecutionBoardDoc,
  mobileReadme,
  repoReadme,
].join('\n---\n');

test('friend takeover maps keep production and reference project boundaries explicit', () => {
  assert.match(combinedDocs, /D:\\OtherProject\\CameraApp\\yingyue-cloud-repo/);
  assert.match(combinedDocs, /D:\\OtherProject\\CameraApp\\photoshop-master/);
  assert.match(combinedDocs, /D:\\OtherProject\\CameraApp\\yuyue-main/);
  assert.match(combinedDocs, /正式生产项目|正式开发|正式后台|Production/);
  assert.match(combinedDocs, /参考资产|只用于参考|Reference only|Demo/);
  assert.match(combinedDocs, /不替换正式后台|Do not replace `admin-ui`/);
  assert.match(combinedDocs, /不把 `yuyue-main` 的 Taro 源码替换正式 uni-app|Do not replace `mobile-uniapp`/);
  assert.match(combinedDocs, /不迁移.*MinIO|MinIO.*不进入|Do not migrate demo backend, MinIO/);
  assert.match(combinedDocs, /不.*公共读|Do not make OSS public-read/);
});

test('friend takeover maps pin official API domain and miniapp import outputs', () => {
  assert.match(combinedDocs, /https:\/\/api\.evanshine\.me/);
  assert.match(combinedDocs, /wx2a1a34748f56a6c6/);
  assert.match(combinedDocs, /tta3c8d5753dac3aae01/);
  assert.match(combinedDocs, /mobile-uniapp\\dist\\build\\mp-weixin/);
  assert.match(combinedDocs, /mobile-uniapp\\dist\\build\\mp-toutiao/);
  assert.match(combinedDocs, /request.*uploadFile.*downloadFile|request.*downloadFile.*uploadFile|request、uploadFile、downloadFile|request\/download\/upload/);
  assert.match(combinedDocs, /\/client\/photo\/\*/);
  assert.match(combinedDocs, /DOUYIN_LIFE/);
  assert.match(combinedDocs, /DOUYIN_MINI_APP/);
  assert.match(combinedDocs, /WECHAT_MINI_APP|WECHAT|微信小程序/);
});

test('repo README points maintainers to the authoritative friend takeover entry', () => {
  assert.match(repoReadme, /docs\/00-authoritative-friend-project-takeover-20260609\.md|docs\\00-authoritative-friend-project-takeover-20260609\.md/);
  assert.match(repoReadme, /photoshop-master/);
  assert.match(repoReadme, /yuyue-main/);
  assert.match(repoReadme, /mobile-uniapp/);
  assert.match(repoReadme, /api\.evanshine\.me/);
});

test('authoritative docs keep reference project paths and production targets explicit', () => {
  assert.match(authoritativeTakeoverDoc, /photoshop-master/);
  assert.match(authoritativeTakeoverDoc, /yuyue-main/);
  assert.match(authoritativeTakeoverDoc, /admin-ui/);
  assert.match(authoritativeTakeoverDoc, /mobile-uniapp/);
  assert.ok(fs.existsSync(path.join(repoRoot, 'admin-ui')), 'production admin-ui should exist');
  assert.ok(fs.existsSync(path.join(repoRoot, 'mobile-uniapp')), 'production mobile-uniapp should exist');
});
