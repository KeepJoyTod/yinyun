<template>
  <div class="p-2">
    <section class="yy-report-hero mb-[10px]">
      <div class="min-w-0">
        <div class="text-xs font-semibold text-slate-500">经营报表 · 快照 / 渠道 / 选片收入</div>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">经营报表快照</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          首版先沉淀门店日报快照，后续再从订单、底片、选片和渠道同步日志生成趋势图，避免上线初期实时扫大表。
        </p>
      </div>
      <div class="yy-report-kpis">
        <div class="yy-report-kpi">
          <span>订单</span>
          <strong>{{ summary.orderTotal }}</strong>
        </div>
        <div class="yy-report-kpi">
          <span>收入</span>
          <strong>¥{{ formatMoney(summary.revenueTotal) }}</strong>
        </div>
        <div class="yy-report-kpi">
          <span>选片</span>
          <strong>¥{{ formatMoney(summary.selectionTotal) }}</strong>
        </div>
      </div>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="queryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="报表日期" prop="reportDate">
              <el-date-picker v-model="queryParams.reportDate" value-format="YYYY-MM-DD" type="date" placeholder="请选择日期" clearable />
            </el-form-item>
            <el-form-item label="报表类型" prop="reportType">
              <el-select v-model="queryParams.reportType" placeholder="全部类型" clearable class="!w-[140px]">
                <el-option v-for="item in reportTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
              <el-button v-hasPermi="['yy:report:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:report:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:report:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-hasPermi="['yy:report:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
            </el-col>
          </el-row>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </div>
      </template>

      <el-table v-loading="loading" border stripe :data="snapshotList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="日期" min-width="125" fixed="left">
          <template #default="scope">
            <div class="font-medium text-slate-900">{{ formatDate(scope.row.reportDate) }}</div>
            <div class="text-xs text-slate-400">门店 {{ scope.row.storeId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(reportTypeOptions, scope.row.reportType)">
              {{ getOptionLabel(reportTypeOptions, scope.row.reportType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单" prop="orderTotal" width="85" align="right" />
        <el-table-column label="到店" prop="arrivedTotal" width="85" align="right" />
        <el-table-column label="完成" prop="completedTotal" width="85" align="right" />
        <el-table-column label="完成率" width="95" align="right">
          <template #default="scope">{{ completionRate(scope.row) }}%</template>
        </el-table-column>
        <el-table-column label="收入合计" width="125" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.revenueTotal) }}</template>
        </el-table-column>
        <el-table-column label="选片收入" width="125" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.selectionTotal) }}</template>
        </el-table-column>
        <el-table-column label="来源汇总" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ compactJson(scope.row.sourceSummary) }}</template>
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
              <el-button v-hasPermi="['yy:report:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:report:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="820px" append-to-body>
      <el-form ref="snapshotFormRef" :model="form" :rules="rules" label-width="105px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="form.storeId" placeholder="可为空" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="报表日期" prop="reportDate">
              <el-date-picker v-model="form.reportDate" value-format="YYYY-MM-DD" type="date" placeholder="请选择日期" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="报表类型" prop="reportType">
              <el-select v-model="form.reportType" placeholder="请选择类型" class="w-full">
                <el-option v-for="item in reportTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单数" prop="orderTotal">
              <el-input-number v-model="form.orderTotal" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="到店数" prop="arrivedTotal">
              <el-input-number v-model="form.arrivedTotal" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完成数" prop="completedTotal">
              <el-input-number v-model="form.completedTotal" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完成率">
              <el-input :model-value="completionRate(form)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收入合计" prop="revenueTotal">
              <el-input-number v-model="form.revenueTotal" :min="0" :precision="2" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选片收入" prop="selectionTotal">
              <el-input-number v-model="form.selectionTotal" :min="0" :precision="2" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="来源汇总" prop="sourceSummary">
              <el-input v-model="form.sourceSummary" type="textarea" :rows="4" placeholder='例如：{"LOCAL":2,"DOUYIN":1,"H5":1}' />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="数据口径、生成批次、异常说明" />
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

    <el-drawer v-model="detailVisible" title="报表快照详情" size="580px" append-to-body>
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="门店ID">{{ detail.storeId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报表日期">{{ formatDate(detail.reportDate) }}</el-descriptions-item>
        <el-descriptions-item label="报表类型">{{ getOptionLabel(reportTypeOptions, detail.reportType) }}</el-descriptions-item>
        <el-descriptions-item label="订单 / 到店 / 完成">{{ detail.orderTotal }} / {{ detail.arrivedTotal }} / {{ detail.completedTotal }}</el-descriptions-item>
        <el-descriptions-item label="完成率">{{ completionRate(detail) }}%</el-descriptions-item>
        <el-descriptions-item label="收入合计">¥{{ formatMoney(detail.revenueTotal) }}</el-descriptions-item>
        <el-descriptions-item label="选片收入">¥{{ formatMoney(detail.selectionTotal) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">来源汇总</el-divider>
      <el-input :model-value="prettyJson(detail?.sourceSummary)" type="textarea" :rows="10" readonly />
    </el-drawer>
  </div>
</template>

<script setup name="YyReport" lang="ts">
import {
  addYyReportSnapshot,
  delYyReportSnapshot,
  getYyReportSnapshot,
  listYyReportSnapshot,
  updateYyReportSnapshot
} from '@/api/yy/reportSnapshot';
import type { YyReportSnapshotForm, YyReportSnapshotQuery, YyReportSnapshotVO } from '@/api/yy/reportSnapshot/types';
import { getOptionLabel, getOptionType, reportTypeOptions } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const snapshotList = ref<YyReportSnapshotVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const detailVisible = ref(false);
const detail = ref<YyReportSnapshotVO>();

const queryFormRef = ref<ElFormInstance>();
const snapshotFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyReportSnapshotForm = {
  id: undefined,
  storeId: '',
  reportDate: '',
  reportType: 'DAILY',
  orderTotal: 0,
  arrivedTotal: 0,
  completedTotal: 0,
  revenueTotal: 0,
  selectionTotal: 0,
  sourceSummary: '',
  remark: ''
};

const data = reactive<PageData<YyReportSnapshotForm, YyReportSnapshotQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: '',
    reportDate: '',
    reportType: ''
  },
  rules: {
    reportDate: [{ required: true, message: '报表日期不能为空', trigger: 'change' }],
    reportType: [{ required: true, message: '报表类型不能为空', trigger: 'change' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const summary = computed(() => {
  return snapshotList.value.reduce(
    (acc, item) => {
      acc.orderTotal += Number(item.orderTotal || 0);
      acc.revenueTotal += Number(item.revenueTotal || 0);
      acc.selectionTotal += Number(item.selectionTotal || 0);
      return acc;
    },
    { orderTotal: 0, revenueTotal: 0, selectionTotal: 0 }
  );
});

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyReportSnapshot({ ...queryParams.value })) as any;
    snapshotList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? snapshotList.value.length;
  } finally {
    loading.value = false;
  }
};

const formatMoney = (value?: number | string) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const formatDate = (value?: string) => {
  return value ? String(value).slice(0, 10) : '-';
};

const formatTime = (value?: string) => {
  return value ? proxy?.parseTime(value) : '-';
};

const completionRate = (row: Pick<YyReportSnapshotForm, 'orderTotal' | 'completedTotal'>) => {
  const totalCount = Number(row.orderTotal || 0);
  if (!totalCount) {
    return '0.0';
  }
  return ((Number(row.completedTotal || 0) / totalCount) * 100).toFixed(1);
};

const compactJson = (value?: string) => {
  if (!value) {
    return '-';
  }
  try {
    return Object.entries(JSON.parse(value))
      .map(([key, count]) => `${key}:${count}`)
      .join(' / ');
  } catch {
    return value;
  }
};

const prettyJson = (value?: string) => {
  if (!value) {
    return '';
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
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

const handleSelectionChange = (selection: YyReportSnapshotVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm };
  snapshotFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增报表快照';
};

const handleUpdate = async (row?: YyReportSnapshotVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyReportSnapshot(id);
  Object.assign(form.value, res.data, { reportDate: formatDate(res.data?.reportDate) });
  dialog.visible = true;
  dialog.title = '修改报表快照';
};

const submitForm = () => {
  snapshotFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyReportSnapshot(form.value) : await addYyReportSnapshot(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyReportSnapshotVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除报表快照 ${deleteIds}？`);
  await delYyReportSnapshot(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/reportSnapshot/export', { ...queryParams.value }, `yy_report_snapshot_${new Date().getTime()}.xlsx`);
};

const handleDetail = async (row: YyReportSnapshotVO) => {
  const res = await getYyReportSnapshot(row.id);
  detail.value = res.data;
  detailVisible.value = true;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.yy-report-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #eff6ff 100%);
}

.yy-report-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(82px, 1fr));
  gap: 8px;
  min-width: 310px;
}

.yy-report-kpi {
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: rgb(255 255 255 / 70%);
}

.yy-report-kpi span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.yy-report-kpi strong {
  display: block;
  margin-top: 4px;
  font-size: 18px;
  color: #0f172a;
}

@media (max-width: 768px) {
  .yy-report-hero {
    flex-direction: column;
  }

  .yy-report-kpis {
    width: 100%;
    min-width: 0;
  }
}
</style>
