<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="queryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="queryParams.productType" placeholder="请选择类型" clearable class="!w-[150px]">
                <el-option v-for="item in productTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="入册产品" prop="albumProductName">
              <el-input v-model="queryParams.albumProductName" placeholder="请输入入册产品" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-[120px]">
                <el-option v-for="item in commonStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
              <el-button v-hasPermi="['yy:product:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:product:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:product:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:product:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
          </el-row>
          <div class="text-xs text-gray-500">B-022 在线选片配置：选片单价、入册产品直接维护在产品档案上</div>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </div>
      </template>

      <el-table v-loading="loading" border stripe :data="productList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="产品名称" prop="productName" min-width="170" fixed="left" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getOptionType(productTypeOptions, scope.row.productType)">
              {{ getOptionLabel(productTypeOptions, scope.row.productType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="门店ID" prop="storeId" width="100" />
        <el-table-column label="销售价" prop="price" width="110">
          <template #default="scope">￥{{ Number(scope.row.price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="服务时长" prop="durationMinutes" width="110">
          <template #default="scope">{{ scope.row.durationMinutes || 0 }} 分钟</template>
        </el-table-column>
        <el-table-column label="选片单价" prop="selectionPrice" width="120">
          <template #default="scope">￥{{ Number(scope.row.selectionPrice || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="入册产品" prop="albumProductName" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag :type="getOptionType(commonStatusOptions, scope.row.status)">
              {{ getOptionLabel(commonStatusOptions, scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['yy:product:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:product:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="720px" append-to-body>
      <el-form ref="productFormRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="form.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="form.productType" placeholder="请选择产品类型" class="w-full">
                <el-option v-for="item in productTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="form.storeId" placeholder="为空表示全门店通用" />
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
            <el-form-item label="销售价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务时长" prop="durationMinutes">
              <el-input-number v-model="form.durationMinutes" :min="0" :step="15" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选片单价" prop="selectionPrice">
              <el-input-number v-model="form.selectionPrice" :min="0" :precision="2" :step="5" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入册产品" prop="albumProductName">
              <el-input v-model="form.albumProductName" placeholder="例如：精修入册/相册加片" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入产品说明、渠道映射说明等" />
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

<script setup name="YyProduct" lang="ts">
import { addYyProduct, delYyProduct, getYyProduct, listYyProduct, updateYyProduct } from '@/api/yy/product';
import type { YyProductForm, YyProductQuery, YyProductVO } from '@/api/yy/product/types';
import { commonStatusOptions, getOptionLabel, getOptionType, productTypeOptions } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const productList = ref<YyProductVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const productFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyProductForm = {
  id: undefined,
  storeId: '',
  productType: 'SERVICE',
  productName: '',
  price: 0,
  durationMinutes: 0,
  selectionPrice: 0,
  albumProductName: '',
  status: '0',
  sort: 0,
  remark: ''
};

const data = reactive<PageData<YyProductForm, YyProductQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    productType: '',
    productName: '',
    albumProductName: '',
    status: ''
  },
  rules: {
    productName: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
    productType: [{ required: true, message: '产品类型不能为空', trigger: 'change' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyProduct(queryParams.value)) as any;
    productList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? productList.value.length;
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

const handleSelectionChange = (selection: YyProductVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm };
  productFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增产品';
};

const handleUpdate = async (row?: YyProductVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyProduct(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改产品';
};

const submitForm = () => {
  productFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyProduct(form.value) : await addYyProduct(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyProductVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除产品 ${deleteIds}？`);
  await delYyProduct(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/product/export', queryParams.value, `yy_product_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
