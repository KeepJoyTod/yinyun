[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [Parameter(Mandatory = $true)]
    [string]$SshPasswordFile,

    [Parameter(Mandatory = $true)]
    [string]$DouyinOrderId,

    [string]$RemoteEnvFile = '/opt/yingyue/backend/.env.production',

    [string]$OpenApiBaseUrl = 'https://open.douyin.com',

    [string]$ApiBaseUrl = 'https://api.evanshine.me',

    [string]$DockerContainer = 'yingyue-postgres',

    [string]$Database = 'yingyue_cloud',

    [string]$DbUser = 'yingyue',

    [string]$Platform = 'H5',

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

function Mask-Id {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ''
    }
    if ($Value.Length -le 8) {
        return '***'
    }
    return $Value.Substring(0, 4) + '***' + $Value.Substring($Value.Length - 4)
}

function New-RemotePythonCommand {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $json = $Config | ConvertTo-Json -Depth 8 -Compress
    $encodedConfig = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))

    return @"
python3 - <<'PY'
import base64
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

cfg = json.loads(base64.b64decode('$encodedConfig').decode('utf-8'))

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

def mask_phone(value):
    if value is None:
        return None
    text = str(value)
    if len(text) < 7:
        return '***'
    return text[:3] + '****' + text[-4:]

def mask_id(value):
    if value is None:
        return None
    text = str(value)
    if len(text) <= 8:
        return '***'
    return text[:4] + '***' + text[-4:]

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
            parsed = {'raw_body': payload[:200]}
        return exc.code, parsed

def request_bytes(method, url, headers=None):
    request = urllib.request.Request(url=url, method=method, headers=dict(headers or {}))
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.headers.get('Content-Type'), response.headers.get('Content-Disposition'), len(response.read(1024 * 1024))

def ruoyi_success(response):
    if isinstance(response, dict) and 'code' in response:
        return int(response.get('code') or 0) == 200
    return True

def data_of(response):
    if isinstance(response, dict) and 'data' in response:
        return response.get('data')
    return response

