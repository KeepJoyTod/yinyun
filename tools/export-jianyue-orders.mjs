#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const authBaseUrl = process.env.JIANYUE_AUTH_BASE_URL || process.env.JIANYUE_BASE_URL || 'https://brand-service.yuyue123.cn/admin'
const apiBaseUrl = process.env.JIANYUE_API_BASE_URL || process.env.JIANYUE_BASE_URL || authBaseUrl
const apiVersion = process.env.JIANYUE_API_VERSION || '2.0.1.5.2'
const brandCode = process.env.JIANYUE_BRAND_CODE || 'sg9ix50p'
const tenantId = '000000'

const account = process.env.JIANYUE_ACCOUNT
const password = process.env.JIANYUE_PASSWORD
const outDir = process.env.YIYUE_OUT_DIR || process.env.JIANYUE_OUTPUT_DIR || 'C:\\Users\\Administrator\\Desktop\\yiyue'
const sqlOutDir = process.env.JIANYUE_ORDER_SQL_OUTPUT_DIR || process.env.JIANYUE_SQL_OUTPUT_DIR || outDir
const repoRoot = process.env.YINGYUE_REPO_ROOT || process.cwd()
const lookbackDays = parsePositiveInteger(process.env.JIANYUE_ORDER_LOOKBACK_DAYS, 30)
const futureDays = parsePositiveInteger(process.env.JIANYUE_ORDER_FUTURE_DAYS, 45)
const pageSize = Math.min(parsePositiveInteger(process.env.JIANYUE_ORDER_PAGE_SIZE, 100), 200)
const maxPages = parsePositiveInteger(process.env.JIANYUE_ORDER_MAX_PAGES, 20)

const ymdStamp = shanghaiDateStamp()

const storeMap = new Map([
  [6213, { storeId: '900000000000000100', storeCode: 'BZ-WANDA', storeName: '滨州万达店', order: 1 }],
  [5595, { storeId: '900000000000000200', storeCode: 'BZ-WUYUE', storeName: '滨州吾悦店', order: 2 }],
  [6305, { storeId: '900000000000000300', storeCode: 'WH-ZHIGU', storeName: '威海智慧谷店', order: 3 }],
  [6385, { storeId: '900000000000000400', storeCode: 'ZB-WANXIANGHUI', storeName: '淄博万象汇店', order: 4 }],
])

const serviceGroupByStoreId = new Map([
  ['900000000000000100', '900000000000010100'],
  ['900000000000000200', '900000000000010200'],
  ['900000000000000300', '900000000000010300'],
  ['900000000000000400', '900000000000010400'],
])

