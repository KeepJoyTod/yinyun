<template>
  <main>
    <section class="hero" :style="heroStyle">
      <div class="hero__shade"></div>
      <nav class="site-nav">
        <RouterLink class="brand" to="/">
          <span class="brand__mark">影</span>
          <span>
            <strong>影约云</strong>
            <small>Photo Service</small>
          </span>
        </RouterLink>
        <div class="site-nav__links">
          <RouterLink to="/booking">小程序预约</RouterLink>
          <RouterLink to="/customer/login">客户取片</RouterLink>
          <RouterLink to="/staff">门店入口</RouterLink>
        </div>
      </nav>

      <div class="hero__content">
        <p class="eyebrow">EVANSHINE PHOTO</p>
        <h1>预约、拍摄、取片，给客户一个清楚的入口。</h1>
        <p class="hero__copy">
          客户从微信或抖音小程序预约下单，从官网或小程序取片；店员从工作台处理订单、日程和客片。入口分开，数据统一。
        </p>
        <div class="hero__actions">
          <RouterLink class="btn btn--primary" to="/booking">
            <CalendarCheck :size="18" />
            小程序预约
          </RouterLink>
          <RouterLink class="btn btn--ghost" to="/customer/login">
            <Images :size="18" />
            客户取片
          </RouterLink>
        </div>

        <div class="home-proof-strip" aria-label="客户服务承诺">
          <div v-for="item in proofItems" :key="item.title" class="home-proof-item">
            <component :is="item.icon" :size="17" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.copy }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="home-journey">
      <div class="home-journey__head">
        <p class="eyebrow">SERVICE FLOW</p>
        <h2>从提交预约到相册交付，每一步都能被客户看懂。</h2>
        <p>官网承接品牌展示、取片和小程序预约引导；真实预约下单只走微信/抖音小程序，门店确认、修图交付、后台配置继续由门店工作台和系统后台处理。</p>
      </div>
      <div class="home-journey__grid">
        <article v-for="step in journeySteps" :key="step.title" class="home-journey-step">
          <component :is="step.icon" :size="20" />
          <span>{{ step.index }}</span>
          <strong>{{ step.title }}</strong>
          <p>{{ step.copy }}</p>
        </article>
      </div>
    </section>

    <section class="home-service-menu">
      <div class="home-service-menu__head">
        <p class="eyebrow">PHOTO PACKAGES</p>
        <h2>客户先看到能预约什么，再进入小程序下单。</h2>
        <RouterLink class="btn btn--ghost-dark" to="/booking">
          <CalendarCheck :size="18" />
          小程序预约
        </RouterLink>
      </div>

      <div class="home-service-grid">
        <article v-for="item in servicePackages" :key="item.title" class="home-service-card">
          <component :is="item.icon" :size="22" />
          <div>
            <span>{{ item.kicker }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.copy }}</p>
          </div>
          <small>{{ item.meta }}</small>
        </article>
      </div>
    </section>

    <section class="home-delivery-showcase">
      <div class="home-delivery-showcase__media">
        <img :src="heroImage" alt="影约云样片交付展示" />
        <div class="home-delivery-badge">
          <Images :size="18" />
          <span>样片交付</span>
        </div>
      </div>

      <div class="home-delivery-showcase__copy">
        <p class="eyebrow">PRIVATE DELIVERY</p>
        <h2>照片私有存储，客户只拿到自己的短期访问入口。</h2>
        <p>
          修图完成后，门店上传照片到私有 OSS。客户通过手机号和取片码进入相册目录，再按需预览或下载原图。
        </p>

        <div class="home-delivery-proof-list">
          <div v-for="item in deliveryProofs" :key="item.title" class="home-delivery-proof">
            <component :is="item.icon" :size="18" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.copy }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="entry-band">
      <div class="entry-band__head">
        <p class="eyebrow">ENTRY MODEL</p>
        <h2>客户入口和门店入口不共用登录态。</h2>
      </div>
      <div class="entry-grid">
        <RouterLink class="entry-card entry-card--customer" to="/customer/login">
          <UserRound :size="22" />
          <strong>客户登录</strong>
          <span>手机号、验证码或取片码，进入自己的相册和交付记录。</span>
        </RouterLink>
        <RouterLink class="entry-card entry-card--staff" to="/staff">
          <BriefcaseBusiness :size="22" />
          <strong>门店工作台</strong>
          <span>店员和门店管理员处理订单、日程、客片和选片配置。</span>
        </RouterLink>
        <a class="entry-card entry-card--system" href="http://127.0.0.1:5180/" target="_blank" rel="noreferrer">
          <LockKeyhole :size="22" />
          <strong>系统后台</strong>
          <span>平台管理和系统配置，不作为客户官网公开入口。</span>
        </a>
      </div>
      <div class="home-privacy-note">
        <ShieldCheck :size="18" />
        <span>客户照片默认走私有存储和短期授权访问；官网不展示后台地址、OSS 管理地址或长期图片直链。</span>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  BriefcaseBusiness,
  CalendarCheck,
  Camera,
  CircleCheck,
  Clock,
  Download,
  Eye,
  Images,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from '@lucide/vue'
import heroImage from '../assets/studio-hero.png'

const heroStyle = {
  backgroundImage: `url(${heroImage})`,
}

const proofItems = [
  {
    title: '小程序预约',
    copy: '微信/抖音小程序下单',
    icon: CalendarCheck,
  },
  {
    title: '门店确认',
    copy: '店员确认档期',
    icon: Clock,
  },
  {
    title: '私密取片',
    copy: '手机号和取片码授权',
    icon: ShieldCheck,
  },
]

const journeySteps = [
  {
    index: '01',
    title: '小程序预约',
    copy: '客户在微信或抖音小程序选择门店、套餐和可约时段。',
    icon: CalendarCheck,
  },
  {
    index: '02',
    title: '到店拍摄',
    copy: '门店确认档期后，店员在工作台跟进订单和拍摄流程。',
    icon: Camera,
  },
  {
    index: '03',
    title: '相册交付',
    copy: '修完后客户用手机号和取片码进入相册，预览或下载照片。',
    icon: CircleCheck,
  },
]

const servicePackages = [
  {
    kicker: 'ID PHOTO',
    title: '证件照精修',
    copy: '适合证件照、报名照、职业照，强调快速预约和精修交付。',
    meta: '门店确认档期',
    icon: Camera,
  },
  {
    kicker: 'PROFILE',
    title: '形象照拍摄',
    copy: '适合个人主页、求职和商务资料，拍摄后通过私密相册交付。',
    meta: '可预约到店',
    icon: UserRound,
  },
  {
    kicker: 'FAMILY',
    title: '家庭纪念照',
    copy: '适合亲子、家庭纪念和节日记录，多图目录方便全家查看。',
    meta: '多图交付',
    icon: Images,
  },
]

const deliveryProofs = [
  {
    title: '手机号和取片码校验',
    copy: '客户登录后只看到自己名下已开放的相册。',
    icon: KeyRound,
  },
  {
    title: '短期预览链接',
    copy: '预览和下载链接由后端按需生成，过期后重新校验。',
    icon: Eye,
  },
  {
    title: '原图下载留痕',
    copy: '客户保存原图前再次走授权链路，后续可补访问日志。',
    icon: Download,
  },
]
</script>
