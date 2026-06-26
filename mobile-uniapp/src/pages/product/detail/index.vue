<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createCustomerOrder } from '@/api/customer';
import { getProductDetail, getStoreSlots } from '@/api/home';
import CustomerProductBookingEnhancementCard from '@/components/customer/CustomerProductBookingEnhancementCard.vue';
import { runCustomerOrderPaymentFlow } from '@/pages/customer/orders/customerPaymentFlow';
import { useCustomerAuth } from '@/composables/useCustomerAuth';
import { useCustomerExperienceP1 } from '@/composables/useCustomerExperienceP1';
import type { ProductDetailData, ProductSkuItem, PublicTimeSlot } from '@/types/home';
import { referenceAssets } from '@/utils/referenceAssets';

const productId = ref('');
const detail = ref<ProductDetailData | null>(null);
const selectedSkuId = ref('');
const selectedDate = ref('');
const selectedSlot = ref('');
const contactName = ref('');
const contactPhone = ref('');
const remark = ref('');
const loading = ref(false);
const slotsLoading = ref(false);
const submitting = ref(false);
const error = ref('');
const slots = ref<PublicTimeSlot[]>([]);
const selectedP1ServiceGroupId = ref('');
const selectedP1EntitlementCandidateId = ref('');
const p1CustomFieldDraft = ref<Record<string, string>>({});

const { isLoggedIn, customer, requireCustomerLogin } = useCustomerAuth();
const {
  loading: p1Loading,
  serviceGroups: p1ServiceGroups,
  profileFields: p1ProfileFields,
  entitlementCandidates: p1EntitlementCandidates,
  notices: p1Notices,
  loadBookingOptions,
} = useCustomerExperienceP1();

const product = computed(() => detail.value?.product);
const store = computed(() => detail.value?.store);
const skus = computed(() => detail.value?.skus || []);
const selectedSku = computed(() => skus.value.find((item) => item.skuId === selectedSkuId.value));
const availableSlots = computed(() => slots.value.filter((slot) => slot.available));
const productCover = computed(() => product.value?.coverImage || product.value?.imageUrl || referenceAssets.categoryPortraits[0]);
const selectedP1EntitlementCandidate = computed(() => (
  p1EntitlementCandidates.value.find((candidate) => candidate.candidateId === selectedP1EntitlementCandidateId.value)
));
const p1ServiceGroupIdForPayload = computed(() => (
  /^\d+$/.test(selectedP1ServiceGroupId.value) ? selectedP1ServiceGroupId.value : undefined
));
const p1CustomFieldPayload = computed(() => {
  const payload: Record<string, string> = {};
  p1ProfileFields.value.forEach((field) => {
    const value = String(p1CustomFieldDraft.value[field.key] || '').trim();
    if (value) {
      payload[field.key] = value;
    }
  });
  return Object.keys(payload).length ? payload : undefined;
});
const p1RequiredFieldsComplete = computed(() => (
  p1ProfileFields.value
    .filter((field) => field.required)
    .every((field) => String(p1CustomFieldDraft.value[field.key] || '').trim())
));

const dateOptions = computed(() => {
  const today = new Date();
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const value = formatDateValue(date);
    const label = index === 0 ? '今天' : index === 1 ? '明天' : `${date.getMonth() + 1}/${date.getDate()}`;
    return { value, label };
  });
});

const canSubmit = computed(() => Boolean(
  selectedSkuId.value
    && selectedDate.value
    && selectedSlot.value
    && contactName.value.trim()
    && /^1\d{10}$/.test(contactPhone.value)
    && p1RequiredFieldsComplete.value
));

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatPrice(value?: number) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

function slotLabel(slot: PublicTimeSlot) {
  if (slot.time) {
    return slot.time;
  }
  if (slot.start && slot.end) {
    return `${slot.start.slice(0, 5)}-${slot.end.slice(0, 5)}`;
  }
  return slot.start?.slice(0, 5) || '可预约';
}

