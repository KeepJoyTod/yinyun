<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
    <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-4">
      <div>
        <h3 class="text-[14px] font-semibold text-amber-dark">券模板</h3>
        <p class="mt-1 text-[10.5px] text-amber-text-muted">真实读取 yy_coupon_template，创建、编辑和启停都走后端接口。</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('refresh')">刷新</button>
        <button class="yy-action border border-amber-dark bg-amber-dark px-3 py-1.5 text-[10.5px] text-[#F4EFE6] hover:bg-black" type="button" @click="$emit('create')">新建券</button>
      </div>
    </div>

    <div v-if="loading" class="px-5 py-8 text-[11px] text-amber-text-muted">正在加载券模板...</div>
    <div v-else-if="!templates.length" class="px-5 py-8 text-[11px] text-amber-text-muted">暂无券模板，点击新建券开始配置。</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[920px] border-collapse">
        <thead>
          <tr class="border-b border-amber-topbar-border bg-[#FBF8F2] text-left">
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">模板</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">范围</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">金额</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">发放/核销</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">状态</th>
            <th class="px-5 py-3 text-[11px] text-amber-text-muted">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-topbar-border/60">
          <tr
            v-for="template in templates"
            :key="template.templateId"
            class="cursor-pointer hover:bg-black/[0.015]"
            :class="selectedId === template.templateId ? 'bg-[#FBF8F2]' : ''"
            @click="$emit('select', template.templateId)"
          >
            <td class="px-5 py-4">
              <div class="text-[11px] font-semibold text-amber-dark">{{ template.templateName }}</div>
              <div class="mt-1 font-mono text-[10px] text-amber-text-muted">{{ template.templateType }} / {{ template.stackPolicy }}</div>
            </td>
            <td class="px-5 py-4">
              <div class="text-[10.5px] text-amber-dark">{{ template.storeScopeLabel }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ template.productScopeLabel }}</div>
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              <div>面额 {{ formatMarketingMoney(template.faceValueCent) }}</div>
              <div class="mt-1">门槛 {{ formatMarketingMoney(template.minSpendCent) }}</div>
            </td>
            <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">
              {{ template.issuedCount }} / {{ template.writeoffCount }}
            </td>
            <td class="px-5 py-4">
              <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-dark">{{ template.status }}</span>
            </td>
            <td class="px-5 py-4">
              <div class="flex flex-wrap gap-2">
                <button class="yy-action border border-amber-topbar-border px-2.5 py-1 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click.stop="$emit('issue', template.templateId)">发券</button>
                <button class="yy-action border border-amber-topbar-border px-2.5 py-1 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click.stop="$emit('edit', template.templateId)">编辑</button>
                <button class="yy-action border border-amber-topbar-border px-2.5 py-1 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click.stop="$emit('toggle', template.templateId)">
                  {{ template.status === 'ACTIVE' ? '停用' : '启用' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MarketingCouponTemplateDto } from '../../../shared/api/backend'
import { formatMarketingMoney } from '../marketingScaffoldData'

defineProps<{
  templates: MarketingCouponTemplateDto[]
  selectedId: string
  loading?: boolean
}>()

defineEmits<{
  create: []
  edit: [templateId: string]
  issue: [templateId: string]
  refresh: []
  select: [templateId: string]
  toggle: [templateId: string]
}>()
</script>
