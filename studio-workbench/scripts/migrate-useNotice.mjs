import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync } from 'fs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const BASE = resolve(SCRIPT_DIR, '../src/features')

const files = [
  // Group A: has local pushNotice function
  { rel: 'merchant/InventoryView.vue', depth: 2 },
  { rel: 'orders/ChannelVerificationView.vue', depth: 2 },
  { rel: 'products/DerivedProductModuleView.vue', depth: 2 },
  { rel: 'products/DouyinProductsView.vue', depth: 2 },
  { rel: 'settings/LogsView.vue', depth: 2 },
  { rel: 'settings/ChannelsView.vue', depth: 2 },
  { rel: 'settings/RolesView.vue', depth: 2 },
  { rel: 'settings/EmployeesView.vue', depth: 2 },
  { rel: 'member/CustomersView.vue', depth: 2 },
  { rel: 'tools/NotificationsView.vue', depth: 2 },
  // Group B: only notice ref, no pushNotice function
  { rel: 'merchant/MerchantMicroFormsView.vue', depth: 2 },
  { rel: 'merchant/MerchantMicroFormEditorView.vue', depth: 2 },
  { rel: 'merchant/MerchantMicroPagesView.vue', depth: 2 },
  { rel: 'merchant/MerchantDecorationView.vue', depth: 2 },
  { rel: 'tools/ShareLinksView.vue', depth: 2 },
]

let modified = 0

for (const file of files) {
  const filePath = resolve(BASE, file.rel)
  let content = readFileSync(filePath, 'utf-8')
  const original = content

  // Step 1: Remove pushNotice function definition (Group A only)
  // Match: const pushNotice = (type: 'success' | 'error', message: string) => {\n  ...\n}\n\n
  content = content.replace(
    /const pushNotice = \(type: 'success' \| 'error', message: string\) => \{\n  notice\.value = \{ type, message \}\n  window\.setTimeout\(\(\) => \{\n    if \(notice\.value\?\.message === message\) notice\.value = null\n  }, \d+\)\n\}\n\n?/,
    ''
  )

  // Step 2: Replace notice ref with useNotice destructuring
  // Group A pattern: const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  content = content.replace(
    `const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)`,
    `const { notice, pushNotice } = useNotice()`
  )

  // Group B pattern: const notice = ref<{ type: 'info' | 'error'; text: string } | null>(null)
  content = content.replace(
    `const notice = ref<{ type: 'info' | 'error'; text: string } | null>(null)`,
    `const { notice, pushNotice } = useNotice()`
  )

  // Step 3: Add useNotice import if we successfully replaced
  if (content.includes('useNotice()') && !content.includes("composables/useNotice")) {
    // Find last import line
    const lines = content.split('\n')
    let lastImportIdx = -1
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('import ')) {
        lastImportIdx = i
        break
      }
    }
    if (lastImportIdx >= 0) {
      const importPath = '../'.repeat(file.depth) + 'shared/composables/useNotice'
      lines.splice(lastImportIdx + 1, 0, `import { useNotice } from '${importPath}'`)
      content = lines.join('\n')
    }
  }

  // Step 4: Clean up empty scoped style blocks
  content = content.replace(/<style scoped>\s*<\/style>/g, '')
  content = content.replace(/<style scoped>\s*\/\*[^*]*\*\/\s*<\/style>/g, '')

  // Step 5: Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n')

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8')
    modified++
    console.log(`OK  ${file.rel}`)
  } else {
    console.log(`SKIP ${file.rel} (no changes)`)
  }
}

console.log(`\nDone. Modified ${modified} files.`)
