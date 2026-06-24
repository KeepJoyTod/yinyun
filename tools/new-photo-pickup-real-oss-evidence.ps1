[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [string]$Phone = '',

    [string]$AccessCode = '',

    [string]$AlbumId = '',

    [string]$AssetId = '',

    [string]$BareOssUrl = '',

    [string]$ObjectKey = '',

    [string]$ThumbnailObjectKey = '',

    [string]$Operator = '',

    [string]$OutputPath = '',

    [string]$SummaryJsonPath = '',

    [switch]$AutoResolve,

    [switch]$RunPreflight,

    [switch]$RunLocalAcceptance,

    [switch]$ConfirmManualAcceptance,

    [switch]$ConfirmH5Pickup,

    [switch]$ConfirmWechatMiniapp,

    [switch]$ConfirmDouyinMiniapp,

    [switch]$ConfirmAdminAudit,

    [switch]$PrintRequiredInputs
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$evidenceRoot = Join-Path $repoRoot 'docs/evidence'
$summaryVerifier = Join-Path $repoRoot 'tools/verify-photo-pickup-real-oss-summary.ps1'
$releaseStatus = Join-Path $repoRoot 'tools/get-photo-pickup-release-status.ps1'
$root = $BaseUrl.TrimEnd('/')
$now = Get-Date
$stamp = $now.ToString('yyyyMMdd-HHmmss')

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $evidenceRoot "photo-pickup-real-oss-acceptance-$stamp.md"
}

if ([string]::IsNullOrWhiteSpace($SummaryJsonPath)) {
    $SummaryJsonPath = Join-Path $evidenceRoot "photo-pickup-real-oss-acceptance-$stamp.json"
}

$releaseStatusEvidenceRoot = Split-Path -Parent $SummaryJsonPath
if ([string]::IsNullOrWhiteSpace($releaseStatusEvidenceRoot)) {
    $releaseStatusEvidenceRoot = $evidenceRoot
}
$releaseStatusJsonPath = Join-Path $releaseStatusEvidenceRoot 'photo-pickup-release-status.json'

if (-not (Test-Path -LiteralPath $evidenceRoot)) {
    New-Item -ItemType Directory -Path $evidenceRoot | Out-Null
}

function ConvertTo-MarkdownValue {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return '<待填写>'
    }
    return $Value.Replace('|', '\|')
}

function ConvertTo-BareObjectUrl {
    param([Parameter(Mandatory = $true)][string]$Url)

    $trimmed = $Url.Trim()
    if ($trimmed.Contains('?')) {
        return $trimmed.Substring(0, $trimmed.IndexOf('?'))
    }
    return $trimmed
}

function Assert-AliyunOssBareObjectUrl {
    param([Parameter(Mandatory = $true)][string]$Url)

    try {
        $uri = [uri]$Url
    } catch {
        throw 'BareOssUrl must be an HTTPS Aliyun OSS object URL'
    }

    if ($uri.Scheme -ne 'https' -or -not ($uri.Host -match '^[^.]+\.oss-[a-z0-9-]+\.aliyuncs\.com$') -or [string]::IsNullOrWhiteSpace($uri.AbsolutePath) -or $uri.AbsolutePath -eq '/' -or -not [string]::IsNullOrWhiteSpace($uri.Query)) {
        throw 'BareOssUrl must be an HTTPS Aliyun OSS object URL'
    }
}

function Join-ApiUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    return $Root.TrimEnd('/') + '/' + $Path.TrimStart('/')
}

function ConvertTo-JsonBody {
    param([Parameter(Mandatory = $true)]$Value)
    return ($Value | ConvertTo-Json -Depth 8 -Compress)
}

function Get-ObjectPropertyValue {
    param(
        $Object,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $Object) {
        return $null
    }
    if ($Object.PSObject.Properties.Match($Name).Count -le 0) {
        return $null
    }
    return $Object.$Name
}

function Get-FirstObjectPropertyValue {
    param(
        $Object,
        [Parameter(Mandatory = $true)][string[]]$Names
    )

    foreach ($name in $Names) {
        $value = Get-ObjectPropertyValue -Object $Object -Name $name
        if (-not [string]::IsNullOrWhiteSpace([string]$value)) {
            return $value
        }
    }
    return $null
}

