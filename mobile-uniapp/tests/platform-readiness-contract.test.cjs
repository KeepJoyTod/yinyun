const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');

test('platform readiness verifies miniapp build output files and project appids', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/yingyue-platform-readiness.ps1'), 'utf8');

  assert.match(script, /function\s+Test-RequiredDistFiles/);
  assert.match(script, /function\s+Test-MiniappProjectConfig/);
  assert.match(script, /douyin-miniapp-dist-files/);
  assert.match(script, /wechat-miniapp-dist-files/);
  assert.match(script, /douyin-miniapp-project-config/);
  assert.match(script, /wechat-miniapp-project-config/);
  assert.match(script, /app\.ttss/);
  assert.match(script, /app\.wxss/);
  assert.match(script, /project\.config\.json appid matches manifest/);
});

test('platform readiness prints devtools import paths and legal domain fill values', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/yingyue-platform-readiness.ps1'), 'utf8');

  assert.match(script, /WeChat devtools import:/);
  assert.match(script, /Douyin devtools import:/);
  assert.match(script, /WeChat legal domains: request=\$Root; uploadFile=\$Root; downloadFile=\$Root/);
  assert.match(script, /Douyin legal domains: request=\$Root; uploadFile=\$Root; downloadFile=\$Root/);
});

test('local acceptance runs platform readiness after miniapp builds', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-local-acceptance.ps1'), 'utf8');

  assert.match(script, /\[switch\]\$SkipPlatformReadiness/);
  assert.match(script, /tools\/yingyue-platform-readiness\.ps1|tools\\yingyue-platform-readiness\.ps1|yingyue-platform-readiness\.ps1/);
  assert.match(script, /platform readiness local checks/);
  assert.match(script, /-SkipNetwork\s+-SkipGithub/);

  const wechatBuildIndex = script.indexOf("Invoke-Step 'mobile WeChat mini build'");
  const douyinBuildIndex = script.indexOf("Invoke-Step 'mobile Douyin mini build'");
  const readinessIndex = script.indexOf("Invoke-Step 'platform readiness local checks'");
  assert.ok(wechatBuildIndex > 0, 'WeChat build step should exist');
  assert.ok(douyinBuildIndex > wechatBuildIndex, 'Douyin build should run after WeChat build');
  assert.ok(readinessIndex > douyinBuildIndex, 'platform readiness should run after miniapp builds');
});

test('local acceptance includes admin album management checks', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-local-acceptance.ps1'), 'utf8');

  assert.match(script, /\$adminRoot\s*=\s*Join-Path\s+\$repoRoot\s+'admin-ui'/);
  assert.match(script, /\[switch\]\$SkipAdminCheck/);
  assert.match(script, /\[switch\]\$SkipAdminBuild/);
  assert.match(script, /function\s+Invoke-AdminNpm/);
  assert.match(script, /admin yy tests/);
  assert.match(script, /Invoke-AdminNpm\s+'test:yy'/);
  assert.match(script, /admin dev build/);
  assert.match(script, /Invoke-AdminNpm\s+'build:dev'/);

  const readinessIndex = script.indexOf("Invoke-Step 'platform readiness local checks'");
  const adminTestIndex = script.indexOf("Invoke-Step 'admin yy tests'");
  const adminBuildIndex = script.indexOf("Invoke-Step 'admin dev build'");
  assert.ok(adminTestIndex > readinessIndex, 'admin tests should run after platform readiness');
  assert.ok(adminBuildIndex > adminTestIndex, 'admin build should run after admin tests');
});

test('miniapp acceptance handoff prints exact external verification checklist', () => {
  const scriptPath = path.join(repoRoot, 'tools/print-miniapp-acceptance-handoff.ps1');
  assert.ok(fs.existsSync(scriptPath), 'miniapp acceptance handoff script should exist');
  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /mp-weixin/);
  assert.match(script, /mp-toutiao/);
  assert.match(script, /wx2a1a34748f56a6c6/);
  assert.match(script, /tta3c8d5753dac3aae01/);
  assert.match(script, /https:\/\/api\.evanshine\.me/);
  assert.match(script, /13900001111/);
  assert.match(script, /PREVIEW-20260608/);
  assert.match(script, /ConfirmWechatMiniapp/);
  assert.match(script, /ConfirmDouyinMiniapp/);
  assert.match(script, /WeChat DevTools/);
  assert.match(script, /Douyin DevTools/);
  assert.match(script, /developer-tools-detected/);
});

test('latest miniapp handoff evidence records only remaining external blockers', () => {
  const evidencePath = path.join(repoRoot, 'docs/evidence/miniapp-acceptance-handoff-20260611.md');
  assert.ok(fs.existsSync(evidencePath), 'miniapp handoff evidence should exist');
  const evidence = fs.readFileSync(evidencePath, 'utf8');

  assert.match(evidence, /微信小程序/);
  assert.match(evidence, /抖音小程序/);
  assert.match(evidence, /D:\\OtherProject\\CameraApp\\yingyue-cloud-repo\\mobile-uniapp\\dist\\build\\mp-weixin/);
  assert.match(evidence, /D:\\OtherProject\\CameraApp\\yingyue-cloud-repo\\mobile-uniapp\\dist\\build\\mp-toutiao/);
  assert.match(evidence, /request\/uploadFile\/downloadFile/);
  assert.match(evidence, /https:\/\/api\.evanshine\.me/);
  assert.match(evidence, /13900001111 \/ PREVIEW-20260608/);
  assert.match(evidence, /ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit/);
  assert.match(evidence, /本机未检测到微信开发者工具或抖音开发者工具/);
});
