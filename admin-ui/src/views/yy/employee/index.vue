<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">员工总数</div>
          <div class="mt-1 text-2xl font-semibold">{{ total }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页在岗员工</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">{{ activeTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">当前页已绑定系统用户</div>
          <div class="mt-1 text-2xl font-semibold text-blue-600">{{ boundTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">门店数</div>
          <div class="mt-1 text-2xl font-semibold">{{ storeOptions.length }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-semibold text-slate-900">员工管理</div>
            <div class="mt-1 text-xs text-gray-500">门店员工台账、岗位技能、系统账号绑定和后续订单分配都从这里开始。</div>
          </div>
          <el-tag effect="dark" type="primary">P1 运营基础</el-tag>
        </div>
      </template>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="mb-[10px]">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="queryParams.storeId" placeholder="全部门店" clearable class="!w-[180px]">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="员工编号" prop="employeeNo">
              <el-input v-model="queryParams.employeeNo" placeholder="请输入员工编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="员工姓名" prop="employeeName">
              <el-input v-model="queryParams.employeeName" placeholder="请输入员工姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="queryParams.mobile" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="岗位" prop="roleType">
              <el-select v-model="queryParams.roleType" placeholder="全部岗位" clearable class="!w-[150px]">
                <el-option v-for="item in employeeRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-[120px]">
                <el-option v-for="item in commonStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </transition>

      <el-row :gutter="10" class="mb-3">
        <el-col :span="1.5">
          <el-button v-hasPermi="['yy:employee:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['yy:employee:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['yy:employee:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['yy:employee:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
        </el-col>
        <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
      </el-row>

      <el-table v-loading="loading" border stripe :data="employeeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="员工编号" prop="employeeNo" min-width="140" fixed="left" show-overflow-tooltip />
        <el-table-column label="员工姓名" prop="employeeName" min-width="140" show-overflow-tooltip />
        <el-table-column label="门店" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ getStoreName(scope.row.storeId) }}</template>
        </el-table-column>
        <el-table-column label="手机号" prop="mobile" min-width="130" />
        <el-table-column label="岗位" width="120">
          <template #default="scope">
            <el-tag :type="getOptionType(employeeRoleOptions, scope.row.roleType)">
              {{ getOptionLabel(employeeRoleOptions, scope.row.roleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="技能标签" prop="skillTags" min-width="180" show-overflow-tooltip />
        <el-table-column label="系统用户" width="130">
          <template #default="scope">
            <el-tag v-if="scope.row.userId" type="success" effect="plain">已绑定</el-tag>
            <el-tag v-else type="info" effect="plain">未绑定</el-tag>
          </template>
        </el-table-column>
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
              <el-button v-hasPermi="['yy:employee:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:employee:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="720px" append-to-body>
      <el-form ref="employeeFormRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="form.storeId" placeholder="请选择门店" class="w-full">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="员工编号" prop="employeeNo">
              <el-input v-model="form.employeeNo" placeholder="请输入员工编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="员工姓名" prop="employeeName">
              <el-input v-model="form.employeeName" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="roleType">
              <el-select v-model="form.roleType" placeholder="请选择岗位" class="w-full">
                <el-option v-for="item in employeeRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in commonStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技能标签" prop="skillTags">
              <el-input v-model="form.skillTags" placeholder="多个标签用逗号分隔" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="系统用户">
              <div class="flex w-full flex-wrap items-center gap-2">
                <el-input :model-value="selectedUserLabel || (form.userId ? `用户ID ${form.userId}` : '')" readonly placeholder="点击选择系统用户" />
                <el-button icon="User" @click="openUserSelect">选择</el-button>
                <el-button icon="Close" @click="clearUserBind">清空</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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

    <UserSelect ref="userSelectRef" :multiple="false" @confirm-call-back="handleUserSelect" />
  </div>
</template>

<script setup name="YyEmployee" lang="ts">
import UserSelect from '@/components/UserSelect';
import type { UserVO } from '@/api/system/user/types';
import { addYyEmployee, delYyEmployee, getYyEmployee, listYyEmployee, updateYyEmployee } from '@/api/yy/employee';
import type { YyEmployeeForm, YyEmployeeQuery, YyEmployeeVO } from '@/api/yy/employee/types';
import { listYyStore } from '@/api/yy/store';
import type { YyStoreVO } from '@/api/yy/store/types';
import { commonStatusOptions, employeeRoleOptions, getOptionLabel, getOptionType } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const employeeList = ref<YyEmployeeVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const selectedUserLabel = ref('');

const queryFormRef = ref<ElFormInstance>();
const employeeFormRef = ref<ElFormInstance>();
const userSelectRef = ref<InstanceType<typeof UserSelect>>();

const storeOptions = ref<YyStoreVO[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyEmployeeForm = {
  id: undefined,
  storeId: '',
  userId: undefined,
  employeeNo: '',
  employeeName: '',
  mobile: '',
  roleType: 'STAFF',
  skillTags: '',
  status: '0',
  sort: 0,
  remark: ''
};

const data = reactive<PageData<YyEmployeeForm, YyEmployeeQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: '',
    userId: '',
    employeeNo: '',
    employeeName: '',
    mobile: '',
    roleType: '',
    status: ''
  },
  rules: {
    storeId: [{ required: true, message: '门店不能为空', trigger: 'change' }],
    employeeNo: [{ required: true, message: '员工编号不能为空', trigger: 'blur' }],
    employeeName: [{ required: true, message: '员工姓名不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const activeTotal = computed(() => employeeList.value.filter((item) => item.status === '0').length);
const boundTotal = computed(() => employeeList.value.filter((item) => item.userId).length);

const normalizeRows = <T,>(res: any): T[] => res?.rows ?? res?.data ?? [];

const getStoreName = (storeId?: string | number) => {
  const store = storeOptions.value.find((item) => String(item.id) === String(storeId));
  return store?.storeName ?? (storeId ? `门店ID ${storeId}` : '-');
};

const loadStores = async () => {
  const res = (await listYyStore({ pageNum: 1, pageSize: 1000 })) as any;
  storeOptions.value = normalizeRows<YyStoreVO>(res);
};

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyEmployee(queryParams.value)) as any;
    employeeList.value = normalizeRows<YyEmployeeVO>(res);
    total.value = res.total ?? employeeList.value.length;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: YyEmployeeVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = {
    ...initForm,
    storeId: queryParams.value.storeId || storeOptions.value[0]?.id || ''
  };
  selectedUserLabel.value = '';
  employeeFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增员工';
};

const handleUpdate = async (row?: YyEmployeeVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyEmployee(id);
  Object.assign(form.value, res.data);
  selectedUserLabel.value = res.data.userId ? `已绑定用户ID ${res.data.userId}` : '';
  dialog.visible = true;
  dialog.title = '修改员工';
};

const submitForm = () => {
  employeeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyEmployee(form.value) : await addYyEmployee(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyEmployeeVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除员工 ${deleteIds}？`);
  await delYyEmployee(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/employee/export', queryParams.value, `yy_employee_${new Date().getTime()}.xlsx`);
};

const openUserSelect = () => {
  userSelectRef.value?.open();
};

const clearUserBind = () => {
  form.value.userId = undefined;
  selectedUserLabel.value = '';
};

const handleUserSelect = (data: UserVO[]) => {
  const user = data?.[0];
  if (!user) {
    return;
  }
  form.value.userId = user.userId;
  selectedUserLabel.value = `${user.nickName || user.userName || '系统用户'} / ${user.userId}`;
};

onMounted(async () => {
  await loadStores();
  await getList();
});
</script>
