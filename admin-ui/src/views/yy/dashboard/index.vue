<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col v-for="card in overviewCards" :key="card.label" :xs="12" :sm="8" :lg="4">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">{{ card.label }}</div>
          <div class="mt-1 text-2xl font-semibold leading-8">{{ card.value }}</div>
          <div class="mt-1 text-xs text-gray-400">{{ card.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>预约状态分布</span>
              <span class="text-xs text-gray-400">B-002</span>
            </div>
          </template>
          <div ref="statusChartRef" class="h-[320px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>近 7 日预约趋势</span>
              <span class="text-xs text-gray-400">下单量/到店量/完成量</span>
            </div>
          </template>
          <div ref="trendChartRef" class="h-[320px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>工位热度</span>
              <span class="text-xs text-gray-400">当前订单分布</span>
            </div>
          </template>
          <div ref="workstationChartRef" class="h-[320px]" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="24" :lg="14">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>近期订单</span>
              <span class="text-xs text-gray-400">按到店时间排序</span>
            </div>
          </template>
          <el-table v-loading="loading" border stripe :data="recentOrders" height="320">
            <el-table-column label="订单编号" prop="orderNo" min-width="150" fixed="left" />
            <el-table-column label="客户" min-width="140">
              <template #default="scope">
                <div>{{ scope.row.customerName || '-' }}</div>
                <div class="text-xs text-gray-400">{{ scope.row.customerPhone || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="105">
              <template #default="scope">
                <el-tag :type="getOptionType(orderStatusOptions, scope.row.status)">
                  {{ getOptionLabel(orderStatusOptions, scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="来源" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(orderSourceOptions, scope.row.source)">{{
                  getOptionLabel(orderSourceOptions, scope.row.source)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="到店时间" prop="arrivalTime" min-width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>优先开发清单</span>
              <span class="text-xs text-gray-400">按标红顺序</span>
            </div>
          </template>
          <el-table v-loading="featureLoading" border stripe :data="features" height="320">
            <el-table-column label="编号" prop="code" width="90" />
            <el-table-column label="功能" prop="feature" min-width="140" show-overflow-tooltip />
            <el-table-column label="优先级" prop="priority" width="90" />
            <el-table-column label="状态" prop="status" width="110" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="YyDashboard" lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { init as initChart, type EChartsType } from '@/utils/echarts';
import { getYyDashboardOverview } from '@/api/yy/dashboard';
import type { YyDashboardOverviewVO } from '@/api/yy/dashboard/types';
import { listPriorityFeatures } from '@/api/yy/meta';
import type { PriorityFeatureVO } from '@/api/yy/meta/types';
import { listYyOrder } from '@/api/yy/order';
import type { YyOrderVO } from '@/api/yy/order/types';
import { getOptionLabel, getOptionType, orderSourceOptions, orderStatusOptions } from '@/views/yy/components/options';

const loading = ref(false);
const featureLoading = ref(false);
const overview = ref<YyDashboardOverviewVO>({
  storeTotal: 0,
  businessStoreTotal: 0,
  orderTotal: 0,
  pendingOrderTotal: 0,
  arrivedOrderTotal: 0,
  completedOrderTotal: 0,
  albumTotal: 0,
  selectedAssetTotal: 0,
  channelPluginTotal: 0,
  unopenedChannelPluginTotal: 0
});
const features = ref<PriorityFeatureVO[]>([]);
const orders = ref<YyOrderVO[]>([]);
const statusChartRef = ref();
const trendChartRef = ref();
const workstationChartRef = ref();
let statusChart: EChartsType | undefined;
let trendChart: EChartsType | undefined;
let workstationChart: EChartsType | undefined;

const overviewCards = computed(() => [
  { label: '门店', value: overview.value.storeTotal, hint: `营业 ${overview.value.businessStoreTotal}` },
  { label: '预约订单', value: overview.value.orderTotal, hint: `待确认 ${overview.value.pendingOrderTotal}` },
  { label: '已到店', value: overview.value.arrivedOrderTotal, hint: '服务中/待服务' },
  { label: '已完成', value: overview.value.completedOrderTotal, hint: '完成订单' },
  { label: '客片相册', value: overview.value.albumTotal, hint: `已选 ${overview.value.selectedAssetTotal}` },
  { label: '渠道插件', value: overview.value.channelPluginTotal, hint: `未开通 ${overview.value.unopenedChannelPluginTotal}` }
]);

const recentOrders = computed(() => orders.value.slice(0, 8));

const buildStatusSeries = () => {
  const map = new Map<string, number>();
  orderStatusOptions.forEach((item) => map.set(item.value, 0));
  orders.value.forEach((order) => {
    map.set(order.status, (map.get(order.status) || 0) + 1);
  });
  return orderStatusOptions.map((item) => ({ name: item.label, value: map.get(item.value) || 0 }));
};

const buildTrendSeries = () => {
  const buckets = new Map<string, { order: number; arrive: number; complete: number }>();
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label = date.toISOString().slice(0, 10);
    last7Days.push(label);
    buckets.set(label, { order: 0, arrive: 0, complete: 0 });
  }
  orders.value.forEach((order) => {
    const orderKey = order.orderTime?.toString().slice(0, 10);
    const arriveKey = order.arrivalTime?.toString().slice(0, 10);
    if (orderKey && buckets.has(orderKey)) buckets.get(orderKey)!.order += 1;
    if (arriveKey && buckets.has(arriveKey)) buckets.get(arriveKey)!.arrive += 1;
    if (arriveKey && order.status === 'COMPLETED' && buckets.has(arriveKey)) buckets.get(arriveKey)!.complete += 1;
  });
  return {
    days: last7Days,
    order: last7Days.map((day) => buckets.get(day)?.order || 0),
    arrive: last7Days.map((day) => buckets.get(day)?.arrive || 0),
    complete: last7Days.map((day) => buckets.get(day)?.complete || 0)
  };
};

const buildWorkstationSeries = () => {
  const map = new Map<string, number>();
  orders.value
    .filter((order) => order.workstationNo)
    .forEach((order) => {
      const key = String(order.workstationNo);
      map.set(key, (map.get(key) || 0) + 1);
    });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
};

const renderCharts = async () => {
  await nextTick();
  statusChart?.dispose();
  trendChart?.dispose();
  workstationChart?.dispose();
  statusChart = initChart(statusChartRef.value);
  trendChart = initChart(trendChartRef.value);
  workstationChart = initChart(workstationChartRef.value);

  const statusSeries = buildStatusSeries();
  const trendSeries = buildTrendSeries();
  const workstationSeries = buildWorkstationSeries();

  statusChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 8, left: 'center' },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['50%', '58%'],
        data: statusSeries
      }
    ]
  });

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 8 },
    grid: { left: 32, right: 24, top: 52, bottom: 24, containLabel: true },
    xAxis: { type: 'category', data: trendSeries.days },
    yAxis: { type: 'value' },
    series: [
      { name: '下单量', type: 'line', smooth: true, data: trendSeries.order },
      { name: '到店量', type: 'line', smooth: true, data: trendSeries.arrive },
      { name: '完成量', type: 'line', smooth: true, data: trendSeries.complete }
    ]
  });

  workstationChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 28, right: 18, top: 24, bottom: 28, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: workstationSeries.map((item) => item[0]) },
    series: [{ name: '工位单量', type: 'bar', data: workstationSeries.map((item) => item[1]) }]
  });

  window.addEventListener('resize', resizeCharts);
};

const resizeCharts = () => {
  statusChart?.resize();
  trendChart?.resize();
  workstationChart?.resize();
};

const load = async () => {
  loading.value = true;
  featureLoading.value = true;
  try {
    const [overviewRes, featuresRes, orderRes] = await Promise.all([
      getYyDashboardOverview(),
      listPriorityFeatures(),
      listYyOrder({ pageNum: 1, pageSize: 200 } as any)
    ]);
    overview.value = overviewRes.data;
    features.value = featuresRes.data;
    const orderData = orderRes as any;
    orders.value = orderData.rows ?? orderData.data ?? [];
    await renderCharts();
  } catch {
    // 后端未启动时保持空图表，页面仍可打开。
  } finally {
    loading.value = false;
    featureLoading.value = false;
  }
};

onMounted(() => {
  load();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  statusChart?.dispose();
  trendChart?.dispose();
  workstationChart?.dispose();
});
</script>
