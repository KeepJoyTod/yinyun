import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFileSizeGuard, isDirectExecution } from '../../tools/file-size-guard-core.mjs'

export const FILE_SIZE_LIMITS = {
  javaLogic: { target: 500, temporaryMax: 800, label: 'Java logic module' },
  javaData: { target: 500, temporaryMax: 800, label: 'Java data/xml module' },
  contractTest: { target: 800, temporaryMax: 1000, label: 'Java contract/test file' },
}

export const DEFAULT_KNOWN_OVERSIZED_FILES = new Map([
  ['ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java', { owner: 'douyin-life-adapter-split', target: 500 }],
  ['ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapterTest.java', { owner: 'douyin-life-adapter-test-split', target: 800 }],
  ['ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java', { owner: 'yy-order-service-test-split', target: 800 }],
  ['ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java', { owner: 'workflow-task-service-split', target: 500 }],
])

const classifyFile = relativePath => {
  const normalized = relativePath.replaceAll('\\', '/')
  if (!normalized.includes('/src/') && !normalized.startsWith('src/')) return null
  if ((normalized.includes('/src/test/java/') || normalized.startsWith('src/test/java/')) && normalized.endsWith('.java')) return 'contractTest'
  if ((normalized.includes('/src/main/resources/mapper/') || normalized.startsWith('src/main/resources/mapper/')) && normalized.endsWith('.xml')) return 'javaData'
  if (!normalized.includes('/src/main/java/') && !normalized.startsWith('src/main/java/')) return null
  if (normalized.includes('/domain/') || normalized.includes('/mapper/')) return 'javaData'
  return 'javaLogic'
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