function Assert-RuoyiSuccess {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $code = Get-ObjectPropertyValue -Object $Response -Name 'code'
    if ($null -ne $code -and [int]$code -ne 200) {
        $message = Get-ObjectPropertyValue -Object $Response -Name 'msg'
        if ([string]::IsNullOrWhiteSpace([string]$message)) {
            $message = 'unknown error'
        }
        throw "$Name failed: code=$code, msg=$message"
    }
}

function Get-Data {
    param([Parameter(Mandatory = $true)]$Response)

    $data = Get-ObjectPropertyValue -Object $Response -Name 'data'
    if ($null -ne $data) {
        return $data
    }
    return $Response
}

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Headers = @{},
        $Body = $null
    )

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        ContentType = 'application/json'
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $params.Body = ConvertTo-JsonBody $Body
    }

    try {
        return Invoke-RestMethod @params
    } catch {
        $message = if ($_.ErrorDetails -and -not [string]::IsNullOrWhiteSpace([string]$_.ErrorDetails.Message)) { [string]$_.ErrorDetails.Message } else { $_.Exception.Message }
        if ($message -match '<html|页面不存在|normalize\.css') {
            $message = 'received HTML page instead of JSON; check BaseUrl API prefix or reverse proxy'
        }
        throw "$Method $Url failed: $message"
    }
}

function ConvertTo-ObjectKeyFromBareUrl {
    param([Parameter(Mandatory = $true)][string]$Url)

    $bareUrl = ConvertTo-BareObjectUrl -Url $Url
    $uri = [uri]$bareUrl
    $path = [uri]::UnescapeDataString($uri.AbsolutePath)
    return $path.TrimStart('/')
}

