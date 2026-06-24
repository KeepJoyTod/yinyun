# Miniapp Pickup UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the customer photo pickup miniapp from MVP/engineering UI to a calmer, more photography-studio-like delivery experience without changing backend contracts.

**Architecture:** Keep the existing uni-app pages and `/client/photo/*` API flow. Improve only presentation, customer-facing copy, placeholder/cover treatment, and preview action hierarchy. Use existing tests plus focused contract assertions to prevent regressions.

**Tech Stack:** uni-app Vue 3, Sass in page SFCs, Node built-in test runner, existing `mobile-uniapp` build scripts.

---

### Task 1: Lock the UI Direction

**Files:**
- Modify: `mobile-uniapp/tests/pickup-ui-polish-contract.test.cjs`
- Modify: `mobile-uniapp/src/pages/pickup/login/index.vue`
- Modify: `mobile-uniapp/src/pages/pickup/albums/index.vue`
- Modify: `mobile-uniapp/src/pages/pickup/detail/index.vue`
- Modify: `mobile-uniapp/src/pages/pickup/preview/index.vue`

- [x] Add contract assertions for customer-facing studio language, cleaner preview hierarchy, and real-photo friendly placeholders.
- [x] Run the targeted UI test and confirm it fails before implementation.
- [x] Update page templates and styles with restrained photography-studio visual language.
- [x] Run targeted tests, typecheck, H5 build, mp-weixin build, and mp-toutiao build.

### Task 2: Keep Functional Flow Stable

**Files:**
- Modify only UI SFCs unless a test requires a copy-only state helper update.

- [x] Do not change API methods, token handling, album IDs, or download logic.
- [x] Verify login, album list, detail, preview, and save-permission flow still build.
- [x] Record that final save-to-album must be checked on real device.

### Completion Notes

- UI polish has been implemented in the official `mobile-uniapp` pickup pages, borrowing only product rhythm and selection-state ideas from the friend Taro WeChat miniapp.
- Final customer flow remains `https://api.evanshine.me/client/photo/*`; no backend API, token, album ID, or OSS contract was changed.
- Real-device verification is still required for saving images to the phone album in WeChat and Douyin developer tools.
