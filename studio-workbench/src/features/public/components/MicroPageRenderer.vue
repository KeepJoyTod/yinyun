<template>
  <div class="yy-micro-page-renderer" :class="{ 'yy-micro-page-renderer--preview': preview }">
    <template v-for="component in sortedComponents" :key="component.id">
      <section
        v-if="component.type === 'title'"
        class="yy-micro-page-section yy-micro-title"
        :class="titleAlignClass(component)"
      >
        <p class="yy-micro-kicker">{{ titleKicker(component) }}</p>
        <h1>{{ componentText(component, pageTitle || '影约云预约拍摄') }}</h1>
        <p v-if="componentDescription(component, pageDesc)" class="yy-micro-copy">
          {{ componentDescription(component, pageDesc) }}
        </p>
      </section>

      <section v-else-if="component.type === 'image'" class="yy-micro-hero">
        <img
          :src="imageUrl(component, coverUrl)"
          :alt="componentText(component, pageTitle || '门店图片')"
          :style="{ height: `${imageHeight(component, preview)}px` }"
          loading="lazy"
        />
        <div v-if="componentText(component, '')" class="yy-micro-hero-caption">
          {{ componentText(component, pageTitle || '') }}
        </div>
      </section>

      <section v-else-if="component.type === 'textnav'" class="yy-micro-page-section yy-micro-actions">
        <button
          v-for="item in navItems(component)"
          :key="item.label"
          class="yy-micro-action"
          type="button"
          @click="handleNav(item.link)"
        >
          <span>{{ item.label }}</span>
          <span aria-hidden="true">›</span>
        </button>
      </section>

      <section v-else-if="component.type === 'masonry'" id="samples" class="yy-micro-page-section yy-micro-gallery">
        <div class="yy-micro-section-heading">
          <h2>{{ componentText(component, '样片展示') }}</h2>
          <p v-if="componentDescription(component, '')">{{ componentDescription(component, '') }}</p>
        </div>
        <div class="yy-micro-gallery-grid">
          <figure v-for="(item, index) in galleryItems(component)" :key="`${item.title}-${index}`">
            <img :src="item.image" :alt="item.title" loading="lazy" />
            <figcaption>{{ item.title }}</figcaption>
          </figure>
        </div>
      </section>

      <section v-else-if="component.type === 'store'" id="store" class="yy-micro-page-section yy-micro-store">
        <div class="yy-micro-section-heading">
          <h2>{{ componentText(component, '门店信息') }}</h2>
          <p v-if="componentDescription(component, '')">{{ componentDescription(component, '') }}</p>
        </div>
        <dl>
          <div v-for="item in storeRows(component)" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <div
        v-else-if="component.type === 'spacer'"
        class="yy-micro-spacer"
        :style="{ height: `${spacerHeight(component)}px` }"
      />

      <div v-else-if="component.type === 'divider'" class="yy-micro-divider" />

      <section v-else class="yy-micro-page-section yy-micro-unknown">
        <h2>{{ componentText(component, component.title || '内容模块') }}</h2>
        <p v-if="componentDescription(component, '')">{{ componentDescription(component, '') }}</p>
      </section>
    </template>

    <section v-if="!sortedComponents.length" class="yy-micro-empty">
      <img :src="workbenchImages.emptyFiles" alt="" loading="lazy" />
      <h2>{{ pageTitle || '页面准备中' }}</h2>
      <p>{{ pageDesc || '门店正在整理内容，请稍后再访问。' }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MicroPageComponentSchema } from '../../../shared/api/backend'
import { workbenchImages } from '../../../shared/stores/workbenchAssets'
import { componentDescription, componentText, galleryItems, imageHeight, imageUrl, navItems, resolveMicroPageNavLink, spacerHeight, storeRows, titleAlignClass, titleKicker } from './microPageRendererOperations'

const props = withDefaults(defineProps<{
  components: MicroPageComponentSchema[]
  pageTitle?: string
  pageDesc?: string
  coverUrl?: string
  storeId?: string
  preview?: boolean
}>(), {
  pageTitle: '',
  pageDesc: '',
  coverUrl: '',
  storeId: '',
  preview: false,
})