const sqlQuote = (value) => `'${String(value ?? '').replaceAll("'", "''")}'`
const numberOrZero = (value) => Number.isFinite(Number(value)) ? Number(value) : 0
const cents = (value) => Math.round(numberOrZero(value) * 100)

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function shanghaiToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (type) => parts.find((part) => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function shanghaiDateStamp(now = new Date()) {
  return shanghaiToday(now).replaceAll('-', '')
}

export function resolveOrderSqlPath({ outDir, sqlOutDir = '', repoRoot = '', ymdStamp }) {
  const targetDir = sqlOutDir || outDir
  return path.join(targetDir, `postgres_jianyue_orders_import_${ymdStamp}.sql`)
}

const addDays = (date, days) => {
  const next = new Date(`${date}T00:00:00+08:00`)
  next.setDate(next.getDate() + days)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

const toClock = (dateTime) => String(dateTime ?? '').slice(11, 16)
const toDate = (dateTime) => String(dateTime ?? '').slice(0, 10)

export function mapJianyueStatus(order) {
  const text = String(order?.order_status_des ?? '')
  if (/服务中/.test(text)) return { status: 'SERVING', payStatus: 'PAID' }
  if (/已完成/.test(text)) return { status: 'COMPLETED', payStatus: 'PAID' }
  if (/取消/.test(text)) return { status: 'CANCELLED', payStatus: 'CLOSED' }
  if (/退/.test(text)) return { status: 'REFUNDED', payStatus: 'REFUNDED' }
  return { status: 'PENDING', payStatus: cents(order?.paid) > 0 ? 'PAID' : 'UNPAID' }
}

export function normalizeJianyueOrder(order) {
  const store = storeMap.get(Number(order?.store_id))
  if (!store || !order?.order_id || !order?.appointment_time) return null
  const appointmentTime = String(order.appointment_time)
  const slotDate = toDate(appointmentTime)
  const slotStartTime = toClock(appointmentTime)
  if (!slotDate || !slotStartTime) return null
  const slotEndTime = addMinutesToClock(slotDate, slotStartTime, 30)
  const { status, payStatus } = mapJianyueStatus(order)
  const totalAmountCent = cents(order.total ?? order.original_total)
  const paidAmountCent = cents(order.paid)
  const refundAmountCent = cents(order.refund_amount)
  return {
    id: String(BigInt('910000000000000000') + BigInt(order.order_id)),
    tenantId,
    storeId: store.storeId,
    serviceGroupId: serviceGroupByStoreId.get(store.storeId) ?? '',
    orderNo: `JY-${order.order_id}`,
    customerName: String(order.customer_name ?? order.name ?? ''),
    customerPhone: String(order.mobile ?? ''),
    source: mapJianyueSource(order),
    bookingMethod: 'CHANNEL',
    orderTime: String(order.create_time ?? appointmentTime),
    arrivalTime: appointmentTime,
    status,
    externalOrderId: String(order.order_id),
    channelType: 'JIANYUE',
    totalAmountCent,
    paidAmountCent,
    payStatus,
    paidTime: paidAmountCent > 0 ? String(order.create_time ?? appointmentTime) : '',
    refundStatus: refundAmountCent > 0 ? 'REFUNDED' : '',
    refundAmountCent,
    serviceNameSnapshot: String(order.product_names ?? ''),
    slotDate,
    slotStartTime,
    slotEndTime,
    inventoryStatus: 'IMPORTED',
    remark: buildRemark(order),
  }
}

const buildRemark = (order) => {
  const parts = [
    `简约网导入 order_id=${order.order_id}`,
    order.order_status_des ? `状态=${order.order_status_des}` : '',
    order.order_from_type_des ? `来源=${order.order_from_type_des}` : '',
    order.remark ? `备注=${order.remark}` : '',
  ].filter(Boolean)
  return parts.join('；').slice(0, 480)
}

export function mapJianyueSource(order) {
  const text = `${order?.order_from_type_des ?? ''} ${order?.product_names ?? ''}`
  if (/抖音/.test(text)) return 'DOUYIN_LIFE'
  if (/美团|大众点评/.test(text)) return 'MEITUAN'
  if (/微信/.test(text)) return 'WECHAT'
  if (/现场|店内|自有/.test(text)) return 'LOCAL'
  return 'JIANYUE'
}

const addMinutesToClock = (date, clock, minutes) => {
  const parsed = new Date(`${date}T${clock}:00+08:00`)
  if (Number.isNaN(parsed.getTime())) return clock
  parsed.setMinutes(parsed.getMinutes() + minutes)
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

const requestJson = async ({ baseUrl = authBaseUrl, path: apiPath, method = 'GET', token = '', query = {}, body = undefined }) => {
  const url = new URL(`${baseUrl}${apiPath}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }
  const headers = { accept: 'application/json, text/plain, */*', 'api-version': apiVersion }
  if (token) headers.auth = token
  if (body !== undefined) headers['content-type'] = 'application/json;charset=UTF-8'
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const json = text ? JSON.parse(text) : null
  if (!response.ok || !json || json.result_code !== 0) {
    throw new Error(`${method} ${apiPath} failed: HTTP ${response.status}, ${json?.result_code ?? ''} ${json?.result_msg ?? ''}`)
  }
  return json
}

const loginBrand = async () => {
  const login = await requestJson({
    baseUrl: authBaseUrl,
    path: '/api/account/login_by_ac',
    method: 'POST',
    body: { account, pwd: password },
  })
  const baseToken = login.data?.token
  if (!baseToken) throw new Error('login_by_ac succeeded but token is missing')
  const changeBrand = await requestJson({
    baseUrl: authBaseUrl,
    path: '/api/account/change_brand',
    method: 'POST',
    token: baseToken,
    query: { brand_code: brandCode },
  })
  const brandToken = changeBrand.data?.token
  if (!brandToken) throw new Error('change_brand succeeded but brand token is missing')
  return brandToken
}

const extractItems = (data) => Array.isArray(data?.items) ? data.items : []
const hasNextPage = (data, pageIndex) => Boolean(data?.has_next_page) || (Number(data?.total_pages ?? 0) > pageIndex)

export function buildQueryOrdersRequest({ pageIndex, pageSize, startDate, endDate }) {
  const start = `${startDate} 00:00:00`
  const end = `${endDate} 23:59:59`
  return {
    baseUrl: apiBaseUrl,
    path: '/api/order/query_orders',
    method: 'POST',
    query: {
      page_index: pageIndex,
      page_size: pageSize,
      sort_by: '',
      sort_type: '',
    },
    body: {
      order_type: null,
      store_ids: null,
      keywords: '',
      remark_keywords: '',
      product_name: '',
      promo_code: '',
      promo_ids: '',
      card_ids: '',
      order_time_range: {
        start_date: start,
        end_date: end,
      },
      appointment_time_range: {
        start_date: start,
        end_date: end,
      },
      order_status: '',
      pay_status: '',
      is_with_coupons: '',
      attr_status: '',
      order_from_types: [0, 1, 4, 5, 6, 7, 2, 3],
      customer_extend: '',
      order_extend: '',
      with_coupon_types: null,
      order_trade: '',
      order_way: [1, 2],
      id_card_no: '',
    },
  }
}

const fetchOrders = async (token, startDate, endDate) => {
  const orders = []
  const calls = []
  for (let pageIndex = 1; pageIndex <= maxPages; pageIndex += 1) {
    const json = await requestJson({
      ...buildQueryOrdersRequest({ pageIndex, pageSize, startDate, endDate }),
      token,
    })
    const items = extractItems(json.data)
    calls.push({
      api: 'query_orders',
      pageIndex,
      pageSize,
      count: items.length,
      totalCount: Number(json.data?.total_count ?? items.length),
    })
    orders.push(...items)
    if (!hasNextPage(json.data, pageIndex) || items.length === 0) break
  }
  return { orders, calls }
}

export function buildSql(rows, meta = {}) {
  const lines = []
  lines.push('-- Jianyue order import into Yingyue yy_order')
  lines.push(`-- Generated at ${meta.generatedAt ?? new Date().toISOString()}`)
  lines.push('-- Source: brand-service.yuyue123.cn admin order APIs')
  lines.push('-- Secrets/tokens are intentionally not stored in this file.')
  lines.push('')
  lines.push('begin;')
  lines.push('')
  if (rows.length === 0) {
    lines.push('-- No importable orders in this window.')
    lines.push('commit;')
    lines.push('')
    return lines.join('\n')
  }
  lines.push('with source(id, tenant_id, store_id, order_no, customer_name, customer_phone, source, booking_method, order_time, arrival_time, status, workstation_no, external_order_id, channel_type, total_amount_cent, paid_amount_cent, pay_status, paid_time, refund_status, refund_amount_cent, service_group_id, slot_date, slot_start_time, slot_end_time, inventory_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark) as (')
  lines.push('values')
  lines.push(rows.map(row => `(${row.id}, ${sqlQuote(row.tenantId)}, ${row.storeId}, ${sqlQuote(row.orderNo)}, ${sqlQuote(row.customerName)}, ${sqlQuote(row.customerPhone)}, ${sqlQuote(row.source)}, ${sqlQuote(row.bookingMethod)}, ${sqlTimestamp(row.orderTime)}, ${sqlTimestamp(row.arrivalTime)}, ${sqlQuote(row.status)}, '', ${sqlQuote(row.externalOrderId)}, ${sqlQuote(row.channelType)}, ${row.totalAmountCent}, ${row.paidAmountCent}, ${sqlQuote(row.payStatus)}, ${row.paidTime ? sqlTimestamp(row.paidTime) : 'null'}, ${sqlQuote(row.refundStatus)}, ${row.refundAmountCent}, ${row.serviceGroupId || 'null'}, ${sqlQuote(row.slotDate)}, ${sqlQuote(row.slotStartTime)}, ${sqlQuote(row.slotEndTime)}, ${sqlQuote(row.inventoryStatus)}, 103, 1, now(), 1, now(), '0', ${sqlQuote(row.remark)})`).join(',\n'))
  lines.push('), updated as (')
  lines.push('  update yy_order target')
  lines.push('     set store_id = source.store_id,')
  lines.push('         customer_name = source.customer_name,')
  lines.push('         customer_phone = source.customer_phone,')
  lines.push('         source = source.source,')
  lines.push('         booking_method = source.booking_method,')
  lines.push('         order_time = source.order_time,')
  lines.push('         arrival_time = source.arrival_time,')
  lines.push('         status = source.status,')
  lines.push('         external_order_id = source.external_order_id,')
  lines.push('         channel_type = source.channel_type,')
  lines.push('         total_amount_cent = source.total_amount_cent,')
  lines.push('         paid_amount_cent = source.paid_amount_cent,')
  lines.push('         pay_status = source.pay_status,')
  lines.push('         paid_time = source.paid_time,')
  lines.push('         refund_status = source.refund_status,')
  lines.push('         refund_amount_cent = source.refund_amount_cent,')
  lines.push('         service_group_id = source.service_group_id,')
  lines.push('         slot_date = source.slot_date,')
  lines.push('         slot_start_time = source.slot_start_time,')
  lines.push('         slot_end_time = source.slot_end_time,')
  lines.push('         inventory_status = source.inventory_status,')
  lines.push('         update_by = 1,')
  lines.push('         update_time = now(),')
  lines.push("         del_flag = '0',")
  lines.push('         remark = source.remark')
  lines.push('    from source')
  lines.push('   where target.tenant_id = source.tenant_id')
  lines.push('     and target.order_no = source.order_no')
  lines.push('  returning target.id')
  lines.push(')')
  lines.push('insert into yy_order')
  lines.push('(id, tenant_id, store_id, order_no, customer_name, customer_phone, source, booking_method, order_time, arrival_time, status, workstation_no, external_order_id, channel_type, total_amount_cent, paid_amount_cent, pay_status, paid_time, refund_status, refund_amount_cent, service_group_id, slot_date, slot_start_time, slot_end_time, inventory_status, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)')
  lines.push('select source.* from source')
  lines.push(' where not exists (select 1 from yy_order target where target.tenant_id = source.tenant_id and target.order_no = source.order_no);')
  lines.push('')
  lines.push(buildInventoryReconciliationSql({ channelType: 'JIANYUE' }).trimEnd())
  lines.push('')
  lines.push('commit;')
  lines.push('')
  return lines.join('\n')
}

export function buildInventoryReconciliationSql({ channelType = 'JIANYUE' } = {}) {
  const safeChannelType = String(channelType || 'JIANYUE').replaceAll("'", "''")
  return [
    '-- Reconcile imported Jianyue orders with yy_booking_slot_inventory.',
    '-- This keeps daily slot capacity labels consistent after idempotent order imports.',
    'drop table if exists pg_temp.yy_jianyue_slot_order_counts;',
    'create temporary table yy_jianyue_slot_order_counts on commit drop as',
    '  select tenant_id,',
    '         store_id,',
    '         service_group_id,',
    "         coalesce(external_sku_id, '') as external_sku_id,",
    '         slot_date,',
    '         slot_start_time,',
    '         slot_end_time,',
    '         count(*)::integer as order_count,',
    "         concat_ws('|', tenant_id, store_id, coalesce(service_group_id, 0), coalesce(external_sku_id, ''), slot_date, slot_start_time, slot_end_time) as slot_key",
    '    from yy_order',
    "   where del_flag = '0'",
    `     and channel_type = '${safeChannelType}'`,
    "     and pay_status = 'PAID'",
    "     and slot_date is not null and slot_start_time is not null and slot_end_time is not null",
    "     and coalesce(status, '') not in ('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT')",
    '   group by tenant_id, store_id, service_group_id, coalesce(external_sku_id, \'\'), slot_date, slot_start_time, slot_end_time;',
    '',
    'drop table if exists pg_temp.yy_jianyue_inserted_slots;',
    'create temporary table yy_jianyue_inserted_slots (id bigint) on commit drop;',
    'with inserted_slots as (',
    '  insert into yy_booking_slot_inventory',
    '  (id, tenant_id, store_id, service_group_id, external_sku_id, biz_date, start_time, end_time, capacity, paid_count, conflict_count, status, version, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)',
    '  select (920000000000000000 + abs(hashtextextended(slot_key, 20260617)) % 999999999999999)::bigint,',
    '         tenant_id, store_id, service_group_id, external_sku_id,',
    '         slot_date, slot_start_time, slot_end_time,',
    '         greatest(order_count, 1), 0, 0, \'ACTIVE\', 0, 103, 1, now(), 1, now(), \'0\',',
    "         'Backfilled from imported Jianyue orders without schedule slot'",
    '    from yy_jianyue_slot_order_counts counts',
    '   where not exists (',
    '     select 1',
    '       from yy_booking_slot_inventory target',
    "      where target.del_flag = '0'",
    '        and target.tenant_id = counts.tenant_id',
    '        and target.store_id = counts.store_id',
    '        and coalesce(target.service_group_id, 0) = coalesce(counts.service_group_id, 0)',
    "        and coalesce(target.external_sku_id, '') = counts.external_sku_id",
    '        and target.biz_date = counts.slot_date',
    '        and target.start_time = counts.slot_start_time',
    '        and target.end_time = counts.slot_end_time',
    '   )',
    '  on conflict do nothing',
    '  returning id',
    ')',
    'insert into yy_jianyue_inserted_slots select id from inserted_slots;',
    '',
    'drop table if exists pg_temp.yy_jianyue_slot_counts;',
    'create temporary table yy_jianyue_slot_counts on commit drop as',
    '  select target.id as inventory_slot_id,',
    '         counts.tenant_id, counts.store_id, counts.service_group_id, counts.external_sku_id,',
    '         counts.slot_date, counts.slot_start_time, counts.slot_end_time,',
    '         counts.order_count,',
    '         greatest(counts.order_count - coalesce(target.capacity, 0), 0)::integer as conflict_count',
    '    from yy_jianyue_slot_order_counts counts',
    '    join yy_booking_slot_inventory target',
    "      on target.del_flag = '0'",
    '     and target.tenant_id = counts.tenant_id',
    '     and target.store_id = counts.store_id',
    '     and coalesce(target.service_group_id, 0) = coalesce(counts.service_group_id, 0)',
    "     and coalesce(target.external_sku_id, '') = counts.external_sku_id",
    '     and target.biz_date = counts.slot_date',
    '     and target.start_time = counts.slot_start_time',
    '     and target.end_time = counts.slot_end_time;',
    '',
    'drop table if exists pg_temp.yy_jianyue_updated_slots;',
    'create temporary table yy_jianyue_updated_slots (id bigint) on commit drop;',
    'with updated_slots as (',
    '  update yy_booking_slot_inventory target',
    '     set paid_count = least(coalesce(slot_counts.order_count, 0), greatest(coalesce(target.capacity, 0), 0)),',
    '         conflict_count = slot_counts.conflict_count,',
    '         update_by = 1,',
    '         update_time = now()',
    '    from yy_jianyue_slot_counts slot_counts',
    '   where target.id = slot_counts.inventory_slot_id',
    '  returning target.id',
    ')',
    'insert into yy_jianyue_updated_slots select id from updated_slots;',
    '',
    'drop table if exists pg_temp.yy_jianyue_ranked_orders;',
    'create temporary table yy_jianyue_ranked_orders on commit drop as',
    '  select orders.id,',
    '         slot_counts.inventory_slot_id,',
    '         row_number() over (',
    '           partition by orders.tenant_id, orders.store_id, coalesce(orders.service_group_id, 0), coalesce(orders.external_sku_id, \'\'), orders.slot_date, orders.slot_start_time, orders.slot_end_time',
    '           order by orders.id',
    '         ) as slot_rank,',
    '         coalesce(slot_inventory.capacity, 0) as capacity',
    '    from yy_order orders',
    '    join yy_jianyue_slot_counts slot_counts',
    '      on slot_counts.tenant_id = orders.tenant_id',
    '     and slot_counts.store_id = orders.store_id',
    '     and coalesce(slot_counts.service_group_id, 0) = coalesce(orders.service_group_id, 0)',
    "     and slot_counts.external_sku_id = coalesce(orders.external_sku_id, '')",
    '     and slot_counts.slot_date = orders.slot_date',
    '     and slot_counts.slot_start_time = orders.slot_start_time',
    '     and slot_counts.slot_end_time = orders.slot_end_time',
    '    join yy_booking_slot_inventory slot_inventory on slot_inventory.id = slot_counts.inventory_slot_id',
    "   where orders.del_flag = '0'",
    `     and orders.channel_type = '${safeChannelType}'`,
    "     and orders.pay_status = 'PAID'",
    "     and orders.slot_date is not null and orders.slot_start_time is not null and orders.slot_end_time is not null",
    "     and coalesce(orders.status, '') not in ('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT');",
    '',
    'drop table if exists pg_temp.yy_jianyue_updated_orders;',
    'create temporary table yy_jianyue_updated_orders (id bigint) on commit drop;',
    'with updated_orders as (',
    '  update yy_order target',
    '     set inventory_slot_id = ranked_orders.inventory_slot_id,',
    "         inventory_status = case when ranked_orders.slot_rank <= greatest(ranked_orders.capacity, 0) then 'CONFIRMED' else 'CONFLICT' end,",
    "         conflict_reason = case when ranked_orders.slot_rank <= greatest(ranked_orders.capacity, 0) then '' else '库存已满，需人工改期' end,",
    '         update_by = 1,',
    '         update_time = now()',
    '    from yy_jianyue_ranked_orders ranked_orders',
    '   where target.id = ranked_orders.id',
    '  returning target.id',
    ')',
    'insert into yy_jianyue_updated_orders select id from updated_orders;',
    '',
    'select',
    '  (select count(*) from yy_jianyue_inserted_slots) as inserted_inventory_slots,',
    '  (select count(*) from yy_jianyue_updated_slots) as updated_inventory_slots,',
    '  (select count(*) from yy_jianyue_updated_orders) as updated_orders;',
  ].join('\n')
}

const sqlTimestamp = (value) => {
  const text = String(value ?? '').replace('T', ' ').slice(0, 19)
  return text ? `${sqlQuote(text)}::timestamp` : 'null'
}

const writeArtifacts = async (snapshot, rows) => {
  await fs.mkdir(outDir, { recursive: true })
  const normalizedPath = path.join(outDir, `jianyue-orders-normalized-${ymdStamp}.json`)
  const redactedPath = path.join(outDir, `jianyue-orders-redacted-${ymdStamp}.json`)
  const sqlPath = resolveOrderSqlPath({ outDir, sqlOutDir, repoRoot, ymdStamp })
  await fs.mkdir(path.dirname(sqlPath), { recursive: true })
  await fs.writeFile(normalizedPath, JSON.stringify({ ...snapshot, rows }, null, 2), 'utf8')
  await fs.writeFile(redactedPath, JSON.stringify({
    ...snapshot,
    rows: rows.map(row => ({
      ...row,
      customerName: row.customerName ? '<redacted>' : '',
      customerPhone: row.customerPhone ? '<redacted>' : '',
    })),
  }, null, 2), 'utf8')
  await fs.writeFile(sqlPath, buildSql(rows, snapshot), 'utf8')
  return { normalizedPath, redactedPath, sqlPath }
}

const main = async () => {
  if (!account || !password) {
    console.error('Missing JIANYUE_ACCOUNT or JIANYUE_PASSWORD')
    process.exit(2)
  }
  const today = shanghaiToday()
  const startDate = addDays(today, -lookbackDays)
  const endDate = addDays(today, futureDays)
  const token = await loginBrand()
  const { orders, calls } = await fetchOrders(token, startDate, endDate)
  const rows = orders.map(normalizeJianyueOrder).filter(Boolean)
  const deduped = [...new Map(rows.map(row => [row.orderNo, row])).values()]
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: 'jianyue',
    authBaseUrl,
    apiBaseUrl,
    apiVersion,
    brandCode,
    startDate,
    endDate,
    lookbackDays,
    futureDays,
    calls,
    summary: {
      fetched: orders.length,
      importable: deduped.length,
      bySource: countBy(deduped, row => row.source),
      byStatus: countBy(deduped, row => row.status),
      byStore: countBy(deduped, row => row.storeId),
    },
  }
  const artifacts = await writeArtifacts(snapshot, deduped)
  console.log(JSON.stringify({ ...artifacts, summary: snapshot.summary }, null, 2))
}

const countBy = (rows, keyFn) => {
  const result = {}
  for (const row of rows) {
    const key = keyFn(row) || ''
    result[key] = (result[key] ?? 0) + 1
  }
  return result
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
