<template>
  <main class="min-h-screen bg-[#F4EFE6] px-4 py-8 text-amber-dark">
    <section class="mx-auto max-w-[560px] border border-amber-topbar-border bg-white shadow-[0_24px_50px_rgba(26,24,20,0.08)]">
      <div class="border-b border-amber-topbar-border px-6 py-5">
        <div class="yy-eyebrow text-amber-text-muted">Micro Form</div>
        <h1 class="mt-2 text-[22px] font-semibold">{{ form?.formName || '微表单' }}</h1>
      </div>

      <NoticeBar :notice="notice" />

      <div v-if="loading" class="px-6 py-12 text-center text-[13px] text-amber-text-muted">加载中...</div>
      <div v-else-if="submitted" class="px-6 py-14 text-center">
        <div class="text-[18px] font-semibold text-amber-dark">提交成功</div>
        <p class="mt-3 text-[12px] leading-relaxed text-amber-text-muted">商户已收到你的信息，会根据表单内容继续跟进。</p>
      </div>
      <form v-else-if="form" class="grid gap-5 px-6 py-6" @submit.prevent="submit">
        <div v-if="submitContextSummary.length" class="border border-amber-topbar-border bg-[#FBF8F2] px-4 py-3 text-[12px] text-amber-text-muted">
          {{ submitContextSummary }}
        </div>

        <div v-for="field in visibleFields" :key="field.id" class="grid gap-2">
          <p v-if="field.type === 'label'" class="border border-amber-topbar-border bg-[#FBF8F2] px-3 py-3 text-[12px] leading-relaxed text-amber-text-muted">
            {{ field.label }}
          </p>
          <template v-else>
            <label class="text-[13px] font-medium text-amber-dark">
              <span v-if="isFieldRequired(field)" class="mr-1 text-[#F58235]">*</span>{{ field.label }}
            </label>

            <input
              v-if="field.type === 'text'"
              v-model.trim="answers[field.id]"
              class="yy-public-input"
              :placeholder="field.placeholder || '请输入'"
              type="text"
            />
            <input
              v-else-if="field.type === 'date'"
              v-model="answers[field.id]"
              class="yy-public-input"
              type="date"
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model.trim="answers[field.id]"
              class="yy-public-textarea"
              :placeholder="field.placeholder || '请输入'"
            />
            <select v-else-if="field.type === 'select'" v-model="answers[field.id]" class="yy-public-input">
              <option value="">{{ field.placeholder || '请选择' }}</option>
              <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
            </select>
            <div v-else-if="field.type === 'checkbox'" class="grid grid-cols-2 gap-2">
              <label v-for="option in field.options" :key="option" class="flex items-center gap-2 border border-amber-topbar-border bg-[#FBF8F2] px-3 py-2 text-[12px] text-amber-dark">
                <input :checked="checkboxValues(field.id).includes(option)" type="checkbox" @change="event => toggleCheckbox(field.id, option, event)" />
                {{ option }}
              </label>
            </div>
            <div v-else class="grid gap-2">
              <label v-for="option in field.options" :key="option" class="flex items-center gap-2 border border-amber-topbar-border bg-[#FBF8F2] px-3 py-2 text-[12px] text-amber-dark">
                <input v-model="answers[field.id]" :value="option" type="radio" />
                {{ option }}
              </label>
            </div>

            <label v-if="field.privacy?.enabled" class="mt-1 inline-flex items-start gap-2 text-[12px] text-amber-dark">
              <input v-model="privacyChecks[field.id]" class="mt-0.5" type="checkbox" />
              <span>{{ field.privacy.label || '我已阅读并同意隐私协议' }}</span>
            </label>
          </template>
        </div>

        <button class="yy-action mt-2 bg-[#F58235] px-4 py-3 text-[13px] font-semibold text-white" type="submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNotice } from '../../shared/composables/useNotice'
import NoticeBar from '../../shared/components/NoticeBar.vue'
import { backendApi, type MicroFormFieldSchema, type PublicMicroFormDto } from '../../shared/api/backend'

const route = useRoute()
const { notice, pushNotice } = useNotice()

const form = ref<PublicMicroFormDto | null>(null)
const loading = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const answers = reactive<Record<string, any>>({})
const privacyChecks = reactive<Record<string, boolean>>({})

const sourceContext = computed(() => ({
  sourceCode: readQueryString(route.query.sourceCode || route.query.source || route.query.utm_source),
  sourcePath: readQueryString(route.query.sourcePath || route.fullPath),
  storeId: readQueryString(route.query.storeId) || String(form.value?.storeId || ''),
  serviceGroupId: readQueryString(route.query.serviceGroupId),
  qrScene: readQueryString(route.query.qrScene || route.query.scene),
}))

const sortedFields = computed(() => [...(form.value?.schema.fields ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)))

const visibleFields = computed(() =>
  sortedFields.value.filter(field => field.type === 'label' || isFieldVisible(field)),
)

const submitContextSummary = computed(() => {
  const items = [
    sourceContext.value.sourceCode ? `来源 ${sourceContext.value.sourceCode}` : '',
    sourceContext.value.storeId ? `门店 ${sourceContext.value.storeId}` : '',
    sourceContext.value.serviceGroupId ? `服务组 ${sourceContext.value.serviceGroupId}` : '',
    sourceContext.value.qrScene ? `二维码 ${sourceContext.value.qrScene}` : '',
  ].filter(Boolean)
  return items.join(' · ')
})

const readQueryString = (value: unknown) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

