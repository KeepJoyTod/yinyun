<template>
  <div class="h-[300px] w-full rounded-md border border-amber-topbar-border/60 bg-[#FBF8F2] p-4">
    <div class="mb-3 flex items-center justify-between text-xs text-amber-muted">
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center gap-1.5">
          <i class="h-2 w-5 rounded-full bg-[#B8543B]" />
          预约
        </span>
        <span class="inline-flex items-center gap-1.5">
          <i class="h-2 w-5 rounded-full bg-[#1A1814]" />
          到店
        </span>
      </div>
      <span v-if="hasRows" class="font-mono tabular-nums">峰值 {{ maxValue }}</span>
    </div>

    <div v-if="hasRows" class="h-[236px] w-full">
      <svg
        class="h-full w-full"
        viewBox="0 0 640 260"
        role="img"
        aria-label="预约趋势图"
        preserveAspectRatio="none"
      >
        <line
          v-for="line in gridLines"
          :key="line.key"
          x1="36"
          x2="622"
          :y1="line.y"
          :y2="line.y"
          class="trend-grid"
        />
        <text
          v-for="line in gridLines"
          :key="`${line.key}-label`"
          x="4"
          :y="line.y + 4"
          class="trend-axis"
        >
          {{ line.value }}
        </text>

        <text
          v-for="label in xLabels"
          :key="label.key"
          :x="label.x"
          y="248"
          text-anchor="middle"
          class="trend-axis trend-axis-x"
        >
          {{ label.label }}
        </text>

        <polyline
          :points="bookedPoints"
          fill="none"
          stroke="#B8543B"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polyline
          :points="arrivedPoints"
          fill="none"
          stroke="#1A1814"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          v-for="point in bookedDotPoints"
          :key="`booked-${point.key}`"
          :cx="point.x"
          :cy="point.y"
          r="3.5"
          fill="#B8543B"
        >
          <title>{{ point.label }} 预约 {{ point.value }}</title>
        </circle>
        <circle
          v-for="point in arrivedDotPoints"
          :key="`arrived-${point.key}`"
          :cx="point.x"
          :cy="point.y"
          r="3.5"
          fill="#1A1814"
        >
          <title>{{ point.label }} 到店 {{ point.value }}</title>
        </circle>
      </svg>
    </div>

    <div v-else class="flex h-[236px] items-center justify-center rounded-md border border-dashed border-amber-topbar-border/70 bg-white/60">
      <span class="text-sm text-amber-muted">暂无趋势数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TrendRow = {
  day: string
  bookedCount: number
  arrivedCount: number
}

type TrendPoint = {
  key: string
  label: string
  value: number
  x: number
  y: number
}

const props = defineProps<{
  data?: TrendRow[]
}>()

const chart = {
  width: 640,
  height: 260,
  left: 36,
  right: 18,
  top: 22,
  bottom: 36,
}

const innerWidth = chart.width - chart.left - chart.right
const innerHeight = chart.height - chart.top - chart.bottom

const rows = computed(() => (props.data ?? []).map(row => ({
  day: row.day,
  label: row.day.slice(5),
  bookedCount: normalizeCount(row.bookedCount),
  arrivedCount: normalizeCount(row.arrivedCount),
})))

const hasRows = computed(() => rows.value.length > 0)

const maxValue = computed(() => {
  const values = rows.value.flatMap(row => [row.bookedCount, row.arrivedCount])
  return Math.max(1, ...values)
})

const bookedDotPoints = computed(() => rows.value.map((row, index) => buildPoint(index, row.label, row.bookedCount)))
const arrivedDotPoints = computed(() => rows.value.map((row, index) => buildPoint(index, row.label, row.arrivedCount)))
const bookedPoints = computed(() => toPolylinePoints(bookedDotPoints.value))
const arrivedPoints = computed(() => toPolylinePoints(arrivedDotPoints.value))

const gridLines = computed(() => {
  const values = [maxValue.value, Math.round(maxValue.value / 2), 0]
  return values.map((value, index) => ({
    key: `${index}-${value}`,
    value,
    y: yFor(value),
  }))
})

const xLabels = computed(() => {
  const length = rows.value.length
  if (length <= 1) {
    return rows.value.map((row, index) => ({
      key: row.day,
      label: row.label,
      x: xFor(index),
    }))
  }

  const step = Math.max(1, Math.ceil((length - 1) / 5))
  return rows.value
    .map((row, index) => ({ row, index }))
    .filter(({ index }) => index === 0 || index === length - 1 || index % step === 0)
    .map(({ row, index }) => ({
      key: row.day,
      label: row.label,
      x: xFor(index),
    }))
})

function normalizeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
}

function xFor(index: number): number {
  const length = Math.max(1, rows.value.length - 1)
  return rows.value.length === 1
    ? chart.left + innerWidth / 2
    : chart.left + (index / length) * innerWidth
}

function yFor(value: number): number {
  return chart.top + (1 - value / maxValue.value) * innerHeight
}

function buildPoint(index: number, label: string, value: number): TrendPoint {
  return {
    key: `${index}-${label}-${value}`,
    label,
    value,
    x: xFor(index),
    y: yFor(value),
  }
}

function toPolylinePoints(points: TrendPoint[]): string {
  return points.map(point => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')
}
</script>

<style scoped>
.trend-grid {
  stroke: rgba(26, 24, 20, 0.08);
  stroke-dasharray: 4 6;
}

.trend-axis {
  fill: #756d5e;
  font-family: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
}

.trend-axis-x {
  font-size: 10px;
}
</style>
