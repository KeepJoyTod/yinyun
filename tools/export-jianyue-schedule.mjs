#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const baseUrl = process.env.JIANYUE_BASE_URL || 'https://brand-service.yuyue123.cn/admin'
const apiVersion = process.env.JIANYUE_API_VERSION || '2.0.1.5.2'
const brandCode = process.env.JIANYUE_BRAND_CODE || 'sg9ix50p'
const tenantId = '000000'

const account = process.env.JIANYUE_ACCOUNT
const password = process.env.JIANYUE_PASSWORD
const outDir = process.env.YIYUE_OUT_DIR || process.env.JIANYUE_OUTPUT_DIR || 'C:\\Users\\Administrator\\Desktop\\yiyue'
const repoRoot = process.env.YINGYUE_REPO_ROOT || process.cwd()
const scheduleDays = parsePositiveInteger(process.env.JIANYUE_SCHEDULE_DAYS || process.env.JIANYUE_SCHEDULE_MAX_DAYS, 30)

const ymdStamp = shanghaiDateStamp()

const storeMap = new Map([
  [6213, { storeId: '900000000000000100', storeCode: 'BZ-WANDA', storeName: '滨州万达店', order: 1 }],
  [5595, { storeId: '900000000000000200', storeCode: 'BZ-WUYUE', storeName: '滨州吾悦店', order: 2 }],
  [6305, { storeId: '900000000000000300', storeCode: 'WH-ZHIGU', storeName: '威海智慧谷店', order: 3 }],
  [6385, { storeId: '900000000000000400', storeCode: 'ZB-WANXIANGHUI', storeName: '淄博万象汇店', order: 4 }],
])

const defaultGroups = new Map([
  [7757, { serviceGroupId: '900000000000010100', sourceStoreId: 6213, groupCode: 'JY-7757', groupName: '滨州万达店' }],
  [6927, { serviceGroupId: '900000000000010200', sourceStoreId: 5595, groupCode: 'JY-6927', groupName: '滨州吾悦店' }],
  [7864, { serviceGroupId: '900000000000010300', sourceStoreId: 6305, groupCode: 'JY-7864', groupName: '默认服务组' }],
  [7966, { serviceGroupId: '900000000000010400', sourceStoreId: 6385, groupCode: 'JY-7966', groupName: '默认服务组' }],
])

const sqlQuote = (value) => `'${String(value ?? '').replaceAll("'", "''")}'`
const numberOrZero = (value) => Number.isFinite(Number(value)) ? Number(value) : 0
const toDate = (dateTime) => String(dateTime ?? '').slice(0, 10)
const toTime = (dateTime) => String(dateTime ?? '').slice(11, 16)
const cnWeekday = (date) => {
  const day = new Date(`${date}T00:00:00+08:00`).getDay()
  return day === 0 ? 7 : day
}

const durationMinutes = (start, end) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, eh * 60 + em - (sh * 60 + sm))
}

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

export function filterScheduleDays(days, { today = shanghaiToday(), maxDays = scheduleDays } = {}) {
  return (days ?? [])
    .filter((day) => [0, 1].includes(Number(day?.type)))
    .filter((day) => toDate(day?.date) >= today)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, maxDays)
}

const requestJson = async ({ path: apiPath, method = 'GET', token = '', query = {}, body = undefined }) => {
  const url = new URL(`${baseUrl}${apiPath}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  const headers = {
    accept: 'application/json, text/plain, */*',
    'api-version': apiVersion,
  }
  if (token) headers.auth = token
  if (body !== undefined) headers['content-type'] = 'application/json;charset=UTF-8'

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`Non-JSON response ${response.status} ${apiPath}: ${text.slice(0, 160)}`)
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${apiPath}: ${json?.result_msg ?? text.slice(0, 160)}`)
  }
  return json
}

const assertOk = (json, label) => {
  if (!json || json.result_code !== 0) {
    throw new Error(`${label} failed: ${json?.result_code} ${json?.result_msg ?? ''}`)
  }
}

