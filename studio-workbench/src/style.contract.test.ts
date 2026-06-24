/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { studioVisualContract } from './styleContract'
import { readFileSync } from 'node:fs'

const styleSource = readFileSync(new URL('./style.css', import.meta.url), 'utf8')

describe('studio visual system contract', () => {
  it('keeps glass panels readable by placing decorative layers behind content', () => {
    expect(studioVisualContract.glassPanelReadableLayer).toBe('.yy-glass-panel > *')
    expect(styleSource).toContain(studioVisualContract.glassPanelReadableLayer)
    expect(styleSource).toContain(studioVisualContract.glassPanelContentZIndex)
    expect(styleSource).toContain(studioVisualContract.glassPanelDecorZIndex)
    expect(styleSource).toContain(studioVisualContract.glassPanelReadableGradient)
  })

  it('defines premium console primitives for high-frequency workbench pages', () => {
    studioVisualContract.consolePrimitives.forEach(token => {
      expect(styleSource).toContain(token)
    })
  })
})
