const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');

test('real OSS evidence generator captures production photo pickup acceptance gates', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/new-photo-pickup-real-oss-evidence.ps1'), 'utf8');

  assert.match(script, /yingyue-production-preflight\.ps1/);
  assert.match(script, /-VerifyBareOssBlocked/);
  assert.match(script, /bare-oss: blocked status=403/);
  assert.match(script, /photo-pickup-local-acceptance\.ps1/);
  assert.match(script, /mobile-uniapp\/dist\/build\/mp-weixin|mobile-uniapp\\dist\\build\\mp-weixin/);
  assert.match(script, /mobile-uniapp\/dist\/build\/mp-toutiao|mobile-uniapp\\dist\\build\\mp-toutiao/);
  assert.match(script, /request 合法域名/);
  assert.match(script, /uploadFile 合法域名/);
  assert.match(script, /downloadFile 合法域名/);
  assert.match(script, /后台审计/);
  assert.match(script, /\[switch\]\$RunPreflight/);
  assert.match(script, /\[switch\]\$RunLocalAcceptance/);
  assert.match(script, /\[switch\]\$PrintRequiredInputs/);
  assert.match(script, /\[switch\]\$AutoResolve/);
  assert.match(script, /function\s+Resolve-AutoEvidenceInputs/);
  assert.match(script, /\/client\/photo\/auth\/verify/);
  assert.match(script, /\/client\/photo\/albums/);
  assert.match(script, /\/client\/photo\/assets\/\$assetPathId\/preview-url/);
  assert.match(script, /function\s+Get-FirstObjectPropertyValue/);
  assert.match(script, /-Names\s+@\('albumId',\s*'id'\)/);
  assert.match(script, /-Names\s+@\('assetId',\s*'id'\)/);
  assert.match(script, /auto-resolve failed: accessible albums returned but no album id field was found/);
  assert.match(script, /auto-resolve failed: accessible albums were found but no album has visible assets/);
  assert.match(script, /\$albumsWithId\s+-gt\s+0\s+-and\s+\$albumsWithoutAssets\s+-eq\s+\$albumsWithId/);
  assert.match(script, /auto-resolve failed: selected album has no visible assets/);
  assert.match(script, /ConvertTo-ObjectKeyFromBareUrl/);
  assert.match(script, /自动解析模式/);
  assert.match(script, /-AutoResolve -RunPreflight -RunLocalAcceptance/);
  assert.match(script, /if\s*\(\$AutoResolve\)\s*\{/);
  assert.match(script, /auto-resolve: albumId=/);
  assert.match(script, /\[switch\]\$ConfirmH5Pickup/);
  assert.match(script, /\[switch\]\$ConfirmWechatMiniapp/);
  assert.match(script, /\[switch\]\$ConfirmDouyinMiniapp/);
  assert.match(script, /\[switch\]\$ConfirmAdminAudit/);
  assert.match(script, /function\s+ConvertTo-EvidenceLog/);
  assert.match(script, /function\s+ConvertTo-BareObjectUrl/);
  assert.match(script, /function\s+Write-RequiredInputs/);
  assert.match(script, /function\s+Assert-RequiredInputs/);
  assert.match(script, /手机号/);
  assert.match(script, /取片码/);
  assert.match(script, /相册 ID/);
  assert.match(script, /底片 ID/);
  assert.match(script, /OSS 裸链/);
  assert.match(script, /一键生成证据命令/);
  assert.match(script, /第一步：生成自动证据/);
  assert.match(script, /最终结论会保持 PENDING/);
  assert.match(script, /第二步：H5、微信小程序、抖音小程序、后台审计都人工验收通过后，再生成最终 PASS 证据/);
  assert.match(script, /第三步：查看发布状态并跑总闸门/);
  assert.match(script, /客片选片 -> 相册行 -> 相册工作台 -> 真实 OSS 证据/);
  assert.match(script, /如果 AutoResolve 提示 no album has visible assets/);
  assert.match(script, /上传真实私有 OSS 图片，并确认底片 visible=1、objectKey 有值/);
  assert.match(script, /-PrintRequiredInputs/);
  assert.match(script, /-ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit/);
  assert.match(script, /missing required input/);
  assert.match(script, /function\s+Invoke-EvidenceCommand/);
  assert.match(script, /function\s+Test-EvidenceLogPassed/);
  assert.match(script, /function\s+Resolve-CommandConclusion/);
  assert.match(script, /function\s+Resolve-FinalConclusion/);
  assert.match(script, /function\s+Resolve-ManualCheckPassed/);
  assert.match(script, /preflight: passed/);
  assert.match(script, /photo pickup local acceptance: passed/);
  assert.match(script, /\[switch\]\$ConfirmManualAcceptance/);
  assert.match(script, /命令结论/);
  assert.match(script, /最终结论/);
  assert.match(script, /人工确认/);
  assert.match(script, /\$codeFence\s*=\s*'```'/);
  assert.match(script, /\$\{codeFence\}text/);
  assert.match(script, /\$\{codeFence\}powershell/);
  assert.doesNotMatch(script, /```text/);
  assert.match(script, /\$commandConclusion\s*=\s*Resolve-CommandConclusion/);
  assert.match(script, /\$finalConclusion\s*=\s*Resolve-FinalConclusion/);
  assert.match(script, /\$manualChecksConfirmed\s*=\s*\$h5PickupConfirmed\s+-and\s+\$wechatMiniappConfirmed\s+-and\s+\$douyinMiniappConfirmed\s+-and\s+\$adminAuditConfirmed/);
  assert.match(script, /if\s*\(-not\s+\$ManualChecksConfirmed\)/);
  assert.match(script, /return 'PASS'/);
  assert.match(script, /return 'PENDING'/);
  assert.match(script, /return 'FAIL'/);
  assert.match(script, /\$bareObjectUrl\s*=\s*ConvertTo-BareObjectUrl/);
  assert.match(script, /yingyue-production-preflight\.ps1'?\)\s*`[\s\S]*-VerifyBareOssBlocked/);
  assert.match(script, /-BareOssUrl\s+\$bareObjectUrl/);
  assert.match(script, /photo-pickup-local-acceptance\.ps1'?\)\s*`[\s\S]*-SkipH5Browser/);
  assert.match(script, /\[string\]\$SummaryJsonPath/);
  assert.match(script, /photo-pickup-real-oss-acceptance-\$stamp\.json/);
  assert.match(script, /function\s+Write-EvidenceSummaryJson/);
  assert.match(script, /ConvertTo-Json\s+-Depth\s+6/);
  assert.match(script, /\$releaseStatus\s*=\s*Join-Path\s+\$repoRoot\s+'tools\/get-photo-pickup-release-status\.ps1'/);
  assert.match(script, /\$releaseStatusEvidenceRoot\s*=\s*Split-Path\s+-Parent\s+\$SummaryJsonPath/);
  assert.match(script, /\$releaseStatusJsonPath\s*=\s*Join-Path\s+\$releaseStatusEvidenceRoot\s+'photo-pickup-release-status\.json'/);
  assert.match(script, /get-photo-pickup-release-status\.ps1 -OutputJsonPath/);
  assert.match(script, /&\s+\$releaseStatus\s+-EvidenceRoot\s+\$releaseStatusEvidenceRoot\s+-OutputJsonPath\s+\$releaseStatusJsonPath/);
  assert.match(script, /commandConclusion\s*=\s*\$CommandConclusion/);
  assert.match(script, /finalConclusion\s*=\s*\$FinalConclusion/);
  assert.match(script, /preflightRan\s*=\s*\[bool\]\$RunPreflight/);
  assert.match(script, /localAcceptanceRan\s*=\s*\[bool\]\$RunLocalAcceptance/);
  assert.match(script, /manualChecks\s*=\s*\[ordered\]@/);
  assert.match(script, /h5Pickup\s*=\s*\$h5PickupConfirmed/);
  assert.match(script, /wechatMiniapp\s*=\s*\$wechatMiniappConfirmed/);
  assert.match(script, /douyinMiniapp\s*=\s*\$douyinMiniappConfirmed/);
  assert.match(script, /adminAudit\s*=\s*\$adminAuditConfirmed/);
  assert.match(script, /evidencePath\s*=\s*\$OutputPath/);
  assert.match(script, /summaryJsonPath\s*=\s*\$SummaryJsonPath/);
  assert.match(script, /Write-Host\s+"created summary: \$SummaryJsonPath"/);
  assert.match(script, /Write-Host\s+"created release status: \$releaseStatusJsonPath"/);
  assert.match(script, /### 3\. JSON 摘要校验/);
  assert.match(script, /verify-photo-pickup-real-oss-summary\.ps1 -SummaryJsonPath "\$SummaryJsonPath"/);
  assert.match(script, /### 4\. 最终发布前校验/);
  assert.match(script, /verify-photo-pickup-real-oss-summary\.ps1 -SummaryJsonPath "\$SummaryJsonPath" -RequireFinalPass/);
  assert.match(script, /\$summaryVerifier\s*=\s*Join-Path\s+\$repoRoot\s+'tools\/verify-photo-pickup-real-oss-summary\.ps1'/);
  assert.match(script, /&\s+\$summaryVerifier\s+-SummaryJsonPath\s+\$SummaryJsonPath/);
  assert.match(script, /Write-Host\s+"verified summary: \$SummaryJsonPath"/);
  assert.match(script, /Signature=\)\[\^&\\s\]\+/);
  assert.match(script, /OSSAccessKeyId=\)\[\^&\\s\]\+/);
  assert.match(script, /client\[_-\]\?/);
  assert.doesNotMatch(script, /`\$wechatDist`/);
  assert.doesNotMatch(script, /`\$douyinDist`/);
});

test('real OSS evidence generator captures PowerShell information stream output', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/new-photo-pickup-real-oss-evidence.ps1'), 'utf8');

  assert.match(script, /Invoke-EvidenceCommand/);
  assert.match(script, /Write-Host/);
  assert.match(script, /&\s+\$Script\s+\*>&1/);
  assert.doesNotMatch(script, /\$output\s*=\s*&\s+\$Script\s+2>&1/);
});

