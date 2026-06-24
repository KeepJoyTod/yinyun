import { computed, ref } from 'vue'

const copyWithHiddenTextarea = (value: string) => {
  if (typeof document === 'undefined' || !document.body || typeof document.execCommand !== 'function') {
    return false
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

const writeClipboardText = async (value: string) => {
  let clipboardError: unknown
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch (error) {
      clipboardError = error
    }
  }

  if (copyWithHiddenTextarea(value)) return true
  if (clipboardError) throw clipboardError
  throw new Error('Clipboard is unavailable')
}

export function useCopyWithState() {
  const copyingKey = ref('')
  const copiedKey = ref('')
  const isSupported = computed(() =>
    Boolean(
      (typeof navigator !== 'undefined' && navigator.clipboard?.writeText)
      || (typeof document !== 'undefined' && document.body && typeof document.execCommand === 'function'),
    ),
  )

  const copyText = async (value: string, key: string) => {
    if (copyingKey.value) return false
    copyingKey.value = key
    copiedKey.value = ''
    try {
      await writeClipboardText(value)
      copiedKey.value = key
      globalThis.setTimeout(() => {
        if (copiedKey.value === key) copiedKey.value = ''
      }, 2400)
      return true
    } catch {
      return false
    } finally {
      copyingKey.value = ''
    }
  }

  return { copyingKey, copiedKey, copyText, isSupported }
}