const sortedComponents = computed(() =>
  [...props.components].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
)

const handleNav = (link: string) => {
  if (!link || props.preview) return
  if (link.startsWith('#')) {
    try {
      document.querySelector(link)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      // Ignore invalid merchant-provided anchors; the button remains non-destructive.
    }
    return
  }
  const nextLink = resolveMicroPageNavLink(link, props.storeId)
  if (/^(https?:|tel:|mailto:)/i.test(nextLink) || nextLink.startsWith('/')) {
    window.location.href = nextLink
  }
}
</script>

<style scoped>
.yy-micro-page-renderer {
  background: #fffaf3;
  color: #221b15;
}

.yy-micro-page-section {
  padding: 20px 18px;
}

.yy-micro-title {
  display: grid;
  gap: 8px;
  padding-top: 24px;
}

.yy-micro-title--center {
  text-align: center;
}

.yy-micro-title--right {
  text-align: right;
}

.yy-micro-kicker {
  margin: 0;
  color: #a46332;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.yy-micro-title h1,
.yy-micro-section-heading h2,
.yy-micro-unknown h2,
.yy-micro-empty h2 {
  margin: 0;
  color: #201812;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}

.yy-micro-copy,
.yy-micro-section-heading p,
.yy-micro-unknown p,
.yy-micro-empty p {
  margin: 0;
  color: #766858;
  font-size: 13px;
  line-height: 1.7;
}

.yy-micro-hero {
  position: relative;
  margin: 0 14px 8px;
  overflow: hidden;
  border: 1px solid rgba(32, 24, 18, 0.1);
  background: #eee4d6;
}

.yy-micro-hero img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.yy-micro-hero-caption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  background: rgba(255, 250, 243, 0.9);
  padding: 7px 10px;
  color: #2b2118;
  font-size: 12px;
  font-weight: 600;
}

.yy-micro-actions {
  display: grid;
  gap: 8px;
}

.yy-micro-action {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(32, 24, 18, 0.12);
  background: #fff;
  padding: 0 14px;
  color: #2b2118;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.yy-micro-action:active {
  background: #f6eee3;
}

.yy-micro-section-heading {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.yy-micro-section-heading h2 {
  font-size: 17px;
}

.yy-micro-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.yy-micro-gallery figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(32, 24, 18, 0.1);
  background: #fff;
}

.yy-micro-gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1.18;
  object-fit: cover;
}

.yy-micro-gallery figcaption {
  padding: 8px 10px 10px;
  color: #4b3d30;
  font-size: 12px;
  font-weight: 600;
}

.yy-micro-store dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.yy-micro-store dl > div {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  border: 1px solid rgba(32, 24, 18, 0.1);
  background: #fff;
  padding: 10px 12px;
}

.yy-micro-store dt {
  color: #a46332;
  font-size: 12px;
  font-weight: 700;
}

.yy-micro-store dd {
  margin: 0;
  color: #4b3d30;
  font-size: 12px;
  line-height: 1.6;
}

.yy-micro-divider {
  height: 1px;
  margin: 6px 18px;
  background: rgba(32, 24, 18, 0.12);
}

.yy-micro-spacer {
  min-height: 8px;
}

.yy-micro-unknown {
  border-top: 1px solid rgba(32, 24, 18, 0.08);
}

.yy-micro-empty {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 360px;
  padding: 40px 22px;
  text-align: center;
}

.yy-micro-empty img {
  width: 112px;
  opacity: 0.9;
}

.yy-micro-page-renderer--preview .yy-micro-page-section {
  padding: 16px 14px;
}

.yy-micro-page-renderer--preview .yy-micro-title h1 {
  font-size: 18px;
}

.yy-micro-page-renderer--preview .yy-micro-copy,
.yy-micro-page-renderer--preview .yy-micro-section-heading p {
  font-size: 12px;
}

.yy-micro-page-renderer--preview .yy-micro-action {
  min-height: 40px;
  font-size: 12px;
}
</style>