test('real OSS evidence summary verifier enforces handoff-ready JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  assert.ok(fs.existsSync(scriptPath), 'summary verifier script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /\[string\]\$SummaryJsonPath/);
  assert.match(script, /\[switch\]\$RequireFinalPass/);
  assert.match(script, /ConvertFrom-Json/);
  assert.match(script, /commandConclusion/);
  assert.match(script, /finalConclusion/);
  assert.match(script, /evidencePath/);
  assert.match(script, /summaryJsonPath/);
  assert.match(script, /preflightRan/);
  assert.match(script, /localAcceptanceRan/);
  assert.match(script, /manualChecks/);
  assert.match(script, /h5Pickup/);
  assert.match(script, /wechatMiniapp/);
  assert.match(script, /douyinMiniapp/);
  assert.match(script, /adminAudit/);
  assert.match(script, /bareOssUrl/);
  assert.match(script, /Get-Item\s+-LiteralPath\s+\$SummaryJsonPath/);
  assert.match(script, /Get-Item\s+-LiteralPath\s+\$summaryPath/);
  assert.match(script, /Resolve-Path\s+-LiteralPath\s+\$SummaryJsonPath/);
  assert.match(script, /Resolve-Path\s+-LiteralPath\s+\$summaryPath/);
  assert.match(script, /Test-Path\s+-LiteralPath\s+\$evidencePath/);
  assert.match(script, /evidence file not found/);
  assert.match(script, /summaryJsonPath does not match checked file/);
  assert.match(script, /Signature=/);
  assert.match(script, /OSSAccessKeyId=/);
  assert.match(script, /final conclusion is not PASS/);
  assert.match(script, /throw "manual check missing: \$Name"/);
  assert.match(script, /Assert-ManualCheck\s+-ManualChecks\s+\$summary\.manualChecks\s+-Name 'h5Pickup'/);
  assert.match(script, /Assert-ManualCheck\s+-ManualChecks\s+\$summary\.manualChecks\s+-Name 'wechatMiniapp'/);
  assert.match(script, /Assert-ManualCheck\s+-ManualChecks\s+\$summary\.manualChecks\s+-Name 'douyinMiniapp'/);
  assert.match(script, /Assert-ManualCheck\s+-ManualChecks\s+\$summary\.manualChecks\s+-Name 'adminAudit'/);
  assert.match(script, /real OSS evidence summary: passed/);
});

