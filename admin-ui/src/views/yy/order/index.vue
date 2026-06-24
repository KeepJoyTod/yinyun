<template>
  <div class="p-2">
    <el-card shadow="never" class="yy-order-overview">
      <div class="yy-order-overview-head">
        <div>
          <div class="yy-order-overview-title">订单运营工作台</div>
          <div class="yy-order-overview-subtitle">统一查看预约订单、抖音同步状态和客户取片排障入口。</div>
        </div>
        <div class="yy-order-overview-tags">
          <el-tag effect="plain">{{ orderOverviewSourceLabel }}</el-tag>
          <el-tag :type="orderOverviewSyncType" effect="plain">抖音同步：{{ orderOverviewSyncLabel }}</el-tag>
        </div>
      </div>

      <div class="yy-order-overview-grid">
        <div class="yy-order-metric">
          <span class="yy-order-metric-label">订单</span>
          <strong>{{ orderOverviewTotalText }}</strong>
          <span class="yy-order-metric-copy">{{ orderOverviewFilterSummary }}</span>
        </div>
        <div class="yy-order-metric">
          <span class="yy-order-metric-label">待处理</span>
          <strong>{{ orderPendingCount }}</strong>
          <span class="yy-order-metric-copy">待确认 / 已确认</span>
        </div>
        <div class="yy-order-metric">
          <span class="yy-order-metric-label">进行中</span>
          <strong>{{ orderActiveCount }}</strong>
          <span class="yy-order-metric-copy">已到店 / 服务中</span>
        </div>
        <div class="yy-order-metric">
          <span class="yy-order-metric-label">已完成</span>
          <strong>{{ orderCompletedCount }}</strong>
          <span class="yy-order-metric-copy">当前页完成订单</span>
        </div>
      </div>

      <div class="yy-order-overview-notes">
        <div>
          <span>抖音同步</span>
          <strong>{{ orderOverviewDouyinText }}</strong>
          <small>{{ syncResultSummary || '可同步近24小时或近7天，失败时优先看 logid 和错误摘要。' }}</small>
        </div>
        <div>
          <span>取片排障</span>
          <strong>{{ orderOverviewPhotoText }}</strong>
          <small>{{ orderOverviewPhotoIssueText }}</small>
        </div>
      </div>

      <div class="yy-order-action-guide">
        <div class="yy-order-action-guide-head">
          <div>
            <span>交付处理顺序</span>
            <strong>按订单到账、相册可交付、客户取片三个动作推进</strong>
          </div>
          <small>表格行内可生成相册、上传照片、复制取片说明。</small>
        </div>
        <div class="yy-order-action-steps">
          <div class="yy-order-action-step">
            <span class="yy-order-action-index">01</span>
            <div class="yy-order-action-copy">
              <strong>先同步订单</strong>
              <small>把抖音来客近 24 小时订单拉回本地，再处理取片。</small>
            </div>
            <el-button size="small" type="primary" plain :loading="syncLoading && syncRange === '24h'" :disabled="syncLoading" @click="syncDouyinOrders(1)">
              同步近24小时
            </el-button>
          </div>
          <div class="yy-order-action-step">
            <span class="yy-order-action-index">02</span>
            <div class="yy-order-action-copy">
              <strong>再筛不可交付</strong>
              <small>先处理缺手机号、无相册、无可见照片和缺 OSS Key 的订单。</small>
            </div>
            <el-button size="small" plain icon="Warning" :type="isPhotoDeliveryIssueFilterActive ? 'warning' : 'info'" @click="showPhotoDeliveryIssues">
              只看不可交付
            </el-button>
          </div>
          <div class="yy-order-action-step">
            <span class="yy-order-action-index">03</span>
            <div class="yy-order-action-copy">
              <strong>最后发取片入口</strong>
              <small>相册和照片确认后，在订单行上传照片或复制取片说明发给客户。</small>
            </div>
            <div class="yy-order-action-tip">行内按钮会调用 copyOrderPickupShareText 生成客户话术</div>
          </div>
        </div>
      </div>
    </el-card>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="queryParams.keyword" placeholder="订单号/姓名/手机/外部单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="queryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="来源" prop="source">
              <el-select v-model="queryParams.source" placeholder="订单来源" clearable class="!w-[140px]">
                <el-option v-for="item in orderSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="方式" prop="bookingMethod">
              <el-select v-model="queryParams.bookingMethod" placeholder="预约方式" clearable class="!w-[140px]">
                <el-option v-for="item in bookingMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="订单状态" clearable class="!w-[140px]">
                <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="外部状态" prop="externalStatus">
              <el-input v-model="queryParams.externalStatus" placeholder="如 PAY_SUCCESS" clearable class="!w-[150px]" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="同步状态" prop="syncStatus">
              <el-select v-model="queryParams.syncStatus" placeholder="同步状态" clearable class="!w-[140px]">
                <el-option v-for="item in syncStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="库存状态" prop="inventoryStatus">
              <el-select v-model="queryParams.inventoryStatus" placeholder="库存状态" clearable class="!w-[140px]">
                <el-option v-for="item in inventoryStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="下单时间" class="!w-[330px]">
              <el-date-picker
                v-model="orderRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <el-form-item label="到店时间" class="!w-[330px]">
              <el-date-picker
                v-model="arrivalRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
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
            <el-button v-hasPermi="['yy:order:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:order:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:order:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['yy:order:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Refresh"
              :loading="syncLoading && syncRange === '24h'"
              :disabled="syncLoading"
              @click="syncDouyinOrders(1)"
              >同步近24小时抖音订单</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Calendar"
              :loading="syncLoading && syncRange === '7d'"
              :disabled="syncLoading"
              @click="syncDouyinOrders(7)"
              >同步近7天抖音订单</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Filter" :type="queryParams.source === 'DOUYIN_LIFE' ? 'primary' : undefined" @click="showDouyinOrders"
              >只看抖音订单</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Warning" :type="isPhotoDeliveryIssueFilterActive ? 'warning' : undefined" @click="showPhotoDeliveryIssues"
              >只看不可交付</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button icon="Bell" :type="queryParams.inventoryStatus === 'CONFLICT' ? 'danger' : undefined" @click="showInventoryConflicts"
              >只看库存冲突</el-button
            >
          </el-col>
          <el-col v-if="isPhotoDeliveryIssueFilterActive" :span="1.5">
            <el-button icon="Close" @click="clearPhotoDeliveryIssues">取消不可交付筛选</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-alert
        v-if="syncResult"
        class="mb-3"
        :title="syncResultSummary"
        :description="syncResultDescription"
        :type="syncResultAlertType"
        :closable="false"
        show-icon
      />

      <el-table v-loading="loading" border stripe :data="orderList" :empty-text="orderEmptyText" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="订单编号" prop="orderNo" min-width="150" fixed="left" show-overflow-tooltip />
        <el-table-column label="客户" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <div class="font-medium">{{ scope.row.customerName || '-' }}</div>
            <div class="text-xs text-gray-400">{{ maskPhone(scope.row.customerPhone) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="门店ID" prop="storeId" width="110" />
        <el-table-column label="来源" width="100">
          <template #default="scope">
            <el-tag :type="getOptionType(orderSourceOptions, scope.row.source)">{{ getOptionLabel(orderSourceOptions, scope.row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预约方式" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(bookingMethodOptions, scope.row.bookingMethod)" effect="plain">
              {{ getOptionLabel(bookingMethodOptions, scope.row.bookingMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="orderTime" min-width="160" />
        <el-table-column label="到店时间" prop="arrivalTime" min-width="160" />
        <el-table-column label="状态" width="105" fixed="right">
          <template #default="scope">
            <el-tag :type="getOptionType(orderStatusOptions, scope.row.status)">
              {{ getOptionLabel(orderStatusOptions, scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工位" prop="workstationNo" width="90" />
        <el-table-column label="外部订单号" prop="externalOrderId" min-width="150" show-overflow-tooltip />
        <el-table-column label="外部状态" prop="externalStatus" width="120">
          <template #default="scope">{{ scope.row.externalStatus || '-' }}</template>
        </el-table-column>
        <el-table-column label="同步状态" width="110">
          <template #default="scope">
            <el-tag :type="getOptionType(syncStatusOptions, scope.row.syncStatus)" effect="plain">
              {{ getOptionLabel(syncStatusOptions, scope.row.syncStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="130">
          <template #default="scope">
            <el-tooltip :content="scope.row.conflictReason || buildInventoryStatusHint(scope.row)" placement="top">
              <el-tag :type="getOptionType(inventoryStatusOptions, scope.row.inventoryStatus)" effect="plain">
                {{ getOptionLabel(inventoryStatusOptions, scope.row.inventoryStatus) }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="预约时段" min-width="150" show-overflow-tooltip>
          <template #default="scope">{{ buildOrderSlotText(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="取片状态" width="135">
          <template #default="scope">
            <div class="yy-order-photo-status" :class="getPhotoStatusClass(scope.row)">
              <el-tooltip :content="buildPhotoStatusHint(scope.row)" placement="top">
                <el-tag :type="getPhotoStatusType(scope.row)" effect="plain">
                  {{ getPhotoStatusLabel(scope.row) }}
                </el-tag>
              </el-tooltip>
              <span>{{ getPhotoStatusDescription(scope.row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" />
            </el-tooltip>
            <el-tooltip content="生成相册" placement="top">
              <el-button
                v-hasPermi="['yy:photoAlbum:add']"
                link
                type="success"
                icon="FolderAdd"
                :loading="repairingAlbumOrderId === scope.row.id"
                @click="repairPhotoAlbumPlaceholder(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="跳相册" placement="top">
              <el-button link type="primary" icon="Collection" @click="openPhotoWorkbench(scope.row)" />
            </el-tooltip>
            <el-tooltip content="上传照片" placement="top">
              <el-button
                link
                type="warning"
                icon="Upload"
                :loading="uploadingAlbumOrderId === scope.row.id"
                @click="openPhotoWorkbenchForUpload(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="打开取片入口" placement="top">
              <el-button
                link
                type="primary"
                icon="Link"
                :loading="sharingAlbumOrderId === scope.row.id"
                @click="openPhotoWorkbenchForPickupEntry(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="复制取片说明" placement="top">
              <el-button
                link
                type="primary"
                icon="CopyDocument"
                :loading="sharingAlbumOrderId === scope.row.id"
                @click="copyOrderPickupShareText(scope.row)"
              />
            </el-tooltip>
            <el-dropdown trigger="click" :disabled="sharingAlbumOrderId === scope.row.id">
              <el-button link type="primary" icon="Share" :disabled="sharingAlbumOrderId === scope.row.id" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="copyOrderPickupChannelShareText(scope.row, 'H5 网页')">复制 H5 话术</el-dropdown-item>
                  <el-dropdown-item @click="copyOrderPickupChannelShareText(scope.row, '微信小程序')">复制微信话术</el-dropdown-item>
                  <el-dropdown-item @click="copyOrderPickupChannelShareText(scope.row, '抖音小程序')">复制抖音话术</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip content="取片排障" placement="top">
              <el-button link type="success" icon="Picture" @click="handlePhotoTroubleshoot(scope.row)" />
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['yy:order:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-dropdown trigger="click" @command="(status: string) => handleStatusCommand(scope.row, status)">
              <el-button v-hasPermi="['yy:order:edit']" link type="primary" icon="Switch" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in orderStatusOptions"
                    :key="item.value"
                    :command="item.value"
                    :disabled="item.value === scope.row.status"
                  >
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['yy:order:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="860px" append-to-body>
      <el-form ref="orderFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="form.storeId" placeholder="请输入门店ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="customerPhone">
              <el-input v-model="form.customerPhone" placeholder="请输入客户手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="form.source" placeholder="请选择订单来源" class="w-full">
                <el-option v-for="item in orderSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约方式" prop="bookingMethod">
              <el-select v-model="form.bookingMethod" placeholder="请选择预约方式" class="w-full">
                <el-option v-for="item in bookingMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下单时间" prop="orderTime">
              <el-date-picker
                v-model="form.orderTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择下单时间"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到店时间" prop="arrivalTime">
              <el-date-picker
                v-model="form.arrivalTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择到店时间"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-divider content-position="left">预约库存</el-divider>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务组ID" prop="serviceGroupId">
              <el-input v-model="form.serviceGroupId" placeholder="用于本地时段库存" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="外部SKU" prop="externalSkuId">
              <el-input v-model="form.externalSkuId" placeholder="抖音/渠道库存 SKU，可为空" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预约日期" prop="slotDate">
              <el-date-picker v-model="form.slotDate" value-format="YYYY-MM-DD" type="date" placeholder="选择日期" class="w-full" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" prop="slotStartTime">
              <el-time-select
                v-model="form.slotStartTime"
                :start="timeSelectRange.start"
                :step="timeSelectRange.step"
                :end="timeSelectRange.end"
                placeholder="开始"
                class="w-full"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="slotEndTime">
              <el-time-select
                v-model="form.slotEndTime"
                :start="timeSelectRange.start"
                :step="timeSelectRange.step"
                :end="timeSelectRange.end"
                placeholder="结束"
                class="w-full"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存状态" prop="inventoryStatus">
              <el-select v-model="form.inventoryStatus" placeholder="保存后自动计算" class="w-full" disabled clearable>
                <el-option v-for="item in inventoryStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存槽ID" prop="inventorySlotId">
              <el-input v-model="form.inventorySlotId" placeholder="保存后自动关联" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择订单状态" class="w-full">
                <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工位" prop="workstationNo">
              <el-input v-model="form.workstationNo" placeholder="例如：A01" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="外部单号" prop="externalOrderId">
              <el-input v-model="form.externalOrderId" placeholder="抖音/美团等外部订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注、取消原因或服务说明" />
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

    <el-drawer v-model="detailVisible" title="预约订单详情" size="520px" append-to-body>
      <el-alert
        v-if="detail"
        class="mb-3"
        type="success"
        :closable="false"
        show-icon
        title="取片排障入口"
        :description="buildPhotoTroubleshootHint(detail)"
      />
      <div v-if="detail" class="yy-order-photo-actions mb-3">
        <el-button type="primary" plain icon="Picture" @click="openPhotoWorkbench(detail)">按订单查相册</el-button>
        <el-button
          v-hasPermi="['yy:photoAlbum:add']"
          type="success"
          plain
          icon="FolderAdd"
          :loading="repairingAlbumOrderId === detail.id"
          @click="repairPhotoAlbumPlaceholder(detail)"
          >生成/修复相册</el-button
        >
        <el-button type="success" plain icon="View" @click="openPhotoWorkbenchForAudit(detail)">按客户查访问审计</el-button>
        <el-button type="warning" plain icon="Upload" :loading="uploadingAlbumOrderId === detail.id" @click="openPhotoWorkbenchForUpload(detail)">上传照片</el-button>
        <el-button type="primary" plain icon="Link" :loading="sharingAlbumOrderId === detail.id" @click="openPhotoWorkbenchForPickupEntry(detail)"
          >打开取片入口</el-button
        >
        <el-button type="warning" plain icon="CopyDocument" :loading="sharingAlbumOrderId === detail.id" @click="copyOrderPickupShareText(detail)"
          >复制取片说明</el-button
        >
        <el-dropdown trigger="click" :disabled="sharingAlbumOrderId === detail.id">
          <el-button type="warning" plain icon="Share" :disabled="sharingAlbumOrderId === detail.id">分渠道话术</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="copyOrderPickupChannelShareText(detail, 'H5 网页')">复制 H5 话术</el-dropdown-item>
              <el-dropdown-item @click="copyOrderPickupChannelShareText(detail, '微信小程序')">复制微信话术</el-dropdown-item>
              <el-dropdown-item @click="copyOrderPickupChannelShareText(detail, '抖音小程序')">复制抖音话术</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-card v-if="detail" class="yy-order-photo-summary mb-3" shadow="never">
        <template #header>
          <div class="yy-order-photo-summary-head">
            <span>取片排障摘要</span>
            <el-button link type="primary" :loading="photoSummaryLoading" @click="loadPhotoTroubleshootSummary(detail)">刷新</el-button>
          </div>
        </template>
        <div v-if="photoSummaryLoading" class="yy-order-photo-summary-loading">正在查询相册、底片和访问审计...</div>
        <div v-else class="yy-order-photo-summary-grid">
          <div class="yy-order-photo-summary-item" :class="photoTroubleshootSummary.albumCount > 0 ? 'is-good' : 'is-warning'">
            <span class="yy-order-photo-summary-label">关联相册</span>
            <strong>{{ photoTroubleshootSummary.albumCount }}</strong>
            <small>{{ photoTroubleshootSummary.albumHint }}</small>
          </div>
          <div class="yy-order-photo-summary-item" :class="photoTroubleshootSummary.visibleAssetCount > 0 ? 'is-good' : 'is-warning'">
            <span class="yy-order-photo-summary-label">可见照片</span>
            <strong>{{ photoTroubleshootSummary.visibleAssetCount }}</strong>
            <small>{{ photoTroubleshootSummary.assetHint }}</small>
          </div>
          <div class="yy-order-photo-summary-item" :class="photoTroubleshootSummary.failedAccessCount > 0 ? 'is-warning' : 'is-good'">
            <span class="yy-order-photo-summary-label">访问失败</span>
            <strong>{{ photoTroubleshootSummary.failedAccessCount }}</strong>
            <small>{{ photoTroubleshootSummary.accessHint }}</small>
          </div>
        </div>
        <el-alert
          v-if="photoTroubleshootSummary.error"
          class="mt-3"
          type="warning"
          :closable="false"
          show-icon
          title="取片摘要查询失败"
          :description="photoTroubleshootSummary.error"
        />
        <el-alert
          v-else-if="!photoSummaryLoading && photoTroubleshootSummary.diagnosis"
          class="mt-3"
          :type="photoTroubleshootSummary.diagnosisType"
          :closable="false"
          show-icon
          title="下一步建议"
          :description="photoTroubleshootSummary.diagnosis"
        />
        <el-alert
          v-if="photoTroubleshootSummary.latestFailedRemark"
          class="mt-3"
          type="warning"
          :closable="false"
          show-icon
          title="最近失败记录"
          :description="photoTroubleshootSummary.latestFailedRemark"
        />
      </el-card>
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="订单编号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ detail.customerName || '-' }} / {{ maskPhone(detail.customerPhone) }}</el-descriptions-item>
        <el-descriptions-item label="门店ID">{{ detail.storeId }}</el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-tag :type="getOptionType(orderSourceOptions, detail.source)">{{ getOptionLabel(orderSourceOptions, detail.source) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约方式">{{ getOptionLabel(bookingMethodOptions, detail.bookingMethod) }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.orderTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="到店时间">{{ detail.arrivalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getOptionType(orderStatusOptions, detail.status)">{{ getOptionLabel(orderStatusOptions, detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工位">{{ detail.workstationNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="外部订单号">{{ detail.externalOrderId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="外部状态">{{ detail.externalStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="同步状态">{{ getOptionLabel(syncStatusOptions, detail.syncStatus) }}</el-descriptions-item>
        <el-descriptions-item label="库存状态">
          <el-tag :type="getOptionType(inventoryStatusOptions, detail.inventoryStatus)">
            {{ getOptionLabel(inventoryStatusOptions, detail.inventoryStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约时段">{{ buildOrderSlotText(detail) }}</el-descriptions-item>
        <el-descriptions-item label="库存冲突原因">{{ detail.conflictReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="YyOrder" lang="ts">
import { syncYyChannelOrders } from '@/api/yy/channel';
import type { YyChannelSyncResultVO } from '@/api/yy/channel/types';
import { addYyOrder, delYyOrder, getYyOrder, listYyOrder, repairYyOrderPhotoAlbumPlaceholder, updateYyOrder } from '@/api/yy/order';
import type { YyOrderForm, YyOrderQuery, YyOrderVO } from '@/api/yy/order/types';
import { listYyPhotoAccessLog } from '@/api/yy/photoAccessLog';
import type { YyPhotoAccessLogVO } from '@/api/yy/photoAccessLog/types';
import { listYyPhotoAlbum, listYyPhotoAlbumOperationsSummary } from '@/api/yy/photoAlbum';
import type { YyPhotoAlbumOperationsSummaryVO, YyPhotoAlbumVO } from '@/api/yy/photoAlbum/types';
import {
  bookingMethodOptions,
  getOptionLabel,
  getOptionType,
  inventoryStatusOptions,
  orderSourceOptions,
  orderStatusOptions,
  syncStatusOptions
} from '@/views/yy/components/options';
import { buildDouyinRecentSyncQuery, buildSyncResultMessage, isSyncSuccess, syncMessageType } from '@/views/yy/utils/douyinLife';
import { buildPickupChannelShareText, buildPickupH5EntryUrl, buildPickupShareText, resolveAlbumPickupCode } from '@/views/yy/utils/photoPickupEntry';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const route = useRoute();

const orderList = ref<YyOrderVO[]>([]);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const orderRange = ref<string[]>([]);
const arrivalRange = ref<string[]>([]);
const detailVisible = ref(false);
const detail = ref<YyOrderVO>();
const syncLoading = ref(false);
const syncRange = ref('');
const syncResult = ref<YyChannelSyncResultVO>();
const repairingAlbumOrderId = ref<string | number>('');
const uploadingAlbumOrderId = ref<string | number>('');
const sharingAlbumOrderId = ref<string | number>('');
const photoSummaryLoading = ref(false);
const photoTroubleshootSummary = ref({
  albumCount: 0,
  visibleAssetCount: 0,
  failedAccessCount: 0,
  albumHint: '未查询',
  assetHint: '未查询',
  accessHint: '未查询',
  latestFailedRemark: '',
  diagnosis: '',
  diagnosisType: 'info' as 'success' | 'warning' | 'info' | 'error',
  error: ''
});

const queryFormRef = ref<ElFormInstance>();
const orderFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const timeSelectRange = {
  start: '00:00',
  step: '00:30',
  end: '23:30'
};

const initForm: YyOrderForm = {
  id: undefined,
  storeId: '',
  orderNo: '',
  customerName: '',
  customerPhone: '',
  source: 'LOCAL',
  bookingMethod: 'MANUAL',
  orderTime: '',
  arrivalTime: '',
  status: 'PENDING',
  workstationNo: '',
  externalOrderId: '',
  externalSkuId: '',
  serviceGroupId: '',
  inventorySlotId: '',
  slotDate: '',
  slotStartTime: '',
  slotEndTime: '',
  inventoryStatus: '',
  conflictReason: '',
  remark: ''
};

const data = reactive<PageData<YyOrderForm, YyOrderQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    storeId: undefined,
    source: '',
    bookingMethod: '',
    status: '',
    externalStatus: '',
    syncStatus: '',
    inventoryStatus: '',
    photoDeliveryIssueOnly: ''
  },
  rules: {
    storeId: [{ required: true, message: '门店ID不能为空', trigger: 'blur' }],
    orderNo: [{ required: true, message: '订单编号不能为空', trigger: 'blur' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const countOrdersByStatus = (statuses: string[]) => {
  const statusSet = new Set(statuses);
  return orderList.value.filter((item) => statusSet.has(String(item.status || ''))).length;
};

const syncResultSummary = computed(() => (syncResult.value ? buildSyncResultMessage(syncResult.value) : ''));
const syncResultAlertType = computed(() => (syncResult.value ? syncMessageType(syncResult.value) : 'info'));
const syncResultDescription = computed(() => {
  if (!syncResult.value) {
    return '';
  }
  if (syncResult.value.syncStatus === 'FAILED') {
    return '同步失败时优先看最近 logid 和错误摘要；抖音能力仍接入中时，平台可能返回“应用未获得该能力”。';
  }
  return '订单已写入本地订单和渠道映射，微信/H5 端只读取本地订单状态。';
});
const orderEmptyText = computed(() => {
  if (queryParams.value.source === 'DOUYIN_LIFE') {
    return '暂无抖音订单；确认订单查询能力解除限流后，先同步近24小时或近7天。';
  }
  return '暂无预约订单；可新增本地订单，或从抖音/美团渠道同步。';
});
const orderPendingCount = computed(() => countOrdersByStatus(['PENDING', 'CONFIRMED']));
const orderActiveCount = computed(() => countOrdersByStatus(['ARRIVED', 'SERVING']));
const orderCompletedCount = computed(() => countOrdersByStatus(['COMPLETED']));
const orderOverviewTotalText = computed(() => {
  const currentPageCount = orderList.value.length;
  return total.value > currentPageCount ? `${currentPageCount} / ${total.value}` : String(currentPageCount);
});
const orderOverviewSourceLabel = computed(() => {
  if (!queryParams.value.source) {
    return '全部来源';
  }
  return getOptionLabel(orderSourceOptions, queryParams.value.source);
});
const orderOverviewFilterSummary = computed(() => {
  const filters = [
    queryParams.value.keyword ? '关键字' : '',
    queryParams.value.storeId ? `门店 ${queryParams.value.storeId}` : '',
    queryParams.value.status ? getOptionLabel(orderStatusOptions, queryParams.value.status) : '',
    queryParams.value.externalStatus ? `外部 ${queryParams.value.externalStatus}` : '',
    queryParams.value.syncStatus ? getOptionLabel(syncStatusOptions, queryParams.value.syncStatus) : '',
    queryParams.value.inventoryStatus ? getOptionLabel(inventoryStatusOptions, queryParams.value.inventoryStatus) : '',
    orderRange.value?.length ? '下单时间' : '',
    arrivalRange.value?.length ? '到店时间' : ''
  ].filter(Boolean);
  return filters.length ? filters.join(' / ') : '当前无额外筛选';
});
const orderOverviewSyncType = computed(() => {
  if (!syncResult.value) {
    return queryParams.value.source === 'DOUYIN_LIFE' ? 'warning' : 'info';
  }
  return syncResultAlertType.value;
});
const orderOverviewSyncLabel = computed(() => {
  if (!syncResult.value) {
    return queryParams.value.source === 'DOUYIN_LIFE' ? '待同步' : '未筛抖音';
  }
  return isSyncSuccess(syncResult.value) ? '正常' : '需排查';
});
const orderOverviewDouyinText = computed(() => {
  const douyinCount = orderList.value.filter((item) => item.source === 'DOUYIN_LIFE').length;
  if (queryParams.value.source === 'DOUYIN_LIFE') {
    return `当前页 ${douyinCount} 单`;
  }
  return douyinCount ? `当前页含 ${douyinCount} 单` : '未筛抖音订单';
});
const orderOverviewPhotoText = computed(() => {
  const customerCount = orderList.value.filter((item) => item.customerPhone).length;
  if (!orderList.value.length) {
    return '等待订单';
  }
  return `${customerCount} 单可按手机号排查`;
});
const isPhotoDeliveryIssueFilterActive = computed(() => queryParams.value.photoDeliveryIssueOnly === '1');
const orderOverviewPhotoIssueText = computed(() => {
  if (isPhotoDeliveryIssueFilterActive.value) {
    return '当前只看缺手机号、无相册、无可见照片或缺 OSS Key 的订单。';
  }
  return '订单行可直接跳相册、上传照片、复制取片说明或打开详情排障，按订单查相册、按手机号查访问审计。';
});
const pickupEntryUrl = computed(() => buildPickupH5EntryUrl(import.meta.env.VITE_APP_PHOTO_PICKUP_H5_URL));

const buildQuery = () => {
  const query: YyOrderQuery = { ...queryParams.value };
  query.beginOrderTime = orderRange.value?.[0];
  query.endOrderTime = orderRange.value?.[1];
  query.beginArrivalTime = arrivalRange.value?.[0];
  query.endArrivalTime = arrivalRange.value?.[1];
  return query;
};

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listYyOrder(buildQuery())) as any;
    orderList.value = res.rows ?? res.data ?? [];
    total.value = res.total ?? orderList.value.length;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  orderRange.value = [];
  arrivalRange.value = [];
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: YyOrderVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const reset = () => {
  form.value = { ...initForm, orderNo: `YY${Date.now()}` };
  orderFormRef.value?.resetFields();
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增预约订单';
};

const handleUpdate = async (row?: YyOrderVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getYyOrder(id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改预约订单';
};

const submitForm = () => {
  orderFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateYyOrder(form.value) : await addYyOrder(form.value);
    proxy?.$modal.msgSuccess('保存成功');
    dialog.visible = false;
    getList();
  });
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleDelete = async (row?: YyOrderVO) => {
  const deleteIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除预约订单 ${deleteIds}？`);
  await delYyOrder(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

const handleExport = () => {
  proxy?.download('yy/order/export', buildQuery(), `yy_order_${new Date().getTime()}.xlsx`);
};

const syncDouyinOrders = async (days: number) => {
  syncLoading.value = true;
  syncRange.value = days === 1 ? '24h' : '7d';
  try {
    const res = await syncYyChannelOrders(
      'DOUYIN_LIFE',
      buildDouyinRecentSyncQuery(days, {
        storeId: queryParams.value.storeId || undefined
      })
    );
    const data = res.data;
    syncResult.value = data;
    const summary = buildSyncResultMessage(data);
    if (isSyncSuccess(data)) {
      ElMessage.success(summary);
    } else {
      ElMessage.warning(summary);
    }
    if (data.total > 0 || data.created > 0 || data.updated > 0) {
      queryParams.value.source = 'DOUYIN_LIFE';
    }
    await getList();
  } finally {
    syncLoading.value = false;
    syncRange.value = '';
  }
};

const showDouyinOrders = () => {
  queryParams.value.source = 'DOUYIN_LIFE';
  handleQuery();
};

const showPhotoDeliveryIssues = () => {
  queryParams.value.photoDeliveryIssueOnly = '1';
  handleQuery();
};

const clearPhotoDeliveryIssues = () => {
  queryParams.value.photoDeliveryIssueOnly = '';
  handleQuery();
};

const showInventoryConflicts = () => {
  queryParams.value.inventoryStatus = 'CONFLICT';
  handleQuery();
};

const buildOrderSlotText = (row?: YyOrderVO) => {
  if (!row) {
    return '-';
  }
  const date = row.slotDate || '';
  const start = row.slotStartTime || '';
  const end = row.slotEndTime || '';
  if (date || start || end) {
    return [date, start && end ? `${start}-${end}` : start || end].filter(Boolean).join(' ');
  }
  return row.arrivalTime || '-';
};

const buildInventoryStatusHint = (row?: YyOrderVO) => {
  if (!row?.inventoryStatus) {
    return '未进入统一库存账本；历史订单或缺少完整预约时段时会出现这种状态。';
  }
  if (row.inventoryStatus === 'CONFIRMED') {
    return '支付成功后已扣减本地时段库存。';
  }
  if (row.inventoryStatus === 'CONFLICT') {
    return '客户已支付但本地时段库存已满，需要店员人工改期。';
  }
  if (row.inventoryStatus === 'RELEASED') {
    return '该订单曾确认库存，后续已释放。';
  }
  return '未参与库存扣减。';
};

const applyRouteQueryIntent = () => {
  const routeSource = route.query.source;
  const routeIntent = route.query.intent;
  const routeInventorySlotId = route.query.inventorySlotId;
  const routeInventoryStatus = route.query.inventoryStatus;
  if (routeSource) {
    queryParams.value.source = String(routeSource);
  }
  if (routeInventorySlotId) {
    queryParams.value.inventorySlotId = String(routeInventorySlotId);
  }
  if (routeInventoryStatus) {
    queryParams.value.inventoryStatus = String(routeInventoryStatus);
  }
  if (routeIntent === 'export') {
    showSearch.value = true;
    ElMessage.info('已筛选抖音来客订单，可确认同步状态后点击导出。');
  }
  if (routeInventorySlotId || routeInventoryStatus) {
    showSearch.value = true;
    ElMessage.info('已按库存时段筛选订单，可优先处理库存冲突。');
  }
};

const buildPhotoTroubleshootHint = (row: YyOrderVO) => {
  const keys = [`订单ID ${row.id}`];
  if (row.externalOrderId) {
    keys.push(`外部订单 ${row.externalOrderId}`);
  }
  if (row.customerPhone) {
    keys.push(`手机号 ${maskPhone(row.customerPhone)}`);
  }
  return `${keys.join(' / ')}。先到客片选片工作台按订单查相册，再看底片数量和访问审计。`;
};

const getPhotoAlbumCount = (row: YyOrderVO) => Number(row.photoAlbumCount || 0);
const getPhotoVisibleAssetCount = (row: YyOrderVO) => Number(row.photoVisibleAssetCount || 0);
const getPhotoMissingObjectKeyCount = (row: YyOrderVO) => Number(row.photoMissingObjectKeyCount || 0);

const getPhotoStatusLabel = (row: YyOrderVO) => {
  const albumCount = getPhotoAlbumCount(row);
  if (!row.customerPhone) {
    return '缺手机号';
  }
  if (albumCount <= 0) {
    return '待生成相册';
  }
  if (getPhotoVisibleAssetCount(row) <= 0) {
    return '待上传照片';
  }
  const missingObjectKeyCount = getPhotoMissingObjectKeyCount(row);
  if (missingObjectKeyCount > 0) {
    return `缺 Key ${missingObjectKeyCount}`;
  }
  return '可交付';
};

const getPhotoStatusType = (row: YyOrderVO) => {
  if (!row.customerPhone) {
    return 'danger';
  }
  if (getPhotoAlbumCount(row) <= 0 || getPhotoVisibleAssetCount(row) <= 0 || getPhotoMissingObjectKeyCount(row) > 0) {
    return 'warning';
  }
  return 'success';
};

const buildPhotoStatusHint = (row: YyOrderVO) => {
  const albumCount = getPhotoAlbumCount(row);
  const visibleAssetCount = getPhotoVisibleAssetCount(row);
  const missingObjectKeyCount = getPhotoMissingObjectKeyCount(row);
  if (!row.customerPhone) {
    return '订单缺客户手机号，无法自动生成客户取片相册。';
  }
  if (albumCount <= 0) {
    return '暂未关联相册，可同步抖音订单或到客片选片工作台手动创建。';
  }
  if (visibleAssetCount <= 0) {
    return `已关联 ${albumCount} 个相册，但没有客户可见照片。请上传照片并设为可见。`;
  }
  if (missingObjectKeyCount > 0) {
    return `已关联 ${albumCount} 个相册、${visibleAssetCount} 张可见照片，其中 ${missingObjectKeyCount} 张缺 OSS Key，客户可能打不开。`;
  }
  return `已关联 ${albumCount} 个相册、${visibleAssetCount} 张客户可见照片，可发送取片入口。`;
};

const getPhotoStatusDescription = (row: YyOrderVO) => {
  if (!row.customerPhone) {
    return '先补手机号';
  }
  if (getPhotoAlbumCount(row) <= 0) {
    return '无相册';
  }
  if (getPhotoVisibleAssetCount(row) <= 0) {
    return '无可见照片';
  }
  if (getPhotoMissingObjectKeyCount(row) > 0) {
    return `${getPhotoVisibleAssetCount(row)} 张可见`;
  }
  return `${getPhotoVisibleAssetCount(row)} 张可见`;
};

const getPhotoStatusClass = (row: YyOrderVO) => {
  if (getPhotoStatusType(row) === 'success') {
    return 'is-ready';
  }
  if (!row.customerPhone) {
    return 'is-blocked';
  }
  return 'is-warning';
};

const maskPhone = (value?: string | number) => {
  const text = String(value || '').trim();
  if (!text) {
    return '-';
  }
  const digits = text.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}****${digits.slice(7)}`;
  }
  return text.replace(/(\d{3})\d+(\d{2,4})/, '$1****$2');
};

const toPhotoQueryValue = (value?: string | number) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value);
};

const extractRows = <T>(res: any): T[] => {
  return res?.rows ?? res?.data ?? [];
};

const loadOrderPhotoAlbums = async (row: YyOrderVO) => {
  const albumRes = await listYyPhotoAlbum({
    pageNum: 1,
    pageSize: 20,
    storeId: row.storeId,
    orderId: row.id || row.externalOrderId || row.orderNo
  });
  return extractRows<YyPhotoAlbumVO>(albumRes);
};

const pickShareableAlbum = (albums: YyPhotoAlbumVO[]) => {
  return albums.find((album) => resolveAlbumPickupCode(album)) || albums[0];
};

const copyText = async (value?: string, successMessage = '已复制', failureMessage = '复制失败，请手动复制') => {
  const text = String(value || '').trim();
  if (!text) {
    proxy?.$modal.msgWarning('暂无可复制内容');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    proxy?.$modal.msgSuccess(successMessage);
  } catch {
    proxy?.$modal.msgWarning(failureMessage);
  }
};

const sumAlbumOperationsSummaries = (summaries: YyPhotoAlbumOperationsSummaryVO[]) => {
  return summaries.reduce(
    (total, item) => {
      total.visibleAssetCount += Number(item.visibleAssets ?? 0);
      total.missingObjectKeyCount += Number(item.missingObjectKeyAssets ?? 0);
      return total;
    },
    {
      visibleAssetCount: 0,
      missingObjectKeyCount: 0
    }
  );
};

const resetPhotoTroubleshootSummary = () => {
  photoTroubleshootSummary.value = {
    albumCount: 0,
    visibleAssetCount: 0,
    failedAccessCount: 0,
    albumHint: '未查询',
    assetHint: '未查询',
    accessHint: '未查询',
    latestFailedRemark: '',
    diagnosis: '',
    diagnosisType: 'info',
    error: ''
  };
};

const buildFailedAccessRemark = (log?: YyPhotoAccessLogVO) => {
  if (!log) {
    return '';
  }
  const createdAt = (log as any).createTime;
  return [
    log.platform ? `平台 ${log.platform}` : '',
    log.action ? `动作 ${log.action}` : '',
    createdAt ? `时间 ${createdAt}` : '',
    log.remark || '未返回失败原因'
  ]
    .filter(Boolean)
    .join(' / ');
};

const buildPhotoTroubleshootDiagnosis = (albumCount: number, visibleAssetCount: number, failedAccessCount: number) => {
  if (albumCount <= 0) {
    return {
      diagnosis: '未找到订单关联相册。先同步抖音订单或在客片选片工作台创建相册，并确认相册订单ID对应本地订单ID。',
      diagnosisType: 'warning' as const
    };
  }
  if (visibleAssetCount <= 0) {
    return {
      diagnosis: '相册已存在，但没有客户可见照片。请上传照片，并确认底片 visible=1 且 OSS Key 不为空。',
      diagnosisType: 'warning' as const
    };
  }
  if (failedAccessCount > 0) {
    return {
      diagnosis: '客户最近有失败访问。请打开访问审计，优先核对手机号、相册有效期、图片权限和 OSS Key。',
      diagnosisType: 'warning' as const
    };
  }
  return {
    diagnosis: '订单、相册、照片和访问记录当前无明显阻塞，可以把取片码或取片入口发给客户。',
    diagnosisType: 'success' as const
  };
};

const loadPhotoTroubleshootSummary = async (row?: YyOrderVO) => {
  if (!row) return;
  photoSummaryLoading.value = true;
  resetPhotoTroubleshootSummary();
  try {
    const albumRes = await listYyPhotoAlbum({
      pageNum: 1,
      pageSize: 20,
      storeId: row.storeId,
      orderId: row.id || row.externalOrderId || row.orderNo
    });
    const albums = extractRows<YyPhotoAlbumVO>(albumRes);
    const albumIds = albums.map((album) => album.id).filter((id) => id !== undefined && id !== null);
    const summaryRes = albumIds.length ? await listYyPhotoAlbumOperationsSummary(albumIds) : undefined;
    const albumOperationsSummaries = summaryRes ? extractRows<YyPhotoAlbumOperationsSummaryVO>(summaryRes) : [];
    const albumOperationsTotal = sumAlbumOperationsSummaries(albumOperationsSummaries);
    const accessRes = await listYyPhotoAccessLog({
      pageNum: 1,
      pageSize: 10,
      storeId: row.storeId,
      customerPhone: row.customerPhone,
      success: '0'
    });
    const failedLogs = extractRows<YyPhotoAccessLogVO>(accessRes);
    const diagnosis = buildPhotoTroubleshootDiagnosis(albums.length, albumOperationsTotal.visibleAssetCount, failedLogs.length);
    photoTroubleshootSummary.value = {
      albumCount: albums.length,
      visibleAssetCount: albumOperationsTotal.visibleAssetCount,
      failedAccessCount: failedLogs.length,
      albumHint: albums.length ? '已找到订单关联相册' : '未找到订单关联相册',
      assetHint: albumOperationsTotal.visibleAssetCount
        ? albumOperationsTotal.missingObjectKeyCount
          ? `客户可见照片已开放，${albumOperationsTotal.missingObjectKeyCount} 张缺 OSS Key`
          : '客户可见照片已开放'
        : '暂无客户可见照片',
      accessHint: failedLogs.length ? '存在失败访问，请点审计查看' : '暂无失败访问',
      latestFailedRemark: buildFailedAccessRemark(failedLogs[0]),
      ...diagnosis,
      error: ''
    };
  } catch (error: any) {
    photoTroubleshootSummary.value = {
      ...photoTroubleshootSummary.value,
      albumHint: '查询失败',
      assetHint: '查询失败',
      accessHint: '查询失败',
      diagnosis: '取片摘要查询失败。请确认当前账号拥有相册、底片和访问审计查询权限。',
      diagnosisType: 'error',
      error: error?.message || '取片排障摘要查询失败'
    };
  } finally {
    photoSummaryLoading.value = false;
  }
};

const buildPhotoWorkbenchRoute = (row: YyOrderVO, tab: 'album' | 'accessLog', intent?: 'upload' | 'pickup-entry') => {
  const storeId = toPhotoQueryValue(row.storeId);
  if (tab === 'accessLog') {
    return {
      path: '/yy/photo',
      query: {
        tab,
        storeId,
        customerPhone: toPhotoQueryValue(row.customerPhone)
      }
    };
  }
  return {
    path: '/yy/photo',
    query: {
      tab,
      intent,
      storeId,
      orderId: toPhotoQueryValue(row.id || row.externalOrderId || row.orderNo)
    }
  };
};

const openPhotoWorkbench = (row: YyOrderVO) => {
  router.push(buildPhotoWorkbenchRoute(row, 'album'));
};

const openPhotoWorkbenchForAudit = (row: YyOrderVO) => {
  router.push(buildPhotoWorkbenchRoute(row, 'accessLog'));
};

const refreshOrderPhotoAlbumState = async (row: YyOrderVO) => {
  await getList();
  if (detail.value?.id === row.id) {
    const detailRes = await getYyOrder(row.id);
    detail.value = detailRes.data;
    void loadPhotoTroubleshootSummary(detailRes.data);
  }
};

const ensurePhotoAlbumPlaceholder = async (row: YyOrderVO, successMessage?: string) => {
  if (!row.customerPhone) {
    proxy?.$modal.msgWarning('订单缺客户手机号，先补手机号后再生成取片相册。');
    return false;
  }
  repairingAlbumOrderId.value = row.id;
  try {
    const res = await repairYyOrderPhotoAlbumPlaceholder(row.id);
    proxy?.$modal.msgSuccess(successMessage || `相册已就绪：${res.data?.albumName || '订单取片相册'}`);
    await refreshOrderPhotoAlbumState(row);
    return true;
  } finally {
    repairingAlbumOrderId.value = '';
  }
};

const ensurePhotoAlbumPlaceholderForUpload = async (row: YyOrderVO) => {
  if (getPhotoAlbumCount(row) <= 0) {
    return await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在打开上传窗口。');
  }
  return true;
};

const ensurePhotoAlbumPlaceholderForShare = async (row: YyOrderVO) => {
  if (getPhotoAlbumCount(row) <= 0) {
    return await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在复制取片说明。');
  }
  return true;
};

const ensurePhotoAlbumPlaceholderForPickupEntry = async (row: YyOrderVO) => {
  if (getPhotoAlbumCount(row) <= 0) {
    return await ensurePhotoAlbumPlaceholder(row, '已自动生成取片相册，正在打开取片入口。');
  }
  return true;
};

const openPhotoWorkbenchForUpload = async (row: YyOrderVO) => {
  uploadingAlbumOrderId.value = row.id;
  try {
    if (!(await ensurePhotoAlbumPlaceholderForUpload(row))) {
      return;
    }
    router.push(buildPhotoWorkbenchRoute(row, 'album', 'upload'));
  } finally {
    uploadingAlbumOrderId.value = '';
  }
};

const repairPhotoAlbumPlaceholder = async (row: YyOrderVO) => {
  await ensurePhotoAlbumPlaceholder(row);
};

const openPhotoWorkbenchForPickupEntry = async (row: YyOrderVO) => {
  sharingAlbumOrderId.value = row.id;
  try {
    if (!(await ensurePhotoAlbumPlaceholderForPickupEntry(row))) {
      return;
    }
    router.push(buildPhotoWorkbenchRoute(row, 'album', 'pickup-entry'));
  } finally {
    sharingAlbumOrderId.value = '';
  }
};

const loadShareableOrderAlbum = async (row: YyOrderVO) => {
  if (!row.customerPhone) {
    proxy?.$modal.msgWarning('订单缺客户手机号，先补手机号后再复制取片说明。');
    return undefined;
  }
  if (!(await ensurePhotoAlbumPlaceholderForShare(row))) {
    return undefined;
  }
  const albums = await loadOrderPhotoAlbums(row);
  if (!albums.length) {
    proxy?.$modal.msgWarning('未找到订单关联相册，请先跳相册创建相册或上传照片。');
    return undefined;
  }
  const album = pickShareableAlbum(albums);
  if (!resolveAlbumPickupCode(album)) {
    proxy?.$modal.msgWarning('关联相册缺取片码，请先在相册里补充取片码。');
    return undefined;
  }
  return album;
};

const copyOrderPickupShareText = async (row: YyOrderVO) => {
  sharingAlbumOrderId.value = row.id;
  try {
    const album = await loadShareableOrderAlbum(row);
    if (!album) {
      return;
    }
    const shareText = buildPickupShareText(album, pickupEntryUrl.value);
    await copyText(shareText, '客户取片说明已复制', '复制失败，请进入相册取片入口手动复制');
  } finally {
    sharingAlbumOrderId.value = '';
  }
};

const copyOrderPickupChannelShareText = async (row: YyOrderVO, channelLabel: 'H5 网页' | '微信小程序' | '抖音小程序') => {
  sharingAlbumOrderId.value = row.id;
  try {
    const album = await loadShareableOrderAlbum(row);
    if (!album) {
      return;
    }
    const shareText = buildPickupChannelShareText(album, channelLabel, pickupEntryUrl.value);
    await copyText(shareText, `${channelLabel}客户话术已复制`, '复制失败，请进入相册取片入口手动复制');
  } finally {
    sharingAlbumOrderId.value = '';
  }
};

const handlePhotoTroubleshoot = async (row: YyOrderVO) => {
  const res = await getYyOrder(row.id);
  detail.value = res.data;
  detailVisible.value = true;
  ElMessage.info(buildPhotoTroubleshootHint(res.data));
  void loadPhotoTroubleshootSummary(res.data);
};

const handleDetail = async (row: YyOrderVO) => {
  const res = await getYyOrder(row.id);
  detail.value = res.data;
  detailVisible.value = true;
  void loadPhotoTroubleshootSummary(res.data);
};

const handleStatusCommand = async (row: YyOrderVO, status: string) => {
  if (row.status === status) return;
  await proxy?.$modal.confirm(`确认将订单 ${row.orderNo} 状态改为“${getOptionLabel(orderStatusOptions, status)}”？`);
  await updateYyOrder({ ...row, status });
  proxy?.$modal.msgSuccess('状态已更新');
  getList();
};

onMounted(() => {
  applyRouteQueryIntent();
  getList();
});
</script>

<style scoped>
.yy-order-overview {
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.yy-order-overview :deep(.el-card__body) {
  padding: 18px;
}

.yy-order-overview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.yy-order-overview-title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.yy-order-overview-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.yy-order-overview-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.yy-order-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.yy-order-metric {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-order-metric-label,
.yy-order-metric-copy {
  display: block;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-order-metric strong {
  display: block;
  overflow: hidden;
  margin: 8px 0 4px;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-order-overview-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.yy-order-overview-notes > div {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.yy-order-overview-notes span,
.yy-order-overview-notes small {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-order-overview-notes strong {
  display: block;
  margin: 5px 0;
  color: var(--el-text-color-primary);
  font-size: 15px;
  line-height: 1.35;
}

.yy-order-action-guide {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: linear-gradient(180deg, var(--el-fill-color-extra-light), var(--el-fill-color-blank));
}

.yy-order-action-guide-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.yy-order-action-guide-head span,
.yy-order-action-guide-head small {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-order-action-guide-head strong {
  display: block;
  margin-top: 3px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.35;
}

.yy-order-action-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.yy-order-action-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 82px;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.yy-order-action-step > .el-button,
.yy-order-action-tip {
  grid-column: 2;
  justify-self: start;
}

.yy-order-action-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.yy-order-action-copy {
  min-width: 0;
}

.yy-order-action-copy strong,
.yy-order-action-copy small {
  display: block;
  overflow: hidden;
  line-height: 1.45;
  text-overflow: ellipsis;
}

.yy-order-action-copy strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.yy-order-action-copy small,
.yy-order-action-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.yy-order-action-tip {
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .yy-order-overview-grid,
  .yy-order-overview-notes,
  .yy-order-action-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .yy-order-action-step:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .yy-order-overview-head {
    display: block;
  }

  .yy-order-overview-tags {
    justify-content: flex-start;
    margin-top: 10px;
  }

  .yy-order-overview-grid,
  .yy-order-overview-notes,
  .yy-order-action-steps {
    grid-template-columns: 1fr;
  }

  .yy-order-action-guide-head {
    display: block;
  }

  .yy-order-action-guide-head small {
    margin-top: 6px;
  }

  .yy-order-action-step:last-child {
    grid-column: auto;
  }
}

.yy-order-photo-summary :deep(.el-card__header) {
  padding: 10px 14px;
}

.yy-order-photo-summary :deep(.el-card__body) {
  padding: 14px;
}

.yy-order-photo-summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.yy-order-photo-summary-loading {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.yy-order-photo-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.yy-order-photo-summary-item {
  position: relative;
  overflow: hidden;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-extra-light);
}

.yy-order-photo-summary-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--el-border-color);
}

.yy-order-photo-summary-item.is-good::before {
  background: var(--el-color-success);
}

.yy-order-photo-summary-item.is-warning::before {
  background: var(--el-color-warning);
}

.yy-order-photo-summary-item.is-good {
  background: var(--el-color-success-light-9);
}

.yy-order-photo-summary-item.is-warning {
  background: var(--el-color-warning-light-9);
}

.yy-order-photo-summary-label,
.yy-order-photo-summary-item small {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-order-photo-summary-item strong {
  display: block;
  margin: 5px 0;
  color: var(--el-text-color-primary);
  font-size: 22px;
  line-height: 1.2;
}

.yy-order-photo-status {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}

.yy-order-photo-status span {
  max-width: 112px;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-order-photo-status.is-ready span {
  color: var(--el-color-success);
}

.yy-order-photo-status.is-warning span {
  color: var(--el-color-warning);
}

.yy-order-photo-status.is-blocked span {
  color: var(--el-color-danger);
}
</style>
