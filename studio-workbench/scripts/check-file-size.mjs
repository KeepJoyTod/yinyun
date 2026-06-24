import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const FILE_SIZE_LIMITS = {
  vuePageView: { target: 500, temporaryMax: 800, label: 'Vue page view' },
  vueLeafComponent: { target: 350, temporaryMax: 500, label: 'Vue leaf component' },
  tsHelper: { target: 500, temporaryMax: 800, label: 'TypeScript helper/composable' },
  storeModule: { target: 600, temporaryMax: 900, label: 'Store module' },
  apiModule: { target: 500, temporaryMax: 800, label: 'API module' },
  contractTest: { target: 800, temporaryMax: 1000, label: 'Contract/test file' },
}

export const DEFAULT_KNOWN_OVERSIZED_FILES = new Map()

const SOURCE_EXTENSIONS = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs'])
const CATEGORY_ORDER = ['vuePageView', 'vueLeafComponent', 'contractTest', 'apiModule', 'storeModule', 'tsHelper']

const toPosixPath = value => value.split(path.sep).join('/')

const isSourceFile = filePath => SOURCE_EXTENSIONS.has(path.extname(filePath))

const countLines = filePath => {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!content) return 0
  return content.split(/\r\n|\r|\n/).length
}

const collectFiles = rootDir => {
  const srcRoot = path.join(rootDir, 'src')
  if (!fs.existsSync(srcRoot)) return []

  const files = []
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'output', 'releases'].includes(entry.name)) visit(fullPath)
        continue
      }
      if (entry.isFile() && isSourceFile(fullPath)) files.push(fullPath)
    }
  }

  visit(srcRoot)
  return files
}

export const classifyFile = relativePath => {
  const normalized = toPosixPath(relativePath)
  const basename = path.posix.basename(normalized)

  if (basename.endsWith('.test.ts') || basename.endsWith('.test.tsx')) return 'contractTest'
  if (normalized.startsWith('src/shared/stores/')) return 'storeModule'
  if (normalized.startsWith('src/shared/api/')) return 'apiModule'
  if (basename.endsWith('View.vue')) return 'vuePageView'
  if (basename.endsWith('.vue')) return 'vueLeafComponent'
  return 'tsHelper'
}

const toEntry = (rootDir, fullPath) => {
  const relativePath = toPosixPath(path.relative(rootDir, fullPath))
  const category = classifyFile(relativePath)
  const limit = FILE_SIZE_LIMITS[category]
  return {
    relativePath,
    category,
    label: limit.label,
    lines: countLines(fullPath),
    target: limit.target,
    temporaryMax: limit.temporaryMax,
  }
}

const compareEntries = (left, right) => {
  const categoryDiff = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category)
  if (categoryDiff !== 0) return categoryDiff
  return left.relativePath.localeCompare(right.relativePath)
}

export const findFileSizeViolations = ({
  rootDir = process.cwd(),
  knownOversizedFiles = DEFAULT_KNOWN_OVERSIZED_FILES,
} = {}) => {
  const entries = collectFiles(rootDir).map(file => toEntry(rootDir, file))
  const violations = []
  const knownDebt = []
  const warnings = []

  for (const entry of entries) {
    const known = knownOversizedFiles.get(entry.relativePath)
    if (entry.lines > entry.temporaryMax) {
      if (known) {
        knownDebt.push({ ...entry, ...known })
      } else {
        violations.push({ ...entry, reason: 'above-temporary-max' })
      }
      continue
    }

    if (entry.lines > entry.target) {
      warnings.push({ ...entry, reason: 'above-target' })
    }
  }

  violations.sort(compareEntries)
  knownDebt.sort((left, right) => left.relativePath.localeCompare(right.relativePath))
  warnings.sort((left, right) => left.relativePath.localeCompare(right.relativePath))

  return {
    status: violations.length ? 'FAIL' : 'PASS',
    violations,
    knownDebt,
    warnings,
  }
}

export const formatFileSizeReport = result => {
  const lines = [`file-size-guard: ${result.status}`]

  if (result.violations.length) {
    lines.push('', 'Violations above migration max:')
    for (const item of result.violations) {
      lines.push(`- ${item.relativePath}: ${item.lines} lines > ${item.temporaryMax} (${item.label})`)
    }
  }

  if (result.knownDebt.length) {
    lines.push('', 'Known migration debt:')
    for (const item of result.knownDebt) {
      lines.push(`- ${item.relativePath}: ${item.lines} lines, owner=${item.owner}, target=${item.target}`)
    }
  }

  if (result.warnings.length) {
    lines.push('', 'Above target but below migration max:')
    for (const item of result.warnings) {
      lines.push(`- ${item.relativePath}: ${item.lines} lines > ${item.target} (${item.label})`)
    }
  }

  return lines.join('\n')
}

export const main = () => {
  const result = findFileSizeViolations()
  console.log(formatFileSizeReport(result))
  process.exitCode = result.status === 'PASS' ? 0 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