function Resolve-AutoEvidenceInputs {
    if ([string]::IsNullOrWhiteSpace($Phone)) {
        throw 'AutoResolve requires Phone'
    }
    if ([string]::IsNullOrWhiteSpace($AccessCode)) {
        throw 'AutoResolve requires AccessCode'
    }

    $authResponse = Invoke-JsonRequest `
        -Method 'POST' `
        -Url (Join-ApiUrl $root '/client/photo/auth/verify') `
        -Body @{
            phone = $Phone
            code = $AccessCode
            platform = 'H5'
        }
    Assert-RuoyiSuccess -Response $authResponse -Name 'auth'
    $authData = Get-Data $authResponse
    $clientToken = [string](Get-ObjectPropertyValue -Object $authData -Name 'clientToken')
    if ([string]::IsNullOrWhiteSpace($clientToken)) {
        $clientToken = [string](Get-ObjectPropertyValue -Object $authData -Name 'client_token')
    }
    if ([string]::IsNullOrWhiteSpace($clientToken)) {
        throw 'auto-resolve failed: clientToken is empty'
    }

    $headers = @{
        'X-Client-Token' = $clientToken
    }

    $albumsResponse = Invoke-JsonRequest `
        -Method 'GET' `
        -Url (Join-ApiUrl $root '/client/photo/albums') `
        -Headers $headers
    Assert-RuoyiSuccess -Response $albumsResponse -Name 'albums'
    $albums = @(Get-Data $albumsResponse)
    if ($albums.Count -le 0) {
        throw 'auto-resolve failed: no accessible albums'
    }

    $resolvedAlbumId = $AlbumId
    $detail = $null
    $assets = @()
    $albumsWithId = 0
    $albumsWithoutAssets = 0
    foreach ($album in $albums) {
        $candidateAlbumId = [string](Get-FirstObjectPropertyValue -Object $album -Names @('albumId', 'id'))
        if ([string]::IsNullOrWhiteSpace($candidateAlbumId)) {
            continue
        }
        $albumsWithId += 1
        if (-not [string]::IsNullOrWhiteSpace($resolvedAlbumId) -and $candidateAlbumId -ne $resolvedAlbumId) {
            continue
        }

        $albumPathId = [uri]::EscapeDataString($candidateAlbumId)
        $detailResponse = Invoke-JsonRequest `
            -Method 'GET' `
            -Url (Join-ApiUrl $root "/client/photo/albums/$albumPathId") `
            -Headers $headers
        Assert-RuoyiSuccess -Response $detailResponse -Name 'detail'
        $candidateDetail = Get-Data $detailResponse
        $candidateAssets = @()
        $candidateDetailAssets = Get-ObjectPropertyValue -Object $candidateDetail -Name 'assets'
        if ($null -ne $candidateDetailAssets) {
            $candidateAssets = @($candidateDetailAssets)
        }
        if ($candidateAssets.Count -gt 0) {
            $resolvedAlbumId = $candidateAlbumId
            $detail = $candidateDetail
            $assets = $candidateAssets
            break
        }
        $albumsWithoutAssets += 1
        if (-not [string]::IsNullOrWhiteSpace($AlbumId)) {
            $resolvedAlbumId = $candidateAlbumId
            $detail = $candidateDetail
            $assets = $candidateAssets
            break
        }
    }

    if ([string]::IsNullOrWhiteSpace($resolvedAlbumId)) {
        if ($albumsWithId -le 0) {
            throw 'auto-resolve failed: accessible albums returned but no album id field was found'
        }
        if ([string]::IsNullOrWhiteSpace($AlbumId) -and $albumsWithId -gt 0 -and $albumsWithoutAssets -eq $albumsWithId) {
            throw "auto-resolve failed: accessible albums were found but no album has visible assets; albumsChecked=$albumsWithoutAssets"
        }
        throw "auto-resolve failed: requested albumId was not found; accessible albums with id=$albumsWithId"
    }
    if ($null -eq $detail -or $assets.Count -le 0) {
        if ([string]::IsNullOrWhiteSpace($AlbumId) -and $albumsWithoutAssets -gt 0) {
            throw "auto-resolve failed: accessible albums were found but no album has visible assets; albumsChecked=$albumsWithoutAssets"
        }
        throw 'auto-resolve failed: selected album has no visible assets'
    }

    $resolvedAssetId = $AssetId
    $selectedAsset = $null
    foreach ($asset in $assets) {
        $candidateAssetId = [string](Get-FirstObjectPropertyValue -Object $asset -Names @('assetId', 'id'))
        if ([string]::IsNullOrWhiteSpace($candidateAssetId)) {
            continue
        }
        if ([string]::IsNullOrWhiteSpace($resolvedAssetId) -or $candidateAssetId -eq $resolvedAssetId) {
            $resolvedAssetId = $candidateAssetId
            $selectedAsset = $asset
            break
        }
    }
    if ([string]::IsNullOrWhiteSpace($resolvedAssetId) -or $null -eq $selectedAsset) {
        throw 'auto-resolve failed: assetId was not found in album detail'
    }

    $assetPathId = [uri]::EscapeDataString($resolvedAssetId)
    $previewResponse = Invoke-JsonRequest `
        -Method 'GET' `
        -Url (Join-ApiUrl $root "/client/photo/assets/$assetPathId/preview-url") `
        -Headers $headers
    Assert-RuoyiSuccess -Response $previewResponse -Name 'preview-url'
    $preview = Get-Data $previewResponse
    $signedUrl = [string](Get-ObjectPropertyValue -Object $preview -Name 'url')
    if ([string]::IsNullOrWhiteSpace($signedUrl)) {
        throw 'auto-resolve failed: preview signed URL is empty'
    }

    $resolvedBareOssUrl = ConvertTo-BareObjectUrl -Url $signedUrl
    Assert-AliyunOssBareObjectUrl -Url $resolvedBareOssUrl
    $resolvedObjectKey = ConvertTo-ObjectKeyFromBareUrl -Url $resolvedBareOssUrl
    $resolvedFileName = [string](Get-ObjectPropertyValue -Object $preview -Name 'fileName')

    return [pscustomobject]@{
        AlbumId = $resolvedAlbumId
        AssetId = $resolvedAssetId
        BareOssUrl = $resolvedBareOssUrl
        ObjectKey = $resolvedObjectKey
        FileName = $resolvedFileName
    }
}

function Write-RequiredInputs {
    $autoResolveCommand = @"
cd $repoRoot
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "$root" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance
"@

    $pendingCommand = @"
cd $repoRoot
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "$root" -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -ObjectKey "<object-key>" -RunPreflight -RunLocalAcceptance
"@

    $finalPassCommand = @"
cd $repoRoot
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "$root" -Phone "<手机号>" -AccessCode "<取片码>" -AlbumId "<相册ID>" -AssetId "<底片ID>" -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>" -ObjectKey "<object-key>" -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
"@

    $autoResolveFinalPassCommand = @"
cd $repoRoot
.\tools\new-photo-pickup-real-oss-evidence.ps1 -BaseUrl "$root" -Phone "<手机号>" -AccessCode "<取片码>" -AutoResolve -RunPreflight -RunLocalAcceptance -ConfirmH5Pickup -ConfirmWechatMiniapp -ConfirmDouyinMiniapp -ConfirmAdminAudit
"@

    Write-Host @"
客户取片真实 OSS 验收需要准备这些输入：

自动解析模式必填：
- 手机号：客户相册绑定手机号
- 取片码：客户相册取片码

手填模式额外必填：
- 相册 ID：yy_photo_album.album_id
- 底片 ID：yy_photo_asset.asset_id
- OSS 裸链：不带 query 的 OSS 对象地址，用于验证私有裸链 403

建议同时填写：
- OSS objectKey：yy_photo_asset.object_key / sys_oss.file_name
- 缩略图 objectKey：yy_photo_asset.thumbnail_object_key，没有可留空
- 验收人：本次执行人，写入证据文件

后台取数位置：
- 客片选片 -> 相册管理：找手机号、取片码、相册 ID
- 客片选片 -> 上传照片/底片列表：找底片 ID、OSS Key、缩略图 Key
- 客片选片 -> 相册行 -> 相册工作台 -> 真实 OSS 证据：可复制完整实图验收命令
- OSS 裸链：Bucket 域名 + objectKey，必须去掉签名 URL 后面的 query

常见阻塞：
- 如果 AutoResolve 提示 no album has visible assets：上传真实私有 OSS 图片，并确认底片 visible=1、objectKey 有值。

先打印本清单：

cd $repoRoot
.\tools\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs

一键生成证据命令：

推荐：自动解析模式。上传真实图后，只填手机号和取片码，脚本会自动找相册、底片、OSS 裸链：

$autoResolveCommand

第一步：生成自动证据。未确认 H5、微信、抖音和后台审计前，最终结论会保持 PENDING：

$pendingCommand

第二步：H5、微信小程序、抖音小程序、后台审计都人工验收通过后，再生成最终 PASS 证据：

$autoResolveFinalPassCommand

如果要固定某一张底片，也可以继续使用手填模式：

$finalPassCommand

第三步：查看发布状态并跑总闸门：

cd $repoRoot
.\tools\get-photo-pickup-release-status.ps1
.\tools\verify-photo-pickup-release-gate.ps1

如果只想先看公网空相册基础探针：

cd $repoRoot
.\tools\photo-pickup-smoke.ps1 -BaseUrl "$root" -PreviewAccount
"@
}

function Assert-RequiredInputs {
    $missing = [System.Collections.Generic.List[string]]::new()
    if ([string]::IsNullOrWhiteSpace($Phone)) { $missing.Add('手机号') }
    if ([string]::IsNullOrWhiteSpace($AccessCode)) { $missing.Add('取片码') }
    if ([string]::IsNullOrWhiteSpace($AlbumId)) { $missing.Add('相册 ID') }
    if ([string]::IsNullOrWhiteSpace($AssetId)) { $missing.Add('底片 ID') }
    if ([string]::IsNullOrWhiteSpace($BareOssUrl)) { $missing.Add('OSS 裸链') }

    if ($missing.Count -gt 0) {
        Write-RequiredInputs
        throw "missing required input: $($missing -join ', ')"
    }
}

function ConvertTo-EvidenceLog {
    param([object[]]$Lines)

    if ($null -eq $Lines -or $Lines.Count -eq 0) {
        return '<未自动运行>'
    }

    $text = Join-EvidenceLines -Lines $Lines
    $text = $text -replace '(client[_-]?token["=: ]+)[A-Za-z0-9._\-]+', '$1<redacted>'
    $text = $text -replace '(access[_-]?token["=: ]+)[A-Za-z0-9._\-]+', '$1<redacted>'
    $text = $text -replace '(AccessKeyId=)[^&\s]+', '$1<redacted>'
    $text = $text -replace '(OSSAccessKeyId=)[^&\s]+', '$1<redacted>'
    $text = $text -replace '(Signature=)[^&\s]+', '$1<redacted>'
    $text = $text -replace '(Expires=)[^&\s]+', '$1<redacted>'
    $text = $text -replace '(security-token=)[^&\s]+', '$1<redacted>'
    $text = (($text -split '\r?\n') | ForEach-Object { $_.TrimEnd() }) -join [Environment]::NewLine
    return $text
}

function Join-EvidenceLines {
    param([object[]]$Lines)

    $flattened = [System.Collections.Generic.List[string]]::new()
    $queue = [System.Collections.Queue]::new()
    foreach ($line in $Lines) {
        $queue.Enqueue($line)
    }
    while ($queue.Count -gt 0) {
        $line = $queue.Dequeue()
        if ($null -eq $line) {
            continue
        }
        if ($line -is [System.Array] -and -not ($line -is [string])) {
            foreach ($child in $line) {
                $queue.Enqueue($child)
            }
            continue
        }
        $flattened.Add([string]$line)
    }
    return ($flattened -join [Environment]::NewLine)
}

function Invoke-EvidenceCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Script
    )

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("## $Name")
    $lines.Add("started: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))")
    try {
        $output = & $Script *>&1
        foreach ($line in $output) {
            $lines.Add([string]$line)
        }
        if ($LASTEXITCODE -ne 0) {
            $lines.Add("exit_code: $LASTEXITCODE")
        } else {
            $lines.Add('exit_code: 0')
        }
    } catch {
        $lines.Add("error: $($_.Exception.Message)")
    }
    $lines.Add("finished: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))")
    return $lines.ToArray()
}

