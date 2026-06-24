import { ref } from 'vue'
import { backendApi, type ResourceTagPayload } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'

export const useResourceTagMutations = () => {
  const submitting = ref(false)
  const error = ref('')
  const statusMessage = ref('')

  const wrap = async (action: () => Promise<void>, message: string) => {
    submitting.value = true
    error.value = ''
    statusMessage.value = ''
    try {
      await action()
      statusMessage.value = message
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '资源标签操作失败'
      throw caught
    } finally {
      submitting.value = false
    }
  }

  return {
    submitting,
    error,
    statusMessage,
    createTag: (payload: ResourceTagPayload) => wrap(() => backendApi.createResourceTag(payload), '资源标签已创建。'),
    updateTag: (payload: ResourceTagPayload) => wrap(() => backendApi.updateResourceTag(payload), '资源标签已更新。'),
    deleteTag: (id: BackendId) => wrap(() => backendApi.deleteResourceTag(id), '资源标签已删除。'),
  }
}
