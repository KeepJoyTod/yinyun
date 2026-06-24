<template>
  <div class="p-2">
    <el-card shadow="never" class="mb-[10px]">
      <div class="yy-inventory-head">
        <div>
          <div class="yy-inventory-title">时段库存账本</div>
          <div class="yy-inventory-subtitle">支付成功后扣减本地库存；已支付但满员的订单会进入库存冲突，优先人工改期。</div>
        </div>
        <div class="yy-inventory-actions">
          <el-button type="danger" plain icon="Bell" :disabled="loading" @click="showConflicts">只看冲突</el-button>
          <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
        </div>
      </div>

      <div class="yy-inventory-metrics">
        <div class="yy-inventory-metric">
          <span>当前页时段</span>
          <strong>{{ inventoryList.length }}</strong>
          <small>筛选后共 {{ total }} 条</small>
        </div>
        <div class="yy-inventory-metric">
          <span>剩余容量</span>
          <strong>{{ availableCount }}</strong>
          <small>容量 - 已确认</small>
        </div>
        <div class="yy-inventory-metric is-danger">
          <span>库存冲突</span>
          <strong>{{ conflictCount }}</strong>
          <small>需改期或扩容</small>
        </div>
        <div class="yy-inventory-metric">
          <span>平均占用率</span>
          <strong>{{ averageOccupancyRate }}%</strong>
          <small>当前页统计</small>
        </div>
      </div>
    </el-card>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="门店" prop="storeId">
              <el-select v-model="queryParams.storeId" placeholder="全部门店" clearable class="!w-[180px]" @change="loadServiceGroupOptions">
                <el-option v-for="store in storeOptions" :key="store.id" :label="store.storeName" :value="store.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="服务组" prop="serviceGroupId">
              <el-select v-model="queryParams.serviceGroupId" placeholder="全部服务组" clearable class="!w-[190px]">
                <el-option v-for="item in serviceGroupOptions" :key="item.id" :label="item.groupName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期" class="!w-[270px]">
              <el-date-picker
                v-model="bizDateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="!w-[130px]">
                <el-option v-for="item in bookingInventoryStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="外部SKU" prop="externalSkuId">
              <el-input v-model="queryParams.externalSkuId" placeholder="抖音 SKU" clearable class="!w-[160px]" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" :loading="loading" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" :disabled="loading" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:bookingInventory:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Bell" :type="queryParams.conflictOnly === '1' ? 'danger' : undefined" @click="showConflicts">
              只看冲突
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe :data="inventoryList">
        <el-table-column label="门店" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ getStoreName(scope.row.storeId) }}</template>
        </el-table-column>
        <el-table-column label="服务组" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ getServiceGroupName(scope.row.serviceGroupId) }}</template>
        </el-table-column>
        <el-table-column label="外部SKU" prop="externalSkuId" min-width="150" show-overflow-tooltip />
        <el-table-column label="日期" prop="bizDate" width="120" />
        <el-table-column label="时段" width="130">
          <template #default="scope">{{ scope.row.startTime }} - {{ scope.row.endTime }}</template>
        </el-table-column>
        <el-table-column label="容量" prop="capacity" width="90" />
        <el-table-column label="已确认" prop="paidCount" width="90" />
        <el-table-column label="剩余" width="90">
          <template #default="scope">{{ getAvailable(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="库存冲突" prop="conflictCount" width="110">
          <template #default="scope">
            <el-tag :type="Number(scope.row.conflictCount || 0) > 0 ? 'danger' : 'success'" effect="plain">
              {{ Number(scope.row.conflictCount || 0) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="占用率" min-width="160">
          <template #default="scope">
            <el-progress :percentage="getOccupancyRate(scope.row)" :status="getProgressStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getOptionType(bookingInventoryStatusOptions, scope.row.status)">
              {{ getOptionLabel(bookingInventoryStatusOptions, scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-tooltip content="调整容量" placement="top">
              <el-button v-hasPermi="['yy:bookingInventory:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="查看冲突订单" placement="top">
              <el-button link type="danger" icon="Tickets" @click="openConflictOrders(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" title="调整容量" width="520px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-alert
          class="mb-3"
          type="info"
          :closable="false"
          show-icon
          title="容量不能小于已确认订单数；若客户已支付但库存冲突，优先在订单页人工改期。"
        />
        <el-form-item label="当前时段">
          <span>{{ editingSlotText }}</span>
        </el-form-item>
        <el-form-item label="已确认">
          <span>{{ editingPaidCount }} 单</span>
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="form.capacity" :min="editingPaidCount" :max="999" controls-position="right" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="item in bookingInventoryStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="例如：临时加班扩容，或暂停该时段继续接单" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
          <el-button @click="dialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="YyBookingInventory" lang="ts">
import { listYyBookingSlotInventory, updateYyBookingSlotInventory } from '@/api/yy/bookingSlotInventory';
import type { YyBookingSlotInventoryForm, YyBookingSlotInventoryQuery, YyBookingSlotInventoryVO } from '@/api/yy/bookingSlotInventory/types';
import { listYyServiceGroup } from '@/api/yy/serviceGroup';
import type { YyServiceGroupVO } from '@/api/yy/serviceGroup/types';
import { listYyStore } from '@/api/yy/store';
import type { YyStoreVO } from '@/api/yy/store/types';
import { getOptionLabel, getOptionType } from '@/views/yy/components/options';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const bookingInventoryStatusOptions = [
  { label: '启用', value: 'ACTIVE', type: 'success' },
  { label: '暂停', value: 'PAUSED', type: 'warning' }
];

const inventoryList = ref<YyBookingSlotInventoryVO[]>([]);
const storeOptions = ref<YyStoreVO[]>([]);
const serviceGroupOptions = ref<YyServiceGroupVO[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const bizDateRange = ref<string[]>([]);
const currentRow = ref<YyBookingSlotInventoryVO>();
const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initForm: YyBookingSlotInventoryForm = {
  id: undefined,
  capacity: 1,
  status: 'ACTIVE',
  remark: ''
};

const data = reactive<PageData<YyBookingSlotInventoryForm, YyBookingSlotInventoryQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    serviceGroupId: undefined,
    externalSkuId: '',
    beginBizDate: '',
    endBizDate: '',
    status: '',
    conflictOnly: ''
  },
  rules: {
    capacity: [{ required: true, message: '容量不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const normalizeRows = <T>(res: any): T[] => res?.rows ?? res?.data ?? [];

const getAvailable = (row: YyBookingSlotInventoryVO) => Math.max(Number(row.capacity || 0) - Number(row.paidCount || 0), 0);
const getOccupancyRate = (row: YyBookingSlotInventoryVO) => {
  const capacity = Number(row.capacity || 0);
  if (capacity <= 0) {
    return 0;
  }
  return Math.min(Math.round((Number(row.paidCount || 0) / capacity) * 100), 100);
};
const getProgressStatus = (row: YyBookingSlotInventoryVO) => {
  if (Number(row.conflictCount || 0) > 0) {
    return 'exception';
  }
  if (getOccupancyRate(row) >= 90) {
    return 'warning';
  }
  return undefined;
};

const availableCount = computed(() => inventoryList.value.reduce((sum, item) => sum + getAvailable(item), 0));
const conflictCount = computed(() => inventoryList.value.reduce((sum, item) => sum + Number(item.conflictCount || 0), 0));
const averageOccupancyRate = computed(() => {
  if (!inventoryList.value.length) {
    return 0;
  }
  const totalRate = inventoryList.value.reduce((sum, item) => sum + getOccupancyRate(item), 0);
  return Math.round(totalRate / inventoryList.value.length);
});
const editingPaidCount = computed(() => Number(currentRow.value?.paidCount || 0));
const editingSlotText = computed(() => {
  if (!currentRow.value) {
    return '-';
  }
  return `${currentRow.value.bizDate} ${currentRow.value.startTime}-${currentRow.value.endTime}`;
});

const getStoreName = (storeId?: string | number) => {
  const store = storeOptions.value.find((item) => String(item.id) === String(storeId));
  return store?.storeName ?? (storeId ? `门店ID ${storeId}` : '-');
};

const getServiceGroupName = (serviceGroupId?: string | number) => {
  const group = serviceGroupOptions.value.find((item) => String(item.id) === String(serviceGroupId));
  return group?.groupName ?? (serviceGroupId ? `服务组ID ${serviceGroupId}` : '-');
};

const buildQuery = () => {
  const query: YyBookingSlotInventoryQuery = { ...queryParams.value };
  query.beginBizDate = bizDateRange.value?.[0] || '';
  query.endBizDate = bizDateRange.value?.[1] || '';
  return query;
};

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyBookingSlotInventory(buildQuery())) as any;
    inventoryList.value = normalizeRows<YyBookingSlotInventoryVO>(res);
    total.value = res.total ?? inventoryList.value.length;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  bizDateRange.value = [];
  queryFormRef.value?.resetFields();
  queryParams.value.conflictOnly = '';
  handleQuery();
};

const showConflicts = () => {
  queryParams.value.status = 'ACTIVE';
  queryParams.value.conflictOnly = '1';
  handleQuery();
};

const handleExport = () => {
  proxy?.download('yy/bookingSlotInventory/export', buildQuery(), `yy_booking_inventory_${new Date().getTime()}.xlsx`);
};

const handleUpdate = (row: YyBookingSlotInventoryVO) => {
  currentRow.value = row;
  form.value = {
    id: row.id,
    capacity: Number(row.capacity || 0),
    status: row.status || 'ACTIVE',
    remark: row.remark || ''
  };
  dialog.visible = true;
};

const submitForm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      await updateYyBookingSlotInventory(form.value);
      ElMessage.success('库存容量已更新');
      dialog.visible = false;
      await getList();
    } finally {
      submitLoading.value = false;
    }
  });
};

const openConflictOrders = (row: YyBookingSlotInventoryVO) => {
  router.push({
    path: '/yy/order',
    query: {
      inventorySlotId: String(row.id),
      inventoryStatus: 'CONFLICT'
    }
  });
};

const loadStoreOptions = async () => {
  const res = await listYyStore({ pageNum: 1, pageSize: 200 });
  storeOptions.value = normalizeRows<YyStoreVO>(res);
};

const loadServiceGroupOptions = async () => {
  const res = await listYyServiceGroup({
    pageNum: 1,
    pageSize: 200,
    storeId: queryParams.value.storeId || undefined
  });
  serviceGroupOptions.value = normalizeRows<YyServiceGroupVO>(res);
};

onMounted(async () => {
  await Promise.all([loadStoreOptions(), loadServiceGroupOptions()]);
  await getList();
});
</script>

<style scoped>
.yy-inventory-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.yy-inventory-title {
  font-size: 18px;
  font-weight: 650;
  color: #0f172a;
}

.yy-inventory-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.yy-inventory-actions {
  display: flex;
  gap: 8px;
}

.yy-inventory-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.yy-inventory-metric {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f8fafc;
}

.yy-inventory-metric span,
.yy-inventory-metric small {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.yy-inventory-metric strong {
  display: block;
  margin: 4px 0;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.1;
}

.yy-inventory-metric.is-danger strong {
  color: #dc2626;
}

@media (max-width: 900px) {
  .yy-inventory-head {
    flex-direction: column;
  }

  .yy-inventory-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