function Test-EvidenceLogPassed {
    param(
        [object[]]$Lines,
        [Parameter(Mandatory = $true)][string]$SuccessPattern
    )

    if ($null -eq $Lines -or $Lines.Count -eq 0) {
        return $false
    }

    $text = Join-EvidenceLines -Lines $Lines
    if ($text -match '(^|\n)error:' -or $text -match 'exit_code: [1-9]') {
        return $false
    }
    return $text -match [regex]::Escape($SuccessPattern)
}

function Resolve-CommandConclusion {
    param(
        [object[]]$PreflightLines,
        [object[]]$LocalAcceptanceLines
    )

    $ranPreflight = $null -ne $PreflightLines -and $PreflightLines.Count -gt 0
    $ranLocalAcceptance = $null -ne $LocalAcceptanceLines -and $LocalAcceptanceLines.Count -gt 0
    $preflightText = Join-EvidenceLines -Lines $PreflightLines
    $localAcceptanceText = Join-EvidenceLines -Lines $LocalAcceptanceLines
    $preflightPassed = $preflightText.Contains('preflight: passed')
    $localAcceptancePassed = $localAcceptanceText.Contains('photo pickup local acceptance: passed')

    if (($ranPreflight -and -not $preflightPassed) -or ($ranLocalAcceptance -and -not $localAcceptancePassed)) {
        return 'FAIL'
    }
    if ($preflightPassed -and $localAcceptancePassed) {
        return 'PASS'
    }
    return 'PENDING'
}

