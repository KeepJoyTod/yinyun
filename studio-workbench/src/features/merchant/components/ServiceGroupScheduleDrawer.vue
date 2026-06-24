<template>
  <Transition name="fade">
    <div
      v-if="target"
      class="fixed inset-0 z-50 flex justify-end bg-[#1A1814]/35 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <aside class="flex h-full w-full max-w-[960px] flex-col overflow-hidden border-l border-amber-topbar-border bg-[#FBF8F2]">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-6 py-5">
          <div class="min-w-0">
            <div class="font-mono text-[11px] uppercase tracking-[0.28em] text-amber-text-muted">Schedule Rules</div>
            <h3 class="mt-2 font-serif text-[21px] leading-none text-amber-dark">档期配置</h3>
            <p class="mt-2 text-[12px] text-amber-text-muted">
              当前服务组：{{ target.name }} / {{ target.storeName }}
            </p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emit('close')">
            关闭
          </button>
        </div>

        <div class="grid flex-1 gap-5 overflow-y-auto px-6 py-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
          <section class="grid gap-5">
            <div class="flex flex-wrap items-center justify-between gap-3 border border-amber-topbar-border bg-white px-4 py-4">
              <div>
                <div class="text-[14px] font-semibold text-amber-dark">档期规则</div>
                <p class="mt-1 text-[12px] text-amber-text-muted">直接复用 `/yy/scheduleRule`，支持按星期、时间段、容量维护。</p>
              </div>
              <button class="yy-action bg-amber-dark px-3 py-2 text-[12px] font-semibold text-[#F4EFE6]" type="button" @click="emit('create-rule')">
                新增档期
              </button>
            </div>

            <div v-if="scheduleLoading" class="border border-amber-topbar-border bg-white px-4 py-12 text-center text-[12px] text-amber-text-muted">档期规则加载中...</div>
            <div v-else class="grid gap-3">
              <article v-for="rule in rules" :key="rule.id" class="border border-amber-topbar-border bg-white p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="text-[13px] font-semibold text-amber-dark">{{ weekdayLabel(rule.weekday) }} {{ rule.startTime }} - {{ rule.endTime }}</div>
                    <div class="mt-1 text-[12px] text-amber-text-muted">
                      容量 {{ rule.capacity || target.capacity }} / 状态 {{ rule.enabled === 'Y' ? '启用' : '停用' }}
                    </div>
                    <div v-if="rule.remark" class="mt-2 text-[12px] text-amber-text-muted">{{ rule.remark }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark" type="button" @click="emit('edit-rule', rule)">
                      编辑
                    </button>
                    <button class="yy-action border border-[#DAB8AE] px-3 py-1.5 text-[11px] text-[#8C3E2C]" type="button" @click="emit('remove-rule', rule.id)">
                      删除
                    </button>
                  </div>
                </div>
              </article>
              <div v-if="!rules.length" class="border border-dashed border-amber-topbar-border bg-white px-4 py-10 text-center text-[12px] text-amber-text-muted">
                当前服务组还没有档期规则，先新增一条工作日或周末规则。
              </div>
            </div>

            <div class="border border-amber-topbar-border bg-white">
              <div class="flex items-center justify-between border-b border-amber-topbar-border px-4 py-3">
                <div>
                  <div class="text-[14px] font-semibold text-amber-dark">库存概览</div>
                  <p class="mt-1 text-[12px] text-amber-text-muted">复用 `/yy/bookingSlotInventory/list` 计算 7 / 30 天概览与冲突预检。</p>
                </div>
                <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[11px] text-amber-dark" type="button" @click="emit('go-inventory')">
                  前往库存页
                </button>
              </div>
              <div class="grid gap-3 px-4 py-4 md:grid-cols-3">
                <article v-for="card in inventorySummaryCards" :key="card.label" class="border border-amber-topbar-border bg-[#FBF8F2] px-4 py-4">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-amber-text-muted">{{ card.label }}</div>
                  <div class="mt-2 text-[24px] font-semibold text-amber-dark">{{ card.value }}</div>
                  <div class="mt-1 text-[12px] text-amber-text-muted">{{ card.hint }}</div>
                </article>
              </div>
              <div class="grid gap-3 border-t border-amber-topbar-border px-4 py-4">
                <div class="flex items-center justify-between">
                  <div class="text-[13px] font-semibold text-amber-dark">冲突预检</div>
                  <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[11px] text-amber-dark" type="button" @click="emit('reload-inventory')">
                    重新计算
                  </button>
                </div>
                <div v-if="inventoryLoading" class="text-[12px] text-amber-text-muted">库存概览计算中...</div>
                <div v-else-if="inventoryConflicts.length" class="grid gap-2">
                  <div v-for="slot in inventoryConflicts.slice(0, 6)" :key="slot.id" class="border border-[#E6CFC6] bg-[#FFF5EF] px-3 py-3 text-[12px] text-[#8C3E2C]">
                    {{ slot.bizDate }} {{ slot.startTime }} - {{ slot.endTime }}，冲突 {{ slot.conflictCount }}，容量 {{ slot.capacity }}
                  </div>
                </div>
                <div v-else class="text-[12px] text-amber-text-muted">近 30 天未发现冲突档期。</div>
              </div>
            </div>
          </section>

          <section class="grid gap-5">
            <div class="border border-amber-topbar-border bg-white">
              <div class="border-b border-amber-topbar-border px-4 py-3">
                <div class="text-[14px] font-semibold text-amber-dark">{{ form.id ? '编辑档期规则' : '新增档期规则' }}</div>
              </div>
              <div class="grid gap-4 px-4 py-4">
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  星期
                  <select v-model.number="form.weekday" class="yy-input">
                    <option v-for="item in weekdayOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="grid gap-2 text-[12px] text-amber-text-muted">
                    开始时间
                    <input v-model="form.startTime" class="yy-input" type="time" />
                  </label>
                  <label class="grid gap-2 text-[12px] text-amber-text-muted">
                    结束时间
                    <input v-model="form.endTime" class="yy-input" type="time" />
                  </label>
                </div>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  容量
                  <input v-model.number="form.capacity" class="yy-input" min="0" type="number" />
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  状态
                  <select v-model="form.enabled" class="yy-input">
                    <option value="Y">启用</option>
                    <option value="N">停用</option>
                  </select>
                </label>
                <label class="grid gap-2 text-[12px] text-amber-text-muted">
                  备注
                  <textarea v-model="form.remark" class="yy-textarea" />
                </label>
                <div class="flex items-center justify-end gap-2">
                  <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="emit('reset-rule')">
                    重置
                  </button>
                  <button class="yy-action bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6]" :disabled="scheduleSaving" type="button" @click="emit('save-rule')">
                    {{ scheduleSaving ? '保存中...' : '保存档期' }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { BookingInventoryDto, ScheduleRuleDto } from '../../../shared/api/backend'
import type { ServiceGroupInfo } from '../../../shared/stores/appStore'
import type { InventorySummaryCard, ScheduleRuleFormDraft, WeekdayOption } from '../serviceGroupOperations'

defineProps<{
  target: ServiceGroupInfo | null
  rules: ScheduleRuleDto[]
  form: ScheduleRuleFormDraft
  weekdayOptions: WeekdayOption[]
  inventorySummaryCards: InventorySummaryCard[]
  inventoryConflicts: BookingInventoryDto[]
  scheduleLoading: boolean
  scheduleSaving: boolean
  inventoryLoading: boolean
  weekdayLabel: (weekday: number) => string
}>()

const emit = defineEmits<{
  close: []
  'create-rule': []
  'edit-rule': [rule: ScheduleRuleDto]
  'remove-rule': [id: string]
  'reload-inventory': []
  'go-inventory': []
  'reset-rule': []
  'save-rule': []
}>()
</script>
