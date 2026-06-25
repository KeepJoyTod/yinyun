import { computed, ref, watch, type ComputedRef } from 'vue'
import { appStore } from '../../../../../shared/stores/appStore'
import {
  buildDashboardExportFallbackName,
  buildDashboardExportRangeDays,
  isDashboardExportInvalidRange,
} from '../dashboardHomeOperations'

type UseDashboardHomeExportOptions = {
  selectedDashboardStoreBackendId: ComputedRef<string>
  businessDateKey: ComputedRef<string>
}

const downloadDashboardBlob = (
  result: { blob: Blob; fileName?: string },
  fallbackName: string,
) => {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = result.fileName || fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const useDashboardHomeExport = ({
  selectedDashboardStoreBackendId,
  businessDateKey,
}: UseDashboardHomeExportOptions) => {
  const dashboardExporting = ref(false)
  const dashboardExportBeginDate = ref('')
  const dashboardExportEndDate = ref('')
  const dashboardExportStoreId = ref('')
  const dashboardExportUseHomeStore = ref(true)
  const dashboardExportChannelType = ref('')

  const updateDashboardExportStoreId = (storeId: string) => {
    dashboardExportStoreId.value = storeId
    dashboardExportUseHomeStore.value = storeId === selectedDashboardStoreBackendId.value
  }

  const dashboardExportRangeDays = computed(() =>
    buildDashboardExportRangeDays(
      dashboardExportBeginDate.value,
      dashboardExportEndDate.value,
    ),
  )
  const dashboardExportInvalidRange = computed(() =>
    isDashboardExportInvalidRange(
      dashboardExportBeginDate.value,
      dashboardExportEndDate.value,
      dashboardExportRangeDays.value,
    ),
  )
  const dashboardExportDisabled = computed(() =>
    appStore.demoMode || dashboardExporting.value || dashboardExportInvalidRange.value,
  )
  const dashboardExportTitle = computed(() => {
    if (appStore.demoMode) return '请连接 API 后导出真实首页汇总'
    if (dashboardExporting.value) return '正在导出首页汇总'
    if (dashboardExportInvalidRange.value) return '请选择不超过 31 天的日期范围'
    return '导出首页汇总'
  })

  watch(businessDateKey, date => {
    dashboardExportBeginDate.value = date
    dashboardExportEndDate.value = date
  }, { immediate: true })

  watch(selectedDashboardStoreBackendId, storeId => {
    if (!dashboardExportUseHomeStore.value) return
    dashboardExportStoreId.value = storeId || ''
  }, { immediate: true })

  const exportDashboardSummary = async () => {
    if (appStore.demoMode) {
      window.alert('请连接 API 后导出真实首页汇总')
      return
    }
    if (dashboardExportInvalidRange.value) {
      window.alert('请选择不超过 31 天的日期范围')
      return
    }

    const beginDate = dashboardExportBeginDate.value
    const endDate = dashboardExportEndDate.value
    dashboardExporting.value = true
    try {
      const result = await appStore.exportDashboard({
        beginDate,
        endDate,
        storeId: dashboardExportStoreId.value || undefined,
        channelType: dashboardExportChannelType.value || undefined,
      })
      downloadDashboardBlob(
        result,
        buildDashboardExportFallbackName(beginDate, endDate),
      )
    } catch (error) {
      window.alert(error instanceof Error ? `首页导出失败：${error.message}` : '首页导出失败')
    } finally {
      dashboardExporting.value = false
    }
  }

  return {
    dashboardExporting,
    dashboardExportBeginDate,
    dashboardExportEndDate,
    dashboardExportStoreId,
    dashboardExportChannelType,
    dashboardExportRangeDays,
    dashboardExportInvalidRange,
    dashboardExportDisabled,
    dashboardExportTitle,
    updateDashboardExportStoreId,
    exportDashboardSummary,
  }
}
