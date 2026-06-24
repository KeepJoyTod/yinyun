# Claude 交接文档 — 影约云门店工作台 UI 优化

> **分支**: `yingyue-closed-loop-optimization-20260603`
> **仓库根目录**: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
> **工作目录 (所有命令在这里执行)**: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench`
> **框架**: Vue 3 + Element Plus + Pinia, Tailwind CSS, Vite, Vitest

---

## 已完成的工作

### 1. useNotice 抽取 + 3 个视图迁移

已创建的文件:
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\composables\useNotice.ts` — 共享 composable,提供 `{ notice, pushNotice, clearNotice }`,支持自动消失 (默认 4.2s)
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\components\NoticeBar.vue` — 共享通知横条组件,支持 fade transition

已迁移的视图 (已删除本地 `const notice = ref` / `pushNotice` 重复代码,改为 import useNotice):
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\ProductCardManagementView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\ProductCardCatalogView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\ServiceGroupsView.vue`

### 2. CSS 工具类 (已添加到 style.css,但尚无页面引用)

- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\style.css`
  - `.yy-eyebrow` — 眉标/标签样式 (mono, uppercase, tracking)
  - `.yy-empty-state` — 空状态居中容器 (flex-col, items-center, gap)
  - `.yy-hero-stats` — 概览统计行 (flex, gap)

### 3. App.vue footer 修复

`D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\app\App.vue` 底部 footer 的占位链接已改为非交互式 `<span class="cursor-default">`,不再有 `href="#"` 死链。

### 4. ChannelMappingModal.contract.test.ts 修复

`D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\components\ChannelMappingModal.contract.test.ts` 中 `mode === 'edit'` 断言已修正为 `'创建映射'` / `'保存映射'`。

---

## 测试状态 (上次运行)

```
Test Files  3 failed | 99 passed (102)
     Tests  3 failed | 591 passed (594)
```

- **已修复**: `ChannelMappingModal.contract.test.ts` (上面第 4 点)
- **未知**: 另外 2 个失败的测试文件名/测试名未知 — 终端输出被截断,只显示了最后 1 个失败。请重新运行测试获取完整结果。

**注意**: Vitest 必须从 `studio-workbench/` 目录运行,不能从仓库根目录运行,否则会误读 `prototype-next/` 的 vitest.config.ts。

---

## 未完成的工作 (需要继续)

### A. 合约测试: 修复剩余 2 个失败

运行 `npx vitest run`,找到另外 2 个失败,对照源码修正合约测试断言。

### B. useNotice 迁移: 还有约 15 个视图未迁移

以下视图仍使用本地 `const notice = ref('')` + 自定义 `pushNotice` 函数,存在重复代码:

- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantDecorationView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroFormEditorView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroFormsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroPagesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\InventoryView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\ChannelVerificationView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\LogsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\DerivedProductModuleView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\RolesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\ChannelsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\EmployeesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\tools\ShareLinksView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\member\CustomersView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\DouyinProductsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\tools\NotificationsView.vue`

迁移方法: 删除 `const notice = ref('')` 和本地 `pushNotice` 函数,改为:
```ts
import { useNotice } from '../../shared/composables/useNotice'
const { notice, pushNotice } = useNotice()
```
同时删除模板中残留的 `.fade-enter-active` scoped CSS (如有)。

### C. CSS 工具类推广

`D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\style.css` 中的工具类已定义但尚无视图引用。需要在各页面中替换对应的内联样式:
- 页眉小标签 (mono + uppercase) → 用 `class="yy-eyebrow"`
- 空状态容器 (居中 flex) → 用 `class="yy-empty-state"`
- 顶栏统计数字行 → 用 `class="yy-hero-stats"`

### D. 其他 UI 优化 (可选)

- Modal 背景一致性审计 (部分用 `bg-black/40`,部分用 `bg-[#1A1814]/42`)
- Button border-radius 统一 (`rounded-xl` vs `rounded-2xl`)
- 移动端响应式审计

---

## 粘贴给另一个 AI 的完整 Prompt

直接复制以下内容发给另一个 AI:

---

你是一个接手项目的工程师。项目信息如下:

**仓库**: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
**工作目录**: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench` (所有命令在这里执行)
**分支**: `yingyue-closed-loop-optimization-20260603`

请完成以下任务:

**第一步: 修复合约测试**

运行 `npx vitest run` (必须在 `studio-workbench/` 目录下运行,不是仓库根目录)。当前有 3 个失败,其中 `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\components\ChannelMappingModal.contract.test.ts` 已被修复。请找出另外 2 个失败的合约测试文件,读取对应的 `.contract.test.ts` 和其引用的 `.vue` 源码,修正 `toContain` 断言使其匹配源码中的实际字符串。合约测试的工作原理是 `import source from './Foo.vue?raw'` 读取源码原文,然后用 `toContain` 检查特定字符串是否存在。如果源码改了但合约没跟上,测试就会失败。

**第二步: (可选) 迁移 useNotice**

参考已完成迁移的示例:
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\composables\useNotice.ts` (composable 定义)
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\ProductCardManagementView.vue` (已迁移的视图)

需要迁移的视图:
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantDecorationView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroFormEditorView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroFormsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\MerchantMicroPagesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\merchant\InventoryView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\ChannelVerificationView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\LogsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\DerivedProductModuleView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\RolesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\ChannelsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\settings\EmployeesView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\tools\ShareLinksView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\member\CustomersView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\products\DouyinProductsView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\tools\NotificationsView.vue`

迁移方法: 删除本地 `const notice = ref('')` 和 `pushNotice` 函数,改为:
```ts
import { useNotice } from '../../shared/composables/useNotice'
const { notice, pushNotice } = useNotice()
```
同时删除模板中残留的 `.fade-enter-active` scoped CSS (如有)。

**第三步: 提交**

运行测试确认 0 失败后,创建 git commit 和 PR。