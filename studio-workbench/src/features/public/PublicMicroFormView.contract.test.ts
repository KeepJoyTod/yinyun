import { describe, expect, it } from 'vitest'
import publicSource from './PublicMicroFormView.vue?raw'

describe('public micro form contract', () => {
  it('loads and submits through the public micro form backend facade', () => {
    expect(publicSource).toContain('backendApi.getPublicMicroForm')
    expect(publicSource).toContain('backendApi.submitPublicMicroForm')
    expect(publicSource).toContain('buildSubmitAnswers')
  })

  it('enforces visibility rules validation and privacy before submit', () => {
    expect(publicSource).toContain('visibleFields')
    expect(publicSource).toContain('isFieldVisible')
    expect(publicSource).toContain('validateField')
    expect(publicSource).toContain('minLength')
    expect(publicSource).toContain('maxLength')
    expect(publicSource).toContain('pattern')
    expect(publicSource).toContain('privacyChecks')
  })

  it('captures source store and service-group context from route query', () => {
    expect(publicSource).toContain('sourceContext')
    expect(publicSource).toContain('__sourceCode')
    expect(publicSource).toContain('__sourcePath')
    expect(publicSource).toContain('__storeId')
    expect(publicSource).toContain('__serviceGroupId')
    expect(publicSource).toContain('__qrScene')
  })

  it('falls back to the public form bound store when route storeId is absent', () => {
    expect(publicSource).toContain("readQueryString(route.query.storeId) || String(form.value?.storeId || '')")
    expect(publicSource).toContain("payload.__storeId = sourceContext.value.storeId")
  })
})
