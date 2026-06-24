import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildInventoryReconciliationSql,
  buildQueryOrdersRequest,
  buildSql,
  mapJianyueSource,
  mapJianyueStatus,
  normalizeJianyueOrder,
  resolveOrderSqlPath,
  shanghaiDateStamp,
} from './export-jianyue-orders.mjs'

test('shanghaiDateStamp formats in Asia/Shanghai', () => {
  assert.equal(shanghaiDateStamp(new Date('2026-06-16T16:30:00.000Z')), '20260617')
})

test('resolveOrderSqlPath keeps PII order SQL outside the repo by default', () => {
  assert.equal(
    resolveOrderSqlPath({
      outDir: 'C:\\Users\\Administrator\\Desktop\\yiyue',
      repoRoot: 'D:\\OtherProject\\CameraApp\\yingyue-cloud-repo',
      ymdStamp: '20260617',
    }),
    'C:\\Users\\Administrator\\Desktop\\yiyue\\postgres_jianyue_orders_import_20260617.sql',
  )
})

test('resolveOrderSqlPath allows an explicit external SQL output directory', () => {
  assert.equal(
    resolveOrderSqlPath({
      outDir: 'C:\\Users\\Administrator\\Desktop\\yiyue',
      repoRoot: 'D:\\OtherProject\\CameraApp\\yingyue-cloud-repo',
      sqlOutDir: 'D:\\secure-runtime\\jianyue-sql',
      ymdStamp: '20260617',
    }),
    'D:\\secure-runtime\\jianyue-sql\\postgres_jianyue_orders_import_20260617.sql',
  )
})

test('normalizeJianyueOrder maps appointment order into yy_order row', () => {
  const row = normalizeJianyueOrder({
    order_id: 12150816,
    customer_name: '张三',
    mobile: '13800001111',
    store_id: 6213,
    appointment_time: '2026-06-16 18:30:00',
    create_time: '2026-06-16 18:49:19',
    order_status_des: '待服务',
    order_from_type_des: '抖音',
    product_names: '团购预约-定金20到店退(抖音,证件照)',
    total: 75,
    paid: 75,
    refund_amount: 0,
  })

  assert.equal(row.orderNo, 'JY-12150816')
  assert.equal(row.storeId, '900000000000000100')
  assert.equal(row.serviceGroupId, '900000000000010100')
  assert.equal(row.source, 'DOUYIN_LIFE')
  assert.equal(row.status, 'PENDING')
  assert.equal(row.payStatus, 'PAID')
  assert.equal(row.slotDate, '2026-06-16')
  assert.equal(row.slotStartTime, '18:30')
  assert.equal(row.slotEndTime, '19:00')
  assert.equal(row.totalAmountCent, 7500)
})

test('mapJianyueStatus preserves service lifecycle', () => {
  assert.deepEqual(mapJianyueStatus({ order_status_des: '服务中', paid: 20 }), { status: 'SERVING', payStatus: 'PAID' })
  assert.deepEqual(mapJianyueStatus({ order_status_des: '已完成', paid: 20 }), { status: 'COMPLETED', payStatus: 'PAID' })
  assert.deepEqual(mapJianyueStatus({ order_status_des: '已取消', paid: 0 }), { status: 'CANCELLED', payStatus: 'CLOSED' })
})

test('mapJianyueSource detects common channel labels', () => {
  assert.equal(mapJianyueSource({ order_from_type_des: '抖音' }), 'DOUYIN_LIFE')
  assert.equal(mapJianyueSource({ product_names: '美团/大众点评,儿童证件照' }), 'MEITUAN')
  assert.equal(mapJianyueSource({ product_names: '现场预约通道(店内支付)' }), 'LOCAL')
})

test('buildSql is idempotent by tenant and order number', () => {
  const row = normalizeJianyueOrder({
    order_id: 1,
    customer_name: '张三',
    mobile: '13800001111',
    store_id: 6213,
    appointment_time: '2026-06-16 18:30:00',
    create_time: '2026-06-16 18:49:19',
    order_status_des: '待服务',
    product_names: '现场预约通道',
    total: 75,
    paid: 75,
  })
  const sql = buildSql([row], { generatedAt: '2026-06-17T00:00:00.000Z' })
  assert.match(sql, /update yy_order target/)
  assert.match(sql, /target\.order_no = source\.order_no/)
  assert.match(sql, /where not exists/)
  assert.match(sql, /JY-1/)
})

test('buildSql reconciles yy_order slots back into booking inventory', () => {
  const row = normalizeJianyueOrder({
    order_id: 1,
    customer_name: '张三',
    mobile: '13800001111',
    store_id: 6213,
    appointment_time: '2026-06-16 18:30:00',
    create_time: '2026-06-16 18:49:19',
    order_status_des: '待服务',
    product_names: '现场预约通道',
    total: 75,
    paid: 75,
  })
  const sql = buildSql([row], { generatedAt: '2026-06-17T00:00:00.000Z' })

  assert.match(sql, /Reconcile imported Jianyue orders with yy_booking_slot_inventory/)
  assert.match(sql, /hashtextextended\(slot_key, 20260617\)/)
  assert.match(sql, /paid_count = least\(coalesce\(slot_counts\.order_count, 0\), greatest\(coalesce\(target\.capacity, 0\), 0\)\)/)
  assert.match(sql, /inventory_slot_id = ranked_orders\.inventory_slot_id/)
  assert.match(sql, /row_number\(\) over/)
})

test('buildInventoryReconciliationSql is scoped to the requested channel', () => {
  const sql = buildInventoryReconciliationSql({ channelType: 'JIANYUE' })

  assert.match(sql, /channel_type = 'JIANYUE'/)
  assert.match(sql, /coalesce\(status, ''\) not in \('CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED', 'STOCK_CONFLICT'\)/)
  assert.match(sql, /insert into yy_booking_slot_inventory/)
  assert.match(sql, /update yy_order target/)
})

test('buildQueryOrdersRequest keeps pagination in query and uses Jianyue order filters in body', () => {
  const request = buildQueryOrdersRequest({
    pageIndex: 2,
    pageSize: 100,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
  })

  assert.equal(request.path, '/api/order/query_orders')
  assert.deepEqual(request.query, {
    page_index: 2,
    page_size: 100,
      sort_by: '',
      sort_type: '',
    })
  assert.equal(request.body.order_type, null)
  assert.deepEqual(request.body.order_time_range, {
    start_date: '2026-06-01 00:00:00',
    end_date: '2026-06-30 23:59:59',
  })
  assert.deepEqual(request.body.appointment_time_range, {
    start_date: '2026-06-01 00:00:00',
    end_date: '2026-06-30 23:59:59',
  })
  assert.deepEqual(request.body.order_way, [1, 2])
  assert.deepEqual(request.body.order_from_types, [0, 1, 4, 5, 6, 7, 2, 3])
})
