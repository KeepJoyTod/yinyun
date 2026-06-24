import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const workbenchRoot = process.cwd()
const scriptUrl = pathToFileURL(path.join(workbenchRoot, 'scripts', 'check-file-size.mjs')).href
const tempRoots: string[] = []

const makeTempRoot = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-file-size-guard-'))
  tempRoots.push(root)
  fs.mkdirSync(path.join(root, 'src', 'features', 'orders'), { recursive: true })
  fs.mkdirSync(path.join(root, 'src', 'shared', 'stores'), { recursive: true })
  fs.mkdirSync(path.join(root, 'src', 'shared', 'api'), { recursive: true })
  return root
}

const writeLines = (file: string, lines: number) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join('\n'))
}

const runFileSizeModule = (body: string) => {
  const source = `
    import {
      DEFAULT_KNOWN_OVERSIZED_FILES,
      FILE_SIZE_LIMITS,
      findFileSizeViolations,
    } from ${JSON.stringify(scriptUrl)};

    const result = await (async () => {
      ${body}
    })();
    console.log(JSON.stringify(result));
  `
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: workbenchRoot,
    encoding: 'utf8',
  })
  return JSON.parse(output)
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

describe('file size guard contract', () => {
  it('exposes the line limits from the architecture standard', () => {
    const limits = runFileSizeModule('return FILE_SIZE_LIMITS')

    expect(limits.vuePageView.target).toBe(500)
    expect(limits.vuePageView.temporaryMax).toBe(800)
    expect(limits.storeModule.target).toBe(600)
    expect(limits.storeModule.temporaryMax).toBe(900)
    expect(limits.apiModule.target).toBe(500)
    expect(limits.apiModule.temporaryMax).toBe(800)
    expect(limits.contractTest.target).toBe(800)
    expect(limits.contractTest.temporaryMax).toBe(1000)
  })

  it('fails a new page, store, api module, or contract test above the migration max', () => {
    const root = makeTempRoot()
    writeLines(path.join(root, 'src', 'features', 'orders', 'NewBloatedView.vue'), 801)
    writeLines(path.join(root, 'src', 'shared', 'stores', 'newBloatedStore.ts'), 901)
    writeLines(path.join(root, 'src', 'shared', 'api', 'newBloatedApi.ts'), 801)
    writeLines(path.join(root, 'src', 'features', 'orders', 'NewBloated.contract.test.ts'), 1001)

    const result = runFileSizeModule(`
      return findFileSizeViolations({
        rootDir: ${JSON.stringify(root)},
        knownOversizedFiles: new Map(),
      })
    `)

    expect(result.status).toBe('FAIL')
    expect(result.violations.map((item: { relativePath: string }) => item.relativePath)).toEqual([
      'src/features/orders/NewBloatedView.vue',
      'src/features/orders/NewBloated.contract.test.ts',
      'src/shared/api/newBloatedApi.ts',
      'src/shared/stores/newBloatedStore.ts',
    ])
    expect(result.violations.every((item: { reason: string }) => item.reason === 'above-temporary-max')).toBe(true)
  })

  it('allows only declared migration exceptions while still reporting them as debt', () => {
    const root = makeTempRoot()
    const knownFile = 'src/features/orders/OrdersView.vue'
    writeLines(path.join(root, knownFile), 1706)

    const result = runFileSizeModule(`
      return findFileSizeViolations({
        rootDir: ${JSON.stringify(root)},
        knownOversizedFiles: new Map([[${JSON.stringify(knownFile)}, { owner: 'orders-view-split', target: 500 }]]),
      })
    `)

    expect(result.status).toBe('PASS')
    expect(result.knownDebt).toEqual([
      expect.objectContaining({
        relativePath: knownFile,
        owner: 'orders-view-split',
        lines: 1706,
        target: 500,
      }),
    ])
  })

  it('keeps the default migration exception list empty after the module split cleanup', () => {
    const known = runFileSizeModule('return Object.fromEntries(DEFAULT_KNOWN_OVERSIZED_FILES)')

    expect(known).toEqual({})
    expect(known['src/features/products/components/CardProductModal.vue']).toBeUndefined()
    expect(known['src/features/orders/OrdersView.vue']).toBeUndefined()
    expect(known['src/shared/api/backend.ts']).toBeUndefined()
    expect(known['src/shared/stores/appStore.ts']).toBeUndefined()
    expect(known['src/features/orders/NewBloatedView.vue']).toBeUndefined()
  })

  it('adds an npm script so agents run the guard before piling into large files', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(workbenchRoot, 'package.json'), 'utf8'))

    expect(packageJson.scripts['check:file-size']).toBe('node scripts/check-file-size.mjs')
  })
})