function skuMeta(sku: ProductSkuItem) {
  const parts = [
    sku.includedPhotos ? `${sku.includedPhotos}张底片` : '',
    sku.includedRetouch ? `精修${sku.includedRetouch}张` : '',
    sku.durationMinutes ? `${sku.durationMinutes}分钟` : '',
  ].filter(Boolean);
  return parts.join(' · ') || '门店确认服务内容';
}

function normalizePhone(raw: string) {
  return String(raw || '').replace(/\D/g, '').slice(0, 11);
}

function onPhoneInput(event: any) {
  contactPhone.value = normalizePhone(event?.detail?.value ?? event?.target?.value ?? '');
  return contactPhone.value;
}

async function loadSlots() {
  if (!store.value?.storeId || !selectedDate.value) {
    return;
  }
  slotsLoading.value = true;
  selectedSlot.value = '';
  try {
    slots.value = await getStoreSlots(store.value.storeId, selectedDate.value, productId.value);
  } catch (err: any) {
    slots.value = [];
    uni.showToast({ title: err?.message || '加载档期失败', icon: 'none' });
  } finally {
    slotsLoading.value = false;
  }
}

async function loadDetail(id: string) {
  loading.value = true;
  error.value = '';
  try {
    const data = await getProductDetail(id);
    detail.value = data;
    selectedSkuId.value = data.skus[0]?.skuId || '';
    selectedDate.value = dateOptions.value[0]?.value || '';
    contactPhone.value = customer.value?.phone || '';
    void loadBookingOptions({ productId: data.product.productId, storeId: data.store?.storeId });
    await loadSlots();
  } catch (err: any) {
    error.value = err?.message || '商品详情加载失败';
  } finally {
    loading.value = false;
  }
}

function selectSku(skuId: string) {
  selectedSkuId.value = skuId;
}

function selectDate(date: string) {
  selectedDate.value = date;
  void loadSlots();
}

function selectSlot(slot: PublicTimeSlot) {
  if (!slot.available) {
    return;
  }
  selectedSlot.value = slotLabel(slot);
}

function selectP1ServiceGroup(serviceGroupId: string) {
  selectedP1ServiceGroupId.value = serviceGroupId;
}

function selectP1Entitlement(candidateId: string) {
  selectedP1EntitlementCandidateId.value = candidateId;
}

function updateP1CustomField(payload: { key: string; value: string }) {
  p1CustomFieldDraft.value = {
    ...p1CustomFieldDraft.value,
    [payload.key]: payload.value,
  };
}

async function submitOrder() {
  if (!isLoggedIn.value) {
    requireCustomerLogin(`/pages/product/detail/index?productId=${encodeURIComponent(productId.value)}`);
    return;
  }
  if (!canSubmit.value || !store.value || !selectedSku.value) {
    uni.showToast({ title: '请补齐预约信息', icon: 'none' });
    return;
  }
  submitting.value = true;
  try {
    const order = await createCustomerOrder({
      storeId: store.value.storeId,
      skuId: selectedSku.value.skuId,
      categoryId: product.value?.categoryId,
      serviceGroupId: p1ServiceGroupIdForPayload.value,
      customerName: contactName.value.trim(),
      customerPhone: contactPhone.value,
      remark: remark.value.trim(),
      customFields: p1CustomFieldPayload.value,
      entitlementCandidateId: selectedP1EntitlementCandidate.value?.status === 'available'
        ? selectedP1EntitlementCandidate.value?.candidateId
        : undefined,
      entitlementKind: selectedP1EntitlementCandidate.value?.status === 'available'
        ? selectedP1EntitlementCandidate.value?.kind
        : undefined,
      entitlementUnavailableReason: selectedP1EntitlementCandidate.value?.status === 'available'
        ? undefined
        : selectedP1EntitlementCandidate.value?.reason,
      appointmentDate: selectedDate.value,
      timeSlot: selectedSlot.value,
    });
    const paymentResult = await runCustomerOrderPaymentFlow(order.orderId);
    uni.showToast({
      title: paymentResult.toastMessage,
      icon: paymentResult.status === 'success' ? 'success' : 'none',
    });
    uni.switchTab({ url: '/pages/customer/orders/index?refresh=1&fromPayment=1' });
  } catch {
    // 请求层已经展示错误 toast。
  } finally {
    submitting.value = false;
  }
}

