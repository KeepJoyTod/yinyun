<template>
  <section data-testid="forbidden-view" class="flex min-h-[520px] items-center justify-center">
    <div class="max-w-[560px] border border-amber-topbar-border bg-amber-content-bg px-10 py-12 text-center">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-accent">Access denied</p>
      <h1 class="mt-4 font-sans text-[30px] font-medium text-amber-dark">当前账号没有访问权限</h1>
      <p class="mt-4 text-[13px] leading-7 text-amber-text-muted">
        此功能未分配给当前员工，或不在当前门店的数据范围内。请联系门店主管或系统管理员调整角色权限。
      </p>
      <router-link class="yy-action mt-8 inline-flex bg-amber-dark px-5 py-2.5 text-[11px] font-medium text-[#F4EFE6]" to="/">
        回到经营概况
      </router-link>
    </div>
  </section>
</template>
