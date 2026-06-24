import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCopyWithState } from './useCopyWithState'

const installFallbackDocument = (execResult: boolean) => {
  const textarea = {
    value: '',
    style: {} as Record<string, string>,
    setAttribute: vi.fn(),
    focus: vi.fn(),
    select: vi.fn(),
  }
  const appendChild = vi.fn()
  const removeChild = vi.fn()
  const execCommand = vi.fn(() => execResult)

  vi.stubGlobal('document', {
    body: { appendChild, removeChild },
    createElement: vi.fn(() => textarea),
    execCommand,
  })
  vi.stubGlobal('navigator', {})
  vi.stubGlobal('window', { setTimeout: vi.fn() })

  return { textarea, appendChild, removeChild, execCommand }
}

describe('useCopyWithState', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('falls back to a hidden textarea when Clipboard API is unavailable', async () => {
    const fallback = installFallbackDocument(true)
    const { copiedKey, copyText } = useCopyWithState()

    await expect(copyText('排障文本', 'diagnostic')).resolves.toBe(true)

    expect(fallback.textarea.value).toBe('排障文本')
    expect(fallback.execCommand).toHaveBeenCalledWith('copy')
    expect(fallback.appendChild).toHaveBeenCalledWith(fallback.textarea)
    expect(fallback.removeChild).toHaveBeenCalledWith(fallback.textarea)
    expect(copiedKey.value).toBe('diagnostic')
  })

  it('does not mark a value copied when every clipboard path fails', async () => {
    installFallbackDocument(false)
    const { copiedKey, copyText } = useCopyWithState()

    await expect(copyText('排障文本', 'diagnostic')).resolves.toBe(false)

    expect(copiedKey.value).toBe('')
  })
})