test('real OSS evidence summary verifier reports unreadable or incomplete summaries clearly', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-summary-verifier-invalid-'));
  const corruptSummaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-corrupt.json');
  const incompleteSummaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-incomplete.json');

  fs.writeFileSync(corruptSummaryPath, '{ bad json');
  fs.writeFileSync(incompleteSummaryPath, JSON.stringify({
    summaryJsonPath: incompleteSummaryPath,
  }, null, 2));

  const corruptResult = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    corruptSummaryPath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(corruptResult.status, 0, 'corrupt summary should fail');
  const corruptOutput = `${corruptResult.stdout}\n${corruptResult.stderr}`;
  assert.match(corruptOutput, /summary json is not readable/);
  assert.match(corruptOutput, /photo-pickup-real-oss-acceptance-corrupt\.json/);

  const incompleteResult = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    incompleteSummaryPath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(incompleteResult.status, 0, 'incomplete summary should fail');
  const incompleteOutput = `${incompleteResult.stdout}\n${incompleteResult.stderr}`;
  assert.match(incompleteOutput, /summary field missing: evidencePath/);
  assert.doesNotMatch(incompleteOutput, /The property 'evidencePath' cannot be found/);
});

test('real OSS evidence final pass requires preflight and local acceptance runs', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-summary-verifier-final-runs-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance.json');

  fs.writeFileSync(evidencePath, '# PASS evidence\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: false,
    localAcceptanceRan: false,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    summaryPath,
    '-RequireFinalPass',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'final PASS should require both automatic runs');
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /preflight run is required for final PASS/);
});

test('real OSS evidence summary verifier treats string false flags as not accepted', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-summary-verifier-string-false-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-string-false.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-string-false.json');

  fs.writeFileSync(evidencePath, '# PASS evidence with string false flags\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: 'false',
    localAcceptanceRan: 'false',
    manualChecks: {
      h5Pickup: 'false',
      wechatMiniapp: 'false',
      douyinMiniapp: 'false',
      adminAudit: 'false',
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    summaryPath,
    '-RequireFinalPass',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'string false flags should not satisfy final PASS');
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /preflight run is required for final PASS/);
});

test('real OSS evidence summary verifier rejects conclusion casing and whitespace drift', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-summary-verifier-conclusion-format-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-conclusion-format.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-conclusion-format.json');

  fs.writeFileSync(evidencePath, '# forged final PASS evidence with loose conclusion fields\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'pass',
    finalConclusion: 'PASS ',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    summaryPath,
    '-RequireFinalPass',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'loose conclusion values should not satisfy final PASS');
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /commandConclusion has invalid value: pass/);
});

test('latest real OSS evidence summary verifier gates release handoff', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-latest-photo-pickup-real-oss-summary.ps1');
  assert.ok(fs.existsSync(scriptPath), 'latest summary verifier script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /photo-pickup-real-oss-acceptance-\*\.json/);
  assert.match(script, /Sort-Object\s+LastWriteTime\s+-Descending/);
  assert.match(script, /Select-Object\s+-First\s+1/);
  assert.match(script, /verify-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /\[switch\]\$RequireFinalPass/);
  assert.match(script, /&\s+\$summaryVerifier\s+-SummaryJsonPath\s+\$latest\.FullName/);
  assert.match(script, /-RequireFinalPass/);
  assert.match(script, /latest real OSS evidence summary: passed/);
  assert.match(script, /latestSummaryJsonPath/);
  assert.match(script, /no real OSS evidence summary found/);
});

test('real OSS runbooks document the latest-summary release gate', () => {
  const detectionRunbook = fs.readFileSync(
    path.join(repoRoot, 'docs/yingyue-project-detection-runbook.md'),
    'utf8',
  );
  const finalRunbook = fs.readFileSync(
    path.join(repoRoot, 'docs/photo-pickup-final-verification-runbook.md'),
    'utf8',
  );

  for (const doc of [detectionRunbook, finalRunbook]) {
    assert.match(doc, /verify-latest-photo-pickup-real-oss-summary\.ps1/);
    assert.match(doc, /verify-photo-pickup-release-gate\.ps1/);
    assert.match(doc, /verify-yingyue-deploy-package\.ps1/);
    assert.match(doc, /-RequireFinalPass/);
    assert.match(doc, /-EvidenceRoot/);
    assert.match(doc, /最新/);
  }
});

test('photo pickup release gate requires local acceptance and real OSS final pass', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  assert.ok(fs.existsSync(scriptPath), 'release gate script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /photo-pickup-local-acceptance\.ps1/);
  assert.match(script, /verify-latest-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /get-photo-pickup-release-status\.ps1/);
  assert.match(script, /\[string\]\$BaseUrl\s*=\s*''/);
  assert.match(script, /\[string\]\$Phone\s*=\s*''/);
  assert.match(script, /\[string\]\$AccessCode\s*=\s*''/);
  assert.match(script, /\[string\]\$AlbumId\s*=\s*''/);
  assert.match(script, /\[string\]\$AssetId\s*=\s*''/);
  assert.match(script, /\[string\]\$EvidenceRoot\s*=\s*''/);
  assert.match(script, /\[switch\]\$AsJson/);
  assert.match(script, /ReleaseStatusScriptPath/);
  assert.match(script, /LocalAcceptanceScriptPath/);
  assert.match(script, /RealOssSummaryGateScriptPath/);
  assert.match(script, /New-ReleaseGateReport/);
  assert.match(script, /ConvertTo-Json\s+-Depth\s+6/);
  assert.match(script, /Join-Path\s+\$repoRoot\s+'tools\/get-photo-pickup-release-status\.ps1'/);
  assert.match(script, /Join-Path\s+\$repoRoot\s+'tools\/photo-pickup-local-acceptance\.ps1'/);
  assert.match(script, /Join-Path\s+\$repoRoot\s+'tools\/verify-latest-photo-pickup-real-oss-summary\.ps1'/);
  assert.match(script, /release status script not found/);
  assert.match(script, /release gate status diagnostic/);
  assert.match(script, /&\s+\$releaseStatus\s+-EvidenceRoot\s+\$EvidenceRoot/);
  assert.match(script, /\$localAcceptanceParams/);
  assert.match(script, /&\s+\$localAcceptance\s+@localAcceptanceParams/);
  assert.match(script, /-RequireFinalPass/);
  assert.match(script, /&\s+\$realOssSummaryGate\s+-EvidenceRoot\s+\$EvidenceRoot\s+-RequireFinalPass/);
  assert.match(script, /\[switch\]\$SkipLocalAcceptance/);
  assert.match(script, /\[switch\]\$SkipRealOssFinalPass/);
  assert.match(script, /photo pickup release gate: passed/);
  assert.match(script, /photo pickup release gate: partial only/);
  assert.match(script, /if\s*\(\$SkipLocalAcceptance\)[\s\S]*photo pickup release gate: partial only[\s\S]*return/);
  assert.match(script, /if\s*\(\$SkipRealOssFinalPass\)[\s\S]*return/);
  assert.match(script, /release gate requires real OSS final PASS/);
  assert.match(script, /release gate skipped local acceptance/);
});

