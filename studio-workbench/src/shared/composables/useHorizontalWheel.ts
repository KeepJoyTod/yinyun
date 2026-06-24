import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export type HorizontalWheelInput = {
  deltaY: number
  deltaX: number
  shiftKey: boolean
  scrollWidth: number
  clientWidth: number
}

export const shouldHandleHorizontalWheel = (input: HorizontalWheelInput) =>
  Math.abs(input.deltaY) > Math.abs(input.deltaX)
  && !input.shiftKey
  && input.scrollWidth > input.clientWidth + 1

export const useHorizontalWheel = (target: Ref<HTMLElement | null>) => {
  const onWheel = (event: WheelEvent) => {
    const element = target.value
    if (!element) return
    if (!shouldHandleHorizontalWheel({
      deltaY: event.deltaY,
      deltaX: event.deltaX,
      shiftKey: event.shiftKey,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    })) return

    event.preventDefault()
    element.scrollLeft += event.deltaY
  }

  onMounted(() => {
    target.value?.addEventListener('wheel', onWheel, { passive: false })
  })

  onBeforeUnmount(() => {
    target.value?.removeEventListener('wheel', onWheel)
  })
}
