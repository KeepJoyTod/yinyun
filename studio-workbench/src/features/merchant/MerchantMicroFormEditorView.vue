<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-5">
        <div>
          <div class="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-text-muted">表单搭建</div>
          <h2 class="mt-2 text-[22px] font-semibold leading-none text-amber-dark">{{ isEditing ? '修改表单' : '新增表单' }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <button class="yy-action inline-flex items-center gap-2 border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="goBack">
            <ArrowLeft :size="14" :stroke-width="1.9" />
            返回
          </button>
          <button class="yy-action inline-flex items-center gap-2 bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white" type="button" :disabled="saving" @click="saveForm">
            <Save :size="14" :stroke-width="1.9" />
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <div v-if="notice" class="border-b border-amber-topbar-border px-5 py-3">
        <NoticeBanner :notice="notice" />
      </div>

      <div class="grid gap-5 p-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="border border-amber-topbar-border bg-white p-4">
          <h3 class="text-[14px] font-semibold text-amber-dark">字段组件库</h3>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button v-for="control in controls" :key="control.type" class="yy-action border border-amber-topbar-border bg-[#FBF8F2] px-3 py-3 text-[12px] text-amber-dark hover:bg-[#F4EFE6]" type="button" @click="addField(control.type)">
              <component :is="control.icon" :size="18" :stroke-width="1.7" class="mx-auto mb-2 text-amber-text-muted" />
              {{ control.label }}
            </button>
          </div>

          <div class="mt-5 border border-amber-topbar-border bg-[#FBF8F2] p-3 text-[11px] leading-6 text-amber-text-muted">
            本次已实施：规则校验、条件显隐、来源参数绑定、门店/服务组绑定、隐私协议文案与勾选。
          </div>
        </aside>

        <div class="grid gap-5">
          <section class="grid gap-4 border border-amber-topbar-border bg-white p-5">
            <div class="grid grid-cols-[minmax(0,1fr)_160px] gap-4 max-[780px]:grid-cols-1">
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                表单名称 *
                <input v-model.trim="draft.formName" class="yy-input" maxlength="120" placeholder="请输入表单名称" type="text" />
              </label>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                状态
                <select v-model="draft.status" class="yy-input">
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">已发布</option>
                  <option value="OFFLINE">已下线</option>
                </select>
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                适用门店
                <select v-model="draft.storeId" class="yy-input">
                  <option v-if="canUseGlobalStoreScope" :value="null">全部门店 / 不绑定</option>
                  <option v-if="!concreteStoreOptions.length" :value="null">暂无可用门店</option>
                  <option v-for="store in concreteStoreOptions" :key="store.backendId" :value="store.backendId">
                    {{ store.name }}
                  </option>
                </select>
              </label>
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                通知人员
                <input v-model.trim="draft.notifyUsers" class="yy-input" maxlength="500" placeholder="例如：门店客服、店长" type="text" />
              </label>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <label class="grid gap-2 text-[12px] text-amber-text-muted">
                备注
                <input v-model.trim="draft.remark" class="yy-input" maxlength="500" placeholder="内部备注，可不填" type="text" />
              </label>
            </div>
          </section>

          <section class="border border-amber-topbar-border bg-white">
            <div class="flex items-center justify-between gap-3 border-b border-amber-topbar-border px-5 py-4">
              <div>
                <h3 class="text-[14px] font-semibold text-amber-dark">表单字段</h3>
                <p class="mt-1 text-[11px] text-amber-text-muted">当前 {{ draft.schema.fields.length }} 个字段</p>
              </div>
              <button class="yy-action inline-flex items-center gap-2 border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="addField('text')">
                <Plus :size="14" />
                添加文本框
              </button>
            </div>

            <div class="grid gap-3 p-5">
              <article v-for="(field, index) in draft.schema.fields" :key="field.id" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-text-muted">{{ fieldTypeLabel(field.type) }}</div>
                    <div class="mt-1 truncate text-[13px] font-semibold text-amber-dark">{{ field.label || '未命名字段' }}</div>
                  </div>
                  <div class="flex items-center gap-1">
                    <button class="yy-icon-button" type="button" :disabled="index === 0" title="上移" @click="moveField(index, -1)">
                      <ArrowUp :size="14" />
                    </button>
                    <button class="yy-icon-button" type="button" :disabled="index === draft.schema.fields.length - 1" title="下移" @click="moveField(index, 1)">
                      <ArrowDown :size="14" />
                    </button>
                    <button class="yy-icon-button text-[#8C3E2C]" type="button" title="删除" @click="removeField(index)">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>

                <div class="mt-4 grid grid-cols-2 gap-3 max-[780px]:grid-cols-1">
                  <label class="grid gap-2 text-[12px] text-amber-text-muted">
                    {{ field.type === 'label' ? '标签文案 *' : '标题 *' }}
                    <input v-model.trim="field.label" class="yy-input" maxlength="80" type="text" />
                  </label>
                  <label class="grid gap-2 text-[12px] text-amber-text-muted">
                    占位符
                    <input v-model.trim="field.placeholder" class="yy-input" maxlength="120" type="text" :disabled="field.type === 'label'" />
                  </label>
                </div>

                <label v-if="field.type !== 'label'" class="mt-3 inline-flex items-center gap-2 text-[12px] text-amber-dark">
                  <input v-model="field.required" type="checkbox" />
                  必填
                </label>

                <label v-if="needsOptions(field.type)" class="mt-3 grid gap-2 text-[12px] text-amber-text-muted">
                  选项，每行一个
                  <textarea class="yy-textarea" :value="(field.options || []).join('\n')" @input="event => updateOptions(field, event)" />
                </label>

                <div v-if="field.type !== 'label'" class="mt-4 grid gap-4 border-t border-amber-topbar-border pt-4">
                  <div class="grid gap-3 md:grid-cols-2">
                    <label class="grid gap-2 text-[12px] text-amber-text-muted">
                      最小长度
                      <input v-model.number="fieldRules(field).minLength" class="yy-input" min="0" type="number" />
                    </label>
                    <label class="grid gap-2 text-[12px] text-amber-text-muted">
                      最大长度
                      <input v-model.number="fieldRules(field).maxLength" class="yy-input" min="0" type="number" />
                    </label>
                  </div>

                  <div class="grid gap-3 md:grid-cols-2">
                    <label class="grid gap-2 text-[12px] text-amber-text-muted">
                      正则校验
                      <input v-model.trim="fieldRules(field).pattern" class="yy-input" placeholder="例如：^1\\d{10}$" type="text" />
                    </label>
                    <label class="grid gap-2 text-[12px] text-amber-text-muted">
                      自定义错误提示
                      <input v-model.trim="fieldRules(field).message" class="yy-input" placeholder="例如：请输入正确手机号" type="text" />
                    </label>
                  </div>

                  <label class="inline-flex items-center gap-2 text-[12px] text-amber-dark">
                    <input v-model="fieldRules(field).unique" type="checkbox" />
                    唯一性提示（首版仅前端标记与提交说明）
                  </label>

                  <div class="grid gap-3 border border-amber-topbar-border bg-white p-3">
                    <div class="text-[12px] font-medium text-amber-dark">条件显隐</div>
                    <div class="grid gap-3 md:grid-cols-3">
                      <label class="grid gap-2 text-[12px] text-amber-text-muted">
                        依赖字段
                        <select v-model="fieldVisibility(field).fieldId" class="yy-input">
                          <option value="">不启用</option>
                          <option v-for="candidate in visibilityCandidates(field.id)" :key="candidate.id" :value="candidate.id">
                            {{ candidate.label || candidate.id }}
                          </option>
                        </select>
                      </label>
                      <label class="grid gap-2 text-[12px] text-amber-text-muted">
                        等于
                        <input v-model.trim="fieldVisibility(field).equals" class="yy-input" type="text" />
                      </label>
                      <label class="grid gap-2 text-[12px] text-amber-text-muted">
                        不等于
                        <input v-model.trim="fieldVisibility(field).notEquals" class="yy-input" type="text" />
                      </label>
                    </div>
                  </div>

                  <div class="grid gap-3 border border-amber-topbar-border bg-white p-3">
                    <div class="text-[12px] font-medium text-amber-dark">来源与业务绑定</div>
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="grid gap-2 text-[12px] text-amber-text-muted">
                        来源参数名
                        <input v-model.trim="fieldBinding(field).sourceParam" class="yy-input" placeholder="例如：sourceCode / utm_campaign" type="text" />
                      </label>
                      <div class="grid gap-2 text-[12px] text-amber-text-muted">
                        <span>业务绑定</span>
                        <label class="inline-flex items-center gap-2 text-amber-dark">
                          <input v-model="fieldBinding(field).storeField" type="checkbox" />
                          绑定门店
                        </label>
                        <label class="inline-flex items-center gap-2 text-amber-dark">
                          <input v-model="fieldBinding(field).serviceGroupField" type="checkbox" />
                          绑定服务组
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="grid gap-3 border border-amber-topbar-border bg-white p-3">
                    <div class="text-[12px] font-medium text-amber-dark">隐私协议</div>
                    <label class="inline-flex items-center gap-2 text-[12px] text-amber-dark">
                      <input v-model="fieldPrivacy(field).enabled" type="checkbox" />
                      启用隐私协议勾选
                    </label>
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="grid gap-2 text-[12px] text-amber-text-muted">
                        协议文案
                        <input v-model.trim="fieldPrivacy(field).label" class="yy-input" placeholder="我已阅读并同意隐私协议" type="text" />
                      </label>
                      <label class="inline-flex items-center gap-2 self-end text-[12px] text-amber-dark">
                        <input v-model="fieldPrivacy(field).required" type="checkbox" />
                        提交前必须勾选
                      </label>
                    </div>
                  </div>
                </div>
              </article>

              <div v-if="!draft.schema.fields.length" class="border border-dashed border-amber-topbar-border px-6 py-12 text-center text-[12px] text-amber-text-muted">
                从左侧组件库添加第一个字段
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlignLeft,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  CheckSquare,
  CircleDot,
  ListFilter,
  Plus,
  Save,
  TextCursorInput,
  Trash2,
  Type,
} from 'lucide-vue-next'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import NoticeBanner from '../../shared/components/feedback/NoticeBanner.vue'
import { useNotice } from '../../shared/composables/useNotice'
import { appStore } from '../../shared/stores/appStore'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import {
  backendApi,
  defaultMicroFormSchema,
  type MicroFormDto,
  type MicroFormFieldSchema,
  type MicroFormFieldType,
  type MicroFormPayload,
} from '../../shared/api/backend'
import {
  cloneMicroFormSchema,
  createMicroFormFieldId,
  ensureFieldExtensions,
  needsOptions,
  normalizeField,
  validateMicroFormDraft,
} from './merchantMicroFormEditorOperations'