test('photo pickup release gate can report blocked status as JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-gate-json-blocked-'));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'blocked JSON release gate should still fail');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.releaseStatus, 'BLOCKED');
  assert.equal(report.evidenceRoot, evidenceRoot);
  assert.deepEqual(report.missing, ['real OSS evidence summary']);
  assert.equal(report.partialOnly, false);
  assert.equal(report.skippedLocalAcceptance, false);
  assert.equal(report.skippedRealOssFinalPass, false);
});

test('photo pickup release gate reports real OSS verifier failures as JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-gate-json-step-fail-'));
  const fakeReleaseStatusPath = path.join(evidenceRoot, 'fake-release-status.ps1');
  const fakeLocalAcceptancePath = path.join(evidenceRoot, 'fake-local-acceptance.ps1');
  const fakeRealOssGatePath = path.join(evidenceRoot, 'fake-real-oss-gate.ps1');

  fs.writeFileSync(fakeReleaseStatusPath, [
    'param([string]$EvidenceRoot, [switch]$AsJson)',
    'if ($AsJson) {',
    '  [ordered]@{ status = "READY"; missing = @() } | ConvertTo-Json -Depth 6',
    '} else {',
    '  Write-Host "fake release status: READY"',
    '}',
    '',
  ].join('\n'));
  fs.writeFileSync(fakeLocalAcceptancePath, 'Write-Host "photo pickup local acceptance: passed"\n');
  fs.writeFileSync(fakeRealOssGatePath, 'throw "fake final PASS verifier failed"\n');

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-SkipLocalAcceptance',
    '-AsJson',
    '-ReleaseStatusScriptPath',
    fakeReleaseStatusPath,
    '-LocalAcceptanceScriptPath',
    fakeLocalAcceptancePath,
    '-RealOssSummaryGateScriptPath',
    fakeRealOssGatePath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'verifier failure should fail JSON release gate');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAILED');
  assert.equal(report.releaseStatus, 'READY');
  assert.equal(report.stage, 'realOssFinalPass');
  assert.match(report.message, /fake final PASS verifier failed/);
  assert.equal(report.partialOnly, true);
  assert.equal(report.skippedLocalAcceptance, true);
});

test('photo pickup release gate reports child script exit failures as JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-gate-json-exit-fail-'));
  const fakeReleaseStatusPath = path.join(evidenceRoot, 'fake-release-status.ps1');
  const fakeLocalAcceptancePath = path.join(evidenceRoot, 'fake-local-acceptance.ps1');
  const fakeRealOssGatePath = path.join(evidenceRoot, 'fake-real-oss-gate.ps1');

  fs.writeFileSync(fakeReleaseStatusPath, [
    'param([string]$EvidenceRoot, [switch]$AsJson)',
    'if ($AsJson) {',
    '  [ordered]@{ status = "READY"; missing = @() } | ConvertTo-Json -Depth 6',
    '}',
    '',
  ].join('\n'));
  fs.writeFileSync(fakeLocalAcceptancePath, [
    'Write-Host "local acceptance hard failure"',
    'exit 23',
    '',
  ].join('\n'));
  fs.writeFileSync(fakeRealOssGatePath, 'Write-Host "real oss verifier should not run"\n');

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
    '-ReleaseStatusScriptPath',
    fakeReleaseStatusPath,
    '-LocalAcceptanceScriptPath',
    fakeLocalAcceptancePath,
    '-RealOssSummaryGateScriptPath',
    fakeRealOssGatePath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'child exit failure should fail JSON release gate');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAILED');
  assert.equal(report.releaseStatus, 'READY');
  assert.equal(report.stage, 'localAcceptance');
  assert.match(report.message, /exit_code: 23/);
  assert.equal(report.localAcceptanceRan, false);
  assert.equal(report.realOssFinalPassRan, false);
});

test('photo pickup release gate treats skipped local acceptance as partial only', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-gate-skip-local-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-pass.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-pass.json');
  fs.writeFileSync(evidencePath, '# PASS evidence\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-SkipLocalAcceptance',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /release gate skipped local acceptance/);
  assert.match(result.stdout, /latest real OSS evidence summary: passed/);
  assert.match(result.stdout, /photo pickup release gate: partial only/);
  assert.doesNotMatch(result.stdout, /photo pickup release gate: passed/);
});

test('photo pickup release gate stops early when release status is blocked', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-release-gate.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-gate-blocked-'));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'blocked release gate should fail');
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /release gate status: BLOCKED/);
  assert.match(output, /real OSS evidence summary/);
  assert.doesNotMatch(output, /photo pickup local acceptance/);
  assert.doesNotMatch(output, /photo pickup release gate: passed/);
});

