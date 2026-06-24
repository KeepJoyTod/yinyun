<template>
  <main class="min-h-screen px-3 py-6 text-amber-dark" :style="{ background: page?.backgroundColor || '#F4EFE6' }">
    <section class="mx-auto max-w-[440px] overflow-hidden border border-amber-topbar-border bg-[#FFFAF3] shadow-[0_24px_50px_rgba(26,24,20,0.08)]">
      <NoticeBar :notice="notice" />

      <div v-if="loading" class="px-6 py-12 text-center text-[13px] text-amber-text-muted">加载中...</div>
      <div v-else-if="!page" class="px-6 py-14 text-center">
        <div class="text-[18px] font-semibold text-amber-dark">页面不可访问</div>
        <p class="mt-3 text-[12px] leading-relaxed text-amber-text-muted">当前页面未发布、已下线，或链接不存在。</p>
      </div>
      <MicroPageRenderer
        v-else
        :components="sortedComponents"
        :cover-url="page.coverUrl"
        :page-desc="page.pageDesc"
        :page-title="page.pageTitle"
        :store-id="publicStoreId"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNotice } from '../../shared/composables/useNotice'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { backendApi, type PublicMicroPageDto } from '../../shared/api/backend'
import MicroPageRenderer from './components/MicroPageRenderer.vue'

const route = useRoute()
const { notice, pushNotice } = useNotice()

const page = ref<PublicMicroPageDto | null>(null)
const loading = ref(false)

const sortedComponents = computed(() => [...(page.value?.schema.components ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))
const publicStoreId = computed(() => String(route.query.storeId || page.value?.storeId || ''))

const loadPage = async () => {
  loading.value = true
  try {
    page.value = await backendApi.getPublicMicroPage(String(route.params.id || ''))
  } catch (error) {
    page.value = null
    pushNotice('error', error instanceof Error ? `页面加载失败：${error.message}` : '页面加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
</script>
