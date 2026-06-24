[CmdletBinding()]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [string]$RemoteEnvFile = '/opt/yingyue/backend/.env.production',

    [string]$BaseUrl = 'https://open.douyin.com',

    [string]$OutputDir = (Join-Path $PSScriptRoot '..\docs\evidence'),

    [string]$StartTime,

    [string]$EndTime,

    [int]$RecentHours = 24,

    [int]$MaxPages = 3,

    [int]$PageSize = 50,

    [switch]$SkipPoiQuery,

    [switch]$SkipTimeStock,

    [switch]$UseTestDataHeader,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$BeginMarker = '__YY_REAL_ACCOUNT_DISCOVERY_JSON_BEGIN__'
$EndMarker = '__YY_REAL_ACCOUNT_DISCOVERY_JSON_END__'

function Format-DouyinTime {
    param([Parameter(Mandatory = $true)][datetime]$Value)
    return $Value.ToString('yyyy-MM-dd HH:mm:ss')
}

function Assert-DiscoveryBounds {
    if ($RecentHours -lt 1 -or $RecentHours -gt 24 * 31) {
        throw 'RecentHours must be between 1 and 744.'
    }
    if ($MaxPages -lt 1 -or $MaxPages -gt 20) {
        throw 'MaxPages must be between 1 and 20.'
    }
    if ($PageSize -lt 1 -or $PageSize -gt 100) {
        throw 'PageSize must be between 1 and 100.'
    }
}

function New-RemoteDiscoveryCommand {
    param([Parameter(Mandatory = $true)][hashtable]$Config)

    $json = $Config | ConvertTo-Json -Depth 10 -Compress
    $encodedConfig = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))

    return @"
python3 - <<'PY'
import base64
import datetime as dt
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict

cfg = json.loads(base64.b64decode('$encodedConfig').decode('utf-8'))
BEGIN = cfg['begin_marker']
END = cfg['end_marker']

ORDER_ID_KEYS = ['order_id', 'order_id_str', 'order_no', 'id']
OUT_ORDER_KEYS = ['out_order_no', 'out_order_id', 'third_order_id']
POI_KEYS = ['poi_id', 'intention_poi_id', 'actual_poi_id', 'shop_poi_id']
PRODUCT_ID_KEYS = ['product_id', 'goods_id', 'source_product_id', 'item_id']
SKU_ID_KEYS = ['sku_id', 'source_sku_id', 'external_sku_id', 'room_id']
PRODUCT_NAME_KEYS = ['product_name', 'goods_name', 'item_name', 'title']
SKU_NAME_KEYS = ['sku_name', 'goods_sku_name', 'sku_title', 'product_sku_name']
ORDER_STATUS_KEYS = ['order_status', 'status', 'order_status_name', 'order_status_desc']
PAY_STATUS_KEYS = ['pay_status', 'payment_status', 'pay_status_name']
CERT_STATUS_KEYS = ['item_status', 'certificate_status', 'certificate_status_name', 'code_status']
PHONE_KEYS = ['phone', 'mobile', 'encrypt_mobile', 'encrypted_phone', 'customer_phone', 'contact_phone', 'receiver_mobile']
OPEN_ID_KEYS = ['open_id', 'openid', 'buyer_open_id']
AMOUNT_KEYS = ['pay_amount', 'total_amount', 'actual_amount', 'order_amount', 'amount', 'origin_amount']
ORDER_TIME_KEYS = ['create_order_time', 'pay_time', 'update_order_time', 'create_time', 'order_create_time']
RESERVE_TERMS = ['reserve', 'booking', 'appointment', 'appoint', 'slot', 'book']

def now_text():
    return dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

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
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
                value = value[1:-1]
            env[key] = value
    return env

def first_value(node, names):
    names_lower = set(name.lower() for name in names)
    if isinstance(node, dict):
        for key, value in node.items():
            if str(key).lower() in names_lower and value not in (None, ''):
                return value
        for value in node.values():
            found = first_value(value, names)
            if found not in (None, ''):
                return found
    elif isinstance(node, list):
        for item in node:
            found = first_value(item, names)
            if found not in (None, ''):
                return found
    return None

def all_values(node, names):
    names_lower = set(name.lower() for name in names)
    result = []
    def walk(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if str(key).lower() in names_lower and child not in (None, ''):
                    result.append(child)
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)
    walk(node)
    return result

def unique_text(values, limit=20):
    seen = []
    for value in values:
        if value is None:
            continue
        if isinstance(value, (dict, list)):
            text = json.dumps(value, ensure_ascii=False, sort_keys=True)
        else:
            text = str(value)
        if text == '' or text in seen:
            continue
        seen.append(text)
        if len(seen) >= limit:
            break
    return seen

def find_api_logid(node):
    return first_value(node, ['logid', 'log_id', 'request_id'])

def find_api_code(node):
    return first_value(node, ['err_no', 'code', 'error_code'])

def find_api_message(node):
    return first_value(node, ['message', 'errmsg', 'description', 'error_msg'])

def id_hash(value):
    if value in (None, ''):
        return ''
    return hashlib.sha256(str(value).encode('utf-8')).hexdigest()[:16]

def mask_id(value):
    if value in (None, ''):
        return ''
    text = str(value)
    if len(text) <= 8:
        return '***'
    return text[:4] + '***' + text[-4:]

