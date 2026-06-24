[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile,

    [string]$RemoteEnvFile = '/opt/yingyue/backend/.env.production',

    [string]$BaseUrl = 'https://open.douyin.com',

    [string]$OrderId,

    [string]$OutOrderNo,

    [string]$OpenId,

    [string]$OrderStatus,

    [string]$StartTime,

    [string]$EndTime,

    [int]$RecentHours = 48,

    [int]$PageNum = 1,

    [int]$PageSize = 10,

    [switch]$UseTestDataHeader,

    [switch]$ShowRaw,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-PasswordFromFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "password file not found: $Path"
    }

    $lines = @(Get-Content -LiteralPath $Path | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($lines.Count -eq 0) {
        throw "password file is empty: $Path"
    }

    $passwordLabels = '密码|password|passwd|pwd'
    $candidates = @($lines | Where-Object { $_ -match $passwordLabels })
    $line = if ($candidates.Count -gt 0) { [string]$candidates[-1] } else { [string]$lines[-1] }
    if ($line -match '[:=：]\s*(.+)$') {
        return $Matches[1].Trim()
    }
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $passwordLabels -and $i + 1 -lt $lines.Count) {
            return ([string]$lines[$i + 1]).Trim()
        }
    }
    return $line.Trim()
}

function Format-DouyinTime {
    param([Parameter(Mandatory = $true)][datetime]$Value)
    return $Value.ToString('yyyy-MM-dd HH:mm:ss')
}

function New-RemotePythonCommand {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $json = $Config | ConvertTo-Json -Depth 8 -Compress
    $encodedConfig = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))

    return @"
python3 - <<'PY'
import base64
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

cfg = json.loads(base64.b64decode('$encodedConfig').decode('utf-8'))

SENSITIVE_KEYS = {
    'access_token', 'client_access_token', 'refresh_token', 'client_secret',
    'authorization', 'open_id', 'openid', 'phone', 'mobile', 'encrypt_mobile',
    'encrypted_phone', 'customer_phone', 'buyer_name', 'customer_name',
    'receiver_name', 'contact_name', 'nickname'
}

def parse_env_file(path):
    env = {}
    with open(path, 'r', encoding='utf-8') as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                value = value[1:-1]
            env[key] = value
    return env

def find_value(node, names):
    if node is None:
        return None
    if isinstance(node, dict):
        for name in names:
            if name in node:
                return node[name]
        for value in node.values():
            found = find_value(value, names)
            if found is not None:
                return found
    if isinstance(node, list):
        for item in node:
            found = find_value(item, names)
            if found is not None:
                return found
    return None

def mask(value):
    if value is None:
        return None
    text = str(value)
    if len(text) <= 8:
        return '***'
    return text[:4] + '***' + text[-4:]

def redact(node):
    if isinstance(node, dict):
        redacted = {}
        for key, value in node.items():
            if key.lower() in SENSITIVE_KEYS:
                redacted[key] = '***'
            elif key.lower() in {'order_id', 'out_order_no'}:
                redacted[key] = mask(value)
            else:
                redacted[key] = redact(value)
        return redacted
    if isinstance(node, list):
        return [redact(item) for item in node]
    return node

def request_json(method, url, headers=None, body=None):
    data = None
    request_headers = dict(headers or {})
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode('utf-8')
        request_headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(url=url, method=method, headers=request_headers, data=data)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read().decode('utf-8', errors='replace')
            return response.status, json.loads(payload)
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode('utf-8', errors='replace')
        try:
            parsed = json.loads(payload)
        except Exception:
            parsed = {'raw_body': payload}
        return exc.code, parsed

def collect_orders(node):
    if node is None:
        return []
    if isinstance(node, dict):
        for key in ('order_list', 'orders', 'order_infos', 'list'):
            value = node.get(key)
            if isinstance(value, list):
                return value
        for value in node.values():
            found = collect_orders(value)
            if found:
                return found
    if isinstance(node, list):
        return node
    return []

