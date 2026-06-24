<template>
  <div class="p-2">
    <section class="yy-customer-hero mb-[10px]">
      <div class="min-w-0">
        <div class="text-xs font-semibold text-slate-500">客户管理 · 订单沉淀 / 手机号去重 / 备注标签</div>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">客户档案列表</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          抖音来客、微信、小程序和人工订单同步后会按手机号沉淀客户，后台可按来源、等级、标签和最近下单时间追踪回访。
        </p>
      </div>
      <div class="yy-customer-hero-meta">
        <el-tag type="success" effect="plain">手机号去重</el-tag>
        <el-tag type="warning" effect="plain">渠道来源</el-tag>
        <el-tag effect="plain">消费汇总</el-tag>
      </div>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="queryParams.keyword" placeholder="姓名/手机/标签/备注" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="queryParams.customerName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="queryParams.mobile" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="来源" prop="source">
              <el-select v-model="queryParams.source" placeholder="客户来源" clearable class="!w-[150px]">
                <el-option v-for="item in customerSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="等级" prop="memberLevel">
              <el-select v-model="queryParams.memberLevel" placeholder="会员等级" clearable class="!w-[150px]">
                <el-option v-for="item in memberLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
              <el-input v-model="queryParams.tags" placeholder="标签关键字" clearable @keyup.enter="handleQuery" />
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
              <el-button v-hasPermi="['yy:customer:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:customer:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:customer:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:customer:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
          </el-row>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </div>
      </template>

      <el-table v-loading="loading" border stripe :data="customerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="客户" min-width="170" fixed="left" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium text-slate-900">{{ scope.row.customerName || '-' }}</div>
            <div class="text-xs text-slate-400">{{ scope.row.mobile || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="115">
          <template #default="scope">
            <el-tag :type="getOptionType(customerSourceOptions, scope.row.source)">
              {{ getOptionLabel(customerSourceOptions, scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="115">
          <template #default="scope">
            <el-tag :type="getOptionType(memberLevelOptions, scope.row.memberLevel)" effect="plain">
              {{ getOptionLabel(memberLevelOptions, scope.row.memberLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单数" prop="totalOrderCount" width="90" align="right" />
        <el-table-column label="累计消费" width="120" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.totalSpend) }}</template>
        </el-table-column>
        <el-table-column label="最近下单" min-width="160">
          <template #default="scope">{{ formatTime(scope.row.lastOrderTime) }}</template>
        </el-table-column>
        <el-table-column label="标签" min-width="170" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="tag in splitTags(scope.row.tags)" :key="tag" class="mr-1" effect="plain">{{ tag }}</el-tag>
            <span v-if="!splitTags(scope.row.tags).length" class="text-slate-400">-</span>
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
              <el-button v-hasPermi="['yy:customer:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:customer:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="760px" append-to-body>
      <el-form ref="customerFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入客户手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="form.source" placeholder="请选择客户来源" class="w-full">
                <el-option v-for="item in customerSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级" prop="memberLevel">
              <el-select v-model="form.memberLevel" placeholder="请选择会员等级" class="w-full">
                <el-option v-for="item in memberLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" class="w-full">
                <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker v-model="form.birthday" value-format="YYYY-MM-DD" type="date" placeholder="请选择生日" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单数" prop="totalOrderCount">
              <el-input-number v-model="form.totalOrderCount" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="累计消费" prop="totalSpend">
              <el-input-number v-model="form.totalSpend" :min="0" :precision="2" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最近下单" prop="lastOrderTime">
              <el-date-picker v-model="form.lastOrderTime" value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="最近下单时间" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标签" prop="tags">
              <el-input v-model="form.tags" placeholder="例如：亲子照,老客,高意向" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="回访记录、偏好、客服备注" />
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

    <el-drawer v-model="detailVisible" title="客户档案详情" size="540px" append-to-body>
      <el-alert class="mb-3" type="info" :closable="false" title="客户会从订单和渠道同步自动沉淀；手机号是首版去重主键。" />
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="客户姓名">{{ detail.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-tag :type="getOptionType(customerSourceOptions, detail.source)">{{ getOptionLabel(customerSourceOptions, detail.source) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag :type="getOptionType(memberLevelOptions, detail.memberLevel)" effect="plain">
            {{ getOptionLabel(memberLevelOptions, detail.memberLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="性别">{{ getOptionLabel(genderOptions, detail.gender) }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ detail.birthday || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单数">{{ detail.totalOrderCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="累计消费">¥{{ formatMoney(detail.totalSpend) }}</el-descriptions-item>
        <el-descriptions-item label="最近下单">{{ formatTime(detail.lastOrderTime) }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-for="tag in splitTags(detail.tags)" :key="tag" class="mr-1" effect="plain">{{ tag }}</el-tag>
          <span v-if="!splitTags(detail.tags).length">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">近期订单</el-divider>
      <el-table v-loading="recentOrderLoading" :data="recentOrders" border stripe empty-text="暂无订单记录">
        <el-table-column label="订单编号" prop="orderNo" min-width="150" show-overflow-tooltip />
        <el-table-column label="来源" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(orderSourceOptions, scope.row.source)">
              {{ getOptionLabel(orderSourceOptions, scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="到店时间" min-width="160">
          <template #default="scope">{{ formatTime(scope.row.arrivalTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(orderStatusOptions, scope.row.status)">
              {{ getOptionLabel(orderStatusOptions, scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup name="YyCustomer" lang="ts">
import { addYyCustomer, delYyCustomer, getYyCustomer, listYyCustomer, listYyCustomerRecentOrders, updateYyCustomer } from '@/api/yy/customer';
import type { YyCustomerForm, YyCustomerQuery, YyCustomerVO } from '@/api/yy/customer/types';
import type { YyOrderVO } from '@/api/yy/order/types';
import {
  customerSourceOptions,
  genderOptions,
  getOptionLabel,
  getOptionType,
  memberLevelOptions,
  orderSourceOptions,
  orderStatusOptions
} from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const customerList = ref<YyCustomerVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const detailVisible = ref(false);
const detail = ref<YyCustomerVO>();
const recentOrderLoading = ref(false);
const recentOrders = ref<YyOrderVO[]>([]);

const queryFormRef = ref<ElFormInstance>();
const customerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyCustomerForm = {
  id: undefined,
  customerName: '',
  mobile: '',
  gender: '0',
  birthday: '',
  source: 'LOCAL',
  memberLevel: 'NORMAL',
  totalOrderCount: 0,
  totalSpend: 0,
  lastOrderTime: '',
  tags: '',
  remark: ''
};

const data = reactive<PageData<YyCustomerForm, YyCustomerQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    customerName: '',
    mobile: '',
    source: '',
    memberLevel: '',
    tags: ''
  },
  rules: {
    customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
    mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const buildQuery = () => ({ ...queryParams.value });

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyCustomer(buildQuery())) as any;
    customerList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? customerList.value.length;
  } finally {
    loading.value = false;
  }
};

const formatMoney = (value?: number | string) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const formatTime = (value?: string) => {
  return value ? proxy?.parseTime(value) : '-';
};

const splitTags = (tags?: string) => {
  return (tags || '')
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: YyCustomerVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm };
  customerFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增客户档案';
};

const handleUpdate = async (row?: YyCustomerVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyCustomer(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改客户档案';
};

const submitForm = () => {
  customerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyCustomer(form.value) : await addYyCustomer(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyCustomerVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除客户档案 ${deleteIds}？`);
  await delYyCustomer(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/customer/export', buildQuery(), `yy_customer_${new Date().getTime()}.xlsx`);
};

const handleDetail = async (row: YyCustomerVO) => {
  const res = await getYyCustomer(row.id);
  detail.value = res.data;
  await loadRecentOrders(res.data?.id);
  detailVisible.value = true;
};

const loadRecentOrders = async (id?: string | number) => {
  recentOrders.value = [];
  if (!id) {
    return;
  }
  recentOrderLoading.value = true;
  try {
    const res = (await listYyCustomerRecentOrders(id, 5)) as any;
    recentOrders.value = res.rows ?? res.data ?? [];
  } finally {
    recentOrderLoading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.yy-customer-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #f7fee7 100%);
}

.yy-customer-hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  min-width: 220px;
}

@media (max-width: 768px) {
  .yy-customer-hero {
    flex-direction: column;
  }

  .yy-customer-hero-meta {
    justify-content: flex-start;
    min-width: 0;
  }
}
</style>
