<template>
  <div class="flex flex-col gap-7">
    <div class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Notification Center</span>
          <h2 class="mt-1 text-[17.5px] font-sans font-medium text-amber-dark">通知模板</h2>
          <p class="mt-1 text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
            维护短信、微信等客户触达模板，并查看最近发送日志和失败原因。
          </p>
        </div>
        <button
          class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black"
          type="button"
          @click="openCreate"
        >
          新增模板
        </button>
      </div>
    </div>

    <NoticeBanner :notice="notice" />

    <MerchantOpsSummaryBoard
      v-model:active-notification-filter="activeNotificationFilter"
      :cards="cards"
      :quick-notification-filters="quickNotificationFilters"
    />

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4 max-[860px]:flex-col max-[860px]:items-start">
          <div class="flex flex-wrap items-center gap-3">
            <select v-model="channelFilter" class="yy-field-sm">
              <option value="all">全部渠道</option>
              <option value="SMS">短信</option>
              <option value="WECHAT">微信</option>
            </select>
            <input
              v-model="searchQuery"
              class="yy-field-sm w-[220px]"
              placeholder="搜索模板编码 / 场景 / 标题"
              type="text"
            />
          </div>
          <button
            class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] font-sans text-amber-text-muted hover:bg-black/5"
            type="button"
            :disabled="loading"
            @click="reload"
          >
            {{ loading ? '加载中...' : '刷新' }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">模板</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">渠道</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">内容</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">状态</th>
                <th class="px-5 py-3 text-[11px] font-sans text-amber-text-muted">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/50">
              <tr v-for="template in filteredTemplates" :key="template.backendId" class="hover:bg-black/[0.015]">
                <td class="px-5 py-4">
                  <div class="flex flex-col">
                    <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ template.templateCode }}</span>
                    <span class="mt-1 text-[12px] font-medium text-amber-dark">{{ template.scene }}</span>
                    <span class="mt-1 text-[10px] text-amber-text-muted">{{ template.title || '未设置标题' }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-[11px] text-amber-dark">{{ template.channelType }}</td>
                <td class="px-5 py-4 text-[11px] text-amber-text-muted">{{ template.content }}</td>
                <td class="px-5 py-4">
                  <span
                    class="px-2 py-0.5 text-[10px]"
                    :class="template.enabled === '1'
                      ? 'bg-[#EBF4ED] text-[#2D7A4D]'
                      : 'border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted'"
                  >
                    {{ template.enabled === '1' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <button
                    class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5"
                    type="button"
                    @click="openEdit(template)"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!filteredTemplates.length" class="px-6 py-10 text-center">
          <div class="text-[14px] font-sans text-amber-dark">当前筛选下没有模板</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">可以切回全部模板，或者新增一个场景模板后再继续配置。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Delivery Logs</div>
          <h3 class="mt-1 text-[15px] font-sans font-medium text-amber-dark">最近发送日志</h3>
        </div>
        <div class="divide-y divide-amber-topbar-border/60">
          <article v-for="log in visibleLogs" :key="log.backendId" class="px-5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ log.channelType }} / {{ log.receiver }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ log.storeName }}</div>
              </div>
              <span
                class="px-2 py-0.5 text-[10px]"
                :class="log.sendStatus === 'SUCCESS'
                  ? 'bg-[#EBF4ED] text-[#2D7A4D]'
                  : 'bg-[#B8543B]/10 text-[#8C3E2C]'"
              >
                {{ log.sendStatus === 'SUCCESS' ? '成功' : '失败' }}
              </span>
            </div>
            <div class="mt-3 text-[10.5px] leading-relaxed text-amber-text-muted">
              <div>发送时间：{{ log.sentTime ? log.sentTime.replace('T', ' ').slice(0, 16) : '-' }}</div>
              <div>请求 ID：{{ log.requestId || '-' }}</div>
              <div v-if="log.errorMessage">错误：{{ log.errorMessage }}</div>
              <div v-else>备注：{{ log.remark || '无' }}</div>
            </div>
          </article>
        </div>

        <div v-if="!visibleLogs.length" class="px-5 py-8 text-center text-[11px] text-amber-text-muted">
          当前筛选下没有日志
        </div>
      </aside>
    </section>

    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="w-full max-w-[680px] border border-amber-topbar-border bg-amber-content-bg shadow-2xl">
          <div class="border-b border-amber-topbar-border px-6 py-5">
            <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Template Form</span>
            <h3 class="mt-1 text-[17px] font-sans text-amber-dark">{{ editingId ? '编辑模板' : '新增模板' }}</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              模板编码
              <input v-model="form.templateCode" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              业务场景
              <input v-model="form.scene" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              通知渠道
              <select v-model="form.channelType" class="yy-field-md">
                <option value="SMS">短信</option>
                <option value="WECHAT">微信</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              标题
              <input v-model="form.title" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              服务商模板 ID
              <input v-model="form.providerTemplateId" class="yy-field-md" type="text" />
            </label>
            <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
              状态
              <select v-model="form.enabled" class="yy-field-md">
                <option value="1">启用</option>
                <option value="0">停用</option>
              </select>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
              模板内容
              <textarea v-model="form.content" class="min-h-[110px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark focus:outline-none"></textarea>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
              备注
              <input v-model="form.remark" class="yy-field-md" type="text" />
            </label>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
            <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5" type="button" @click="modalOpen = false">
              取消
            </button>
            <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted" :disabled="saving" type="button" @click="submit">
              {{ saving ? '保存中...' : '保存模板' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import MerchantOpsSummaryBoard from '../merchant/modules/operations/components/MerchantOpsSummaryBoard.vue'
import { useMerchantOperationsState } from '../merchant/modules/operations/composables/useMerchantOperationsState'
import { useNotice } from '../../shared/composables/useNotice'

const { notice, pushNotice } = useNotice()
const {
  loading,
  saving,
  modalOpen,
  editingId,
  activeNotificationFilter,
  channelFilter,
  searchQuery,
  form,
  filteredTemplates,
  visibleLogs,
  quickNotificationFilters,
  cards,
  openCreate,
  openEdit,
  reload,
} = useMerchantOperationsState({
  pushError: message => pushNotice('error', message),
})

const submit = async () => {
  saving.value = true
  try {
    const next = await appStore.saveNotificationTemplate({
      id: editingId.value ?? undefined,
      templateCode: form.templateCode,
      scene: form.scene,
      channelType: form.channelType,
      title: form.title,
      content: form.content,
      providerTemplateId: form.providerTemplateId,
      enabled: form.enabled,
      remark: form.remark,
    })
    modalOpen.value = false
    await reload()
    pushNotice('success', `${next.scene} 模板已保存`)
  } catch (error) {
    pushNotice('error', error instanceof Error ? error.message : '模板保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