def psql_one(sql):
    cmd = [
        'docker', 'exec', '-i', cfg['docker_container'],
        'psql', '-U', cfg['db_user'], '-d', cfg['database'],
        '-t', '-A', '-F', '\t', '-v', 'ON_ERROR_STOP=1',
        '-c', sql
    ]
    result = subprocess.run(cmd, text=True, capture_output=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError('psql failed: ' + result.stderr.strip())
    lines = [line for line in result.stdout.splitlines() if line.strip()]
    return lines[0].split('\t') if lines else []

try:
    env = parse_env_file(cfg['remote_env_file'])
    required = ['DOUYIN_LIFE_CLIENT_KEY', 'DOUYIN_LIFE_CLIENT_SECRET', 'DOUYIN_LIFE_ACCOUNT_ID']
    missing = [key for key in required if not env.get(key)]
    if missing:
        raise RuntimeError('missing remote env keys: ' + ','.join(missing))

    openapi = cfg['openapi_base_url'].rstrip('/')
    api = cfg['api_base_url'].rstrip('/')
    token_status, token_response = request_json(
        'POST',
        openapi + '/oauth/client_token/',
        body={
            'client_key': env['DOUYIN_LIFE_CLIENT_KEY'],
            'client_secret': env['DOUYIN_LIFE_CLIENT_SECRET'],
            'grant_type': 'client_credential'
        }
    )
    access_token = find_value(token_response, ['client_access_token', 'access_token'])
    if not access_token:
        raise RuntimeError('client_token failed')

    order_id = str(cfg['douyin_order_id'])
    query = urllib.parse.urlencode({
        'account_id': env['DOUYIN_LIFE_ACCOUNT_ID'],
        'order_id': order_id,
        'page_num': '1',
        'page_size': '10'
    })
    order_status, order_response = request_json(
        'GET',
        openapi + '/goodlife/v1/trade/order/query/?' + query,
        headers={
            'access-token': access_token,
            'Rpc-Transit-Life-Account': env['DOUYIN_LIFE_ACCOUNT_ID']
        }
    )
    orders = collect_orders(order_response)
    order = next((item for item in orders if str(find_value(item, ['order_id', 'id']) or '') == order_id), orders[0] if orders else None)
    phone = find_value(order, ['mobile', 'phone', 'customer_phone', 'buyer_phone', 'receiver_phone'])
    if not phone:
        raise RuntimeError('order query succeeded but phone was not found')

    escaped_order_id = order_id.replace("'", "''")
    sql = f"""
select
  a.id::text,
  coalesce(a.access_code, ''),
  coalesce(a.status, ''),
  coalesce(a.selection_status, ''),
  coalesce(asset_stats.asset_count, 0)::text,
  coalesce(asset_stats.visible_count, 0)::text
from yy_photo_album a
left join (
  select
    album_id,
    count(*) filter (where del_flag = '0') as asset_count,
    count(*) filter (where del_flag = '0' and visible = '1') as visible_count
  from yy_photo_asset
  group by album_id
) asset_stats on asset_stats.album_id = a.id
where a.del_flag = '0'
  and a.channel_type = 'DOUYIN_LIFE'
  and a.douyin_order_id = '{escaped_order_id}'
order by a.create_time desc nulls last, a.id desc
limit 1
"""
    row = psql_one(sql)
    if not row:
        raise RuntimeError('DOUYIN_LIFE album was not found for order')
    album_id, access_code, album_status, selection_status, asset_count, visible_asset_count = row
    if not access_code:
        raise RuntimeError('album access_code is empty')

    auth_status, auth_response = request_json(
        'POST',
        api + '/client/photo/auth/verify',
        body={'phone': str(phone), 'code': access_code, 'platform': cfg.get('platform') or 'H5'}
    )
    auth_data = data_of(auth_response)
    client_token = find_value(auth_data, ['clientToken', 'client_token'])
    if not ruoyi_success(auth_response) or not client_token:
        raise RuntimeError('client photo auth failed')

    headers = {'X-Client-Token': str(client_token)}
    albums_status, albums_response = request_json('GET', api + '/client/photo/albums', headers=headers)
    albums_data = data_of(albums_response)
    albums = albums_data if isinstance(albums_data, list) else []

    detail_status, detail_response = request_json('GET', api + '/client/photo/albums/' + urllib.parse.quote(str(album_id)), headers=headers)
    detail_data = data_of(detail_response) or {}
    assets = detail_data.get('assets') if isinstance(detail_data, dict) else []
    assets = assets if isinstance(assets, list) else []

    preview_result = {'tested': False, 'reason': 'no visible assets'}
    if assets:
        asset_id = str(find_value(assets[0], ['assetId', 'asset_id', 'id']))
        preview_status, preview_response = request_json('GET', api + '/client/photo/assets/' + urllib.parse.quote(asset_id) + '/preview-url', headers=headers)
        preview_data = data_of(preview_response) or {}
        stream_status, stream_type, stream_disposition, stream_bytes = request_bytes(
            'GET',
            api + '/client/photo/assets/' + urllib.parse.quote(asset_id) + '/stream',
            headers=headers
        )
        preview_result = {
            'tested': True,
            'asset_id_masked': mask_id(asset_id),
            'preview_status': preview_status,
            'preview_success': ruoyi_success(preview_response) and bool(preview_data.get('url')),
            'stream_status': stream_status,
            'stream_content_type': stream_type,
            'stream_content_disposition_present': bool(stream_disposition),
            'stream_sample_bytes': stream_bytes
        }

    summary = {
        'remote_host': cfg['ssh_host'],
        'api_base_url': api,
        'douyin_order_id_masked': mask_id(order_id),
        'phone_masked': mask_phone(phone),
        'openapi': {
            'token_status': token_status,
            'order_query_status': order_status,
            'order_query_logid': find_value(order_response, ['logid', 'log_id']),
            'order_count_detected': len(orders)
        },
        'album': {
            'album_id': album_id,
            'status': album_status,
            'selection_status': selection_status,
            'asset_count': int(asset_count or 0),
            'visible_asset_count': int(visible_asset_count or 0),
            'access_code_present': bool(access_code)
        },
        'client_photo': {
            'auth_status': auth_status,
            'auth_success': True,
            'album_count': len(albums),
            'detail_status': detail_status,
            'detail_success': ruoyi_success(detail_response),
            'detail_asset_count': len(assets),
            'preview': preview_result
        }
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
except Exception as exc:
    print(json.dumps({'error': str(exc)}, ensure_ascii=False, indent=2))
    sys.exit(1)
PY
"@
}

$config = @{
    ssh_host = $SshHost
    douyin_order_id = $DouyinOrderId
    remote_env_file = $RemoteEnvFile
    openapi_base_url = $OpenApiBaseUrl
    api_base_url = $ApiBaseUrl
    docker_container = $DockerContainer
    database = $Database
    db_user = $DbUser
    platform = $Platform
}

Write-Host 'yingyue douyin photo pickup remote smoke'
Write-Host "sshHost: $SshHost"
Write-Host "apiBaseUrl: $ApiBaseUrl"
Write-Host "douyinOrderId: $(Mask-Id -Value $DouyinOrderId)"
Write-Host ''

$remoteCommand = New-RemotePythonCommand -Config $config
if ($DryRun) {
    Write-Host 'dry-run: remote command prepared; no secrets are embedded in the command.'
    exit 0
}

Import-Module Posh-SSH -ErrorAction Stop
$password = Get-PasswordFromFile -Path $SshPasswordFile
$secure = ConvertTo-SecureString $password -AsPlainText -Force
$credential = [pscredential]::new($SshUser, $secure)
$session = New-SSHSession -ComputerName $SshHost -Credential $credential -AcceptKey -ErrorAction Stop
try {
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $remoteCommand -TimeOut 120
    if ($result.Output) {
        $result.Output
    }
    if ($result.ExitStatus -ne 0) {
        $err = ($result.Error | Out-String).Trim()
        throw "remote photo pickup smoke failed: exit=$($result.ExitStatus), $err"
    }
} finally {
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
}