test('photo pickup release status explains missing acceptance gates', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  assert.ok(fs.existsSync(scriptPath), 'release status script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /\[switch\]\$AsJson/);
  assert.match(script, /\[string\]\$OutputJsonPath\s*=\s*''/);
  assert.match(script, /photo-pickup-real-oss-acceptance-\*\.json/);
  assert.match(script, /ConvertTo-Json\s+-Depth\s+6/);
  assert.match(script, /System\.IO\.File\]::WriteAllText/);
  assert.match(script, /System\.Text\.UTF8Encoding\]::new\(\$false\)/);
  assert.match(script, /latestSummaryJsonPath/);
  assert.match(script, /nextCommands/);
  assert.match(script, /manualChecks/);
  assert.match(script, /h5Pickup/);
  assert.match(script, /wechatMiniapp/);
  assert.match(script, /douyinMiniapp/);
  assert.match(script, /adminAudit/);
  assert.match(script, /READY/);
  assert.match(script, /BLOCKED/);
  assert.match(script, /real OSS evidence summary/);
  assert.match(script, /H5 pickup acceptance/);
  assert.match(script, /WeChat miniapp acceptance/);
  assert.match(script, /Douyin miniapp acceptance/);
  assert.match(script, /admin audit acceptance/);
  assert.match(script, /Write-Host "missing: \$item"/);
  assert.match(script, /\$nextUploadImage\s*=\s*'在后台客片选片上传真实私有 OSS 图片，并从相册工作台复制 albumId\/assetId\/objectKey\/OSS 裸链'/);
  assert.match(script, /\$nextRequiredInputs\s*=\s*'\.\\tools\\new-photo-pickup-real-oss-evidence\.ps1 -PrintRequiredInputs'/);
  assert.match(script, /\$nextAutoResolveEvidence\s*=\s*'\.\\tools\\new-photo-pickup-real-oss-evidence\.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance'/);
  assert.match(script, /\$nextAutoResolveFinalPassEvidence\s*=\s*'\.\\tools\\new-photo-pickup-real-oss-evidence\.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit'/);
  assert.match(script, /\$nextGenerateEvidence\s*=\s*'\.\\tools\\new-photo-pickup-real-oss-evidence\.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https:\/\/<bucket>\.oss-cn-beijing\.aliyuncs\.com\/<object-key>" -RunPreflight -RunLocalAcceptance'/);
  assert.match(script, /\$nextGenerateFinalPassEvidence\s*=\s*'\.\\tools\\new-photo-pickup-real-oss-evidence\.ps1 -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https:\/\/<bucket>\.oss-cn-beijing\.aliyuncs\.com\/<object-key>" -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit'/);
  assert.match(script, /\$nextReleaseGate\s*=\s*'\.\\tools\\verify-photo-pickup-release-gate\.ps1'/);
  assert.match(script, /Write-Host "next: \$command"/);
});

test('photo pickup release status can print machine-readable JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-empty-'));
  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.evidenceRoot, evidenceRoot);
  assert.deepEqual(report.missing, ['real OSS evidence summary']);
  assert.ok(report.nextCommands.some((command) => command.includes('-PrintRequiredInputs')));
  assert.ok(report.nextCommands.some((command) => (
    command.includes('new-photo-pickup-real-oss-evidence.ps1')
    && command.includes('-AutoResolve')
    && command.includes('-RunPreflight')
    && command.includes('-RunLocalAcceptance')
  )));
  assert.ok(report.nextCommands.some((command) => (
    command.includes('new-photo-pickup-real-oss-evidence.ps1')
    && command.includes('-AutoResolve')
    && command.includes('-ConfirmH5Pickup')
    && command.includes('-ConfirmWechatMiniapp')
    && command.includes('-ConfirmDouyinMiniapp')
    && command.includes('-ConfirmAdminAudit')
  )));
  assert.ok(report.nextCommands.some((command) => (
    command.includes('new-photo-pickup-real-oss-evidence.ps1')
    && command.includes('-Phone')
    && command.includes('-AccessCode')
    && command.includes('-BareOssUrl')
  )));
  assert.ok(report.nextCommands.some((command) => command.includes('verify-photo-pickup-release-gate.ps1')));
  assert.equal(report.latestSummaryJsonPath, null);
});

test('photo pickup release status can write a JSON artifact', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-artifact-'));
  const outputJsonPath = path.join(evidenceRoot, 'release-status.json');
  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-OutputJsonPath',
    outputJsonPath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /status: BLOCKED/);
  assert.ok(fs.existsSync(outputJsonPath), 'status artifact should be written');
  const report = JSON.parse(fs.readFileSync(outputJsonPath, 'utf8'));
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.evidenceRoot, evidenceRoot);
  assert.deepEqual(report.missing, ['real OSS evidence summary']);
});

test('photo pickup release status handles legacy summaries without manual checks', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-legacy-'));
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-legacy.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PENDING',
    evidencePath: path.join(evidenceRoot, 'legacy.md'),
    summaryJsonPath: summaryPath,
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(path.basename(report.latestSummaryJsonPath), path.basename(summaryPath));
  assert.deepEqual(report.manualChecks, {
    h5Pickup: false,
    wechatMiniapp: false,
    douyinMiniapp: false,
    adminAudit: false,
  });
  assert.ok(report.missing.includes('final conclusion PASS'));
  assert.ok(report.missing.includes('H5 pickup acceptance'));
  assert.ok(report.nextCommands.some((command) => command.includes('-PrintRequiredInputs')));
});

test('photo pickup release status handles partial manual check objects', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-partial-manual-'));
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-partial.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PENDING',
    evidencePath: path.join(evidenceRoot, 'partial.md'),
    summaryJsonPath: summaryPath,
    manualChecks: {
      h5Pickup: true,
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.deepEqual(report.manualChecks, {
    h5Pickup: true,
    wechatMiniapp: false,
    douyinMiniapp: false,
    adminAudit: false,
  });
  assert.ok(!report.missing.includes('H5 pickup acceptance'));
  assert.ok(report.missing.includes('WeChat miniapp acceptance'));
  assert.ok(report.missing.includes('Douyin miniapp acceptance'));
  assert.ok(report.missing.includes('admin audit acceptance'));
});

test('photo pickup release status handles corrupt summary json', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-corrupt-'));
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-corrupt.json');
  fs.writeFileSync(summaryPath, '{ bad json');

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(path.basename(report.latestSummaryJsonPath), path.basename(summaryPath));
  assert.ok(report.missing.includes('readable real OSS evidence summary'));
  assert.ok(report.nextCommands.some((command) => command.includes('-PrintRequiredInputs')));
  assert.ok(report.nextCommands.some((command) => command.includes('new-photo-pickup-real-oss-evidence.ps1')));
});

test('photo pickup release status handles summaries without conclusion fields', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-no-conclusion-'));
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-no-conclusion.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    evidencePath: path.join(evidenceRoot, 'no-conclusion.md'),
    summaryJsonPath: summaryPath,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.commandConclusion, null);
  assert.equal(report.finalConclusion, null);
  assert.ok(report.missing.includes('automatic command conclusion PASS'));
  assert.ok(report.missing.includes('final conclusion PASS'));
  assert.ok(!report.missing.includes('H5 pickup acceptance'));
});

