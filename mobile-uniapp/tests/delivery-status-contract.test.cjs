const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(repoRoot, 'tools/get-yingyue-delivery-status.ps1');

test('project delivery status script aggregates platform readiness and pickup release gate', () => {
  assert.ok(fs.existsSync(scriptPath), 'delivery status script should exist');
  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /yingyue-platform-readiness\.ps1/);
  assert.match(script, /get-photo-pickup-release-status\.ps1/);
  assert.match(script, /admin-ui\/dist\/index\.html|admin-ui\\dist\\index\.html/);
  assert.match(script, /client-web\/dist\/index\.html|client-web\\dist\\index\.html/);
  assert.match(script, /studio-workbench\/dist\/index\.html|studio-workbench\\dist\\index\.html/);
  assert.match(script, /mobile-uniapp\/dist\/build\/h5\/index\.html|mobile-uniapp\\dist\\build\\h5\\index\.html/);
  assert.match(script, /mobile-uniapp\/dist\/build\/mp-weixin\/project\.config\.json|mobile-uniapp\\dist\\build\\mp-weixin\\project\.config\.json/);
  assert.match(script, /mobile-uniapp\/dist\/build\/mp-toutiao\/project\.config\.json|mobile-uniapp\\dist\\build\\mp-toutiao\\project\.config\.json/);
  assert.match(script, /READY_FOR_EXTERNAL_ACCEPTANCE/);
  assert.match(script, /BLOCKED/);
  assert.match(script, /微信小程序合法域名已由用户确认完成/);
  assert.match(script, /抖音小程序合法域名已由用户确认完成/);
  assert.match(script, /发券 SPI logid/);
  assert.match(script, /print-miniapp-acceptance-handoff\.ps1/);
  assert.match(script, /verify-photo-pickup-release-gate\.ps1 -AsJson/);
  assert.match(script, /Get-FilteredGitStatus/);
  assert.match(script, /OutputJsonPath/);
});

test('project delivery status script isolates child script execution and reads evidence as UTF8', () => {
  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /pwsh|powershell/);
  assert.match(script, /-NoProfile/);
  assert.match(script, /-ExecutionPolicy/);
  assert.match(script, /-File/);
  assert.doesNotMatch(script, /$output = & \$ScriptPath @Parameters \*>\&1/m);
  assert.match(script, /Get-Content\s+-LiteralPath\s+\$douyinLifeEvidence\.FullName\s+-Raw\s+-Encoding\s+UTF8/);
});

test('project delivery status script returns machine-readable blocked JSON for empty evidence', () => {
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-delivery-empty-evidence-'));
  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-SkipNetwork',
    '-SkipGithub',
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'empty evidence should block delivery');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.checks.some((check) => check.name === 'photo-pickup-release' && check.status === 'FAIL'));
  assert.ok(report.externalBlockers.some((item) => item.includes('客户取片最终验收缺失')));
  assert.ok(report.nextCommands.includes('.\\tools\\print-miniapp-acceptance-handoff.ps1'));
  assert.ok(report.nextCommands.includes('.\\tools\\verify-photo-pickup-release-gate.ps1 -AsJson'));
});

test('project delivery status script reads platform readiness and pickup release status correctly', () => {
  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SkipNetwork',
    '-SkipGithub',
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  const platformCheck = report.checks.find((check) => check.name === 'platform-readiness');
  const pickupCheck = report.checks.find((check) => check.name === 'photo-pickup-release');

  assert.equal(report.status, 'READY_FOR_EXTERNAL_ACCEPTANCE');
  assert.equal(platformCheck.status, 'PASS');
  assert.equal(pickupCheck.status, 'PASS');
});
