<template>
  <div ref="slotsRoot" class="reservation-slots-motion w-full overflow-x-auto" @wheel.prevent="handleWheel">
    <div class="min-w-[800px]">
      <!-- Time Header -->
      <div class="flex border-b border-amber-topbar-border/50">
        <div class="w-32 flex-shrink-0 p-3"></div>
        <div class="flex-1 flex">
          <div v-for="hour in hours" :key="hour" class="flex-1 text-center py-2 text-[10px] font-mono text-amber-text-muted border-l border-amber-topbar-border/30">
            {{ hour }}
          </div>
        </div>
      </div>

      <!-- Studio Rows -->
      <div v-for="studio in studios" :key="studio.id" class="slot-row yy-clickable-row flex border-b border-amber-topbar-border/50 group hover:bg-black/[0.02] transition-colors">
        <div class="w-32 flex-shrink-0 p-3 flex flex-col justify-center">
          <span class="text-[10.5px] font-sans font-normal text-amber-dark leading-tight">{{ studio.name }}</span>
        </div>
        <div class="flex-1 flex relative h-14">
          <!-- Hour markers -->
          <div v-for="hour in hours" :key="hour" class="flex-1 border-l border-amber-topbar-border/30"></div>

          <!-- Bookings -->
          <div
            v-for="booking in studio.bookings"
            :key="booking.id"
            class="slot-booking yy-surface absolute top-2 bottom-2 cursor-pointer rounded-[1.75px] px-2 flex flex-col justify-center overflow-hidden shadow-sm border border-amber-topbar-border/20 transition hover:border-amber-dark/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-accent/20"
            :style="getBookingStyle(booking)"
            :class="booking.status === 'active' ? 'bg-[#EBE4D6] text-amber-dark' : 'bg-white/40 text-amber-text-muted'"
            role="button"
            tabindex="0"
            :aria-label="`打开预约 ${booking.customer} ${booking.time}`"
            @click.stop="selectBooking(booking)"
            @keydown.enter.stop.prevent="selectBooking(booking)"
            @keydown.space.stop.prevent="selectBooking(booking)"
          >
            <span class="text-[10px] font-mono font-normal truncate">{{ booking.customer }}</span>
            <span class="text-[8px] opacity-60 truncate font-mono mt-0.5">{{ booking.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../../motion/workbenchIntro'

type SlotBooking = {
  id: number | string
  bookingId?: number | string
  orderNo?: number | string
  customer: string
  time: string
  start: number
  duration: number
  status: 'active' | 'pending'
}

type SlotStudio = {
  id: number | string
  name: string
  type?: string
  bookings: SlotBooking[]
}

const props = defineProps<{
  hours?: string[]
  studios?: SlotStudio[]
}>()

const emit = defineEmits<{
  'select-booking': [booking: SlotBooking]
}>()

const defaultHours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']

const hours = computed(() => props.hours ?? defaultHours)
const studios = computed(() => props.studios ?? [])
const slotsRoot = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

const animateSlots = async () => {
  if (!slotsRoot.value || prefersReducedMotion()) return
  await nextTick()

  ctx?.revert()
  ctx = gsap.context(() => {
    const rows = gsap.utils.toArray<HTMLElement>('.slot-row')
    const bookings = gsap.utils.toArray<HTMLElement>('.slot-booking')
    const targets = [...rows, ...bookings]
    if (targets.length === 0) return

    gsap.set(targets, { willChange: 'transform, opacity' })
    if (bookings.length > 0) gsap.set(bookings, { transformOrigin: 'left center' })

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        gsap.set(targets, {
          clearProps: 'willChange,transform,opacity,visibility,transformOrigin',
        })
      },
    })

    if (rows.length > 0) timeline.from(rows, { y: 8, autoAlpha: 0, duration: 0.34, stagger: 0.045 }, 0)
    if (bookings.length > 0) {
      timeline.from(bookings, { scaleX: 0.86, autoAlpha: 0, duration: 0.52, stagger: 0.055 }, 0.12)
    }
  }, slotsRoot.value)
}

onMounted(() => {
  void animateSlots()
})

watch(
  () => studios.value.map(studio => `${studio.id}:${studio.bookings.map(booking => booking.id).join(',')}`).join('|'),
  () => {
    void animateSlots()
  },
)

onUnmounted(() => {
  ctx?.revert()
})

const getBookingStyle = (booking: any) => {
  const startHour = 9
  const totalHours = 11 // 09 to 20 is 11 hours
  const left = ((booking.start - startHour) / totalHours) * 100
  const width = (booking.duration / totalHours) * 100

  return {
    left: `${left}%`,
    width: `${width}%`
  }
}

const selectBooking = (booking: SlotBooking) => {
  emit('select-booking', booking)
}

const handleWheel = (event: WheelEvent) => {
  const root = slotsRoot.value
  if (!root) return

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  if (delta === 0) return

  root.scrollLeft += delta
}
</script>
