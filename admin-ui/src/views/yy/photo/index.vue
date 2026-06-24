<template>
  <div class="p-2">
    <el-card shadow="never" class="yy-photo-overview">
      <div class="yy-photo-overview-head">
        <div>
          <div class="yy-photo-overview-title">客片选片工作台</div>
          <div class="yy-photo-overview-subtitle">统一管理客户取片相册、底片上传和访问审计。</div>
        </div>
        <el-tag type="success" effect="plain">私有 OSS + 短期授权</el-tag>
      </div>
      <div class="yy-photo-overview-grid">
        <div class="yy-photo-metric">
          <span class="yy-photo-metric-label">相册</span>
          <strong>{{ albumTotal }}</strong>
          <span class="yy-photo-metric-copy">当前筛选结果</span>
        </div>
        <div class="yy-photo-metric">
          <span class="yy-photo-metric-label">底片</span>
          <strong>{{ assetTotal }}</strong>
          <span class="yy-photo-metric-copy">可切换图库查看</span>
        </div>
        <div class="yy-photo-metric">
          <span class="yy-photo-metric-label">访问审计</span>
          <strong>{{ accessLogTotal }}</strong>
          <span class="yy-photo-metric-copy">{{ accessLogLoaded ? '已加载' : '进入审计后加载' }}</span>
        </div>
        <div class="yy-photo-metric">
          <span class="yy-photo-metric-label">当前视图</span>
          <strong>{{ activeTabLabel }}</strong>
          <span class="yy-photo-metric-copy">{{ activeFilterSummary }}</span>
        </div>
      </div>
    </el-card>

    <el-tabs v-model="activeTab" class="yy-photo-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="相册列表" name="album">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showAlbumSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="albumQueryFormRef" :model="albumQueryParams" :inline="true">
                <el-form-item label="门店ID" prop="storeId">
                  <el-input v-model="albumQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleAlbumQuery" />
                </el-form-item>
                <el-form-item label="订单ID" prop="orderId">
                  <el-input v-model="albumQueryParams.orderId" placeholder="请输入订单ID" clearable @keyup.enter="handleAlbumQuery" />
                </el-form-item>
                <el-form-item label="相册名称" prop="albumName">
                  <el-input v-model="albumQueryParams.albumName" placeholder="请输入相册名称" clearable @keyup.enter="handleAlbumQuery" />
                </el-form-item>
                <el-form-item label="选片状态" prop="selectionStatus">
                  <el-select v-model="albumQueryParams.selectionStatus" placeholder="请选择状态" clearable class="!w-[140px]">
                    <el-option v-for="item in selectionStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleAlbumQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetAlbumQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAlbum:add']" type="primary" plain icon="Plus" @click="handleAlbumAdd">新增相册</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAlbum:edit']" type="success" plain :disabled="albumSingle" icon="Edit" @click="handleAlbumUpdate()">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAlbum:remove']" type="danger" plain :disabled="albumMultiple" icon="Delete" @click="handleAlbumDelete()">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAlbum:export']" type="warning" plain icon="Download" @click="handleAlbumExport">导出</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showAlbumSearch" @query-table="getAlbumList" />
            </el-row>
          </template>

          <el-table v-loading="albumLoading" border stripe :data="albumList" @selection-change="handleAlbumSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="相册名称" prop="albumName" min-width="180" fixed="left" show-overflow-tooltip />
            <el-table-column label="门店ID" prop="storeId" width="100" />
            <el-table-column label="订单ID" prop="orderId" width="100" />
            <el-table-column label="选片状态" width="110">
              <template #default="scope">
                <el-tag :type="getOptionType(selectionStatusOptions, scope.row.selectionStatus)">
                  {{ getOptionLabel(selectionStatusOptions, scope.row.selectionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="客户取片码" prop="publicToken" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                <div class="yy-pickup-code-cell">
                  <span class="yy-pickup-code">{{ resolveAlbumPickupCode(scope.row) || '-' }}</span>
                  <el-button v-if="resolveAlbumPickupCode(scope.row)" link type="primary" size="small" @click.stop="copyPickupCode(resolveAlbumPickupCode(scope.row))">复制</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="取片健康" width="110">
              <template #default="scope">
                <el-tooltip :content="getPickupDeliveryHealth(scope.row).description" placement="top">
                  <el-tag :type="getPickupDeliveryHealth(scope.row).type" effect="plain">
                    {{ getPickupDeliveryHealth(scope.row).label }}
                  </el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="运营排障" min-width="300">
              <template #default="scope">
                <div class="yy-album-ops-summary">
                  <div class="yy-album-ops-head">
                    <el-tag :type="getAlbumOperationsSummary(scope.row).type" effect="plain" size="small">
                      {{ getAlbumOperationsSummary(scope.row).label }}
                    </el-tag>
                    <span>{{ getAlbumOperationsSummary(scope.row).nextAction }}</span>
                  </div>
                  <div class="yy-album-ops-meta">
                    <span>{{ getAlbumOperationsSummary(scope.row).phoneText }}</span>
                    <span>{{ getAlbumOperationsSummary(scope.row).pickupText }}</span>
                    <span>{{ getAlbumOperationsSummary(scope.row).assetText }}</span>
                  </div>
                  <div class="yy-album-ops-issues">
                    <el-tag
                      v-for="issue in getAlbumOperationsSummary(scope.row).issues"
                      :key="issue"
                      :type="getAlbumOperationsSummary(scope.row).type"
                      effect="plain"
                      size="small"
                    >
                      {{ issue }}
                    </el-tag>
                    <el-button link type="primary" size="small" @click.stop="handleAlbumAudit(scope.row)">
                      {{ getAlbumOperationsSummary(scope.row).failureText }}
                    </el-button>
                  </div>
                  <div class="yy-album-ops-actions">
                    <template v-for="action in getAlbumOperationActions(scope.row)" :key="action.key">
                      <el-button
                        v-if="action.perms.length"
                        v-hasPermi="action.perms"
                        link
                        :type="action.type"
                        size="small"
                        :icon="action.icon"
                        @click.stop="handleAlbumOperationAction(action, scope.row)"
                      >
                        {{ action.label }}
                      </el-button>
                      <el-button v-else link :type="action.type" size="small" :icon="action.icon" @click.stop="handleAlbumOperationAction(action, scope.row)">
                        {{ action.label }}
                      </el-button>
                    </template>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="过期时间" prop="expireTime" min-width="160" />
            <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="270" fixed="right">
              <template #default="scope">
                <el-tooltip content="相册工作台" placement="top">
                  <el-button link type="primary" icon="Monitor" @click="handleAlbumWorkspace(scope.row)" />
                </el-tooltip>
                <el-tooltip content="上传照片" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:add']" link type="primary" icon="Upload" @click="handleAlbumPhotoUpload(scope.row)" />
                </el-tooltip>
                <el-tooltip content="查看底片" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:list']" link type="primary" icon="Picture" @click="handleAlbumAssets(scope.row)" />
                </el-tooltip>
                <el-tooltip content="查看已选" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:list']" link type="success" icon="Select" @click="handleAlbumSelectedAssets(scope.row)" />
                </el-tooltip>
                <el-tooltip v-if="scope.row.selectionStatus === 'SUBMITTED'" content="确认选片" placement="top">
                  <el-button v-hasPermi="['yy:photoAlbum:edit']" link type="warning" icon="Check" @click="handleAlbumSelectionConfirm(scope.row)" />
                </el-tooltip>
                <el-tooltip content="查看审计" placement="top">
                  <el-button v-hasPermi="['yy:photoAccessLog:list']" link type="primary" icon="View" @click="handleAlbumAudit(scope.row)" />
                </el-tooltip>
                <el-tooltip content="取片入口" placement="top">
                  <el-button link type="primary" icon="Link" @click="handleAlbumPickupEntry(scope.row)" />
                </el-tooltip>
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:photoAlbum:edit']" link type="primary" icon="Edit" @click="handleAlbumUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:photoAlbum:remove']" link type="danger" icon="Delete" @click="handleAlbumDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="albumTotal > 0"
            v-model:total="albumTotal"
            v-model:page="albumQueryParams.pageNum"
            v-model:limit="albumQueryParams.pageSize"
            @pagination="getAlbumList"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="底片列表" name="asset">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showAssetSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="assetQueryFormRef" :model="assetQueryParams" :inline="true">
                <el-form-item label="门店ID" prop="storeId">
                  <el-input v-model="assetQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleAssetQuery" />
                </el-form-item>
                <el-form-item label="相册ID" prop="albumId">
                  <el-input v-model="assetQueryParams.albumId" placeholder="请输入相册ID" clearable @keyup.enter="handleAssetQuery" />
                </el-form-item>
                <el-form-item label="文件名" prop="fileName">
                  <el-input v-model="assetQueryParams.fileName" placeholder="请输入文件名" clearable @keyup.enter="handleAssetQuery" />
                </el-form-item>
                <el-form-item label="是否已选" prop="isSelected">
                  <el-select v-model="assetQueryParams.isSelected" placeholder="请选择" clearable class="!w-[120px]">
                    <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="可见" prop="visible">
                  <el-select v-model="assetQueryParams.visible" placeholder="请选择" clearable class="!w-[120px]">
                    <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleAssetQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetAssetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:add']" type="primary" plain icon="Plus" @click="handleAssetAdd">新增底片</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:edit']" type="success" plain :disabled="assetSingle" icon="Edit" @click="handleAssetUpdate()">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:remove']" type="danger" plain :disabled="assetMultiple" icon="Delete" @click="handleAssetDelete()">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:edit']" type="success" plain :disabled="assetMultiple" icon="View" @click="handleAssetBatchVisible('1')">
                  批量可见
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:edit']" type="info" plain :disabled="assetMultiple" icon="Hide" @click="handleAssetBatchVisible('0')">
                  批量隐藏
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAsset:export']" type="warning" plain icon="Download" @click="handleAssetExport">导出</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-radio-group v-model="assetViewMode" size="small" @change="handleAssetViewModeChange">
                  <el-radio-button label="table">列表</el-radio-button>
                  <el-radio-button label="gallery">图库</el-radio-button>
                </el-radio-group>
              </el-col>
              <right-toolbar v-model:show-search="showAssetSearch" @query-table="getAssetList" />
            </el-row>
          </template>

          <el-table v-if="assetViewMode === 'table'" v-loading="assetLoading" border stripe :data="assetList" @selection-change="handleAssetSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="缩略图" width="120">
              <template #default="scope">
                <el-image
                  v-if="scope.row.fileUrl"
                  :src="scope.row.fileUrl"
                  fit="cover"
                  lazy
                  preview-teleported
                  :preview-src-list="[scope.row.fileUrl]"
                  class="yy-photo-thumb"
                >
                  <template #error>
                    <div class="yy-photo-thumb-placeholder">加载失败</div>
                  </template>
                </el-image>
                <div v-else class="yy-photo-thumb-placeholder">无图片</div>
              </template>
            </el-table-column>
            <el-table-column label="文件名" prop="fileName" min-width="180" fixed="left" show-overflow-tooltip />
            <el-table-column label="门店ID" prop="storeId" width="100" />
            <el-table-column label="相册ID" prop="albumId" width="100" />
            <el-table-column label="排序" prop="sort" width="80" />
            <el-table-column label="是否已选" width="100">
              <template #default="scope">
                <el-tag :type="getOptionType(yesNoOptions, scope.row.isSelected)">{{ getOptionLabel(yesNoOptions, scope.row.isSelected) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="可见" width="90">
              <template #default="scope">
                <el-tag :type="getOptionType(yesNoOptions, scope.row.visible)">{{ getOptionLabel(yesNoOptions, scope.row.visible) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="文件地址" prop="fileUrl" min-width="220" show-overflow-tooltip />
            <el-table-column label="OSS Key" prop="objectKey" min-width="220" show-overflow-tooltip />
            <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="320" fixed="right">
              <template #default="scope">
                <el-tooltip content="复制预检命令" placement="top">
                  <el-button link type="primary" icon="DocumentCopy" @click="copyAssetPreflightCommand(scope.row)" />
                </el-tooltip>
                <el-tooltip content="查看审计" placement="top">
                  <el-button v-hasPermi="['yy:photoAccessLog:list']" link type="primary" icon="View" @click="handleAssetAudit(scope.row)" />
                </el-tooltip>
                <el-tooltip content="上移" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Top" @click="handleAssetMove(scope.row, -1)" />
                </el-tooltip>
                <el-tooltip content="下移" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Bottom" @click="handleAssetMove(scope.row, 1)" />
                </el-tooltip>
                <el-tooltip content="快捷重命名" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="EditPen" @click="handleAssetQuickRename(scope.row)" />
                </el-tooltip>
                <el-tooltip content="修改" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Edit" @click="handleAssetUpdate(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button v-hasPermi="['yy:photoAsset:remove']" link type="danger" icon="Delete" @click="handleAssetDelete(scope.row)" />
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <div v-else v-loading="assetLoading" class="yy-photo-gallery">
            <el-empty v-if="!assetList.length && !assetLoading" description="暂无底片" />
            <div
              v-for="asset in assetList"
              :key="asset.id"
              class="yy-photo-gallery-card"
              :class="{ 'is-selected': assetIds.includes(asset.id) }"
              @click="toggleAssetGallerySelection(asset)"
            >
              <div class="yy-photo-gallery-image-wrap">
                <el-image
                  v-if="asset.fileUrl"
                  :src="asset.fileUrl"
                  fit="cover"
                  lazy
                  preview-teleported
                  :preview-src-list="assetPreviewList"
                  class="yy-photo-gallery-image"
                  @click.stop
                >
                  <template #error>
                    <div class="yy-photo-gallery-placeholder">加载失败</div>
                  </template>
                </el-image>
                <div v-else class="yy-photo-gallery-placeholder">无图片</div>
                <div class="yy-photo-gallery-badges">
                  <el-tag size="small" :type="getOptionType(yesNoOptions, asset.visible)">{{ getOptionLabel(yesNoOptions, asset.visible) }}</el-tag>
                  <el-tag v-if="String(asset.isSelected) === '1'" size="small" type="success">已选</el-tag>
                </div>
                <div class="yy-photo-gallery-diagnostics">
                  <el-tag v-for="item in getAssetGalleryDiagnostics(asset)" :key="item.label" size="small" :type="item.type" effect="dark">
                    {{ item.label }}
                  </el-tag>
                </div>
              </div>
              <div class="yy-photo-gallery-body">
                <div class="yy-photo-gallery-title" :title="asset.fileName">{{ asset.fileName || '未命名底片' }}</div>
                <div class="yy-photo-gallery-meta">相册 {{ asset.albumId || '-' }} · 排序 {{ asset.sort ?? 0 }}</div>
                <div class="yy-photo-gallery-actions">
                  <el-button link type="primary" icon="DocumentCopy" @click.stop="copyAssetPreflightCommand(asset)">预检</el-button>
                  <el-button v-hasPermi="['yy:photoAccessLog:list']" link type="primary" icon="View" @click.stop="handleAssetAudit(asset)">审计</el-button>
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Top" @click.stop="handleAssetMove(asset, -1)">上移</el-button>
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Bottom" @click.stop="handleAssetMove(asset, 1)">下移</el-button>
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="EditPen" @click.stop="handleAssetQuickRename(asset)">重命名</el-button>
                  <el-button v-hasPermi="['yy:photoAsset:edit']" link type="primary" icon="Edit" @click.stop="handleAssetUpdate(asset)">修改</el-button>
                  <el-button v-hasPermi="['yy:photoAsset:remove']" link type="danger" icon="Delete" @click.stop="handleAssetDelete(asset)">删除</el-button>
                </div>
              </div>
            </div>
          </div>

          <pagination
            v-if="assetTotal > 0"
            v-model:total="assetTotal"
            v-model:page="assetQueryParams.pageNum"
            v-model:limit="assetQueryParams.pageSize"
            @pagination="getAssetList"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="访问审计" name="accessLog">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showAccessLogSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="accessLogQueryFormRef" :model="accessLogQueryParams" :inline="true">
                <el-form-item label="门店ID" prop="storeId">
                  <el-input v-model="accessLogQueryParams.storeId" placeholder="请输入门店ID" clearable @keyup.enter="handleAccessLogQuery" />
                </el-form-item>
                <el-form-item label="相册ID" prop="albumId">
                  <el-input v-model="accessLogQueryParams.albumId" placeholder="请输入相册ID" clearable @keyup.enter="handleAccessLogQuery" />
                </el-form-item>
                <el-form-item label="底片ID" prop="assetId">
                  <el-input v-model="accessLogQueryParams.assetId" placeholder="请输入底片ID" clearable @keyup.enter="handleAccessLogQuery" />
                </el-form-item>
                <el-form-item label="手机号" prop="customerPhone">
                  <el-input v-model="accessLogQueryParams.customerPhone" placeholder="请输入手机号" clearable @keyup.enter="handleAccessLogQuery" />
                </el-form-item>
                <el-form-item label="平台" prop="platform">
                  <el-select v-model="accessLogQueryParams.platform" placeholder="请选择" clearable class="!w-[150px]">
                    <el-option v-for="item in photoAccessPlatformOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="动作" prop="action">
                  <el-select v-model="accessLogQueryParams.action" placeholder="请选择" clearable class="!w-[140px]">
                    <el-option v-for="item in photoAccessActionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="成功" prop="success">
                  <el-select v-model="accessLogQueryParams.success" placeholder="请选择" clearable class="!w-[120px]">
                    <el-option v-for="item in photoAccessSuccessOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleAccessLogQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetAccessLogQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button v-hasPermi="['yy:photoAccessLog:export']" type="warning" plain icon="Download" @click="handleAccessLogExport">导出审计</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showAccessLogSearch" @query-table="getAccessLogList" />
            </el-row>
          </template>

          <el-table v-loading="accessLogLoading" border stripe :data="accessLogList">
            <el-table-column label="时间" prop="createTime" min-width="160" fixed="left" />
            <el-table-column label="相册ID" prop="albumId" width="110" />
            <el-table-column label="底片ID" prop="assetId" width="180" show-overflow-tooltip />
            <el-table-column label="手机号" prop="customerPhone" width="140" show-overflow-tooltip />
            <el-table-column label="平台" width="130">
              <template #default="scope">
                <el-tag :type="getOptionType(photoAccessPlatformOptions, scope.row.platform)">
                  {{ getOptionLabel(photoAccessPlatformOptions, scope.row.platform) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="动作" width="120">
              <template #default="scope">
                <el-tag :type="getOptionType(photoAccessActionOptions, scope.row.action)">
                  {{ getOptionLabel(photoAccessActionOptions, scope.row.action) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="成功" width="90">
              <template #default="scope">
                <el-tag :type="getOptionType(photoAccessSuccessOptions, scope.row.success)">
                  {{ getOptionLabel(photoAccessSuccessOptions, scope.row.success) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="IP" prop="ip" min-width="140" show-overflow-tooltip />
            <el-table-column label="备注" prop="remark" min-width="220" show-overflow-tooltip />
          </el-table>

          <pagination
            v-if="accessLogTotal > 0"
            v-model:total="accessLogTotal"
            v-model:page="accessLogQueryParams.pageNum"
            v-model:limit="accessLogQueryParams.pageSize"
            @pagination="getAccessLogList"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="albumDialog.visible" :title="albumDialog.title" width="680px" append-to-body>
      <el-form ref="albumFormRef" :model="albumForm" :rules="albumRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="albumForm.storeId" placeholder="请输入门店ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单ID" prop="orderId">
              <el-input v-model="albumForm.orderId" placeholder="请输入订单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相册名称" prop="albumName">
              <el-input v-model="albumForm.albumName" placeholder="请输入相册名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选片状态" prop="selectionStatus">
              <el-select v-model="albumForm.selectionStatus" class="w-full">
                <el-option v-for="item in selectionStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户取片码" prop="publicToken">
              <el-input v-model="albumForm.publicToken" placeholder="发给客户登录相册的取片码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker v-model="albumForm.expireTime" value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择过期时间" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="albumForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAlbumForm">确 定</el-button>
          <el-button @click="albumDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="pickupEntryDialog.visible" title="客户取片入口" width="680px" append-to-body>
      <div v-if="pickupEntryAlbum" class="yy-pickup-entry">
        <el-alert
          :type="pickupEntryExpired ? 'warning' : pickupEntryCode ? 'success' : 'error'"
          :closable="false"
          show-icon
          class="mb-3"
          :title="pickupEntryStatusText"
        />
        <div class="yy-pickup-entry-grid">
          <div class="yy-pickup-entry-item">
            <span>相册</span>
            <strong>{{ pickupEntryAlbum.albumName || '-' }}</strong>
          </div>
          <div class="yy-pickup-entry-item">
            <span>客户</span>
            <strong>{{ pickupEntryAlbum.customerName || pickupEntryAlbum.customerPhone || '-' }}</strong>
          </div>
          <div class="yy-pickup-entry-item">
            <span>手机号</span>
            <strong>{{ pickupEntryAlbum.customerPhone || '-' }}</strong>
          </div>
          <div class="yy-pickup-entry-item">
            <span>有效期</span>
            <strong>{{ pickupEntryAlbum.expireTime || '以门店通知为准' }}</strong>
          </div>
        </div>
        <el-divider />
        <div class="yy-pickup-entry-section">
          <div class="yy-pickup-entry-label">客户取片码</div>
          <div class="yy-pickup-entry-copyline">
            <el-input :model-value="pickupEntryCode || '请先在后台补充客户取片码'" readonly />
            <el-button :disabled="!pickupEntryCode" type="primary" plain @click="copyPickupEntryText(pickupEntryCode, '取片码')">复制取片码</el-button>
          </div>
        </div>
        <div class="yy-pickup-entry-qr-section">
          <div class="yy-pickup-entry-qr-card" :class="{ 'is-muted': !pickupQrState.available }">
            <img v-if="pickupQrImageUrl" class="yy-pickup-entry-qr-image" :src="pickupQrImageUrl" alt="客户取片二维码" />
            <div v-else class="yy-pickup-entry-qr-placeholder">
              <el-icon><Connection /></el-icon>
              <span>小程序取片</span>
            </div>
            <strong>{{ pickupQrState.title }}</strong>
            <span>{{ pickupQrState.description }}</span>
          </div>
          <div class="yy-pickup-entry-qr-actions">
            <div class="yy-pickup-entry-label">H5 入口</div>
            <div class="yy-pickup-entry-copyline">
              <el-input :model-value="pickupEntryUrl || '未配置 VITE_APP_PHOTO_PICKUP_H5_URL，优先让客户从微信/抖音小程序进入'" readonly />
              <el-button :disabled="!pickupQrState.available" type="primary" plain @click="copyPickupEntryText(pickupEntryUrl, 'H5 入口')">复制入口</el-button>
            </div>
            <div class="yy-pickup-entry-copyline">
              <el-input :model-value="pickupQrState.available ? '二维码已生成，可截图或现场扫码验证' : '暂无 H5 二维码，先发送取片码给客户'" readonly />
              <el-button :disabled="!pickupQrImageUrl" type="primary" plain @click="downloadPickupQrImage">下载二维码</el-button>
            </div>
          </div>
        </div>
        <div class="yy-pickup-entry-section">
          <div class="yy-pickup-entry-label">客户入口渠道</div>
          <div class="yy-pickup-platform-list">
            <div v-for="item in pickupPlatformEntryTips" :key="item.label" class="yy-pickup-platform-item" :class="{ 'is-muted': !item.available }">
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}</span>
              </div>
              <div class="yy-pickup-channel-copy">
                <el-button link type="primary" @click="copyPickupChannelShareText(item.label)">复制话术</el-button>
                <el-button v-if="item.copyable" link type="primary" @click="copyPickupEntryText(item.value, `${item.label}入口`)">复制入口</el-button>
                <el-tag v-else :type="item.available ? 'success' : 'info'" effect="plain">{{ item.available ? '小程序内进入' : '未配置' }}</el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="yy-pickup-copy-feedback" :class="`is-${pickupEntryCopyState.type}`">
          <span>最近操作</span>
          <strong>{{ pickupEntryCopyFeedbackText }}</strong>
        </div>
        <div v-loading="pickupEntryAccessLoading" class="yy-pickup-entry-section">
          <div class="yy-pickup-entry-label">访问摘要</div>
          <div class="yy-pickup-access-grid">
            <div class="yy-pickup-access-card">
              <span>最近访问</span>
              <strong>{{ formatPickupAccessLog(pickupEntryRecentAccessLog) }}</strong>
            </div>
            <div class="yy-pickup-access-card" :class="{ 'is-warning': pickupEntryRecentFailureLog }">
              <span>最近失败</span>
              <strong>{{ formatPickupAccessLog(pickupEntryRecentFailureLog) }}</strong>
            </div>
          </div>
          <div v-if="pickupEntryRecentFailureLog" class="yy-pickup-access-failure">
            <span>{{ pickupEntryRecentFailureLog.remark || '客户访问失败，建议打开访问审计查看详情。' }}</span>
            <el-button link type="primary" @click="handlePickupEntryAccessLog">查看审计</el-button>
          </div>
          <el-button v-else link type="primary" @click="handlePickupEntryAccessLog">查看完整访问审计</el-button>
        </div>
        <div class="yy-pickup-entry-section">
          <div class="yy-pickup-entry-label">客户取片说明</div>
          <el-input :model-value="pickupEntryShareText" type="textarea" :rows="7" readonly />
        </div>
        <div class="yy-pickup-entry-section yy-pickup-ops-section">
          <div class="yy-pickup-entry-label">运营验收命令</div>
          <div class="yy-pickup-entry-copyline">
            <el-input :model-value="pickupSmokeCommand" type="textarea" :rows="4" readonly />
            <el-button type="warning" plain @click="copyPickupSmokeCommand">复制相册验收命令</el-button>
          </div>
          <div class="yy-pickup-entry-label mt-3">真实 OSS 证据</div>
          <div class="yy-pickup-entry-copyline">
            <el-input :model-value="realOssEvidenceInputCommand" type="textarea" :rows="3" readonly />
            <el-button type="warning" plain @click="copyRealOssEvidenceInputCommand">复制证据清单命令</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="copyPickupShareText">复制客户说明</el-button>
          <el-button @click="pickupEntryDialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer v-model="albumWorkspaceDialog.visible" :title="albumWorkspaceDialog.title" size="760px" append-to-body>
      <div v-if="albumWorkspaceAlbum" class="yy-album-workspace">
        <div class="yy-album-workspace-hero">
          <div>
            <div class="yy-album-workspace-kicker">工作台摘要</div>
            <h3>{{ albumWorkspaceAlbum.albumName || '未命名相册' }}</h3>
            <p>{{ getAlbumOperationsSummary(albumWorkspaceAlbum).nextAction }}</p>
          </div>
          <el-tag :type="getAlbumOperationsSummary(albumWorkspaceAlbum).type" effect="dark">
            {{ getAlbumOperationsSummary(albumWorkspaceAlbum).label }}
          </el-tag>
        </div>
        <div class="yy-album-workspace-action-plan">
          <span>建议动作</span>
          <div>
            <template v-for="action in getAlbumOperationActions(albumWorkspaceAlbum)" :key="action.key">
              <el-button
                v-if="action.perms.length"
                v-hasPermi="action.perms"
                plain
                :type="action.type"
                :icon="action.icon"
                @click="handleAlbumOperationAction(action, albumWorkspaceAlbum)"
              >
                {{ action.label }}
              </el-button>
              <el-button v-else plain :type="action.type" :icon="action.icon" @click="handleAlbumOperationAction(action, albumWorkspaceAlbum)">
                {{ action.label }}
              </el-button>
            </template>
          </div>
        </div>

        <div class="yy-album-workspace-pending-list">
          <div class="yy-album-workspace-panel-head">
            <strong>本相册待处理清单</strong>
            <el-tag :type="getAlbumWorkspacePendingItems(albumWorkspaceAlbum).length ? getAlbumOperationsSummary(albumWorkspaceAlbum).type : 'success'" effect="plain">
              {{ getAlbumWorkspacePendingItems(albumWorkspaceAlbum).length ? `${getAlbumWorkspacePendingItems(albumWorkspaceAlbum).length} 项待处理` : '暂无阻塞' }}
            </el-tag>
          </div>
          <div v-if="getAlbumWorkspacePendingItems(albumWorkspaceAlbum).length" class="yy-album-workspace-pending-items">
            <div v-for="item in getAlbumWorkspacePendingItems(albumWorkspaceAlbum)" :key="item.key" class="yy-album-workspace-pending-item">
              <div class="yy-album-workspace-pending-copy">
                <el-tag :type="item.type" effect="plain" size="small">{{ item.label }}</el-tag>
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </div>
              <el-button
                v-if="item.action.perms.length"
                v-hasPermi="item.action.perms"
                plain
                size="small"
                :type="item.action.type"
                :icon="item.action.icon"
                @click="handleAlbumOperationAction(item.action, albumWorkspaceAlbum)"
              >
                {{ item.action.label }}
              </el-button>
              <el-button v-else plain size="small" :type="item.action.type" :icon="item.action.icon" @click="handleAlbumOperationAction(item.action, albumWorkspaceAlbum)">
                {{ item.action.label }}
              </el-button>
            </div>
          </div>
          <div v-else class="yy-album-workspace-pending-empty">
            手机号、取片码、可见照片、OSS Key 和最近访问记录均未发现阻塞，可直接复制取片入口发给客户。
          </div>
        </div>

        <div class="yy-album-workspace-grid">
          <div class="yy-album-workspace-panel">
            <div class="yy-album-workspace-panel-head">
              <strong>照片交付</strong>
              <el-tag effect="plain" :type="getAlbumOperationsSummary(albumWorkspaceAlbum).type">交付状态</el-tag>
            </div>
            <div class="yy-album-workspace-stat">
              <span>照片</span>
              <strong>{{ getAlbumOperationsSummary(albumWorkspaceAlbum).assetText }}</strong>
            </div>
            <div class="yy-album-workspace-tags">
              <el-tag
                v-for="issue in getAlbumOperationsSummary(albumWorkspaceAlbum).issues"
                :key="issue"
                :type="getAlbumOperationsSummary(albumWorkspaceAlbum).type"
                effect="plain"
              >
                {{ issue }}
              </el-tag>
              <el-tag v-if="!getAlbumOperationsSummary(albumWorkspaceAlbum).issues.length" type="success" effect="plain">暂无阻塞</el-tag>
            </div>
            <div class="yy-album-workspace-actions">
              <el-button v-hasPermi="['yy:photoAsset:list']" type="primary" plain icon="Picture" @click="handleAlbumAssets(albumWorkspaceAlbum)">查看底片</el-button>
              <el-button v-hasPermi="['yy:photoAsset:add']" plain icon="Upload" @click="handleAlbumPhotoUpload(albumWorkspaceAlbum)">上传照片</el-button>
            </div>
          </div>

          <div class="yy-album-workspace-panel">
            <div class="yy-album-workspace-panel-head">
              <strong>取片入口</strong>
              <el-tag :type="getPickupDeliveryHealth(albumWorkspaceAlbum).type" effect="plain">
                {{ getPickupDeliveryHealth(albumWorkspaceAlbum).label }}
              </el-tag>
            </div>
            <div class="yy-album-workspace-stat">
              <span>客户</span>
              <strong>{{ albumWorkspaceAlbum.customerName || albumWorkspaceAlbum.customerPhone || '未填写客户信息' }}</strong>
            </div>
            <div class="yy-album-workspace-copyline">
              <span>{{ getAlbumOperationsSummary(albumWorkspaceAlbum).phoneText }}</span>
              <span>{{ getAlbumOperationsSummary(albumWorkspaceAlbum).pickupText }}</span>
            </div>
            <div class="yy-album-workspace-actions">
              <el-button type="primary" plain icon="Link" @click="handleAlbumPickupEntry(albumWorkspaceAlbum)">打开入口</el-button>
              <el-button :disabled="!resolveAlbumPickupCode(albumWorkspaceAlbum)" plain icon="CopyDocument" @click="copyPickupCode(resolveAlbumPickupCode(albumWorkspaceAlbum))">
                复制取片码
              </el-button>
            </div>
          </div>

          <div class="yy-album-workspace-panel">
            <div class="yy-album-workspace-panel-head">
              <strong>选片结果</strong>
              <el-tag :type="getOptionType(selectionStatusOptions, albumWorkspaceAlbum.selectionStatus)" effect="plain">
                {{ getOptionLabel(selectionStatusOptions, albumWorkspaceAlbum.selectionStatus) }}
              </el-tag>
            </div>
            <div class="yy-album-workspace-stat">
              <span>状态</span>
              <strong>{{ albumWorkspaceAlbum.selectionStatus === 'SUBMITTED' ? '客户已提交，等待确认' : '查看已选照片或继续跟进客户' }}</strong>
            </div>
            <div class="yy-album-workspace-actions">
              <el-button v-hasPermi="['yy:photoAsset:list']" type="success" plain icon="Select" @click="handleAlbumSelectedAssets(albumWorkspaceAlbum)">查看已选</el-button>
              <el-button
                v-if="albumWorkspaceAlbum.selectionStatus === 'SUBMITTED'"
                v-hasPermi="['yy:photoAlbum:edit']"
                type="warning"
                plain
                icon="Check"
                @click="handleAlbumSelectionConfirm(albumWorkspaceAlbum)"
              >
                确认选片
              </el-button>
            </div>
          </div>

          <div class="yy-album-workspace-panel">
            <div class="yy-album-workspace-panel-head">
              <strong>访问排障</strong>
              <el-tag type="info" effect="plain">审计</el-tag>
            </div>
            <div class="yy-album-workspace-stat">
              <span>最近状态</span>
              <strong>{{ getAlbumOperationsSummary(albumWorkspaceAlbum).failureText }}</strong>
            </div>
            <div class="yy-album-workspace-copyline">
              <span>相册ID {{ albumWorkspaceAlbum.id || '-' }}</span>
              <span>订单ID {{ albumWorkspaceAlbum.orderId || '-' }}</span>
            </div>
            <div class="yy-album-workspace-actions">
              <el-button v-hasPermi="['yy:photoAccessLog:list']" type="primary" plain icon="View" @click="handleAlbumAudit(albumWorkspaceAlbum)">查看审计</el-button>
              <el-button v-hasPermi="['yy:photoAlbum:edit']" plain icon="Edit" @click="handleAlbumUpdate(albumWorkspaceAlbum)">编辑相册</el-button>
            </div>
          </div>
        </div>

        <div class="yy-album-workspace-panel yy-album-workspace-evidence">
          <div class="yy-album-workspace-panel-head">
            <strong>真实 OSS 证据</strong>
            <el-tag type="warning" effect="plain">公网验收</el-tag>
          </div>
          <div class="yy-album-workspace-stat">
            <span>先复制字段清单，再补手机号、取片码、相册 ID、底片 ID 和 OSS 裸链。</span>
            <strong>验证裸 OSS 403、签名 URL 可访问、过期后不可访问。</strong>
          </div>
          <div class="yy-album-workspace-stat">
            <span>已加载真实底片时，可直接复制完整验收命令。</span>
            <strong>{{ workspaceRealOssEvidenceAsset ? workspaceRealOssEvidenceAsset.objectKey : '请先上传真实 OSS 图片并刷新照片排障' }}</strong>
          </div>
          <div class="yy-album-workspace-command">
            <el-input :model-value="realOssEvidenceInputCommand" type="textarea" :rows="3" readonly />
          </div>
          <div v-if="workspaceRealOssEvidenceCommand" class="yy-album-workspace-command">
            <div class="yy-album-workspace-command-label">自动证据命令：先跑，结论通常为 PENDING</div>
            <el-input :model-value="workspaceRealOssEvidenceCommand" type="textarea" :rows="4" readonly />
          </div>
          <div v-if="workspaceRealOssEvidenceFinalPassCommand" class="yy-album-workspace-command">
            <div class="yy-album-workspace-command-label">最终 PASS 命令：H5/微信/抖音/后台审计都确认后再跑</div>
            <el-input :model-value="workspaceRealOssEvidenceFinalPassCommand" type="textarea" :rows="4" readonly />
          </div>
          <div class="yy-album-workspace-actions">
            <el-button type="warning" plain icon="CopyDocument" @click="copyRealOssEvidenceInputCommand">复制证据清单命令</el-button>
            <el-button type="success" plain icon="CopyDocument" :disabled="!workspaceRealOssEvidenceCommand" @click="copyWorkspaceRealOssEvidenceCommand">复制自动证据命令</el-button>
            <el-button type="primary" plain icon="CopyDocument" :disabled="!workspaceRealOssEvidenceFinalPassCommand" @click="copyWorkspaceRealOssEvidenceFinalPassCommand">复制最终 PASS 命令</el-button>
          </div>
        </div>

        <div class="yy-album-workspace-panel yy-album-workspace-assets" v-loading="workspaceAssetLoading">
          <div class="yy-album-workspace-panel-head">
            <strong>照片排障</strong>
            <el-tag type="info" effect="plain">本相册前 100 张</el-tag>
          </div>
          <div class="yy-album-workspace-asset-stats">
            <div>
              <span>总数</span>
              <strong>{{ workspaceAssetStatusCounts.total }}</strong>
            </div>
            <div>
              <span>可见</span>
              <strong>{{ workspaceAssetStatusCounts.visible }}</strong>
            </div>
            <div>
              <span>隐藏</span>
              <strong>{{ workspaceAssetStatusCounts.hidden }}</strong>
            </div>
            <div>
              <span>已选</span>
              <strong>{{ workspaceAssetStatusCounts.selected }}</strong>
            </div>
          </div>
          <div class="yy-album-workspace-tags">
            <el-tag :type="workspaceAssetIssueCounts.missingObjectKey ? 'danger' : 'success'" effect="plain">
              缺 OSS Key {{ workspaceAssetIssueCounts.missingObjectKey }}
            </el-tag>
            <el-tag :type="workspaceAssetIssueCounts.hidden ? 'warning' : 'success'" effect="plain">隐藏 {{ workspaceAssetIssueCounts.hidden }}</el-tag>
            <el-tag :type="workspaceAssetIssueCounts.selected ? 'success' : 'info'" effect="plain">已选 {{ workspaceAssetIssueCounts.selected }}</el-tag>
            <el-tag :type="workspaceAssetIssueCounts.missingPreviewUrl ? 'warning' : 'success'" effect="plain">
              缺预览地址 {{ workspaceAssetIssueCounts.missingPreviewUrl }}
            </el-tag>
          </div>
          <div v-if="workspaceAssetPreviewList.length" class="yy-album-workspace-preview-grid">
            <div v-for="asset in workspaceAssetPreviewList" :key="asset.id" class="yy-album-workspace-preview-card">
              <div class="yy-album-workspace-preview-thumb">
                <el-image
                  v-if="asset.fileUrl"
                  :src="asset.fileUrl"
                  fit="cover"
                  :preview-src-list="workspaceAssetPreviewUrls"
                  preview-teleported
                  hide-on-click-modal
                />
                <div v-else class="yy-photo-thumb-placeholder">无预览</div>
                <div class="yy-album-workspace-preview-badges">
                  <el-tag v-if="!String(asset.objectKey || '').trim()" size="small" type="danger">缺 OSS Key</el-tag>
                  <el-tag v-if="String(asset.visible) !== '1'" size="small" type="warning">隐藏</el-tag>
                  <el-tag v-if="String(asset.isSelected) === '1'" size="small" type="success">已选</el-tag>
                </div>
              </div>
              <div class="yy-album-workspace-preview-name">{{ asset.fileName || asset.objectKey || asset.id }}</div>
              <div class="yy-album-workspace-preview-meta">排序 {{ asset.sort ?? 0 }} · ID {{ asset.id }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无底片，先上传照片" :image-size="88" />
          <div class="yy-album-workspace-actions">
            <el-button v-hasPermi="['yy:photoAsset:list']" type="primary" plain icon="Picture" @click="handleWorkspaceAssetTroubleshooting">加载照片排障</el-button>
            <el-button
              v-hasPermi="['yy:photoAsset:list']"
              :disabled="!workspaceAssetIssueCounts.missingObjectKey"
              plain
              icon="Warning"
              @click="handleWorkspaceMissingObjectKeys"
            >
              查看缺 Key
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="assetDialog.visible" :title="assetDialog.title" width="680px" append-to-body>
      <el-form ref="assetFormRef" :model="assetForm" :rules="assetRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门店ID" prop="storeId">
              <el-input v-model="assetForm.storeId" placeholder="请输入门店ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相册ID" prop="albumId">
              <el-input v-model="assetForm.albumId" placeholder="请输入相册ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件名" prop="fileName">
              <el-input v-model="assetForm.fileName" placeholder="请输入文件名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件地址" prop="fileUrl">
              <el-input v-model="assetForm.fileUrl" placeholder="请输入文件地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="OSS Key" prop="objectKey">
              <el-input v-model="assetForm.objectKey" placeholder="请输入 OSS 对象 Key" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缩略图Key" prop="thumbnailObjectKey">
              <el-input v-model="assetForm.thumbnailObjectKey" placeholder="请输入缩略图 OSS Key" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="assetForm.sort" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否已选" prop="isSelected">
              <el-radio-group v-model="assetForm.isSelected">
                <el-radio v-for="item in yesNoOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可见" prop="visible">
              <el-radio-group v-model="assetForm.visible">
                <el-radio v-for="item in yesNoOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="assetForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssetForm">确 定</el-button>
          <el-button @click="assetDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="uploadDialog.visible"
      :title="uploadDialog.title"
      width="720px"
      append-to-body
      :close-on-click-modal="!uploading"
      :close-on-press-escape="!uploading"
      :show-close="!uploading"
      @closed="resetUploadState"
    >
      <el-alert
        v-if="uploadAlbum"
        type="info"
        :closable="false"
        show-icon
        class="mb-3"
        :title="`上传到相册：${uploadAlbum.albumName}（相册ID：${uploadAlbum.id}，门店ID：${uploadAlbum.storeId}）`"
      />
      <el-alert
        v-if="uploading || uploadResults.length"
        :type="uploadSummary.failed ? 'warning' : 'success'"
        :closable="false"
        show-icon
        class="mb-3"
        :title="uploadSummaryText"
      />
      <el-upload
        ref="albumUploadRef"
        v-loading="uploading"
        drag
        multiple
        :action="uploadUrl"
        :headers="uploadHeaders"
        :accept="photoUploadAccept"
        :before-upload="beforePhotoUpload"
        :on-success="handlePhotoUploadSuccess"
        :on-error="handlePhotoUploadError"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将照片拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 jpg/jpeg/png/webp，单张不超过 {{ photoUploadSizeMb }}MB；上传成功后自动写入底片列表。</div>
        </template>
      </el-upload>
      <el-table v-if="uploadResults.length" :data="uploadResults" border size="small" class="mt-4">
        <el-table-column label="文件名" prop="fileName" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.success ? 'success' : scope.row.recoverable ? 'warning' : 'danger'">
              {{ scope.row.success ? '成功' : scope.row.recoverable ? '可重试' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="OSS Key" prop="ossKey" min-width="220" show-overflow-tooltip />
        <el-table-column label="缩略图Key" prop="thumbnailObjectKey" min-width="220" show-overflow-tooltip />
        <el-table-column label="说明" prop="message" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="scope">
            <el-button
              v-if="canCopyPhotoPickupPreflightCommand(scope.row)"
              link
              type="primary"
              @click="copyPhotoPickupPreflightCommand(scope.row)"
            >
              复制预检命令
            </el-button>
            <el-button
              v-if="isRecoverableUploadResult(scope.row)"
              link
              type="primary"
              :loading="scope.row.retrying"
              @click="retryCreateAssetFromUploadResult(scope.row)"
            >
              重试建底片
            </el-button>
            <span v-else class="yy-upload-result-muted">{{ scope.row.success ? '已完成' : '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button :disabled="!uploadAlbum || uploading" @click="handleViewUploadedAssets">查看底片列表</el-button>
          <el-button :disabled="uploading" @click="uploadDialog.visible = false">{{ uploading ? '上传中...' : '关 闭' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="YyPhoto" lang="ts">
import request from '@/utils/request';
import { listByIds } from '@/api/system/oss';
import { addYyPhotoAlbum, delYyPhotoAlbum, getYyPhotoAlbum, listYyPhotoAlbum, listYyPhotoAlbumOperationsSummary, updateYyPhotoAlbum } from '@/api/yy/photoAlbum';
import { listYyPhotoAccessLog } from '@/api/yy/photoAccessLog';
import { addYyPhotoAsset, delYyPhotoAsset, getYyPhotoAsset, listYyPhotoAsset, updateYyPhotoAsset } from '@/api/yy/photoAsset';
import type { OssVO } from '@/api/system/oss/types';
import type { YyPhotoAlbumForm, YyPhotoAlbumOperationsSummaryVO, YyPhotoAlbumQuery, YyPhotoAlbumVO } from '@/api/yy/photoAlbum/types';
import type { YyPhotoAccessLogQuery, YyPhotoAccessLogVO } from '@/api/yy/photoAccessLog/types';
import type { YyPhotoAssetForm, YyPhotoAssetQuery, YyPhotoAssetVO } from '@/api/yy/photoAsset/types';
import { globalHeaders } from '@/utils/request';
import {
  buildPickupChannelShareText,
  buildPickupH5EntryUrl,
  buildPickupPlatformEntryTips,
  buildPickupQrImageDataUrl,
  buildPickupQrState,
  buildPickupShareText,
  buildPickupSmokeCommand,
  getPickupDeliveryHealth,
  isPickupAlbumExpired,
  resolveAlbumPickupCode
} from '@/views/yy/utils/photoPickupEntry';
import {
  getOptionLabel,
  getOptionType,
  photoAccessActionOptions,
  photoAccessPlatformOptions,
  photoAccessSuccessOptions,
  selectionStatusOptions,
  yesNoOptions
} from '@/views/yy/components/options';
import {
  buildAssetQueryForUploadedAlbum,
  buildPhotoPickupPreflightCommand,
  buildRealOssEvidenceCommand,
  buildPhotoAssetFormFromOss,
  buildRetryPhotoAssetFormFromUploadResult,
  isRecoverableUploadResult,
  resolveBareOssUrlFromUploadResult,
  resolveNextUploadSort
} from '@/views/yy/utils/photoUpload';
import { buildAlbumOperationsSummary, type AlbumOperationsStats } from '@/views/yy/utils/photoOperationsHealth';
import { createClientThumbnailFile } from '@/views/yy/utils/photoThumbnail';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const activeTab = ref('album');
const assetViewMode = ref<'table' | 'gallery'>('table');

const showAlbumSearch = ref(true);
const showAssetSearch = ref(true);
const showAccessLogSearch = ref(true);
const albumList = ref<YyPhotoAlbumVO[]>([]);
const assetList = ref<YyPhotoAssetVO[]>([]);
const accessLogList = ref<YyPhotoAccessLogVO[]>([]);
const albumOperationsSummaryMap = ref<Record<string, YyPhotoAlbumOperationsSummaryVO>>({});
const workspaceAssetDiagnostics = ref<YyPhotoAssetVO[]>([]);
const workspaceAssetLoading = ref(false);
const albumLoading = ref(false);
const assetLoading = ref(false);
const accessLogLoading = ref(false);
const accessLogLoaded = ref(false);
const albumTotal = ref(0);
const assetTotal = ref(0);
const accessLogTotal = ref(0);
const albumIds = ref<Array<string | number>>([]);
const assetIds = ref<Array<string | number>>([]);
const albumSingle = ref(true);
const albumMultiple = ref(true);
const assetSingle = ref(true);
const assetMultiple = ref(true);

const albumQueryFormRef = ref<ElFormInstance>();
const assetQueryFormRef = ref<ElFormInstance>();
const accessLogQueryFormRef = ref<ElFormInstance>();
const albumFormRef = ref<ElFormInstance>();
const assetFormRef = ref<ElFormInstance>();
const albumUploadRef = ref<ElUploadInstance>();

const albumDialog = reactive<DialogOption>({ visible: false, title: '' });
const assetDialog = reactive<DialogOption>({ visible: false, title: '' });
const uploadDialog = reactive<DialogOption>({ visible: false, title: '' });
const pickupEntryDialog = reactive<DialogOption>({ visible: false, title: '' });
const albumWorkspaceDialog = reactive<DialogOption>({ visible: false, title: '' });
const albumWorkspaceAlbum = ref<YyPhotoAlbumVO>();
const pickupEntryAlbum = ref<YyPhotoAlbumVO>();
const pickupEntryAccessLoading = ref(false);
const pickupEntryAccessLogs = ref<YyPhotoAccessLogVO[]>([]);
const pickupEntryCopyState = reactive({
  type: 'info' as 'info' | 'success' | 'warning',
  target: '',
  message: '尚未操作，本次打开入口后可复制取片码、H5 入口、客户说明或下载二维码。'
});
const uploadAlbum = ref<YyPhotoAlbumVO>();
type AlbumOperationActionKey = 'edit' | 'upload' | 'missing-key' | 'audit' | 'pickup-entry';
type AlbumOperationAction = {
  key: AlbumOperationActionKey;
  label: string;
  icon: string;
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  perms: string[];
};
type AlbumWorkspacePendingItem = {
  key: string;
  label: string;
  title: string;
  description: string;
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  action: AlbumOperationAction;
};
type UploadResultRow = {
  fileName: string;
  success: boolean;
  message: string;
  ossKey?: string;
  ossId?: string | number;
  fileUrl?: string;
  thumbnailObjectKey?: string;
  originalName?: string;
  recoverable?: boolean;
  retrying?: boolean;
  sort?: number;
};
const uploadResults = ref<UploadResultRow[]>([]);
const uploadPendingCount = ref(0);
const uploading = computed(() => uploadPendingCount.value > 0);
const uploadSummary = computed(() => {
  const success = uploadResults.value.filter((item) => item.success).length;
  const failed = uploadResults.value.filter((item) => !item.success).length;
  return {
    pending: uploadPendingCount.value,
    success,
    failed,
    total: success + failed + uploadPendingCount.value
  };
});
const uploadSummaryText = computed(() => {
  const summary = uploadSummary.value;
  if (!summary.total) {
    return '等待选择照片';
  }
  return `上传进度：待完成 ${summary.pending}，成功 ${summary.success}，失败 ${summary.failed}`;
});
const uploadNextSort = ref(0);
const photoUploadSizeMb = 5;
const photoUploadAccept = '.jpg,.jpeg,.png,.webp';
const uploadUrl = `${import.meta.env.VITE_APP_BASE_API}/resource/oss/upload`;
const uploadHeaders = ref(globalHeaders());
const assetPreviewList = computed(() => assetList.value.map((item) => item.fileUrl).filter(Boolean) as string[]);
const workspaceAssetPreviewList = computed(() => workspaceAssetDiagnostics.value.slice(0, 6));
const workspaceAssetPreviewUrls = computed(() => workspaceAssetPreviewList.value.map((item) => item.fileUrl).filter(Boolean) as string[]);
const workspaceAssetStatusCounts = computed(() => {
  const rows = workspaceAssetDiagnostics.value;
  return {
    total: rows.length,
    visible: rows.filter((asset) => String(asset.visible) === '1').length,
    hidden: rows.filter((asset) => String(asset.visible) !== '1').length,
    selected: rows.filter((asset) => String(asset.isSelected) === '1').length
  };
});
const workspaceAssetIssueCounts = computed(() => {
  const rows = workspaceAssetDiagnostics.value;
  return {
    missingObjectKey: rows.filter((asset) => !String(asset.objectKey || '').trim()).length,
    hidden: rows.filter((asset) => String(asset.visible) !== '1').length,
    selected: rows.filter((asset) => String(asset.isSelected) === '1').length,
    missingPreviewUrl: rows.filter((asset) => !String(asset.fileUrl || '').trim()).length
  };
});
const getAssetGalleryDiagnostics = (asset: YyPhotoAssetVO) => {
  const diagnostics: Array<{ label: string; type: 'success' | 'warning' | 'danger' | 'info' }> = [];
  if (!String(asset.objectKey || '').trim()) {
    diagnostics.push({ label: '缺 OSS Key', type: 'danger' });
  }
  if (!String(asset.fileUrl || '').trim()) {
    diagnostics.push({ label: '缺预览地址', type: 'warning' });
  }
  if (String(asset.visible) !== '1') {
    diagnostics.push({ label: '隐藏', type: 'warning' });
  }
  if (String(asset.isSelected) === '1') {
    diagnostics.push({ label: '已选', type: 'success' });
  }
  if (!diagnostics.length) {
    diagnostics.push({ label: '可交付', type: 'success' });
  }
  return diagnostics;
};
const pickupEntryUrl = computed(() => buildPickupH5EntryUrl(import.meta.env.VITE_APP_PHOTO_PICKUP_H5_URL));
const pickupQrState = computed(() => buildPickupQrState(pickupEntryUrl.value));
const pickupPlatformEntryTips = computed(() => buildPickupPlatformEntryTips(pickupEntryUrl.value));
const pickupQrImageUrl = ref('');
const pickupEntryCode = computed(() => resolveAlbumPickupCode(pickupEntryAlbum.value));
const pickupEntryExpired = computed(() => isPickupAlbumExpired(pickupEntryAlbum.value?.expireTime));
const pickupEntryRecentAccessLog = computed(() => pickupEntryAccessLogs.value[0]);
const pickupEntryRecentFailureLog = computed(() => pickupEntryAccessLogs.value.find((log) => String(log.success) === '0'));
const pickupEntryStatusText = computed(() => {
  if (!pickupEntryCode.value) {
    return '当前相册缺少客户取片码，请先编辑相册补充取片码。';
  }
  if (pickupEntryExpired.value) {
    return '当前相册已过有效期，复制给客户前请先延长有效期。';
  }
  return '可复制客户取片说明，客户输入手机号和取片码后查看自己的相册。';
});
const pickupEntryShareText = computed(() => buildPickupShareText(pickupEntryAlbum.value, pickupEntryUrl.value));
const pickupSmokeCommand = computed(() => {
  const album = pickupEntryAlbum.value;
  const visibleAssets = album ? getAlbumOperationsStats(album).visibleAssets : 0;
  return buildPickupSmokeCommand({
    baseUrl: import.meta.env.VITE_APP_PUBLIC_API_URL || 'https://api.evanshine.me',
    phone: album?.customerPhone || '<手机号>',
    accessCode: pickupEntryCode.value || '<取片码>',
    albumId: album?.id || '<相册ID>',
    allowEmptyAlbum: visibleAssets === 0
  });
});
const realOssEvidenceInputCommand = computed(() => {
  return [
    'cd D:\\OtherProject\\CameraApp\\yingyue-cloud-repo',
    '.\\tools\\new-photo-pickup-real-oss-evidence.ps1 -PrintRequiredInputs'
  ].join('\n');
});
const resolveWorkspaceAssetBareOssUrl = (asset?: YyPhotoAssetVO) => {
  return resolveBareOssUrlFromUploadResult({ success: true, fileUrl: asset?.fileUrl || '' });
};
const workspaceRealOssEvidenceAsset = computed(() => {
  return workspaceAssetDiagnostics.value.find((asset) => {
    return String(asset.visible) === '1' && Boolean(String(asset.objectKey || '').trim()) && Boolean(resolveWorkspaceAssetBareOssUrl(asset));
  });
});
const workspaceRealOssEvidenceCommand = computed(() => {
  const album = albumWorkspaceAlbum.value;
  const asset = workspaceRealOssEvidenceAsset.value;
  if (!album || !asset) {
    return '';
  }
  return buildRealOssEvidenceCommand({
    baseUrl: import.meta.env.VITE_APP_PUBLIC_API_URL || 'https://api.evanshine.me',
    phone: album.customerPhone || '<手机号>',
    accessCode: resolveAlbumPickupCode(album) || '<取片码>',
    albumId: album.id || '<相册ID>',
    assetId: asset.id || '<底片ID>',
    bareOssUrl: resolveWorkspaceAssetBareOssUrl(asset),
    objectKey: asset.objectKey,
    thumbnailObjectKey: asset.thumbnailObjectKey
  });
});
const workspaceRealOssEvidenceFinalPassCommand = computed(() => {
  const album = albumWorkspaceAlbum.value;
  const asset = workspaceRealOssEvidenceAsset.value;
  if (!album || !asset) {
    return '';
  }
  return buildRealOssEvidenceCommand({
    baseUrl: import.meta.env.VITE_APP_PUBLIC_API_URL || 'https://api.evanshine.me',
    phone: album.customerPhone || '<手机号>',
    accessCode: resolveAlbumPickupCode(album) || '<取片码>',
    albumId: album.id || '<相册ID>',
    assetId: asset.id || '<底片ID>',
    bareOssUrl: resolveWorkspaceAssetBareOssUrl(asset),
    objectKey: asset.objectKey,
    thumbnailObjectKey: asset.thumbnailObjectKey,
    manualConfirm: true
  });
});
const pickupEntryCopyFeedbackText = computed(() => {
  if (!pickupEntryCopyState.target) {
    return pickupEntryCopyState.message;
  }
  return `${pickupEntryCopyState.target}：${pickupEntryCopyState.message}`;
});
const activeTabLabel = computed(() => {
  if (activeTab.value === 'asset') {
    return assetViewMode.value === 'gallery' ? '底片图库' : '底片列表';
  }
  if (activeTab.value === 'accessLog') {
    return '访问审计';
  }
  return '相册列表';
});

const initAlbumForm: YyPhotoAlbumForm = {
  id: undefined,
  storeId: '',
  orderId: '',
  albumName: '',
  publicToken: '',
  selectionStatus: 'DRAFT',
  expireTime: '',
  remark: ''
};

const initAssetForm: YyPhotoAssetForm = {
  id: undefined,
  storeId: '',
  albumId: '',
  fileName: '',
  fileUrl: '',
  objectKey: '',
  thumbnailObjectKey: '',
  sort: 0,
  isSelected: '0',
  visible: '1',
  remark: ''
};

const albumData = reactive<PageData<YyPhotoAlbumForm, YyPhotoAlbumQuery>>({
  form: { ...initAlbumForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    orderId: undefined,
    albumName: '',
    selectionStatus: ''
  },
  rules: {
    storeId: [{ required: true, message: '门店ID不能为空', trigger: 'blur' }],
    albumName: [{ required: true, message: '相册名称不能为空', trigger: 'blur' }]
  }
});

const assetData = reactive<PageData<YyPhotoAssetForm, YyPhotoAssetQuery>>({
  form: { ...initAssetForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    albumId: undefined,
    fileName: '',
    isSelected: '',
    visible: ''
  },
  rules: {
    storeId: [{ required: true, message: '门店ID不能为空', trigger: 'blur' }],
    albumId: [{ required: true, message: '相册ID不能为空', trigger: 'blur' }],
    fileName: [{ required: true, message: '文件名不能为空', trigger: 'blur' }],
    fileUrl: [{ required: true, message: '文件地址不能为空', trigger: 'blur' }],
    objectKey: [{ required: true, message: 'OSS Key不能为空', trigger: 'blur' }]
  }
});

const accessLogData = reactive<{ queryParams: YyPhotoAccessLogQuery }>({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeId: undefined,
    albumId: undefined,
    assetId: undefined,
    customerPhone: '',
    platform: '',
    action: '',
    success: ''
  }
});

const { form: albumForm, queryParams: albumQueryParams, rules: albumRules } = toRefs(albumData);
const { form: assetForm, queryParams: assetQueryParams, rules: assetRules } = toRefs(assetData);
const { queryParams: accessLogQueryParams } = toRefs(accessLogData);

const getRouteQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined;
  }
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value);
};

const applyPhotoWorkbenchRouteQuery = () => {
  const tab = getRouteQueryValue(route.query.tab);
  const intent = getRouteQueryValue(route.query.intent);
  const storeId = getRouteQueryValue(route.query.storeId);
  const orderId = getRouteQueryValue(route.query.orderId);
  const albumId = getRouteQueryValue(route.query.albumId);
  const assetId = getRouteQueryValue(route.query.assetId);
  const customerPhone = getRouteQueryValue(route.query.customerPhone);

  if (tab === 'accessLog') {
    activeTab.value = 'accessLog';
    accessLogLoaded.value = false;
    accessLogQueryParams.value = {
      ...accessLogQueryParams.value,
      pageNum: 1,
      storeId,
      albumId,
      assetId,
      customerPhone: customerPhone ?? '',
      platform: getRouteQueryValue(route.query.platform) ?? '',
      action: getRouteQueryValue(route.query.action) ?? '',
      success: getRouteQueryValue(route.query.success) ?? ''
    };
    return;
  }

  if (tab === 'asset') {
    activeTab.value = 'asset';
    assetQueryParams.value = {
      ...assetQueryParams.value,
      pageNum: 1,
      storeId,
      albumId
    };
    return;
  }

  if (tab === 'album' || storeId || orderId) {
    activeTab.value = 'album';
    albumQueryParams.value = {
      ...albumQueryParams.value,
      pageNum: 1,
      storeId,
      orderId
    };
    if (intent === 'upload') {
      void openSingleAlbumUploadFromRoute();
    }
    if (intent === 'pickup-entry') {
      void openSingleAlbumPickupEntryFromRoute();
    }
  }
};

const openSingleAlbumUploadFromRoute = async () => {
  await nextTick();
  const res = (await listYyPhotoAlbum(albumQueryParams.value)) as any;
  const albums = res.rows ?? res.data ?? [];
  if (albums.length === 1) {
    await handleAlbumPhotoUpload(albums[0]);
  } else if (albums.length === 0) {
    ElMessage.warning('未找到订单关联相册，请先创建相册后再上传照片。');
  } else {
    ElMessage.info('已筛出多个相册，请选择对应相册后点击上传照片。');
  }
};

const openSingleAlbumPickupEntryFromRoute = async () => {
  await nextTick();
  const res = (await listYyPhotoAlbum(albumQueryParams.value)) as any;
  const albums = res.rows ?? res.data ?? [];
  if (albums.length === 1) {
    handleAlbumPickupEntry(albums[0]);
  } else if (albums.length === 0) {
    ElMessage.warning('未找到订单关联相册，请先创建相册后再打开取片入口。');
  } else {
    ElMessage.info('已筛出多个相册，请选择对应相册后点击取片入口。');
  }
};

const activeFilterSummary = computed(() => {
  const query =
    activeTab.value === 'asset'
      ? assetQueryParams.value
      : activeTab.value === 'accessLog'
        ? accessLogQueryParams.value
        : albumQueryParams.value;
  const activeFilters = Object.entries(query).filter(([key, value]) => !['pageNum', 'pageSize'].includes(key) && value !== undefined && value !== '');
  return activeFilters.length ? `${activeFilters.length} 个筛选条件` : '未启用筛选';
});

const getFallbackAlbumOperationsStats = (album: YyPhotoAlbumVO): AlbumOperationsStats => {
  const albumId = String(album.id ?? '');
  const albumAssets = assetList.value.filter((asset) => String(asset.albumId ?? '') === albumId);
  const totalAssets = albumAssets.length;
  const visibleAssets = albumAssets.filter((asset) => String(asset.visible) === '1').length;
  const selectedAssets = albumAssets.filter((asset) => String(asset.isSelected) === '1').length;
  const missingObjectKeyAssets = albumAssets.filter((asset) => String(asset.visible) === '1' && !String(asset.objectKey || '').trim()).length;
  const recentFailure = accessLogList.value.find((log) => String(log.albumId ?? '') === albumId && String(log.success) === '0');

  return {
    totalAssets,
    visibleAssets,
    selectedAssets,
    missingObjectKeyAssets,
    recentFailure
  };
};

const getAlbumOperationsStats = (album: YyPhotoAlbumVO): AlbumOperationsStats => {
  const backendSummary = albumOperationsSummaryMap.value[String(album.id ?? '')];
  if (!backendSummary) {
    return getFallbackAlbumOperationsStats(album);
  }
  return {
    totalAssets: Number(backendSummary.totalAssets ?? 0),
    visibleAssets: Number(backendSummary.visibleAssets ?? 0),
    selectedAssets: Number(backendSummary.selectedAssets ?? 0),
    missingObjectKeyAssets: Number(backendSummary.missingObjectKeyAssets ?? 0),
    recentFailure: backendSummary.recentFailure
  };
};

const getAlbumOperationsSummary = (album: YyPhotoAlbumVO) => {
  return buildAlbumOperationsSummary(album, getAlbumOperationsStats(album));
};

const getAlbumOperationActions = (album: YyPhotoAlbumVO): AlbumOperationAction[] => {
  const summary = getAlbumOperationsSummary(album);
  const issues = summary.issues;
  const actions: AlbumOperationAction[] = [];
  const pushAction = (action: AlbumOperationAction) => {
    if (!actions.some((item) => item.key === action.key)) {
      actions.push(action);
    }
  };

  if (issues.includes('缺手机号') || issues.includes('缺取片码') || issues.includes('已过期')) {
    pushAction({ key: 'edit', label: '编辑相册', icon: 'Edit', type: 'primary', perms: ['yy:photoAlbum:edit'] });
  }
  if (issues.includes('无可见照片')) {
    pushAction({ key: 'upload', label: '上传照片', icon: 'Upload', type: 'success', perms: ['yy:photoAsset:add'] });
  }
  if (issues.some((issue) => issue.includes('缺 OSS Key'))) {
    pushAction({ key: 'missing-key', label: '查看缺 Key', icon: 'Warning', type: 'warning', perms: ['yy:photoAsset:list'] });
  }
  if (issues.includes('最近访问失败')) {
    pushAction({ key: 'audit', label: '查看审计', icon: 'View', type: 'danger', perms: ['yy:photoAccessLog:list'] });
  }

  pushAction({ key: 'pickup-entry', label: '取片入口', icon: 'Link', type: 'primary', perms: [] });
  return actions.slice(0, 5);
};

const getAlbumWorkspacePendingItems = (album: YyPhotoAlbumVO): AlbumWorkspacePendingItem[] => {
  const summary = getAlbumOperationsSummary(album);
  const stats = getAlbumOperationsStats(album);
  const issues = summary.issues;
  const editAction: AlbumOperationAction = { key: 'edit', label: '编辑相册', icon: 'Edit', type: 'primary', perms: ['yy:photoAlbum:edit'] };
  const uploadAction: AlbumOperationAction = { key: 'upload', label: '上传照片', icon: 'Upload', type: 'success', perms: ['yy:photoAsset:add'] };
  const missingKeyAction: AlbumOperationAction = { key: 'missing-key', label: '查看缺 Key', icon: 'Warning', type: 'warning', perms: ['yy:photoAsset:list'] };
  const auditAction: AlbumOperationAction = { key: 'audit', label: '查看审计', icon: 'View', type: 'danger', perms: ['yy:photoAccessLog:list'] };
  const items: AlbumWorkspacePendingItem[] = [];

  if (issues.includes('缺手机号')) {
    items.push({
      key: 'missing-phone',
      label: '缺手机号',
      title: '补客户手机号',
      description: '客户取片登录必须用手机号校验，先在相册资料里补齐。',
      type: 'danger',
      action: editAction
    });
  }
  if (issues.includes('缺取片码')) {
    items.push({
      key: 'missing-pickup-code',
      label: '缺取片码',
      title: '生成或填写取片码',
      description: '客户需要手机号和取片码进入相册，复制入口前必须补齐。',
      type: 'danger',
      action: editAction
    });
  }
  if (issues.includes('已过期')) {
    items.push({
      key: 'expired',
      label: '已过期',
      title: '延长相册有效期',
      description: '相册过期后客户无法查看，发送入口前先调整过期时间。',
      type: 'warning',
      action: editAction
    });
  }
  if (issues.includes('无可见照片')) {
    items.push({
      key: 'no-visible-assets',
      label: '无可见照片',
      title: '上传或设为客户可见',
      description: `当前可见照片 ${stats.visibleAssets}/${stats.totalAssets}，客户打开后会看到空相册。`,
      type: 'danger',
      action: uploadAction
    });
  }
  if (issues.some((issue) => issue.includes('缺 OSS Key'))) {
    items.push({
      key: 'missing-object-key',
      label: '缺 OSS Key',
      title: '修复底片 OSS Key',
      description: `当前 ${stats.missingObjectKeyAssets} 张可见照片缺 OSS Key，预览或下载可能失败。`,
      type: 'warning',
      action: missingKeyAction
    });
  }
  if (issues.includes('最近访问失败')) {
    items.push({
      key: 'recent-access-failure',
      label: '最近访问失败',
      title: '查看客户访问失败日志',
      description: summary.failureText,
      type: 'danger',
      action: auditAction
    });
  }

  return items;
};

const handleAlbumOperationAction = async (action: AlbumOperationAction, row: YyPhotoAlbumVO) => {
  if (action.key === 'edit') {
    await handleAlbumUpdate(row);
    return;
  }
  if (action.key === 'upload') {
    await handleAlbumPhotoUpload(row);
    return;
  }
  if (action.key === 'missing-key') {
    albumWorkspaceAlbum.value = row;
    await handleWorkspaceMissingObjectKeys();
    return;
  }
  if (action.key === 'audit') {
    await handleAlbumAudit(row);
    return;
  }
  handleAlbumPickupEntry(row);
};

const loadAlbumOperationsSummaries = async (albums: YyPhotoAlbumVO[]) => {
  const ids = albums.map((album) => album.id).filter((id) => id !== undefined && id !== null && id !== '');
  if (!ids.length) {
    albumOperationsSummaryMap.value = {};
    return;
  }
  try {
    const res = (await listYyPhotoAlbumOperationsSummary(ids)) as any;
    const rows: YyPhotoAlbumOperationsSummaryVO[] = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    albumOperationsSummaryMap.value = rows.reduce<Record<string, YyPhotoAlbumOperationsSummaryVO>>((map, item) => {
      map[String(item.albumId ?? '')] = item;
      return map;
    }, {});
  } catch {
    albumOperationsSummaryMap.value = {};
  }
};

const getAlbumList = async () => {
  albumLoading.value = true;
  try {
    const res = (await listYyPhotoAlbum(albumQueryParams.value)) as any;
    albumList.value = res.rows ?? res.data ?? [];
    albumTotal.value = res.total ?? albumList.value.length;
    await loadAlbumOperationsSummaries(albumList.value);
  } finally {
    albumLoading.value = false;
  }
};

const getAssetList = async () => {
  assetLoading.value = true;
  try {
    const res = (await listYyPhotoAsset(assetQueryParams.value)) as any;
    assetList.value = res.rows ?? res.data ?? [];
    assetTotal.value = res.total ?? assetList.value.length;
    resetAssetSelection();
    await loadAlbumOperationsSummaries(albumList.value);
  } finally {
    assetLoading.value = false;
  }
};

const getAccessLogList = async () => {
  accessLogLoading.value = true;
  try {
    const res = (await listYyPhotoAccessLog(accessLogQueryParams.value)) as any;
    accessLogList.value = res.rows ?? res.data ?? [];
    accessLogTotal.value = res.total ?? accessLogList.value.length;
    accessLogLoaded.value = true;
    await loadAlbumOperationsSummaries(albumList.value);
  } finally {
    accessLogLoading.value = false;
  }
};

const handleTabChange = async (name: string | number) => {
  if (name === 'accessLog' && !accessLogLoaded.value) {
    await getAccessLogList();
  }
};

const handleAlbumQuery = () => {
  albumQueryParams.value.pageNum = 1;
  getAlbumList();
};

const handleAssetQuery = () => {
  assetQueryParams.value.pageNum = 1;
  getAssetList();
};

const handleAccessLogQuery = () => {
  accessLogQueryParams.value.pageNum = 1;
  getAccessLogList();
};

const resetAlbumQuery = () => {
  albumQueryFormRef.value?.resetFields();
  handleAlbumQuery();
};

const resetAssetQuery = () => {
  assetQueryFormRef.value?.resetFields();
  handleAssetQuery();
};

const resetAccessLogQuery = () => {
  accessLogQueryFormRef.value?.resetFields();
  accessLogLoaded.value = false;
  handleAccessLogQuery();
};

const handleAlbumSelectionChange = (selection: YyPhotoAlbumVO[]) => {
  albumIds.value = selection.map((item) => item.id);
  albumSingle.value = selection.length !== 1;
  albumMultiple.value = !selection.length;
};

const handleAssetSelectionChange = (selection: YyPhotoAssetVO[]) => {
  assetIds.value = selection.map((item) => item.id);
  assetSingle.value = selection.length !== 1;
  assetMultiple.value = !selection.length;
};

const resetAssetSelection = () => {
  assetIds.value = [];
  assetSingle.value = true;
  assetMultiple.value = true;
};

const handleAssetViewModeChange = () => {
  resetAssetSelection();
};

const toggleAssetGallerySelection = (row: YyPhotoAssetVO) => {
  const exists = assetIds.value.includes(row.id);
  assetIds.value = exists ? assetIds.value.filter((id) => id !== row.id) : [...assetIds.value, row.id];
  assetSingle.value = assetIds.value.length !== 1;
  assetMultiple.value = !assetIds.value.length;
};

const resetAlbum = () => {
  albumForm.value = { ...initAlbumForm };
  albumFormRef.value?.resetFields();
};

const resetAsset = () => {
  assetForm.value = { ...initAssetForm };
  assetFormRef.value?.resetFields();
};

const handleAlbumAdd = () => {
  resetAlbum();
  albumDialog.visible = true;
  albumDialog.title = '新增相册';
};

const handleAssetAdd = () => {
  resetAsset();
  assetDialog.visible = true;
  assetDialog.title = '新增底片';
};

const handleAlbumPhotoUpload = async (row: YyPhotoAlbumVO) => {
  uploadAlbum.value = row;
  uploadHeaders.value = globalHeaders();
  uploadResults.value = [];
  uploadNextSort.value = await resolveAlbumNextSort(row.id);
  uploadDialog.visible = true;
  uploadDialog.title = '上传照片';
};

const handleAlbumAssets = async (row: YyPhotoAlbumVO) => {
  await focusUploadedAlbumAssets(row.id);
};

const loadWorkspaceAssetDiagnostics = async (row?: YyPhotoAlbumVO) => {
  const album = row || albumWorkspaceAlbum.value;
  if (!album?.id) {
    workspaceAssetDiagnostics.value = [];
    return;
  }
  workspaceAssetLoading.value = true;
  try {
    const res = (await listYyPhotoAsset({ pageNum: 1, pageSize: 100, albumId: album.id })) as any;
    workspaceAssetDiagnostics.value = res.rows ?? res.data ?? [];
  } catch {
    workspaceAssetDiagnostics.value = [];
  } finally {
    workspaceAssetLoading.value = false;
  }
};

const handleAlbumWorkspace = async (row: YyPhotoAlbumVO) => {
  albumWorkspaceAlbum.value = row;
  workspaceAssetDiagnostics.value = [];
  albumWorkspaceDialog.visible = true;
  albumWorkspaceDialog.title = '相册工作台';
  await loadWorkspaceAssetDiagnostics(row);
};

const handleWorkspaceAssetTroubleshooting = async () => {
  await loadWorkspaceAssetDiagnostics();
  if (!albumWorkspaceAlbum.value?.id) {
    return;
  }
  await focusUploadedAlbumAssets(albumWorkspaceAlbum.value.id);
};

const handleWorkspaceMissingObjectKeys = async () => {
  const album = albumWorkspaceAlbum.value;
  if (!album?.id) {
    return;
  }
  activeTab.value = 'asset';
  assetQueryParams.value = {
    ...assetQueryParams.value,
    pageNum: 1,
    storeId: album.storeId,
    albumId: album.id,
    visible: '1',
    isSelected: ''
  };
  await getAssetList();
  proxy?.$modal.msgWarning('已切到底片列表，请查看 OSS Key 为空的记录');
};

const handleAlbumSelectedAssets = async (row: YyPhotoAlbumVO) => {
  activeTab.value = 'asset';
  assetQueryParams.value = {
    ...assetQueryParams.value,
    pageNum: 1,
    storeId: row.storeId,
    albumId: row.id,
    isSelected: '1',
    visible: '1'
  };
  await getAssetList();
};

const handleAlbumSelectionConfirm = async (row: YyPhotoAlbumVO) => {
  if (row.selectionStatus !== 'SUBMITTED') {
    proxy?.$modal.msgWarning('只有已提交选片的相册可以确认');
    return;
  }
  await proxy?.$modal.confirm(`确认将相册“${row.albumName || row.id}”的客户选片标记为已完成？`);
  const res = await getYyPhotoAlbum(row.id);
  await updateYyPhotoAlbum({
    ...res.data,
    selectionStatus: 'COMPLETED'
  });
  proxy?.$modal.msgSuccess('选片已确认');
  await getAlbumList();
};

const handleAlbumUpdate = async (row?: YyPhotoAlbumVO) => {
  resetAlbum();
  const id = row?.id || albumIds.value[0];
  const res = await getYyPhotoAlbum(id);
  Object.assign(albumForm.value, res.data);
  albumDialog.visible = true;
  albumDialog.title = '修改相册';
};

const handleAssetUpdate = async (row?: YyPhotoAssetVO) => {
  resetAsset();
  const id = row?.id || assetIds.value[0];
  const res = await getYyPhotoAsset(id);
  Object.assign(assetForm.value, res.data);
  assetDialog.visible = true;
  assetDialog.title = '修改底片';
};

const handleAssetQuickRename = async (row: YyPhotoAssetVO) => {
  if (!row?.id) {
    proxy?.$modal.msgWarning('请选择要重命名的底片');
    return;
  }
  const result = await proxy?.$modal.prompt('请输入新的照片名称');
  const nextName = String(result?.value ?? '').trim();
  const currentName = String(row.fileName ?? '').trim();
  if (!nextName) {
    proxy?.$modal.msgWarning('照片名称不能为空');
    return;
  }
  if (nextName === currentName) {
    proxy?.$modal.msgWarning('照片名称没有变化');
    return;
  }
  const res = await getYyPhotoAsset(row.id);
  await updateYyPhotoAsset({
    ...(res.data as YyPhotoAssetForm),
    fileName: nextName
  });
  proxy?.$modal.msgSuccess('照片名称已更新');
  await getAssetList();
  if (String(albumWorkspaceAlbum.value?.id ?? '') === String(row.albumId ?? '')) {
    await loadWorkspaceAssetDiagnostics();
  }
};

const handleAssetMove = async (row: YyPhotoAssetVO, direction: -1 | 1) => {
  const sortedAssets = [...assetList.value].sort((left, right) => Number(left.sort ?? 0) - Number(right.sort ?? 0));
  const currentIndex = sortedAssets.findIndex((asset) => String(asset.id ?? '') === String(row.id ?? ''));
  const target = sortedAssets[currentIndex + direction];
  if (currentIndex < 0 || !target) {
    proxy?.$modal.msgWarning(direction < 0 ? '已经是第一张照片' : '已经是最后一张照片');
    return;
  }
  const currentSort = Number(row.sort ?? currentIndex);
  const targetSort = Number(target.sort ?? currentIndex + direction);
  const [currentRes, targetRes] = await Promise.all([getYyPhotoAsset(row.id), getYyPhotoAsset(target.id)]);
  await Promise.all([
    updateYyPhotoAsset({
      ...(currentRes.data as YyPhotoAssetForm),
      sort: targetSort
    }),
    updateYyPhotoAsset({
      ...(targetRes.data as YyPhotoAssetForm),
      sort: currentSort
    })
  ]);
  proxy?.$modal.msgSuccess('照片顺序已更新');
  await getAssetList();
  if (String(albumWorkspaceAlbum.value?.id ?? '') === String(row.albumId ?? '')) {
    await loadWorkspaceAssetDiagnostics();
  }
};

const handleAlbumAudit = async (row: YyPhotoAlbumVO) => {
  activeTab.value = 'accessLog';
  accessLogQueryParams.value = {
    ...accessLogQueryParams.value,
    pageNum: 1,
    storeId: row.storeId,
    albumId: row.id,
    assetId: undefined,
    customerPhone: '',
    platform: '',
    action: '',
    success: ''
  };
  await getAccessLogList();
};

const handleAlbumPickupEntry = (row: YyPhotoAlbumVO) => {
  pickupEntryAlbum.value = row;
  resetPickupEntryCopyState();
  pickupEntryDialog.visible = true;
  pickupEntryDialog.title = '客户取片入口';
  refreshPickupQrImage();
  loadPickupEntryAccessSummary(row);
};

const refreshPickupQrImage = async () => {
  pickupQrImageUrl.value = await buildPickupQrImageDataUrl(pickupEntryUrl.value);
};

const loadPickupEntryAccessSummary = async (row: YyPhotoAlbumVO) => {
  if (!row?.id) {
    pickupEntryAccessLogs.value = [];
    return;
  }
  pickupEntryAccessLoading.value = true;
  try {
    const res = (await listYyPhotoAccessLog({
      pageNum: 1,
      pageSize: 10,
      albumId: row.id
    })) as any;
    pickupEntryAccessLogs.value = res.rows ?? res.data ?? [];
    const failureRes = (await listYyPhotoAccessLog({
      pageNum: 1,
      pageSize: 10,
      albumId: row.id,
      success: '0'
    })) as any;
    const failures: YyPhotoAccessLogVO[] = failureRes.rows ?? failureRes.data ?? [];
    if (failures[0] && !pickupEntryAccessLogs.value.some((log) => String(log.id ?? '') === String(failures[0].id ?? ''))) {
      pickupEntryAccessLogs.value = [pickupEntryAccessLogs.value[0], failures[0]].filter(Boolean) as YyPhotoAccessLogVO[];
    }
  } finally {
    pickupEntryAccessLoading.value = false;
  }
};

const formatPickupAccessLog = (log?: YyPhotoAccessLogVO) => {
  if (!log) {
    return '暂无记录';
  }
  const actionText = getOptionLabel(photoAccessActionOptions, log.action);
  const successText = getOptionLabel(photoAccessSuccessOptions, log.success);
  return `${log.createTime || '-'} · ${actionText} · ${successText}`;
};

const handlePickupEntryAccessLog = async () => {
  if (!pickupEntryAlbum.value) {
    return;
  }
  pickupEntryDialog.visible = false;
  await handleAlbumAudit(pickupEntryAlbum.value);
};

const handleAssetAudit = async (row: YyPhotoAssetVO) => {
  activeTab.value = 'accessLog';
  accessLogQueryParams.value = {
    ...accessLogQueryParams.value,
    pageNum: 1,
    storeId: row.storeId,
    albumId: row.albumId,
    assetId: row.id,
    customerPhone: '',
    platform: '',
    action: '',
    success: ''
  };
  await getAccessLogList();
};

const submitAlbumForm = () => {
  albumFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    albumForm.value.id ? await updateYyPhotoAlbum(albumForm.value) : await addYyPhotoAlbum(albumForm.value);
    proxy?.$modal.msgSuccess('保存成功');
    albumDialog.visible = false;
    getAlbumList();
  });
};

const submitAssetForm = () => {
  assetFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    assetForm.value.id ? await updateYyPhotoAsset(assetForm.value) : await addYyPhotoAsset(assetForm.value);
    proxy?.$modal.msgSuccess('保存成功');
    assetDialog.visible = false;
    getAssetList();
  });
};

const beforePhotoUpload = (file: File) => {
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
  const allowTypes = ['jpg', 'jpeg', 'png', 'webp'];
  if (!extension || !allowTypes.includes(extension) || (file.type && !file.type.startsWith('image/'))) {
    proxy?.$modal.msgError('文件格式不正确，请上传 jpg/jpeg/png/webp 图片');
    return false;
  }
  if (file.name.includes(',')) {
    proxy?.$modal.msgError('文件名不正确，不能包含英文逗号');
    return false;
  }
  if (file.size / 1024 / 1024 > photoUploadSizeMb) {
    proxy?.$modal.msgError(`上传图片大小不能超过 ${photoUploadSizeMb}MB`);
    return false;
  }
  if (!uploadAlbum.value?.id || !uploadAlbum.value?.storeId) {
    proxy?.$modal.msgError('相册信息不完整，无法上传');
    return false;
  }
  uploadPendingCount.value += 1;
  return true;
};

const uploadOssFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/resource/oss/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
    },
    data: formData
  }) as Promise<any>;
};

const resolveOssById = async (ossId: string | number, fallbackUrl?: string) => {
  const ossRes = await listByIds(ossId);
  const oss = (ossRes.data?.[0] || {}) as OssVO;
  if (!oss.fileName) {
    throw new Error('OSS Key 获取失败，请检查 system:oss:query 权限或 OSS 记录');
  }
  return {
    ...oss,
    url: oss.url || fallbackUrl
  };
};

const tryUploadThumbnail = async (file: UploadFile) => {
  try {
    const rawFile = file.raw as File | undefined;
    if (!rawFile) {
      return { objectKey: '', message: '原始文件不可读，已跳过缩略图' };
    }
    const thumbnailFile = await createClientThumbnailFile(rawFile);
    if (!thumbnailFile) {
      return { objectKey: '', message: '当前浏览器未生成缩略图，目录将回退原图' };
    }
    const uploadRes = await uploadOssFile(thumbnailFile);
    if (uploadRes?.code !== 200 || !uploadRes?.data?.ossId) {
      throw new Error(uploadRes?.msg || '缩略图 OSS 上传失败');
    }
    const thumbnailOss = await resolveOssById(uploadRes.data.ossId, uploadRes.data.url);
    return { objectKey: thumbnailOss.fileName, message: '缩略图已生成' };
  } catch (error: any) {
    return { objectKey: '', message: resolveUploadErrorMessage(error, '缩略图生成失败，目录将回退原图') };
  }
};

const handlePhotoUploadSuccess = async (res: any, file: UploadFile) => {
  const displayName = file.name || res?.data?.fileName || '未知文件';
  let uploadedOss: OssVO | undefined;
  let uploadedSort: number | undefined;
  let thumbnailResult: { objectKey: string; message: string } | undefined;
  try {
    if (res?.code !== 200 || !res?.data?.ossId) {
      throw new Error(res?.msg || 'OSS 上传失败');
    }
    uploadedOss = await resolveOssById(res.data.ossId, res.data.url);
    if (!uploadedOss.url) {
      throw new Error('OSS URL 获取失败，请检查 OSS 配置');
    }
    const album = uploadAlbum.value;
    if (!album) {
      throw new Error('相册信息已失效');
    }
    const sort = uploadNextSort.value;
    uploadedSort = sort;
    uploadNextSort.value += 1;
    thumbnailResult = await tryUploadThumbnail(file);
    const assetForm = buildPhotoAssetFormFromOss(album, uploadedOss, res.data.fileName || displayName, sort, res.data.ossId);
    assetForm.thumbnailObjectKey = thumbnailResult.objectKey;
    await addYyPhotoAsset(assetForm);
    uploadResults.value.push({
      fileName: displayName,
      success: true,
      message: thumbnailResult.objectKey ? '已创建底片记录和缩略图' : `已创建底片记录；${thumbnailResult.message}`,
      ossKey: uploadedOss.fileName,
      ossId: res.data.ossId,
      fileUrl: uploadedOss.url,
      thumbnailObjectKey: thumbnailResult.objectKey,
      originalName: uploadedOss.originalName,
      sort
    });
    proxy?.$modal.msgSuccess(`${displayName} 上传成功`);
  } catch (error: any) {
    const message = resolveUploadErrorMessage(error, '创建底片失败');
    uploadResults.value.push({
      fileName: displayName,
      success: false,
      message,
      ossKey: uploadedOss?.fileName,
      ossId: res?.data?.ossId,
      fileUrl: uploadedOss?.url,
      thumbnailObjectKey: thumbnailResult?.objectKey,
      originalName: uploadedOss?.originalName,
      recoverable: Boolean(uploadedOss?.fileName && uploadedOss?.url && res?.data?.ossId),
      sort: uploadedSort
    });
    proxy?.$modal.msgError(`${displayName} 创建底片失败：${message}`);
  } finally {
    uploadPendingCount.value = Math.max(uploadPendingCount.value - 1, 0);
  }
};

const retryCreateAssetFromUploadResult = async (row: UploadResultRow) => {
  if (!isRecoverableUploadResult(row)) {
    proxy?.$modal.msgWarning('该失败记录缺少 OSS 信息，无法重试建底片');
    return;
  }
  const album = uploadAlbum.value;
  if (!album) {
    proxy?.$modal.msgError('相册信息已失效，请重新打开上传窗口');
    return;
  }
  row.retrying = true;
  try {
    const sort = row.sort ?? uploadNextSort.value;
    if (row.sort === undefined) {
      uploadNextSort.value += 1;
    }
    await addYyPhotoAsset(buildRetryPhotoAssetFormFromUploadResult(album, row, sort));
    row.success = true;
    row.recoverable = false;
    row.retrying = false;
    row.sort = sort;
    row.message = '重试成功，已创建底片记录';
    proxy?.$modal.msgSuccess(`${row.fileName} 已创建底片记录`);
  } catch (error: any) {
    row.retrying = false;
    row.message = resolveUploadErrorMessage(error, '重试创建底片失败');
    proxy?.$modal.msgError(`${row.fileName} 重试失败：${row.message}`);
  }
};

const canCopyPhotoPickupPreflightCommand = (row: UploadResultRow) => {
  return Boolean(uploadAlbum.value?.id && resolveBareOssUrlFromUploadResult(row));
};

const copyPhotoPickupPreflightCommand = async (row: UploadResultRow) => {
  const album = uploadAlbum.value;
  if (!album?.id) {
    proxy?.$modal.msgWarning('相册信息已失效，请重新打开上传窗口');
    return;
  }
  const bareOssUrl = resolveBareOssUrlFromUploadResult(row);
  if (!bareOssUrl) {
    proxy?.$modal.msgWarning('当前记录不是可验证的阿里云 OSS 裸链');
    return;
  }
  const createdAsset = await findUploadedAssetByObjectKey(album.id, row.ossKey);
  const command = buildPhotoPickupPreflightCommand({
    baseUrl: import.meta.env.VITE_APP_PUBLIC_API_URL || 'https://api.evanshine.me',
    phone: album.customerPhone || '<手机号>',
    accessCode: resolveAlbumPickupCode(album) || '<取片码>',
    albumId: album.id,
    assetId: createdAsset?.id || '<底片ID>',
    bareOssUrl
  });
  await copyText(command, '生产预检命令已复制', '复制失败，请手动复制命令');
};

const findUploadedAssetByObjectKey = async (albumId: string | number, objectKey?: string) => {
  const key = String(objectKey || '').trim();
  if (!key) {
    return undefined;
  }
  const existing = assetList.value.find((asset) => String(asset.albumId ?? '') === String(albumId) && String(asset.objectKey || '') === key);
  if (existing) {
    return existing;
  }
  try {
    const res = (await listYyPhotoAsset({ pageNum: 1, pageSize: 1000, albumId, fileName: '', isSelected: '', visible: '' })) as any;
    const rows = (res.rows ?? res.data ?? []) as YyPhotoAssetVO[];
    return rows.find((asset) => String(asset.objectKey || '') === key);
  } catch {
    return undefined;
  }
};

const findAlbumForAsset = async (asset: YyPhotoAssetVO) => {
  const albumId = String(asset.albumId ?? '').trim();
  if (!albumId) {
    return undefined;
  }
  const existing = albumList.value.find((album) => String(album.id ?? '') === albumId);
  if (existing) {
    return existing;
  }
  try {
    const res = await getYyPhotoAlbum(asset.albumId);
    return res.data as YyPhotoAlbumVO;
  } catch {
    return undefined;
  }
};

const copyAssetPreflightCommand = async (asset: YyPhotoAssetVO) => {
  const bareOssUrl = resolveBareOssUrlFromUploadResult({
    success: true,
    fileUrl: asset.fileUrl
  });
  if (!bareOssUrl) {
    proxy?.$modal.msgWarning('当前底片缺少可验证的阿里云 OSS 裸链，请检查文件地址或 OSS 配置');
    return;
  }
  const album = await findAlbumForAsset(asset);
  const command = buildPhotoPickupPreflightCommand({
    baseUrl: import.meta.env.VITE_APP_PUBLIC_API_URL || 'https://api.evanshine.me',
    phone: album?.customerPhone || '<手机号>',
    accessCode: resolveAlbumPickupCode(album) || '<取片码>',
    albumId: asset.albumId || album?.id || '<相册ID>',
    assetId: asset.id || '<底片ID>',
    bareOssUrl
  });
  await copyText(command, '底片预检命令已复制', '复制失败，请手动复制命令');
};

const handlePhotoUploadError = (error: Error, file: UploadFile) => {
  uploadPendingCount.value = Math.max(uploadPendingCount.value - 1, 0);
  const message = resolveUploadErrorMessage(error, 'OSS 上传失败');
  uploadResults.value.push({ fileName: file.name || '未知文件', success: false, message });
  proxy?.$modal.msgError(`上传图片失败：${message}`);
};

// 上传入口由 yy:photoAsset:add 控制；完整链路还依赖 system:oss:upload 与 system:oss:query。
const resolveAlbumNextSort = async (albumId: string | number) => {
  try {
    const res = (await listYyPhotoAsset({ pageNum: 1, pageSize: 1000, albumId })) as any;
    const rows = Array.isArray(res.rows) ? res.rows : [];
    return resolveNextUploadSort(rows, Number(res.total ?? 0));
  } catch {
    return 0;
  }
};

const focusUploadedAlbumAssets = async (albumId: string | number) => {
  activeTab.value = 'asset';
  assetQueryParams.value = {
    ...assetQueryParams.value,
    ...buildAssetQueryForUploadedAlbum(albumId, assetQueryParams.value.pageSize)
  };
  await getAssetList();
};

const handleViewUploadedAssets = async () => {
  if (!uploadAlbum.value?.id) {
    return;
  }
  uploadDialog.visible = false;
  await focusUploadedAlbumAssets(uploadAlbum.value.id);
};

const copyPickupCode = async (pickupCode?: string) => {
  const value = String(pickupCode || '').trim();
  if (!value) {
    proxy?.$modal.msgWarning('暂无客户取片码');
    return;
  }
  await copyText(value, '客户取片码已复制', '复制失败，请手动复制取片码');
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

const resetPickupEntryCopyState = () => {
  pickupEntryCopyState.type = 'info';
  pickupEntryCopyState.target = '';
  pickupEntryCopyState.message = '尚未操作，本次打开入口后可复制取片码、H5 入口、客户说明或下载二维码。';
};

const buildPickupQrDownloadFileName = () => {
  const album = pickupEntryAlbum.value;
  const albumName = String(album?.albumName || 'album')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'album';
  const albumId = String(album?.id || 'album').trim().replace(/[\\/:*?"<>|\s]+/g, '-') || 'album';
  return `photo-pickup-${albumName}-${albumId}.png`;
};

const copyPickupEntryText = async (value?: string, target = '内容') => {
  const text = String(value || '').trim();
  if (!text) {
    pickupEntryCopyState.type = 'warning';
    pickupEntryCopyState.target = target;
    pickupEntryCopyState.message = '暂无可复制内容，请先补齐相册配置。';
    proxy?.$modal.msgWarning('暂无可复制内容');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    pickupEntryCopyState.type = 'success';
    pickupEntryCopyState.target = target;
    pickupEntryCopyState.message = '已复制，可直接发给客户。';
    proxy?.$modal.msgSuccess(`${target}已复制`);
  } catch {
    pickupEntryCopyState.type = 'warning';
    pickupEntryCopyState.target = target;
    pickupEntryCopyState.message = '复制失败，请手动选中文本复制。';
    proxy?.$modal.msgWarning('复制失败，请手动复制');
  }
};

const copyPickupShareText = () => {
  copyPickupEntryText(pickupEntryShareText.value, '客户说明');
};

const copyPickupChannelShareText = (channelLabel: string) => {
  copyPickupEntryText(buildPickupChannelShareText(pickupEntryAlbum.value, channelLabel, pickupEntryUrl.value), `${channelLabel}客户话术`);
};

const copyPickupSmokeCommand = () => {
  copyPickupEntryText(pickupSmokeCommand.value, '相册验收命令');
};

const copyRealOssEvidenceInputCommand = () => {
  copyPickupEntryText(realOssEvidenceInputCommand.value, '真实 OSS 证据清单命令');
};

const copyWorkspaceRealOssEvidenceCommand = () => {
  if (!workspaceRealOssEvidenceCommand.value) {
    pickupEntryCopyState.type = 'warning';
    pickupEntryCopyState.target = '真实 OSS 自动证据命令';
    pickupEntryCopyState.message = '请先上传真实 OSS 图片，并在相册工作台刷新照片排障。';
    proxy?.$modal.msgWarning('暂无可复制的自动证据命令');
    return;
  }
  copyPickupEntryText(workspaceRealOssEvidenceCommand.value, '真实 OSS 自动证据命令');
};

const copyWorkspaceRealOssEvidenceFinalPassCommand = () => {
  if (!workspaceRealOssEvidenceFinalPassCommand.value) {
    pickupEntryCopyState.type = 'warning';
    pickupEntryCopyState.target = '真实 OSS 最终 PASS 命令';
    pickupEntryCopyState.message = '请先上传真实 OSS 图片，并在相册工作台刷新照片排障。';
    proxy?.$modal.msgWarning('暂无可复制的最终 PASS 命令');
    return;
  }
  copyPickupEntryText(workspaceRealOssEvidenceFinalPassCommand.value, '真实 OSS 最终 PASS 命令');
};

const downloadPickupQrImage = () => {
  if (!pickupQrImageUrl.value) {
    pickupEntryCopyState.type = 'warning';
    pickupEntryCopyState.target = 'H5 二维码';
    pickupEntryCopyState.message = '暂无可下载二维码，请先配置正式 H5 入口或使用小程序话术。';
    proxy?.$modal.msgWarning('暂无可下载二维码');
    return;
  }
  const link = document.createElement('a');
  link.href = pickupQrImageUrl.value;
  link.download = buildPickupQrDownloadFileName();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  pickupEntryCopyState.type = 'success';
  pickupEntryCopyState.target = 'H5 二维码';
  pickupEntryCopyState.message = `已下载 ${link.download}，可发给客户扫码取片。`;
  proxy?.$modal.msgSuccess('二维码已下载');
};

const resolveUploadErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.msg || error?.response?.data?.message || error?.data?.msg || error?.msg || error?.message || fallback;
};

const resetUploadState = () => {
  uploadPendingCount.value = 0;
  uploadAlbum.value = undefined;
  uploadResults.value = [];
  uploadNextSort.value = 0;
  albumUploadRef.value?.clearFiles();
};

const handleAlbumDelete = async (row?: YyPhotoAlbumVO) => {
  const deleteIds = row?.id || albumIds.value;
  await proxy?.$modal.confirm(`是否确认删除相册 ${deleteIds}？`);
  await delYyPhotoAlbum(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getAlbumList();
};

const handleAssetDelete = async (row?: YyPhotoAssetVO) => {
  const deleteIds = row?.id || assetIds.value;
  await proxy?.$modal.confirm(`是否确认删除底片 ${deleteIds}？`);
  await delYyPhotoAsset(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  getAssetList();
};

const handleAssetBatchVisible = async (visible: '0' | '1') => {
  const selectedIds = assetIds.value.filter((id) => id !== undefined && id !== null && id !== '');
  if (!selectedIds.length) {
    proxy?.$modal.msgWarning('请先选择底片');
    return;
  }
  const actionText = visible === '1' ? '批量设为可见' : '批量隐藏';
  const targetText = visible === '1' ? '设为客户可见' : '隐藏';
  await proxy?.$modal.confirm(`确认将选中的 ${selectedIds.length} 张底片${targetText}？`);
  assetLoading.value = true;
  try {
    await Promise.all(
      selectedIds.map(async (id) => {
        const res = await getYyPhotoAsset(id);
        await updateYyPhotoAsset({
          ...(res.data as YyPhotoAssetForm),
          visible
        });
      })
    );
    proxy?.$modal.msgSuccess(`${actionText}成功`);
    await getAssetList();
  } finally {
    assetLoading.value = false;
  }
};

const handleAlbumExport = () => {
  proxy?.download('yy/photoAlbum/export', albumQueryParams.value, `yy_photo_album_${new Date().getTime()}.xlsx`);
};

const handleAssetExport = () => {
  proxy?.download('yy/photoAsset/export', assetQueryParams.value, `yy_photo_asset_${new Date().getTime()}.xlsx`);
};

const handleAccessLogExport = () => {
  proxy?.download('yy/photoAccessLog/export', accessLogQueryParams.value, `yy_photo_access_log_${new Date().getTime()}.xlsx`);
};

onMounted(async () => {
  applyPhotoWorkbenchRouteQuery();
  await getAlbumList();
  await getAssetList();
  if (activeTab.value === 'accessLog') {
    await getAccessLogList();
  }
});
</script>

<style scoped>
.yy-photo-overview {
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.yy-photo-overview :deep(.el-card__body) {
  padding: 18px;
}

.yy-photo-overview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.yy-photo-overview-title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
}

.yy-photo-overview-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.yy-photo-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.yy-photo-metric {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-photo-metric-label,
.yy-photo-metric-copy {
  display: block;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-photo-metric strong {
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

@media (max-width: 1100px) {
  .yy-photo-overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .yy-photo-overview-head {
    display: block;
  }

  .yy-photo-overview-head .el-tag {
    margin-top: 10px;
  }

  .yy-photo-overview-grid {
    grid-template-columns: 1fr;
  }
}

.yy-photo-thumb,
.yy-photo-thumb-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 6px;
}

.yy-photo-thumb {
  display: block;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}

.yy-pickup-code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.yy-pickup-code {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-album-ops-summary {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.yy-album-ops-head,
.yy-album-ops-meta,
.yy-album-ops-issues,
.yy-album-ops-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.yy-album-ops-head span,
.yy-album-ops-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-album-ops-head span {
  color: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.yy-album-ops-meta {
  flex-wrap: wrap;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-album-ops-issues {
  flex-wrap: wrap;
}

.yy-album-ops-actions {
  flex-wrap: wrap;
  padding-top: 2px;
}

.yy-album-ops-actions .el-button {
  margin-left: 0;
}

.yy-pickup-entry {
  display: grid;
  gap: 14px;
}

.yy-pickup-entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.yy-pickup-entry-item {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-pickup-entry-item span,
.yy-pickup-entry-label {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.yy-pickup-entry-item strong {
  display: block;
  overflow: hidden;
  margin-top: 6px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-pickup-entry-section {
  display: grid;
  gap: 8px;
}

.yy-pickup-ops-section {
  padding: 12px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-pickup-entry-qr-section {
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.yy-pickup-entry-qr-card {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
  text-align: center;
}

.yy-pickup-entry-qr-card.is-muted {
  border-style: dashed;
}

.yy-pickup-entry-qr-image,
.yy-pickup-entry-qr-placeholder {
  width: 144px;
  height: 144px;
  border-radius: 8px;
}

.yy-pickup-entry-qr-image {
  display: block;
  border: 1px solid var(--el-border-color-lighter);
  background: #fff;
}

.yy-pickup-entry-qr-placeholder {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px dashed var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.yy-pickup-entry-qr-placeholder .el-icon {
  font-size: 28px;
}

.yy-pickup-entry-qr-card strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.yy-pickup-entry-qr-card span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.yy-pickup-entry-qr-actions {
  display: grid;
  align-content: center;
  gap: 10px;
  min-width: 0;
}

.yy-pickup-entry-copyline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.yy-pickup-copy-feedback {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-pickup-copy-feedback.is-success {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.yy-pickup-copy-feedback.is-warning {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.yy-pickup-copy-feedback span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-pickup-copy-feedback strong {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-pickup-platform-list {
  display: grid;
  gap: 10px;
}

.yy-pickup-platform-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-pickup-platform-item.is-muted {
  border-style: dashed;
  background: var(--el-fill-color-lighter);
}

.yy-pickup-platform-item strong,
.yy-pickup-platform-item span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-pickup-platform-item strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.yy-pickup-platform-item span {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.yy-pickup-channel-copy {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.yy-pickup-channel-copy .el-button {
  margin-left: 0;
}

.yy-pickup-access-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.yy-pickup-access-card {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-pickup-access-card.is-warning {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.yy-pickup-access-card span,
.yy-pickup-access-failure span {
  display: block;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-pickup-access-card strong {
  display: block;
  overflow: hidden;
  margin-top: 6px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-pickup-access-failure {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.yy-album-workspace {
  display: grid;
  gap: 14px;
}

.yy-album-workspace-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-album-workspace-kicker {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.yy-album-workspace-hero h3 {
  margin: 6px 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
}

.yy-album-workspace-hero p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.yy-album-workspace-action-plan {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-album-workspace-action-plan > span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.yy-album-workspace-action-plan > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.yy-album-workspace-action-plan .el-button {
  margin-left: 0;
}

.yy-album-workspace-pending-list {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-album-workspace-pending-items {
  display: grid;
  gap: 10px;
}

.yy-album-workspace-pending-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.yy-album-workspace-pending-copy {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 6px 8px;
  min-width: 0;
}

.yy-album-workspace-pending-copy strong,
.yy-album-workspace-pending-copy span {
  display: block;
  overflow: hidden;
  line-height: 1.45;
  text-overflow: ellipsis;
}

.yy-album-workspace-pending-copy strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.yy-album-workspace-pending-copy span {
  grid-column: 1 / -1;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.yy-album-workspace-pending-empty {
  padding: 12px;
  border: 1px dashed var(--el-color-success-light-5);
  border-radius: 8px;
  background: var(--el-color-success-light-9);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.yy-album-workspace-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.yy-album-workspace-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.yy-album-workspace-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.yy-album-workspace-panel-head strong {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-album-workspace-stat {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.yy-album-workspace-stat span,
.yy-album-workspace-copyline span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.yy-album-workspace-stat strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

.yy-album-workspace-tags,
.yy-album-workspace-copyline,
.yy-album-workspace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.yy-album-workspace-actions .el-button {
  margin-left: 0;
}

.yy-album-workspace-evidence {
  border-style: dashed;
  background: var(--el-color-warning-light-9);
}

.yy-album-workspace-command {
  min-width: 0;
}

.yy-album-workspace-assets {
  overflow: hidden;
}

.yy-album-workspace-asset-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.yy-album-workspace-asset-stats > div {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-album-workspace-asset-stats span,
.yy-album-workspace-preview-meta {
  display: block;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-album-workspace-asset-stats strong {
  display: block;
  margin-top: 4px;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
}

.yy-album-workspace-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.yy-album-workspace-preview-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}

.yy-album-workspace-preview-thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--el-fill-color-light);
}

.yy-album-workspace-preview-thumb .el-image,
.yy-album-workspace-preview-thumb .yy-photo-thumb-placeholder {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
}

.yy-album-workspace-preview-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.yy-album-workspace-preview-name {
  overflow: hidden;
  padding: 10px 10px 2px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-album-workspace-preview-meta {
  padding: 0 10px 10px;
}

@media (max-width: 640px) {
  .yy-pickup-entry-grid,
  .yy-pickup-entry-qr-section,
    .yy-pickup-entry-copyline,
    .yy-pickup-access-grid,
  .yy-pickup-access-failure,
  .yy-pickup-copy-feedback,
  .yy-pickup-platform-item,
  .yy-album-workspace-action-plan,
  .yy-album-workspace-pending-item,
  .yy-album-workspace-grid,
  .yy-album-workspace-asset-stats,
  .yy-album-workspace-preview-grid {
    grid-template-columns: 1fr;
  }

  .yy-album-workspace-hero {
    display: grid;
  }

  .yy-pickup-entry-qr-card {
    justify-items: start;
    text-align: left;
  }
}

.yy-photo-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px dashed var(--el-border-color);
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
}

.yy-photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 180px;
}

.yy-photo-gallery-card {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.yy-photo-gallery-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: var(--el-box-shadow);
  transform: translateY(-1px);
}

.yy-photo-gallery-card.is-selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.yy-photo-gallery-image-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--el-fill-color-light);
}

.yy-photo-gallery-image,
.yy-photo-gallery-placeholder {
  width: 100%;
  height: 100%;
}

.yy-photo-gallery-image {
  display: block;
}

.yy-photo-gallery-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-bottom: 1px dashed var(--el-border-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.yy-photo-gallery-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.yy-photo-gallery-diagnostics {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.yy-photo-gallery-diagnostics :deep(.el-tag) {
  max-width: 100%;
}

.yy-photo-gallery-body {
  padding: 12px 14px 14px;
}

.yy-photo-gallery-title {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yy-photo-gallery-meta {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.yy-photo-gallery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.yy-upload-result-muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