test('photo pickup release status blocks final pass summaries without automatic runs', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-no-runs-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-no-runs.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-no-runs.json');

  fs.writeFileSync(evidencePath, '# fake final PASS evidence\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: false,
    localAcceptanceRan: false,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.preflightRan, false);
  assert.equal(report.localAcceptanceRan, false);
  assert.ok(report.missing.includes('production preflight run'));
  assert.ok(report.missing.includes('local pickup acceptance run'));
});

test('photo pickup release status blocks forged final pass summaries without evidence integrity', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-forged-summary-'));
  const missingEvidencePath = path.join(evidenceRoot, 'missing-evidence.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-forged.json');
  const mismatchedSummaryPath = path.join(evidenceRoot, 'another-summary.json');

  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath: missingEvidencePath,
    summaryJsonPath: mismatchedSummaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg?OSSAccessKeyId=test&Signature=unsafe',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.ok(report.missing.includes('real OSS evidence markdown file'));
  assert.ok(report.missing.includes('summary path matches checked file'));
  assert.ok(report.missing.includes('sanitized bare OSS URL'));
});

test('real OSS evidence summary verifier rejects non-Aliyun OSS bare URLs', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-real-oss-summary.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-summary-verifier-non-oss-url-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-non-oss-url.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-non-oss-url.json');

  fs.writeFileSync(evidencePath, '# forged final PASS evidence with non-OSS URL\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://example.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SummaryJsonPath',
    summaryPath,
    '-RequireFinalPass',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'non-OSS URL should not satisfy final PASS');
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /bareOssUrl is not an HTTPS Aliyun OSS object URL/);
});

test('photo pickup release status blocks non-Aliyun OSS bare URL summaries', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-non-oss-url-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-non-oss-url.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-non-oss-url.json');

  fs.writeFileSync(evidencePath, '# forged final PASS evidence with non-OSS URL\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://example.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.ok(report.missing.includes('HTTPS Aliyun OSS bare object URL'));
});

test('photo pickup release status blocks summaries with missing real OSS input ids', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-missing-inputs-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-missing-inputs.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-missing-inputs.json');

  fs.writeFileSync(evidencePath, '# final PASS evidence without enough inputs\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: true,
    localAcceptanceRan: true,
    manualChecks: {
      h5Pickup: true,
      wechatMiniapp: true,
      douyinMiniapp: true,
      adminAudit: true,
    },
    inputs: {
      phone: '',
      accessCode: '',
      albumId: '',
      assetId: '',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.ok(report.missing.includes('real OSS evidence phone'));
  assert.ok(report.missing.includes('real OSS evidence access code'));
  assert.ok(report.missing.includes('real OSS evidence album id'));
  assert.ok(report.missing.includes('real OSS evidence asset id'));
});

test('photo pickup release status treats string false flags as not accepted', () => {
  const scriptPath = path.join(repoRoot, 'tools/get-photo-pickup-release-status.ps1');
  const evidenceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-release-status-string-false-'));
  const evidencePath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-string-false.md');
  const summaryPath = path.join(evidenceRoot, 'photo-pickup-real-oss-acceptance-string-false.json');

  fs.writeFileSync(evidencePath, '# final PASS evidence with string false flags\n');
  fs.writeFileSync(summaryPath, JSON.stringify({
    commandConclusion: 'PASS',
    finalConclusion: 'PASS',
    evidencePath,
    summaryJsonPath: summaryPath,
    preflightRan: 'false',
    localAcceptanceRan: 'false',
    manualChecks: {
      h5Pickup: 'false',
      wechatMiniapp: 'false',
      douyinMiniapp: 'false',
      adminAudit: 'false',
    },
    inputs: {
      phone: '13800000000',
      accessCode: 'PICK-TEST',
      albumId: '903001',
      assetId: '2063173289800183809',
      bareOssUrl: 'https://bucket.oss-cn-beijing.aliyuncs.com/object-key.jpg',
    },
  }, null, 2));

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-EvidenceRoot',
    evidenceRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.preflightRan, false);
  assert.equal(report.localAcceptanceRan, false);
  assert.deepEqual(report.manualChecks, {
    h5Pickup: false,
    wechatMiniapp: false,
    douyinMiniapp: false,
    adminAudit: false,
  });
  assert.ok(report.missing.includes('production preflight run'));
  assert.ok(report.missing.includes('local pickup acceptance run'));
  assert.ok(report.missing.includes('H5 pickup acceptance'));
  assert.ok(report.missing.includes('WeChat miniapp acceptance'));
  assert.ok(report.missing.includes('Douyin miniapp acceptance'));
  assert.ok(report.missing.includes('admin audit acceptance'));
});

