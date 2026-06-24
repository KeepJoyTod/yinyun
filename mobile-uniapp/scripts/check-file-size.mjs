import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFileSizeGuard, isDirectExecution } from '../../tools/file-size-guard-core.mjs'

export const FILE_SIZE_LIMITS = {
  vuePageView: { target: 500, temporaryMax: 800, label: 'Vue page view' },
  vueLeafComponent: { target: 350, temporaryMax: 500, label: 'Vue leaf component' },
  tsHelper: { target: 500, temporaryMax: 800, label: 'TypeScript helper/composable' },
  apiModule: { target: 500, temporaryMax: 800, label: 'API module' },
  contractTest: { target: 800, temporaryMax: 1000, label: 'Contract/test file' },
}

export const DEFAULT_KNOWN_OVERSIZED_FILES = new Map([
  ['src/pages/customer/orders/index.vue', { owner: 'mobile-customer-orders-split', target: 500 }],
  ['src/pages/home/index.vue', { owner: 'mobile-home-page-split', target: 500 }],
  ['tests/real-oss-evidence-contract.test.cjs', { owner: 'mobile-real-oss-contract-split', target: 800 }],
])

const classifyFile = relativePath => {
  const normalized = relativePath.replaceAll('\\', '/')
  if (normalized.startsWith('tests/') && normalized.includes('.test.')) return 'contractTest'
  if (normalized.startsWith('src/api/')) return 'apiModule'
  if (normalized.startsWith('src/pages/') && normalized.endsWith('.vue')) return 'vuePageView'
  if (normalized.endsWith('.vue')) return 'vueLeafComponent'
  if (normalized.startsWith('src/')) return 'tsHelper'
  return null
}

export const {
  findFileSizeViolations,
  formatFileSizeReport,
} = createFileSizeGuard({
  limits: FILE_SIZE_LIMITS,
  defaultKnownOversizedFiles: DEFAULT_KNOWN_OVERSIZED_FILES,
  classifyFile,
})

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const main = () => {
  const result = findFileSizeViolations({ rootDir: projectRoot })
  console.log(formatFileSizeReport(result))
  process.exitCode = result.status === 'PASS' ? 0 : 1
}

if (isDirectExecution(import.meta.url)) {
  main()
}
