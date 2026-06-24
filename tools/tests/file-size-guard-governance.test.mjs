import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const repoRoot = path.resolve(import.meta.dirname, '..', '..')
const tempRoots = []

const makeTempRoot = prefix => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  tempRoots.push(root)
  return root
}

const writeLines = (filePath, lines) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join('\n'))
}

const importModule = async relativePath => import(pathToFileURL(path.join(repoRoot, relativePath)).href)

const runModule = (relativePath, body) => {
  const source = `
    import { FILE_SIZE_LIMITS, findFileSizeViolations } from ${JSON.stringify(pathToFileURL(path.join(repoRoot, relativePath)).href)};
    const result = await (async () => {
      ${body}
    })();
    console.log(JSON.stringify(result));
  `
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: repoRoot,
    encoding: 'utf8',
  }))
}

test.after(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('mobile-uniapp exposes a file-size guard and blocks oversized pages', async () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'mobile-uniapp', 'package.json'), 'utf8'))
  assert.equal(packageJson.scripts['check:file-size'], 'node scripts/check-file-size.mjs')

  const guardModule = await importModule('mobile-uniapp/scripts/check-file-size.mjs')
  assert.equal(guardModule.FILE_SIZE_LIMITS.vuePageView.target, 500)
  assert.equal(guardModule.FILE_SIZE_LIMITS.contractTest.temporaryMax, 1000)

  const root = makeTempRoot('mobile-file-size-guard-')
  writeLines(path.join(root, 'src', 'pages', 'customer', 'orders', 'index.vue'), 801)

  const result = runModule('mobile-uniapp/scripts/check-file-size.mjs', `
    return findFileSizeViolations({
      rootDir: ${JSON.stringify(root)},
      knownOversizedFiles: new Map(),
    })
  `)

  assert.equal(result.status, 'FAIL')
  assert.deepEqual(result.violations.map(item => item.relativePath), [
    'src/pages/customer/orders/index.vue',
  ])
})

test('backend exposes a file-size guard and blocks oversized service and test classes', async () => {
  const guardModule = await importModule('backend/scripts/check-file-size.mjs')
  assert.equal(guardModule.FILE_SIZE_LIMITS.javaLogic.target, 500)
  assert.equal(guardModule.FILE_SIZE_LIMITS.contractTest.temporaryMax, 1000)

  const root = makeTempRoot('backend-file-size-guard-')
  writeLines(path.join(root, 'src', 'main', 'java', 'org', 'dromara', 'yy', 'service', 'impl', 'NewBigService.java'), 801)
  writeLines(path.join(root, 'src', 'test', 'java', 'org', 'dromara', 'yy', 'service', 'impl', 'NewBigServiceTest.java'), 1001)

  const result = runModule('backend/scripts/check-file-size.mjs', `
    return findFileSizeViolations({
      rootDir: ${JSON.stringify(root)},
      knownOversizedFiles: new Map(),
    })
  `)

  assert.equal(result.status, 'FAIL')
  assert.deepEqual(result.violations.map(item => item.relativePath), [
    'src/main/java/org/dromara/yy/service/impl/NewBigService.java',
    'src/test/java/org/dromara/yy/service/impl/NewBigServiceTest.java',
  ])
})

test('repo exposes a single guardrail command for all three file-size checks', () => {
  const output = execFileSync(process.execPath, [
    path.join(repoRoot, 'tools', 'check-file-size-all.mjs'),
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  assert.match(output, /studio-workbench/i)
  assert.match(output, /mobile-uniapp/i)
  assert.match(output, /backend/i)
  assert.match(output, /PASS|WARN/i)
})
