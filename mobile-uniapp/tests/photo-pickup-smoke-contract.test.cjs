const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');

test('photo pickup smoke verifies thumbnail signed url before original preview and download', () => {
  const smokeScript = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-smoke.ps1'), 'utf8');

  const thumbnailIndex = smokeScript.indexOf('/thumbnail-url');
  const previewIndex = smokeScript.indexOf('/preview-url');
  const downloadIndex = smokeScript.indexOf('/download-url');

  assert.ok(thumbnailIndex > 0, 'smoke script should call thumbnail-url');
  assert.ok(previewIndex > thumbnailIndex, 'thumbnail-url should be verified before preview-url');
  assert.ok(downloadIndex > previewIndex, 'download-url should still be verified after preview-url');
  assert.match(smokeScript, /Assert-SignedUrl\s+-SignedUrl\s+\$thumbnail\s+-Name\s+'thumbnail-url'/);
  assert.match(smokeScript, /thumbnail-url:\s+success/);
});

test('photo pickup smoke can verify private OSS bare object is blocked', () => {
  const smokeScript = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-smoke.ps1'), 'utf8');

  assert.match(smokeScript, /\[string\]\$BareOssUrl/);
  assert.match(smokeScript, /\[switch\]\$VerifyBareOssBlocked/);
  assert.match(smokeScript, /function\s+Assert-BareOssBlocked/);
  assert.match(smokeScript, /function\s+Test-AliyunOssBareObjectUrl/);
  assert.match(smokeScript, /expected 403 for private OSS object/);
  assert.match(smokeScript, /BareOssUrl looks like a signed URL/);
  assert.match(smokeScript, /BareOssUrl is not an HTTPS Aliyun OSS object URL/);
  assert.match(smokeScript, /bare-oss:\s+blocked status=403/);
});

test('production preflight passes private OSS verification options into photo smoke', () => {
  const preflightScript = fs.readFileSync(path.join(repoRoot, 'tools/yingyue-production-preflight.ps1'), 'utf8');

  assert.match(preflightScript, /\[string\]\$BareOssUrl/);
  assert.match(preflightScript, /\[switch\]\$VerifyBareOssBlocked/);
  assert.match(preflightScript, /\$smokeArgs\.BareOssUrl\s*=\s*\$BareOssUrl/);
  assert.match(preflightScript, /\$smokeArgs\.VerifyBareOssBlocked\s*=\s*\$true/);
});

test('photo pickup smoke warns when public api is tested with local demo defaults', () => {
  const smokeScript = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-smoke.ps1'), 'utf8');

  assert.match(smokeScript, /api\.evanshine\.me/);
  assert.match(smokeScript, /local demo account defaults/);
  assert.match(smokeScript, /13900001111/);
  assert.match(smokeScript, /PREVIEW-20260608/);
  assert.match(smokeScript, /-AllowEmptyAlbum -SkipStream/);
});

test('photo pickup smoke has a preview account shortcut for public empty-album checks', () => {
  const smokeScript = fs.readFileSync(path.join(repoRoot, 'tools/photo-pickup-smoke.ps1'), 'utf8');

  assert.match(smokeScript, /\[switch\]\$PreviewAccount/);
  assert.doesNotMatch(smokeScript, /\[Parameter\(Mandatory = \$true\)\]\s*\[string\]\$Phone/);
  assert.doesNotMatch(smokeScript, /\[Parameter\(Mandatory = \$true\)\]\s*\[string\]\$AccessCode/);
  assert.match(smokeScript, /\$Phone\s*=\s*'13900001111'/);
  assert.match(smokeScript, /\$AccessCode\s*=\s*'PREVIEW-20260608'/);
  assert.match(smokeScript, /\$AllowEmptyAlbum\s*=\s*\$true/);
  assert.match(smokeScript, /\$SkipStream\s*=\s*\$true/);
  assert.match(smokeScript, /\$photoSmokeMode\s*=\s*'preview-empty'/);
  assert.match(smokeScript, /photo smoke mode: \$photoSmokeMode/);
  assert.match(smokeScript, /Phone is required unless -PreviewAccount is used/);
});