test('deploy package carries photo pickup release evidence gates', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/yingyue-build-deploy-package.ps1'), 'utf8');

  assert.match(script, /postgres_yy_channel_event_inbox_migration_20260612\.sql/);
  assert.match(script, /new-photo-pickup-real-oss-evidence\.ps1/);
  assert.match(script, /verify-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /verify-latest-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /verify-photo-pickup-release-gate\.ps1/);
  assert.match(script, /get-photo-pickup-release-status\.ps1/);
  assert.match(script, /get-yingyue-delivery-status\.ps1/);
  assert.match(script, /verify-yingyue-deploy-package\.ps1/);
  assert.match(script, /verify-photo-pickup-access-audit\.ps1/);
  assert.match(script, /print-miniapp-acceptance-handoff\.ps1/);
  assert.match(script, /get-yingyue-delivery-status\.ps1 -SkipGithub -AsJson/);
  assert.match(script, /yingyue-delivery-status\.json/);
  assert.match(script, /READY_FOR_EXTERNAL_ACCEPTANCE/);
  assert.match(script, /get-photo-pickup-release-status\.ps1 -AsJson/);
  assert.match(script, /photo-pickup-local-acceptance\.ps1/);
  assert.match(script, /photo-pickup-final-verification-runbook\.md/);
  assert.match(script, /yingyue-project-detection-runbook\.md/);
  assert.match(script, /miniapp-acceptance-handoff-20260611\.md/);
  assert.match(script, /DEPLOY_PACKAGE_README\.md/);
  assert.match(script, /-Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>" -AssetId "<asset-id>"/);
  assert.match(script, /-BareOssUrl "https:\/\/<bucket>\.oss-cn-beijing\.aliyuncs\.com\/<object-key>"/);
  assert.match(script, /-RunPreflight -RunLocalAcceptance/);
  assert.match(script, /-ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit/);
  assert.match(script, /\$readmeTemplate\s*=\s*@'/);
  assert.match(script, /\{\{COMMIT\}\}/);
  assert.match(script, /\{\{GENERATED_AT\}\}/);
  assert.match(script, /verify-photo-pickup-release-gate\.ps1/);
  assert.match(script, /new-photo-pickup-real-oss-evidence\.ps1 -PrintRequiredInputs/);
  assert.match(script, /new-photo-pickup-real-oss-evidence\.ps1[\s\S]*-AutoResolve -RunPreflight -RunLocalAcceptance/);
  assert.match(script, /new-photo-pickup-real-oss-evidence\.ps1[\s\S]*-AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit/);
  assert.match(script, /-EvidenceRoot/);
  assert.match(script, /-AsJson/);
  assert.match(script, /-OutputJsonPath/);
  assert.match(script, /preflightRan/);
  assert.match(script, /localAcceptanceRan/);
  assert.match(script, /evidence Markdown exists/);
  assert.match(script, /summaryJsonPath matches the checked summary/);
  assert.match(script, /sanitized bare OSS URL/);
  assert.match(script, /verify-yingyue-deploy-package\.ps1 -PackageDir \./);
  assert.doesNotMatch(script, /\$readme\s*=\s*@"/);
});

test('photo pickup access audit verifier checks required actions with redacted output', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-photo-pickup-access-audit.ps1');
  assert.ok(fs.existsSync(scriptPath), 'access audit verifier script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /\[ValidateSet\('LocalDocker',\s*'SshDocker'\)\]/);
  assert.match(script, /\[string\]\$AlbumId/);
  assert.match(script, /\[string\]\$AssetId/);
  assert.match(script, /\[string\]\$SshPasswordFile/);
  assert.match(script, /yy_photo_access_log/);
  assert.match(script, /VERIFY/);
  assert.match(script, /ALBUM_DETAIL/);
  assert.match(script, /PREVIEW/);
  assert.match(script, /DOWNLOAD/);
  assert.match(script, /STREAM/);
  assert.match(script, /mask_phone/);
  assert.match(script, /present_encrypted_or_masked/);
  assert.match(script, /access audit: passed/);
  assert.match(script, /missing required audit actions/);
  assert.doesNotMatch(script, /select\s+\*/i);
});

test('deploy package verifier enforces handoff package contents', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-yingyue-deploy-package.ps1');
  assert.ok(fs.existsSync(scriptPath), 'deploy package verifier script should exist');

  const script = fs.readFileSync(scriptPath, 'utf8');

  assert.match(script, /\[string\]\$PackageDir\s*=\s*''/);
  assert.match(script, /\[switch\]\$AsJson/);
  assert.match(script, /\[string\]\$OutputJsonPath\s*=\s*''/);
  assert.match(script, /Resolve-DeployPackageDir/);
  assert.match(script, /Write-DeployPackageVerificationJsonArtifact/);
  assert.match(script, /WriteAllText\(\$OutputJsonPath,\s*\$json,\s*\$utf8NoBom\)/);
  assert.match(script, /ConvertTo-PackageRelativePath/);
  assert.doesNotMatch(script, /GetRelativePath/);
  assert.match(script, /Test-ForbiddenSecretFiles/);
  assert.match(script, /secret-files:denylist/);
  assert.match(script, /\\\.env\\\.production/);
  assert.match(script, /\\\.env\\\.local/);
  assert.match(script, /APPSecret/);
  assert.match(script, /AccessKey/);
  assert.match(script, /secret/i);
  assert.match(script, /env\.production\.example/);
  assert.match(script, /DEPLOY_PACKAGE_README\.md/);
  assert.match(script, /backend\/ruoyi-admin\.jar/);
  assert.match(script, /postgres_yy_photo_private_oss_migration_20260606\.sql/);
  assert.match(script, /postgres_yy_photo_asset_object_key_guard_20260607\.sql/);
  assert.match(script, /postgres_yy_channel_event_inbox_migration_20260612\.sql/);
  assert.match(script, /new-photo-pickup-real-oss-evidence\.ps1/);
  assert.match(script, /verify-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /verify-latest-photo-pickup-real-oss-summary\.ps1/);
  assert.match(script, /verify-photo-pickup-release-gate\.ps1/);
  assert.match(script, /get-photo-pickup-release-status\.ps1/);
  assert.match(script, /get-yingyue-delivery-status\.ps1/);
  assert.match(script, /verify-yingyue-deploy-package\.ps1/);
  assert.match(script, /verify-photo-pickup-access-audit\.ps1/);
  assert.match(script, /print-miniapp-acceptance-handoff\.ps1/);
  assert.match(script, /photo-pickup-final-verification-runbook\.md/);
  assert.match(script, /yingyue-project-detection-runbook\.md/);
  assert.match(script, /miniapp-acceptance-handoff-20260611\.md/);
  assert.match(script, /readme:project-delivery-status/);
  assert.match(script, /readme:project-delivery-status-json/);
  assert.match(script, /readme:project-delivery-external-acceptance/);
  assert.match(script, /readme:release-status/);
  assert.match(script, /readme:release-status-json/);
  assert.match(script, /readme:release-status-artifact/);
  assert.match(script, /readme:release-status-preflight-flag/);
  assert.match(script, /readme:release-status-local-acceptance-flag/);
  assert.match(script, /readme:release-status-evidence-integrity/);
  assert.match(script, /readme:release-status-summary-path-integrity/);
  assert.match(script, /readme:release-status-bare-oss-integrity/);
  assert.match(script, /readme:release-status-aliyun-oss-url/);
  assert.match(script, /readme:real-oss-required-inputs/);
  assert.match(script, /readme:real-oss-auto-resolve-command/);
  assert.match(script, /readme:real-oss-auto-evidence-command/);
  assert.match(script, /readme:real-oss-final-pass-command/);
  assert.match(script, /readme:real-oss-placeholder-fields/);
  assert.match(script, /readme:release-gate/);
  assert.match(script, /readme:release-gate-json/);
  assert.match(script, /readme:evidence-root/);
  assert.match(script, /readme:deploy-package-verifier/);
  assert.match(script, /readme:deploy-package-verifier-json/);
  assert.match(script, /readme:deploy-package-verifier-artifact/);
  assert.match(script, /readme:deploy-package-release-gate-self-check/);
  assert.match(script, /readme:no-secret-files-in-package/);
  assert.match(script, /readme:no-secret-warning/);
  assert.match(script, /AccessKey files back into Git/);
  assert.match(script, /Invoke-PackageReleaseGateJsonSelfCheck/);
  assert.match(script, /release-gate-json:self-check/);
  assert.match(script, /verify-photo-pickup-release-gate\.ps1/);
  assert.match(script, /-AsJson/);
  assert.match(script, /ConvertFrom-Json/);
  assert.match(script, /BLOCKED/);
  assert.match(script, /PARTIAL/);
  assert.match(script, /PASSED/);
  assert.match(script, /status=.*exit=.*stage=/);
  assert.match(script, /ConvertTo-Json\s+-Depth\s+6/);
  assert.match(script, /deploy package verification failed/);
});

test('deploy package builder documents package verification JSON artifact handoff', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'tools/yingyue-build-deploy-package.ps1'), 'utf8');

  assert.match(script, /verify-yingyue-deploy-package\.ps1 -PackageDir \. -AsJson/);
  assert.match(script, /verify-yingyue-deploy-package\.ps1 -PackageDir \. -OutputJsonPath docs\/evidence\/yingyue-deploy-package-status\.json/);
  assert.match(script, /release-gate-json:self-check/);
});

