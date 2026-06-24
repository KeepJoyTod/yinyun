[CmdletBinding()]
param(
    [string]$PackageDir = '',

    [switch]$AsJson,

    [string]$OutputJsonPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot

function Resolve-DeployPackageDir {
    param([string]$InputPackageDir)

    if (-not [string]::IsNullOrWhiteSpace($InputPackageDir)) {
        return [System.IO.Path]::GetFullPath($InputPackageDir)
    }

    $parent = Split-Path -Parent $PSScriptRoot
    if (Test-Path -LiteralPath (Join-Path $parent 'DEPLOY_PACKAGE_README.md')) {
        return [System.IO.Path]::GetFullPath($parent)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot 'dist/yingyue-api-deploy'))
}

function New-Check {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = ''
    )

    return [pscustomobject]@{
        name = $Name
        status = $Status
        detail = $Detail
    }
}

function New-DeployPackageReport {
    param(
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$PackageDir = '',
        [object[]]$Checks = @(),
        [string]$Stage = '',
        [string]$Message = ''
    )

    $failed = @($Checks | Where-Object { $_.status -eq 'FAIL' })
    return [ordered]@{
        status = $Status
        packageDir = $PackageDir
        checkedAt = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
        failureCount = if ($Status -eq 'FAIL' -and $failed.Count -eq 0) { 1 } else { $failed.Count }
        stage = $Stage
        message = $Message
        checks = @($Checks)
    }
}

function Complete-DeployPackageVerification {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [int]$ExitCode = 0
    )

    Write-DeployPackageVerificationJsonArtifact -Report $Report -OutputJsonPath $OutputJsonPath

    if ($AsJson) {
        $Report | ConvertTo-Json -Depth 6
        exit $ExitCode
    }

    if ($ExitCode -ne 0) {
        throw $Report.message
    }
}

function Test-RequiredFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [long]$MinBytes = 1
    )

    $path = Join-Path $Root $RelativePath
    if (-not (Test-Path -LiteralPath $path)) {
        return New-Check -Name "file:$RelativePath" -Status 'FAIL' -Detail 'missing'
    }

    $item = Get-Item -LiteralPath $path
    if ($item.Length -lt $MinBytes) {
        return New-Check -Name "file:$RelativePath" -Status 'FAIL' -Detail "too small: $($item.Length) bytes"
    }

    return New-Check -Name "file:$RelativePath" -Status 'PASS' -Detail "$($item.Length) bytes"
}

function Test-ReadmeContains {
    param(
        [Parameter(Mandatory = $true)][string]$Readme,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($Readme -match $Pattern) {
        return New-Check -Name $Name -Status 'PASS' -Detail $Pattern
    }

    return New-Check -Name $Name -Status 'FAIL' -Detail "missing pattern: $Pattern"
}

function Resolve-PowerShellHost {
    $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $pwsh) {
        return $pwsh.Source
    }

    $windowsPowerShell = Get-Command powershell -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $windowsPowerShell) {
        return $windowsPowerShell.Source
    }

    throw 'PowerShell host not found for deploy package self-check.'
}

function Compress-CheckDetail {
    param(
        [string]$Text,
        [int]$MaxLength = 300
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ''
    }

    $normalized = $Text -replace '\s+', ' '
    if ($normalized.Length -le $MaxLength) {
        return $normalized
    }

    return $normalized.Substring(0, $MaxLength) + '...'
}

