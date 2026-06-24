<template>
  <div>
    <YyChannelWorkbench
      channel-title="抖音产品"
      channel-type="DOUYIN"
      subtitle="B-026：按抖音服务市场平台应用类服务接入，优先判断已购、购买详情和订单事件流。"
      default-open-tip="抖音服务市场平台应用未开通，请先准备 client_key、service_id、测试白名单和 webhook 回调。"
      :integration-notes="integrationNotes"
    />

    <div class="p-2 pt-0">
      <el-card shadow="hover">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-semibold">抖音沙盒接口联调</div>
              <div class="mt-1 text-xs text-gray-500">先建沙盒应用，再填 client_key、service_id、open_id；密钥从授权账号或环境变量读取，不在这里回显。</div>
            </div>
            <el-tag type="danger" effect="dark">Service Market</el-tag>
          </div>
        </template>

        <el-form :model="sandboxQuery" :inline="true" label-width="120px">
          <el-form-item label="门店ID">
            <el-input v-model="sandboxQuery.storeId" placeholder="可空，默认取抖音账号" clearable class="!w-[160px]" />
          </el-form-item>
          <el-form-item label="测试 open_id">
            <el-input v-model="sandboxQuery.openId" placeholder="沙盒测试用户 open_id" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="service_id">
            <el-input v-model="sandboxQuery.serviceId" placeholder="服务市场 service_id" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="mode_id">
            <el-input v-model="sandboxQuery.serviceModeId" placeholder="service_mode_id" clearable class="!w-[220px]" />
          </el-form-item>
        </el-form>

        <div class="mb-3 flex flex-wrap gap-2">
          <el-button type="primary" icon="Key" :loading="tokenLoading" @click="runClientToken">生成 client_token</el-button>
          <el-button type="success" icon="Search" :loading="statusLoading" @click="runServiceStatus">查询已购状态</el-button>
          <el-button type="warning" icon="Tickets" :loading="purchaseLoading" @click="runPurchaseList">查询购买明细</el-button>
          <el-button icon="Connection" :loading="webhookLoading" @click="runWebhookDemo">模拟 webhook</el-button>
        </div>

        <el-alert
          class="mb-3"
          type="info"
          :closable="false"
          title="配置优先级：请求参数 open_id/service_id/mode_id -> 后端环境变量 DOUYIN_* -> 授权账号 yy_channel_account。client_secret 建议只放环境变量或后台授权账号，不放页面。"
        />

        <el-table :data="apiResults" border stripe empty-text="暂无联调结果">
          <el-table-column label="接口" prop="apiName" width="150" />
          <el-table-column label="结果" width="110">
            <template #default="scope">
              <el-tag :type="scope.row.success ? 'success' : 'warning'">{{ scope.row.success ? '成功' : '需处理' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提示" prop="message" min-width="260" show-overflow-tooltip />
          <el-table-column label="缺少配置" min-width="180">
            <template #default="scope">{{ scope.row.missingConfig?.join(', ') || '-' }}</template>
          </el-table-column>
          <el-table-column label="接口地址" prop="endpoint" min-width="300" show-overflow-tooltip />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="showResult(scope.row)">响应</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-drawer v-model="resultVisible" title="抖音接口响应" size="620px" append-to-body>
      <el-descriptions v-if="currentResult" :column="1" border>
        <el-descriptions-item label="接口">{{ currentResult.apiName }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ currentResult.success ? '成功' : '需处理' }}</el-descriptions-item>
        <el-descriptions-item label="请求摘要">{{ currentResult.requestSummary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提示">{{ currentResult.message || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-input class="mt-3" :model-value="currentResult?.rawResponse || ''" type="textarea" :rows="16" readonly />
    </el-drawer>
  </div>
</template>

<script setup name="YyChannelDouyin" lang="ts">
import {
  getYyChannelClientToken,
  getYyChannelPurchaseList,
  getYyChannelServiceStatus,
  postYyChannelWebhook
} from '@/api/yy/channel';
import type { YyChannelApiResultVO, YyChannelOrderQuery } from '@/api/yy/channel/types';
import YyChannelWorkbench from '@/views/yy/components/YyChannelWorkbench.vue';

const integrationNotes = [
  'client_key / client_secret 用于换 client_access_token',
  'service_id / service_mode_id 用于查询服务购买信息',
  '测试 open_id 通过授权 code 换取，沙盒需加入测试白名单',
  '未购买时可用 service_market_app_id / service_market_path 跳到购买页',
  'webhook 使用 service_market_order，事件覆盖支付、接单、确认实施、用户确认、取消',
  '回调地址预留 POST /yy/channel/DOUYIN/webhook，真实环境必须补签名校验',
  '只看是否已购走 /aweme/v2/creator/service_market/user/service/status',
  '详细购买信息走 /market/service/user/purchase/list/'
];

const sandboxQuery = reactive<YyChannelOrderQuery>({
  storeId: '',
  openId: '',
  serviceId: '',
  serviceModeId: ''
});
const apiResults = ref<YyChannelApiResultVO[]>([]);
const currentResult = ref<YyChannelApiResultVO>();
const resultVisible = ref(false);
const tokenLoading = ref(false);
const statusLoading = ref(false);
const purchaseLoading = ref(false);
const webhookLoading = ref(false);

const upsertResult = (result: YyChannelApiResultVO) => {
  const index = apiResults.value.findIndex((item) => item.apiName === result.apiName);
  if (index >= 0) {
    apiResults.value[index] = result;
  } else {
    apiResults.value.unshift(result);
  }
};

const normalizedQuery = () => ({
  ...sandboxQuery,
  storeId: sandboxQuery.storeId || undefined,
  openId: sandboxQuery.openId || undefined,
  serviceId: sandboxQuery.serviceId || undefined,
  serviceModeId: sandboxQuery.serviceModeId || undefined
});

const runClientToken = async () => {
  tokenLoading.value = true;
  try {
    const res = await getYyChannelClientToken('DOUYIN', normalizedQuery());
    upsertResult(res.data);
  } finally {
    tokenLoading.value = false;
  }
};

const runServiceStatus = async () => {
  statusLoading.value = true;
  try {
    const res = await getYyChannelServiceStatus('DOUYIN', normalizedQuery());
    upsertResult(res.data);
  } finally {
    statusLoading.value = false;
  }
};

const runPurchaseList = async () => {
  purchaseLoading.value = true;
  try {
    const res = await getYyChannelPurchaseList('DOUYIN', normalizedQuery());
    upsertResult(res.data);
  } finally {
    purchaseLoading.value = false;
  }
};

const runWebhookDemo = async () => {
  webhookLoading.value = true;
  try {
    const payload = JSON.stringify({
      event: 'service_market_order',
      event_status: '1',
      service_order_id: 'DY-SANDBOX-DEMO-ORDER',
      open_id: sandboxQuery.openId || 'sandbox_open_id'
    });
    const res = (await postYyChannelWebhook('DOUYIN', payload)) as any;
    upsertResult({
      channelType: 'DOUYIN',
      apiName: 'service_market_order_webhook',
      endpoint: '/yy/channel/DOUYIN/webhook',
      success: !!res.data?.processed,
      message: res.data?.message || 'webhook 已返回',
      rawResponse: JSON.stringify(res.data, null, 2),
      requestSummary: payload,
      missingConfig: []
    });
  } finally {
    webhookLoading.value = false;
  }
};

const showResult = (row: YyChannelApiResultVO) => {
  currentResult.value = row;
  resultVisible.value = true;
};
</script>
