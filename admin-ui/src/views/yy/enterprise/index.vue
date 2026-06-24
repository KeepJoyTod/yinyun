<template>
  <div class="p-2">
    <el-card shadow="never" class="mb-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-[18px] font-semibold leading-6">企业版结构</h2>
          <p class="mt-1 text-sm text-gray-500">7 个标红功能之后，第二批按预约配置、员工、客户、通知、多端、报表推进。</p>
        </div>
        <el-tag effect="dark" type="primary">Enterprise P1/P2</el-tag>
      </div>
      <el-alert
        class="mt-4"
        title="当前只补企业骨架和菜单落点，真实 CRUD 可直接用代码生成器基于 yy_ 表批量生成，再按页面继续细化。"
        type="info"
        :closable="false"
        show-icon
      />
    </el-card>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col v-for="card in summaryCards" :key="card.label" :xs="12" :sm="8" :lg="4">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">{{ card.label }}</div>
          <div class="mt-1 text-2xl font-semibold">{{ card.value }}</div>
          <div class="mt-1 text-xs text-gray-400">{{ card.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span>下一批模块清单</span>
          <el-button text type="primary" icon="Refresh" :loading="loading" @click="loadModules">刷新</el-button>
        </div>
      </template>
      <el-table v-loading="loading" :data="modules" border stripe>
        <el-table-column label="编号" prop="code" width="170" fixed="left" />
        <el-table-column label="阶段" prop="stage" min-width="150" show-overflow-tooltip />
        <el-table-column label="模块" prop="module" width="120" />
        <el-table-column label="优先级" prop="priority" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 'P1' ? 'warning' : 'info'">{{ scope.row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="110" />
        <el-table-column label="数据模型" prop="dataModel" min-width="240" show-overflow-tooltip />
        <el-table-column label="页面落点" prop="frontendPath" min-width="230" show-overflow-tooltip />
        <el-table-column label="下一步" prop="nextAction" min-width="280" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="YyEnterprise" lang="ts">
import { listEnterpriseModules } from '@/api/yy/meta';
import type { EnterpriseModuleVO } from '@/api/yy/meta/types';

const fallbackModules: EnterpriseModuleVO[] = [
  {
    code: 'P1-BOOKING-CONFIG',
    stage: '第二批运营底座',
    module: '预约配置',
    priority: 'P1',
    status: '结构已补',
    frontendPath: 'src/views/yy/booking-config/index.vue',
    dataModel: 'yy_service_group / yy_schedule_rule',
    scope: '服务组、预约时长、日容量、工作日时段、满员规则',
    dependencies: 'yy_store / yy_product / yy_order',
    nextAction: '先接订单下单校验，再补 H5/小程序可预约时段'
  },
  {
    code: 'P1-EMPLOYEE',
    stage: '第二批运营底座',
    module: '员工管理',
    priority: 'P1',
    status: '结构已补',
    frontendPath: 'src/views/yy/employee/index.vue',
    dataModel: 'yy_employee',
    scope: '员工台账、门店归属、系统用户绑定、岗位技能、启停状态',
    dependencies: 'sys_user / sys_role / yy_store / yy_order',
    nextAction: '先让订单可分配员工，再接员工业绩报表'
  },
  {
    code: 'P1-CUSTOMER',
    stage: '第二批运营底座',
    module: '客户管理',
    priority: 'P1',
    status: '结构已补',
    frontendPath: 'src/views/yy/customer/index.vue',
    dataModel: 'yy_customer',
    scope: '客户档案、手机号去重、预约历史、消费汇总、标签备注',
    dependencies: 'yy_order / yy_photo_album / yy_channel_order_mapping',
    nextAction: '先从订单沉淀客户，再做客户详情页'
  },
  {
    code: 'P1-NOTIFICATION',
    stage: '第二批运营底座',
    module: '通知中心',
    priority: 'P1',
    status: '结构已补',
    frontendPath: 'src/views/yy/notification/index.vue',
    dataModel: 'yy_notification_template / yy_notification_log',
    scope: '预约确认、到店提醒、选片提醒、渠道同步失败告警',
    dependencies: '微信生态 / 短信服务商 / SnailJob',
    nextAction: '先落发送日志和模板，再接真实微信/短信 SDK'
  },
  {
    code: 'P1-MOBILE',
    stage: '多端入口',
    module: 'H5/小程序/App',
    priority: 'P1',
    status: '结构已补',
    frontendPath: 'src/views/yy/mobile/index.vue',
    dataModel: 'yy_mobile_channel_config',
    scope: '多端预约入口、渠道 AppID、回调地址、SDK 接入状态',
    dependencies: '预约配置 / 微信生态 / 支付配置',
    nextAction: '先做 H5 和微信小程序配置，再评估 App'
  },
  {
    code: 'P2-REPORT',
    stage: '第三批经营分析',
    module: '经营报表',
    priority: 'P2',
    status: '结构已补',
    frontendPath: 'src/views/yy/report/index.vue',
    dataModel: 'yy_report_snapshot',
    scope: '门店日报、预约来源、选片收入、员工绩效、渠道统计',
    dependencies: 'yy_order / yy_photo_asset / yy_channel_sync_log',
    nextAction: '先做日报快照，再做趋势图和导出'
  }
];

const loading = ref(false);
const modules = ref<EnterpriseModuleVO[]>(fallbackModules);

const summaryCards = computed(() => [
  { label: 'P1 模块', value: modules.value.filter((item) => item.priority === 'P1').length, hint: '运营闭环优先' },
  { label: 'P2 模块', value: modules.value.filter((item) => item.priority === 'P2').length, hint: '报表增强' },
  { label: '数据表', value: 8, hint: '已进 SQL 初始化' },
  { label: '菜单入口', value: 7, hint: '后台可进入' },
  { label: '代码生成', value: 8, hint: 'gen_table 已配置' },
  { label: '多端', value: 3, hint: 'H5/小程序/App' }
]);

const loadModules = async () => {
  loading.value = true;
  try {
    const res = await listEnterpriseModules();
    modules.value = res.data?.length ? res.data : fallbackModules;
  } catch {
    modules.value = fallbackModules;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadModules();
});
</script>