test('deploy package verifier rejects forbidden secret filenames in package', () => {
  const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-deploy-package-secret-'));
  const requiredFiles = [
    'backend/ruoyi-admin.jar',
    'backend/.env.production.example',
    'deploy/yingyue-admin.service.example',
    'conf/nginx/yingyue-api.nginx.example.conf',
    'conf/caddy/YingyueApi.Caddyfile.example',
    'DEPLOY_PACKAGE_README.md',
    'sql/postgres/postgres_ry_vue_5.X.sql',
    'sql/postgres/postgres_ry_job.sql',
    'sql/postgres/postgres_ry_workflow.sql',
    'sql/postgres/postgres_yy_cloud.sql',
    'sql/postgres/postgres_yy_cloud_codegen.sql',
    'sql/postgres/postgres_yy_channel_life_migration_20260606.sql',
    'sql/postgres/postgres_yy_ops_crud_migration_20260606.sql',
    'sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql',
    'sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql',
    'sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql',
    'docs/photo-pickup-smoke.md',
    'docs/photo-pickup-final-verification-runbook.md',
    'docs/yingyue-project-detection-runbook.md',
  ];
  const toolFiles = [
    'yingyue-production-preflight.ps1',
    'yingyue-platform-readiness.ps1',
    'yingyue-douyin-album-audit.ps1',
    'verify-photo-pickup-access-audit.ps1',
    'print-miniapp-acceptance-handoff.ps1',
    'photo-pickup-smoke.ps1',
    'photo-pickup-local-acceptance.ps1',
    'new-photo-pickup-real-oss-evidence.ps1',
    'get-yingyue-delivery-status.ps1',
    'verify-photo-pickup-real-oss-summary.ps1',
    'verify-latest-photo-pickup-real-oss-summary.ps1',
    'verify-photo-pickup-release-gate.ps1',
    'get-photo-pickup-release-status.ps1',
    'verify-yingyue-deploy-package.ps1',
  ];

  for (const relativePath of requiredFiles) {
    const target = path.join(packageRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (relativePath === 'DEPLOY_PACKAGE_README.md') {
      fs.writeFileSync(target, [
        'get-yingyue-delivery-status.ps1 -SkipGithub -AsJson',
        'get-yingyue-delivery-status.ps1 -SkipGithub -OutputJsonPath docs/evidence/yingyue-delivery-status.json',
        'READY_FOR_EXTERNAL_ACCEPTANCE',
        'get-photo-pickup-release-status.ps1 -AsJson -OutputJsonPath',
        'preflightRan localAcceptanceRan evidence Markdown exists',
        'summaryJsonPath matches the checked summary sanitized bare OSS URL HTTPS Aliyun OSS bare object URL',
        'new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs -RunPreflight -RunLocalAcceptance',
        'new-photo-pickup-real-oss-evidence.ps1 -Phone "<phone>" -AccessCode "<pickup-code>" -AutoResolve -RunPreflight -RunLocalAcceptance',
        '-ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit',
        '-Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>" -AssetId "<asset-id>"',
        'verify-photo-pickup-release-gate.ps1 -AsJson -EvidenceRoot',
        'verify-yingyue-deploy-package.ps1 -PackageDir . -AsJson',
        'verify-yingyue-deploy-package.ps1 -PackageDir . -OutputJsonPath docs/evidence/yingyue-deploy-package-status.json',
        'release-gate-json:self-check secret-files:denylist',
        'Do not upload real `.env.production` or cloud AccessKey files back into Git.',
      ].join('\n'));
    } else {
      fs.writeFileSync(target, 'placeholder\n');
    }
  }

  for (const toolFile of toolFiles) {
    const source = path.join(repoRoot, 'tools', toolFile);
    const target = path.join(packageRoot, 'tools', toolFile);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  fs.writeFileSync(path.join(packageRoot, 'backend/.env.production'), 'REAL_SECRET=do-not-package\n');

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    path.join(packageRoot, 'tools/verify-yingyue-deploy-package.ps1'),
    '-PackageDir',
    packageRoot,
    '-AsJson',
  ], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'real .env.production should fail deploy package verification');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  const secretCheck = report.checks.find((check) => check.name === 'secret-files:denylist');
  assert.equal(secretCheck.status, 'FAIL');
  assert.match(secretCheck.detail, /backend\/\.env\.production/);
});

test('deploy package verifier reports missing package as machine-readable JSON', () => {
  const scriptPath = path.join(repoRoot, 'tools/verify-yingyue-deploy-package.ps1');
  const missingPackageRoot = path.join(os.tmpdir(), `yy-missing-package-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const result = spawnSync('powershell', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-PackageDir',
    missingPackageRoot,
    '-AsJson',
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0, 'missing package should fail');
  assert.equal(result.stderr.trim(), '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.equal(report.stage, 'resolvePackage');
  assert.match(report.packageDir.replaceAll('\\', '/'), /yy-missing-package-/);
  assert.match(report.message, /deploy package not found/);
  assert.equal(report.failureCount, 1);
});
