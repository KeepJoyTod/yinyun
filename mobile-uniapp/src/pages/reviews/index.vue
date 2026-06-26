<script setup lang="ts">
import { ref } from 'vue'
import { useCustomerExperienceP1 } from '@/composables/useCustomerExperienceP1'

const rating = ref(5)
const remark = ref('')
const tags = ref<string[]>(['服务体验', '出片效果'])
const { loading, reviewResult, submitReviewDraft } = useCustomerExperienceP1()

function toggleTag(tag: string) {
  tags.value = tags.value.includes(tag)
    ? tags.value.filter(item => item !== tag)
    : [...tags.value, tag]
}

async function submitReview() {
  const result = await submitReviewDraft({
    rating: rating.value,
    tags: tags.value,
    remark: remark.value.trim(),
  })
  uni.showToast({ title: result.message, icon: 'none' })
}
</script>

<template>
  <view class="review-page">
    <view class="review-card">
      <text class="review-kicker">P1 Scaffold</text>
      <text class="review-title">服务评价</text>
      <text class="review-copy">评价提交入口已作为消费者端 owner 搭好，评价表、审核和报表入账仍待后续接真实 API。</text>
    </view>

    <view class="review-card">
      <text class="review-label">评分</text>
      <view class="rating-row">
        <button
          v-for="score in [1, 2, 3, 4, 5]"
          :key="score"
          class="rating-button"
          :class="{ 'rating-button-active': rating === score }"
          @click="rating = score"
        >
          {{ score }}
        </button>
      </view>

      <text class="review-label">标签</text>
      <view class="tag-row">
        <button
          v-for="tag in ['服务体验', '妆造沟通', '拍摄氛围', '出片效果']"
          :key="tag"
          class="tag-button"
          :class="{ 'tag-button-active': tags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </view>

      <text class="review-label">备注</text>
      <textarea v-model="remark" class="review-textarea" maxlength="160" placeholder="可填写本次服务体验，后续接入审核和报表。" />

      <button class="review-submit" :loading="loading" :disabled="loading" @click="submitReview">
        提交评价脚手架
      </button>
    </view>

    <view v-if="reviewResult" class="review-card review-result">
      <text class="review-title-small">{{ reviewResult.message }}</text>
      <text v-for="ref in reviewResult.evidenceRefs" :key="ref" class="review-copy">{{ ref }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.review-page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f5f9ff;
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 18rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.94);
}

.review-kicker,
.review-title,
.review-copy,
.review-label,
.review-title-small {
  display: block;
}

.review-kicker {
  color: #2563eb;
  font-size: 20rpx;
  font-weight: 760;
}

.review-title {
  color: #0f172a;
  font-size: 42rpx;
  font-weight: 840;
}

.review-title-small {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 780;
}

.review-copy {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.65;
}

.review-label {
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 760;
}

.rating-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.rating-button,
.tag-button {
  border: 1rpx solid rgba(37, 99, 235, 0.14);
  border-radius: 999rpx;
  background: #f8fafc;
  color: #475569;
  font-size: 24rpx;
}

.rating-button {
  width: 72rpx;
  height: 72rpx;
  padding: 0;
  line-height: 72rpx;
}

.tag-button {
  padding: 10rpx 20rpx;
}

.rating-button-active,
.tag-button-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.review-textarea {
  min-height: 180rpx;
  padding: 18rpx;
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 18rpx;
  background: #f8fafc;
  color: #0f172a;
  font-size: 24rpx;
}

.review-submit {
  border-radius: 999rpx;
  background: #2563eb;
  color: #fff;
  font-size: 26rpx;
}

.review-result {
  border-style: dashed;
}
</style>
