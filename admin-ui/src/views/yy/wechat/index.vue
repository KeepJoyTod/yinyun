<template>
  <div class="p-2 yy-wechat-page">
    <section class="yy-hero">
      <div class="yy-hero-copy">
        <div class="yy-hero-eyebrow">影约云微信生态</div>
        <h2>{{ workbench.title }}</h2>
        <p>{{ workbench.strategy }}</p>
        <div class="yy-hero-tags">
          <el-tag type="success" effect="dark">公众号通知</el-tag>
          <el-tag type="warning" effect="plain">小程序预约</el-tag>
          <el-tag type="primary" effect="plain">微信支付</el-tag>
          <el-tag type="info" effect="plain">企业微信客户联系</el-tag>
        </div>
      </div>
      <div class="yy-hero-actions">
        <el-button icon="Refresh" :loading="loading" @click="loadWorkbench">刷新</el-button>
        <el-button type="primary" icon="Promotion" :loading="noticeSubmitting" @click="sendNoticeTest">发送通知测试</el-button>
      </div>
    </section>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col v-for="item in capabilityCards" :key="item.code" :xs="12" :sm="12" :lg="6">
        <el-card class="yy-metric-card" shadow="never">
          <div class="text-xs text-gray-500">{{ item.title }}</div>
          <div class="mt-1 text-lg font-semibold">{{ item.status }}</div>
          <div class="mt-1 text-xs text-gray-400">{{ item.scenario }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="24" :lg="14">
        <el-card class="yy-panel" shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">接入能力</div>
                <div class="yy-panel-subtitle">先把接口壳和状态位挂起来，再逐步接真实 SDK。</div>
              </div>
              <el-tag type="info">P1/P2 规划</el-tag>
            </div>
          </template>
          <el-table :data="workbench.capabilities" border stripe empty-text="暂无接入能力">
            <el-table-column label="编码" prop="code" width="150" />
            <el-table-column label="能力" prop="title" min-width="140" />
            <el-table-column label="场景" prop="scenario" min-width="220" show-overflow-tooltip />
            <el-table-column label="优先级" prop="priority" width="90">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.priority)">{{ scope.row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" width="110">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="yy-panel" shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">字段映射</div>
                <div class="yy-panel-subtitle">订单号、手机号、openId/unionId 后续都能落到独立表。</div>
              </div>
            </div>
          </template>
          <el-table :data="workbench.fieldMappings" border stripe empty-text="暂无字段映射">
            <el-table-column label="来源" prop="source" min-width="130" />
            <el-table-column label="本地字段" prop="localField" min-width="180" show-overflow-tooltip />
            <el-table-column label="用途" prop="usage" min-width="180" show-overflow-tooltip />
            <el-table-column label="必需" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.required ? 'success' : 'info'">{{ scope.row.required ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <el-card class="yy-panel" shadow="never">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">通知测试</div>
                <div class="yy-panel-subtitle">先验证订单号、手机号和模板编码传参链路。</div>
              </div>
            </div>
          </template>
          <el-form ref="noticeFormRef" :model="noticeForm" label-width="96px">
            <el-form-item label="客户手机号">
              <el-input v-model="noticeForm.customerPhone" placeholder="13800000000" />
            </el-form-item>
            <el-form-item label="订单编号">
              <el-input v-model="noticeForm.orderNo" placeholder="YY202606010001" />
            </el-form-item>
            <el-form-item label="模板编码">
              <el-input v-model="noticeForm.templateCode" placeholder="booking_reminder" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="noticeForm.remark" type="textarea" :rows="3" placeholder="通知备注、客服手机号、场景说明" />
            </el-form-item>
          </el-form>
          <div class="flex justify-end">
            <el-button type="primary" icon="Promotion" :loading="noticeSubmitting" @click="sendNoticeTest">发送测试</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="yy-panel" shadow="never">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">落点信息</div>
                <div class="yy-panel-subtitle">页面、接口和字段映射都先给出明确落点。</div>
              </div>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="H5 预约地址">{{ workbench.h5BookingUrl }}</el-descriptions-item>
            <el-descriptions-item label="小程序路径">{{ workbench.miniProgramPath }}</el-descriptions-item>
            <el-descriptions-item label="客服电话字段">{{ workbench.servicePhoneField }}</el-descriptions-item>
            <el-descriptions-item label="接口规划"> /yy/wechat/workbench、/yy/wechat/notice/test </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <section class="yy-channel-section">
      <YyChannelWorkbench
        channel-title="微信生态渠道"
        channel-type="WECHAT"
        subtitle="统一管理公众号通知、小程序预约、微信支付回调和企业微信客户联系所需的插件状态、授权账号、订单映射与同步日志。"
        default-open-tip="微信生态待配置：请准备公众号/小程序 AppID、AppSecret、微信支付商户号、支付回调地址和企业微信客户联系资料。"
        :integration-notes="wechatIntegrationNotes"
      />
    </section>
  </div>
