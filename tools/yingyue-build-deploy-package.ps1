[CmdletBinding()]
param(
    [string]$OutputDir,

    [switch]$Build,

    [switch]$Clean
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot 'dist/yingyue-api-deploy'
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDir)
$resolvedRepo = [System.IO.Path]::GetFullPath($repoRoot)

if (-not $resolvedOutput.StartsWith($resolvedRepo, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "OutputDir must be inside repo: $resolvedOutput"
}

function Copy-RequiredFile {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    if (-not (Test-Path -LiteralPath $Source)) {
        throw "required file not found: $Source"
    }

    $parent = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

if ($Build) {
    Push-Location (Join-Path $repoRoot 'backend')
    try {
        & mvn -pl ruoyi-admin -am -DskipTests package
    } finally {
        Pop-Location
    }
}

if ($Clean -and (Test-Path -LiteralPath $resolvedOutput)) {
    Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$jarPath = Join-Path $repoRoot 'backend/ruoyi-admin/target/ruoyi-admin.jar'
Copy-RequiredFile -Source $jarPath -Destination (Join-Path $resolvedOutput 'backend/ruoyi-admin.jar')

Copy-RequiredFile -Source (Join-Path $repoRoot 'backend/.env.example') -Destination (Join-Path $resolvedOutput 'backend/.env.production.example')
Copy-RequiredFile -Source (Join-Path $repoRoot 'backend/script/deploy/yingyue-admin.service.example') -Destination (Join-Path $resolvedOutput 'deploy/yingyue-admin.service.example')
Copy-RequiredFile -Source (Join-Path $repoRoot 'backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf') -Destination (Join-Path $resolvedOutput 'conf/nginx/yingyue-api.nginx.example.conf')
Copy-RequiredFile -Source (Join-Path $repoRoot 'backend/script/docker/caddy/YingyueApi.Caddyfile.example') -Destination (Join-Path $resolvedOutput 'conf/caddy/YingyueApi.Caddyfile.example')
$postgresSqlFiles = @(
    'postgres_ry_vue_5.X.sql',
    'postgres_ry_job.sql',
    'postgres_ry_workflow.sql',
    'postgres_yy_cloud.sql',
    'postgres_yy_cloud_codegen.sql',
    'postgres_yy_cloud_demo_data.sql',
    'postgres_yy_channel_life_migration_20260606.sql',
    'postgres_yy_ops_crud_migration_20260606.sql',
    'postgres_yy_photo_private_oss_migration_20260606.sql',
    'postgres_yy_photo_asset_object_key_guard_20260607.sql',
    'postgres_yy_order_payment_migration_20260611.sql',
    'postgres_yy_channel_event_inbox_migration_20260612.sql',
    'postgres_yy_merchant_decoration_migration_20260619.sql'
)

foreach ($sqlFile in $postgresSqlFiles) {
    Copy-RequiredFile `
        -Source (Join-Path $repoRoot "backend/script/sql/postgres/$sqlFile") `
        -Destination (Join-Path $resolvedOutput "sql/postgres/$sqlFile")
}
$toolFiles = @(
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
    'verify-yingyue-deploy-package.ps1'
)

foreach ($toolFile in $toolFiles) {
    Copy-RequiredFile `
        -Source (Join-Path $repoRoot "tools/$toolFile") `
        -Destination (Join-Path $resolvedOutput "tools/$toolFile")
}

$docFiles = @(
    'yingyue-springboot-production-deploy.md',
    'photo-pickup-smoke.md',
    'photo-pickup-final-verification-runbook.md',
    'yingyue-project-detection-runbook.md',
    'evidence/miniapp-acceptance-handoff-20260611.md'
)

foreach ($docFile in $docFiles) {
    Copy-RequiredFile `
        -Source (Join-Path $repoRoot "docs/$docFile") `
        -Destination (Join-Path $resolvedOutput "docs/$docFile")
}

$commit = ''
try {
    $commit = (& git -C $repoRoot rev-parse --short HEAD).Trim()
} catch {
    $commit = 'unknown'
}

$readmeTemplate = @'
# Yingyue API Deploy Package

Commit: {{COMMIT}}
GeneratedAt: {{GENERATED_AT}}

## Files

- `backend/ruoyi-admin.jar`
- `backend/.env.production.example`
- `deploy/yingyue-admin.service.example`
- `conf/nginx/yingyue-api.nginx.example.conf`
- `conf/caddy/YingyueApi.Caddyfile.example`
- `sql/postgres/*.sql`
- `tools/yingyue-production-preflight.ps1`
- `tools/yingyue-platform-readiness.ps1`
- `tools/yingyue-douyin-album-audit.ps1`
- `tools/verify-photo-pickup-access-audit.ps1`
- `tools/print-miniapp-acceptance-handoff.ps1`
- `tools/photo-pickup-smoke.ps1`
- `tools/photo-pickup-local-acceptance.ps1`
- `tools/new-photo-pickup-real-oss-evidence.ps1`
- `tools/get-yingyue-delivery-status.ps1`
- `tools/verify-photo-pickup-real-oss-summary.ps1`
- `tools/verify-latest-photo-pickup-real-oss-summary.ps1`
- `tools/verify-photo-pickup-release-gate.ps1`
- `tools/get-photo-pickup-release-status.ps1`
- `tools/verify-yingyue-deploy-package.ps1`
- `docs/*.md`

## Server Steps

1. Copy `backend/ruoyi-admin.jar` to `/opt/yingyue/backend/ruoyi-admin.jar`.
2. Copy `backend/.env.production.example` to `/opt/yingyue/backend/.env.production`, then fill server-only secrets including `YY_CLIENT_PHOTO_TOKEN_SECRET`, `YY_CLIENT_ORDER_TOKEN_SECRET`, and `YY_CLIENT_PUBLIC_TOKEN_SECRET`.
3. Install `deploy/yingyue-admin.service.example` as the systemd service.
4. Apply Nginx or Caddy template for `https://api.evanshine.me`.
5. For a new PostgreSQL database, apply SQL files in this order:
   `postgres_ry_vue_5.X.sql`, `postgres_ry_job.sql`, `postgres_ry_workflow.sql`,
   `postgres_yy_cloud.sql`, `postgres_yy_cloud_codegen.sql`, and optionally
   `postgres_yy_cloud_demo_data.sql`.
6. For an existing PostgreSQL database, back up first, then apply the dated migration files in order:
   `postgres_yy_channel_life_migration_20260606.sql`,
   `postgres_yy_ops_crud_migration_20260606.sql`,
   `postgres_yy_photo_private_oss_migration_20260606.sql`,
   `postgres_yy_photo_asset_object_key_guard_20260607.sql`,
   `postgres_yy_order_payment_migration_20260611.sql`,
   `postgres_yy_channel_event_inbox_migration_20260612.sql`.
7. Run `tools/yingyue-production-preflight.ps1` from a trusted machine.
8. Run `tools/yingyue-platform-readiness.ps1` before filling platform callback and miniapp domains.
   For the exact WeChat/Douyin import paths, AppIDs, legal domains, test account, and final PASS command, run `tools/print-miniapp-acceptance-handoff.ps1`.
9. After real Douyin callbacks, run `tools/yingyue-douyin-album-audit.ps1` to verify logs and photo album placeholders.
   After customer pickup H5 or miniapp verification, run `tools/verify-photo-pickup-access-audit.ps1` to verify `VERIFY`, `ALBUM_DETAIL`, `PREVIEW`, `DOWNLOAD`, and `STREAM` access audit rows with redacted output.
10. In the full source repo, run the project-level delivery status before final handoff:
    `tools/get-yingyue-delivery-status.ps1 -SkipGithub`
    `tools/get-yingyue-delivery-status.ps1 -SkipGithub -AsJson`
    `tools/get-yingyue-delivery-status.ps1 -SkipGithub -OutputJsonPath docs/evidence/yingyue-delivery-status.json`
    `BLOCKED` means at least one code/build/evidence gate or external manual acceptance item is still open. `READY_FOR_EXTERNAL_ACCEPTANCE` means local artifacts and probes are ready, but platform consoles, miniapp devtools/real-device checks, or Douyin Life real callback logids still need human/platform evidence. `READY` is only possible when there are no failed gates and no external blockers.
11. Before final customer-pickup handoff, run the release status command first:
    `tools/get-photo-pickup-release-status.ps1`
    `tools/get-photo-pickup-release-status.ps1 -AsJson`
    `tools/get-photo-pickup-release-status.ps1 -OutputJsonPath docs/evidence/photo-pickup-release-status.json`
    The release status JSON includes `preflightRan` and `localAcceptanceRan`, and `READY` also requires that evidence Markdown exists, `summaryJsonPath matches the checked summary`, and `bareOssUrl` is a sanitized bare OSS URL, specifically an HTTPS Aliyun OSS bare object URL (`https://<bucket>.oss-<region>.aliyuncs.com/<object-key>`) without signed query params.
    If it reports `BLOCKED`, upload a real private OSS image in the admin album workspace, then print the required input guide:
    `tools/new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs`
    Recommended after upload: let the script auto-resolve album, asset, objectKey, and bare OSS URL from phone + pickup code:
    `tools/new-photo-pickup-real-oss-evidence.ps1 -Phone "<phone>" -AccessCode "<pickup-code>" -AutoResolve -RunPreflight -RunLocalAcceptance`
    Generate automatic evidence with real values:
    `tools/new-photo-pickup-real-oss-evidence.ps1 -Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>" -AssetId "<asset-id>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -RunPreflight -RunLocalAcceptance`
    After H5, WeChat miniapp, Douyin miniapp, and admin audit are all manually accepted, generate the final PASS evidence with auto-resolve first:
    `tools/new-photo-pickup-real-oss-evidence.ps1 -Phone "<phone>" -AccessCode "<pickup-code>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit`
    If a fixed asset must be checked, use the explicit final PASS command:
    `tools/new-photo-pickup-real-oss-evidence.ps1 -Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>" -AssetId "<asset-id>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit`
    Finally run:
    `tools/verify-photo-pickup-release-gate.ps1`
    For automation, the same final gate also supports machine-readable output:
    `tools/verify-photo-pickup-release-gate.ps1 -AsJson`
    `tools/new-photo-pickup-real-oss-evidence.ps1` also writes `photo-pickup-release-status.json` beside the summary JSON.
12. If evidence is stored outside the default `docs/evidence`, pass the same directory to all release checks, for example `tools/get-photo-pickup-release-status.ps1 -EvidenceRoot docs/evidence`, `tools/verify-latest-photo-pickup-real-oss-summary.ps1 -EvidenceRoot docs/evidence -RequireFinalPass`, and `tools/verify-photo-pickup-release-gate.ps1 -EvidenceRoot docs/evidence`.
13. After building or receiving this package, run `tools/verify-yingyue-deploy-package.ps1 -PackageDir .` to confirm the JAR, SQL migrations, release-gate tools, and runbooks are present.
    `tools/verify-yingyue-deploy-package.ps1 -PackageDir . -AsJson`
    `tools/verify-yingyue-deploy-package.ps1 -PackageDir . -OutputJsonPath docs/evidence/yingyue-deploy-package-status.json`
    This package verifier also runs the packaged `tools/verify-photo-pickup-release-gate.ps1 -AsJson` and records `release-gate-json:self-check`. A package verification `PASS` means the package is complete and the gate JSON is parseable; it is not a production release pass unless the final release gate itself reports `PASSED`.
    It also records `secret-files:denylist` and fails if real `.env.production`, `.env.local`, `APPSecret`, `AccessKey`, or Secret-named files are accidentally included. The sample `backend/.env.production.example` is allowed.

Do not upload real `.env.production` or cloud AccessKey files back into Git.
'@

$readme = $readmeTemplate.
    Replace('{{COMMIT}}', $commit).
    Replace('{{GENERATED_AT}}', (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))

$readmePath = Join-Path $resolvedOutput 'DEPLOY_PACKAGE_README.md'
Set-Content -LiteralPath $readmePath -Value $readme -Encoding UTF8

Write-Host 'yingyue deploy package created'
Write-Host "output: $resolvedOutput"
Write-Host "commit: $commit"