function Resolve-FinalConclusion {
    param(
        [Parameter(Mandatory = $true)][string]$CommandConclusion,
        [Parameter(Mandatory = $true)][bool]$ManualChecksConfirmed
    )

    if ($CommandConclusion -eq 'FAIL') {
        return 'FAIL'
    }
    if (-not $ManualChecksConfirmed) {
        return 'PENDING'
    }
    if ($CommandConclusion -eq 'PASS') {
        return 'PASS'
    }
    return 'PENDING'
}

function Resolve-ManualCheckPassed {
    param([Parameter(Mandatory = $true)][bool]$SpecificCheck)
    return [bool]($ConfirmManualAcceptance -or $SpecificCheck)
}

function Write-EvidenceSummaryJson {
    param(
        [Parameter(Mandatory = $true)][string]$CommandConclusion,
        [Parameter(Mandatory = $true)][string]$FinalConclusion
    )

    $summary = [ordered]@{
        generatedAt = $generatedAt
        baseUrl = $root
        evidencePath = $OutputPath
        summaryJsonPath = $SummaryJsonPath
        commandConclusion = $CommandConclusion
        finalConclusion = $FinalConclusion
        manualAcceptanceConfirmed = [bool]$ConfirmManualAcceptance
        preflightRan = [bool]$RunPreflight
        localAcceptanceRan = [bool]$RunLocalAcceptance
        manualChecks = [ordered]@{
            h5Pickup = $h5PickupConfirmed
            wechatMiniapp = $wechatMiniappConfirmed
            douyinMiniapp = $douyinMiniappConfirmed
            adminAudit = $adminAuditConfirmed
        }
        inputs = [ordered]@{
            phone = $Phone
            accessCode = $AccessCode
            albumId = $AlbumId
            assetId = $AssetId
            bareOssUrl = $bareObjectUrl
            objectKey = $ObjectKey
            thumbnailObjectKey = $ThumbnailObjectKey
            operator = $Operator
        }
    }

    $summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $SummaryJsonPath -Encoding UTF8
}

