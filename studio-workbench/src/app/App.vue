<template>
  <router-view v-if="isPublicRoute" />

  <template v-else>
    <div ref="workbenchRoot" class="relative flex h-screen overflow-hidden bg-amber-bg font-sans antialiased">
      <button
        v-if="mobileSidebarOpen"
        class="fixed inset-y-0 left-sidebar right-0 z-30 hidden bg-black/45 max-[900px]:block"
        type="button"
        aria-label="关闭导航菜单"
        @click="closeMobileSidebar"
      />
      <Sidebar
        class="workbench-sidebar shrink-0 max-[900px]:fixed max-[900px]:inset-y-0 max-[900px]:left-0 max-[900px]:z-40 max-[900px]:shadow-2xl max-[900px]:transition-transform max-[900px]:duration-200"
        :class="{ 'mobile-sidebar-open': mobileSidebarOpen }"
      />
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header class="workbench-header" @open-orders="openOrders" @toggle-menu="toggleMobileSidebar" />
        <main class="flex-1 overflow-y-auto bg-amber-bg/20">
          <div class="workbench-main-shell mx-auto flex min-h-full max-w-[1400px] flex-col p-[21px_28px] max-[720px]:p-4">
            <div
              v-if="appStore.loading"
              class="mb-4 border border-amber-topbar-border bg-amber-content-bg px-4 py-3 text-[11px] font-sans text-amber-text-muted"
              role="status"
            >
              正在连接影约云后端...
            </div>
            <div
              v-if="appStore.apiError && !appStore.loading"
              class="mb-4 border border-[#B8543B]/25 bg-[#F8E7E2] px-4 py-3 text-[11px] font-sans text-[#B8543B]"
              role="alert"
            >
              {{ appStore.apiError }}
            </div>
            <div class="flex-1">
              <router-view v-slot="{ Component, route }">
                <div :key="route.fullPath" class="yy-route-view h-full">
                  <component :is="Component" />
                </div>
              </router-view>
            </div>
            
            <!-- Bottom Bar / Footer -->
            <footer class="workbench-footer mt-8 flex items-center justify-between border-t border-amber-topbar-border/30 pb-12 pt-8 font-mono text-[10px] uppercase tracking-widest text-amber-text-muted opacity-40 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
              <div>© 2026 影约云 · Studio Workbench</div>
              <div class="flex gap-6 max-[480px]:hidden">
                <span class="cursor-default">使用帮助</span>
                <span class="cursor-default">系统版本 v1.0</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>

  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '../shared/components/layout/Sidebar.vue'
import Header from '../shared/components/layout/Header.vue'
import { useWorkbenchIntroMotion } from '../shared/motion/workbenchIntro'
import { appStore } from '../shared/stores/appStore'

const router = useRouter()
const route = useRoute()
const workbenchRoot = ref<HTMLElement | null>(null)
const mobileSidebarOpen = ref(false)
const isPublicRoute = computed(() => route.meta.public === true)

useWorkbenchIntroMotion(workbenchRoot)

watch(
  isPublicRoute,
  publicRoute => {
    if (publicRoute || appStore.initialized || appStore.loading) return
    void appStore.bootstrap()
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    mobileSidebarOpen.value = false
  },
)

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const openOrders = () => {
  router.push({ path: '/orders', query: { focus: 'pending' } })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .workbench-sidebar {
    transform: translateX(-100%);
  }

  .workbench-sidebar.mobile-sidebar-open {
    transform: translateX(0);
  }
}
</style>
