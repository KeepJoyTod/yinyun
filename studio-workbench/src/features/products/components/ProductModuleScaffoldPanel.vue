<script setup lang="ts">
import { computed } from 'vue'
import { productCatalogStore } from '../../../shared/stores/productCatalogStore'
import { productModuleScaffolds, type ProductModuleScaffoldKey } from '../productModuleScaffold'

const props = defineProps<{
  moduleKey: ProductModuleScaffoldKey
}>()

const module = computed(() => productModuleScaffolds[props.moduleKey])
const owners = computed(() => productCatalogStore.owners)
</script>

<template>
  <section class="product-module">
    <header class="product-module__header">
      <div>
        <p class="product-module__eyebrow">{{ module.owner }}</p>
        <h1>{{ module.title }}</h1>
        <p>{{ module.subtitle }}</p>
      </div>
      <strong>{{ module.readiness }}</strong>
    </header>

    <div class="product-module__body">
      <section class="product-module__panel">
        <h2>接口契约</h2>
        <dl>
          <div>
            <dt>入口</dt>
            <dd>{{ module.apiPath }}</dd>
          </div>
          <div>
            <dt>权限</dt>
            <dd>{{ module.key === 'channel' ? 'yy:channel:list/add/edit/remove' : 'yy:product:list/add/edit/remove' }}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>配置保存骨架，不触发支付、库存扣减、核销、退款或真实渠道写入</dd>
          </div>
        </dl>
      </section>

      <section class="product-module__panel">
        <h2>模块 owner</h2>
        <ul>
          <li v-for="owner in owners" :key="owner.key" :class="{ active: owner.key === module.key }">
            <span>{{ owner.label }}</span>
            <small>{{ owner.apiPath }}</small>
          </li>
        </ul>
      </section>
    </div>

    <footer class="product-module__chips">
      <span v-for="chip in module.chips" :key="chip">{{ chip }}</span>
    </footer>
  </section>
</template>

<style scoped>
.product-module {
  display: grid;
  gap: 20px;
  padding: 24px;
  color: #182230;
}

.product-module__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d8dee8;
}

.product-module__header h1 {
  margin: 4px 0 8px;
  font-size: 28px;
  line-height: 1.2;
}

.product-module__header p {
  margin: 0;
  color: #5f6b7a;
}

.product-module__header strong {
  flex: 0 0 auto;
  padding: 6px 10px;
  border: 1px solid #b8c4d6;
  border-radius: 6px;
  background: #f7f9fc;
  color: #344054;
  font-size: 13px;
}

.product-module__eyebrow {
  font-size: 13px;
  font-weight: 700;
}

.product-module__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: 16px;
}

.product-module__panel {
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.product-module__panel h2 {
  margin: 0 0 14px;
  font-size: 16px;
}

.product-module__panel dl,
.product-module__panel ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.product-module__panel li,
.product-module__panel dl > div {
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid #e4e8ef;
  border-radius: 6px;
  list-style: none;
}

.product-module__panel li.active {
  border-color: #2f6fed;
  background: #f4f7ff;
}

.product-module__panel dt,
.product-module__panel span {
  font-weight: 700;
}

.product-module__panel dd,
.product-module__panel small {
  margin: 0;
  color: #667085;
  word-break: break-word;
}

.product-module__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.product-module__chips span {
  padding: 6px 10px;
  border: 1px solid #d1d8e5;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
}

@media (max-width: 900px) {
  .product-module {
    padding: 16px;
  }

  .product-module__header,
  .product-module__body {
    grid-template-columns: 1fr;
    display: grid;
  }

  .product-module__header strong {
    width: fit-content;
  }
}
</style>
