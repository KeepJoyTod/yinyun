[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [string]$EvidenceRoot = '',

    [switch]$SkipNetwork,

    [switch]$SkipGithub,

    [switch]$AsJson,

    [string]$OutputJsonPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EvidenceRoot)) {
    $EvidenceRoot = Join-Path $repoRoot 'docs/evidence'
}

function New-Check {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = '',
        [string]$Next = ''
    )

    return [pscustomobject]@{
        name = $Name
        status = $Status
        detail = $Detail
        next = $Next
    }
}

function Test-PathCheck {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Path,
        [string]$Next = ''
    )

    if (Test-Path -LiteralPath $Path) {
        return New-Check -Name $Name -Status 'PASS' -Detail $Path
    }

    return New-Check -Name $Name -Status 'FAIL' -Detail "missing: $Path" -Next $Next
}

function Invoke-JsonScript {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [hashtable]$Parameters = @{}
    )

    $powerShellCommand = Get-Command pwsh -ErrorAction SilentlyContinue
    if ($null -eq $powerShellCommand) {
        $powerShellCommand = Get-Command powershell -ErrorAction Stop
    }

    $argumentList = [System.Collections.Generic.List[string]]::new()
    $argumentList.Add('-NoProfile')
    $argumentList.Add('-ExecutionPolicy')
    $argumentList.Add('Bypass')
    $argumentList.Add('-File')
    $argumentList.Add($ScriptPath)

    foreach ($entry in $Parameters.GetEnumerator() | Sort-Object Key) {
        $name = [string]$entry.Key
        $value = $entry.Value
        if ($null -eq $value) {
            continue
        }

        if ($value -is [bool]) {
            if ($value) {
                $argumentList.Add("-$name")
            }
            continue
        }

        if ($value -is [System.Array]) {
            foreach ($item in $value) {
                if ($null -eq $item) {
                    continue
                }
                $argumentList.Add("-$name")
                $argumentList.Add([string]$item)
            }
            continue
        }

        $argumentList.Add("-$name")
        $argumentList.Add([string]$value)
    }

    $output = & $powerShellCommand.Source @argumentList 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
    $text = (($output | ForEach-Object { [string]$_ }) -join [Environment]::NewLine).Trim()
    return [pscustomobject]@{
        exitCode = $exitCode
        text = $text
    }
}

function Write-JsonArtifact {
    param(
        [Parameter(Mandatory = $true)]$Report,
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    $json = $Report | ConvertTo-Json -Depth 8
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $json, $utf8NoBom)
}

function ConvertTo-ShortText {
    param(
        [string]$Text,
        [int]$MaxLength = 500
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

function Decode-Utf8 {
    param(
        [Parameter(Mandatory = $true)][string]$Base64
    )

    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Base64))
}

