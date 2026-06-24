<template>
  <section class="border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="font-sans text-[14px] font-medium text-amber-dark">相册</div>
      <button
        v-if="album"
        class="yy-action text-[10px] font-mono uppercase tracking-[0.14em] text-amber-text-muted hover:text-amber-dark"
        type="button"
        @click="emit('openAlbum', album.id)"
      >查看客片 ↗</button>
    </div>
    <OrderPhotoDeliveryStageCard
      :stage="stage"
      :stage-class="stageClass"
      :show-fallback-hint="Boolean(album)"
    >
      <OrderAlbumActionGroup
        :notify-title-text="availability.notify.reason || '通知客户'"
        :notify-disabled="!canNotify || Boolean(actionLoading)"
        :notify-loading="actionLoading === 'notify'"
        :confirm-title-text="availability.confirm.reason || '客片确认'"
        :confirm-disabled="!canConfirm || Boolean(actionLoading)"
        :confirm-loading="actionLoading === 'confirm'"
        :deliver-title-text="availability.deliver.reason || '资料发送'"
        :deliver-disabled="!canDeliver || Boolean(actionLoading)"
        :deliver-loading="actionLoading === 'deliver'"
        :no-album="!album"
        :primary-action="stage.primaryAction"
        :availability-reason="album ? (availability.deliver.reason || availability.confirm.reason || '') : ''"
        @notify="emit('notify')"
        @confirm="emit('confirm')"
        @deliver="emit('deliver')"
        @open-photo-management="emit('openPhotoManagement')"
      />
    </OrderPhotoDeliveryStageCard>
    <OrderAlbumInfoGrid
      v-if="album"
      :album="album"
      :status-class="statusClass"
    />
    <OrderPhotoAccessList
      v-if="album"
      :rows="photoAccessLogs"
      :loading="photoAccessLoading"
      :error="photoAccessError"
      @view-more="emit('viewMorePhotoAccess', album.id)"
    />
    <p v-else class="text-[11px] text-amber-text-muted leading-relaxed">
      该订单尚未关联客片相册。拍摄完成后可到「客片管理」上传底片。
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '../../shared/stores/appStore'
import type { AlbumActionAvailability, PhotoAccessLogRow } from '../albums/photoMgmtOperations'
import OrderAlbumActionGroup from './OrderAlbumActionGroup.vue'
import OrderAlbumInfoGrid from './OrderAlbumInfoGrid.vue'
import OrderPhotoAccessList from './OrderPhotoAccessList.vue'
import OrderPhotoDeliveryStageCard from './OrderPhotoDeliveryStageCard.vue'
import type { OrderPhotoDeliveryStage } from './orderOperations'

defineProps<{
  album: Album | null
  stage: OrderPhotoDeliveryStage
  stageClass: string
  availability: AlbumActionAvailability
  canNotify: boolean
  canConfirm: boolean
  canDeliver: boolean
  actionLoading: '' | 'notify' | 'confirm' | 'deliver'
  statusClass: string
  photoAccessLogs: PhotoAccessLogRow[]
  photoAccessLoading: boolean
  photoAccessError: string
}>()

const emit = defineEmits<{
  openAlbum: [albumId: string]
  notify: []
  confirm: []
  deliver: []
  openPhotoManagement: []
  viewMorePhotoAccess: [albumId: string]
}>()
</script>
