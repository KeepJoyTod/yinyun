import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_SOURCE_EXTENSIONS = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.java', '.xml'])

const toPosixPath = value => value.split(path.sep).join('/')

const countLines = filePath => {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!content) return 0
  return content.split(/\r\n|\r|\n/).length
}

const shouldIgnoreDir = (name, ignoreDirs) => ignoreDirs.has(name)

export const createFileSizeGuard = ({
  limits,
  defaultKnownOversizedFiles = new Map(),
  sourceExtensions = DEFAULT_SOURCE_EXTENSIONS,
  categoryOrder = Object.keys(limits),
  ignoreDirs = ['node_modules', 'dist', 'target', '.git', 'coverage', 'output', 'releases', 'unpackage'],
  classifyFile,
}) => {
  const ignoredDirSet = new Set(ignoreDirs)

  const isSourceFile = filePath => sourceExtensions.has(path.extname(filePath))

  const collectFiles = rootDir => {
    const files = []
    const visit = dir => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (shouldIgnoreDir(entry.name, ignoredDirSet)) continue
          visit(fullPath)
          continue
        }
        if (entry.isFile() && isSourceFile(fullPath)) {
          files.push(fullPath)
        }
      }
    }

    visit(rootDir)
    return files
  }

  const toEntry = (rootDir, fullPath) => {
    const relativePath = toPosixPath(path.relative(rootDir, fullPath))
    const category = classifyFile(relativePath)
    if (!category) return null
    const limit = limits[category]
    if (!limit) {
      throw new Error(`Unknown file-size category "${category}" for ${relativePath}`)
    }
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
    const categoryDiff = categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category)
    if (categoryDiff !== 0) return categoryDiff
    return left.relativePath.localeCompare(right.relativePath)
  }

  const findFileSizeViolations = ({
    rootDir = process.cwd(),
    knownOversizedFiles = defaultKnownOversizedFiles,
  } = {}) => {
    const entries = collectFiles(rootDir)
      .map(file => toEntry(rootDir, file))
      .filter(Boolean)

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

  const formatFileSizeReport = result => {
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

  const main = () => {
    const result = findFileSizeViolations()
    console.log(formatFileSizeReport(result))
    process.exitCode = result.status === 'PASS' ? 0 : 1
  }

  return {
    DEFAULT_KNOWN_OVERSIZED_FILES: defaultKnownOversizedFiles,
    FILE_SIZE_LIMITS: limits,
    findFileSizeViolations,
    formatFileSizeReport,
    main,
  }
}

export const isDirectExecution = importMetaUrl =>
  process.argv[1] && importMetaUrl === pathToFileURL(process.argv[1]).href