</template>

<script setup name="YyWechat" lang="ts">
import { getYyWechatWorkbench, sendYyWechatTestNotice } from '@/api/yy/wechat';
import type { YyWechatNoticeTestForm, YyWechatWorkbenchVO } from '@/api/yy/wechat/types';
import YyChannelWorkbench from '@/views/yy/components/YyChannelWorkbench.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const noticeSubmitting = ref(false);
const noticeFormRef = ref<ElFormInstance>();
const workbench = ref<YyWechatWorkbenchVO>({
  title: '微信生态接入工作台',
  strategy: '第一版优先公众号通知和 H5/小程序预约，微信支付与企业微信客户联系保留接口壳。',
  h5BookingUrl: '/h5/booking',
  miniProgramPath: 'pages/booking/index',
  servicePhoneField: 'yy_order.customer_phone / yy_order.remark',
  capabilities: [],
  fieldMappings: []
});
const noticeForm = reactive<YyWechatNoticeTestForm>({
  customerPhone: '',
  orderNo: '',
  templateCode: 'booking_reminder',
  remark: ''
});
const wechatIntegrationNotes = [
  '公众号通知：模板消息或服务通知模板写入通知中心',
  '小程序预约：AppID、AppSecret 和回调地址写入多端预约配置',
  '微信支付：商户号、证书、APIv3 Key 后续只放服务端安全配置',
  '企业微信客户联系：先记录客户手机号与客服手机号，后续同步外部联系人',
  '微信回调统一进入 POST /yy/channel/WECHAT/webhook 并记录同步日志'
];

const getStatusType = (status: string) => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    READY: 'success',
    RESERVED: 'warning',
    PLANNED: 'info',
    DISABLED: 'info'
  };
  return map[status] || 'info';
};

const getPriorityType = (priority: string) => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    P1: 'warning',
    P2: 'info'
  };
  return map[priority] || 'info';
};

const capabilityCards = computed(() => workbench.value.capabilities.slice(0, 4));

const loadWorkbench = async () => {
  loading.value = true;
  try {
    const res = (await getYyWechatWorkbench()) as any;
    workbench.value = res.data ?? workbench.value;
  } finally {
    loading.value = false;
  }
};

const sendNoticeTest = () => {
  noticeFormRef.value?.validate(async () => {
    noticeSubmitting.value = true;
    try {
      const res = (await sendYyWechatTestNotice({ ...noticeForm })) as any;
      proxy?.$modal.msgSuccess(res.data ?? res.msg ?? '微信通知接口已预留，测试提交成功');
    } finally {
      noticeSubmitting.value = false;
    }
  });
};

onMounted(() => {
  loadWorkbench();
});
</script>

<style lang="scss" scoped>
.yy-wechat-page {
  .yy-hero {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid #dbe4f0;
    background: linear-gradient(135deg, #0f172a 0%, #2563eb 52%, #0f766e 100%);
    color: #fff;
  }

  .yy-hero-copy {
    h2 {
      margin: 4px 0 6px;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.6;
    }
  }

  .yy-hero-eyebrow {
    color: #93c5fd;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  .yy-hero-tags,
  .yy-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .yy-metric-card,
  .yy-panel {
    border-radius: 8px;
    border-color: #e5e7eb;
  }

  .yy-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .yy-panel-title {
    font-weight: 700;
    font-size: 16px;
    color: #111827;
  }

  .yy-panel-subtitle {
    margin-top: 4px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
  }

  .yy-channel-section {
    margin-top: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
}

@media (max-width: 768px) {
  .yy-wechat-page {
    .yy-hero {
      flex-direction: column;
    }

    .yy-panel-head {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