def to_unix_seconds(value):
    text = str(value or '').strip()
    if not text:
        return ''
    if re.fullmatch(r'\d{13}', text):
        return str(int(text) // 1000)
    if re.fullmatch(r'\d{10}', text):
        return text
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            parsed = dt.datetime.strptime(text, fmt)
            return str(int(time.mktime(parsed.timetuple())))
        except ValueError:
            pass
    return text

def request_json(method, url, headers=None, body=None):
    request_headers = dict(headers or {})
    data = None
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
            parsed = {'body_type': 'non_json', 'body_length': len(payload)}
        return exc.code, parsed
    except Exception as exc:
        return 0, {'transport_error': str(exc)}

def collect_orders(node):
    if node is None:
        return []
    if isinstance(node, dict):
        for key in ('order_list', 'orders', 'order_infos', 'order_info_list', 'list'):
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

def collect_reserve_candidates(order):
    candidates = []
    observed_keys = Counter()
    def walk(value, path):
        if isinstance(value, dict):
            for key, child in value.items():
                lower_key = str(key).lower()
                next_path = path + [str(key)]
                if any(term in lower_key for term in RESERVE_TERMS):
                    observed_keys['.'.join(next_path)] += 1
                    if not isinstance(child, (dict, list)) and child not in (None, ''):
                        candidates.append({'path': '.'.join(next_path), 'value': str(child)})
                walk(child, next_path)
        elif isinstance(value, list):
            for index, child in enumerate(value[:20]):
                walk(child, path + [str(index)])
    walk(order, [])
    return candidates[:20], sorted(observed_keys.keys())[:40]

def buyer_reserve_info_count(order):
    count = 0
    for value in all_values(order, ['buyer_reserve_info']):
        if isinstance(value, list):
            count += len(value)
        elif isinstance(value, dict):
            count += 1 if value else 0
        elif value not in (None, ''):
            count += 1
    return count

def amount_snapshot(order):
    result = {}
    for key in AMOUNT_KEYS:
        value = first_value(order, [key])
        if value not in (None, ''):
            result[key] = str(value)
    return result

def time_snapshot(order):
    result = {}
    for key in ORDER_TIME_KEYS:
        value = first_value(order, [key])
        if value not in (None, ''):
            result[key] = str(value)
    return result

def extract_order(order):
    order_id = first_value(order, ORDER_ID_KEYS)
    out_order_no = first_value(order, OUT_ORDER_KEYS)
    poi_values = unique_text(all_values(order, POI_KEYS), 8)
    product_values = unique_text(all_values(order, PRODUCT_ID_KEYS), 8)
    sku_values = unique_text(all_values(order, SKU_ID_KEYS), 8)
    product_names = unique_text(all_values(order, PRODUCT_NAME_KEYS), 8)
    sku_names = unique_text(all_values(order, SKU_NAME_KEYS), 8)
    status = first_value(order, ORDER_STATUS_KEYS)
    pay_status = first_value(order, PAY_STATUS_KEYS)
    reserve_candidates, reserve_keys = collect_reserve_candidates(order)
    buyer_reserve_count = buyer_reserve_info_count(order)
    certificate_statuses = unique_text(all_values(order, CERT_STATUS_KEYS), 12)
    identity = str(order_id or out_order_no or json.dumps(order, ensure_ascii=False, sort_keys=True)[:200])
    return {
        'order_hash': id_hash(identity),
        'order_id_masked': mask_id(order_id),
        'out_order_no_masked': mask_id(out_order_no),
        'poi_ids': poi_values,
        'primary_poi_id': poi_values[0] if poi_values else '',
        'product_ids': product_values,
        'primary_product_id': product_values[0] if product_values else '',
        'sku_ids': sku_values,
        'primary_sku_id': sku_values[0] if sku_values else '',
        'product_names': product_names,
        'sku_names': sku_names,
        'order_status': str(status) if status not in (None, '') else '',
        'pay_status': str(pay_status) if pay_status not in (None, '') else '',
        'certificate_statuses': certificate_statuses,
        'amount_fields': amount_snapshot(order),
        'time_fields': time_snapshot(order),
        'buyer_reserve_info_count': buyer_reserve_count,
        'reserve_candidate_count': len(reserve_candidates),
        'reserve_candidate_samples': reserve_candidates[:8],
        'reserve_keys': reserve_keys,
        'phone_present': bool(first_value(order, PHONE_KEYS)),
        'open_id_present': bool(first_value(order, OPEN_ID_KEYS))
    }

def counter_rows(counter, key_name):
    return [{key_name: str(key), 'count': value} for key, value in sorted(counter.items(), key=lambda item: (-item[1], str(item[0])))]

def api_call_row(name, http_status, response, extra=None):
    row = {
        'name': name,
        'http_status': http_status,
        'err_no': str(find_api_code(response) or ''),
        'message': str(find_api_message(response) or ''),
        'logid': str(find_api_logid(response) or '')
    }
    if extra:
        row.update(extra)
    return row

def query_client_token(base_url, env):
    body = {
        'client_key': env.get('DOUYIN_LIFE_CLIENT_KEY', ''),
        'client_secret': env.get('DOUYIN_LIFE_CLIENT_SECRET', ''),
        'grant_type': 'client_credential'
    }
    status, response = request_json('POST', base_url + '/oauth/client_token/', body=body)
    token = first_value(response, ['client_access_token', 'access_token'])
    return status, response, token

def query_orders(base_url, token, account_id):
    start_seconds = to_unix_seconds(cfg.get('start_time') or '')
    end_seconds = to_unix_seconds(cfg.get('end_time') or '')
    headers = {
        'access-token': str(token),
        'Rpc-Transit-Life-Account': str(account_id)
    }
    if cfg.get('use_test_data_header'):
        headers['Rpc-Persist-Life-Test-Data-Access'] = 'all'

    all_orders = []
    api_calls = []
    for page_num in range(1, int(cfg.get('max_pages') or 1) + 1):
        query = {
            'account_id': str(account_id),
            'create_order_start_time': start_seconds,
            'create_order_end_time': end_seconds,
            'page_num': str(page_num),
            'page_size': str(cfg.get('page_size') or 50)
        }
        query = {key: value for key, value in query.items() if value not in (None, '')}
        url = base_url + '/goodlife/v1/trade/order/query/?' + urllib.parse.urlencode(query)
        status, response = request_json('GET', url, headers=headers)
        orders = collect_orders(response)
        api_calls.append(api_call_row('life_order_query', status, response, {
            'page_num': page_num,
            'page_size': int(cfg.get('page_size') or 50),
            'orders_detected': len(orders)
        }))
        if status != 200 or str(find_api_code(response) or '') not in ('', '0'):
            break
        all_orders.extend(orders)
        if len(orders) < int(cfg.get('page_size') or 50):
            break
    return all_orders, api_calls

def query_poi_best_effort(base_url, token, account_id, poi_id):
    headers = {
        'access-token': str(token),
        'Rpc-Transit-Life-Account': str(account_id)
    }
    attempts = [
        {'account_id': str(account_id), 'poi_id': str(poi_id)},
        {'account_id': str(account_id), 'poi_ids': str(poi_id)},
        {'poi_id': str(poi_id)}
    ]
    rows = []
    target_poi_id = str(poi_id)

    def collect_poi_nodes(node):
        matches = []
        if isinstance(node, dict):
            node_poi = first_value(node, ['poi_id', 'poiid', 'id'])
            if str(node_poi or '') == target_poi_id:
                matches.append(node)
            for child in node.values():
                matches.extend(collect_poi_nodes(child))
        elif isinstance(node, list):
            for child in node:
                matches.extend(collect_poi_nodes(child))
        return matches

    for params in attempts:
        url = base_url + '/goodlife/v1/shop/poi/query/?' + urllib.parse.urlencode(params)
        status, response = request_json('GET', url, headers=headers)
        row = api_call_row('shop_poi_query', status, response, {'param_keys': sorted(params.keys())})
        matched_nodes = collect_poi_nodes(response)
        matched_node = matched_nodes[0] if matched_nodes else {}
        row['poi_id'] = target_poi_id
        row['matched'] = bool(matched_nodes)
        row['poi_name'] = str(first_value(matched_node, ['poi_name', 'name', 'shop_name']) or '')
        row['address'] = str(first_value(matched_node, ['address', 'poi_address', 'shop_address']) or '')
        rows.append(row)
        if status == 200 and str(find_api_code(response) or '') in ('', '0') and row['matched']:
            break
    return rows

def collect_time_stock_shape(response):
    date_values = []
    time_values = []
    room_values = []
    stock_values = []
    def walk(value, path):
        if isinstance(value, dict):
            for key, child in value.items():
                lower_key = str(key).lower()
                if not isinstance(child, (dict, list)):
                    text = str(child)
                    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', text):
                        date_values.append(text)
                    if ':' in text and ('time' in lower_key or 'range' in lower_key):
                        time_values.append(text)
                    if lower_key in ('room_id', 'sku_id'):
                        room_values.append(text)
                    if lower_key in ('stock', 'available_stock', 'left_stock', 'total_stock'):
                        stock_values.append(text)
                walk(child, path + [str(key)])
        elif isinstance(value, list):
            for child in value:
                walk(child, path)
    walk(response, [])
    return {
        'date_samples': unique_text(date_values, 20),
        'time_samples': unique_text(time_values, 20),
        'room_or_sku_samples': unique_text(room_values, 20),
        'stock_value_samples': unique_text(stock_values, 20)
    }

def query_time_stock_best_effort(base_url, token, account_id, poi_id):
    headers = {
        'access-token': str(token),
        'Rpc-Transit-Life-Account': str(account_id)
    }
    params = {
        'account_id': str(account_id),
        'poi_id': str(poi_id)
    }
    url = base_url + '/goodlife/v1/goods/open/comprehensive/booking/room/time_stock/get/?' + urllib.parse.urlencode(params)
    status, response = request_json('GET', url, headers=headers)
    row = api_call_row('life_time_stock_get', status, response, {'poi_id': str(poi_id)})
    row.update(collect_time_stock_shape(response))
    return row

def summarize_orders(orders):
    seen = set()
    samples = []
    poi_stats = defaultdict(lambda: {'order_count': 0, 'product_ids': Counter(), 'sku_ids': Counter(), 'product_names': Counter(), 'sku_names': Counter()})
    product_sku_stats = defaultdict(lambda: {'order_count': 0, 'poi_ids': Counter(), 'product_names': Counter(), 'sku_names': Counter()})
    status_counts = Counter()
    pay_status_counts = Counter()
    cert_status_counts = Counter()
    reserve_keys = Counter()
    orders_with_poi = 0
    orders_with_product = 0
    orders_with_sku = 0
    orders_with_phone = 0
    orders_with_open_id = 0
    orders_with_buyer_reserve_info = 0
    orders_with_reserve_candidates = 0

    for order in orders:
        if not isinstance(order, dict):
            continue
        item = extract_order(order)
        if item['order_hash'] in seen:
            continue
        seen.add(item['order_hash'])
        if len(samples) < 20:
            samples.append(item)

        if item['order_status']:
            status_counts[item['order_status']] += 1
        if item['pay_status']:
            pay_status_counts[item['pay_status']] += 1
        for cert_status in item['certificate_statuses']:
            cert_status_counts[cert_status] += 1
        for reserve_key in item['reserve_keys']:
            reserve_keys[reserve_key] += 1

        if item['poi_ids']:
            orders_with_poi += 1
        if item['product_ids']:
            orders_with_product += 1
        if item['sku_ids']:
            orders_with_sku += 1
        if item['phone_present']:
            orders_with_phone += 1
        if item['open_id_present']:
            orders_with_open_id += 1
        if item['buyer_reserve_info_count'] > 0:
            orders_with_buyer_reserve_info += 1
        if item['reserve_candidate_count'] > 0:
            orders_with_reserve_candidates += 1

        for poi_id in item['poi_ids']:
            poi_stats[poi_id]['order_count'] += 1
            for product_id in item['product_ids']:
                poi_stats[poi_id]['product_ids'][product_id] += 1
            for sku_id in item['sku_ids']:
                poi_stats[poi_id]['sku_ids'][sku_id] += 1
            for product_name in item['product_names']:
                poi_stats[poi_id]['product_names'][product_name] += 1
            for sku_name in item['sku_names']:
                poi_stats[poi_id]['sku_names'][sku_name] += 1

        key = item['primary_product_id'] + '|' + item['primary_sku_id']
        if key != '|':
            product_sku_stats[key]['order_count'] += 1
            for poi_id in item['poi_ids']:
                product_sku_stats[key]['poi_ids'][poi_id] += 1
            for product_name in item['product_names']:
                product_sku_stats[key]['product_names'][product_name] += 1
            for sku_name in item['sku_names']:
                product_sku_stats[key]['sku_names'][sku_name] += 1

    poi_rows = []
    for poi_id, stat in poi_stats.items():
        poi_rows.append({
            'poi_id': poi_id,
            'order_count': stat['order_count'],
            'product_ids': [key for key, _ in stat['product_ids'].most_common(12)],
            'sku_ids': [key for key, _ in stat['sku_ids'].most_common(12)],
            'product_names': [key for key, _ in stat['product_names'].most_common(8)],
            'sku_names': [key for key, _ in stat['sku_names'].most_common(8)]
        })
    poi_rows.sort(key=lambda item: (-item['order_count'], item['poi_id']))

    product_rows = []
    for key, stat in product_sku_stats.items():
        product_id, sku_id = key.split('|', 1)
        product_rows.append({
            'product_id': product_id,
            'sku_id': sku_id,
            'order_count': stat['order_count'],
            'poi_ids': [value for value, _ in stat['poi_ids'].most_common(8)],
            'product_names': [value for value, _ in stat['product_names'].most_common(4)],
            'sku_names': [value for value, _ in stat['sku_names'].most_common(4)]
        })
    product_rows.sort(key=lambda item: (-item['order_count'], item['product_id'], item['sku_id']))

    total = len(seen)
    return {
        'raw_order_rows_detected': len(orders),
        'deduped_order_count': total,
        'status_counts': counter_rows(status_counts, 'status'),
        'pay_status_counts': counter_rows(pay_status_counts, 'pay_status'),
        'certificate_status_counts': counter_rows(cert_status_counts, 'certificate_status'),
        'poi_summary': poi_rows,
        'product_sku_summary': product_rows,
        'sample_orders': samples,
        'field_completeness': {
            'orders_with_poi': orders_with_poi,
            'orders_with_product_id': orders_with_product,
            'orders_with_sku_id': orders_with_sku,
            'orders_with_phone_present_flag': orders_with_phone,
            'orders_with_open_id_present_flag': orders_with_open_id,
            'orders_with_non_empty_buyer_reserve_info': orders_with_buyer_reserve_info,
            'orders_with_reserve_time_candidates': orders_with_reserve_candidates
        },
        'reserve_key_counts': counter_rows(reserve_keys, 'reserve_key')[:60]
    }

def main():
    report = {
        'generated_at': now_text(),
        'mode': 'READ_ONLY_DISCOVERY',
        'success': False,
        'safety': {
            'db_writes': False,
            'inventory_writes': False,
            'order_creates': False,
            'business_write_endpoints_called': False,
            'raw_private_payload_saved': False,
            'redaction': 'tokens, secrets, open_id, phone, and raw order payload are not emitted'
        },
        'remote': {
            'host': cfg.get('ssh_host'),
            'env_file': cfg.get('remote_env_file')
        },
        'window': {
            'start_time': cfg.get('start_time'),
            'end_time': cfg.get('end_time'),
            'max_pages': int(cfg.get('max_pages') or 1),
            'page_size': int(cfg.get('page_size') or 50),
            'use_test_data_header': bool(cfg.get('use_test_data_header'))
        }
    }
    try:
        env = parse_env_file(cfg['remote_env_file'])
        account_id = env.get('DOUYIN_LIFE_ACCOUNT_ID', '')
        base_url = cfg['base_url'].rstrip('/')
        report['env'] = {
            'account_id': account_id,
            'poi_id': env.get('DOUYIN_LIFE_POI_ID', ''),
            'client_key_present': bool(env.get('DOUYIN_LIFE_CLIENT_KEY')),
            'client_key_length': len(env.get('DOUYIN_LIFE_CLIENT_KEY', '')),
            'client_secret_present': bool(env.get('DOUYIN_LIFE_CLIENT_SECRET')),
            'client_secret_length': len(env.get('DOUYIN_LIFE_CLIENT_SECRET', '')),
            'sku_id_present': bool(env.get('DOUYIN_LIFE_SKU_ID')),
            'sku_out_id_present': bool(env.get('DOUYIN_LIFE_SKU_OUT_ID'))
        }
        missing = [key for key in ('DOUYIN_LIFE_CLIENT_KEY', 'DOUYIN_LIFE_CLIENT_SECRET', 'DOUYIN_LIFE_ACCOUNT_ID') if not env.get(key)]
        if missing:
            report['error'] = 'missing remote env keys: ' + ','.join(missing)
            return report

        token_status, token_response, token = query_client_token(base_url, env)
        report['token'] = api_call_row('client_token', token_status, token_response, {'success': bool(token)})
        if not token:
            report['error'] = 'client_token failed; token value was not emitted'
            return report

        orders, order_calls = query_orders(base_url, token, account_id)
        order_summary = summarize_orders(orders)
        order_summary['api_calls'] = order_calls
        report['order_discovery'] = order_summary

        observed_pois = []
        if env.get('DOUYIN_LIFE_POI_ID'):
            observed_pois.append(str(env.get('DOUYIN_LIFE_POI_ID')))
        for row in order_summary['poi_summary']:
            observed_pois.append(str(row['poi_id']))
        observed_pois = unique_text(observed_pois, 20)

        if not cfg.get('skip_poi_query'):
            poi_rows = []
            for poi_id in observed_pois[:12]:
                poi_rows.extend(query_poi_best_effort(base_url, token, account_id, poi_id))
            report['poi_discovery'] = {
                'enabled': True,
                'observed_poi_count': len(observed_pois),
                'api_calls': poi_rows
            }
        else:
            report['poi_discovery'] = {'enabled': False, 'observed_poi_count': len(observed_pois), 'api_calls': []}

        if not cfg.get('skip_time_stock'):
            stock_rows = []
            for poi_id in observed_pois[:12]:
                stock_rows.append(query_time_stock_best_effort(base_url, token, account_id, poi_id))
            report['time_stock_discovery'] = {
                'enabled': True,
                'observed_poi_count': len(observed_pois),
                'api_calls': stock_rows
            }
        else:
            report['time_stock_discovery'] = {'enabled': False, 'observed_poi_count': len(observed_pois), 'api_calls': []}

        completeness = order_summary['field_completeness']
        report['readiness'] = {
            'can_prepare_yy_product_candidates': len(order_summary['product_sku_summary']) > 0,
            'can_prepare_channel_product_mapping_candidates': len(order_summary['poi_summary']) > 0 and len(order_summary['product_sku_summary']) > 0,
            'can_sync_orders_after_review': order_summary['deduped_order_count'] > 0,
            'can_build_booking_slot_inventory_from_this_order_query': completeness['orders_with_non_empty_buyer_reserve_info'] > 0 or completeness['orders_with_reserve_time_candidates'] > 0,
            'blocking_note_for_booking_slots': 'Do not write yy_booking_slot_inventory unless real reserve slot fields are present.'
        }
        report['success'] = True
        return report
    except Exception as exc:
        report['error'] = str(exc)
        return report

report = main()
print(BEGIN)
print(json.dumps(report, ensure_ascii=False, indent=2))
print(END)
PY
"@
}

