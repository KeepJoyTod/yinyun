<template>
  <div>
    <div class="p-2 pb-0">
      <el-card shadow="never" class="yy-life-hero">
        <div class="yy-life-hero-main">
          <div class="yy-life-hero-copy">
            <div class="text-xs font-semibold text-slate-500">抖音来客 · 生活服务订单联调</div>
            <div class="mt-2 text-xl font-semibold text-slate-900">跑通测试店铺下单、查单、接单和回调</div>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              围绕商家 account_id、order_id、out_order_no 和 webhook，把抖音团购/预约订单同步到影约云自建网站，查单和回调都会自动落本地订单。
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <el-tag type="warning" effect="dark">DOUYIN_LIFE</el-tag>
              <el-tag effect="plain">client_token</el-tag>
              <el-tag type="success" effect="plain">订单查询</el-tag>
              <el-tag type="info" effect="plain">本地映射</el-tag>
            </div>
          </div>

          <el-descriptions :column="1" size="small" border class="yy-life-hero-meta">
            <el-descriptions-item label="查询主键">order_id / out_order_no / open_id</el-descriptions-item>
            <el-descriptions-item label="确认接口">/goodlife/v1/comprehensive/trade/order/confirm/</el-descriptions-item>
            <el-descriptions-item label="落库目标">yy_channel_order_mapping / yy_channel_sync_log</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider class="!my-4" />

        <el-steps :active="1" align-center class="yy-life-steps">
          <el-step title="准备凭证" description="client_key / client_secret / account_id" />
          <el-step title="测试下单" description="测试店铺、测试商品、支付通知" />
          <el-step title="同步订单" description="查询状态、接单/拒单、写入本地映射" />
        </el-steps>
      </el-card>
    </div>

    <div class="p-2">
      <el-card shadow="hover" class="yy-logid-panel">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">开放平台验收 logid</div>
              <div class="mt-1 text-xs text-gray-500">这些值来自 `yy_channel_sync_log.request_id`，平台校验时不要填订单号或商品 ID。</div>
            </div>
            <el-button icon="Refresh" :loading="logidLoading" :disabled="logidLoading" @click="fetchRecentLogids">刷新</el-button>
          </div>
        </template>

        <div class="yy-logid-grid">
          <div v-for="item in logidCards" :key="item.apiName" class="yy-logid-item">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ item.label }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.apiName }}</div>
              </div>
              <el-tag :type="acceptanceStatusType(item.status)" effect="plain">{{ item.statusText || item.status }}</el-tag>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <el-input :model-value="item.requestId || '暂无 logid'" readonly />
              <el-button icon="CopyDocument" :disabled="!item.requestId" @click="copyLogid(item.requestId)">复制</el-button>
            </div>
            <div class="mt-2 truncate text-xs text-slate-400">{{ item.createTime || item.hint }}</div>
            <div class="mt-1 truncate text-xs text-slate-400">{{ item.logidSource }} · {{ item.publicUrl }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="p-2">
      <el-card shadow="hover" class="yy-sync-health-panel">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">订单同步健康</div>
              <div class="mt-1 text-xs text-gray-500">Webhook / SPI 优先入站，OpenAPI 自动同步只做补偿；失败事件可在这里排查和重试。</div>
            </div>
            <el-button icon="Refresh" :loading="healthLoading || inboxLoading" @click="refreshSyncHealthPanel">刷新</el-button>
          </div>
        </template>

        <div v-loading="healthLoading" class="yy-sync-health-grid">
          <div class="yy-sync-health-item">
            <span>健康状态</span>
            <strong>
              <el-tag :type="healthTagType(syncHealth?.healthStatus)" effect="plain">{{ syncHealth?.healthStatus || 'UNKNOWN' }}</el-tag>
            </strong>
            <small>{{ syncHealth?.message || '等待后端同步健康摘要' }}</small>
          </div>
          <div class="yy-sync-health-item">
            <span>失败事件</span>
            <strong>{{ syncHealth?.failedEventCount ?? 0 }}</strong>
            <small>需要排查或进入重试队列</small>
          </div>
          <div class="yy-sync-health-item">
            <span>可重试</span>
            <strong>{{ syncHealth?.retryableEventCount ?? 0 }}</strong>
            <small>点击下方重试后重新进入 RECEIVED</small>
          </div>
          <div class="yy-sync-health-item">
            <span>死信</span>
            <strong>{{ syncHealth?.deadEventCount ?? 0 }}</strong>
            <small>持续失败后需要人工核对 payload</small>
          </div>
          <div class="yy-sync-health-item">
            <span>最近 Webhook</span>
            <strong>{{ syncHealth?.latestWebhookTime || '-' }}</strong>
            <small>{{ syncHealth?.latestLogId || '暂无 logid' }}</small>
          </div>
          <div class="yy-sync-health-item">
            <span>最近补偿同步</span>
            <strong>{{ syncHealth?.latestAutoSyncTime || '-' }}</strong>
            <small>{{ syncHealth?.autoSyncStatus?.message || syncHealth?.autoSyncStatus?.syncStatus || '-' }}</small>
          </div>
        </div>

        <div class="yy-inbox-toolbar">
          <div>
            <div class="text-sm font-semibold text-slate-900">事件收件箱</div>
            <div class="mt-1 text-xs text-gray-500">只展示订单类 order-create / pay-notify 入站事件；发券、退款、库存仍在同步日志里排查。</div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <el-select v-model="inboxQuery.processStatus" clearable placeholder="处理状态" class="!w-[160px]" @change="fetchEventInbox">
              <el-option label="待处理 RECEIVED" value="RECEIVED" />
              <el-option label="已完成 PROCESSED" value="PROCESSED" />
              <el-option label="失败 FAILED" value="FAILED" />
              <el-option label="重复 DUPLICATE" value="DUPLICATE" />
              <el-option label="死信 DEAD" value="DEAD" />
            </el-select>
            <el-button icon="Refresh" :loading="inboxLoading" @click="fetchEventInbox">刷新收件箱</el-button>
          </div>
        </div>

        <el-table v-loading="inboxLoading" :data="inboxEvents" border stripe empty-text="暂无订单类 Webhook/SPI 入站事件">
          <el-table-column label="事件类型" prop="eventType" min-width="170" show-overflow-tooltip />
          <el-table-column label="外部订单号" prop="externalOrderId" min-width="180" show-overflow-tooltip />
          <el-table-column label="logid / request_id" prop="requestId" min-width="190" show-overflow-tooltip />
          <el-table-column label="状态" width="130">
            <template #default="scope">
              <el-tag :type="inboxStatusTagType(scope.row.processStatus)" effect="plain">{{ scope.row.processStatus || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="重试" prop="retryCount" width="90" align="right" />
          <el-table-column label="入站时间" prop="createTime" width="170" show-overflow-tooltip />
          <el-table-column label="错误摘要" prop="errorMessage" min-width="220" show-overflow-tooltip>
            <template #default="scope">{{ scope.row.errorMessage || scope.row.remark || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="110" fixed="right">
            <template #default="scope">
              <el-button
                link
                type="primary"
                icon="RefreshRight"
                :disabled="!canRetryInboxEvent(scope.row)"
                :loading="retryingInboxId === scope.row.id"
                @click="retryInboxEvent(scope.row)"
              >
                重试
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-if="inboxTotal > Number(inboxQuery.pageSize || 5)"
          v-model:total="inboxTotal"
          v-model:page="inboxQuery.pageNum"
          v-model:limit="inboxQuery.pageSize"
          @pagination="fetchEventInbox"
        />
      </el-card>
    </div>

    <div class="p-2">
      <el-card shadow="hover" class="yy-life-entry-panel">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">真实下单入口配置</div>
              <div class="mt-1 text-xs text-gray-500">维护抖音来客商品、SKU、POI 和落地页入口；P0 只做跳转来客商品页支付，不走 tt.pay。</div>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button icon="Refresh" :loading="entryLoading" @click="fetchLifeEntries">刷新</el-button>
              <el-button type="primary" icon="Plus" @click="openEntryDialog()">新增入口</el-button>
            </div>
          </div>
        </template>

        <el-alert
          class="mb-3"
          type="info"
          :closable="false"
          title="这里配置的是 DOUYIN_LIFE 来客真实商品/预约商品入口。抖音小程序内自建套餐支付属于 DOUYIN_MINI_APP，后续开通担保支付后再做。"
        />

        <div class="yy-life-order-guide">
          <div class="yy-life-order-guide-item">
            <div class="yy-life-order-guide-index">P0</div>
            <div class="yy-life-order-guide-copy">
              <strong>P0：来客商品页支付</strong>
              <small>客户从抖音搜索小程序或入口页跳到来客真实商品/预约商品页，在抖音侧完成支付。</small>
            </div>
            <el-button size="small" type="primary" plain icon="CopyDocument" :disabled="!lifeEntries.length" @click="copyFirstLifeEntry">
              复制首个入口
            </el-button>
          </div>
          <div class="yy-life-order-guide-item">
            <div class="yy-life-order-guide-index">SYNC</div>
            <div class="yy-life-order-guide-copy">
              <strong>先同步后导出</strong>
              <small>导出 Excel 只读本地 yy_order；先把 DOUYIN_LIFE 订单同步进本地统一账本。</small>
            </div>
            <div class="yy-life-order-guide-actions">
              <el-button size="small" type="primary" plain :loading="syncLoading && syncRange === '24h'" :disabled="lifeActionBusy" @click="syncRecentOrders(1)">
                同步近24小时
              </el-button>
              <el-button size="small" plain icon="Tickets" @click="openAllChannelExport">去订单导出</el-button>
            </div>
          </div>
          <div class="yy-life-order-guide-item">
            <div class="yy-life-order-guide-index">P1</div>
            <div class="yy-life-order-guide-copy">
              <strong>P1：小程序 tt.pay</strong>
              <small>小程序内自建套餐支付归 DOUYIN_MINI_APP；不复用来客 SPI，只复用 yy_order 统一账本。</small>
            </div>
            <el-button size="small" plain icon="Connection" @click="openDouyinLifeOrders">只看来客订单</el-button>
          </div>
        </div>

        <el-table v-loading="entryLoading" :data="lifeEntries" border stripe empty-text="暂无来客商品入口，请先新增商品 ID、SKU、POI 和入口链接">
          <el-table-column label="门店ID" prop="storeId" width="110" />
          <el-table-column label="本地产品ID" prop="productId" width="120" />
          <el-table-column label="来客商品" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <div class="font-medium text-slate-900">{{ scope.row.externalName || scope.row.externalProductId || '-' }}</div>
              <div class="text-xs text-slate-400">{{ scope.row.mappingStatus || 'UNMAPPED' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商品ID" prop="externalProductId" min-width="170" show-overflow-tooltip />
          <el-table-column label="SKU" prop="externalSkuId" min-width="150" show-overflow-tooltip />
          <el-table-column label="POI" prop="externalPoiId" min-width="150" show-overflow-tooltip />
          <el-table-column label="入口URL" prop="landingUrl" min-width="230" show-overflow-tooltip />
          <el-table-column label="入口路径" prop="landingPath" min-width="230" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="openEntryDialog(scope.row)">编辑</el-button>
              <el-button link type="success" icon="CopyDocument" @click="copyLifeEntry(scope.row)">复制</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="p-2">
      <el-card shadow="hover" class="yy-life-shell">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">抖音来客生活服务联调</div>
              <div class="mt-1 text-xs text-gray-500">围绕商家 `account_id`、订单号、外部单号和预约确认流程，直接把抖音订单同步到自建网站。</div>
            </div>
            <el-tag type="warning" effect="dark">DOUYIN_LIFE</el-tag>
          </div>
        </template>

        <el-form :model="lifeQuery" :inline="true" label-width="110px">
          <el-form-item label="门店ID">
            <el-input v-model="lifeQuery.storeId" placeholder="可空" clearable class="!w-[140px]" />
          </el-form-item>
          <el-form-item label="account_id">
            <el-input v-model="lifeQuery.accountId" placeholder="Rpc-Transit-Life-Account" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="order_id">
            <el-input v-model="lifeQuery.orderId" placeholder="订单号" clearable class="!w-[200px]" />
          </el-form-item>
          <el-form-item label="out_order_no">
            <el-input v-model="lifeQuery.outOrderNo" placeholder="商家外部单号" clearable class="!w-[200px]" />
          </el-form-item>
          <el-form-item label="open_id">
            <el-input v-model="lifeQuery.openId" placeholder="买家 open_id" clearable class="!w-[200px]" />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-input v-model="lifeQuery.orderStatus" placeholder="PAY_SUCCESS 等" clearable class="!w-[180px]" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input v-model="lifeQuery.startTime" placeholder="yyyy-MM-dd HH:mm:ss" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input v-model="lifeQuery.endTime" placeholder="yyyy-MM-dd HH:mm:ss" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="测试数据头">
            <el-switch v-model="lifeQuery.useTestDataHeader" inline-prompt active-text="开" inactive-text="关" />
          </el-form-item>
        </el-form>

        <div class="mb-3 flex flex-wrap gap-2">
          <el-button type="primary" icon="Key" :loading="tokenLoading" :disabled="lifeActionBusy" @click="runClientToken"
            >生成 client_token</el-button
          >
          <el-button type="success" icon="Search" :loading="queryLoading" :disabled="lifeActionBusy" @click="runOrderQuery">查询订单状态</el-button>
          <el-button
            type="primary"
            plain
            icon="Refresh"
            :loading="syncLoading && syncRange === '24h'"
            :disabled="lifeActionBusy"
            @click="syncRecentOrders(1)"
            >同步近24小时</el-button
          >
          <el-button
            type="primary"
            plain
            icon="Calendar"
            :loading="syncLoading && syncRange === '7d'"
            :disabled="lifeActionBusy"
            @click="syncRecentOrders(7)"
            >同步近7天</el-button
          >
          <el-button type="warning" icon="Check" :loading="confirmLoading" :disabled="lifeActionBusy" @click="runConfirm">确认 / 拒单</el-button>
          <el-button type="danger" icon="Finished" :loading="verifyLoading" :disabled="lifeActionBusy" @click="runVerify">整单核销</el-button>
          <el-button icon="Connection" :loading="webhookLoading" :disabled="lifeActionBusy" @click="runWebhookDemo">模拟支付通知</el-button>
        </div>

        <el-alert
          class="mb-3"
          type="info"
          :closable="false"
          title="查询至少填 order_id / out_order_no / open_id / order_status / start_time / end_time 之一；同步按钮会自动带最近时间范围，不要求订单号。测试店铺/测试商品才打开测试数据头，会加 Rpc-Persist-Life-Test-Data-Access: all。"
        />

        <el-alert
          v-if="latestBlockingResult"
          class="mb-3"
          type="warning"
          :closable="false"
          :title="latestBlockingTitle"
          :description="latestBlockingDesc"
          show-icon
        />

        <el-table
          v-if="orderQueryTouched || lifeOrders.length"
          v-loading="queryLoading"
          :data="lifeOrders"
          border
          stripe
          class="mb-3"
          empty-text="暂无返回订单；如果查测试商品，确认测试数据头已打开且订单查询能力已解除限流。"
        >
          <el-table-column label="外部订单号" prop="externalOrderId" min-width="190" show-overflow-tooltip />
          <el-table-column label="本地订单ID" width="130">
            <template #default="scope">
              <el-tag v-if="scope.row.localOrderId" type="success" effect="plain">{{ scope.row.localOrderId }}</el-tag>
              <el-tag v-else type="info" effect="plain">未关联</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="客户" min-width="160" show-overflow-tooltip>
            <template #default="scope">
              <div class="font-medium text-slate-900">{{ scope.row.customerName || '抖音来客客户' }}</div>
              <div class="text-xs text-slate-400">{{ scope.row.customerPhone || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="外部状态" width="130">
            <template #default="scope">
              <el-tag :type="statusTagType(scope.row.externalStatus)">{{ scope.row.externalStatus || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="同步状态" width="120">
            <template #default="scope">
              <el-tag :type="syncTagType(scope.row.syncStatus)" effect="plain">{{ scope.row.syncStatus || '-' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <el-table :data="apiResults" border stripe empty-text="暂无联调结果">
          <el-table-column label="接口" prop="apiName" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.success ? 'success' : 'warning'">{{ scope.row.success ? '成功' : '需处理' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="logid" prop="logId" min-width="160" show-overflow-tooltip>
            <template #default="scope">{{ scope.row.logId || '-' }}</template>
          </el-table-column>
          <el-table-column label="提示" prop="message" min-width="240" show-overflow-tooltip />
          <el-table-column label="接口地址" prop="endpoint" min-width="300" show-overflow-tooltip />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="showResult(scope.row)">响应</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="p-2 pt-0">
      <el-card shadow="hover" class="yy-inventory-panel">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">商户直连 / 预约库存</div>
              <div class="mt-1 text-xs text-gray-500">开通商户直连后，先创建库存 SKU，再保存实时库存，最后通知抖音拉取库存。</div>
            </div>
            <el-tag type="primary" effect="plain">life.capacity.goods_booking_ari_operate</el-tag>
          </div>
        </template>

        <el-form :model="inventoryForm" :inline="true" label-width="110px">
          <el-form-item label="门店ID">
            <el-input v-model="inventoryForm.storeId" placeholder="可空" clearable class="!w-[140px]" />
          </el-form-item>
          <el-form-item label="account_id">
            <el-input v-model="inventoryForm.accountId" placeholder="Rpc-Transit-Life-Account" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="poi_id">
            <el-input v-model="inventoryForm.poiId" placeholder="测试 POI / 门店 POI" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="sku_id">
            <el-input v-model="inventoryForm.skuId" placeholder="抖音 sku_id" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="sku_out_id">
            <el-input v-model="inventoryForm.skuOutId" placeholder="三方 sku_out_id" clearable class="!w-[180px]" />
          </el-form-item>
          <el-form-item label="sku名称">
            <el-input v-model="inventoryForm.skuName" placeholder="如：证件照预约" clearable class="!w-[180px]" />
          </el-form-item>
          <el-form-item label="操作类型">
            <el-input-number v-model="inventoryForm.skuOperateType" :min="1" :max="2" :step="1" class="!w-[130px]" />
          </el-form-item>
          <el-form-item label="接待单元">
            <el-input v-model="inventoryForm.receptionUnitId" placeholder="room_id，可空" clearable class="!w-[180px]" />
          </el-form-item>
          <el-form-item label="时间粒度">
            <el-input-number v-model="inventoryForm.timeSlot" :min="5" :max="1440" :step="5" class="!w-[150px]" />
          </el-form-item>
          <el-form-item label="日期">
            <el-input v-model="inventoryForm.date" placeholder="yyyy-MM-dd" clearable class="!w-[160px]" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input v-model="inventoryForm.startTime" placeholder="HH:mm" clearable class="!w-[130px]" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input v-model="inventoryForm.endTime" placeholder="HH:mm" clearable class="!w-[130px]" />
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number v-model="inventoryForm.availableStock" :min="0" :max="999999" class="!w-[140px]" />
          </el-form-item>
          <el-form-item label="测试数据头">
            <el-switch v-model="inventoryForm.useTestDataHeader" inline-prompt active-text="开" inactive-text="关" />
          </el-form-item>
        </el-form>

        <el-input
          v-model="inventoryRawPayload"
          class="mb-3"
          type="textarea"
          :rows="4"
          placeholder="可选：粘贴官方 JSON body，提交时 rawPayload 会优先作为请求体"
        />

        <div class="flex flex-wrap gap-2">
          <el-button type="primary" icon="Box" :loading="inventoryLoading === 'sku'" :disabled="inventoryBusy" @click="runInventorySkuUpsert"
            >创建/更新库存 SKU</el-button
          >
          <el-button type="success" icon="Goods" :loading="inventoryLoading === 'save'" :disabled="inventoryBusy" @click="runRealtimeStockSave"
            >保存实时库存</el-button
          >
          <el-button type="warning" icon="Bell" :loading="inventoryLoading === 'trigger'" :disabled="inventoryBusy" @click="runStockTrigger"
            >通知抖音拉取库存</el-button
          >
          <el-button
            type="primary"
            plain
            icon="Calendar"
            :loading="inventoryLoading === 'timeSave'"
            :disabled="inventoryBusy"
            @click="runTimeStockSave"
            >保存时段库存</el-button
          >
          <el-button icon="Search" :loading="inventoryLoading === 'timeGet'" :disabled="inventoryBusy" @click="runTimeStockGet"
            >查询时段库存</el-button
          >
        </div>
      </el-card>
    </div>

    <div class="p-2 pt-0">
      <el-card shadow="hover">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">接单 / 拒单参数</div>
              <div class="mt-1 text-xs text-gray-500">
                确认按钮会调用 `/goodlife/v1/comprehensive/trade/order/confirm/`，结果同步到渠道映射与日志。
              </div>
            </div>
            <el-tag type="success" effect="plain">book_id / confirm_result</el-tag>
          </div>
        </template>

        <el-form :model="confirmForm" :inline="true" label-width="110px">
          <el-form-item label="book_id">
            <el-input v-model="confirmForm.bookId" placeholder="综合预约 book_id" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="接单结果">
            <el-select v-model="confirmForm.confirmResult" class="!w-[150px]">
              <el-option label="接单" :value="1" />
              <el-option label="拒单" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="履约类型">
            <el-select v-model="confirmForm.fulfilType" clearable class="!w-[150px]">
              <el-option label="到店服务" :value="1" />
              <el-option label="预约履约" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="商家备注">
            <el-input v-model="confirmForm.merchantNotes" placeholder="内部备注" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="拒单原因">
            <el-input v-model="confirmForm.reason" placeholder="拒单说明" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="拒单码">
            <el-input v-model="confirmForm.rejectCode" placeholder="reject_code" clearable class="!w-[160px]" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="p-2 pt-0">
      <el-card shadow="hover">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="text-sm font-semibold text-slate-900">整单核销参数</div>
              <div class="mt-1 text-xs text-gray-500">三方码商品优先填 `codes`；抖音码场景填 `verify_token`。默认按整单核销提交。</div>
            </div>
            <el-tag type="danger" effect="plain">/goodlife/v1/fulfilment/certificate/verify/</el-tag>
          </div>
        </template>

        <el-form :model="verifyForm" :inline="true" label-width="110px">
          <el-form-item label="poi_id">
            <el-input v-model="verifyForm.poiId" placeholder="测试 POI / 门店 POI" clearable class="!w-[220px]" />
          </el-form-item>
          <el-form-item label="order_id">
            <el-input v-model="verifyForm.orderId" placeholder="抖音订单号，三方券码必填" clearable class="!w-[230px]" />
          </el-form-item>
          <el-form-item label="券码 codes">
            <el-input v-model="verifyForm.codes" placeholder="多个用英文逗号分隔" clearable class="!w-[260px]" />
          </el-form-item>
          <el-form-item label="verify_token">
            <el-input v-model="verifyForm.verifyToken" placeholder="抖音码核销 token" clearable class="!w-[240px]" />
          </el-form-item>
          <el-form-item label="整单核销">
            <el-switch v-model="verifyForm.totalVerify" inline-prompt active-text="是" inactive-text="否" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="p-2 pt-0">
      <YyChannelWorkbench
        channel-title="抖音来客"
        channel-type="DOUYIN_LIFE"
        subtitle="B-026：生活服务团购订单主线，先跑通查单、接单、拒单、支付通知和本地映射。"
        default-open-tip="抖音来客生活服务应用未开通，请先准备 client_key、client_secret、account_id、测试店铺和回调地址。"
        :integration-notes="integrationNotes"
      />
    </div>

    <el-drawer v-model="resultVisible" title="抖音来客接口响应" size="660px" append-to-body>
      <el-descriptions v-if="currentResult" :column="1" border>
        <el-descriptions-item label="接口">{{ currentResult.apiName }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ currentResult.success ? '成功' : '需处理' }}</el-descriptions-item>
        <el-descriptions-item label="logid">{{ currentResult.logId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误码">{{ currentResult.errorCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求摘要">{{ currentResult.requestSummary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提示">{{ currentResult.message || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-input class="mt-3" :model-value="currentResult?.rawResponse || ''" type="textarea" :rows="18" readonly />
    </el-drawer>

    <el-dialog v-model="entryDialogVisible" title="抖音来客真实下单入口配置" width="760px" append-to-body>
      <el-form :model="entryForm" label-width="120px">
        <el-form-item label="门店ID">
          <el-input v-model="entryForm.storeId" placeholder="可空；绑定门店后用于筛选和排查" clearable />
        </el-form-item>
        <el-form-item label="本地产品ID">
          <el-input v-model="entryForm.productId" placeholder="影约云本地产品 ID" clearable />
        </el-form-item>
        <el-form-item label="来客商品ID">
          <el-input v-model="entryForm.externalProductId" placeholder="抖音来客商品 ID" clearable />
        </el-form-item>
        <el-form-item label="来客SKU">
          <el-input v-model="entryForm.externalSkuId" placeholder="抖音 SKU ID，可空" clearable />
        </el-form-item>
        <el-form-item label="来客POI">
          <el-input v-model="entryForm.externalPoiId" placeholder="抖音 POI / 门店 ID，可空" clearable />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="entryForm.externalName" placeholder="后台显示名，如证件照预约套餐" clearable />
        </el-form-item>
        <el-form-item label="入口URL">
          <el-input v-model="entryForm.landingUrl" placeholder="https://www.douyin.com/..." clearable />
        </el-form-item>
        <el-form-item label="入口路径">
          <el-input v-model="entryForm.landingPath" placeholder="pages/life/goods/detail?..." clearable />
        </el-form-item>
        <el-form-item label="映射状态">
          <el-select v-model="entryForm.mappingStatus" class="w-full">
            <el-option label="已映射" value="MAPPED" />
            <el-option label="未映射" value="UNMAPPED" />
            <el-option label="已停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="entryForm.remark" type="textarea" :rows="3" placeholder="商品链接来源、测试店铺、配置说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="entryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="entrySaving" @click="saveLifeEntry">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  getYyChannelSyncHealth,
  getYyChannelTimeStock,
  getYyChannelClientToken,
  listYyChannelEventInbox,
  listYyChannelAcceptanceCases,
  postYyChannelInventorySkuUpsert,
  postYyChannelConfirmOrder,
  postYyChannelRealtimeStockSave,
  postYyChannelStockTrigger,
  postYyChannelTimeStockSave,
  postYyChannelVerifyOrder,
  postYyChannelWebhook,
  retryYyChannelEventInbox,
  searchYyChannelOrders,
  syncYyChannelOrders
} from '@/api/yy/channel';
import {
  addYyChannelProductMapping,
  listYyChannelProductMapping,
  updateYyChannelProductMapping
} from '@/api/yy/channelProductMapping';
import type {
  YyChannelAcceptanceCaseVO,
  YyChannelApiResultVO,
  YyChannelEventInboxQuery,
  YyChannelEventInboxVO,
  YyChannelInventoryQuery,
  YyChannelOrderQuery,
  YyChannelOrderVO,
  YyChannelSyncHealthVO
} from '@/api/yy/channel/types';
import type { YyChannelProductMappingForm, YyChannelProductMappingVO } from '@/api/yy/channelProductMapping/types';
import YyChannelWorkbench from '@/views/yy/components/YyChannelWorkbench.vue';
import { buildDouyinRecentSyncQuery, buildSyncResultMessage, isSyncSuccess } from '@/views/yy/utils/douyinLife';

const integrationNotes = [
  '商家侧查单走 /goodlife/v1/trade/order/query/',
  '预约确认走 /goodlife/v1/comprehensive/trade/order/confirm/',
  '预约库存走 /goodlife/v1/goods/comprehensive/reception/...，商户直连开通后使用',
  '支付通知和创建预约单以 webhook 方式回推到本地',
  '测试数据头会加 Rpc-Persist-Life-Test-Data-Access: all，只用于单独的测试店铺/测试商品数据域，正式环境关闭',
  '通过来客后台创建测试商品时，需要浏览器插件 ModHeader 带同一个测试数据请求头',
  '订单映射统一写入 yy_channel_order_mapping 和 yy_channel_sync_log'
];

const lifeQuery = reactive<YyChannelOrderQuery>({
  storeId: '',
  channelType: 'DOUYIN_LIFE',
  keyword: '',
  openId: '',
  accountId: '',
  orderId: '',
  outOrderNo: '',
  orderStatus: '',
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10,
  useTestDataHeader: false
});

const confirmForm = reactive<YyChannelOrderQuery>({
  bookId: '',
  confirmResult: 1,
  fulfilType: 1,
  merchantNotes: '',
  reason: '',
  rejectCode: ''
});

const verifyForm = reactive<YyChannelOrderQuery>({
  orderId: '',
  poiId: '',
  codes: '',
  verifyToken: '',
  totalVerify: true
});

const inventoryForm = reactive<YyChannelInventoryQuery>({
  storeId: '',
  channelType: 'DOUYIN_LIFE',
  accountId: '',
  poiId: '',
  skuId: '',
  skuOutId: '',
  skuName: '证件照预约',
  skuOperateType: 1,
  receptionUnitId: '',
  timeSlot: 30,
  date: '',
  startDate: '',
  endDate: '',
  startTime: '10:00',
  endTime: '10:30',
  availableStock: 6,
  useTestDataHeader: false
});

const createEntryForm = (): YyChannelProductMappingForm => ({
  id: undefined,
  storeId: '',
  productId: '',
  channelType: 'DOUYIN_LIFE',
  externalProductId: '',
  externalSkuId: '',
  externalPoiId: '',
  landingUrl: '',
  landingPath: '',
  externalName: '',
  mappingStatus: 'MAPPED',
  remark: ''
});

const apiResults = ref<YyChannelApiResultVO[]>([]);
const currentResult = ref<YyChannelApiResultVO>();
const resultVisible = ref(false);
const tokenLoading = ref(false);
const queryLoading = ref(false);
const syncLoading = ref(false);
const syncRange = ref('');
const confirmLoading = ref(false);
const verifyLoading = ref(false);
const webhookLoading = ref(false);
const inventoryLoading = ref('');
const logidLoading = ref(false);
const healthLoading = ref(false);
const inboxLoading = ref(false);
const retryingInboxId = ref<string | number>('');
const lifeOrders = ref<YyChannelOrderVO[]>([]);
const acceptanceCases = ref<YyChannelAcceptanceCaseVO[]>([]);
const syncHealth = ref<YyChannelSyncHealthVO>();
const inboxEvents = ref<YyChannelEventInboxVO[]>([]);
const inboxTotal = ref(0);
const lifeEntries = ref<YyChannelProductMappingVO[]>([]);
const inventoryRawPayload = ref('');
const orderQueryTouched = ref(false);
const entryDialogVisible = ref(false);
const entryLoading = ref(false);
const entrySaving = ref(false);
const entryForm = reactive<YyChannelProductMappingForm>(createEntryForm());
const inboxQuery = reactive<YyChannelEventInboxQuery>({
  pageNum: 1,
  pageSize: 5,
  processStatus: ''
});
const router = useRouter();

const lifeActionBusy = computed(
  () => tokenLoading.value || queryLoading.value || syncLoading.value || confirmLoading.value || verifyLoading.value || webhookLoading.value
);
const inventoryBusy = computed(() => !!inventoryLoading.value);
const latestBlockingResult = computed(() => {
  const latest = apiResults.value[0];
  return latest && !latest.success ? latest : undefined;
});
const latestBlockingTitle = computed(() => (latestBlockingResult.value ? `最近需处理：${latestBlockingResult.value.apiName}` : ''));
const latestBlockingDesc = computed(() => {
  const result = latestBlockingResult.value;
  if (!result) {
    return '';
  }
  const parts = [result.message || '接口返回需处理'];
  if (result.logId) {
    parts.push(`logid ${result.logId}`);
  }
  if (result.errorCode) {
    parts.push(`错误码 ${result.errorCode}`);
  }
  return parts.join(' · ');
});

const logidCards = computed(() => acceptanceCases.value);

const resetEntryForm = () => {
  Object.assign(entryForm, createEntryForm());
};

const normalizedEntryForm = (): YyChannelProductMappingForm => ({
  ...entryForm,
  storeId: entryForm.storeId || undefined,
  productId: entryForm.productId,
  channelType: 'DOUYIN_LIFE',
  externalProductId: entryForm.externalProductId?.trim(),
  externalSkuId: entryForm.externalSkuId?.trim(),
  externalPoiId: entryForm.externalPoiId?.trim(),
  landingUrl: entryForm.landingUrl?.trim(),
  landingPath: entryForm.landingPath?.trim(),
  externalName: entryForm.externalName?.trim(),
  mappingStatus: entryForm.mappingStatus || 'MAPPED',
  remark: entryForm.remark?.trim()
});

const upsertResult = (result: YyChannelApiResultVO) => {
  apiResults.value = [result, ...apiResults.value.filter((item) => item.apiName !== result.apiName)];
};

const normalizedQuery = () => ({
  ...lifeQuery,
  storeId: lifeQuery.storeId || undefined,
  openId: lifeQuery.openId || undefined,
  accountId: lifeQuery.accountId || undefined,
  orderId: lifeQuery.orderId || undefined,
  outOrderNo: lifeQuery.outOrderNo || undefined,
  orderStatus: lifeQuery.orderStatus || undefined,
  startTime: lifeQuery.startTime || undefined,
  endTime: lifeQuery.endTime || undefined
});

const normalizedInventory = (): YyChannelInventoryQuery | null => {
  let rawPayload: Record<string, any> | undefined;
  if (inventoryRawPayload.value.trim()) {
    try {
      rawPayload = JSON.parse(inventoryRawPayload.value);
    } catch (error: any) {
      ElMessage.error(`rawPayload 不是合法 JSON：${error?.message || error}`);
      return null;
    }
  }
  return {
    ...inventoryForm,
    storeId: inventoryForm.storeId || undefined,
    accountId: inventoryForm.accountId || lifeQuery.accountId || undefined,
    poiId: inventoryForm.poiId || undefined,
    skuId: inventoryForm.skuId || undefined,
    skuOutId: inventoryForm.skuOutId || undefined,
    skuName: inventoryForm.skuName || undefined,
    skuOperateType: inventoryForm.skuOperateType || undefined,
    receptionUnitId: inventoryForm.receptionUnitId || undefined,
    date: inventoryForm.date || undefined,
    startDate: inventoryForm.startDate || inventoryForm.date || undefined,
    endDate: inventoryForm.endDate || inventoryForm.date || undefined,
    startTime: inventoryForm.startTime || undefined,
    endTime: inventoryForm.endTime || undefined,
    rawPayload
  };
};

const pushInventoryResult = async (result: YyChannelApiResultVO, endpoint: string) => {
  upsertResult({
    ...result,
    channelType: 'DOUYIN_LIFE',
    endpoint: endpoint || result.endpoint
  });
  if (result.success) {
    ElMessage.success(result.message || '库存接口调用成功');
  } else {
    ElMessage.warning(result.message || '库存接口返回需处理');
  }
  await fetchRecentLogids();
};

const runClientToken = async () => {
  tokenLoading.value = true;
  try {
    const res = await getYyChannelClientToken('DOUYIN_LIFE', normalizedQuery());
    upsertResult(res.data);
  } finally {
    tokenLoading.value = false;
  }
};

const runOrderQuery = async () => {
  queryLoading.value = true;
  orderQueryTouched.value = true;
  try {
    const res = await searchYyChannelOrders('DOUYIN_LIFE', normalizedQuery());
    lifeOrders.value = res.data || [];
    const linkedCount = lifeOrders.value.filter((item) => item.localOrderId).length;
    upsertResult({
      channelType: 'DOUYIN_LIFE',
      apiName: 'life_order_query_list',
      endpoint: '/yy/channel/DOUYIN_LIFE/orders',
      success: true,
      message: `已返回 ${lifeOrders.value.length} 条订单，本地已关联 ${linkedCount} 条`,
      rawResponse: JSON.stringify(lifeOrders.value, null, 2),
      requestSummary: JSON.stringify(normalizedQuery(), null, 2),
      missingConfig: []
    });
  } finally {
    queryLoading.value = false;
  }
};

const syncRecentOrders = async (days: number) => {
  syncLoading.value = true;
  syncRange.value = days === 1 ? '24h' : '7d';
  try {
    const syncQuery = buildDouyinRecentSyncQuery(days, lifeQuery);
    lifeQuery.orderId = '';
    lifeQuery.outOrderNo = '';
    lifeQuery.openId = '';
    lifeQuery.startTime = syncQuery.startTime;
    lifeQuery.endTime = syncQuery.endTime;
    lifeQuery.pageSize = syncQuery.pageSize;
    const res = await syncYyChannelOrders('DOUYIN_LIFE', syncQuery);
    const result = res.data;
    const message = buildSyncResultMessage(result);
    upsertResult({
      channelType: result.channelType,
      apiName: 'life_order_sync',
      endpoint: '/yy/channel/DOUYIN_LIFE/orders/sync',
      success: isSyncSuccess(result),
      message,
      rawResponse: JSON.stringify(result, null, 2),
      requestSummary: JSON.stringify(syncQuery, null, 2),
      missingConfig: []
    });
    if (isSyncSuccess(result)) {
      ElMessage.success(message);
    } else {
      ElMessage.warning(message);
    }
    await refreshSyncHealthPanel();
  } finally {
    syncLoading.value = false;
    syncRange.value = '';
  }
};

const runInventorySkuUpsert = async () => {
  const payload = normalizedInventory();
  if (!payload) {
    return;
  }
  inventoryLoading.value = 'sku';
  try {
    const res = await postYyChannelInventorySkuUpsert('DOUYIN_LIFE', payload);
    await pushInventoryResult(res.data, '/yy/channel/DOUYIN_LIFE/reservation/inventory-sku/upsert');
  } finally {
    inventoryLoading.value = '';
  }
};

const runRealtimeStockSave = async () => {
  const payload = normalizedInventory();
  if (!payload) {
    return;
  }
  inventoryLoading.value = 'save';
  try {
    const res = await postYyChannelRealtimeStockSave('DOUYIN_LIFE', payload);
    await pushInventoryResult(res.data, '/yy/channel/DOUYIN_LIFE/reservation/stock/save');
  } finally {
    inventoryLoading.value = '';
  }
};

const runStockTrigger = async () => {
  const payload = normalizedInventory();
  if (!payload) {
    return;
  }
  inventoryLoading.value = 'trigger';
  try {
    const res = await postYyChannelStockTrigger('DOUYIN_LIFE', payload);
    await pushInventoryResult(res.data, '/yy/channel/DOUYIN_LIFE/reservation/stock/trigger');
  } finally {
    inventoryLoading.value = '';
  }
};

const runTimeStockSave = async () => {
  const payload = normalizedInventory();
  if (!payload) {
    return;
  }
  inventoryLoading.value = 'timeSave';
  try {
    const res = await postYyChannelTimeStockSave('DOUYIN_LIFE', payload);
    await pushInventoryResult(res.data, '/yy/channel/DOUYIN_LIFE/reservation/time-stock/save');
  } finally {
    inventoryLoading.value = '';
  }
};

const runTimeStockGet = async () => {
  const payload = normalizedInventory();
  if (!payload) {
    return;
  }
  inventoryLoading.value = 'timeGet';
  try {
    const res = await getYyChannelTimeStock('DOUYIN_LIFE', payload);
    await pushInventoryResult(res.data, '/yy/channel/DOUYIN_LIFE/reservation/time-stock/get');
  } finally {
    inventoryLoading.value = '';
  }
};

const runConfirm = async () => {
  confirmLoading.value = true;
  try {
    const payload = {
      ...confirmForm,
      bookId: confirmForm.bookId || lifeQuery.orderId || lifeQuery.outOrderNo,
      accountId: lifeQuery.accountId || undefined
    };
    const res = await postYyChannelConfirmOrder('DOUYIN_LIFE', payload);
    upsertResult({
      ...res.data,
      channelType: 'DOUYIN_LIFE',
      apiName: 'life_order_confirm',
      endpoint: '/yy/channel/DOUYIN_LIFE/confirm'
    });
    await refreshSyncHealthPanel();
  } finally {
    confirmLoading.value = false;
  }
};

const runVerify = async () => {
  verifyLoading.value = true;
  try {
    const payload = {
      ...verifyForm,
      orderId: verifyForm.orderId || lifeQuery.orderId || undefined,
      accountId: lifeQuery.accountId || undefined
    };
    const res = await postYyChannelVerifyOrder('DOUYIN_LIFE', payload);
    upsertResult({
      ...res.data,
      channelType: 'DOUYIN_LIFE',
      apiName: 'life_order_verify',
      endpoint: '/yy/channel/DOUYIN_LIFE/verify'
    });
    await refreshSyncHealthPanel();
  } finally {
    verifyLoading.value = false;
  }
};

const runWebhookDemo = async () => {
  webhookLoading.value = true;
  try {
    const payload = JSON.stringify({
      event: 'order_payment_notice',
      order_id: lifeQuery.orderId || 'DY-LIFE-DEMO-ORDER',
      out_order_no: lifeQuery.outOrderNo || 'DY-LIFE-DEMO-OUT',
      order_status: 'PAY_SUCCESS',
      account_id: lifeQuery.accountId || 'sandbox_account_id'
    });
    const res = (await postYyChannelWebhook('DOUYIN_LIFE', payload)) as any;
    upsertResult({
      channelType: 'DOUYIN_LIFE',
      apiName: 'order_payment_notice_webhook',
      endpoint: '/yy/channel/DOUYIN_LIFE/webhook',
      success: !!res.data?.processed,
      message: res.data?.message || 'webhook 已返回',
      rawResponse: JSON.stringify(res.data, null, 2),
      requestSummary: payload,
      missingConfig: []
    });
    await refreshSyncHealthPanel();
  } finally {
    webhookLoading.value = false;
  }
};

const fetchRecentLogids = async () => {
  logidLoading.value = true;
  try {
    const res = await listYyChannelAcceptanceCases('DOUYIN_LIFE');
    acceptanceCases.value = res.data || [];
  } finally {
    logidLoading.value = false;
  }
};

const fetchSyncHealth = async () => {
  healthLoading.value = true;
  try {
    const res = await getYyChannelSyncHealth('DOUYIN_LIFE');
    syncHealth.value = res.data;
  } finally {
    healthLoading.value = false;
  }
};

const fetchEventInbox = async () => {
  inboxLoading.value = true;
  try {
    const query = {
      ...inboxQuery,
      processStatus: inboxQuery.processStatus || undefined
    };
    const res = (await listYyChannelEventInbox('DOUYIN_LIFE', query)) as any;
    inboxEvents.value = res.rows ?? res.data ?? [];
    inboxTotal.value = res.total ?? inboxEvents.value.length;
  } finally {
    inboxLoading.value = false;
  }
};

const refreshSyncHealthPanel = async () => {
  await Promise.all([fetchSyncHealth(), fetchEventInbox(), fetchRecentLogids()]);
};

const canRetryInboxEvent = (row: YyChannelEventInboxVO) => {
  return ['FAILED', 'RETRY', 'DEAD', 'RECEIVED'].includes(row.processStatus);
};

const retryInboxEvent = async (row: YyChannelEventInboxVO) => {
  if (!row?.id) {
    ElMessage.warning('当前事件缺少 ID，无法重试');
    return;
  }
  retryingInboxId.value = row.id;
  try {
    await retryYyChannelEventInbox('DOUYIN_LIFE', row.id);
    ElMessage.success('事件已重新放回可处理状态');
    await refreshSyncHealthPanel();
  } finally {
    retryingInboxId.value = '';
  }
};

const fetchLifeEntries = async () => {
  entryLoading.value = true;
  try {
    const res = (await listYyChannelProductMapping({
      channelType: 'DOUYIN_LIFE',
      pageNum: 1,
      pageSize: 50
    })) as any;
    lifeEntries.value = res.rows ?? res.data ?? [];
  } finally {
    entryLoading.value = false;
  }
};

const openEntryDialog = (row?: YyChannelProductMappingVO) => {
  resetEntryForm();
  if (row) {
    Object.assign(entryForm, {
      id: row.id,
      storeId: row.storeId || '',
      productId: row.productId || '',
      channelType: 'DOUYIN_LIFE',
      externalProductId: row.externalProductId || '',
      externalSkuId: row.externalSkuId || '',
      externalPoiId: row.externalPoiId || '',
      landingUrl: row.landingUrl || '',
      landingPath: row.landingPath || '',
      externalName: row.externalName || '',
      mappingStatus: row.mappingStatus || 'MAPPED',
      remark: row.remark || ''
    });
  }
  entryDialogVisible.value = true;
};

const saveLifeEntry = async () => {
  const payload = normalizedEntryForm();
  if (!payload.productId) {
    ElMessage.warning('请先填写本地产品ID');
    return;
  }
  if (!payload.externalProductId) {
    ElMessage.warning('请先填写抖音来客商品ID');
    return;
  }
  entrySaving.value = true;
  try {
    if (payload.id) {
      await updateYyChannelProductMapping(payload);
    } else {
      await addYyChannelProductMapping(payload);
    }
    ElMessage.success('真实下单入口配置已保存');
    entryDialogVisible.value = false;
    await fetchLifeEntries();
  } finally {
    entrySaving.value = false;
  }
};

const copyLifeEntry = async (row: YyChannelProductMappingVO) => {
  const entry = row.landingUrl || row.landingPath;
  if (!entry) {
    ElMessage.warning('当前入口没有 URL 或路径可复制');
    return;
  }
  try {
    await navigator.clipboard.writeText(entry);
    ElMessage.success('真实下单入口已复制');
  } catch {
    ElMessage.error('复制失败，请手动选中入口内容复制');
  }
};

const copyFirstLifeEntry = async () => {
  const firstEntry = lifeEntries.value.find((item) => item.landingUrl || item.landingPath);
  if (!firstEntry) {
    ElMessage.warning('暂无可复制的真实下单入口');
    return;
  }
  await copyLifeEntry(firstEntry);
};

const openDouyinLifeOrders = () => {
  router.push({
    path: '/yy/order',
    query: {
      source: 'DOUYIN_LIFE'
    }
  });
};

const openAllChannelExport = () => {
  router.push({
    path: '/yy/order',
    query: {
      source: 'DOUYIN_LIFE',
      intent: 'export'
    }
  });
};

const copyLogid = async (logid?: string) => {
  if (!logid) {
    ElMessage.warning('当前还没有可复制的 logid');
    return;
  }
  await navigator.clipboard.writeText(logid);
  ElMessage.success('logid 已复制');
};

const showResult = (row: YyChannelApiResultVO) => {
  currentResult.value = row;
  resultVisible.value = true;
};

const statusTagType = (status?: string) => {
  if (!status) {
    return 'info';
  }
  if (['PAY_SUCCESS', 'PAID', 'CONFIRMED', 'COMPLETED', 'FINISHED', '4'].includes(status)) {
    return 'success';
  }
  if (['CANCELLED', 'CANCELED', 'CANCEL', '5'].includes(status)) {
    return 'danger';
  }
  if (['PENDING', '1', '2', '3'].includes(status)) {
    return 'warning';
  }
  return 'info';
};

const syncTagType = (status?: string) => {
  if (status === 'SYNCED') {
    return 'success';
  }
  if (status === 'FAILED') {
    return 'danger';
  }
  return 'info';
};

const healthTagType = (status?: string) => {
  if (status === 'HEALTHY') {
    return 'success';
  }
  if (status === 'WARNING') {
    return 'warning';
  }
  if (status === 'DEGRADED') {
    return 'danger';
  }
  return 'info';
};

const inboxStatusTagType = (status?: string) => {
  if (status === 'PROCESSED' || status === 'DONE') {
    return 'success';
  }
  if (status === 'FAILED' || status === 'DEAD') {
    return 'danger';
  }
  if (status === 'RECEIVED' || status === 'RETRY' || status === 'PROCESSING') {
    return 'warning';
  }
  return 'info';
};

const acceptanceStatusType = (status?: string) => {
  if (status === 'READY') {
    return 'success';
  }
  if (status === 'FAILED') {
    return 'danger';
  }
  if (status === 'NO_LOGID') {
    return 'warning';
  }
  return 'info';
};

onMounted(() => {
  fetchRecentLogids();
  fetchSyncHealth();
  fetchEventInbox();
  fetchLifeEntries();
});
</script>

<style scoped lang="scss">
.yy-life-hero {
  border: 1px solid var(--el-border-color-light);
}

.yy-life-hero-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 430px);
  gap: 18px;
  align-items: start;
}

.yy-life-hero-copy {
  min-width: 0;
}

.yy-life-hero-meta {
  width: 100%;

  :deep(.el-descriptions__label) {
    width: 92px;
    color: #475569;
    font-weight: 600;
  }
}

.yy-life-steps {
  :deep(.el-step__title) {
    font-weight: 600;
  }

  :deep(.el-step__description) {
    line-height: 1.5;
  }
}

.yy-life-shell {
  border: 1px solid var(--el-border-color-light);
}

.yy-life-order-guide {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.yy-life-order-guide-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 112px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: #f8fafc;
}

.yy-life-order-guide-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 30px;
  padding: 0 7px;
  border-radius: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.yy-life-order-guide-copy {
  min-width: 0;
}

.yy-life-order-guide-copy strong,
.yy-life-order-guide-copy small {
  display: block;
  overflow: hidden;
  line-height: 1.45;
  text-overflow: ellipsis;
}

.yy-life-order-guide-copy strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.yy-life-order-guide-copy small {
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.yy-life-order-guide-item > .el-button,
.yy-life-order-guide-actions {
  grid-column: 2;
  justify-self: start;
}

.yy-life-order-guide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.yy-inventory-panel {
  border: 1px solid var(--el-border-color-light);
}

.yy-logid-panel {
  border: 1px solid var(--el-border-color-light);
}

.yy-logid-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.yy-logid-item {
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  background: #f8fafc;
}

.yy-sync-health-panel {
  border: 1px solid var(--el-border-color-light);
}

.yy-sync-health-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.yy-sync-health-item {
  min-width: 0;
  min-height: 96px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: #f8fafc;
}

.yy-sync-health-item span,
.yy-sync-health-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.yy-sync-health-item span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.yy-sync-health-item strong {
  display: block;
  margin-top: 8px;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-sync-health-item small {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-inbox-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 12px;
}

@media (max-width: 960px) {
  .yy-life-hero-main,
  .yy-life-order-guide,
  .yy-sync-health-grid {
    grid-template-columns: 1fr;
  }

  .yy-logid-grid,
  .yy-inbox-toolbar {
    grid-template-columns: 1fr;
  }

  .yy-inbox-toolbar {
    display: grid;
  }
}
</style>
