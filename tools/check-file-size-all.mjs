import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const checks = [
  {
    name: 'studio-workbench',
    cwd: path.join(repoRoot, 'studio-workbench'),
    command: process.execPath,
    args: [path.join(repoRoot, 'studio-workbench', 'scripts', 'check-file-size.mjs')],
  },
  {
    name: 'mobile-uniapp',
    cwd: path.join(repoRoot, 'mobile-uniapp'),
    command: process.execPath,
    args: [path.join(repoRoot, 'mobile-uniapp', 'scripts', 'check-file-size.mjs')],
  },
  {
    name: 'backend',
    cwd: path.join(repoRoot, 'backend'),
    command: process.execPath,
    args: [path.join(repoRoot, 'backend', 'scripts', 'check-file-size.mjs')],
  },
]

let hasFailure = false

for (const check of checks) {
  console.log(`## ${check.name}`)
  try {
    const output = execFileSync(check.command, check.args, {
      cwd: check.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    process.stdout.write(output.trimEnd() + '\n')
  } catch (error) {
    hasFailure = true
    const stdout = String(error.stdout || '').trimEnd()
    const stderr = String(error.stderr || '').trimEnd()
    if (stdout) process.stdout.write(stdout + '\n')
    if (stderr) process.stderr.write(stderr + '\n')
  }
  console.log('')
}

process.exitCode = hasFailure ? 1 : 0
