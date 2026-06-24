<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">服务组</div>
          <div class="mt-1 text-2xl font-semibold">{{ groupTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页启用服务组</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">{{ enabledGroupTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">排期规则</div>
          <div class="mt-1 text-2xl font-semibold">{{ ruleTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页启用规则</div>
          <div class="mt-1 text-2xl font-semibold text-blue-600">{{ enabledRuleTotal }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">预约配置</div>
            <div class="mt-1 text-xs text-gray-500">服务组、时长、容量和星期规则会给 H5 / 小程序 / App 共用。</div>
          </div>
          <el-tag effect="dark" type="success">P1 核心底座</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="服务组" name="group">
          <el-form ref="groupQueryRef" :model="groupQuery" :inline="true" class="mb-3">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="groupQuery.storeId" placeholder="全部门店" clearable class="!w-[180px]">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="服务组编码" prop="groupCode">
              <el-input v-model="groupQuery.groupCode" placeholder="请输入编码" clearable @keyup.enter="handleGroupQuery" />
            </el-form-item>
            <el-form-item label="服务组名称" prop="groupName">
              <el-input v-model="groupQuery.groupName" placeholder="请输入名称" clearable @keyup.enter="handleGroupQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="groupQuery.status" placeholder="全部状态" clearable class="!w-[140px]">
                <el-option v-for="item in commonStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleGroupQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetGroupQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb-3">
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:add']" type="primary" plain icon="Plus" @click="handleGroupAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:edit']" type="success" plain :disabled="groupSingle" icon="Edit" @click="handleGroupUpdate()">
                修改
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:remove']" type="danger" plain :disabled="groupMultiple" icon="Delete" @click="handleGroupDelete()">
                删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:export']" type="warning" plain icon="Download" @click="handleGroupExport">导出</el-button>
            </el-col>
          </el-row>

          <el-table v-loading="groupLoading" border stripe :data="groupList" @selection-change="handleGroupSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="服务组编码" prop="groupCode" min-width="140" fixed="left" show-overflow-tooltip />
            <el-table-column label="服务组名称" prop="groupName" min-width="180" show-overflow-tooltip />
            <el-table-column label="门店" min-width="180" show-overflow-tooltip>
              <template #default="scope">{{ getStoreName(scope.row.storeId) }}</template>
            </el-table-column>
            <el-table-column label="容量" prop="capacity" width="90" />
            <el-table-column label="时长(分钟)" prop="durationMinutes" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(commonStatusOptions, scope.row.status)">
                  {{ getOptionLabel(commonStatusOptions, scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="排序" prop="sort" width="90" />
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:bookingConfig:edit']" link type="primary" icon="Edit" @click="handleGroupUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:bookingConfig:remove']" link type="primary" icon="Delete" @click="handleGroupDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-if="groupTotal > 0" v-model:total="groupTotal" v-model:page="groupQuery.pageNum" v-model:limit="groupQuery.pageSize" @pagination="getGroupList" />
        </el-tab-pane>

        <el-tab-pane label="排期规则" name="rule">
          <el-form ref="ruleQueryRef" :model="ruleQuery" :inline="true" class="mb-3">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="ruleQuery.storeId" placeholder="全部门店" clearable class="!w-[180px]" @change="loadServiceGroupOptions(ruleQuery.storeId)">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="服务组" prop="serviceGroupId">
              <el-select v-model="ruleQuery.serviceGroupId" placeholder="全部服务组" clearable class="!w-[190px]">
                <el-option v-for="item in serviceGroupOptions" :key="item.id" :label="item.groupName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="星期" prop="weekday">
              <el-select v-model="ruleQuery.weekday" placeholder="全部" clearable class="!w-[120px]">
                <el-option v-for="item in weekdayOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
              </el-select>
            </el-form-item>
            <el-form-item label="启用" prop="enabled">
              <el-select v-model="ruleQuery.enabled" placeholder="全部" clearable class="!w-[120px]">
                <el-option v-for="item in bookingEnabledOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleRuleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetRuleQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb-3">
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:add']" type="primary" plain icon="Plus" @click="handleRuleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:edit']" type="success" plain :disabled="ruleSingle" icon="Edit" @click="handleRuleUpdate()">
                修改
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:remove']" type="danger" plain :disabled="ruleMultiple" icon="Delete" @click="handleRuleDelete()">
                删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:bookingConfig:export']" type="warning" plain icon="Download" @click="handleRuleExport">导出</el-button>
            </el-col>
          </el-row>

          <el-table v-loading="ruleLoading" border stripe :data="ruleList" @selection-change="handleRuleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="门店" min-width="180" show-overflow-tooltip>
              <template #default="scope">{{ getStoreName(scope.row.storeId) }}</template>
            </el-table-column>
            <el-table-column label="服务组" min-width="180" show-overflow-tooltip>
              <template #default="scope">{{ getServiceGroupName(scope.row.serviceGroupId) }}</template>
            </el-table-column>
            <el-table-column label="星期" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(weekdayOptions, scope.row.weekday)">
                  {{ getOptionLabel(weekdayOptions, scope.row.weekday) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时段" min-width="150">
              <template #default="scope">{{ scope.row.startTime }} - {{ scope.row.endTime }}</template>
            </el-table-column>
            <el-table-column label="容量" prop="capacity" width="90" />
            <el-table-column label="启用" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(bookingEnabledOptions, scope.row.enabled)">
                  {{ getOptionLabel(bookingEnabledOptions, scope.row.enabled) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:bookingConfig:edit']" link type="primary" icon="Edit" @click="handleRuleUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:bookingConfig:remove']" link type="primary" icon="Delete" @click="handleRuleDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-if="ruleTotal > 0" v-model:total="ruleTotal" v-model:page="ruleQuery.pageNum" v-model:limit="ruleQuery.pageSize" @pagination="getRuleList" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="groupDialog.visible" :title="groupDialog.title" width="680px" append-to-body>
      <el-form ref="groupFormRef" :model="groupForm" :rules="groupRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="groupForm.storeId" placeholder="请选择门店" class="w-full">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务组编码" prop="groupCode">
              <el-input v-model="groupForm.groupCode" placeholder="例如 ID-PHOTO" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务组名称" prop="groupName">
              <el-input v-model="groupForm.groupName" placeholder="请输入服务组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="groupForm.status">
                <el-radio v-for="item in commonStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="groupForm.capacity" :min="1" :max="999" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长(分钟)" prop="durationMinutes">
              <el-input-number v-model="groupForm.durationMinutes" :min="5" :step="5" :max="1440" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="groupForm.sort" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="groupForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGroupForm">确 定</el-button>
          <el-button @click="cancelGroup">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialog.visible" :title="ruleDialog.title" width="680px" append-to-body>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="ruleRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="ruleForm.storeId" placeholder="请选择门店" class="w-full" @change="handleRuleFormStoreChange">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务组" prop="serviceGroupId">
              <el-select v-model="ruleForm.serviceGroupId" placeholder="请选择服务组" class="w-full">
                <el-option v-for="item in serviceGroupOptions" :key="item.id" :label="item.groupName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="星期" prop="weekday">
              <el-select v-model="ruleForm.weekday" placeholder="请选择星期" class="w-full">
                <el-option v-for="item in weekdayOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用" prop="enabled">
              <el-radio-group v-model="ruleForm.enabled">
                <el-radio v-for="item in bookingEnabledOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="ruleForm.startTime" value-format="HH:mm" format="HH:mm" placeholder="开始时间" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="ruleForm.endTime" value-format="HH:mm" format="HH:mm" placeholder="结束时间" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="ruleForm.capacity" :min="1" :max="999" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="ruleForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitRuleForm">确 定</el-button>
          <el-button @click="cancelRule">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="YyBookingConfig" lang="ts">
import { addYyScheduleRule, delYyScheduleRule, getYyScheduleRule, listYyScheduleRule, updateYyScheduleRule } from '@/api/yy/scheduleRule';
import type { YyScheduleRuleForm, YyScheduleRuleQuery, YyScheduleRuleVO } from '@/api/yy/scheduleRule/types';
import { addYyServiceGroup, delYyServiceGroup, getYyServiceGroup, listYyServiceGroup, updateYyServiceGroup } from '@/api/yy/serviceGroup';
import type { YyServiceGroupForm, YyServiceGroupQuery, YyServiceGroupVO } from '@/api/yy/serviceGroup/types';
import { listYyStore } from '@/api/yy/store';
import type { YyStoreVO } from '@/api/yy/store/types';
import { bookingEnabledOptions, commonStatusOptions, getOptionLabel, getOptionType, weekdayOptions } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeTab = ref('group');
const storeOptions = ref<YyStoreVO[]>([]);
const serviceGroupOptions = ref<YyServiceGroupVO[]>([]);

const groupList = ref<YyServiceGroupVO[]>([]);
const groupLoading = ref(false);
const groupIds = ref<Array<string | number>>([]);
const groupSingle = ref(true);
const groupMultiple = ref(true);
const groupTotal = ref(0);

const ruleList = ref<YyScheduleRuleVO[]>([]);
const ruleLoading = ref(false);
const ruleIds = ref<Array<string | number>>([]);
const ruleSingle = ref(true);
const ruleMultiple = ref(true);
const ruleTotal = ref(0);

const groupQueryRef = ref<ElFormInstance>();
const ruleQueryRef = ref<ElFormInstance>();
const groupFormRef = ref<ElFormInstance>();
const ruleFormRef = ref<ElFormInstance>();

const groupDialog = reactive<DialogOption>({ visible: false, title: '' });
const ruleDialog = reactive<DialogOption>({ visible: false, title: '' });

const groupQuery = reactive<YyServiceGroupQuery>({
  pageNum: 1,
  pageSize: 10,
  storeId: undefined,
  groupCode: '',
  groupName: '',
  status: ''
});

const ruleQuery = reactive<YyScheduleRuleQuery>({
  pageNum: 1,
  pageSize: 10,
  storeId: undefined,
  serviceGroupId: undefined,
  weekday: undefined,
  enabled: ''
});

const initGroupForm = (): YyServiceGroupForm => ({
  id: undefined,
  storeId: '',
  groupCode: '',
  groupName: '',
  capacity: 1,
  durationMinutes: 30,
  status: '0',
  sort: 0,
  remark: ''
});

const initRuleForm = (): YyScheduleRuleForm => ({
  id: undefined,
  storeId: '',
  serviceGroupId: '',
  weekday: 1,
  startTime: '09:00',
  endTime: '18:00',
  capacity: 1,
  enabled: '1',
  remark: ''
});

const groupForm = reactive<YyServiceGroupForm>(initGroupForm());
const ruleForm = reactive<YyScheduleRuleForm>(initRuleForm());

const groupRules = {
  storeId: [{ required: true, message: '门店不能为空', trigger: 'change' }],
  groupCode: [{ required: true, message: '服务组编码不能为空', trigger: 'blur' }],
  groupName: [{ required: true, message: '服务组名称不能为空', trigger: 'blur' }]
};

const ruleRules = {
  storeId: [{ required: true, message: '门店不能为空', trigger: 'change' }],
  serviceGroupId: [{ required: true, message: '服务组不能为空', trigger: 'change' }],
  weekday: [{ required: true, message: '星期不能为空', trigger: 'change' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
};

const enabledGroupTotal = computed(() => groupList.value.filter((item) => item.status === '0').length);
const enabledRuleTotal = computed(() => ruleList.value.filter((item) => item.enabled === '1').length);

const normalizeRows = <T,>(res: any): T[] => res?.rows ?? res?.data ?? [];

const getStoreName = (storeId?: string | number) => {
  const store = storeOptions.value.find((item) => String(item.id) === String(storeId));
  return store?.storeName ?? (storeId ? `门店ID ${storeId}` : '-');
};

const getServiceGroupName = (serviceGroupId?: string | number) => {
  const group = serviceGroupOptions.value.find((item) => String(item.id) === String(serviceGroupId));
  return group?.groupName ?? (serviceGroupId ? `服务组ID ${serviceGroupId}` : '-');
};

const loadStores = async () => {
  const res = (await listYyStore({ pageNum: 1, pageSize: 1000 })) as any;
  storeOptions.value = normalizeRows<YyStoreVO>(res);
};

const loadServiceGroupOptions = async (storeId?: string | number) => {
  const res = (await listYyServiceGroup({ pageNum: 1, pageSize: 1000, storeId: storeId || undefined })) as any;
  serviceGroupOptions.value = normalizeRows<YyServiceGroupVO>(res);
};

const getGroupList = async () => {
  groupLoading.value = true;
  try {
    const res = (await listYyServiceGroup(groupQuery)) as any;
    groupList.value = normalizeRows<YyServiceGroupVO>(res);
    groupTotal.value = res.total ?? groupList.value.length;
  } finally {
    groupLoading.value = false;
  }
};

const getRuleList = async () => {
  ruleLoading.value = true;
  try {
    const res = (await listYyScheduleRule(ruleQuery)) as any;
    ruleList.value = normalizeRows<YyScheduleRuleVO>(res);
    ruleTotal.value = res.total ?? ruleList.value.length;
  } finally {
    ruleLoading.value = false;
  }
};

const handleGroupQuery = () => {
  groupQuery.pageNum = 1;
  getGroupList();
};

const resetGroupQuery = () => {
  groupQueryRef.value?.resetFields();
  handleGroupQuery();
};

const handleRuleQuery = () => {
  ruleQuery.pageNum = 1;
  getRuleList();
};

const resetRuleQuery = () => {
  ruleQueryRef.value?.resetFields();
  loadServiceGroupOptions();
  handleRuleQuery();
};

const resetGroupForm = () => {
  Object.assign(groupForm, initGroupForm(), {
    storeId: groupQuery.storeId || storeOptions.value[0]?.id || ''
  });
  groupFormRef.value?.resetFields();
};

const resetRuleForm = () => {
  Object.assign(ruleForm, initRuleForm(), {
    storeId: ruleQuery.storeId || storeOptions.value[0]?.id || '',
    serviceGroupId: ruleQuery.serviceGroupId || serviceGroupOptions.value[0]?.id || ''
  });
  ruleFormRef.value?.resetFields();
};

const handleGroupSelectionChange = (selection: YyServiceGroupVO[]) => {
  groupIds.value = selection.map((item) => item.id);
  groupSingle.value = selection.length !== 1;
  groupMultiple.value = !selection.length;
};

const handleRuleSelectionChange = (selection: YyScheduleRuleVO[]) => {
  ruleIds.value = selection.map((item) => item.id);
  ruleSingle.value = selection.length !== 1;
  ruleMultiple.value = !selection.length;
};

const handleGroupAdd = () => {
  resetGroupForm();
  groupDialog.visible = true;
  groupDialog.title = '新增服务组';
};

const handleGroupUpdate = async (row?: YyServiceGroupVO) => {
  resetGroupForm();
  const id = row?.id || groupIds.value[0];
  const res = await getYyServiceGroup(id);
  Object.assign(groupForm, res.data);
  groupDialog.visible = true;
  groupDialog.title = '修改服务组';
};

const submitGroupForm = () => {
  groupFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    groupForm.id ? await updateYyServiceGroup(groupForm) : await addYyServiceGroup(groupForm);
    proxy?.$modal.msgSuccess('保存成功');
    groupDialog.visible = false;
    await getGroupList();
    await loadServiceGroupOptions(ruleQuery.storeId);
  });
};

const cancelGroup = () => {
  groupDialog.visible = false;
  resetGroupForm();
};

const handleGroupDelete = async (row?: YyServiceGroupVO) => {
  const deleteIds = row?.id || groupIds.value;
  await proxy?.$modal.confirm(`是否确认删除服务组 ${deleteIds}？`);
  await delYyServiceGroup(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getGroupList();
  await loadServiceGroupOptions(ruleQuery.storeId);
};

const handleGroupExport = () => {
  proxy?.download('yy/serviceGroup/export', groupQuery, `yy_service_group_${new Date().getTime()}.xlsx`);
};

const handleRuleAdd = async () => {
  await loadServiceGroupOptions(ruleQuery.storeId);
  resetRuleForm();
  ruleDialog.visible = true;
  ruleDialog.title = '新增排期规则';
};

const handleRuleUpdate = async (row?: YyScheduleRuleVO) => {
  resetRuleForm();
  const id = row?.id || ruleIds.value[0];
  const res = await getYyScheduleRule(id);
  Object.assign(ruleForm, res.data);
  await loadServiceGroupOptions(ruleForm.storeId);
  ruleDialog.visible = true;
  ruleDialog.title = '修改排期规则';
};

const handleRuleFormStoreChange = async (storeId?: string | number) => {
  await loadServiceGroupOptions(storeId);
  if (!serviceGroupOptions.value.some((item) => String(item.id) === String(ruleForm.serviceGroupId))) {
    ruleForm.serviceGroupId = serviceGroupOptions.value[0]?.id || '';
  }
};

const submitRuleForm = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    ruleForm.id ? await updateYyScheduleRule(ruleForm) : await addYyScheduleRule(ruleForm);
    proxy?.$modal.msgSuccess('保存成功');
    ruleDialog.visible = false;
    await getRuleList();
    await loadServiceGroupOptions(ruleQuery.storeId);
  });
};

const cancelRule = () => {
  ruleDialog.visible = false;
  resetRuleForm();
  loadServiceGroupOptions(ruleQuery.storeId);
};

const handleRuleDelete = async (row?: YyScheduleRuleVO) => {
  const deleteIds = row?.id || ruleIds.value;
  await proxy?.$modal.confirm(`是否确认删除排期规则 ${deleteIds}？`);
  await delYyScheduleRule(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getRuleList();
};

const handleRuleExport = () => {
  proxy?.download('yy/scheduleRule/export', ruleQuery, `yy_schedule_rule_${new Date().getTime()}.xlsx`);
};

onMounted(async () => {
  await loadStores();
  await loadServiceGroupOptions();
  await Promise.all([getGroupList(), getRuleList()]);
});
</script>
