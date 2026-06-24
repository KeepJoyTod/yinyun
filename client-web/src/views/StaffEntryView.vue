<template>
  <main class="staff-entry">
    <section class="staff-entry__panel">
      <p class="eyebrow">STAFF ENTRY</p>
      <h1>门店员工请进入工作台。</h1>
      <p>
        官网只承载品牌展示、客户取片和小程序预约引导。订单确认、排期、上传客片和在线选片配置，都在门店工作台完成。
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" :href="workbenchUrl">
          <BriefcaseBusiness :size="18" />
          打开门店工作台
        </a>
        <RouterLink class="btn btn--ghost-dark" to="/">
          返回官网
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { BriefcaseBusiness } from '@lucide/vue'

const workbenchUrl = import.meta.env.VITE_STUDIO_WORKBENCH_URL || 'http://127.0.0.1:5190/login'
</script>