const loadForm = async () => {
  loading.value = true
  try {
    const formId = String(route.params.id || route.query.formId || '')
    form.value = await backendApi.getPublicMicroForm(formId)
    for (const field of form.value.schema.fields) {
      answers[field.id] = field.type === 'checkbox' ? [] : ''
      privacyChecks[field.id] = false
      hydrateBindingDefault(field)
    }
  } catch (error) {
    pushNotice('error', error instanceof Error ? `表单加载失败：${error.message}` : '表单加载失败')
  } finally {
    loading.value = false
  }
}

const hydrateBindingDefault = (field: MicroFormFieldSchema) => {
  if (field.binding?.sourceParam) {
    const queryValue = readQueryString(route.query[field.binding.sourceParam])
    if (queryValue) answers[field.id] = queryValue
  }
  if (field.binding?.storeField && sourceContext.value.storeId) answers[field.id] = sourceContext.value.storeId
  if (field.binding?.serviceGroupField && sourceContext.value.serviceGroupId) answers[field.id] = sourceContext.value.serviceGroupId
}

const checkboxValues = (fieldId: string) => Array.isArray(answers[fieldId]) ? answers[fieldId] as string[] : []

const toggleCheckbox = (fieldId: string, option: string, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  const current = checkboxValues(fieldId)
  answers[fieldId] = checked ? [...current, option] : current.filter(item => item !== option)
}

const normalizeAnswer = (field: MicroFormFieldSchema) => {
  const value = answers[field.id]
  return Array.isArray(value) ? value.join(',') : String(value ?? '').trim()
}

const isFieldVisible = (field: MicroFormFieldSchema) => {
  const visibility = field.visibility
  if (!visibility?.fieldId) return true
  const dependentValue = normalizeDependentValue(answers[visibility.fieldId])
  if (visibility.equals && dependentValue !== visibility.equals) return false
  if (visibility.notEquals && dependentValue === visibility.notEquals) return false
  return true
}

const normalizeDependentValue = (value: unknown) => {
  if (Array.isArray(value)) return value.join(',')
  return String(value ?? '').trim()
}

const isFieldRequired = (field: MicroFormFieldSchema) => field.required === true || field.rules?.required === true

const isBlankAnswer = (field: MicroFormFieldSchema) => {
  const value = answers[field.id]
  if (field.type === 'label') return false
  if (Array.isArray(value)) return value.length === 0
  return !String(value ?? '').trim()
}

const validateField = (field: MicroFormFieldSchema) => {
  if (!isFieldVisible(field) || field.type === 'label') return ''
  const value = normalizeAnswer(field)
  const rules = field.rules || {}

  if (isFieldRequired(field) && isBlankAnswer(field)) {
    return `${field.label}不能为空`
  }
  if (rules.minLength && value.length < rules.minLength) {
    return rules.message || `${field.label}至少需要 ${rules.minLength} 个字符`
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.message || `${field.label}不能超过 ${rules.maxLength} 个字符`
  }
  if (rules.pattern?.trim()) {
    try {
      const reg = new RegExp(rules.pattern.trim())
      if (value && !reg.test(value)) return rules.message || `${field.label}格式不正确`
    } catch {
      return `${field.label}校验规则异常`
    }
  }
  if (field.privacy?.enabled && field.privacy.required !== false && !privacyChecks[field.id]) {
    return field.privacy.label || `请先勾选 ${field.label} 的隐私协议`
  }
  return ''
}

const validate = () => {
  for (const field of visibleFields.value) {
    const error = validateField(field)
    if (error) return error
  }
  return ''
}

const pickAnswerByLabel = (keyword: string) => {
  const field = visibleFields.value.find(item => item.label.includes(keyword))
  const value = field ? answers[field.id] : ''
  return Array.isArray(value) ? value.join(',') : String(value || '')
}

const buildSubmitAnswers = () => {
  const payload: Record<string, unknown> = {}
  for (const field of visibleFields.value) {
    payload[field.id] = answers[field.id]
    if (field.binding?.sourceParam) payload[`binding:${field.binding.sourceParam}`] = readQueryString(route.query[field.binding.sourceParam])
    if (field.binding?.storeField) payload[`binding:storeId:${field.id}`] = sourceContext.value.storeId
    if (field.binding?.serviceGroupField) payload[`binding:serviceGroupId:${field.id}`] = sourceContext.value.serviceGroupId
    if (field.privacy?.enabled) payload[`privacy:${field.id}`] = privacyChecks[field.id] === true
  }
  payload.__sourceCode = sourceContext.value.sourceCode
  payload.__sourcePath = sourceContext.value.sourcePath
  payload.__storeId = sourceContext.value.storeId
  payload.__serviceGroupId = sourceContext.value.serviceGroupId
  payload.__qrScene = sourceContext.value.qrScene
  return payload
}

const submit = async () => {
  const error = validate()
  if (error) {
    pushNotice('error', error)
    return
  }
  submitting.value = true
  try {
    const formId = String(route.params.id || route.query.formId || '')
    await backendApi.submitPublicMicroForm(formId, {
      customerName: String(answers.name || answers.customerName || pickAnswerByLabel('姓名') || ''),
      customerPhone: String(answers.phone || answers.mobile || pickAnswerByLabel('手机') || pickAnswerByLabel('电话') || ''),
      answers: buildSubmitAnswers(),
    })
    submitted.value = true
  } catch (submitError) {
    pushNotice('error', submitError instanceof Error ? `提交失败：${submitError.message}` : '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadForm)
</script>

<style scoped>
.yy-public-input {
  height: 42px;
  border: 1px solid rgb(213 201 181);
  background: #FBF8F2;
  padding: 0 12px;
  font-size: 14px;
  color: #2F261D;
  outline: none;
}

.yy-public-textarea {
  min-height: 96px;
  resize: vertical;
  border: 1px solid rgb(213 201 181);
  background: #FBF8F2;
  padding: 12px;
  font-size: 14px;
  color: #2F261D;
  outline: none;
}
</style>