onLoad((query) => {
  productId.value = String(query?.productId || query?.id || '');
  if (productId.value) {
    void loadDetail(productId.value);
  } else {
    error.value = '缺少商品 ID';
  }
});

watch(p1ServiceGroups, (groups) => {
  if (!selectedP1ServiceGroupId.value && groups[0]?.serviceGroupId) {
    selectedP1ServiceGroupId.value = groups[0].serviceGroupId;
  }
});

watch(p1EntitlementCandidates, (candidates) => {
  if (!selectedP1EntitlementCandidateId.value && candidates[0]?.candidateId) {
    selectedP1EntitlementCandidateId.value = candidates[0].candidateId;
  }
});

watch(p1ProfileFields, (fields) => {
  const next = { ...p1CustomFieldDraft.value };
  fields.forEach((field) => {
    if (next[field.key] === undefined) {
      next[field.key] = '';
    }
  });
  p1CustomFieldDraft.value = next;
});
</script>

<template>
  <view class="replica-page product-detail-page">
    <view class="page-content product-detail-content">
      <template v-if="loading">
        <view class="skeleton-card surface-card">
          <view class="skeleton-line" style="width: 52%" />
          <view class="skeleton-line" style="width: 82%" />
          <view class="skeleton-block" style="height: 360rpx" />
        </view>
      </template>

      <view v-else-if="error" class="surface-card product-detail-state">
        <text class="state-title">加载失败</text>
        <text class="state-copy">{{ error }}</text>
        <button v-if="productId" class="button-secondary" @click="loadDetail(productId)">重新加载</button>
      </view>

      <template v-else-if="product">
        <view class="product-detail-hero">
          <image
            class="product-detail-cover"
            :src="productCover"
            mode="aspectFill"
          />
          <view class="product-detail-title-card">
            <text class="product-detail-store">{{ store?.name || '影约云门店' }}</text>
            <text class="product-detail-title">{{ product.name }}</text>
            <text class="product-detail-subtitle">{{ product.subtitle || product.description || '选择规格与档期后即可提交预约。' }}</text>
            <view class="product-detail-meta">
              <text v-if="product.includeCount" class="meta-chip">{{ product.includeCount }}张底片</text>
              <text v-if="product.retouchCount" class="meta-chip">精修{{ product.retouchCount }}张</text>
              <text v-if="product.shootDuration" class="meta-chip">{{ product.shootDuration }}</text>
            </view>
          </view>
        </view>

        <view class="surface-card booking-card">
          <view class="booking-section-head">
            <text class="section-title">选择套餐</text>
            <text class="booking-section-note">价格以下单页为准</text>
          </view>
          <view class="sku-list">
            <button
              v-for="sku in skus"
              :key="sku.skuId"
              class="sku-button"
              :class="{ 'sku-button-active': selectedSkuId === sku.skuId }"
              :disabled="sku.stock === 0"
              @click="selectSku(sku.skuId)"
            >
              <view>
                <text class="sku-title">{{ sku.skuName }}</text>
                <text class="sku-copy">{{ skuMeta(sku) }}</text>
              </view>
              <view class="sku-price-box">
                <text class="sku-price">{{ formatPrice(sku.price) }}</text>
                <text v-if="sku.originalPrice" class="sku-original">{{ formatPrice(sku.originalPrice) }}</text>
              </view>
            </button>
          </view>
        </view>

        <view class="surface-card booking-card">
          <view class="booking-section-head">
            <text class="section-title">预约档期</text>
            <text class="booking-section-note">避开已占用时段</text>
          </view>
          <view class="date-row">
            <button
              v-for="item in dateOptions"
              :key="item.value"
              class="date-button"
              :class="{ 'date-button-active': selectedDate === item.value }"
              @click="selectDate(item.value)"
            >
              <text class="date-label">{{ item.label }}</text>
              <text class="date-value">{{ item.value.slice(5) }}</text>
            </button>
          </view>

          <view v-if="slotsLoading" class="slot-loading">正在查询可预约时段</view>
          <view v-else-if="availableSlots.length === 0" class="slot-empty">当前日期暂无可预约时段，请选择其他日期。</view>
          <view v-else class="slot-grid">
            <button
              v-for="slot in slots"
              :key="slotLabel(slot)"
              class="slot-button"
              :class="{ 'slot-button-active': selectedSlot === slotLabel(slot) }"
              :disabled="!slot.available"
              @click="selectSlot(slot)"
            >
              {{ slotLabel(slot) }}
            </button>
          </view>
        </view>

        <CustomerProductBookingEnhancementCard
          :loading="p1Loading"
          :service-groups="p1ServiceGroups"
          :profile-fields="p1ProfileFields"
          :entitlement-candidates="p1EntitlementCandidates"
          :notices="p1Notices"
          :selected-service-group-id="selectedP1ServiceGroupId"
          :selected-entitlement-candidate-id="selectedP1EntitlementCandidateId"
          :custom-field-draft="p1CustomFieldDraft"
          @select-service-group="selectP1ServiceGroup"
          @select-entitlement="selectP1Entitlement"
          @update-custom-field="updateP1CustomField"
        />

        <view class="surface-card booking-card">
          <view class="booking-section-head">
            <text class="section-title">联系人</text>
            <text class="booking-section-note">需与会员手机号一致</text>
          </view>
          <view class="field">
            <text class="label">联系人姓名</text>
            <input v-model="contactName" class="input" placeholder="请输入到店联系人" />
          </view>
          <view class="field">
            <text class="label">手机号</text>
            <input
              v-model="contactPhone"
              class="input"
              type="number"
              maxlength="11"
              placeholder="请输入已绑定手机号"
              @input="onPhoneInput"
            />
          </view>
          <view class="field">
            <text class="label">备注</text>
            <textarea v-model="remark" class="booking-textarea" maxlength="120" placeholder="可填写拍摄人数、偏好或到店说明" />
          </view>
        </view>

        <view class="surface-card booking-card booking-rule-card">
          <text class="section-title">预约须知</text>
          <text class="booking-rule-copy">{{ product.refundRule || '提交预约前请确认门店、套餐、日期和时段；支付后如需取消或退款，以订单页规则为准。' }}</text>
          <text class="booking-rule-copy">{{ product.rescheduleRule || '改期需在拍摄前提交申请，并以门店确认后的新档期为准。' }}</text>
        </view>

        <view class="booking-submit-bar">
          <view class="booking-submit-copy">
            <text class="booking-submit-title">{{ selectedSku ? formatPrice(selectedSku.price) : formatPrice(product.price) }}</text>
            <text class="booking-submit-subtitle">{{ selectedDate || '选择日期' }} {{ selectedSlot || '选择时段' }}</text>
          </view>
          <button class="booking-submit-button" :loading="submitting" :disabled="!canSubmit || submitting" @click="submitOrder">
            立即预约
          </button>
        </view>
      </template>
    </view>
  </view>