if ($PrintRequiredInputs) {
    Write-RequiredInputs
    exit 0
}

if ($AutoResolve) {
    $autoInputs = Resolve-AutoEvidenceInputs
    if ([string]::IsNullOrWhiteSpace($AlbumId)) {
        $AlbumId = [string]$autoInputs.AlbumId
    }
    if ([string]::IsNullOrWhiteSpace($AssetId)) {
        $AssetId = [string]$autoInputs.AssetId
    }
    if ([string]::IsNullOrWhiteSpace($BareOssUrl)) {
        $BareOssUrl = [string]$autoInputs.BareOssUrl
    }
    if ([string]::IsNullOrWhiteSpace($ObjectKey)) {
        $ObjectKey = [string]$autoInputs.ObjectKey
    }
    Write-Host "auto-resolve: albumId=$AlbumId, assetId=$AssetId, objectKey=$ObjectKey"
}

Assert-RequiredInputs

$wechatDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-weixin'
$douyinDist = Join-Path $repoRoot 'mobile-uniapp/dist/build/mp-toutiao'
$generatedAt = $now.ToString('yyyy-MM-dd HH:mm:ss')
$bareObjectUrl = ConvertTo-BareObjectUrl -Url $BareOssUrl
Assert-AliyunOssBareObjectUrl -Url $bareObjectUrl
$safePhone = ConvertTo-MarkdownValue $Phone
$safeAccessCode = ConvertTo-MarkdownValue $AccessCode
$safeAlbumId = ConvertTo-MarkdownValue $AlbumId
$safeAssetId = ConvertTo-MarkdownValue $AssetId
$safeObjectKey = ConvertTo-MarkdownValue $ObjectKey
$safeThumbnailObjectKey = ConvertTo-MarkdownValue $ThumbnailObjectKey
$safeBareObjectUrl = ConvertTo-MarkdownValue $bareObjectUrl
$safeOperator = ConvertTo-MarkdownValue $Operator
$preflightLog = @()
$localAcceptanceLog = @()

if ($RunPreflight) {
    $preflightLog = Invoke-EvidenceCommand -Name 'production preflight' -Script {
        Push-Location $repoRoot
        try {
            & (Join-Path $repoRoot 'tools/yingyue-production-preflight.ps1') `
                -BaseUrl $root `
                -Phone $Phone `
                -AccessCode $AccessCode `
                -AlbumId $AlbumId `
                -AssetId $AssetId `
                -BareOssUrl $bareObjectUrl `
                -VerifyBareOssBlocked
        } finally {
            Pop-Location
        }
    }
}

if ($RunLocalAcceptance) {
    $localAcceptanceLog = Invoke-EvidenceCommand -Name 'local acceptance' -Script {
        Push-Location $repoRoot
        try {
            & (Join-Path $repoRoot 'tools/photo-pickup-local-acceptance.ps1') `
                -BaseUrl $root `
                -Phone $Phone `
                -AccessCode $AccessCode `
                -AlbumId $AlbumId `
                -AssetId $AssetId `
                -SkipH5Browser `
                -SkipPlatformReadiness
        } finally {
            Pop-Location
        }
    }
}

