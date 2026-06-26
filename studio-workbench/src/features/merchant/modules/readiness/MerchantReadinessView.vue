<template>
  <MerchantReadinessOwnerShell
    section-key="summary"
    eyebrow="商家闭环脚手架"
    title="未完成项总览"
    description="只读聚合商家模块的 readiness 状态、阻塞原因、证据与下一步动作，后续任务包按 owner 逐个补齐真实写链路。"
    show-tabs
  />
</template>

<script setup lang="ts">
import MerchantReadinessOwnerShell from './components/MerchantReadinessOwnerShell.vue'
</script>