const main = async () => {
  if (!account || !password) {
    console.error('Missing JIANYUE_ACCOUNT or JIANYUE_PASSWORD')
    process.exit(2)
  }

  const scheduleStartDate = shanghaiToday()
  const login = await requestJson({
    path: '/api/account/login_by_ac',
    method: 'POST',
    body: { account, pwd: password },
  })
  assertOk(login, 'login_by_ac')
  const baseToken = login.data?.token
  if (!baseToken) throw new Error('login_by_ac succeeded but token is missing')

  const userBrands = await requestJson({
    path: '/api/account/get_user_brands',
    token: baseToken,
  })
  assertOk(userBrands, 'get_user_brands')
  const brandExists = (userBrands.data ?? []).some((brand) => brand?.code === brandCode)
  if (!brandExists) throw new Error(`brand ${brandCode} not visible for current user`)

  const changeBrand = await requestJson({
    path: '/api/account/change_brand',
    method: 'POST',
    token: baseToken,
    query: { brand_code: brandCode },
  })
  assertOk(changeBrand, 'change_brand')
  const brandToken = changeBrand.data?.token
  if (!brandToken) throw new Error('change_brand succeeded but brand token is missing')

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: 'jianyue',
    baseUrl,
    apiVersion,
    brandCode,
    scheduleStartDate,
    scheduleDays,
    selectedGroups: [],
    slots: [],
    dateOrders: [],
    calls: [],
    summary: {},
  }

  for (const [groupId, group] of defaultGroups.entries()) {
    const store = storeMap.get(group.sourceStoreId)
    const cyc = await requestJson({
      path: '/api/schedule/get_cyc_exp',
      token: brandToken,
      query: { store_id: group.sourceStoreId, type: 0, u_id: groupId },
    })
    assertOk(cyc, `get_cyc_exp ${groupId}`)
    const days = filterScheduleDays(cyc.data ?? [], {
      today: scheduleStartDate,
      maxDays: scheduleDays,
    })

    snapshot.selectedGroups.push({
      jianyueStoreId: group.sourceStoreId,
      jianyueGroupId: groupId,
      storeId: store.storeId,
      storeCode: store.storeCode,
      storeName: store.storeName,
      serviceGroupId: group.serviceGroupId,
      groupCode: group.groupCode,
      groupName: group.groupName,
      days: days.length,
    })
    snapshot.calls.push({
      api: 'get_cyc_exp',
      storeId: group.sourceStoreId,
      groupId,
      count: days.length,
    })

    let dayIndex = 0
    for (const day of days) {
      dayIndex += 1
      const bizDate = toDate(day.date)
      const parts = await requestJson({
        path: '/api/schedule/get_cyc_part_exp',
        token: brandToken,
        query: { cyc_id: day.cyc_id },
      })
      assertOk(parts, `get_cyc_part_exp ${day.cyc_id}`)
      const orders = await requestJson({
        path: '/api/schedule/get_date_orders',
        token: brandToken,
        query: { cyc_id: day.cyc_id },
      })
      assertOk(orders, `get_date_orders ${day.cyc_id}`)

      snapshot.calls.push({
        api: 'get_cyc_part_exp',
        storeId: group.sourceStoreId,
        groupId,
        date: bizDate,
        count: (parts.data ?? []).length,
      })
      snapshot.calls.push({
        api: 'get_date_orders',
        storeId: group.sourceStoreId,
        groupId,
        date: bizDate,
        count: (orders.data ?? []).length,
      })

      let slotIndex = 0
      for (const part of (parts.data ?? [])) {
        if (!part?.begin_time || !part?.end_time) continue
        slotIndex += 1
        const startTime = toTime(part.begin_time)
        const endTime = toTime(part.end_time)
        const capacity = numberOrZero(part.total)
        const paidCount = numberOrZero(part.use_number)
        snapshot.slots.push({
          jianyueStoreId: group.sourceStoreId,
          jianyueGroupId: groupId,
          jianyueCycId: day.cyc_id,
          jianyueCycPartId: part.cyc_part_id,
          storeId: store.storeId,
          storeCode: store.storeCode,
          storeName: store.storeName,
          serviceGroupId: group.serviceGroupId,
          serviceGroupCode: group.groupCode,
          serviceGroupName: group.groupName,
          bizDate,
          weekday: cnWeekday(bizDate),
          startTime,
          endTime,
          durationMinutes: durationMinutes(startTime, endTime),
          capacity,
          paidCount,
          remaining: Math.max(0, capacity - paidCount),
          status: part.is_open === false || day.type === 1 ? 'PAUSED' : 'ACTIVE',
        })
      }

      for (const order of (orders.data ?? [])) {
        snapshot.dateOrders.push({
          jianyueStoreId: group.sourceStoreId,
          jianyueGroupId: groupId,
          storeId: store.storeId,
          serviceGroupId: group.serviceGroupId,
          bizDate,
          orderId: order?.order_id,
          orderNoMasked: order?.order_no ? `${String(order.order_no).slice(0, 4)}***${String(order.order_no).slice(-4)}` : '',
          appointmentTime: order?.appointment_time,
          status: order?.order_status,
          statusText: order?.order_status_des,
          sourceType: order?.order_from_type,
          sourceText: order?.order_from_type_des,
          storeName: order?.store_name,
          productNames: order?.product_names,
        })
      }
    }
  }

  snapshot.slots.sort((a, b) =>
    a.storeCode.localeCompare(b.storeCode)
    || a.bizDate.localeCompare(b.bizDate)
    || a.startTime.localeCompare(b.startTime)
    || a.serviceGroupCode.localeCompare(b.serviceGroupCode)
  )

  const summaryByStore = {}
  for (const slot of snapshot.slots) {
    const bucket = summaryByStore[slot.storeCode] ?? {
      storeId: slot.storeId,
      storeName: slot.storeName,
      slotCount: 0,
      totalCapacity: 0,
      totalPaid: 0,
      firstDate: slot.bizDate,
      lastDate: slot.bizDate,
    }
    bucket.slotCount += 1
    bucket.totalCapacity += slot.capacity
    bucket.totalPaid += slot.paidCount
    if (slot.bizDate < bucket.firstDate) bucket.firstDate = slot.bizDate
    if (slot.bizDate > bucket.lastDate) bucket.lastDate = slot.bizDate
    summaryByStore[slot.storeCode] = bucket
  }
  snapshot.summary = {
    groupCount: snapshot.selectedGroups.length,
    slotCount: snapshot.slots.length,
    dateOrderCount: snapshot.dateOrders.length,
    byStore: summaryByStore,
  }

  await fs.mkdir(outDir, { recursive: true })
  const normalizedPath = path.join(outDir, `jianyue-booking-slot-inventory-normalized-${ymdStamp}.json`)
  await fs.writeFile(normalizedPath, JSON.stringify(snapshot, null, 2), 'utf8')

  const sqlPath = path.join(repoRoot, 'backend', 'script', 'sql', 'postgres', `postgres_jianyue_booking_slot_inventory_seed_${ymdStamp}.sql`)
  await fs.mkdir(path.dirname(sqlPath), { recursive: true })
  await fs.writeFile(sqlPath, buildSql(snapshot), 'utf8')

  const docPath = path.join(outDir, `jianyue-booking-slot-inventory-summary-${ymdStamp}.md`)
  await fs.writeFile(docPath, buildSummary(snapshot, normalizedPath, sqlPath), 'utf8')

  console.log(JSON.stringify({
    normalizedPath,
    sqlPath,
    docPath,
    summary: snapshot.summary,
  }, null, 2))
}

