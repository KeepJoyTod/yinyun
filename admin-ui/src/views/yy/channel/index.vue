<template>
  <YyChannelWorkbench
    channel-title="渠道插件总览"
    subtitle="B-026/B-027：抖音、美团按插件化接入，统一管理授权账号、渠道订单和同步日志。"
    default-open-tip="渠道未开通或未授权时，先作为插件占位，不阻塞门店、产品、订单主流程。"
  />
</template>

<script setup name="YyChannel" lang="ts">
import YyChannelWorkbench from '@/views/yy/components/YyChannelWorkbench.vue';
</script>