const route = useRoute()
const router = useRouter()

const controls: Array<{ type: MicroFormFieldType; label: string; icon: object }> = [
  { type: 'text', label: '文本框', icon: TextCursorInput },
  { type: 'select', label: '下拉框', icon: ListFilter },
  { type: 'checkbox', label: '多选框', icon: CheckSquare },
  { type: 'radio', label: '单选框', icon: CircleDot },
  { type: 'textarea', label: '多行文本', icon: AlignLeft },
  { type: 'label', label: '文本标签', icon: Type },
  { type: 'date', label: '日期', icon: CalendarDays },
]

const draft = reactive<MicroFormPayload>({
  formName: '',
  status: 'DRAFT',
  schema: defaultMicroFormSchema(),
  notifyUsers: '',
  remark: '',
})
const saving = ref(false)
const { notice, pushNotice } = useNotice()

const formId = computed(() => String(route.params.id || ''))
const isEditing = computed(() => Boolean(formId.value && formId.value !== 'new'))
const canUseGlobalStoreScope = computed(() => studioAccessStore.globalStoreScope)
const concreteStoreOptions = computed(() => appStore.stores.filter(store => Boolean(store.backendId)))

const showNotice = (type: 'info' | 'error', text: string) => {
  pushNotice(type === 'error' ? 'error' : 'success', text)
}

