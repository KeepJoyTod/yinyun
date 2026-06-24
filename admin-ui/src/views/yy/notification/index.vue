<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">模板总数</div>
          <div class="mt-1 text-2xl font-semibold">{{ templateTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页启用模板</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">{{ enabledTemplateTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">发送日志</div>
          <div class="mt-1 text-2xl font-semibold">{{ logTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页失败日志</div>
          <div class="mt-1 text-2xl font-semibold text-red-600">{{ failedLogTotal }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">通知中心</div>
            <div class="mt-1 text-xs text-gray-500">预约确认、到店提醒、选片提醒和渠道异常通知，先管理模板与发送日志。</div>
          </div>
          <el-tag effect="dark" type="warning">P1 运营闭环</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="通知模板" name="template">
          <el-form ref="templateQueryRef" :model="templateQuery" :inline="true" class="mb-3">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model="templateQuery.templateCode" placeholder="请输入模板编码" clearable @keyup.enter="handleTemplateQuery" />
            </el-form-item>
            <el-form-item label="业务场景" prop="scene">
              <el-input v-model="templateQuery.scene" placeholder="例如 预约确认" clearable @keyup.enter="handleTemplateQuery" />
            </el-form-item>
            <el-form-item label="通知渠道" prop="channelType">
              <el-select v-model="templateQuery.channelType" placeholder="全部渠道" clearable class="!w-[150px]">
                <el-option v-for="item in notificationChannelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="启用" prop="enabled">
              <el-select v-model="templateQuery.enabled" placeholder="全部" clearable class="!w-[120px]">
                <el-option v-for="item in bookingEnabledOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleTemplateQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetTemplateQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb-3">
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:add']" type="primary" plain icon="Plus" @click="handleTemplateAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:edit']" type="success" plain :disabled="templateSingle" icon="Edit" @click="handleTemplateUpdate()">
                修改
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:remove']" type="danger" plain :disabled="templateMultiple" icon="Delete" @click="handleTemplateDelete()">
                删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:export']" type="warning" plain icon="Download" @click="handleTemplateExport">导出</el-button>
            </el-col>
          </el-row>

          <el-table v-loading="templateLoading" border stripe :data="templateList" @selection-change="handleTemplateSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="模板编码" prop="templateCode" min-width="180" fixed="left" show-overflow-tooltip />
            <el-table-column label="场景" prop="scene" min-width="130" show-overflow-tooltip />
            <el-table-column label="渠道" width="120">
              <template #default="scope">
                <el-tag :type="getOptionType(notificationChannelOptions, scope.row.channelType)">
                  {{ getOptionLabel(notificationChannelOptions, scope.row.channelType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="标题" prop="title" min-width="160" show-overflow-tooltip />
            <el-table-column label="内容" prop="content" min-width="260" show-overflow-tooltip />
            <el-table-column label="服务商模板ID" prop="providerTemplateId" min-width="160" show-overflow-tooltip />
            <el-table-column label="启用" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(bookingEnabledOptions, scope.row.enabled)">
                  {{ getOptionLabel(bookingEnabledOptions, scope.row.enabled) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" prop="updateTime" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:notification:edit']" link type="primary" icon="Edit" @click="handleTemplateUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:notification:remove']" link type="primary" icon="Delete" @click="handleTemplateDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="templateTotal > 0"
            v-model:total="templateTotal"
            v-model:page="templateQuery.pageNum"
            v-model:limit="templateQuery.pageSize"
            @pagination="getTemplateList"
          />
        </el-tab-pane>

        <el-tab-pane label="发送日志" name="log">
          <el-form ref="logQueryRef" :model="logQuery" :inline="true" class="mb-3">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="logQuery.storeId" placeholder="全部门店" clearable class="!w-[180px]">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="模板" prop="templateId">
              <el-select v-model="logQuery.templateId" placeholder="全部模板" clearable class="!w-[190px]">
                <el-option v-for="item in templateOptions" :key="item.id" :label="item.templateCode" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="接收人" prop="receiver">
              <el-input v-model="logQuery.receiver" placeholder="手机号/openId" clearable @keyup.enter="handleLogQuery" />
            </el-form-item>
            <el-form-item label="渠道" prop="channelType">
              <el-select v-model="logQuery.channelType" placeholder="全部渠道" clearable class="!w-[150px]">
                <el-option v-for="item in notificationChannelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="sendStatus">
              <el-select v-model="logQuery.sendStatus" placeholder="全部状态" clearable class="!w-[130px]">
                <el-option v-for="item in notificationSendStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="请求ID" prop="requestId">
              <el-input v-model="logQuery.requestId" placeholder="request_id" clearable @keyup.enter="handleLogQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleLogQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetLogQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb-3">
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:remove']" type="danger" plain :disabled="logMultiple" icon="Delete" @click="handleLogDelete()">
                删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:notification:export']" type="warning" plain icon="Download" @click="handleLogExport">导出</el-button>
            </el-col>
          </el-row>

          <el-table v-loading="logLoading" border stripe :data="logList" @selection-change="handleLogSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="请求ID" prop="requestId" min-width="180" fixed="left" show-overflow-tooltip />
            <el-table-column label="门店" min-width="180" show-overflow-tooltip>
              <template #default="scope">{{ getStoreName(scope.row.storeId) }}</template>
            </el-table-column>
            <el-table-column label="模板" min-width="180" show-overflow-tooltip>
              <template #default="scope">{{ getTemplateCode(scope.row.templateId) }}</template>
            </el-table-column>
            <el-table-column label="渠道" width="120">
              <template #default="scope">
                <el-tag :type="getOptionType(notificationChannelOptions, scope.row.channelType)">
                  {{ getOptionLabel(notificationChannelOptions, scope.row.channelType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="接收人" prop="receiver" min-width="150" show-overflow-tooltip />
            <el-table-column label="状态" width="110">
              <template #default="scope">
                <el-tag :type="getOptionType(notificationSendStatusOptions, scope.row.sendStatus)">
                  {{ getOptionLabel(notificationSendStatusOptions, scope.row.sendStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发送时间" prop="sentTime" min-width="160" show-overflow-tooltip />
            <el-table-column label="错误信息" prop="errorMessage" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" width="110" fixed="right">
              <template #default="scope">
                <el-tooltip content="查看详情" placement="top">
                  <el-button link type="primary" icon="View" @click="showLogDetail(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:notification:remove']" link type="primary" icon="Delete" @click="handleLogDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-if="logTotal > 0" v-model:total="logTotal" v-model:page="logQuery.pageNum" v-model:limit="logQuery.pageSize" @pagination="getLogList" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="templateDialog.visible" :title="templateDialog.title" width="760px" append-to-body>
      <el-form ref="templateFormRef" :model="templateForm" :rules="templateRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model="templateForm.templateCode" placeholder="例如 BOOKING_CONFIRMED" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务场景" prop="scene">
              <el-input v-model="templateForm.scene" placeholder="例如 预约确认" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知渠道" prop="channelType">
              <el-select v-model="templateForm.channelType" placeholder="请选择渠道" class="w-full">
                <el-option v-for="item in notificationChannelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用" prop="enabled">
              <el-radio-group v-model="templateForm.enabled">
                <el-radio v-for="item in bookingEnabledOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="templateForm.title" placeholder="请输入通知标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务商模板ID" prop="providerTemplateId">
              <el-input v-model="templateForm.providerTemplateId" placeholder="可空" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板内容" prop="content">
              <el-input
                v-model="templateForm.content"
                type="textarea"
                :rows="5"
                placeholder="支持 {{orderNo}}、{{arrivalTime}}、{{customerName}} 等占位符"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="templateForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitTemplateForm">确 定</el-button>
          <el-button @click="cancelTemplate">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="logDetailVisible" title="通知日志详情" size="680px" append-to-body>
      <el-descriptions v-if="currentLog" :column="1" border>
        <el-descriptions-item label="请求ID">{{ currentLog.requestId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="门店">{{ getStoreName(currentLog.storeId) }}</el-descriptions-item>
        <el-descriptions-item label="模板">{{ getTemplateCode(currentLog.templateId) }}</el-descriptions-item>
        <el-descriptions-item label="渠道">{{ getOptionLabel(notificationChannelOptions, currentLog.channelType) }}</el-descriptions-item>
        <el-descriptions-item label="接收人">{{ currentLog.receiver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getOptionLabel(notificationSendStatusOptions, currentLog.sendStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ currentLog.sentTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误信息">{{ currentLog.errorMessage || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentLog.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-input class="mt-3" :model-value="formatRawPayload(currentLog?.rawPayload)" type="textarea" :rows="18" readonly />
    </el-drawer>
  </div>
</template>

<script setup name="YyNotification" lang="ts">
import { delYyNotificationLog, getYyNotificationLog, listYyNotificationLog } from '@/api/yy/notificationLog';
import type { YyNotificationLogQuery, YyNotificationLogVO } from '@/api/yy/notificationLog/types';
import {
  addYyNotificationTemplate,
  delYyNotificationTemplate,
  getYyNotificationTemplate,
  listYyNotificationTemplate,
  updateYyNotificationTemplate
} from '@/api/yy/notificationTemplate';
import type { YyNotificationTemplateForm, YyNotificationTemplateQuery, YyNotificationTemplateVO } from '@/api/yy/notificationTemplate/types';
import { listYyStore } from '@/api/yy/store';
import type { YyStoreVO } from '@/api/yy/store/types';
import {
  bookingEnabledOptions,
  getOptionLabel,
  getOptionType,
  notificationChannelOptions,
  notificationSendStatusOptions
} from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeTab = ref('template');
const storeOptions = ref<YyStoreVO[]>([]);
const templateOptions = ref<YyNotificationTemplateVO[]>([]);

const templateList = ref<YyNotificationTemplateVO[]>([]);
const templateLoading = ref(false);
const templateIds = ref<Array<string | number>>([]);
const templateSingle = ref(true);
const templateMultiple = ref(true);
const templateTotal = ref(0);

const logList = ref<YyNotificationLogVO[]>([]);
const logLoading = ref(false);
const logIds = ref<Array<string | number>>([]);
const logMultiple = ref(true);
const logTotal = ref(0);
const currentLog = ref<YyNotificationLogVO>();
const logDetailVisible = ref(false);

const templateQueryRef = ref<ElFormInstance>();
const logQueryRef = ref<ElFormInstance>();
const templateFormRef = ref<ElFormInstance>();

const templateDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const templateQuery = reactive<YyNotificationTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateCode: '',
  scene: '',
  channelType: '',
  title: '',
  enabled: ''
});

const logQuery = reactive<YyNotificationLogQuery>({
  pageNum: 1,
  pageSize: 10,
  storeId: '',
  orderId: '',
  customerId: '',
  templateId: '',
  channelType: '',
  receiver: '',
  sendStatus: '',
  requestId: ''
});

const initTemplateForm = (): YyNotificationTemplateForm => ({
  id: undefined,
  templateCode: '',
  scene: '',
  channelType: 'WECHAT',
  title: '',
  content: '',
  providerTemplateId: '',
  enabled: '1',
  remark: ''
});

const templateForm = reactive<YyNotificationTemplateForm>(initTemplateForm());

const templateRules = {
  templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
  scene: [{ required: true, message: '业务场景不能为空', trigger: 'blur' }],
  channelType: [{ required: true, message: '通知渠道不能为空', trigger: 'change' }],
  content: [{ required: true, message: '模板内容不能为空', trigger: 'blur' }]
};

const enabledTemplateTotal = computed(() => templateList.value.filter((item) => item.enabled === '1').length);
const failedLogTotal = computed(() => logList.value.filter((item) => item.sendStatus === 'FAILED').length);

const normalizeRows = <T,>(res: any): T[] => res?.rows ?? res?.data ?? [];

const getStoreName = (storeId?: string | number) => {
  const store = storeOptions.value.find((item) => String(item.id) === String(storeId));
  return store?.storeName ?? (storeId ? `门店ID ${storeId}` : '-');
};

const getTemplateCode = (templateId?: string | number) => {
  const item = templateOptions.value.find((template) => String(template.id) === String(templateId));
  return item?.templateCode ?? (templateId ? `模板ID ${templateId}` : '-');
};

const loadStores = async () => {
  const res = (await listYyStore({ pageNum: 1, pageSize: 1000 })) as any;
  storeOptions.value = normalizeRows<YyStoreVO>(res);
};

const loadTemplateOptions = async () => {
  const res = (await listYyNotificationTemplate({ pageNum: 1, pageSize: 1000 })) as any;
  templateOptions.value = normalizeRows<YyNotificationTemplateVO>(res);
};

const getTemplateList = async () => {
  templateLoading.value = true;
  try {
    const res = (await listYyNotificationTemplate(templateQuery)) as any;
    templateList.value = normalizeRows<YyNotificationTemplateVO>(res);
    templateTotal.value = res.total ?? templateList.value.length;
  } finally {
    templateLoading.value = false;
  }
};

const getLogList = async () => {
  logLoading.value = true;
  try {
    const res = (await listYyNotificationLog(logQuery)) as any;
    logList.value = normalizeRows<YyNotificationLogVO>(res);
    logTotal.value = res.total ?? logList.value.length;
  } finally {
    logLoading.value = false;
  }
};

const handleTemplateQuery = () => {
  templateQuery.pageNum = 1;
  getTemplateList();
};

const resetTemplateQuery = () => {
  templateQueryRef.value?.resetFields();
  handleTemplateQuery();
};

const handleLogQuery = () => {
  logQuery.pageNum = 1;
  getLogList();
};

const resetLogQuery = () => {
  logQueryRef.value?.resetFields();
  handleLogQuery();
};

const resetTemplateForm = () => {
  Object.assign(templateForm, initTemplateForm());
  templateFormRef.value?.resetFields();
};

const handleTemplateSelectionChange = (selection: YyNotificationTemplateVO[]) => {
  templateIds.value = selection.map((item) => item.id);
  templateSingle.value = selection.length !== 1;
  templateMultiple.value = !selection.length;
};

const handleLogSelectionChange = (selection: YyNotificationLogVO[]) => {
  logIds.value = selection.map((item) => item.id);
  logMultiple.value = !selection.length;
};

const handleTemplateAdd = () => {
  resetTemplateForm();
  templateDialog.visible = true;
  templateDialog.title = '新增通知模板';
};

const handleTemplateUpdate = async (row?: YyNotificationTemplateVO) => {
  resetTemplateForm();
  const id = row?.id || templateIds.value[0];
  const res = await getYyNotificationTemplate(id);
  Object.assign(templateForm, res.data);
  templateDialog.visible = true;
  templateDialog.title = '修改通知模板';
};

const submitTemplateForm = () => {
  templateFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    templateForm.id ? await updateYyNotificationTemplate(templateForm) : await addYyNotificationTemplate(templateForm);
    proxy?.$modal.msgSuccess('保存成功');
    templateDialog.visible = false;
    await getTemplateList();
    await loadTemplateOptions();
  });
};

const cancelTemplate = () => {
  templateDialog.visible = false;
  resetTemplateForm();
};

const handleTemplateDelete = async (row?: YyNotificationTemplateVO) => {
  const deleteIds = row?.id || templateIds.value;
  await proxy?.$modal.confirm(`是否确认删除通知模板 ${deleteIds}？`);
  await delYyNotificationTemplate(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getTemplateList();
  await loadTemplateOptions();
};

const handleTemplateExport = () => {
  proxy?.download('yy/notificationTemplate/export', templateQuery, `yy_notification_template_${new Date().getTime()}.xlsx`);
};

const showLogDetail = async (row: YyNotificationLogVO) => {
  const res = await getYyNotificationLog(row.id);
  currentLog.value = res.data;
  logDetailVisible.value = true;
};

const handleLogDelete = async (row?: YyNotificationLogVO) => {
  const deleteIds = row?.id || logIds.value;
  await proxy?.$modal.confirm(`是否确认删除通知日志 ${deleteIds}？`);
  await delYyNotificationLog(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getLogList();
};

const handleLogExport = () => {
  proxy?.download('yy/notificationLog/export', logQuery, `yy_notification_log_${new Date().getTime()}.xlsx`);
};

const formatRawPayload = (payload?: unknown) => {
  if (!payload) {
    return '';
  }
  if (typeof payload === 'string') {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  }
  return JSON.stringify(payload, null, 2);
};

onMounted(async () => {
  await Promise.all([loadStores(), loadTemplateOptions()]);
  await Promise.all([getTemplateList(), getLogList()]);
});
</script>