def douyin_order_query_time(value):
    if not value:
        return ''
    text = str(value).strip()
    if len(text) == 13 and text.isdigit():
        return str(int(text) // 1000)
    if len(text) == 10 and text.isdigit():
        return text
    try:
        return str(int(dt.datetime.strptime(text, '%Y-%m-%d %H:%M:%S').timestamp()))
    except Exception:
        return text

try:
    env = parse_env_file(cfg['remote_env_file'])
    required = ['DOUYIN_LIFE_CLIENT_KEY', 'DOUYIN_LIFE_CLIENT_SECRET', 'DOUYIN_LIFE_ACCOUNT_ID']
    missing = [key for key in required if not env.get(key)]
    if missing:
        raise RuntimeError('missing remote env keys: ' + ','.join(missing))

    base_url = cfg['base_url'].rstrip('/')
    token_status, token_response = request_json(
        'POST',
        base_url + '/oauth/client_token/',
        body={
            'client_key': env['DOUYIN_LIFE_CLIENT_KEY'],
            'client_secret': env['DOUYIN_LIFE_CLIENT_SECRET'],
            'grant_type': 'client_credential'
        }
    )
    token = find_value(token_response, ['client_access_token', 'access_token'])

    summary = {
        'remote_host': cfg['ssh_host'],
        'remote_env_file': cfg['remote_env_file'],
        'base_url': base_url,
        'token': {
            'status': token_status,
            'success': bool(token),
            'err_no': find_value(token_response, ['err_no', 'code', 'error_code']),
            'message': find_value(token_response, ['message', 'errmsg', 'description']),
            'logid': find_value(token_response, ['logid', 'log_id'])
        }
    }

    if not token:
        summary['raw'] = redact(token_response) if cfg.get('show_raw') else None
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        sys.exit(2)

    query = {
        'account_id': env['DOUYIN_LIFE_ACCOUNT_ID'],
        'order_id': cfg.get('order_id') or '',
        'out_order_no': cfg.get('out_order_no') or '',
        'open_id': cfg.get('open_id') or '',
        'order_status': cfg.get('order_status') or '',
        'create_order_start_time': douyin_order_query_time(cfg.get('start_time') or ''),
        'create_order_end_time': douyin_order_query_time(cfg.get('end_time') or ''),
        'page_num': str(cfg.get('page_num') or 1),
        'page_size': str(cfg.get('page_size') or 10)
    }
    query = {key: value for key, value in query.items() if value not in ('', None)}
    headers = {
        'access-token': str(token),
        'Rpc-Transit-Life-Account': env['DOUYIN_LIFE_ACCOUNT_ID']
    }
    if cfg.get('use_test_data_header'):
        headers['Rpc-Persist-Life-Test-Data-Access'] = 'all'

    url = base_url + '/goodlife/v1/trade/order/query/?' + urllib.parse.urlencode(query)
    order_status, order_response = request_json('GET', url, headers=headers)
    orders = collect_orders(order_response)
    first_order = orders[0] if orders and isinstance(orders[0], dict) else {}

    summary['query'] = {
        'account_id': 'present',
        'start_time': cfg.get('start_time'),
        'end_time': cfg.get('end_time'),
        'create_order_start_time': query.get('create_order_start_time'),
        'create_order_end_time': query.get('create_order_end_time'),
        'page_num': query.get('page_num'),
        'page_size': query.get('page_size'),
        'has_order_id': bool(query.get('order_id')),
        'has_out_order_no': bool(query.get('out_order_no')),
        'has_open_id': bool(query.get('open_id')),
        'has_order_status': bool(query.get('order_status')),
        'use_test_data_header': bool(cfg.get('use_test_data_header'))
    }
    summary['order_query'] = {
        'status': order_status,
        'err_no': find_value(order_response, ['err_no', 'code', 'error_code']),
        'message': find_value(order_response, ['message', 'errmsg', 'description']),
        'logid': find_value(order_response, ['logid', 'log_id']),
        'order_count_detected': len(orders),
        'first_order_id_masked': mask(first_order.get('order_id') or first_order.get('id')),
        'first_out_order_no_masked': mask(first_order.get('out_order_no'))
    }
    if cfg.get('show_raw'):
        summary['raw_order_response'] = redact(order_response)

    print(json.dumps(summary, ensure_ascii=False, indent=2))
except Exception as exc:
    print(json.dumps({'error': str(exc)}, ensure_ascii=False, indent=2))
    sys.exit(1)
PY
"@
}

if ([string]::IsNullOrWhiteSpace($StartTime) -and [string]::IsNullOrWhiteSpace($EndTime)) {
    $now = Get-Date
    $EndTime = Format-DouyinTime -Value $now
    $StartTime = Format-DouyinTime -Value $now.AddHours(-1 * $RecentHours)
}

$config = @{
    ssh_host = $SshHost
    remote_env_file = $RemoteEnvFile
    base_url = $BaseUrl
    order_id = $OrderId
    out_order_no = $OutOrderNo
    open_id = $OpenId
    order_status = $OrderStatus
    start_time = $StartTime
    end_time = $EndTime
    page_num = $PageNum
    page_size = $PageSize
    use_test_data_header = [bool]$UseTestDataHeader
    show_raw = [bool]$ShowRaw
}

Write-Host 'yingyue douyin remote order query'
Write-Host "sshHost: $SshHost"
Write-Host "remoteEnvFile: $RemoteEnvFile"
Write-Host "baseUrl: $BaseUrl"
Write-Host "timeRange: $StartTime -> $EndTime"
Write-Host "page: $PageNum/$PageSize"
Write-Host ''

$remoteCommand = New-RemotePythonCommand -Config $config
if ($DryRun) {
    Write-Host 'dry-run: remote command prepared; no secrets are embedded in the command.'
    exit 0
}

if ([string]::IsNullOrWhiteSpace($SshPasswordFile)) {
    throw 'SshPasswordFile is required.'
}

Import-Module Posh-SSH -ErrorAction Stop
$password = Get-PasswordFromFile -Path $SshPasswordFile
$secure = ConvertTo-SecureString $password -AsPlainText -Force
$credential = [pscredential]::new($SshUser, $secure)
$session = New-SSHSession -ComputerName $SshHost -Credential $credential -AcceptKey -ErrorAction Stop
try {
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $remoteCommand -TimeOut 90
    if ($result.Output) {
        $result.Output
    }
    if ($result.ExitStatus -ne 0) {
        $err = ($result.Error | Out-String).Trim()
        throw "remote order query failed: exit=$($result.ExitStatus), $err"
    }
} finally {
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
}
