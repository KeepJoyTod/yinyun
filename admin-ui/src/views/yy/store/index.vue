<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">门店总数</div>
          <div class="mt-1 text-2xl font-semibold">{{ storeList.length }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">营业门店</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">{{ businessStoreTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card shadow="never">
          <div class="text-xs text-gray-500">停业门店</div>
          <div class="mt-1 text-2xl font-semibold text-gray-500">{{ closedStoreTotal }}</div>
        </el-card>
      </el-col>
    </el-row>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="门店编码" prop="storeCode">
              <el-input v-model="queryParams.storeCode" placeholder="请输入门店编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="queryParams.storeName" placeholder="请输入门店名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="营业状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-[140px]">
                <el-option v-for="item in storeStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="地址" prop="address">
              <el-input v-model="queryParams.address" placeholder="请输入地址关键字" clearable @keyup.enter="handleQuery" />
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
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:store:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:store:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:store:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:store:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe :data="storeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="门店编码" prop="storeCode" min-width="140" fixed="left" show-overflow-tooltip />
        <el-table-column label="门店名称" prop="storeName" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getOptionType(storeStatusOptions, scope.row.status)">
              {{ getOptionLabel(storeStatusOptions, scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="电话" prop="phone" min-width="130" />
        <el-table-column label="营业时间" prop="businessHours" min-width="160" show-overflow-tooltip />
        <el-table-column label="地址" prop="address" min-width="240" show-overflow-tooltip />
        <el-table-column label="排序" prop="sort" width="90" />
        <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['yy:store:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:store:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="640px" append-to-body>
      <el-form ref="storeFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店编码" prop="storeCode">
              <el-input v-model="form.storeCode" placeholder="请输入门店编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="form.storeName" placeholder="请输入门店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in storeStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业时间" prop="businessHours">
              <el-input v-model="form.businessHours" placeholder="例如 09:00-21:00" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="门店地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入门店地址" />
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
  </div>
</template>

<script setup name="YyStore" lang="ts">
import { addYyStore, delYyStore, getYyStore, listYyStore, updateYyStore } from '@/api/yy/store';
import type { YyStoreForm, YyStoreQuery, YyStoreVO } from '@/api/yy/store/types';
import { getOptionLabel, getOptionType, storeStatusOptions } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const storeList = ref<YyStoreVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const storeFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyStoreForm = {
  id: undefined,
  storeCode: '',
  storeName: '',
  status: '0',
  phone: '',
  address: '',
  businessHours: '',
  sort: 0,
  remark: ''
};

const data = reactive<PageData<YyStoreForm, YyStoreQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeCode: '',
    storeName: '',
    status: '',
    address: ''
  },
  rules: {
    storeCode: [{ required: true, message: '门店编码不能为空', trigger: 'blur' }],
    storeName: [{ required: true, message: '门店名称不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const businessStoreTotal = computed(() => storeList.value.filter((item) => item.status === '0').length);
const closedStoreTotal = computed(() => storeList.value.filter((item) => item.status !== '0').length);

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyStore(queryParams.value)) as any;
    storeList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? storeList.value.length;
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

const handleSelectionChange = (selection: YyStoreVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm };
  storeFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增门店';
};

const handleUpdate = async (row?: YyStoreVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyStore(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改门店';
};

const submitForm = () => {
  storeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyStore(form.value) : await addYyStore(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyStoreVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除门店 ${deleteIds}？`);
  await delYyStore(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/store/export', queryParams.value, `yy_store_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