function Invoke-PackageReleaseGateJsonSelfCheck {
    param(
        [Parameter(Mandatory = $true)][string]$Root
    )

    $gateScript = Join-Path $Root 'tools/verify-photo-pickup-release-gate.ps1'
    if (-not (Test-Path -LiteralPath $gateScript)) {
        return New-Check -Name 'release-gate-json:self-check' -Status 'FAIL' -Detail 'release gate script missing'
    }

    $powerShellHost = Resolve-PowerShellHost
    $evidenceRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('yingyue-deploy-gate-empty-evidence-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Force -Path $evidenceRoot | Out-Null

    try {
        $global:LASTEXITCODE = 0
        $output = & $powerShellHost -NoProfile -ExecutionPolicy Bypass -File $gateScript -EvidenceRoot $evidenceRoot -AsJson 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
        $jsonText = (($output | ForEach-Object { [string]$_ }) -join [Environment]::NewLine).Trim()

        if ([string]::IsNullOrWhiteSpace($jsonText)) {
            return New-Check -Name 'release-gate-json:self-check' -Status 'FAIL' -Detail "empty output exit=$exitCode"
        }

        try {
            $gateReport = $jsonText | ConvertFrom-Json
        } catch {
            $detail = Compress-CheckDetail -Text "non-json output exit=$exitCode output=$jsonText"
            return New-Check -Name 'release-gate-json:self-check' -Status 'FAIL' -Detail $detail
        }

        $status = [string]$gateReport.status
        $stage = [string]$gateReport.stage
        $allowedStatuses = @('BLOCKED', 'PARTIAL', 'PASSED')
        if ($allowedStatuses -notcontains $status) {
            return New-Check -Name 'release-gate-json:self-check' -Status 'FAIL' -Detail "unexpected status=$status exit=$exitCode stage=$stage"
        }

        if ($status -eq 'BLOCKED' -and $exitCode -eq 0) {
            return New-Check -Name 'release-gate-json:self-check' -Status 'FAIL' -Detail "blocked gate returned success exit=$exitCode stage=$stage"
        }

        return New-Check -Name 'release-gate-json:self-check' -Status 'PASS' -Detail "status=$status exit=$exitCode stage=$stage"
    } finally {
        if (Test-Path -LiteralPath $evidenceRoot) {
            Remove-Item -LiteralPath $evidenceRoot -Recurse -Force
        }
    }
}

function Write-DeployPackageVerificationJsonArtifact {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [string]$OutputJsonPath
    )

    if ([string]::IsNullOrWhiteSpace($OutputJsonPath)) {
        return
    }

    $parent = Split-Path -Parent $OutputJsonPath
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    $json = $Report | ConvertTo-Json -Depth 6
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($OutputJsonPath, $json, $utf8NoBom)
}

