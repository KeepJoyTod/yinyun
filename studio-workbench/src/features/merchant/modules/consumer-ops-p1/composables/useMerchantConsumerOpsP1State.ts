import { computed, onMounted, ref } from 'vue'
import { consumerOpsP1Api } from '../../../../../shared/api/backendConsumerOpsP1Api'
import type { ConsumerOpsP1OverviewDto } from '../../../../../shared/api/backendTypesConsumerOpsP1'
import { buildConsumerOpsP1Summary } from '../merchantConsumerOpsP1Operations'

export const useMerchantConsumerOpsP1State = () => {
  const loading = ref(false)
  const errorMessage = ref('')
  const overview = ref<ConsumerOpsP1OverviewDto | null>(null)

  const summary = computed(() => buildConsumerOpsP1Summary(overview.value))

  const reload = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      overview.value = await consumerOpsP1Api.getConsumerOpsP1Overview()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'P1 消费者运营脚手架加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void reload()
  })

  return {
    loading,
    errorMessage,
    overview,
    summary,
    reload,
  }
}
