# Figma 像素级还原前端代码通用指南 (Figma-to-Code Skill)

本指南总结了在 Trae 环境下，如何通过 AI 能力将 Figma 原型图 1:1 还原为高质量前端代码的最佳实践。

## 核心流程 (Core Workflow)

### 1. 样式探测与设计令牌 (Design Tokens)
在开始编写任何组件之前，必须先建立“视觉基座”。
- **操作**：使用 `get_figma_data` 读取根节点（如 App 或 Page 容器）。
- **关键点**：
    - 提取 **Colors**：记录背景色、主色、文字颜色及它们的透明度（RGBA）。
    - 提取 **Typography**：记录 `fontFamily`、`fontSize`、`lineHeight` 和 `letterSpacing`。
    - 提取 **Spacing/Radius**：记录边距和圆角的精确值（如 `1.75px`）。
- **落地**：在 Tailwind v4 中，优先在 `style.css` 的 `@theme` 块中定义 CSS 变量。

### 2. 资源导出 (Assets Extraction)
- **操作**：识别所有 `IMAGE-SVG` 或图片节点，记录其 `nodeId`。
- **关键点**：使用 `download_figma_images` 批量下载。
- **技巧**：
    - 下载路径建议先设为临时目录（如 `AppData\Local\Temp`），再通过命令行移动到项目的 `src/assets/icons`。
    - 对于图标，建议在代码中使用内联 SVG 或 `currentColor`，以便通过 CSS 控制颜色（尤其是 Hover 状态）。

### 3. 全局布局重构 (Global Layout)
- **操作**：先搭建 `App.vue` 中的大框架（Sidebar + Header + Main Content）。
- **关键点**：
    - 使用 `flex` 或 `grid` 锁定整体结构。
    - 确保 `overflow-hidden` 和 `overflow-y-auto` 的正确嵌套，防止页面出现双滚动条。

### 4. 像素级组件实现 (Component Implementation)
- **操作**：从左到右，从上到下。
- **关键点**：
    - **原子化**：将重复元素抽取为子组件（如 `SidebarItem`, `StatItem`）。
    - **字体精度**：不要只写 `text-sm`，如果设计稿是 `11.375px`，请使用自定义值 `text-[11.375px]`。
    - **透明度处理**：背景色透明度（如 `bg-white/10`）和文字透明度（如 `text-white/60`）是还原“质感”的关键。

### 5. 交互与动态内容 (Interactivity)
- **操作**：根据设计稿中的状态（Active, Hover, Pending）编写逻辑。
- **关键点**：
    - 使用 `vue-router` 处理导航高亮。
    - 对于复杂图表，引入 `echarts` 并根据 Figma 颜色变量进行配置。

---

## 经验避坑指南 (Troubleshooting)

| 问题场景 | 解决方案 |
| :--- | :--- |
| **Tailwind 编译报错** | 检查指令是否正确。v4 使用 `@import "tailwindcss";`，且不要在基础层直接 `@apply` 未定义的类。 |
| **图标颜色无法修改** | 检查 SVG 源码，将硬编码的 `stroke` 或 `fill` 改为 `currentColor`。 |
| **字体加载失败** | 确保在 `index.html` 或 `style.css` 中引入了对应的 Google Fonts。 |
| **1:1 还原度不够** | 检查 `letter-spacing`。很多精致的设计感来自于细微的字间距调整。 |

## 推荐 Skill 指令集 (Reusable Commands)

当需要还原新页面时，请按顺序执行：
1. `读取 Figma 节点 [nodeId] 的深度数据 (depth: 5)`
2. `分析并同步设计令牌至 tailwind 配置`
3. `导出该节点下的所有 SVG 图标`
4. `按组件层级拆分并实现代码`

---
*Created by Trae AI Assistant - 2026-06-04*