function Get-LatestEvidenceJson {
    param(
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    if (-not (Test-Path -LiteralPath $EvidenceRoot)) {
        return $null
    }

    return Get-ChildItem -LiteralPath $EvidenceRoot -Filter $Pattern -File |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

function ConvertTo-RepoGitPath {
    param(
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $root = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd('\', '/')
    if ($fullPath.Length -le $root.Length -or -not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return ''
    }

    return $fullPath.Substring($root.Length + 1).Replace('\', '/')
}

function Get-FilteredGitStatus {
    param(
        [string]$IgnoredPath = ''
    )

    $ignoredGitPath = ConvertTo-RepoGitPath -Path $IgnoredPath
    $lines = @(& git -C $repoRoot status --short)
    if ([string]::IsNullOrWhiteSpace($ignoredGitPath)) {
        return $lines
    }

    return @($lines | Where-Object {
        $line = [string]$_
        $path = if ($line.Length -gt 3) { $line.Substring(3).Replace('\', '/') } else { '' }
        $path -ne $ignoredGitPath
    })
}

$checks = [System.Collections.Generic.List[object]]::new()
$externalBlockers = [System.Collections.Generic.List[string]]::new()
$photoPickupReleaseReady = $false
$douyinLifeAcceptanceReady = $false

$gitStatus = (Get-FilteredGitStatus -IgnoredPath $OutputJsonPath) -join [Environment]::NewLine
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    $checks.Add((New-Check -Name 'git-working-tree' -Status 'PASS' -Detail 'clean'))
} else {
    $checks.Add((New-Check -Name 'git-working-tree' -Status 'WARN' -Detail (ConvertTo-ShortText -Text $gitStatus) -Next 'commit or intentionally leave generated artifacts untracked before release handoff'))
}

$checks.Add((Test-PathCheck -Name 'admin-ui-dist' -Path (Join-Path $repoRoot 'admin-ui/dist/index.html') -Next 'cd admin-ui; npm run build:dev'))
$checks.Add((Test-PathCheck -Name 'client-web-dist' -Path (Join-Path $repoRoot 'client-web/dist/index.html') -Next 'cd client-web; npm run build'))
$checks.Add((Test-PathCheck -Name 'studio-workbench-dist' -Path (Join-Path $repoRoot 'studio-workbench/dist/index.html') -Next 'cd studio-workbench; npm run build'))
$checks.Add((Test-PathCheck -Name 'mobile-h5-dist' -Path (Join-Path $repoRoot 'mobile-uniapp/dist/build/h5/index.html') -Next 'cd mobile-uniapp; npm run build:h5'))
$checks.Add((Test-PathCheck -Name 'wechat-miniapp-dist' -Path (Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-weixin/project.config.json') -Next 'cd mobile-uniapp; npm run build:mp-weixin'))
$checks.Add((Test-PathCheck -Name 'douyin-miniapp-dist' -Path (Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-toutiao/project.config.json') -Next 'cd mobile-uniapp; npm run build:mp-toutiao'))

$platformScript = Join-Path $repoRoot 'tools/yingyue-platform-readiness.ps1'
if (Test-Path -LiteralPath $platformScript) {
    $platformParams = @{
        BaseUrl = $BaseUrl
    }
    if ($SkipNetwork) { $platformParams.SkipNetwork = $true }
    if ($SkipGithub) { $platformParams.SkipGithub = $true }
    $platform = Invoke-JsonScript -ScriptPath $platformScript -Parameters $platformParams
    if ($platform.exitCode -eq 0 -and $platform.text -match 'platform readiness passed') {
        $checks.Add((New-Check -Name 'platform-readiness' -Status 'PASS' -Detail 'api domain, webhook challenge, miniapp dists and AppIDs passed'))
    } else {
        $checks.Add((New-Check -Name 'platform-readiness' -Status 'FAIL' -Detail (ConvertTo-ShortText -Text $platform.text) -Next '.\tools\yingyue-platform-readiness.ps1 -BaseUrl https://api.evanshine.me'))
    }
} else {
    $checks.Add((New-Check -Name 'platform-readiness' -Status 'FAIL' -Detail 'missing platform readiness script'))
}

$releaseStatusScript = Join-Path $repoRoot 'tools/get-photo-pickup-release-status.ps1'
if (Test-Path -LiteralPath $releaseStatusScript) {
    $release = Invoke-JsonScript -ScriptPath $releaseStatusScript -Parameters @{
        EvidenceRoot = $EvidenceRoot
        AsJson = $true
    }
    if ($release.exitCode -eq 0) {
        try {
            $releaseJson = $release.text | ConvertFrom-Json
            if ([string]$releaseJson.status -eq 'READY') {
                $checks.Add((New-Check -Name 'photo-pickup-release' -Status 'PASS' -Detail 'final real OSS evidence is READY'))
                $photoPickupReleaseReady = $true
            } else {
                $missing = @($releaseJson.missing) -join '; '
                $checks.Add((New-Check -Name 'photo-pickup-release' -Status 'FAIL' -Detail "status=$($releaseJson.status); missing=$missing" -Next '.\tools\get-photo-pickup-release-status.ps1'))
                foreach ($item in @($releaseJson.missing)) {
                    $externalBlockers.Add("$(Decode-Utf8 '5a6i5oi35Y+W54mH5pyA57uI6aqM5pS257y65aSx77ya')$item")
                }
            }
        } catch {
            $checks.Add((New-Check -Name 'photo-pickup-release' -Status 'FAIL' -Detail "release status JSON parse failed: $($_.Exception.Message)" -Next '.\tools\get-photo-pickup-release-status.ps1 -AsJson'))
        }
    } else {
        $checks.Add((New-Check -Name 'photo-pickup-release' -Status 'FAIL' -Detail (ConvertTo-ShortText -Text $release.text) -Next '.\tools\get-photo-pickup-release-status.ps1'))
    }
} else {
    $checks.Add((New-Check -Name 'photo-pickup-release' -Status 'FAIL' -Detail 'missing release status script'))
}

$douyinLifeEvidence = Get-LatestEvidenceJson -Pattern 'douyin-life-acceptance-status-*.json'
if ($null -eq $douyinLifeEvidence) {
    $checks.Add((New-Check -Name 'douyin-life-acceptance' -Status 'WARN' -Detail 'missing Douyin Life acceptance status evidence' -Next '.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>" -OutputJsonPath docs\evidence\douyin-life-acceptance-status-<timestamp>.json'))
} else {
    try {
        $douyinLifeJson = Get-Content -LiteralPath $douyinLifeEvidence.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        $requiredCases = @($douyinLifeJson.cases | Where-Object { [bool]$_.required })
        $notPassedRequired = @($requiredCases | Where-Object { [string]$_.status -ne 'PASS' })
        if ([string]$douyinLifeJson.status -eq 'PASS' -and $notPassedRequired.Count -eq 0) {
            $checks.Add((New-Check -Name 'douyin-life-acceptance' -Status 'PASS' -Detail "evidence=$($douyinLifeEvidence.Name); required cases passed=$($requiredCases.Count)"))
            $douyinLifeAcceptanceReady = $true
        } else {
            $pendingLabels = @($notPassedRequired | ForEach-Object { "$($_.label):$($_.status)" }) -join '; '
            $checks.Add((New-Check -Name 'douyin-life-acceptance' -Status 'WARN' -Detail "evidence=$($douyinLifeEvidence.Name); status=$($douyinLifeJson.status); pending=$pendingLabels" -Next '.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>"'))
        }
    } catch {
        $checks.Add((New-Check -Name 'douyin-life-acceptance' -Status 'WARN' -Detail "acceptance evidence parse failed: $($_.Exception.Message)" -Next '.\tools\get-douyin-life-acceptance-status.ps1 -AsJson'))
    }
}

# Keep this script saved as UTF-8 with BOM so Windows PowerShell 5.1 parses Chinese comments correctly.
if (-not $photoPickupReleaseReady) {
    # 微信小程序合法域名已由用户确认完成：request/uploadFile/downloadFile 均为 https://api.evanshine.me；仍需开发者工具或真机验收。
    $wechatMiniappBlocker = Decode-Utf8 '5b6u5L+h5bCP56iL5bqP5ZCI5rOV5Z+f5ZCN5bey55Sx55So5oi356Gu6K6k5a6M5oiQ77yacmVxdWVzdC91cGxvYWRGaWxlL2Rvd25sb2FkRmlsZSDlnYfkuLogaHR0cHM6Ly9hcGkuZXZhbnNoaW5lLm1l77yb5LuN6ZyA5byA5Y+R6ICF5bel5YW35oiW55yf5py66aqM5pS244CC'
    $externalBlockers.Add($wechatMiniappBlocker)
    # 抖音小程序合法域名已由用户确认完成：request/uploadFile/downloadFile 均为 https://api.evanshine.me；仍需开发者工具或真机验收。
    $douyinMiniappBlocker = Decode-Utf8 '5oqW6Z+z5bCP56iL5bqP5ZCI5rOV5Z+f5ZCN5bey55Sx55So5oi356Gu6K6k5a6M5oiQ77yacmVxdWVzdC91cGxvYWRGaWxlL2Rvd25sb2FkRmlsZSDlnYfkuLogaHR0cHM6Ly9hcGkuZXZhbnNoaW5lLm1l77yb5LuN6ZyA5byA5Y+R6ICF5bel5YW35oiW55yf5py66aqM5pS244CC'
    $externalBlockers.Add($douyinMiniappBlocker)
}
# 抖音来客真实验收需要平台侧能力和真实触发：发券 SPI logid、创单/支付回调、接单 logid、核销 logid。
if (-not $douyinLifeAcceptanceReady) {
    $douyinLifeBlocker = Decode-Utf8 '5oqW6Z+z5p2l5a6i55yf5a6e6aqM5pS26ZyA6KaB5bmz5Y+w5L6n6IO95Yqb5ZKM55yf5a6e6Kem5Y+R77ya5Y+R5Yi4IFNQSSBsb2dpZOOAgeWIm+WNlS/mlK/ku5jlm57osIPjgIHmjqXljZUgbG9naWTjgIHmoLjplIAgbG9naWTjgII='
    $externalBlockers.Add($douyinLifeBlocker + ' Run .\tools\get-douyin-life-acceptance-status.ps1 for the latest PASS/PENDING table.')
}

$failures = @($checks | Where-Object { $_.status -eq 'FAIL' })
$warnings = @($checks | Where-Object { $_.status -eq 'WARN' })
$status = if ($failures.Count -gt 0) { 'BLOCKED' } else { 'READY_FOR_EXTERNAL_ACCEPTANCE' }
if ($status -eq 'READY_FOR_EXTERNAL_ACCEPTANCE' -and $externalBlockers.Count -eq 0) {
    $status = 'READY'
}

$report = [ordered]@{
    status = $status
    checkedAt = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')
    repoRoot = $repoRoot
    baseUrl = $BaseUrl
    evidenceRoot = $EvidenceRoot
    failureCount = $failures.Count
    warningCount = $warnings.Count
    checks = @($checks)
    externalBlockers = @($externalBlockers)
    nextCommands = @(
        '.\tools\get-yingyue-delivery-status.ps1 -AsJson',
        '.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>"',
        '.\tools\print-miniapp-acceptance-handoff.ps1',
        '.\tools\get-photo-pickup-release-status.ps1',
        '.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs',
        '.\tools\verify-photo-pickup-release-gate.ps1 -AsJson'
    )
}

Write-JsonArtifact -Report $report -Path $OutputJsonPath

if ($AsJson) {
    $report | ConvertTo-Json -Depth 8
    if ($status -eq 'BLOCKED') {
        exit 1
    }
    exit 0
}

Write-Host 'yingyue delivery status'
Write-Host "status: $status"
Write-Host "baseUrl: $BaseUrl"
Write-Host "evidenceRoot: $EvidenceRoot"
Write-Host ''
$checks | Format-Table -AutoSize | Out-String | Write-Host
if ($externalBlockers.Count -gt 0) {
    Write-Host 'external blockers'
    foreach ($item in $externalBlockers) {
        Write-Host "- $item"
    }
}
Write-Host ''
Write-Host 'next commands'
foreach ($command in $report.nextCommands) {
    Write-Host $command
}

if ($status -eq 'BLOCKED') {
    throw "yingyue delivery blocked: $($failures.Count) failed checks"
}
