<template>
  <div class="p-2">
    <section class="yy-mobile-hero mb-[10px]">
      <div class="min-w-0">
        <div class="text-xs font-semibold text-slate-500">多端预约 · H5 / 小程序 / App</div>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">预约入口配置</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          统一维护各端 AppID、回调地址、启用状态和 SDK 接入进度。业务接口仍复用门店、产品、排期和预约订单，避免每个端单独做一套。
        </p>
      </div>
      <div class="yy-mobile-hero-meta">
        <el-tag type="success" effect="plain">H5 优先</el-tag>
        <el-tag type="primary" effect="plain">微信小程序</el-tag>
        <el-tag type="warning" effect="plain">App 预留</el-tag>
      </div>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="端类型" prop="channelType">
              <el-select v-model="queryParams.channelType" placeholder="全部端" clearable class="!w-[160px]">
                <el-option v-for="item in mobileChannelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="端名称" prop="channelName">
              <el-input v-model="queryParams.channelName" placeholder="请输入端名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="启用状态" prop="enabled">
              <el-select v-model="queryParams.enabled" placeholder="全部状态" clearable class="!w-[140px]">
                <el-option v-for="item in bookingEnabledOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="SDK状态" prop="sdkStatus">
              <el-select v-model="queryParams.sdkStatus" placeholder="全部状态" clearable class="!w-[140px]">
                <el-option v-for="item in mobileSdkStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <el-row :gutter="10">
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:mobile:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:mobile:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:mobile:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:mobile:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
          </el-row>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </div>
      </template>

      <el-table v-loading="loading" border stripe :data="configList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="入口" min-width="190" fixed="left" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium text-slate-900">{{ scope.row.channelName }}</div>
            <div class="text-xs text-slate-400">{{ scope.row.callbackUrl || '未配置回调地址' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="端类型" width="130">
          <template #default="scope">
            <el-tag :type="getOptionType(mobileChannelTypeOptions, scope.row.channelType)">
              {{ getOptionLabel(mobileChannelTypeOptions, scope.row.channelType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AppID" prop="appId" min-width="170" show-overflow-tooltip />
        <el-table-column label="密钥" width="95" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.appSecretEnc ? 'success' : 'info'" effect="plain">{{ scope.row.appSecretEnc ? '已配置' : '未配置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="95">
          <template #default="scope">
            <el-tag :type="getOptionType(bookingEnabledOptions, scope.row.enabled)">
              {{ getOptionLabel(bookingEnabledOptions, scope.row.enabled) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="SDK状态" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(mobileSdkStatusOptions, scope.row.sdkStatus)" effect="plain">
              {{ getOptionLabel(mobileSdkStatusOptions, scope.row.sdkStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="更新时间" min-width="160">
          <template #default="scope">{{ formatTime(scope.row.updateTime || scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" />
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['yy:mobile:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:mobile:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="760px" append-to-body>
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="端类型" prop="channelType">
              <el-select v-model="form.channelType" placeholder="请选择端类型" class="w-full">
                <el-option v-for="item in mobileChannelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端名称" prop="channelName">
              <el-input v-model="form.channelName" placeholder="例如：微信小程序预约端" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="AppID" prop="appId">
              <el-input v-model="form.appId" placeholder="请输入 AppID / Client Key" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="AppSecret" prop="appSecretEnc">
              <el-input v-model="form.appSecretEnc" type="password" show-password placeholder="留空则保留原密钥" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="回调地址" prop="callbackUrl">
              <el-input v-model="form.callbackUrl" placeholder="例如：https://yingyueyun.example.com/api/wechat/miniapp/callback" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态" prop="enabled">
              <el-select v-model="form.enabled" placeholder="请选择启用状态" class="w-full">
                <el-option v-for="item in bookingEnabledOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SDK状态" prop="sdkStatus">
              <el-select v-model="form.sdkStatus" placeholder="请选择 SDK 状态" class="w-full">
                <el-option v-for="item in mobileSdkStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="接口开通进度、商家资料、联调说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="预约入口详情" size="540px" append-to-body>
      <el-alert class="mb-3" type="info" :closable="false" title="所有用户端最终都写入同一套预约订单，端配置只负责入口、SDK 和回调。" />
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="端名称">{{ detail.channelName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="端类型">{{ getOptionLabel(mobileChannelTypeOptions, detail.channelType) }}</el-descriptions-item>
        <el-descriptions-item label="AppID">{{ detail.appId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="AppSecret">{{ detail.appSecretEnc ? '已配置' : '未配置' }}</el-descriptions-item>
        <el-descriptions-item label="回调地址">{{ detail.callbackUrl || '-' }}</el-descriptions-item>
        <el-descriptions-item label="启用状态">{{ getOptionLabel(bookingEnabledOptions, detail.enabled) }}</el-descriptions-item>
        <el-descriptions-item label="SDK状态">{{ getOptionLabel(mobileSdkStatusOptions, detail.sdkStatus) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="YyMobile" lang="ts">
import {
  addYyMobileChannelConfig,
  delYyMobileChannelConfig,
  getYyMobileChannelConfig,
  listYyMobileChannelConfig,
  updateYyMobileChannelConfig
} from '@/api/yy/mobileChannelConfig';
import type { YyMobileChannelConfigForm, YyMobileChannelConfigQuery, YyMobileChannelConfigVO } from '@/api/yy/mobileChannelConfig/types';
import {
  bookingEnabledOptions,
  getOptionLabel,
  getOptionType,
  mobileChannelTypeOptions,
  mobileSdkStatusOptions
} from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const configList = ref<YyMobileChannelConfigVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const detailVisible = ref(false);
const detail = ref<YyMobileChannelConfigVO>();

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyMobileChannelConfigForm = {
  id: undefined,
  channelType: 'H5',
  channelName: '',
  appId: '',
  appSecretEnc: '',
  callbackUrl: '',
  enabled: '0',
  sdkStatus: 'PENDING',
  remark: ''
};

const data = reactive<PageData<YyMobileChannelConfigForm, YyMobileChannelConfigQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    channelType: '',
    channelName: '',
    enabled: '',
    sdkStatus: ''
  },
  rules: {
    channelType: [{ required: true, message: '端类型不能为空', trigger: 'change' }],
    channelName: [{ required: true, message: '端名称不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyMobileChannelConfig({ ...queryParams.value })) as any;
    configList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? configList.value.length;
  } finally {
    loading.value = false;
  }
};

const formatTime = (value?: string) => {
  return value ? proxy?.parseTime(value) : '-';
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: YyMobileChannelConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm };
  configFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增预约入口';
};

const handleUpdate = async (row?: YyMobileChannelConfigVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyMobileChannelConfig(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改预约入口';
};

const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyMobileChannelConfig(form.value) : await addYyMobileChannelConfig(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyMobileChannelConfigVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除预约入口 ${deleteIds}？`);
  await delYyMobileChannelConfig(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/mobileChannelConfig/export', { ...queryParams.value }, `yy_mobile_channel_config_${new Date().getTime()}.xlsx`);
};

const handleDetail = async (row: YyMobileChannelConfigVO) => {
  const res = await getYyMobileChannelConfig(row.id);
  detail.value = res.data;
  detailVisible.value = true;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.yy-mobile-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #ecfdf5 100%);
}

.yy-mobile-hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  min-width: 220px;
}

@media (max-width: 768px) {
  .yy-mobile-hero {
    flex-direction: column;
  }

  .yy-mobile-hero-meta {
    justify-content: flex-start;
    min-width: 0;
  }
}
</style>
