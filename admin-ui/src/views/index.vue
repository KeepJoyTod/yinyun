<template>
  <div class="app-container home">
    <section class="workbench-head">
      <div>
        <div class="overline">门店工作台</div>
        <h1>先看抖音来客订单同步，再处理库存和取片异常</h1>
        <p>这里汇总自动同步状态、最近同步订单和需要人工介入的风险项，员工不用在多个菜单里来回找。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" icon="Tickets" @click="goTarget('/yy/order')">查看订单</el-button>
        <el-button :loading="syncLoading" icon="Refresh" @click="handleSyncRecentOrders">同步近24小时</el-button>
        <el-button type="warning" icon="Connection" @click="goTarget('/yy/channel-life')">抖音联调</el-button>
      </div>
    </section>

    <el-row :gutter="14" class="metric-row">
      <el-col v-for="item in metrics" :key="item.label" :xs="12" :sm="8" :lg="4">
        <button type="button" class="metric-tile" :class="`metric-${item.tone}`" @click="goTarget(item.path)">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.hint }}</em>
        </button>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-4">
      <el-col :xs="24" :xl="9">
        <el-card class="ops-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <span class="panel-title">抖音来客自动同步</span>
                <p>生产每 5 分钟自动补拉订单；失败时优先看 logid。</p>
              </div>
              <el-tag :type="autoSyncType" effect="light">{{ autoSyncLabel }}</el-tag>
            </div>
          </template>
          <div v-loading="statusLoading" class="sync-card">
            <div class="sync-main">
              <span>最近同步</span>
              <strong>{{ autoSyncTime }}</strong>
            </div>
            <p>{{ autoSyncSummary }}</p>
            <div class="log-row">
              <span>logid</span>
              <code>{{ autoSyncLogId }}</code>
            </div>
            <div class="card-actions">
              <el-button link type="primary" icon="Refresh" :loading="syncLoading" @click="handleSyncRecentOrders">手动补同步</el-button>
              <el-button link type="warning" icon="ArrowRight" @click="goTarget('/yy/channel-life')">查看联调页</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="15">
        <el-card class="ops-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <span class="panel-title">最近同步订单</span>
                <p>来自本地 `yy_order`，用于确认抖音真实订单是否已经落库。</p>
              </div>
              <el-button link type="primary" icon="ArrowRight" @click="goTarget({ path: '/yy/order', query: { source: 'DOUYIN_LIFE' } })"
                >进入订单</el-button
              >
            </div>
          </template>
          <el-table v-loading="ordersLoading" :data="recentOrders" border stripe height="360" empty-text="暂无抖音来客同步订单">
            <el-table-column label="订单" min-width="190" fixed="left">
              <template #default="{ row }">
                <div class="order-main">
                  <strong>{{ row.orderNo || row.externalOrderId || '-' }}</strong>
                  <span>{{ row.externalOrderId || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="客户" min-width="132">
              <template #default="{ row }">
                <div class="order-main">
                  <strong>{{ row.customerName || '抖音客户' }}</strong>
                  <span>{{ maskPhone(row.customerPhone) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="支付" width="98">
              <template #default="{ row }">
                <el-tag :type="payStatusType(row.payStatus)" effect="light">{{ payStatusLabel(row.payStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="同步" width="98">
              <template #default="{ row }">
                <el-tag :type="getOptionType(syncStatusOptions, row.syncStatus)" effect="plain">
                  {{ getOptionLabel(syncStatusOptions, row.syncStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="108">
              <template #default="{ row }">
                <el-tag :type="getOptionType(inventoryStatusOptions, row.inventoryStatus)" effect="plain">
                  {{ getOptionLabel(inventoryStatusOptions, row.inventoryStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="到店/支付时间" min-width="170">
              <template #default="{ row }">{{ row.arrivalTime || row.paidTime || row.orderTime || '-' }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-4">
      <el-col :xs="24" :lg="15">
        <el-card class="ops-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <span class="panel-title">异常处理入口</span>
                <p>这些是最影响交付的事项，优先处理库存冲突和客片打不开。</p>
              </div>
            </div>
          </template>
          <div class="queue-list">
            <div v-for="item in workQueue" :key="item.title" class="queue-item">
              <div class="queue-main">
                <el-tag :type="item.type" effect="light">{{ item.status }}</el-tag>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.desc }}</span>
                </div>
              </div>
              <el-button link type="primary" @click="goTarget(item.path)">处理</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="9">
        <el-card class="ops-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <span class="panel-title">常用入口</span>
                <p>围绕订单、取片和渠道排障的高频入口。</p>
              </div>
            </div>
          </template>
          <div class="quick-grid">
            <button v-for="item in quickActions" :key="item.title" type="button" @click="goTarget(item.path)">
              <span>{{ item.code }}</span>
              <strong>{{ item.title }}</strong>
              <em>{{ item.desc }}</em>
            </button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index" lang="ts">
import { getYyChannelAutoSyncStatus, syncYyChannelOrders } from '@/api/yy/channel';
import type { YyChannelAutoSyncStatusVO, YyChannelSyncResultVO } from '@/api/yy/channel/types';
import { listYyOrder } from '@/api/yy/order';
import type { YyOrderQuery, YyOrderVO } from '@/api/yy/order/types';
import { getOptionLabel, getOptionType, inventoryStatusOptions, syncStatusOptions } from '@/views/yy/components/options';
import { autoSyncTagType, buildDouyinRecentSyncQuery, buildSyncResultMessage, isSyncSuccess } from '@/views/yy/utils/douyinLife';

const router = useRouter();

type DashboardTagType = 'success' | 'warning' | 'info' | 'danger' | 'primary';
type GoTarget = string | { path: string; query?: Record<string, string> };

type MetricItem = {
  label: string;
  value: string | number;
  hint: string;
  tone: 'blue' | 'amber' | 'teal' | 'violet' | 'red' | 'green';
  path: GoTarget;
};

type QueueItem = {
  status: string;
  type: DashboardTagType;
  title: string;
  desc: string;
  path: GoTarget;
};

const statusLoading = ref(false);
const ordersLoading = ref(false);
const syncLoading = ref(false);
const autoSyncStatus = ref<YyChannelAutoSyncStatusVO>();
const recentOrders = ref<YyOrderVO[]>([]);
const douyinOrderTotal = ref(0);
const inventoryConflictTotal = ref(0);
const photoIssueTotal = ref(0);

const extractRows = <T,>(res: any): T[] => res?.rows ?? res?.data ?? [];
const extractTotal = (res: any) => Number(res?.total ?? extractRows(res).length ?? 0);

const metrics = computed<MetricItem[]>(() => [
  {
    label: '抖音来客订单',
    value: douyinOrderTotal.value,
    hint: '本地已同步总数',
    tone: 'amber',
    path: { path: '/yy/order', query: { source: 'DOUYIN_LIFE' } }
  },
  {
    label: '已支付',
    value: recentOrders.value.filter((order) => order.payStatus === 'PAID').length,
    hint: '近 6 笔中统计',
    tone: 'green',
    path: { path: '/yy/order', query: { source: 'DOUYIN_LIFE', payStatus: 'PAID' } }
  },
  {
    label: '待处理',
    value: recentOrders.value.filter((order) => ['PENDING', 'FAILED'].includes(String(order.syncStatus || ''))).length,
    hint: '同步失败或待确认',
    tone: 'blue',
    path: { path: '/yy/order', query: { source: 'DOUYIN_LIFE' } }
  },
  {
    label: '库存冲突',
    value: inventoryConflictTotal.value,
    hint: '需要人工改期',
    tone: 'red',
    path: { path: '/yy/order', query: { inventoryStatus: 'CONFLICT' } }
  },
  {
    label: '取片异常',
    value: photoIssueTotal.value,
    hint: '缺相册/照片/OSS Key',
    tone: 'violet',
    path: { path: '/yy/order', query: { photoDeliveryIssueOnly: '1' } }
  },
  {
    label: '自动同步',
    value: autoSyncLabel.value,
    hint: autoSyncTime.value,
    tone: autoSyncType.value === 'success' ? 'teal' : 'amber',
    path: '/yy/channel-life'
  }
]);

const autoSyncType = computed<DashboardTagType>(() => autoSyncTagType(autoSyncStatus.value?.syncStatus, autoSyncStatus.value?.success));

const autoSyncLabel = computed(() => {
  const status = autoSyncStatus.value;
  if (!status) return '读取中';
  if (status.success && status.syncStatus === 'SYNCED') return '正常';
  if (status.syncStatus === 'WAITING') return '等待';
  if (status.syncStatus === 'SKIPPED') return '跳过';
  return '异常';
});

const autoSyncTime = computed(() => autoSyncStatus.value?.lastSyncTime || '等待首次同步');
const autoSyncSummary = computed(() => autoSyncStatus.value?.summary || autoSyncStatus.value?.message || '暂无同步摘要');
const autoSyncLogId = computed(() => autoSyncStatus.value?.lastLogId || '-');

const workQueue = computed<QueueItem[]>(() => [
  {
    status: inventoryConflictTotal.value > 0 ? String(inventoryConflictTotal.value) : '正常',
    type: inventoryConflictTotal.value > 0 ? 'danger' : 'success',
    title: '库存冲突订单',
    desc:
      inventoryConflictTotal.value > 0
        ? '客户已支付但本地时段库存冲突，需要店员人工改期或确认服务容量。'
        : '当前没有检测到库存冲突订单。',
    path: { path: '/yy/order', query: { inventoryStatus: 'CONFLICT' } }
  },
  {
    status: photoIssueTotal.value > 0 ? String(photoIssueTotal.value) : '正常',
    type: photoIssueTotal.value > 0 ? 'warning' : 'success',
    title: '客片交付异常',
    desc:
      photoIssueTotal.value > 0
        ? '存在缺手机号、缺相册、缺可见照片或缺 OSS Key 的订单，客户可能无法取片。'
        : '当前没有检测到取片交付异常。',
    path: { path: '/yy/order', query: { photoDeliveryIssueOnly: '1' } }
  },
  {
    status: autoSyncLabel.value,
    type: autoSyncType.value,
    title: '抖音自动同步状态',
    desc: autoSyncSummary.value,
    path: '/yy/channel-life'
  },
  {
    status: '导出',
    type: 'primary',
    title: '抖音来客订单导出',
    desc: '导出前可先手动补同步近 24 小时，再进入订单页按渠道筛选导出。',
    path: { path: '/yy/order', query: { source: 'DOUYIN_LIFE', intent: 'export' } }
  }
]);

const quickActions = [
  { code: '订单', title: '预约订单', desc: '查状态 / 导出', path: '/yy/order' },
  { code: '抖音', title: '抖音联调', desc: '同步 / logid / SPI', path: '/yy/channel-life' },
  { code: '客片', title: '客片选片', desc: '相册 / 上传 / OSS', path: '/yy/photo' },
  { code: '库存', title: '预约库存', desc: '时段 / 冲突', path: '/yy/booking-inventory' },
  { code: '门店', title: '门店配置', desc: '容量 / 营业状态', path: '/yy/store' },
  { code: '报表', title: '经营报表', desc: '收入 / 渠道', path: '/yy/report' }
];

const maskPhone = (value?: string | number) => {
  const phone = String(value || '');
  if (!phone) return '-';
  if (phone.length < 7) return `${phone.slice(0, 2)}****`;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

const payStatusLabel = (status?: string) => {
  if (status === 'PAID') return '已支付';
  if (status === 'REFUNDED') return '已退款';
  if (status === 'CANCELLED') return '已取消';
  if (status === 'UNPAID') return '未支付';
  return status || '-';
};

const payStatusType = (status?: string): DashboardTagType => {
  if (status === 'PAID') return 'success';
  if (status === 'REFUNDED' || status === 'CANCELLED') return 'warning';
  if (status === 'UNPAID') return 'info';
  return 'info';
};

const loadAutoSyncStatus = async () => {
  statusLoading.value = true;
  try {
    const res = await getYyChannelAutoSyncStatus('DOUYIN_LIFE');
    autoSyncStatus.value = res.data;
  } catch (error: any) {
    autoSyncStatus.value = {
      channelType: 'DOUYIN_LIFE',
      apiName: 'life_order_auto_sync',
      syncStatus: 'FAILED',
      success: false,
      message: error?.message || '无法读取自动同步状态'
    };
  } finally {
    statusLoading.value = false;
  }
};

const loadOrderSummary = async () => {
  ordersLoading.value = true;
  try {
    const [douyinRes, inventoryRes, photoIssueRes] = await Promise.all([
      listYyOrder({ pageNum: 1, pageSize: 6, source: 'DOUYIN_LIFE' } as YyOrderQuery),
      listYyOrder({ pageNum: 1, pageSize: 1, inventoryStatus: 'CONFLICT' } as YyOrderQuery),
      listYyOrder({ pageNum: 1, pageSize: 1, photoDeliveryIssueOnly: '1' } as YyOrderQuery)
    ]);
    recentOrders.value = extractRows<YyOrderVO>(douyinRes);
    douyinOrderTotal.value = extractTotal(douyinRes);
    inventoryConflictTotal.value = extractTotal(inventoryRes);
    photoIssueTotal.value = extractTotal(photoIssueRes);
  } finally {
    ordersLoading.value = false;
  }
};

const reloadWorkbench = async () => {
  await Promise.all([loadAutoSyncStatus(), loadOrderSummary()]);
};

const handleSyncRecentOrders = async () => {
  syncLoading.value = true;
  try {
    const res = await syncYyChannelOrders('DOUYIN_LIFE', buildDouyinRecentSyncQuery(1));
    const data: YyChannelSyncResultVO = res.data;
    const message = buildSyncResultMessage(data);
    if (isSyncSuccess(data)) {
      ElMessage.success(message);
    } else {
      ElMessage.warning(message);
    }
    await reloadWorkbench();
  } finally {
    syncLoading.value = false;
  }
};

const goTarget = (target: GoTarget) => {
  if (typeof target !== 'string') {
    router.push(target);
    return;
  }
  if (/^https?:\/\//i.test(target)) {
    window.open(target, '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(target);
};

onMounted(() => {
  reloadWorkbench();
});
</script>

<style lang="scss" scoped>
.home {
  color: #172033;
}

.workbench-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  border: 1px solid #dde5f0;
  border-radius: 8px;
  background: #ffffff;

  h1 {
    margin: 6px 0;
    font-size: 24px;
    font-weight: 750;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: #64748b;
    line-height: 1.6;
  }
}

.overline {
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.metric-row {
  margin-top: 14px;
}

.metric-tile {
  width: 100%;
  min-height: 116px;
  display: grid;
  align-content: space-between;
  padding: 16px;
  border: 1px solid #e3e8f0;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #0f766e;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }

  span {
    color: #64748b;
    font-size: 13px;
    font-weight: 650;
  }

  strong {
    margin-top: 6px;
    color: #0f172a;
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
  }

  em {
    margin-top: 12px;
    color: #6b7280;
    font-size: 12px;
    font-style: normal;
  }
}

.metric-blue {
  border-top: 3px solid #2563eb;
}

.metric-amber {
  border-top: 3px solid #d97706;
}

.metric-teal {
  border-top: 3px solid #0f766e;
}

.metric-violet {
  border-top: 3px solid #7c3aed;
}

.metric-red {
  border-top: 3px solid #dc2626;
}

.metric-green {
  border-top: 3px solid #16a34a;
}

.ops-panel {
  height: 100%;
  border-radius: 8px;
  border-color: #e3e8f0;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 13px;
  }
}

.panel-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 750;
}

.sync-card {
  display: grid;
  gap: 14px;
  min-height: 272px;
  align-content: start;

  p {
    margin: 0;
    color: #475569;
    line-height: 1.6;
  }
}

.sync-main {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  background: #fbfdff;

  span {
    color: #64748b;
    font-size: 13px;
  }

  strong {
    color: #0f172a;
    font-size: 20px;
    font-weight: 800;
  }
}

.log-row {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  background: #fff;

  span {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  code {
    color: #334155;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    word-break: break-all;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.order-main {
  min-width: 0;

  strong,
  span {
    display: block;
  }

  strong {
    overflow: hidden;
    color: #172033;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    margin-top: 4px;
    overflow: hidden;
    color: #64748b;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.queue-list {
  display: grid;
  gap: 10px;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 62px;
  padding: 12px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  background: #fbfdff;
}

.queue-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  strong,
  span {
    display: block;
  }

  strong {
    color: #1f2937;
  }

  span {
    margin-top: 4px;
    color: #64748b;
    font-size: 13px;
  }
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  button {
    min-height: 92px;
    padding: 13px;
    border: 1px solid #e3e8f0;
    border-radius: 8px;
    background: #fff;
    color: #172033;
    cursor: pointer;
    text-align: left;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      border-color: #0f766e;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }

    span,
    strong,
    em {
      display: block;
    }

    span {
      color: #0f766e;
      font-size: 12px;
      font-weight: 800;
    }

    strong {
      margin-top: 7px;
      font-size: 15px;
    }

    em {
      margin-top: 5px;
      color: #64748b;
      font-size: 12px;
      font-style: normal;
    }
  }
}

@media (max-width: 768px) {
  .workbench-head {
    align-items: flex-start;
    flex-direction: column;

    h1 {
      font-size: 21px;
    }
  }

  .head-actions,
  .head-actions :deep(.el-button) {
    width: 100%;
  }

  .queue-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    justify-content: flex-start;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