$commandConclusion = Resolve-CommandConclusion -PreflightLines $preflightLog -LocalAcceptanceLines $localAcceptanceLog
$h5PickupConfirmed = Resolve-ManualCheckPassed -SpecificCheck ([bool]$ConfirmH5Pickup)
$wechatMiniappConfirmed = Resolve-ManualCheckPassed -SpecificCheck ([bool]$ConfirmWechatMiniapp)
$douyinMiniappConfirmed = Resolve-ManualCheckPassed -SpecificCheck ([bool]$ConfirmDouyinMiniapp)
$adminAuditConfirmed = Resolve-ManualCheckPassed -SpecificCheck ([bool]$ConfirmAdminAudit)
$manualChecksConfirmed = $h5PickupConfirmed -and $wechatMiniappConfirmed -and $douyinMiniappConfirmed -and $adminAuditConfirmed
$finalConclusion = Resolve-FinalConclusion -CommandConclusion $commandConclusion -ManualChecksConfirmed $manualChecksConfirmed
$manualAcceptanceText = if ($manualChecksConfirmed) { '已确认' } else { '未确认' }
$codeFence = '```'

$content = @"
# 客户取片真实 OSS 验收证据

生成时间：$generatedAt

## 结论

本文件用于记录一次真实图片取片验收。命令结论只代表自动命令覆盖的部分；最终结论必须同时满足自动命令通过和人工确认 H5、微信、抖音、后台审计验收。

命令结论：

${codeFence}text
$commandConclusion
${codeFence}

人工确认：

${codeFence}text
$manualAcceptanceText
${codeFence}

最终结论：

${codeFence}text
$finalConclusion
${codeFence}

## 基础信息

| 项 | 值 |
| --- | --- |
| 环境 | $root |
| 手机号 | $safePhone |
| 取片码 | $safeAccessCode |
| 相册 ID | $safeAlbumId |
| 底片 ID | $safeAssetId |
| OSS objectKey | $safeObjectKey |
| 缩略图 objectKey | $safeThumbnailObjectKey |
| OSS 裸链 | $safeBareObjectUrl |
| 验收人 | $safeOperator |

## 一键命令

### 1. 真实 OSS 生产预检

${codeFence}powershell
cd $repoRoot
.\tools\yingyue-production-preflight.ps1 -BaseUrl "$root" -Phone "$Phone" -AccessCode "$AccessCode" -AlbumId "$AlbumId" -AssetId "$AssetId" -BareOssUrl "$bareObjectUrl" -VerifyBareOssBlocked
${codeFence}

预期：

${codeFence}text
thumbnail-url: success
preview-url: success
download-url: success
bare-oss: blocked status=403
stream: success status=200
preflight: passed
${codeFence}

实际结果：

${codeFence}text
$(ConvertTo-EvidenceLog $preflightLog)
${codeFence}

### 2. 本地总验收

${codeFence}powershell
cd $repoRoot
.\tools\photo-pickup-local-acceptance.ps1 -BaseUrl "$root" -Phone "$Phone" -AccessCode "$AccessCode" -AlbumId "$AlbumId" -AssetId "$AssetId" -SkipH5Browser -SkipPlatformReadiness
${codeFence}

预期：

${codeFence}text
mobile typecheck: passed
mobile unit tests: passed
mobile H5 build: passed
mobile WeChat mini build: passed
mobile Douyin mini build: passed
platform readiness local checks: passed
admin yy tests: passed
admin dev build: passed
photo pickup local acceptance: passed
${codeFence}

实际结果：

${codeFence}text
$(ConvertTo-EvidenceLog $localAcceptanceLog)
${codeFence}

### 3. JSON 摘要校验

${codeFence}powershell
cd $repoRoot
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "$SummaryJsonPath"
${codeFence}

预期：

${codeFence}text
real OSS evidence summary: passed
${codeFence}

### 4. 最终发布前校验

${codeFence}powershell
cd $repoRoot
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "$SummaryJsonPath" -RequireFinalPass
${codeFence}

