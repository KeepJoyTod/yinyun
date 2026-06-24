import { nextTick, onMounted, onUnmounted, type Ref } from 'vue'
import { gsap } from 'gsap'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches

const selectExistingElements = (root: HTMLElement, selectors: string[]) =>
  selectors.flatMap(selector => Array.from(root.querySelectorAll<HTMLElement>(selector)))

export const useWorkbenchIntroMotion = (root: Ref<HTMLElement | null>) => {
  let ctx: gsap.Context | undefined

  onMounted(async () => {
    if (!root.value || prefersReducedMotion()) return
    await nextTick()

    ctx = gsap.context(() => {
      const chromeTargets = selectExistingElements(root.value!, [
        '.workbench-sidebar',
        '.workbench-header',
        '.workbench-main-shell',
        '.workbench-footer',
      ])
      const routeTargets = selectExistingElements(root.value!, ['.yy-route-view > *'])
      const allTargets = [...chromeTargets, ...routeTargets]
      if (allTargets.length === 0) return

      gsap.set(allTargets, { willChange: 'transform, opacity' })

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
          duration: 0.62,
        },
        onComplete: () => {
          gsap.set(allTargets, { clearProps: 'willChange,transform,opacity,visibility' })
        },
      })

      const sidebar = selectExistingElements(root.value!, ['.workbench-sidebar'])
      const header = selectExistingElements(root.value!, ['.workbench-header'])
      const main = selectExistingElements(root.value!, ['.workbench-main-shell'])
      const footer = selectExistingElements(root.value!, ['.workbench-footer'])

      if (sidebar.length) timeline.from(sidebar, { x: -18, autoAlpha: 0 }, 0)
      if (header.length) timeline.from(header, { y: -10, autoAlpha: 0 }, 0.08)
      if (main.length) timeline.from(main, { y: 12, autoAlpha: 0 }, 0.14)
      if (routeTargets.length) {
        timeline.from(
          routeTargets,
          {
            y: 14,
            autoAlpha: 0,
            stagger: { each: 0.035, from: 'start' },
          },
          0.22,
        )
      }
      if (footer.length) timeline.from(footer, { y: 8, autoAlpha: 0 }, 0.32)
    }, root.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