</template>

<style scoped>
.product-detail-content {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.product-detail-state {
  padding: 56rpx 30rpx;
  text-align: center;
}

.product-detail-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  background: #e4efff;
  box-shadow: 0 18rpx 48rpx rgba(31, 45, 49, 0.08);
}

.product-detail-cover {
  display: block;
  width: 100%;
  height: 500rpx;
}

.product-detail-title-card {
  position: relative;
  margin: -84rpx 20rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14rpx 36rpx rgba(31, 45, 49, 0.08);
}

.product-detail-store,
.product-detail-title,
.product-detail-subtitle {
  display: block;
}

.product-detail-store {
  color: #52677f;
  font-size: 22rpx;
  font-weight: 760;
}

.product-detail-title {
  margin-top: 8rpx;
  color: #0f172a;
  font-size: 38rpx;
  font-weight: 840;
  line-height: 1.2;
}

.product-detail-subtitle {
  margin-top: 12rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.55;
}

.product-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.booking-card {
  padding: 26rpx;
}

.p1-choice-active {
  border-color: rgba(37, 99, 235, 0.8);
  background: rgba(219, 234, 254, 0.75);
}

.booking-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.booking-section-note {
  color: #64748b;
  font-size: 22rpx;
  white-space: nowrap;
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.sku-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  min-height: 118rpx;
  margin: 0;
  padding: 18rpx;
  border: 1px solid rgba(207, 217, 215, 0.9);
  border-radius: 16rpx;
  background: #f8fbff;
  color: #0f172a;
  line-height: normal;
}