说明：只有自动命令通过且已执行 `-ConfirmManualAcceptance` 后，本命令才会通过。

### 5. 发布状态 JSON

${codeFence}powershell
cd $repoRoot
.\tools\get-photo-pickup-release-status.ps1 -OutputJsonPath "$releaseStatusJsonPath"
${codeFence}

说明：生成本证据后会自动更新该状态文件，供 CI、部署包或其他 agent 读取。

## 小程序导入和域名

| 平台 | 项 | 值 | 结果 |
| --- | --- | --- | --- |
| 微信 | 导入目录 | $wechatDist | `<PASS/FAIL>` |
| 微信 | request 合法域名 | $root | `<PASS/FAIL>` |
| 微信 | uploadFile 合法域名 | $root | `<PASS/FAIL>` |
| 微信 | downloadFile 合法域名 | $root | `<PASS/FAIL>` |
| 抖音 | 导入目录 | $douyinDist | `<PASS/FAIL>` |
| 抖音 | request 合法域名 | $root | `<PASS/FAIL>` |
| 抖音 | uploadFile 合法域名 | $root | `<PASS/FAIL>` |
| 抖音 | downloadFile 合法域名 | $root | `<PASS/FAIL>` |

## 页面验收

| 场景 | 通过标准 | 结果 |
| --- | --- | --- |
| H5 登录 | 手机号 + 取片码进入相册 | `<PASS/FAIL>` |
| H5 相册目录 | 真实图缩略图可见 | `<PASS/FAIL>` |
| H5 预览 | 原图可预览，错误态清晰 | `<PASS/FAIL>` |
| H5 下载 | 下载成功，URL 不暴露 `client_token` | `<PASS/FAIL>` |
| 微信开发者工具 | 登录、相册、预览可用 | `<PASS/FAIL>` |
| 微信真机 | 保存图片可用 | `<PASS/FAIL>` |
| 抖音开发者工具 | 登录、相册、预览可用 | `<PASS/FAIL>` |
| 抖音真机 | 保存图片可用 | `<PASS/FAIL>` |

## 后台审计

| 动作 | 通过标准 | 结果 |
| --- | --- | --- |
| `VERIFY` | 登录动作有成功日志 | `<PASS/FAIL>` |
| `ALBUM_DETAIL` | 打开相册目录有成功日志 | `<PASS/FAIL>` |
| `PREVIEW` | 生成预览 URL 有成功日志 | `<PASS/FAIL>` |
| `DOWNLOAD` | 下载 URL 或下载动作有成功日志 | `<PASS/FAIL>` |
| `STREAM` | 后端图片流有成功日志 | `<PASS/FAIL>` |
| 失败日志 | 如果失败，原因能区分无权限、过期、对象不存在、OSS 读取失败 | `<PASS/FAIL>` |

## 判定

| 项 | 状态 |
| --- | --- |
| 私有 OSS 裸链 403 | `<PASS/FAIL>` |
| 签名 URL 可用 | `<PASS/FAIL>` |
| `/stream` 可用 | `<PASS/FAIL>` |
| H5 可用 | `<PASS/FAIL>` |
| 微信可用 | `<PASS/FAIL>` |
| 抖音可用 | `<PASS/FAIL>` |
| 后台审计可追踪 | `<PASS/FAIL>` |
"@

Set-Content -LiteralPath $OutputPath -Value $content -Encoding UTF8
Write-EvidenceSummaryJson -CommandConclusion $commandConclusion -FinalConclusion $finalConclusion
if (-not (Test-Path -LiteralPath $summaryVerifier)) {
    throw "summary verifier not found: $summaryVerifier"
}
& $summaryVerifier -SummaryJsonPath $SummaryJsonPath
if (-not (Test-Path -LiteralPath $releaseStatus)) {
    throw "release status script not found: $releaseStatus"
}
& $releaseStatus -EvidenceRoot $releaseStatusEvidenceRoot -OutputJsonPath $releaseStatusJsonPath

Write-Host "created evidence: $OutputPath"
Write-Host "created summary: $SummaryJsonPath"
Write-Host "created release status: $releaseStatusJsonPath"
Write-Host "verified summary: $SummaryJsonPath"