const ensureWorkbenchStores = async () => {
  while (appStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  if (!appStore.initialized && !appStore.loading) {
    await appStore.bootstrap()
  }
}

const normalizeDraftStoreId = (preferred = draft.storeId) => {
  if (canUseGlobalStoreScope.value && (preferred == null || preferred === '')) return null
  const matched = concreteStoreOptions.value.find(store => String(store.backendId) === String(preferred))
  if (canUseGlobalStoreScope.value && preferred) return matched?.backendId ?? String(preferred)
  return matched?.backendId ?? concreteStoreOptions.value[0]?.backendId ?? null
}

const enforceDraftStoreScope = () => {
  if (!canUseGlobalStoreScope.value && !draft.storeId) {
    draft.storeId = normalizeDraftStoreId()
    return
  }
  if (!canUseGlobalStoreScope.value) {
    draft.storeId = normalizeDraftStoreId()
  }
}

const mergeForm = (form: MicroFormDto) => {
  draft.id = form.id
  draft.storeId = form.storeId
  draft.formName = form.formName
  draft.status = form.status || 'DRAFT'
  draft.schema = cloneMicroFormSchema(form.schema)
  draft.schema.fields.forEach(ensureFieldExtensions)
  draft.notifyUsers = form.notifyUsers
  draft.linkKey = form.linkKey
  draft.remark = form.remark
}

const loadForm = async () => {
  await ensureWorkbenchStores()
  if (!isEditing.value) {
    enforceDraftStoreScope()
    return
  }
  try {
    mergeForm(await backendApi.getMicroForm(formId.value))
    enforceDraftStoreScope()
  } catch (error) {
    showNotice('error', error instanceof Error ? `表单加载失败：${error.message}` : '表单加载失败')
  }
}

const fieldTypeLabel = (type: MicroFormFieldType) => controls.find(control => control.type === type)?.label ?? type

const addField = (type: MicroFormFieldType) => {
  const label = fieldTypeLabel(type)
  const field: MicroFormFieldSchema = ensureFieldExtensions({
    id: createMicroFormFieldId(type),
    label: type === 'label' ? '说明文字' : label,
    type,
    required: false,
    placeholder: type === 'select' || type === 'date' ? '请选择' : type === 'label' ? '' : '请输入',
    sort: draft.schema.fields.length + 1,
  })
  if (needsOptions(type)) field.options = ['选项一', '选项二', '选项三']
  draft.schema.fields.push(field)
}

const moveField = (index: number, direction: number) => {
  const target = index + direction
  if (target < 0 || target >= draft.schema.fields.length) return
  const [field] = draft.schema.fields.splice(index, 1)
  draft.schema.fields.splice(target, 0, field)
}

const removeField = (index: number) => {
  draft.schema.fields.splice(index, 1)
}

const updateOptions = (field: MicroFormFieldSchema, event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  field.options = value.split('\n').map(item => item.trim()).filter(Boolean)
}

const fieldRules = (field: MicroFormFieldSchema) => ensureFieldExtensions(field).rules!
const fieldVisibility = (field: MicroFormFieldSchema) => ensureFieldExtensions(field).visibility!
const fieldBinding = (field: MicroFormFieldSchema) => ensureFieldExtensions(field).binding!
const fieldPrivacy = (field: MicroFormFieldSchema) => ensureFieldExtensions(field).privacy!

const visibilityCandidates = (fieldId: string) => draft.schema.fields.filter(field => field.id !== fieldId && field.type !== 'label')

const buildPayload = (): MicroFormPayload => ({
  ...draft,
  storeId: normalizeDraftStoreId(),
  schema: {
    schemaVersion: 2,
    fields: draft.schema.fields.map((field, index) => normalizeField(field, index)),
  },
})

const saveForm = async () => {
  await ensureWorkbenchStores()
  enforceDraftStoreScope()
  const error = validateMicroFormDraft(draft, canUseGlobalStoreScope.value, normalizeDraftStoreId)
  if (error) {
    showNotice('error', error)
    return
  }
  saving.value = true
  try {
    if (isEditing.value) {
      await backendApi.updateMicroForm(buildPayload())
    } else {
      await backendApi.createMicroForm(buildPayload())
    }
    showNotice('info', '表单已保存')
    await router.push('/merchant/micro-forms')
  } catch (saveError) {
    showNotice('error', saveError instanceof Error ? `保存失败：${saveError.message}` : '保存失败')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/merchant/micro-forms')
}

onMounted(loadForm)
</script>
