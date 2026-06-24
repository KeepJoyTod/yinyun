<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <div class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-text-muted">Micro Forms</div>
          <h2 class="mt-2 text-[22px] font-semibold leading-tight text-amber-dark">微表单管理</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="yy-action inline-flex items-center gap-2 border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark hover:bg-white" type="button" @click="copySelectedLink">
            <Copy :size="14" :stroke-width="1.8" />
            复制微信链接
          </button>
          <button class="yy-action inline-flex items-center gap-2 bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] hover:bg-black" type="button" @click="createForm">
            <Plus :size="14" :stroke-width="1.9" />
            新增表单
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
        <input
          v-model.trim="keyword"
          class="h-9 w-[210px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50"
          placeholder="请输入表单名称"
          type="search"
          @keydown.enter="loadForms"
        />
        <select v-model="status" class="h-9 w-[122px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50" @change="loadForms">
          <option value="">全部状态</option>
          <option value="PUBLISHED">已发布</option>
          <option value="DRAFT">草稿</option>
          <option value="OFFLINE">已下线</option>
        </select>
        <select v-model="storeFilter" class="h-9 w-[150px] border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/50" @change="loadForms">
          <option v-if="!concreteStoreOptions.length" value="">暂无可用门店</option>
          <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="String(store.backendId)">
            {{ store.name }}
          </option>
        </select>
        <button class="yy-action inline-flex items-center gap-2 bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="loadForms">
          <Search :size="14" :stroke-width="1.9" />
          搜索
        </button>
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted hover:bg-white" type="button" @click="resetFilters">
          重置
        </button>
        <span class="min-w-0 text-[12px] text-amber-text-muted">查看数据保留订单页深链，同时新增页内提交数据视图。</span>
      </div>

      <div v-if="notice" class="border-b border-amber-topbar-border px-5 py-3">
        <NoticeBanner :notice="notice" />
      </div>

      <div class="grid gap-5 p-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside class="min-w-0">
          <div class="mb-3 flex items-center gap-2 text-[12px] text-[#C65F2D]">
            <span class="shrink-0 font-semibold">微信链接</span>
            <input class="h-8 min-w-0 flex-1 border border-amber-topbar-border bg-white px-2 font-mono text-[11px] text-amber-dark outline-none" :value="selectedLink" readonly />
            <button class="yy-action inline-flex h-8 items-center gap-1 border border-amber-topbar-border px-2 text-[11px] text-amber-text-muted hover:bg-white" type="button" @click="copySelectedLink">
              <Copy :size="13" :stroke-width="1.8" />
              复制
            </button>
          </div>

          <div class="mb-4 rounded-[24px] border border-amber-topbar-border bg-white p-4">
            <div class="text-[14px] font-semibold text-amber-dark">吸粉二维码双态</div>
            <p class="mt-2 text-[12px] leading-6 text-amber-text-muted">
              当前默认生成可追踪来源的普通推广二维码；公众号真实场景码能力已预留接口和状态字段，待授权后可无缝切换。
            </p>
          </div>

          <div class="mx-auto w-[336px] max-w-full rounded-[34px] border-[6px] border-[#DFDFDF] bg-[#F5F5F5] p-4 shadow-[0_20px_45px_rgba(23,18,12,0.08)]">
            <div class="mx-auto mb-4 h-2 w-20 rounded-full bg-[#D7D7D7]" />
            <div class="overflow-hidden rounded-[24px] border border-[#E5E0D8] bg-white">
              <div class="flex h-10 items-center justify-between border-b border-[#EEE8DE] px-4 text-[11px] text-amber-dark">
                <span>9:41</span>
                <span class="font-semibold">100%</span>
              </div>
              <div class="h-[470px] overflow-hidden bg-[#F7F7F7]">
                <div class="sticky top-0 z-10 border-b border-[#E8E8E8] bg-white px-4 py-3 text-center text-[13px] font-semibold text-amber-dark">
                  {{ previewForm?.formName || '选择表单预览' }}
                </div>
                <div v-if="previewForm" class="h-[426px] overflow-y-auto">
                  <div v-for="field in previewFields" :key="field.id" class="border-b border-[#E9E9E9] bg-white px-4 py-4">
                    <p v-if="field.type === 'label'" class="text-[12px] leading-relaxed text-amber-text-muted">{{ field.label }}</p>
                    <template v-else>
                      <label class="block text-[12px] font-medium text-[#2A2926]">
                        <span v-if="field.required" class="mr-1 text-[#F58235]">*</span>{{ field.label }}
                      </label>
                      <div class="mt-3 text-[12px] text-amber-text-muted">{{ field.placeholder || '字段预览' }}</div>
                    </template>
                  </div>
                </div>
                <div v-else class="flex h-full items-center justify-center px-8 text-center text-[12px] leading-relaxed text-amber-text-muted">
                  暂无可预览表单
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div class="min-w-0">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1080px] border-collapse">
              <thead>
                <tr class="border-b border-amber-topbar-border bg-[#F4EFE6]/70 text-left text-[12px] text-amber-text-muted">
                  <th class="px-4 py-3 font-semibold">表单名称</th>
                  <th class="px-4 py-3 font-semibold">适用门店</th>
                  <th class="px-4 py-3 font-semibold">发布时间</th>
                  <th class="px-4 py-3 font-semibold">提交数量</th>
                  <th class="px-4 py-3 font-semibold">状态</th>
                  <th class="px-4 py-3 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-topbar-border/55">
                <tr v-for="form in filteredForms" :key="form.id" class="hover:bg-white/65" :class="form.id === selectedFormId ? 'bg-white/70' : ''">
                  <td class="px-4 py-4 text-[13px] text-amber-dark">
                    <button class="max-w-[260px] truncate text-left font-medium hover:text-[#C65F2D]" type="button" @click="preview(form)">
                      {{ form.formName }}
                    </button>
                    <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ form.linkKey || form.id }}</div>
                  </td>
                  <td class="px-4 py-4 text-[12px] text-amber-dark">
                    <div>{{ storeNameForForm(form) }}</div>
                    <div v-if="form.storeId" class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ form.storeId }}</div>
                  </td>
                  <td class="px-4 py-4 font-mono text-[12px] text-amber-text-muted">{{ form.publishedAt || '-' }}</td>
                  <td class="px-4 py-4 font-mono text-[12px] text-amber-dark">{{ form.submissionCount }} 条</td>
                  <td class="px-4 py-4">
                    <span class="inline-flex px-2 py-1 text-[11px]" :class="statusClass(form.status)">{{ statusLabel(form.status) }}</span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex flex-wrap items-center gap-2">
                      <button class="yy-action inline-flex items-center gap-1 border border-amber-topbar-border px-3 py-1.5 text-[11px] text-[#B8543B] hover:bg-white" type="button" @click="askDelete(form)">
                        <Trash2 :size="13" :stroke-width="1.9" />
                        删除
                      </button>
                      <button class="yy-action inline-flex items-center gap-1 border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="preview(form)">
                        <Eye :size="13" :stroke-width="1.9" />
                        预览
                      </button>
                      <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="openSubmissionDrawer(form)">
                        提交数据
                      </button>
                      <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="viewSubmissions(form)">
                        查看数据
                      </button>
                      <button class="yy-action inline-flex items-center gap-1 border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="exportForm(form)">
                        <Download :size="13" :stroke-width="1.9" />
                        导出
                      </button>
                      <button class="yy-action inline-flex items-center gap-1 bg-[#F58235] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="promotionForm = form">
                        <Share2 :size="13" :stroke-width="1.9" />
                        推广
                      </button>
                      <button class="yy-action inline-flex items-center gap-1 bg-[#F58235] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="editForm(form)">
                        <Pencil :size="13" :stroke-width="1.9" />
                        修改
                      </button>
                      <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark hover:bg-white" type="button" @click="togglePublish(form)">
                        {{ form.status === 'PUBLISHED' ? '下线' : '发布' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!filteredForms.length" class="border-t border-amber-topbar-border px-6 py-12 text-center">
            <div class="text-[14px] font-semibold text-amber-dark">{{ loading ? '加载中...' : '暂无微表单' }}</div>
            <p class="mt-2 text-[12px] text-amber-text-muted">点击"新增表单"创建第一个顾客收集表。</p>
          </div>

          <div class="flex items-center justify-end gap-4 border-t border-amber-topbar-border px-4 py-4 text-[12px] text-amber-text-muted">
            <span v-if="loading">加载中...</span>
            <span>共 {{ total }} 条</span>
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <MerchantMicroFormPromotionDialog
        :copied-key="copiedKey"
        :form="promotionForm"
        :link="promotionLink"
        @close="promotionForm = null"
        @copy="copyLink"
        @create-fan-qr="showNotice('info', '已预留微信场景码适配器与状态字段，当前先生成可追踪来源的普通推广二维码')"
        @download-error="showNotice('error', $event)"
      />

      <MerchantMicroFormSubmissionDrawer
        v-model:follow-draft-remark="submissionFollowForm.followRemark"
        v-model:follow-draft-status="submissionFollowForm.followStatus"
        v-model:follow-status="submissionFollowStatus"
        v-model:keyword="submissionKeyword"
        :form="submissionDrawerForm"
        :items="submissionItems"
        :loading="submissionLoading"
        :open="submissionDrawerOpen"
        :saving="submissionSaving"
        :selected-submission="selectedSubmission"
        @close="closeSubmissionDrawer"
        @load="loadSubmissions"
        @save="saveSubmissionFollow"
        @select="selectSubmission"
        @view-order-page="viewCurrentSubmissionForm"
      />

      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
        <div class="w-[360px] max-w-full bg-[#FBF8F2] p-6 shadow-2xl">
          <h3 class="text-[15px] font-semibold text-amber-dark">删除表单</h3>
          <p class="mt-3 text-[12px] leading-relaxed text-amber-text-muted">确认删除"{{ deleteTarget.formName }}"？已产生提交数据的表单建议先导出留档。</p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted hover:bg-white" type="button" @click="deleteTarget = null">取消</button>
            <button class="yy-action bg-[#B8543B] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#963726]" type="button" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Copy, Download, Eye, Pencil, Plus, Search, Share2, Trash2 } from 'lucide-vue-next'
import MerchantMicroFormPromotionDialog from './components/MerchantMicroFormPromotionDialog.vue'
import MerchantMicroFormSubmissionDrawer from './components/MerchantMicroFormSubmissionDrawer.vue'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { backendApi, type MicroFormDto, type MicroFormSubmissionDto } from '../../shared/api/backend'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { useNotice } from '../../shared/composables/useNotice'
import { appStore } from '../../shared/stores/appStore'
import {
  buildMicroFormLink,
  fillSubmissionFollowDraft,
  filterMicroForms,
  normalizeStoreFilter as normalizeStoreFilterOption,
  selectMicroFormId,
  selectSubmissionId,
  statusClass,
  statusLabel,
  storeNameForForm as storeNameForFormLabel,
} from './merchantMicroFormsOperations'

const router = useRouter()
const { copiedKey, copyText } = useCopyWithState()

const merchantMicroForms = ref<MicroFormDto[]>([])
const keyword = ref('')
const status = ref('')
const storeFilter = ref('')
const loading = ref(false)
const total = ref(0)
const selectedFormId = ref('')
const promotionForm = ref<MicroFormDto | null>(null)
const deleteTarget = ref<MicroFormDto | null>(null)
const { notice, pushNotice } = useNotice()

const submissionDrawerOpen = ref(false)
const submissionDrawerForm = ref<MicroFormDto | null>(null)
const submissionItems = ref<MicroFormSubmissionDto[]>([])
const submissionLoading = ref(false)
const submissionSaving = ref(false)
const submissionKeyword = ref('')
const submissionFollowStatus = ref('')
const selectedSubmissionId = ref('')
const submissionFollowForm = reactive({
  followStatus: 'PENDING',
  followRemark: '',
})

const publicBaseUrl = computed(() => {
  const configured = import.meta.env.VITE_PUBLIC_MICRO_FORM_BASE_URL
  return configured || 'https://weixin.yuyue123.cn/wx/?bid=sg9ix50p#/smallform/index'
})

const selectedForm = computed(() => merchantMicroForms.value.find(form => form.id === selectedFormId.value) ?? merchantMicroForms.value[0] ?? null)
const previewForm = computed(() => selectedForm.value)
const previewFields = computed(() => [...(previewForm.value?.schema.fields ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))
const filteredForms = computed(() => filterMicroForms(merchantMicroForms.value, storeFilter.value))
const selectedLink = computed(() => selectedForm.value ? formLink(selectedForm.value) : '')
const promotionLink = computed(() => promotionForm.value ? formLink(promotionForm.value) : '')
const selectedSubmission = computed(() => submissionItems.value.find(item => item.id === selectedSubmissionId.value) ?? null)
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const normalizeStoreFilter = (preferred = storeFilter.value) => normalizeStoreFilterOption(preferred, concreteStoreOptions.value)
const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const storeNameForForm = (form: MicroFormDto) => {
  return storeNameForFormLabel(form, appStore.stores)
}

const formLink = (form: MicroFormDto) => {
  return buildMicroFormLink(form, publicBaseUrl.value, storeFilter.value)
}

const showNotice = (type: 'info' | 'error', text: string) => {
  pushNotice(type === 'error' ? 'error' : 'success', text)
}

const loadForms = async () => {
  loading.value = true
  try {
    await ensureWorkbenchStores()
    storeFilter.value = normalizeStoreFilter()
    if (!storeFilter.value) {
      merchantMicroForms.value = []
      total.value = 0
      selectedFormId.value = ''
      return
    }
    const page = await backendApi.listMicroForms({
      formName: keyword.value || undefined,
      status: status.value || undefined,
      storeId: storeFilter.value || undefined,
      pageSize: 100,
    })
    merchantMicroForms.value = page.items
    total.value = page.total
    selectedFormId.value = selectMicroFormId(selectedFormId.value, page.items)
  } catch (error) {
    merchantMicroForms.value = []
    total.value = 0
    selectedFormId.value = ''
    showNotice('error', error instanceof Error ? `微表单加载失败：${error.message}` : '微表单加载失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  keyword.value = ''
  status.value = ''
  storeFilter.value = normalizeStoreFilter()
  void loadForms()
}

const createForm = () => {
  router.push('/merchant/micro-forms/new')
}

const editForm = (form: MicroFormDto) => {
  router.push(`/merchant/micro-forms/${form.id}/edit`)
}

const preview = (form: MicroFormDto) => {
  selectedFormId.value = form.id
}

const viewSubmissions = (form: MicroFormDto) => {
  router.push({ path: '/order/forms', query: { formId: form.id } })
}

const viewCurrentSubmissionForm = () => {
  if (submissionDrawerForm.value) viewSubmissions(submissionDrawerForm.value)
}

const copyLink = async (link: string, key: string) => {
  const ok = await copyText(link, key)
  showNotice(ok ? 'info' : 'error', ok ? '链接已复制' : '复制失败，请手动选择链接复制')
}

const copySelectedLink = () => {
  if (selectedLink.value) void copyLink(selectedLink.value, 'selected-link')
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const exportForm = async (form: MicroFormDto) => {
  try {
    const result = await backendApi.exportMicroFormSubmissions({ formId: form.id })
    downloadBlob(result.blob, result.fileName || `micro-form-${form.id}-submissions.xlsx`)
    showNotice('info', '表单提交数据导出已开始')
  } catch (error) {
    showNotice('error', error instanceof Error ? `导出失败：${error.message}` : '导出失败')
  }
}

const togglePublish = async (form: MicroFormDto) => {
  try {
    const updated = form.status === 'PUBLISHED'
      ? await backendApi.offlineMicroForm(form.id)
      : await backendApi.publishMicroForm(form.id)
    merchantMicroForms.value = merchantMicroForms.value.map(item => item.id === updated.id ? updated : item)
    selectedFormId.value = updated.id
    showNotice('info', form.status === 'PUBLISHED' ? '表单已下线' : '表单已发布')
  } catch (error) {
    showNotice('error', error instanceof Error ? `状态更新失败：${error.message}` : '状态更新失败')
  }
}

const askDelete = (form: MicroFormDto) => {
  deleteTarget.value = form
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    await backendApi.deleteMicroForm(deleteTarget.value.id)
    merchantMicroForms.value = merchantMicroForms.value.filter(form => form.id !== deleteTarget.value?.id)
    total.value = Math.max(0, total.value - 1)
    selectedFormId.value = merchantMicroForms.value[0]?.id ?? ''
    showNotice('info', '表单已删除')
  } catch (error) {
    showNotice('error', error instanceof Error ? `删除失败：${error.message}` : '删除失败')
  } finally {
    deleteTarget.value = null
  }
}

const loadSubmissions = async () => {
  if (!submissionDrawerForm.value) return
  submissionLoading.value = true
  try {
    const page = await backendApi.listMicroFormSubmissions({
      formId: submissionDrawerForm.value.id,
      customerName: submissionKeyword.value || undefined,
      customerPhone: submissionKeyword.value || undefined,
      followStatus: submissionFollowStatus.value || undefined,
      pageSize: 100,
    })
    submissionItems.value = page.items
    const nextId = selectSubmissionId(selectedSubmissionId.value, page.items)
    if (nextId) selectSubmission(nextId)
    else selectedSubmissionId.value = ''
  } catch (error) {
    submissionItems.value = []
    selectedSubmissionId.value = ''
    showNotice('error', error instanceof Error ? `提交数据加载失败：${error.message}` : '提交数据加载失败')
  } finally {
    submissionLoading.value = false
  }
}

const selectSubmission = (id: string) => {
  selectedSubmissionId.value = id
  const target = submissionItems.value.find(item => item.id === id)
  fillSubmissionFollowDraft(submissionFollowForm, target)
}

const openSubmissionDrawer = async (form: MicroFormDto) => {
  submissionDrawerForm.value = form
  submissionDrawerOpen.value = true
  submissionKeyword.value = ''
  submissionFollowStatus.value = ''
  await loadSubmissions()
}

const closeSubmissionDrawer = () => {
  submissionDrawerOpen.value = false
  submissionDrawerForm.value = null
  submissionItems.value = []
  selectedSubmissionId.value = ''
}

const saveSubmissionFollow = async () => {
  if (!selectedSubmission.value) return
  submissionSaving.value = true
  try {
    await backendApi.updateMicroFormSubmissionFollow({
      id: selectedSubmission.value.id,
      followStatus: submissionFollowForm.followStatus,
      followRemark: submissionFollowForm.followRemark,
      orderId: selectedSubmission.value.orderId ?? null,
    })
    await loadSubmissions()
    showNotice('info', '跟进状态已保存')
  } catch (error) {
    showNotice('error', error instanceof Error ? `跟进保存失败：${error.message}` : '跟进保存失败')
  } finally {
    submissionSaving.value = false
  }
}

onMounted(loadForms)
</script>
