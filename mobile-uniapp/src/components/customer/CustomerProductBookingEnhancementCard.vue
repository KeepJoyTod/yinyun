<script setup lang="ts">
import type {
  CustomerExperienceP1EntitlementCandidate,
  CustomerExperienceP1ProfileField,
  CustomerExperienceP1ServiceGroup,
} from '@/types/customerExperienceP1'

const props = defineProps<{
  loading: boolean
  serviceGroups: CustomerExperienceP1ServiceGroup[]
  profileFields: CustomerExperienceP1ProfileField[]
  entitlementCandidates: CustomerExperienceP1EntitlementCandidate[]
  notices: string[]
  selectedServiceGroupId: string
  selectedEntitlementCandidateId: string
  customFieldDraft: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'select-service-group', serviceGroupId: string): void
  (event: 'select-entitlement', candidateId: string): void
  (event: 'update-custom-field', payload: { key: string; value: string }): void
}>()

const fieldValue = (key: string) => props.customFieldDraft[key] || ''

const updateField = (key: string, event: any) => {
  const value = String(event?.detail?.value ?? event?.target?.value ?? '')
  emit('update-custom-field', { key, value })
}
</script>

<template>
  <view class="surface-card booking-card booking-p1-card">
    <view class="booking-section-head">
      <text class="section-title">预约增强项</text>
      <text class="booking-section-note">{{ loading ? '加载中' : 'P1 脚手架' }}</text>
    </view>
    <view class="p1-grid">
      <view class="p1-panel">
        <text class="p1-panel-title">服务组</text>
        <button
          v-for="group in serviceGroups"
          :key="group.serviceGroupId"
          class="p1-choice"
          :class="{ 'p1-choice-active': selectedServiceGroupId === group.serviceGroupId }"
          @click="emit('select-service-group', group.serviceGroupId)"
        >
          <text class="p1-row-title">{{ group.name }}</text>
          <text class="p1-row-copy">{{ group.capacityLabel }}</text>
        </button>
      </view>
      <view class="p1-panel">
        <text class="p1-panel-title">资料项</text>
        <view v-for="field in profileFields" :key="field.key" class="p1-row">
          <text class="p1-row-title">{{ field.label }}</text>
          <input
            v-if="field.inputType !== 'textarea'"
            :value="fieldValue(field.key)"
            class="p1-input"
            :placeholder="field.placeholder"
            @input="updateField(field.key, $event)"
          />
          <textarea
            v-else
            :value="fieldValue(field.key)"
            class="p1-textarea"
            maxlength="80"
            :placeholder="field.placeholder"
            @input="updateField(field.key, $event)"
          />
        </view>
      </view>
    </view>
    <view class="p1-entitlement-list">
      <button
        v-for="candidate in entitlementCandidates"
        :key="candidate.candidateId"
        class="p1-entitlement"
        :class="{ 'p1-choice-active': selectedEntitlementCandidateId === candidate.candidateId }"
        @click="emit('select-entitlement', candidate.candidateId)"
      >
        <view>
          <text class="p1-row-title">{{ candidate.title }}</text>
          <text class="p1-row-copy">{{ candidate.reason }}</text>
        </view>
        <text class="p1-status">{{ candidate.amountLabel }}</text>
      </button>
    </view>
    <text v-for="notice in notices" :key="notice" class="p1-notice">{{ notice }}</text>
  </view>
</template>

<style scoped>
.surface-card {
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14rpx 36rpx rgba(31, 45, 49, 0.08);
}

.booking-card {
  padding: 26rpx;
}

.booking-p1-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.booking-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 820;
}

.booking-section-note {
  color: #64748b;
  font-size: 22rpx;
  white-space: nowrap;
}

.p1-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.p1-panel,
.p1-entitlement {
  padding: 18rpx;
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 18rpx;
  background: rgba(248, 250, 252, 0.9);
}

.p1-panel-title,
.p1-row-title,
.p1-row-copy,
.p1-status,
.p1-notice {
  display: block;
}

.p1-panel-title {
  color: #1e3a8a;
  font-size: 22rpx;
  font-weight: 780;
}

.p1-row {
  margin-top: 12rpx;
}

.p1-choice {
  width: 100%;
  margin: 12rpx 0 0;
  padding: 14rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.45);
  border-radius: 14rpx;
  background: #ffffff;
  text-align: left;
}

.p1-choice-active {
  border-color: rgba(37, 99, 235, 0.8);
  background: rgba(219, 234, 254, 0.75);
}

.p1-row-title {
  color: #0f172a;
  font-size: 24rpx;
  font-weight: 760;
}

.p1-row-copy {
  margin-top: 4rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.55;
}

.p1-input,
.p1-textarea {
  box-sizing: border-box;
  width: 100%;
  margin-top: 8rpx;
  padding: 12rpx 14rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.45);
  border-radius: 12rpx;
  background: #ffffff;
  color: #0f172a;
  font-size: 22rpx;
}

.p1-textarea {
  min-height: 92rpx;
}

.p1-entitlement-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.p1-entitlement {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  width: 100%;
  margin: 0;
  text-align: left;
}

.p1-status {
  flex: 0 0 auto;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 20rpx;
}

.p1-notice {
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.55;
}

.p1-choice::after,
.p1-entitlement::after {
  border: 0;
}
</style>