const buildSql = (snapshot) => {
  const lines = []
  lines.push('-- Jianyue schedule import into Yingyue unified booking slot inventory')
  lines.push(`-- Generated at ${snapshot.generatedAt}`)
  lines.push('-- Source: brand-service.yuyue123.cn admin schedule APIs')
  lines.push('-- Secrets/tokens are intentionally not stored in this file.')
  lines.push('')
  lines.push('begin;')
  lines.push('')

  lines.push('insert into yy_service_group')
  lines.push('(id, tenant_id, store_id, group_code, group_name, capacity, duration_minutes, status, sort, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)')
  lines.push('values')
  const groupRows = snapshot.selectedGroups.map((group, index) => {
    const slots = snapshot.slots.filter((slot) => slot.serviceGroupId === group.serviceGroupId)
    const maxCapacity = Math.max(1, ...slots.map((slot) => slot.capacity))
    const durations = slots.map((slot) => slot.durationMinutes).filter(Boolean)
    const minDuration = durations.length ? Math.min(...durations) : 30
    return `(${group.serviceGroupId}, ${sqlQuote(tenantId)}, ${group.storeId}, ${sqlQuote(group.groupCode)}, ${sqlQuote(group.groupName)}, ${maxCapacity}, ${minDuration}, '0', ${index + 1}, 103, 1, now(), 1, now(), '0', ${sqlQuote(`Imported from Jianyue group ${group.jianyueGroupId} / store ${group.jianyueStoreId}`)})`
  })
  lines.push(groupRows.join(',\n'))
  lines.push("on conflict (tenant_id, store_id, group_code) do update set group_name = excluded.group_name, capacity = excluded.capacity, duration_minutes = excluded.duration_minutes, status = excluded.status, sort = excluded.sort, update_by = 1, update_time = now(), del_flag = '0', remark = excluded.remark;")
  lines.push('')

  lines.push('with source(id, tenant_id, store_id, service_group_id, external_sku_id, biz_date, start_time, end_time, capacity, paid_count, conflict_count, status, version, create_dept, create_by, create_time, update_by, update_time, del_flag, remark) as (')
  lines.push('values')
  const inventoryRows = snapshot.slots.map((slot, index) => {
    const id = BigInt('900000000001000000') + BigInt(index + 1)
    const remark = `Imported from Jianyue schedule API ${slot.jianyueStoreId}/${slot.jianyueGroupId}; cyc=${slot.jianyueCycId}; part=${slot.jianyueCycPartId}`
    return `(${id}, ${sqlQuote(tenantId)}, ${slot.storeId}, ${slot.serviceGroupId}, '', ${sqlQuote(slot.bizDate)}, ${sqlQuote(slot.startTime)}, ${sqlQuote(slot.endTime)}, ${slot.capacity}, ${slot.paidCount}, 0, ${sqlQuote(slot.status)}, 0, 103, 1, now(), 1, now(), '0', ${sqlQuote(remark)})`
  })
  lines.push(inventoryRows.join(',\n'))
  lines.push('), updated as (')
  lines.push('  update yy_booking_slot_inventory target')
  lines.push('     set capacity = source.capacity,')
  lines.push('         paid_count = source.paid_count,')
  lines.push('         conflict_count = source.conflict_count,')
  lines.push('         status = source.status,')
  lines.push('         update_by = source.update_by,')
  lines.push('         update_time = now(),')
  lines.push("         del_flag = '0',")
  lines.push('         remark = source.remark')
  lines.push('    from source')
  lines.push('   where target.tenant_id = source.tenant_id')
  lines.push('     and target.store_id = source.store_id')
  lines.push('     and coalesce(target.service_group_id, 0) = coalesce(source.service_group_id, 0)')
  lines.push("     and coalesce(target.external_sku_id, '') = coalesce(source.external_sku_id, '')")
  lines.push('     and target.biz_date = source.biz_date')
  lines.push('     and target.start_time = source.start_time')
  lines.push('     and target.end_time = source.end_time')
  lines.push("     and target.del_flag = '0'")
  lines.push('  returning target.id')
  lines.push(')')
  lines.push('insert into yy_booking_slot_inventory')
  lines.push('(id, tenant_id, store_id, service_group_id, external_sku_id, biz_date, start_time, end_time, capacity, paid_count, conflict_count, status, version, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)')
  lines.push('select source.*')
  lines.push('  from source')
  lines.push(' where not exists (')
  lines.push('   select 1 from yy_booking_slot_inventory target')
  lines.push('    where target.tenant_id = source.tenant_id')
  lines.push('      and target.store_id = source.store_id')
  lines.push('      and coalesce(target.service_group_id, 0) = coalesce(source.service_group_id, 0)')
  lines.push("      and coalesce(target.external_sku_id, '') = coalesce(source.external_sku_id, '')")
  lines.push('      and target.biz_date = source.biz_date')
  lines.push('      and target.start_time = source.start_time')
  lines.push('      and target.end_time = source.end_time')
  lines.push("      and target.del_flag = '0'")
  lines.push(' );')
  lines.push('')

  const rules = buildScheduleRules(snapshot)
  lines.push('insert into yy_schedule_rule')
  lines.push('(id, tenant_id, store_id, service_group_id, weekday, start_time, end_time, capacity, enabled, create_dept, create_by, create_time, update_by, update_time, del_flag, remark)')
  lines.push('values')
  const ruleRows = rules.map((rule, index) => {
    const id = BigInt('900000000002000000') + BigInt(index + 1)
    return `(${id}, ${sqlQuote(tenantId)}, ${rule.storeId}, ${rule.serviceGroupId}, ${rule.weekday}, ${sqlQuote(rule.startTime)}, ${sqlQuote(rule.endTime)}, ${rule.capacity}, '1', 103, 1, now(), 1, now(), '0', ${sqlQuote(`Imported default weekly rule from Jianyue ${rule.sourceGroupId}`)})`
  })
  lines.push(ruleRows.join(',\n'))
  lines.push('on conflict (id) do update set capacity = excluded.capacity, enabled = excluded.enabled, update_by = 1, update_time = now(), del_flag = \'0\', remark = excluded.remark;')
  lines.push('')
  lines.push('commit;')
  lines.push('')
  return lines.join('\n')
}