.sku-button::after,
.date-button::after,
.slot-button::after,
.booking-submit-button::after {
  border: 0;
}

.sku-button-active {
  border-color: #2563eb;
  background: #eaf3ff;
}

.sku-title,
.sku-copy,
.sku-price,
.sku-original {
  display: block;
  text-align: left;
}

.sku-title {
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 800;
}

.sku-copy {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.4;
}

.sku-price-box {
  flex: none;
  text-align: right;
}

.sku-price {
  color: #b85b33;
  font-size: 32rpx;
  font-weight: 840;
  text-align: right;
}

.sku-original {
  color: #9ba5a7;
  font-size: 21rpx;
  text-decoration: line-through;
  text-align: right;
}

.date-row,
.slot-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.date-button,
.slot-button {
  width: auto;
  min-width: 118rpx;
  min-height: 76rpx;
  margin: 0;
  padding: 10rpx 18rpx;
  border: 1px solid rgba(207, 217, 215, 0.9);
  border-radius: 16rpx;
  background: #fff;
  color: #0f172a;
  line-height: normal;
}

.date-button-active,
.slot-button-active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.date-label,
.date-value {
  display: block;
  font-size: 22rpx;
  font-weight: 760;
  line-height: 1.25;
}

.date-value {
  margin-top: 6rpx;
  font-size: 20rpx;
  opacity: 0.78;
}

.slot-loading,
.slot-empty {
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f2f7f5;
  color: #5e6f72;
  font-size: 23rpx;
  line-height: 1.5;
}

.booking-textarea {
  width: 100%;
  min-height: 150rpx;
  box-sizing: border-box;
  padding: 20rpx 24rpx;
  border: 1px solid #cfe0f5;
  border-radius: 16rpx;
  background: #fff;
  color: #0f172a;
  font-size: 26rpx;
  line-height: 1.5;
}

.booking-rule-copy {
  display: block;
  margin-top: 14rpx;
  color: #64748b;
  font-size: 23rpx;
  line-height: 1.6;
}

.booking-submit-bar {
  position: sticky;
  z-index: 8;
  bottom: calc(18rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 18rpx;
  border: 1px solid rgba(207, 217, 215, 0.9);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18rpx 48rpx rgba(31, 45, 49, 0.11);
}

.booking-submit-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 5rpx;
}

.booking-submit-title {
  color: #b85b33;
  font-size: 34rpx;
  font-weight: 840;
  line-height: 1.15;
}

.booking-submit-subtitle {
  color: #64748b;
  font-size: 21rpx;
  line-height: 1.35;
}

.booking-submit-button {
  flex: none;
  width: auto;
  min-width: 190rpx;
  min-height: 76rpx;
  margin: 0;
  padding: 0 30rpx;
  border: 0;
  border-radius: 16rpx;
  background: #2563eb;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 76rpx;
}

button[disabled] {
  opacity: 0.55;
}

@media (max-width: 360px) {
  .booking-section-head,
  .booking-submit-bar,
  .sku-button {
    align-items: stretch;
    flex-direction: column;
  }

  .booking-submit-button {
    width: 100%;
  }

  .sku-price,
  .sku-original {
    text-align: left;
  }
}
</style>
