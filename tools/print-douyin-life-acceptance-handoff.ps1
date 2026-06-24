[CmdletBinding()]
param(
    [string]$BaseUrl = 'https://api.evanshine.me',

    [string]$AdminUrl = 'https://admin.evanshine.me',

    [switch]$AsJson
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = $BaseUrl.TrimEnd('/')
$admin = $AdminUrl.TrimEnd('/')

$callbackUrls = @(
    [pscustomobject]@{ Name = '事件订阅 webhook'; Url = "$root/api/douyin/life/webhook"; LogidSource = 'X-Bytedance-Logid 或平台请求 ID' },
    [pscustomobject]@{ Name = '三方码发券 SPI'; Url = "$root/api/douyin/life/tripartite-code/create"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '综合预约订单创建'; Url = "$root/api/douyin/life/reservation/order-create"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '综合预约订单支付通知'; Url = "$root/api/douyin/life/reservation/pay-notify"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '综合预约三方订单查询'; Url = "$root/api/douyin/life/reservation/order-query"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '预约库存查询'; Url = "$root/api/douyin/life/reservation/stock-query"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '券撤销核销'; Url = "$root/api/douyin/life/voucher/revoke"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '批量撤销核销'; Url = "$root/api/douyin/life/voucher/batch-revoke"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '退款申请'; Url = "$root/api/douyin/life/refund/apply"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '退款通知'; Url = "$root/api/douyin/life/refund/notify"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '普通三方码订单查询'; Url = "$root/api/douyin/life/order/query"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' },
    [pscustomobject]@{ Name = '履约对账信息同步'; Url = "$root/api/douyin/life/fulfil/check-info-sync"; LogidSource = 'SPI 请求头 X-Bytedance-Logid' }
)

$acceptanceCases = @(
    [pscustomobject]@{
        Step = '发券'
        Trigger = '用户真实支付后，抖音请求三方码发券 SPI'
        UrlOrApi = "$root/api/douyin/life/tripartite-code/create"
        LogidSource = '请求头 X-Bytedance-Logid'
        WhereToCheck = "$admin -> 抖音来客 -> 开放平台验收 logid"
        Note = '不要填写订单号、商品 ID 或 account_id'
    },
    [pscustomobject]@{
        Step = '创单/支付回调'
        Trigger = '用户在抖音 App 发起预约或支付成功'
        UrlOrApi = "$root/api/douyin/life/reservation/order-create 或 $root/api/douyin/life/reservation/pay-notify"
        LogidSource = '请求头 X-Bytedance-Logid'
        WhereToCheck = "$admin -> 抖音来客 -> 开放平台验收 logid / 同步日志"
        Note = '如果没有进入 order-create，先看 stock-query 是否到达'
    },
    [pscustomobject]@{
        Step = '接单'
        Trigger = '后台调用 DOUYIN_LIFE confirm，传真实 book_id 和 confirmResult'
        UrlOrApi = 'POST /yy/channel/DOUYIN_LIFE/confirm -> goodlife/v1/comprehensive/trade/order/confirm/'
        LogidSource = 'OpenAPI 响应 extra.logid 或 logid'
        WhereToCheck = "$admin -> 抖音来客 -> 接单结果 / 开放平台验收 logid"
        Note = '如果创单 SPI 已同步返回接单结果，主动接单可能返回状态不合法'
    },
    [pscustomobject]@{
        Step = '核销'
        Trigger = '后台调用 DOUYIN_LIFE verify，传真实 poi/order/codes 或 verifyToken'
        UrlOrApi = 'POST /yy/channel/DOUYIN_LIFE/verify -> goodlife/v1/fulfilment/certificate/verify/'
        LogidSource = 'OpenAPI 响应 extra.logid 或 logid'
        WhereToCheck = "$admin -> 抖音来客 -> 核销结果 / 开放平台验收 logid"
        Note = '三方码核销需要 orderId；后端会补稳定 verify_token'
    },
    [pscustomobject]@{
        Step = '订单同步'
        Trigger = '自动同步或后台手动同步抖音来客订单'
        UrlOrApi = 'POST /yy/channel/DOUYIN_LIFE/orders/sync'
        LogidSource = 'OpenAPI 响应 extra.logid 或 logid，写入 yy_channel_sync_log.request_id'
        WhereToCheck = "$admin -> 首页渠道状态 / 订单页 / 抖音来客同步日志"
        Note = '同步进入 yy_order；员工工作台可看到最近 DOUYIN_LIFE 订单'
    }
)

$commands = @(
    '.\tools\get-douyin-life-acceptance-status.ps1 -Mode SshDocker -SshPasswordFile "<香港2密码文件>"',
    '.\tools\get-yingyue-delivery-status.ps1',
    '.\tools\yingyue-platform-readiness.ps1',
    '.\tools\run-douyin-life-current-order.ps1',
    '.\tools\run-douyin-life-spi-public-smoke.ps1',
    '.\tools\yingyue-douyin-album-audit.ps1'
)

$handoff = [pscustomobject]@{
    generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
    baseUrl = $root
    adminUrl = $admin
    channel = 'DOUYIN_LIFE'
    conclusion = '代码和公网入口已准备；剩余需要真实平台触发并取得发券、创单/支付回调、接单、核销 logid。'
    rules = @(
        'logid 不是订单号、商品 ID、account_id、book_id。',
        'SPI 回调类 logid 来自请求头 X-Bytedance-Logid。',
        'OpenAPI 主动调用类 logid 来自响应 extra.logid 或 logid。',
        '不要在日志、截图、文档中暴露 AppSecret、token、完整手机号、openid。'
    )
    callbackUrls = $callbackUrls
    acceptanceCases = $acceptanceCases
    usefulCommands = $commands
}

if ($AsJson) {
    $handoff | ConvertTo-Json -Depth 8
    return
}

Write-Host 'douyin life acceptance handoff'
Write-Host "baseUrl: $root"
Write-Host "adminUrl: $admin"
Write-Host 'channel: DOUYIN_LIFE'
Write-Host ''

Write-Host 'rules'
foreach ($rule in $handoff.rules) {
    Write-Host "- $rule"
}
Write-Host ''

Write-Host 'acceptance cases'
foreach ($case in $acceptanceCases) {
    Write-Host "- $($case.Step)"
    Write-Host "  trigger: $($case.Trigger)"
    Write-Host "  logid: $($case.LogidSource)"
    Write-Host "  check: $($case.WhereToCheck)"
}
Write-Host ''

Write-Host 'callback urls'
foreach ($item in $callbackUrls) {
    Write-Host "- $($item.Name): $($item.Url)"
}
Write-Host ''

Write-Host 'useful commands'
foreach ($command in $commands) {
    Write-Host $command
}
