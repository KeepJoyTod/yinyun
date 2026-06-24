<template>
  <main class="auth-page auth-page--booking">
    <RouterLink class="brand brand--dark" to="/">
      <span class="brand__mark">影</span>
      <span>
        <strong>影约云</strong>
        <small>Miniapp Booking</small>
      </span>
    </RouterLink>

    <section class="booking-layout">
      <div class="booking-copy">
        <p class="eyebrow">BOOKING CHANNEL</p>
        <h1>预约下单请进入微信或抖音小程序。</h1>
        <p>
          电脑网页不再提交预约表单，避免和小程序订单、抖音来客订单产生第二套数据。客户预约、支付和时段库存统一从小程序进入，订单统一落到影约云后台。
        </p>

        <div class="booking-timeline" aria-label="预约流程">
          <div v-for="step in bookingSteps" :key="step.title" class="booking-step">
            <component :is="step.icon" :size="18" />
            <strong>{{ step.title }}</strong>
            <span>{{ step.copy }}</span>
          </div>
        </div>

        <section class="booking-package-preview" aria-label="数据边界说明">
          <div class="booking-package-preview__head">
            <span>ONE ORDER LEDGER</span>
            <strong>一个订单账本</strong>
          </div>
          <p>
            微信小程序自建订单、抖音来客团购/预约订单、门店人工补录订单，最终都进入 `yy_order`。管理员后台看全量，门店工作台只处理店员要操作的履约事项。
          </p>
          <div class="booking-package-preview__meta">
            <span>
              <CircleCheck :size="15" />
              小程序预约支付
            </span>
            <span>
              <ShieldCheck :size="15" />
              后台统一库存防超卖
            </span>
          </div>
        </section>

        <div class="booking-prep-panel" aria-label="预约前准备">
          <div>
            <p class="eyebrow">BEFORE BOOKING</p>
            <strong>预约前准备</strong>
          </div>
          <ul>
            <li>准备客户手机号，用于订单联系和后续取片授权。</li>
            <li>在微信或抖音小程序选择门店、套餐和可约时段。</li>
            <li>支付完成后，门店员工会在工作台处理确认、拍摄和交付。</li>
          </ul>
        </div>

        <div class="booking-contact-card" aria-label="门店联系方式">
          <div>
            <MapPin :size="17" />
            <span>{{ CUSTOMER_SUPPORT.storeName }}</span>
          </div>
          <a class="booking-contact-card__item" :href="CUSTOMER_SUPPORT.telHref">
            <Phone :size="17" />
            <span>{{ CUSTOMER_SUPPORT.phoneDisplay }}</span>
          </a>
          <small>如果小程序暂时不可用，可先联系门店，由管理员在后台核对订单或补录。</small>
        </div>
      </div>

      <aside class="booking-form booking-form--guide">
        <div class="booking-form__head">
          <p class="eyebrow">MINI PROGRAMS</p>
          <h2>选择预约入口</h2>
          <span>客户电脑网页只做引导和取片，不维护网页预约表单。</span>
        </div>

        <div class="miniapp-guide-list" aria-label="小程序预约入口">
          <article v-for="item in miniappEntries" :key="item.title" class="miniapp-guide-card">
            <component :is="item.icon" :size="22" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.copy }}</span>
              <small>{{ item.status }}</small>
            </div>
          </article>
        </div>

        <RouterLink class="btn btn--primary" to="/customer/login">
          <Images :size="18" />
          已拍摄客户取片
        </RouterLink>
        <RouterLink class="btn btn--ghost-dark" to="/">
          返回官网首页
        </RouterLink>

        <p class="booking-guide-note">
          管理员后台负责全渠道订单和主数据；店员工作台只处理确认、排期、客片上传、选片和核销，不对客户开放预约入口。
        </p>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { CalendarCheck, CircleCheck, Images, MapPin, Phone, ShieldCheck, Smartphone, Store } from '@lucide/vue'
import { CUSTOMER_SUPPORT } from '../shared/customerSupport'

const bookingSteps = [
  {
    title: '小程序下单',
    copy: '客户在微信或抖音选择套餐和时段',
    icon: Smartphone,
  },
  {
    title: '统一落库',
    copy: '支付或同步后写入 yy_order',
    icon: CircleCheck,
  },
  {
    title: '店员履约',
    copy: '门店工作台处理确认、拍摄和交付',
    icon: CalendarCheck,
  },
]

const miniappEntries = [
  {
    title: '微信小程序预约',
    copy: '用于微信内客户下单、支付、预约时段和后续取片。',
    status: 'AppID 已配置，正式上线前配置合法域名和支付资料。',
    icon: Smartphone,
  },
  {
    title: '抖音小程序 / 抖音来客',
    copy: 'P0 走抖音来客商品页真实支付；P1 再接小程序 tt.pay。',
    status: '来客订单同步到本地 yy_order 后，店员工作台可处理履约。',
    icon: Store,
  },
]
</script>
