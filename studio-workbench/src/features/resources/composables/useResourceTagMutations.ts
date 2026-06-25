import { ref } from 'vue'
import type { ResourceTagPayload } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'
import { resourcesApi } from '../../../shared/api/backendResourcesApi'

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

  const createTag = (payload: ResourceTagPayload) =>
    wrap(() => resourcesApi.createResourceTag(payload), '资源标签已创建。')

  const updateTag = (payload: ResourceTagPayload) =>
    wrap(() => resourcesApi.updateResourceTag(payload), '资源标签已更新。')

  const deleteTag = (id: BackendId) =>
    wrap(() => resourcesApi.deleteResourceTag(id), '资源标签已删除。')

  return {
    submitting,
    error,
    statusMessage,
    createTag,
    updateTag,
    deleteTag,
  }
}