function Get-JsonFromMarkedOutput {
    param(
        [Parameter(Mandatory = $true)][object[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Begin,
        [Parameter(Mandatory = $true)][string]$End
    )

    $beginIndex = -1
    $endIndex = -1
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $line = ([string]$Lines[$i]).Trim()
        if ($line -eq $Begin) {
            $beginIndex = $i
            continue
        }
        if ($line -eq $End) {
            $endIndex = $i
            break
        }
    }

    if ($beginIndex -lt 0 -or $endIndex -le $beginIndex) {
        throw "Could not find discovery JSON markers in remote output. begin=$beginIndex end=$endIndex"
    }

    return (($Lines[($beginIndex + 1)..($endIndex - 1)] | ForEach-Object { [string]$_ }) -join [Environment]::NewLine)
}

function Protect-DiscoveryDiagnosticText {
    param([object]$Value)

    if ($null -eq $Value) {
        return ''
    }

    $text = [string]$Value
    $text = $text -replace '(?i)(access[-_]?token["''\s:=]+)[^,''"\s}]+', '$1<redacted>'
    $text = $text -replace '(?i)(client[-_]?secret["''\s:=]+)[^,''"\s}]+', '$1<redacted>'
    $text = $text -replace '(?i)(authorization["''\s:=]+bearer\s+)[^,''"\s}]+', '$1<redacted>'
    $text = $text -replace '(?i)(password(File)?["''\s:=]+)[^,''"\s}]+', '$1<redacted>'
    $text = $text -replace '\b1[3-9]\d{9}\b', '<phone-redacted>'
    return $text
}

function Save-DiscoveryFailureEvidence {
    param(
        [Parameter(Mandatory = $true)][object[]]$RawOutput,
        [Parameter(Mandatory = $true)][string]$ErrorMessage,
        [Parameter(Mandatory = $true)][string]$OutputDir,
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Begin,
        [Parameter(Mandatory = $true)][string]$End
    )

    if (-not (Test-Path -LiteralPath $OutputDir -PathType Container)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }

    $safeLines = @($RawOutput | ForEach-Object { Protect-DiscoveryDiagnosticText $_ })
    $beginIndex = -1
    $endIndex = -1
    for ($i = 0; $i -lt $safeLines.Count; $i++) {
        $line = ([string]$safeLines[$i]).Trim()
        if ($line -eq $Begin) {
            $beginIndex = $i
        }
        if ($line -eq $End) {
            $endIndex = $i
            break
        }
    }

    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $jsonPath = Join-Path $OutputDir "douyin-life-real-account-discovery-failure-$stamp.json"
    $mdPath = Join-Path $OutputDir "douyin-life-real-account-discovery-failure-$stamp.md"

    $failure = [ordered]@{
        generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        mode = 'READ_ONLY_DISCOVERY_DIAGNOSTIC'
        success = $false
        error = (Protect-DiscoveryDiagnosticText $ErrorMessage)
        remote = [ordered]@{
            host = $Config.ssh_host
            envFile = $Config.remote_env_file
        }
        window = [ordered]@{
            startTime = $Config.start_time
            endTime = $Config.end_time
            maxPages = $Config.max_pages
            pageSize = $Config.page_size
            useTestDataHeader = $Config.use_test_data_header
            skipPoiQuery = $Config.skip_poi_query
            skipTimeStock = $Config.skip_time_stock
        }
        markerScan = [ordered]@{
            beginIndex = $beginIndex
            endIndex = $endIndex
            outputLineCount = $safeLines.Count
        }
        safety = [ordered]@{
            dbWrites = $false
            inventoryWrites = $false
            orderCreates = $false
            platformWrites = $false
            redaction = 'tokens, secrets, full phone-like values, and authorization headers are redacted'
        }
        rawOutput = $safeLines
    }

    $failure | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('# Douyin Life Real Account Discovery Failure')
    $lines.Add('')
    $lines.Add("GeneratedAt: $($failure.generatedAt)")
    $lines.Add("Success: False")
    $lines.Add("Error: $($failure.error)")
    $lines.Add('')
    $lines.Add('## Marker Scan')
    $lines.Add('')
    $lines.Add('```text')
    $lines.Add("beginIndex: $beginIndex")
    $lines.Add("endIndex: $endIndex")
    $lines.Add("outputLineCount: $($safeLines.Count)")
    $lines.Add('```')
    $lines.Add('')
    $lines.Add('## Safety')
    $lines.Add('')
    $lines.Add('Read-only diagnostic. No database writes, no inventory writes, no order creation, no Douyin platform writes.')
    $lines.Add('')
    $lines.Add('## Sanitized Output')
    $lines.Add('')
    $lines.Add('```text')
    foreach ($line in $safeLines) {
        $lines.Add([string]$line)
    }
    $lines.Add('```')
    $lines.Add('')
    ($lines -join [Environment]::NewLine) | Set-Content -LiteralPath $mdPath -Encoding UTF8

    return [pscustomobject]@{
        JsonPath = $jsonPath
        MarkdownPath = $mdPath
    }
}

function Format-ArrayText {
    param([object]$Value)
    if ($null -eq $Value) {
        return ''
    }
    $items = @($Value)
    if ($items.Count -eq 0) {
        return ''
    }
    return ($items | ForEach-Object { [string]$_ }) -join ', '
}

function Add-MarkdownTable {
    param(
        [System.Collections.Generic.List[string]]$LineList,
        [Parameter(Mandatory = $true)][string[]]$Headers,
        [AllowEmptyCollection()][object[]]$Rows,
        [Parameter(Mandatory = $true)][scriptblock]$Project
    )

    if ($null -eq $LineList) {
        throw 'LineList is required.'
    }

    $LineList.Add(($Headers -join ' | '))
    $LineList.Add((($Headers | ForEach-Object { '---' }) -join ' | '))
    if ($Rows.Count -eq 0) {
        $LineList.Add((($Headers | ForEach-Object { '-' }) -join ' | '))
        return
    }
    foreach ($row in $Rows) {
        $values = & $Project $row
        $LineList.Add(($values | ForEach-Object { ([string]$_).Replace('|', '/') }) -join ' | ')
    }
}

function New-DiscoveryMarkdown {
    param([Parameter(Mandatory = $true)][pscustomobject]$Summary)

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("# Douyin Life Real Account Discovery")
    $lines.Add("")
    $lines.Add("GeneratedAt: $($Summary.generated_at)")
    $lines.Add("")
    $lines.Add("## Result")
    $lines.Add("")
    $lines.Add("Mode: $($Summary.mode)")
    $lines.Add("Success: $($Summary.success)")
    if ($Summary.PSObject.Properties.Name -contains 'error') {
        $lines.Add("Error: $($Summary.error)")
    }
    $lines.Add("")
    $lines.Add("Safety boundary: no database writes, no inventory writes, no order creation, no raw private payload saved.")
    $lines.Add("")
    $lines.Add("## Environment")
    $lines.Add("")
    $lines.Add('```text')
    $lines.Add("server: $($Summary.remote.host)")
    $lines.Add("remoteEnvFile: $($Summary.remote.env_file)")
    $lines.Add("account_id: $($Summary.env.account_id)")
    $lines.Add("env_poi_id: $($Summary.env.poi_id)")
    $lines.Add("client_key: present=$($Summary.env.client_key_present), length=$($Summary.env.client_key_length)")
    $lines.Add("client_secret: present=$($Summary.env.client_secret_present), length=$($Summary.env.client_secret_length)")
    $lines.Add("sku_id_present: $($Summary.env.sku_id_present)")
    $lines.Add("sku_out_id_present: $($Summary.env.sku_out_id_present)")
    $lines.Add('```')
    $lines.Add("")
    $lines.Add("## Query Window")
    $lines.Add("")
    $lines.Add('```text')
    $lines.Add("start: $($Summary.window.start_time)")
    $lines.Add("end: $($Summary.window.end_time)")
    $lines.Add("maxPages: $($Summary.window.max_pages)")
    $lines.Add("pageSize: $($Summary.window.page_size)")
    $lines.Add("useTestDataHeader: $($Summary.window.use_test_data_header)")
    $lines.Add('```')
    $lines.Add("")
    $lines.Add("## Token And Orders")
    $lines.Add("")
    $lines.Add('```text')
    $lines.Add("client_token_http_status: $($Summary.token.http_status)")
    $lines.Add("client_token_success: $($Summary.token.success)")
    $lines.Add("client_token_logid: $($Summary.token.logid)")
    if ($Summary.PSObject.Properties.Name -contains 'order_discovery') {
        $lines.Add("order_rows_detected: $($Summary.order_discovery.raw_order_rows_detected)")
        $lines.Add("deduped_order_count: $($Summary.order_discovery.deduped_order_count)")
    }
    $lines.Add('```')
    $lines.Add("")

    if ($Summary.PSObject.Properties.Name -contains 'order_discovery') {
        $lines.Add("## Order API Calls")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('page', 'http', 'err_no', 'orders', 'logid', 'message') -Rows @($Summary.order_discovery.api_calls) -Project {
            param($row)
            @($row.page_num, $row.http_status, $row.err_no, $row.orders_detected, $row.logid, $row.message)
        }
        $lines.Add("")

        $lines.Add("## POI Summary")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('poi_id', 'orders', 'product_ids', 'sku_ids', 'product_names') -Rows @($Summary.order_discovery.poi_summary) -Project {
            param($row)
            @($row.poi_id, $row.order_count, (Format-ArrayText $row.product_ids), (Format-ArrayText $row.sku_ids), (Format-ArrayText $row.product_names))
        }
        $lines.Add("")

        $lines.Add("## Product SKU Summary")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('product_id', 'sku_id', 'orders', 'poi_ids', 'product_names', 'sku_names') -Rows @($Summary.order_discovery.product_sku_summary) -Project {
            param($row)
            @($row.product_id, $row.sku_id, $row.order_count, (Format-ArrayText $row.poi_ids), (Format-ArrayText $row.product_names), (Format-ArrayText $row.sku_names))
        }
        $lines.Add("")

        $lines.Add("## Status Counts")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('status', 'count') -Rows @($Summary.order_discovery.status_counts) -Project {
            param($row)
            @($row.status, $row.count)
        }
        $lines.Add("")

        $lines.Add("## Reserve Field Signal")
        $lines.Add("")
        $fc = $Summary.order_discovery.field_completeness
        $lines.Add('```text')
        $lines.Add("orders_with_poi: $($fc.orders_with_poi)")
        $lines.Add("orders_with_product_id: $($fc.orders_with_product_id)")
        $lines.Add("orders_with_sku_id: $($fc.orders_with_sku_id)")
        $lines.Add("orders_with_non_empty_buyer_reserve_info: $($fc.orders_with_non_empty_buyer_reserve_info)")
        $lines.Add("orders_with_reserve_time_candidates: $($fc.orders_with_reserve_time_candidates)")
        $lines.Add("orders_with_phone_present_flag: $($fc.orders_with_phone_present_flag)")
        $lines.Add("orders_with_open_id_present_flag: $($fc.orders_with_open_id_present_flag)")
        $lines.Add('```')
        $lines.Add("")
    }

    if ($Summary.PSObject.Properties.Name -contains 'poi_discovery') {
        $lines.Add("## POI Discovery")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('poi_id', 'matched', 'http', 'err_no', 'name', 'address', 'logid', 'message') -Rows @($Summary.poi_discovery.api_calls) -Project {
            param($row)
            @($row.poi_id, $row.matched, $row.http_status, $row.err_no, $row.poi_name, $row.address, $row.logid, $row.message)
        }
        $lines.Add("")
    }

    if ($Summary.PSObject.Properties.Name -contains 'time_stock_discovery') {
        $lines.Add("## Time Stock Discovery")
        $lines.Add("")
        Add-MarkdownTable -LineList $lines -Headers @('poi_id', 'http', 'err_no', 'dates', 'times', 'rooms', 'stocks', 'logid', 'message') -Rows @($Summary.time_stock_discovery.api_calls) -Project {
            param($row)
            @($row.poi_id, $row.http_status, $row.err_no, (Format-ArrayText $row.date_samples), (Format-ArrayText $row.time_samples), (Format-ArrayText $row.room_or_sku_samples), (Format-ArrayText $row.stock_value_samples), $row.logid, $row.message)
        }
        $lines.Add("")
    }

    if ($Summary.PSObject.Properties.Name -contains 'readiness') {
        $lines.Add("## Write Readiness Gate")
        $lines.Add("")
        $lines.Add('```text')
        $lines.Add("yy_product candidates: $($Summary.readiness.can_prepare_yy_product_candidates)")
        $lines.Add("yy_channel_product_mapping candidates: $($Summary.readiness.can_prepare_channel_product_mapping_candidates)")
        $lines.Add("orders can sync after review: $($Summary.readiness.can_sync_orders_after_review)")
        $lines.Add("can build yy_booking_slot_inventory from this order query: $($Summary.readiness.can_build_booking_slot_inventory_from_this_order_query)")
        $lines.Add("note: $($Summary.readiness.blocking_note_for_booking_slots)")
        $lines.Add('```')
        $lines.Add("")
    }

    $lines.Add("## Next Step")
    $lines.Add("")
    $lines.Add('After reviewing this evidence, write operations should be separate and explicit: seed/update `yy_product`, seed/update `yy_channel_product_mapping`, then run order sync/backfill. Booking slot inventory must only be written when real reserve slot fields exist.')
    $lines.Add("")
    return ($lines -join [Environment]::NewLine)
}

Assert-DiscoveryBounds

if ([string]::IsNullOrWhiteSpace($StartTime) -and [string]::IsNullOrWhiteSpace($EndTime)) {
    $now = Get-Date
    $EndTime = Format-DouyinTime -Value $now
    $StartTime = Format-DouyinTime -Value $now.AddHours(-1 * $RecentHours)
}

$config = @{
    begin_marker = $BeginMarker
    end_marker = $EndMarker
    ssh_host = $SshHost
    remote_env_file = $RemoteEnvFile
    base_url = $BaseUrl
    start_time = $StartTime
    end_time = $EndTime
    max_pages = $MaxPages
    page_size = $PageSize
    skip_poi_query = [bool]$SkipPoiQuery
    skip_time_stock = [bool]$SkipTimeStock
    use_test_data_header = [bool]$UseTestDataHeader
}

Write-Host 'yingyue douyin real account discovery'
Write-Host "mode: read-only"
Write-Host "sshHost: $SshHost"
Write-Host "remoteEnvFile: $RemoteEnvFile"
Write-Host "timeRange: $StartTime -> $EndTime"
Write-Host "pages: max=$MaxPages size=$PageSize"
Write-Host "poiQuery: $(-not [bool]$SkipPoiQuery)"
Write-Host "timeStockQuery: $(-not [bool]$SkipTimeStock)"
Write-Host ''

$remoteCommand = New-RemoteDiscoveryCommand -Config $config
if ($DryRun) {
    Write-Host 'dry-run: remote discovery command prepared; no secrets are embedded in the command.'
    exit 0
}

$helperPath = Join-Path $PSScriptRoot 'invoke-hk2.ps1'
if (-not (Test-Path -LiteralPath $helperPath -PathType Leaf)) {
    throw "HK2 helper not found: $helperPath"
}

$helperParams = @{
    SshHost = $SshHost
    SshUser = $SshUser
    SshPasswordFile = $SshPasswordFile
    Command = $remoteCommand
    TimeoutSec = 180
    AllowNonZeroExit = $true
}

try {
    $rawOutput = @(& $helperPath @helperParams 2>&1)
} catch {
    $rawOutput = @($_)
    $failureEvidence = Save-DiscoveryFailureEvidence -RawOutput $rawOutput -ErrorMessage $_.Exception.Message -OutputDir $OutputDir -Config $config -Begin $BeginMarker -End $EndMarker
    Write-Host ''
    Write-Host "failureJson: $($failureEvidence.JsonPath)"
    Write-Host "failureMarkdown: $($failureEvidence.MarkdownPath)"
    throw
}

try {
    $jsonText = Get-JsonFromMarkedOutput -Lines $rawOutput -Begin $BeginMarker -End $EndMarker
} catch {
    $failureEvidence = Save-DiscoveryFailureEvidence -RawOutput $rawOutput -ErrorMessage $_.Exception.Message -OutputDir $OutputDir -Config $config -Begin $BeginMarker -End $EndMarker
    Write-Host ''
    Write-Host "failureJson: $($failureEvidence.JsonPath)"
    Write-Host "failureMarkdown: $($failureEvidence.MarkdownPath)"
    throw "Discovery failed before producing marked JSON. See failure evidence: $($failureEvidence.MarkdownPath)"
}
$summary = $jsonText | ConvertFrom-Json

if (-not (Test-Path -LiteralPath $OutputDir -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$jsonPath = Join-Path $OutputDir "douyin-life-real-account-discovery-$stamp.json"
$mdPath = Join-Path $OutputDir "douyin-life-real-account-discovery-$stamp.md"

$summary | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
New-DiscoveryMarkdown -Summary $summary | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host ''
Write-Host "json: $jsonPath"
Write-Host "markdown: $mdPath"
Write-Host "success: $($summary.success)"
if ($summary.PSObject.Properties.Name -contains 'order_discovery') {
    Write-Host "orders: $($summary.order_discovery.deduped_order_count)"
}
if ($summary.PSObject.Properties.Name -contains 'readiness') {
    Write-Host "mappingCandidates: $($summary.readiness.can_prepare_channel_product_mapping_candidates)"
    Write-Host "bookingSlotWritableFromOrderQuery: $($summary.readiness.can_build_booking_slot_inventory_from_this_order_query)"
}
