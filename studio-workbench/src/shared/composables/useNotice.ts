import { ref } from 'vue'

export type NoticeType = 'success' | 'error'
export type Notice = { type: NoticeType; message: string }

export function useNotice(timeout = 4200) {
  const notice = ref<Notice | null>(null)

  const pushNotice = (type: NoticeType, message: string) => {
    notice.value = { type, message }
    window.setTimeout(() => {
      if (notice.value?.message === message) notice.value = null
    }, timeout)
  }

  return { notice, pushNotice }
}