const buildScheduleRules = (snapshot) => {
  const counts = new Map()
  for (const slot of snapshot.slots) {
    if (slot.status !== 'ACTIVE') continue
    const key = [
      slot.storeId,
      slot.serviceGroupId,
      slot.weekday,
      slot.startTime,
      slot.endTime,
      slot.capacity,
      slot.jianyueGroupId,
    ].join('|')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, observedDays]) => {
      const [storeId, serviceGroupId, weekday, startTime, endTime, capacity, sourceGroupId] = key.split('|')
      return {
        storeId,
        serviceGroupId,
        weekday: Number(weekday),
        startTime,
        endTime,
        capacity: Number(capacity),
        sourceGroupId,
        observedDays,
      }
    })
    .sort((a, b) =>
      String(a.storeId).localeCompare(String(b.storeId))
      || a.weekday - b.weekday
      || a.startTime.localeCompare(b.startTime)
      || a.endTime.localeCompare(b.endTime)
    )
}

const buildSummary = (snapshot, normalizedPath, sqlPath) => {
  const lines = []
  lines.push(`# Jianyue Booking Slot Inventory Summary - ${ymdStamp}`)
  lines.push('')
  lines.push(`- Generated at: ${snapshot.generatedAt}`)
  lines.push(`- Schedule window: ${snapshot.scheduleStartDate} + ${snapshot.scheduleDays} available days`)
  lines.push(`- Normalized JSON: \`${normalizedPath}\``)
  lines.push(`- SQL seed: \`${sqlPath}\``)
  lines.push(`- Source API base: \`${baseUrl}\``)
  lines.push(`- Brand code: \`${brandCode}\``)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Service groups: ${snapshot.summary.groupCount}`)
  lines.push(`- Slots: ${snapshot.summary.slotCount}`)
  lines.push(`- Date orders from schedule API: ${snapshot.summary.dateOrderCount}`)
  lines.push('')
  lines.push('| Store | Date Range | Slots | Capacity | Used |')
  lines.push('| --- | --- | ---: | ---: | ---: |')
  for (const [code, store] of Object.entries(snapshot.summary.byStore)) {
    lines.push(`| ${code} / ${store.storeName} | ${store.firstDate} - ${store.lastDate} | ${store.slotCount} | ${store.totalCapacity} | ${store.totalPaid} |`)
  }
  lines.push('')
  lines.push('## Import Rules')
  lines.push('')
  lines.push('- Only default service groups are imported; temporary snapshot service groups are excluded.')
  lines.push('- `yy_booking_slot_inventory` is the local operational inventory ledger.')
  lines.push('- The SQL is idempotent: matching slots are updated, missing slots are inserted.')
  lines.push('- Secrets and auth tokens are not written to JSON, SQL, or this summary.')
  lines.push('')
  return lines.join('\n')
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isCli) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
