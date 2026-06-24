import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 把页面筛选状态双向同步到当前路由 query。
 *
 * 设计目标：
 * - 读取：从 route.query 还原筛选状态（支持数组式 query 取第一项）。
 * - 写入：把筛选状态写回 route.query，用 router.replace 避免污染历史栈。
 * - 防回环：写入/读取之间用 syncing 标记互斥，避免 query 变化又触发自身写入。
 *
 * 典型用法：
 *   const { syncing, applyFromQuery, syncToUrl, readString, isDateKey } = useRouteQueryFilters({
 *     buildQuery: () => ({ q: search.value, quick: quick.value }),
 *     parseQuery: (get) => { search.value = get('q'); quick.value = get('quick') },
 *   })
 *   applyFromQuery()                       // 进入页面时读一次
 *   watch([search, quick], syncToUrl)      // 筛选变化时写回
 */
export type QueryGetter = (key: string, fallback?: string) => string
/**
 * 筛选状态 → query 的中间表达。
 * 允许 string / string[]，以及 null / number / undefined / '' 这类会被
 * buildRouterQuery 统一过滤或强转的"空值/数值"形态（来自表单 input、数字金额等）。
 */
export type QueryValue = string | string[] | number | null | undefined
export type QueryReadResult = Record<string, QueryValue>

export type UseRouteQueryFiltersOptions = {
  /**
   * 返回当前筛选状态对应的 query 对象。值为 undefined / '' 的键会被剔除，
   * 这样清空筛选时也会把对应的 query 参数从 URL 上移除。
   */
  buildQuery: () => QueryReadResult
  /**
   * 从 query 读取并写回页面筛选状态。`get(key, fallback)` 已封装好取值逻辑。
   * 只在 `applyFromQuery()` 被调用时执行一次。
   */
  parseQuery?: (get: QueryGetter) => void
}

/** 读取单个 query 值：数组取首项，空值转空串。 */
export const readQueryString = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return String(value ?? '')
}

/** 校验 YYYY-MM-DD 日期键。 */
export const isDateKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value)

/**
 * 把筛选状态对象转成可写回 router.replace 的 query。
 * 剔除 undefined / null / '' / 空数组，确保清空筛选时参数从 URL 上消失。
 * 数组用逗号拼接为单串。
 *
 * 纯函数，便于单测，不依赖 vue-router。
 */
export const buildRouterQuery = (state: QueryReadResult): Record<string, string> => {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(state)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      query[key] = value.join(',')
      continue
    }
    query[key] = String(value)
  }
  return query
}

/**
 * 将当前 route.query 与本次筛选状态合并。
 * 对 buildQuery 明确管理的 key：空值表示移除旧参数；非空值表示覆盖。
 * 对非筛选参数（如 open、focus）保持原样，避免破坏页面级深链。
 */
export const mergeRouterQuery = (
  currentQuery: Record<string, unknown>,
  managedState: QueryReadResult,
): Record<string, string> => {
  const next: Record<string, string> = {}
  const managedKeys = new Set(Object.keys(managedState))
  for (const [key, value] of Object.entries(currentQuery)) {
    if (managedKeys.has(key)) continue
    const text = readQueryString(value)
    if (text) next[key] = text
  }
  return { ...next, ...buildRouterQuery(managedState) }
}

export const useRouteQueryFilters = (options: UseRouteQueryFiltersOptions) => {
  const route = useRoute()
  const router = useRouter()
  const syncing = ref(false)

  const get: QueryGetter = (key, fallback = '') => {
    const raw = route.query[key]
    if (raw === undefined || raw === null || raw === '') return fallback
    return readQueryString(raw)
  }

  const applyFromQuery = () => {
    if (!options.parseQuery) return
    syncing.value = true
    try {
      options.parseQuery(get)
    } finally {
      // 用微任务延后释放，确保本次同步触发的 watch 不会反向写回 query
      window.queueMicrotask(() => {
        syncing.value = false
      })
    }
  }

  const syncToUrl = () => {
    if (syncing.value) return
    const state = options.buildQuery()
    router.replace({
      path: route.path,
      query: mergeRouterQuery(route.query, state),
    })
  }

  return {
    syncing,
    applyFromQuery,
    syncToUrl,
    readString: readQueryString,
    isDateKey,
    buildRouterQuery,
  }
}