function ConvertTo-PackageRelativePath {
    param(
        [Parameter(Mandatory = $true)][string]$RootFullPath,
        [Parameter(Mandatory = $true)][string]$FullPath
    )

    $root = [System.IO.Path]::GetFullPath($RootFullPath).TrimEnd('\', '/')
    $path = [System.IO.Path]::GetFullPath($FullPath)
    if ($path.Length -le $root.Length -or -not $path.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $path.Replace('\', '/')
    }

    return $path.Substring($root.Length + 1).Replace('\', '/')
}

function Test-ForbiddenSecretFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root
    )

    $forbiddenMatches = [System.Collections.Generic.List[string]]::new()
    $allowedRelativePaths = @(
        'backend/.env.production.example'
    )
    $forbiddenNamePatterns = @(
        '^\.env\.production$',
        '^\.env\.local$',
        '^APPSecret(\..*)?$',
        '^APPID(\..*)?$',
        'AccessKey',
        'Secret',
        'secret'
    )

    $rootFullPath = (Get-Item -LiteralPath $Root).FullName
    $files = Get-ChildItem -LiteralPath $Root -Recurse -File -Force
    foreach ($file in $files) {
        $relativePath = ConvertTo-PackageRelativePath -RootFullPath $rootFullPath -FullPath $file.FullName
        if ($allowedRelativePaths -contains $relativePath) {
            continue
        }

        foreach ($pattern in $forbiddenNamePatterns) {
            if ($file.Name -match $pattern -or $relativePath -match $pattern) {
                $forbiddenMatches.Add($relativePath)
                break
            }
        }
    }

    if ($forbiddenMatches.Count -gt 0) {
        $detail = Compress-CheckDetail -Text (($forbiddenMatches | Sort-Object -Unique) -join ', ')
        return New-Check -Name 'secret-files:denylist' -Status 'FAIL' -Detail $detail
    }

    return New-Check -Name 'secret-files:denylist' -Status 'PASS' -Detail 'no forbidden secret filenames found; env.production.example allowed'
}

$resolvedPackageDir = Resolve-DeployPackageDir -InputPackageDir $PackageDir
if (-not (Test-Path -LiteralPath $resolvedPackageDir)) {
    $report = New-DeployPackageReport `
        -Status 'FAIL' `
        -PackageDir $resolvedPackageDir `
        -Stage 'resolvePackage' `
        -Message "deploy package not found: $resolvedPackageDir"
    Complete-DeployPackageVerification -Report $report -ExitCode 1
}

$checks = [System.Collections.Generic.List[object]]::new()

$requiredFiles = @(
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
    'sql/postgres/postgres_yy_order_payment_migration_20260611.sql',
    'sql/postgres/postgres_yy_channel_event_inbox_migration_20260612.sql',
    'sql/postgres/postgres_yy_merchant_decoration_migration_20260619.sql',
    'tools/yingyue-production-preflight.ps1',
    'tools/yingyue-platform-readiness.ps1',
    'tools/yingyue-douyin-album-audit.ps1',
    'tools/verify-photo-pickup-access-audit.ps1',
    'tools/print-miniapp-acceptance-handoff.ps1',
    'tools/photo-pickup-smoke.ps1',
    'tools/photo-pickup-local-acceptance.ps1',
    'tools/new-photo-pickup-real-oss-evidence.ps1',
    'tools/get-yingyue-delivery-status.ps1',
    'tools/verify-photo-pickup-real-oss-summary.ps1',
    'tools/verify-latest-photo-pickup-real-oss-summary.ps1',
    'tools/verify-photo-pickup-release-gate.ps1',
    'tools/get-photo-pickup-release-status.ps1',
    'tools/verify-yingyue-deploy-package.ps1',
    'docs/photo-pickup-smoke.md',
    'docs/photo-pickup-final-verification-runbook.md',
    'docs/yingyue-project-detection-runbook.md',
    'docs/evidence/miniapp-acceptance-handoff-20260611.md'
)

foreach ($file in $requiredFiles) {
    $checks.Add((Test-RequiredFile -Root $resolvedPackageDir -RelativePath $file))
}

$readmePath = Join-Path $resolvedPackageDir 'DEPLOY_PACKAGE_README.md'
if (Test-Path -LiteralPath $readmePath) {
    $readme = Get-Content -LiteralPath $readmePath -Raw
    $readmePatterns = @(
        @{ Name = 'readme:project-delivery-status'; Pattern = 'get-yingyue-delivery-status\.ps1' },
        @{ Name = 'readme:project-delivery-status-json'; Pattern = 'yingyue-delivery-status\.json' },
        @{ Name = 'readme:project-delivery-external-acceptance'; Pattern = 'READY_FOR_EXTERNAL_ACCEPTANCE' },
        @{ Name = 'readme:client-order-token-secret'; Pattern = 'YY_CLIENT_ORDER_TOKEN_SECRET' },
        @{ Name = 'readme:miniapp-acceptance-handoff'; Pattern = 'print-miniapp-acceptance-handoff\.ps1' },
        @{ Name = 'readme:release-status'; Pattern = 'get-photo-pickup-release-status\.ps1' },
        @{ Name = 'readme:release-status-json'; Pattern = '-AsJson' },
        @{ Name = 'readme:release-status-artifact'; Pattern = '-OutputJsonPath' },
        @{ Name = 'readme:release-status-preflight-flag'; Pattern = 'preflightRan' },
        @{ Name = 'readme:release-status-local-acceptance-flag'; Pattern = 'localAcceptanceRan' },
        @{ Name = 'readme:release-status-evidence-integrity'; Pattern = 'evidence Markdown exists' },
        @{ Name = 'readme:release-status-summary-path-integrity'; Pattern = 'summaryJsonPath matches the checked summary' },
        @{ Name = 'readme:release-status-bare-oss-integrity'; Pattern = 'sanitized bare OSS URL' },
        @{ Name = 'readme:release-status-aliyun-oss-url'; Pattern = 'HTTPS Aliyun OSS bare object URL' },
        @{ Name = 'readme:real-oss-required-inputs'; Pattern = 'new-photo-pickup-real-oss-evidence\.ps1 -PrintRequiredInputs' },
        @{ Name = 'readme:real-oss-auto-resolve-command'; Pattern = '-AutoResolve -RunPreflight -RunLocalAcceptance' },
        @{ Name = 'readme:real-oss-auto-evidence-command'; Pattern = '-RunPreflight -RunLocalAcceptance' },
        @{ Name = 'readme:real-oss-final-pass-command'; Pattern = '-ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit' },
        @{ Name = 'readme:real-oss-placeholder-fields'; Pattern = '-Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>" -AssetId "<asset-id>"' },
        @{ Name = 'readme:release-gate'; Pattern = 'verify-photo-pickup-release-gate\.ps1' },
        @{ Name = 'readme:release-gate-json'; Pattern = 'verify-photo-pickup-release-gate\.ps1 -AsJson' },
        @{ Name = 'readme:evidence-root'; Pattern = '-EvidenceRoot' },
        @{ Name = 'readme:deploy-package-verifier'; Pattern = 'verify-yingyue-deploy-package\.ps1' },
        @{ Name = 'readme:deploy-package-verifier-json'; Pattern = 'verify-yingyue-deploy-package\.ps1 -PackageDir \. -AsJson' },
        @{ Name = 'readme:deploy-package-verifier-artifact'; Pattern = 'verify-yingyue-deploy-package\.ps1 -PackageDir \. -OutputJsonPath docs/evidence/yingyue-deploy-package-status\.json' },
        @{ Name = 'readme:deploy-package-release-gate-self-check'; Pattern = 'release-gate-json:self-check' },
        @{ Name = 'readme:no-secret-files-in-package'; Pattern = 'secret-files:denylist' },
        @{ Name = 'readme:no-secret-warning'; Pattern = 'Do not upload real `\.env\.production` or cloud AccessKey files back into Git\.' }
    )

    foreach ($entry in $readmePatterns) {
        $checks.Add((Test-ReadmeContains -Readme $readme -Pattern $entry.Pattern -Name $entry.Name))
    }
}

$checks.Add((Invoke-PackageReleaseGateJsonSelfCheck -Root $resolvedPackageDir))
$checks.Add((Test-ForbiddenSecretFiles -Root $resolvedPackageDir))

$failed = @($checks | Where-Object { $_.status -eq 'FAIL' })
$report = New-DeployPackageReport `
    -Status $(if ($failed.Count -eq 0) { 'PASS' } else { 'FAIL' }) `
    -PackageDir $resolvedPackageDir `
    -Checks @($checks) `
    -Stage 'verifyPackage' `
    -Message $(if ($failed.Count -eq 0) { 'deploy package verification passed' } else { "deploy package verification failed: $($failed.Count) failure(s)." })

Write-DeployPackageVerificationJsonArtifact -Report $report -OutputJsonPath $OutputJsonPath

if ($AsJson) {
    $report | ConvertTo-Json -Depth 6
} else {
    Write-Host 'yingyue deploy package verification'
    Write-Host "packageDir: $resolvedPackageDir"
    $checks | Format-Table -AutoSize
    Write-Host "status: $($report.status)"
}

if ($failed.Count -gt 0) {
    throw "deploy package verification failed: $($failed.Count) failure(s)."
}
