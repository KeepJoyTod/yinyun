<template>
  <div class="p-2 yy-channel-workbench">
    <section class="yy-hero">
      <div class="yy-hero-copy">
        <div class="yy-hero-eyebrow">影约云渠道工作台</div>
        <h2>{{ channelTitle }}</h2>
        <p>{{ subtitle }}</p>
        <div class="yy-hero-tags">
          <el-tag type="info" effect="dark">P0 渠道插件</el-tag>
          <el-tag v-if="channelType" :type="getOptionType(channelTypeOptions, channelType)">{{
            getOptionLabel(channelTypeOptions, channelType)
          }}</el-tag>
          <el-tag type="success" effect="plain">授权 / 订单 / 日志</el-tag>
        </div>
      </div>
      <div class="yy-hero-actions">
        <el-button icon="Refresh" :loading="workbenchLoading" @click="refreshAll">刷新全部</el-button>
        <el-button v-hasPermi="['yy:channelPlugin:add']" type="primary" icon="Plus" @click="handlePluginAdd">新增插件</el-button>
      </div>
    </section>

    <el-alert class="mb-[10px]" :title="healthAlertTitle" :description="healthAlertDesc" :type="healthAlertType" :closable="false" show-icon />
    <el-alert
      v-if="latestLog"
      class="mb-[10px]"
      :title="latestLogAlertTitle"
      :description="latestLogAlertDesc"
      :type="latestLogAlertType"
      :closable="false"
      show-icon
    />

    <el-card v-if="integrationNotes?.length" class="yy-integration-card mb-[10px]" shadow="never">
      <div class="yy-integration-title">接入要点</div>
      <div class="yy-integration-grid">
        <div v-for="item in integrationNotes" :key="item" class="yy-integration-item">{{ item }}</div>
      </div>
    </el-card>

    <el-row :gutter="12" class="mb-[10px]">
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card class="yy-metric-card" shadow="never">
          <div class="text-xs text-gray-500">插件数</div>
          <div class="mt-1 text-2xl font-semibold">{{ pluginList.length }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card class="yy-metric-card" shadow="never">
          <div class="text-xs text-gray-500">已授权插件</div>
          <div class="mt-1 text-2xl font-semibold text-green-600">{{ authorizedPluginTotal }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card class="yy-metric-card" shadow="never">
          <div class="text-xs text-gray-500">授权账号</div>
          <div class="mt-1 text-2xl font-semibold">{{ accountList.length }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="6">
        <el-card class="yy-metric-card" shadow="never">
          <div class="text-xs text-gray-500">同步日志</div>
          <div class="mt-1 text-2xl font-semibold">{{ logList.length }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="yy-tabs">
      <el-tab-pane label="插件配置" name="plugin">
        <el-card class="yy-panel" shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">插件配置</div>
                <div class="yy-panel-subtitle">管理开通态、授权态和平台开通提示。</div>
              </div>
              <div class="yy-panel-actions">
                <el-button v-hasPermi="['yy:channelPlugin:edit']" :disabled="pluginSingle" icon="Edit" @click="handlePluginUpdate()">修改</el-button>
                <el-button
                  v-hasPermi="['yy:channelPlugin:remove']"
                  :disabled="pluginMultiple"
                  type="danger"
                  plain
                  icon="Delete"
                  @click="handlePluginDelete()"
                  >删除</el-button
                >
                <el-button v-hasPermi="['yy:channelPlugin:export']" type="warning" plain icon="Download" @click="handlePluginExport">导出</el-button>
                <right-toolbar @query-table="getPluginList" />
              </div>
            </div>
          </template>

          <div class="mb-[10px]">
            <el-form ref="pluginQueryFormRef" :model="pluginQueryParams" :inline="true">
              <el-form-item v-if="!channelType" label="渠道" prop="channelType">
                <el-select v-model="pluginQueryParams.channelType" placeholder="请选择渠道" clearable class="!w-[140px]">
                  <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="插件名称" prop="pluginName">
                <el-input v-model="pluginQueryParams.pluginName" placeholder="请输入插件名称" clearable @keyup.enter="handlePluginQuery" />
              </el-form-item>
              <el-form-item label="启用" prop="enabled">
                <el-select v-model="pluginQueryParams.enabled" placeholder="请选择" clearable class="!w-[120px]">
                  <el-option v-for="item in commonStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="授权状态" prop="authStatus">
                <el-select v-model="pluginQueryParams.authStatus" placeholder="请选择" clearable class="!w-[140px]">
                  <el-option v-for="item in authStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handlePluginQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetPluginQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            v-loading="pluginLoading"
            border
            stripe
            :data="pluginList"
            empty-text="暂无插件配置，请先新增或同步"
            @selection-change="handlePluginSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="渠道" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(channelTypeOptions, scope.row.channelType)">{{
                  getOptionLabel(channelTypeOptions, scope.row.channelType)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="插件名称" prop="pluginName" min-width="150" show-overflow-tooltip />
            <el-table-column label="启用" width="90">
              <template #default="scope">
                <el-tag :type="getOptionType(commonStatusOptions, scope.row.enabled)">{{
                  getOptionLabel(commonStatusOptions, scope.row.enabled)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="授权状态" width="110">
              <template #default="scope">
                <el-tag :type="getOptionType(authStatusOptions, scope.row.authStatus)">{{
                  getOptionLabel(authStatusOptions, scope.row.authStatus)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="开通提示" prop="openTip" min-width="230" show-overflow-tooltip />
            <el-table-column label="最后同步" prop="lastSyncTime" min-width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:channelPlugin:edit']" link type="primary" icon="Edit" @click="handlePluginUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:channelPlugin:remove']" link type="primary" icon="Delete" @click="handlePluginDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="pluginTotal > 0"
            v-model:total="pluginTotal"
            v-model:page="pluginQueryParams.pageNum"
            v-model:limit="pluginQueryParams.pageSize"
            @pagination="getPluginList"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="授权账号" name="account">
        <el-card shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">授权账号</div>
                <div class="yy-panel-subtitle">保存 AppKey、Token 和门店维度的授权状态。</div>
              </div>
              <div class="yy-panel-actions">
                <el-button v-hasPermi="['yy:channelAccount:add']" type="primary" plain icon="Plus" @click="handleAccountAdd">新增账号</el-button>
                <el-button v-hasPermi="['yy:channelAccount:edit']" :disabled="accountSingle" icon="Edit" @click="handleAccountUpdate()"
                  >修改</el-button
                >
                <el-button
                  v-hasPermi="['yy:channelAccount:remove']"
                  type="danger"
                  plain
                  :disabled="accountMultiple"
                  icon="Delete"
                  @click="handleAccountDelete()"
                  >删除</el-button
                >
                <right-toolbar @query-table="getAccountList" />
              </div>
            </div>
          </template>

          <div class="mb-[10px]">
            <el-form ref="accountQueryFormRef" :model="accountQueryParams" :inline="true">
              <el-form-item label="门店ID" prop="storeId">
                <el-input v-model="accountQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleAccountQuery" />
              </el-form-item>
              <el-form-item v-if="!channelType" label="渠道" prop="channelType">
                <el-select v-model="accountQueryParams.channelType" placeholder="请选择渠道" clearable class="!w-[140px]">
                  <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="账号" prop="accountName">
                <el-input v-model="accountQueryParams.accountName" placeholder="请输入授权账号" clearable @keyup.enter="handleAccountQuery" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select v-model="accountQueryParams.status" placeholder="请选择状态" clearable class="!w-[140px]">
                  <el-option v-for="item in authStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleAccountQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetAccountQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            v-loading="accountLoading"
            border
            stripe
            :data="accountList"
            empty-text="暂无授权账号，请先关联门店和渠道"
            @selection-change="handleAccountSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="门店ID" prop="storeId" width="100" />
            <el-table-column label="渠道" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(channelTypeOptions, scope.row.channelType)">{{
                  getOptionLabel(channelTypeOptions, scope.row.channelType)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="授权账号" prop="accountName" min-width="150" show-overflow-tooltip />
            <el-table-column label="AppKey" prop="appKey" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="110">
              <template #default="scope">
                <el-tag :type="getOptionType(authStatusOptions, scope.row.status)">{{ getOptionLabel(authStatusOptions, scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="过期时间" prop="expiresAt" min-width="160" />
            <el-table-column :label="serviceIdLabel" prop="serviceId" min-width="150" show-overflow-tooltip />
            <el-table-column label="webhook" prop="webhookUrl" min-width="210" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:channelAccount:edit']" link type="primary" icon="Edit" @click="handleAccountUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:channelAccount:remove']" link type="primary" icon="Delete" @click="handleAccountDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="accountTotal > 0"
            v-model:total="accountTotal"
            v-model:page="accountQueryParams.pageNum"
            v-model:limit="accountQueryParams.pageSize"
            @pagination="getAccountList"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="渠道订单" name="orders">
        <el-card shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">渠道订单</div>
                <div class="yy-panel-subtitle">按外部订单号、客户和手机号快速定位。</div>
              </div>
              <div class="yy-panel-actions">
                <template v-if="canSyncOrders">
                  <el-button
                    type="primary"
                    plain
                    icon="Refresh"
                    :loading="orderSyncLoading && orderSyncRange === '24h'"
                    :disabled="orderSyncLoading"
                    @click="syncRecentOrders(1)"
                  >
                    同步近24小时
                  </el-button>
                  <el-button
                    type="primary"
                    plain
                    icon="Calendar"
                    :loading="orderSyncLoading && orderSyncRange === '7d'"
                    :disabled="orderSyncLoading"
                    @click="syncRecentOrders(7)"
                  >
                    同步近7天
                  </el-button>
                </template>
                <el-button icon="Refresh" :loading="orderLoading" @click="getOrderList">刷新</el-button>
              </div>
            </div>
            <el-form :model="orderQueryParams" :inline="true" class="mt-3">
              <el-form-item v-if="!channelType" label="渠道" prop="channelType">
                <el-select v-model="orderChannelType" placeholder="请选择渠道" class="!w-[140px]">
                  <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="门店ID" prop="storeId">
                <el-input v-model="orderQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="getOrderList" />
              </el-form-item>
              <el-form-item label="关键字" prop="keyword">
                <el-input v-model="orderQueryParams.keyword" placeholder="外部单号/客户/手机号" clearable @keyup.enter="getOrderList" />
              </el-form-item>
              <template v-if="canSyncOrders">
                <el-form-item label="账户ID" prop="accountId">
                  <el-input v-model="orderQueryParams.accountId" :placeholder="accountIdPlaceholder" clearable class="!w-[190px]" />
                </el-form-item>
                <el-form-item label="订单号" prop="orderId">
                  <el-input
                    v-model="orderQueryParams.orderId"
                    :placeholder="orderIdPlaceholder"
                    clearable
                    class="!w-[190px]"
                    @keyup.enter="getOrderList"
                  />
                </el-form-item>
                <el-form-item label="外部单号" prop="outOrderNo">
                  <el-input
                    v-model="orderQueryParams.outOrderNo"
                    :placeholder="outOrderNoPlaceholder"
                    clearable
                    class="!w-[190px]"
                    @keyup.enter="getOrderList"
                  />
                </el-form-item>
                <el-form-item label="订单状态" prop="orderStatus">
                  <el-input
                    v-model="orderQueryParams.orderStatus"
                    placeholder="order_status"
                    clearable
                    class="!w-[150px]"
                    @keyup.enter="getOrderList"
                  />
                </el-form-item>
                <el-form-item label="测试数据" prop="useTestDataHeader">
                  <el-switch
                    v-model="orderQueryParams.useTestDataHeader"
                    :disabled="!isDouyinLife"
                    inline-prompt
                    active-text="开"
                    inactive-text="关"
                  />
                </el-form-item>
              </template>
              <el-form-item>
                <el-button type="primary" icon="Search" :loading="orderLoading" @click="getOrderList">搜索</el-button>
              </el-form-item>
            </el-form>
          </template>

          <el-alert v-if="orderSyncMessage" class="mb-3" :title="orderSyncMessage" :type="orderSyncAlertType" :closable="false" show-icon />

          <el-table v-loading="orderLoading" border stripe :data="channelOrderList" :empty-text="channelOrderEmptyText">
            <el-table-column label="渠道" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(channelTypeOptions, scope.row.channelType)">{{
                  getOptionLabel(channelTypeOptions, scope.row.channelType)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="外部订单号" prop="externalOrderId" min-width="180" fixed="left" show-overflow-tooltip />
            <el-table-column label="客户" min-width="150">
              <template #default="scope">
                <div>{{ scope.row.customerName || '-' }}</div>
                <div class="text-xs text-gray-400">{{ scope.row.customerPhone || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="金额" prop="amount" width="110">
              <template #default="scope">￥{{ Number(scope.row.amount || 0).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="外部状态" prop="externalStatus" width="120" />
            <el-table-column label="同步状态" width="110">
              <template #default="scope">
                <el-tag :type="getOptionType(syncStatusOptions, scope.row.syncStatus)">{{
                  getOptionLabel(syncStatusOptions, scope.row.syncStatus)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="本地订单ID" prop="localOrderId" width="120" />
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="scope">
                <el-button link type="primary" icon="View" @click="handleOrderDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="同步日志" name="logs">
        <el-card shadow="hover">
          <template #header>
            <div class="yy-panel-head">
              <div>
                <div class="yy-panel-title">同步日志</div>
                <div class="yy-panel-subtitle">记录接口、请求 ID、耗时和错误信息，方便排查渠道同步问题。</div>
              </div>
              <div class="yy-panel-actions">
                <el-button icon="Refresh" :loading="logLoading" @click="getLogList">刷新</el-button>
              </div>
            </div>
            <el-form ref="logQueryFormRef" :model="logQueryParams" :inline="true" class="mt-3">
              <el-form-item label="门店ID" prop="storeId">
                <el-input v-model="logQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleLogQuery" />
              </el-form-item>
              <el-form-item v-if="!channelType" label="渠道" prop="channelType">
                <el-select v-model="logQueryParams.channelType" placeholder="请选择渠道" clearable class="!w-[140px]">
                  <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="接口" prop="apiName">
                <el-input v-model="logQueryParams.apiName" placeholder="接口名" clearable @keyup.enter="handleLogQuery" />
              </el-form-item>
              <el-form-item label="成功" prop="success">
                <el-select v-model="logQueryParams.success" placeholder="请选择" clearable class="!w-[120px]">
                  <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" :loading="logLoading" @click="handleLogQuery">搜索</el-button>
                <el-button icon="Refresh" :disabled="logLoading" @click="resetLogQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </template>

          <el-table v-loading="logLoading" border stripe :data="logList" :empty-text="logEmptyText">
            <el-table-column label="渠道" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(channelTypeOptions, scope.row.channelType)">{{
                  getOptionLabel(channelTypeOptions, scope.row.channelType)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="门店ID" prop="storeId" width="100" />
            <el-table-column label="接口名" prop="apiName" min-width="160" show-overflow-tooltip />
            <el-table-column label="请求ID" prop="requestId" min-width="160" show-overflow-tooltip />
            <el-table-column label="成功" width="90">
              <template #default="scope">
                <el-tag :type="getOptionType(yesNoOptions, scope.row.success)">{{ getOptionLabel(yesNoOptions, scope.row.success) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="可重试" width="90">
              <template #default="scope">
                <el-tag :type="getOptionType(yesNoOptions, scope.row.retryable)">{{ getOptionLabel(yesNoOptions, scope.row.retryable) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="耗时" prop="durationMs" width="100">
              <template #default="scope">{{ scope.row.durationMs || 0 }} ms</template>
            </el-table-column>
            <el-table-column label="错误信息" prop="errorMessage" min-width="240" show-overflow-tooltip />
          </el-table>

          <pagination
            v-if="logTotal > 0"
            v-model:total="logTotal"
            v-model:page="logQueryParams.pageNum"
            v-model:limit="logQueryParams.pageSize"
            @pagination="getLogList"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="pluginDialog.visible" :title="pluginDialog.title" width="680px" append-to-body>
      <el-form ref="pluginFormRef" :model="pluginForm" :rules="pluginRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="渠道" prop="channelType">
              <el-select v-model="pluginForm.channelType" :disabled="!!channelType" class="w-full">
                <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="插件名称" prop="pluginName">
              <el-input v-model="pluginForm.pluginName" placeholder="请输入插件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用" prop="enabled">
              <el-radio-group v-model="pluginForm.enabled">
                <el-radio v-for="item in commonStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权状态" prop="authStatus">
              <el-select v-model="pluginForm.authStatus" class="w-full">
                <el-option v-for="item in authStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="开通提示" prop="openTip">
              <el-input v-model="pluginForm.openTip" placeholder="例如：抖音小程序未开通" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后同步" prop="lastSyncTime">
              <el-date-picker
                v-model="pluginForm.lastSyncTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择同步时间"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="pluginForm.remark" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPluginForm">确 定</el-button>
          <el-button @click="pluginDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="accountDialog.visible" :title="accountDialog.title" width="720px" append-to-body>
      <el-form ref="accountFormRef" :model="accountForm" :rules="accountRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="accountForm.storeId" placeholder="请输入门店ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="渠道" prop="channelType">
              <el-select v-model="accountForm.channelType" :disabled="!!channelType" class="w-full">
                <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权账号" prop="accountName">
              <el-input v-model="accountForm.accountName" placeholder="请输入授权账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="appKeyLabel" prop="appKey">
              <el-input v-model="accountForm.appKey" :placeholder="appKeyPlaceholder" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="appSecretLabel" prop="appSecretEnc">
              <el-input v-model="accountForm.appSecretEnc" :placeholder="appSecretPlaceholder" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="serviceIdLabel" prop="serviceId">
              <el-input v-model="accountForm.serviceId" :placeholder="serviceIdPlaceholder" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="serviceModeLabel" prop="serviceModeId">
              <el-input v-model="accountForm.serviceModeId" :placeholder="serviceModePlaceholder" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试open_id" prop="testOpenId">
              <el-input v-model="accountForm.testOpenId" placeholder="测试用户 open_id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="webhook" prop="webhookUrl">
              <el-input v-model="accountForm.webhookUrl" :placeholder="defaultWebhookUrl || '/yy/channel/DOUYIN/webhook'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买AppID" prop="serviceMarketAppId">
              <el-input v-model="accountForm.serviceMarketAppId" placeholder="service_market_app_id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买路径" prop="serviceMarketPath">
              <el-input v-model="accountForm.serviceMarketPath" placeholder="service_market_path" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="accountForm.status" class="w-full">
                <el-option v-for="item in authStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expiresAt">
              <el-date-picker
                v-model="accountForm.expiresAt"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择过期时间"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="访问令牌" prop="accessTokenEnc">
              <el-input v-model="accountForm.accessTokenEnc" type="textarea" :rows="2" placeholder="可选；编辑留空或******保留原值" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="刷新令牌" prop="refreshTokenEnc">
              <el-input v-model="accountForm.refreshTokenEnc" type="textarea" :rows="2" placeholder="可选；编辑留空或******保留原值" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="accountForm.remark" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAccountForm">确 定</el-button>
          <el-button @click="accountDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="orderDetailVisible" title="渠道订单详情" size="560px" append-to-body>
      <el-descriptions v-if="orderDetail" :column="1" border>
        <el-descriptions-item label="渠道">{{ getOptionLabel(channelTypeOptions, orderDetail.channelType) }}</el-descriptions-item>
        <el-descriptions-item label="外部订单号">{{ orderDetail.externalOrderId }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ orderDetail.customerName }} / {{ orderDetail.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="金额">￥{{ Number(orderDetail.amount || 0).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="外部状态">{{ orderDetail.externalStatus }}</el-descriptions-item>
        <el-descriptions-item label="同步状态">{{ getOptionLabel(syncStatusOptions, orderDetail.syncStatus) }}</el-descriptions-item>
        <el-descriptions-item label="本地订单ID">{{ orderDetail.localOrderId || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-input v-if="orderDetail" class="mt-3" :model-value="orderDetail.rawPayload" type="textarea" :rows="10" readonly />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { addYyChannelAccount, delYyChannelAccount, getYyChannelAccount, listYyChannelAccount, updateYyChannelAccount } from '@/api/yy/channelAccount';
import { getYyChannelOrderDetail, searchYyChannelOrders, syncYyChannelOrders } from '@/api/yy/channel';
import { addYyChannelPlugin, delYyChannelPlugin, getYyChannelPlugin, listYyChannelPlugin, updateYyChannelPlugin } from '@/api/yy/channelPlugin';
import { listYyChannelSyncLog } from '@/api/yy/channelSyncLog';
import type { YyChannelAccountForm, YyChannelAccountQuery, YyChannelAccountVO } from '@/api/yy/channelAccount/types';
import type { YyChannelOrderQuery, YyChannelOrderVO } from '@/api/yy/channel/types';
import type { YyChannelPluginForm, YyChannelPluginQuery, YyChannelPluginVO } from '@/api/yy/channelPlugin/types';
import type { YyChannelSyncLogQuery, YyChannelSyncLogVO } from '@/api/yy/channelSyncLog/types';
import {
  authStatusOptions,
  channelTypeOptions,
  commonStatusOptions,
  getOptionLabel,
  getOptionType,
  syncStatusOptions,
  yesNoOptions
} from '@/views/yy/components/options';
import { buildRecentSyncQuery, buildSyncResultMessage, isSyncSuccess, syncMessageType } from '@/views/yy/utils/douyinLife';

const props = defineProps<{
  channelTitle: string;
  subtitle: string;
  channelType?: string;
  defaultOpenTip?: string;
  integrationNotes?: string[];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeTab = ref('plugin');
const channelType = computed(() => props.channelType);
const isDouyinLife = computed(() => props.channelType === 'DOUYIN_LIFE');
const canSyncOrders = computed(() => ['DOUYIN_LIFE', 'MEITUAN'].includes(props.channelType || ''));
const defaultWebhookUrl = computed(() => (props.channelType ? `/yy/channel/${props.channelType}/webhook` : ''));
const accountIdPlaceholder = computed(() => (props.channelType === 'MEITUAN' ? '美团 shop_id / account_id' : 'Rpc-Transit-Life-Account'));
const orderIdPlaceholder = computed(() => (props.channelType === 'MEITUAN' ? '美团 order_id' : 'order_id'));
const outOrderNoPlaceholder = computed(() => (props.channelType === 'MEITUAN' ? '美团外部/券订单号' : 'out_order_no'));
const appKeyLabel = computed(() => (props.channelType === 'MEITUAN' ? 'AppKey' : 'client_key'));
const appKeyPlaceholder = computed(() => (props.channelType === 'MEITUAN' ? '美团开放平台 AppKey' : '抖音 client_key / 渠道 AppKey'));
const appSecretLabel = computed(() => (props.channelType === 'MEITUAN' ? 'AppSecret' : 'client_secret'));
const appSecretPlaceholder = computed(() =>
  props.channelType === 'MEITUAN' ? '美团 AppSecret；编辑留空或******保留原值' : '新增时填写；编辑留空或******保留原值'
);
const serviceIdLabel = computed(() => {
  if (props.channelType === 'MEITUAN') return 'shop_id';
  if (props.channelType === 'DOUYIN_LIFE') return 'account_id';
  return 'service_id';
});
const serviceIdPlaceholder = computed(() => {
  if (props.channelType === 'MEITUAN') return '美团门店授权后的 shop_id';
  if (props.channelType === 'DOUYIN_LIFE') return '抖音来客 account_id';
  return '抖音服务市场 service_id';
});
const serviceModeLabel = computed(() => {
  if (props.channelType === 'MEITUAN') return '扩展ID';
  if (props.channelType === 'DOUYIN_LIFE') return 'poi_id';
  return 'mode_id';
});
const serviceModePlaceholder = computed(() => {
  if (props.channelType === 'MEITUAN') return '可空；保留给美团 account_id / 门店扩展标识';
  if (props.channelType === 'DOUYIN_LIFE') return '抖音来客 POI / 门店 ID';
  return 'service_mode_id';
});

const pluginList = ref<YyChannelPluginVO[]>([]);
const accountList = ref<YyChannelAccountVO[]>([]);
const channelOrderList = ref<YyChannelOrderVO[]>([]);
const logList = ref<YyChannelSyncLogVO[]>([]);

const pluginLoading = ref(false);
const accountLoading = ref(false);
const orderLoading = ref(false);
const orderSyncLoading = ref(false);
const orderSyncRange = ref('');
const orderSyncMessage = ref('');
const orderSyncAlertType = ref('info');
const logLoading = ref(false);
const pluginTotal = ref(0);
const accountTotal = ref(0);
const logTotal = ref(0);

const pluginIds = ref<Array<string | number>>([]);
const accountIds = ref<Array<string | number>>([]);
const pluginSingle = ref(true);
const pluginMultiple = ref(true);
const accountSingle = ref(true);
const accountMultiple = ref(true);

const orderDetailVisible = ref(false);
const orderDetail = ref<YyChannelOrderVO>();
const orderChannelType = ref(props.channelType || 'DOUYIN');

const pluginQueryFormRef = ref<ElFormInstance>();
const accountQueryFormRef = ref<ElFormInstance>();
const logQueryFormRef = ref<ElFormInstance>();
const pluginFormRef = ref<ElFormInstance>();
const accountFormRef = ref<ElFormInstance>();

const pluginDialog = reactive<DialogOption>({ visible: false, title: '' });
const accountDialog = reactive<DialogOption>({ visible: false, title: '' });

const initPluginForm: YyChannelPluginForm = {
  id: undefined,
  channelType: props.channelType || 'DOUYIN',
  pluginName: props.channelTitle,
  enabled: '0',
  authStatus: 'UNOPENED',
  openTip: props.defaultOpenTip || '',
  lastSyncTime: '',
  remark: ''
};

const initAccountForm: YyChannelAccountForm = {
  id: undefined,
  storeId: '',
  channelType: props.channelType || 'DOUYIN',
  accountName: '',
  appKey: '',
  appSecretEnc: '',
  serviceId: '',
  serviceModeId: '',
  serviceMarketAppId: '',
  serviceMarketPath: '',
  testOpenId: '',
  webhookUrl: props.channelType ? `/yy/channel/${props.channelType}/webhook` : '',
  accessTokenEnc: '',
  refreshTokenEnc: '',
  expiresAt: '',
  status: 'UNAUTHORIZED',
  remark: ''
};

const pluginData = reactive<PageData<YyChannelPluginForm, YyChannelPluginQuery>>({
  form: { ...initPluginForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    channelType: props.channelType || '',
    pluginName: '',
    enabled: '',
    authStatus: ''
  },
  rules: {
    channelType: [{ required: true, message: '渠道不能为空', trigger: 'change' }],
    pluginName: [{ required: true, message: '插件名称不能为空', trigger: 'blur' }]
  }
});

const accountData = reactive<PageData<YyChannelAccountForm, YyChannelAccountQuery>>({
  form: { ...initAccountForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    channelType: props.channelType || '',
    accountName: '',
    status: ''
  },
  rules: {
    channelType: [{ required: true, message: '渠道不能为空', trigger: 'change' }],
    accountName: [{ required: true, message: '授权账号不能为空', trigger: 'blur' }]
  }
});

const logData = reactive<{ queryParams: YyChannelSyncLogQuery }>({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    channelType: props.channelType || '',
    apiName: '',
    requestId: '',
    success: '',
    retryable: ''
  }
});

const orderQueryParams = ref<YyChannelOrderQuery>({
  storeId: undefined,
  channelType: props.channelType || '',
  keyword: '',
  accountId: '',
  orderId: '',
  outOrderNo: '',
  orderStatus: '',
  pageNum: 1,
  pageSize: 10,
  useTestDataHeader: false
});

const { form: pluginForm, queryParams: pluginQueryParams, rules: pluginRules } = toRefs(pluginData);
const { form: accountForm, queryParams: accountQueryParams, rules: accountRules } = toRefs(accountData);
const { queryParams: logQueryParams } = toRefs(logData);

const authorizedPluginTotal = computed(() => pluginList.value.filter((item) => item.authStatus === 'AUTHORIZED').length);
const unopenedPluginTotal = computed(() => pluginList.value.filter((item) => item.authStatus === 'UNOPENED').length);
const unauthorizedAccountTotal = computed(() => accountList.value.filter((item) => item.status === 'UNAUTHORIZED').length);
const isFailedLog = (log?: YyChannelSyncLogVO) => String(log?.success ?? '') === '0';
const failedLogTotal = computed(() => logList.value.filter((item) => isFailedLog(item)).length);
const workbenchLoading = computed(
  () => pluginLoading.value || accountLoading.value || orderLoading.value || orderSyncLoading.value || logLoading.value
);
const channelOrderEmptyText = computed(() =>
  canSyncOrders.value ? '暂无渠道订单；授权后同步近24小时/近7天，或输入外部订单号搜索。' : '暂无渠道订单。'
);
const logEmptyText = computed(() => '暂无同步日志；执行同步、查单、接单或核销后刷新这里看 logid 和错误摘要。');
const latestFailedLog = computed(() => logList.value.find((item) => isFailedLog(item)));
const latestLog = computed(() => latestFailedLog.value || logList.value[0]);
const latestLogAlertType = computed(() => (latestFailedLog.value ? 'warning' : 'info'));
const latestLogAlertTitle = computed(() => {
  const log = latestLog.value;
  if (!log) {
    return '';
  }
  return latestFailedLog.value ? `最近失败：${log.apiName || '未知接口'}` : `最近联调：${log.apiName || '未知接口'}`;
});
const latestLogAlertDesc = computed(() => {
  const log = latestLog.value;
  if (!log) {
    return '';
  }
  const parts = [`logid ${log.requestId || '-'}`, `耗时 ${log.durationMs || 0} ms`];
  if (log.errorMessage) {
    parts.push(`错误：${log.errorMessage}`);
  }
  return parts.join(' · ');
});
const healthAlertType = computed(() => {
  if (unopenedPluginTotal.value || unauthorizedAccountTotal.value || failedLogTotal.value) {
    return 'warning';
  }
  return 'success';
});
const healthAlertTitle = computed(() => {
  if (props.channelType) {
    return `${props.channelTitle} 当前处于 ${getOptionLabel(channelTypeOptions, props.channelType)} 专用工作台`;
  }
  return '渠道插件总览当前已加载抖音服务市场、抖音来客、美团和微信四条插件线';
});
const healthAlertDesc = computed(() => {
  const parts = [
    `未开通插件 ${unopenedPluginTotal.value} 个`,
    `未授权账号 ${unauthorizedAccountTotal.value} 个`,
    `同步失败日志 ${failedLogTotal.value} 条`
  ];
  return parts.join(' · ');
});

const normalizeChannelQuery = <T extends { channelType?: string }>(query: T): T => {
  if (props.channelType) {
    query.channelType = props.channelType;
  }
  return query;
};

const getPluginList = async () => {
  pluginLoading.value = true;
  try {
    const res = (await listYyChannelPlugin(normalizeChannelQuery({ ...pluginQueryParams.value }))) as any;
    pluginList.value = res.rows ?? res.data ?? [];
    pluginTotal.value = res.total ?? pluginList.value.length;
  } finally {
    pluginLoading.value = false;
  }
};

const getAccountList = async () => {
  accountLoading.value = true;
  try {
    const res = (await listYyChannelAccount(normalizeChannelQuery({ ...accountQueryParams.value }))) as any;
    accountList.value = res.rows ?? res.data ?? [];
    accountTotal.value = res.total ?? accountList.value.length;
  } finally {
    accountLoading.value = false;
  }
};

const getOrderList = async () => {
  orderLoading.value = true;
  try {
    const type = props.channelType || orderChannelType.value;
    const res = (await searchYyChannelOrders(type, { ...orderQueryParams.value, channelType: type })) as any;
    channelOrderList.value = res.data ?? res.rows ?? [];
  } finally {
    orderLoading.value = false;
  }
};

const syncRecentOrders = async (days: number) => {
  orderSyncLoading.value = true;
  orderSyncRange.value = days === 1 ? '24h' : '7d';
  try {
    const type = props.channelType || orderChannelType.value;
    const syncQuery = buildRecentSyncQuery(days, orderQueryParams.value, type);
    const res = await syncYyChannelOrders(type, syncQuery);
    const data = res.data;
    orderSyncMessage.value = buildSyncResultMessage(data);
    orderSyncAlertType.value = syncMessageType(data);
    if (isSyncSuccess(data)) {
      ElMessage.success(orderSyncMessage.value);
    } else {
      ElMessage.warning(orderSyncMessage.value);
    }
    orderQueryParams.value.orderId = '';
    orderQueryParams.value.outOrderNo = '';
    orderQueryParams.value.openId = '';
    orderQueryParams.value.startTime = syncQuery.startTime;
    orderQueryParams.value.endTime = syncQuery.endTime;
    await Promise.all([getOrderList(), getLogList()]);
  } finally {
    orderSyncLoading.value = false;
    orderSyncRange.value = '';
  }
};

const getLogList = async () => {
  logLoading.value = true;
  try {
    const res = (await listYyChannelSyncLog(normalizeChannelQuery({ ...logQueryParams.value }))) as any;
    logList.value = res.rows ?? res.data ?? [];
    logTotal.value = res.total ?? logList.value.length;
  } finally {
    logLoading.value = false;
  }
};

const refreshAll = async () => {
  await Promise.all([getPluginList(), getAccountList(), getOrderList(), getLogList()]);
};

const handlePluginQuery = () => {
  pluginQueryParams.value.pageNum = 1;
  getPluginList();
};

const handleAccountQuery = () => {
  accountQueryParams.value.pageNum = 1;
  getAccountList();
};

const handleLogQuery = () => {
  logQueryParams.value.pageNum = 1;
  getLogList();
};

const resetPluginQuery = () => {
  pluginQueryFormRef.value?.resetFields();
  if (props.channelType) pluginQueryParams.value.channelType = props.channelType;
  handlePluginQuery();
};

const resetAccountQuery = () => {
  accountQueryFormRef.value?.resetFields();
  if (props.channelType) accountQueryParams.value.channelType = props.channelType;
  handleAccountQuery();
};

const resetLogQuery = () => {
  logQueryFormRef.value?.resetFields();
  if (props.channelType) logQueryParams.value.channelType = props.channelType;
  handleLogQuery();
};

const handlePluginSelectionChange = (selection: YyChannelPluginVO[]) => {
  pluginIds.value = selection.map((item) => item.id);
  pluginSingle.value = selection.length !== 1;
  pluginMultiple.value = !selection.length;
};

const handleAccountSelectionChange = (selection: YyChannelAccountVO[]) => {
  accountIds.value = selection.map((item) => item.id);
  accountSingle.value = selection.length !== 1;
  accountMultiple.value = !selection.length;
};

const resetPlugin = () => {
  pluginForm.value = { ...initPluginForm };
  pluginFormRef.value?.resetFields();
};

const resetAccount = () => {
  accountForm.value = { ...initAccountForm };
  accountFormRef.value?.resetFields();
};

const handlePluginAdd = () => {
  resetPlugin();
  pluginDialog.visible = true;
  pluginDialog.title = '新增渠道插件';
};

const handleAccountAdd = () => {
  resetAccount();
  accountDialog.visible = true;
  accountDialog.title = '新增授权账号';
};

const handlePluginUpdate = async (row?: YyChannelPluginVO) => {
  resetPlugin();
  const id = row?.id || pluginIds.value[0];
  const res = await getYyChannelPlugin(id);
  Object.assign(pluginForm.value, res.data);
  pluginDialog.visible = true;
  pluginDialog.title = '修改渠道插件';
};

const handleAccountUpdate = async (row?: YyChannelAccountVO) => {
  resetAccount();
  const id = row?.id || accountIds.value[0];
  const res = await getYyChannelAccount(id);
  Object.assign(accountForm.value, res.data);
  accountDialog.visible = true;
  accountDialog.title = '修改授权账号';
};

const submitPluginForm = () => {
  pluginFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    pluginForm.value.id ? await updateYyChannelPlugin(pluginForm.value) : await addYyChannelPlugin(pluginForm.value);
    proxy?.$modal.msgSuccess('保存成功');
    pluginDialog.visible = false;
    getPluginList();
  });
};

const submitAccountForm = () => {
  accountFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    accountForm.value.id ? await updateYyChannelAccount(accountForm.value) : await addYyChannelAccount(accountForm.value);
    proxy?.$modal.msgSuccess('保存成功');
    accountDialog.visible = false;
    getAccountList();
  });
};

const handlePluginDelete = async (row?: YyChannelPluginVO) => {
  const deleteIds = row?.id || pluginIds.value;
  await proxy?.$modal.confirm(`是否确认删除渠道插件 ${deleteIds}？`);
  await delYyChannelPlugin(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getPluginList();
};

const handleAccountDelete = async (row?: YyChannelAccountVO) => {
  const deleteIds = row?.id || accountIds.value;
  await proxy?.$modal.confirm(`是否确认删除授权账号 ${deleteIds}？`);
  await delYyChannelAccount(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getAccountList();
};

const handlePluginExport = () => {
  proxy?.download('yy/channelPlugin/export', normalizeChannelQuery({ ...pluginQueryParams.value }), `yy_channel_plugin_${new Date().getTime()}.xlsx`);
};

const handleOrderDetail = async (row: YyChannelOrderVO) => {
  const res = await getYyChannelOrderDetail(row.channelType, row.externalOrderId);
  orderDetail.value = res.data;
  orderDetailVisible.value = true;
};

onMounted(() => {
  refreshAll();
});
</script>

<style lang="scss" scoped>
.yy-channel-workbench {
  .yy-hero {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid #dbe4f0;
    background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%);
    color: #fff;
  }

  .yy-hero-copy {
    min-width: 0;

    h2 {
      margin: 4px 0 6px;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.6;
    }
  }

  .yy-hero-eyebrow {
    color: #93c5fd;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  .yy-hero-tags,
  .yy-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .yy-metric-card,
  .yy-panel {
    border-radius: 8px;
    border-color: #e5e7eb;
  }

  .yy-integration-card {
    border-radius: 8px;
    border-color: #dbeafe;
    background: #f8fbff;
  }

  .yy-integration-title {
    margin-bottom: 8px;
    color: #0f172a;
    font-size: 14px;
    font-weight: 700;
  }

  .yy-integration-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .yy-integration-item {
    min-height: 36px;
    padding: 8px 10px;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: #fff;
    color: #334155;
    font-size: 12px;
    line-height: 1.5;
  }

  .yy-tabs :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }

  .yy-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .yy-panel-title {
    font-weight: 700;
    font-size: 16px;
    color: #111827;
  }

  .yy-panel-subtitle {
    margin-top: 4px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.4;
  }

  .yy-panel-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .yy-channel-workbench {
    .yy-hero {
      flex-direction: column;
    }

    .yy-panel-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .yy-panel-actions {
      justify-content: flex-start;
    }

    .yy-integration-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
