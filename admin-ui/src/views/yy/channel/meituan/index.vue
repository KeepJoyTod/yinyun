<template>
  <YyChannelWorkbench
    channel-title="美团产品"
    channel-type="MEITUAN"
    subtitle="B-027：第一版先做美团到店综合基础授权、订单同步和核销记录查询框架，资料未齐时明确显示未授权。"
    default-open-tip="美团核销工具未开通，请先完成美团商家/核销接口授权。"
    :integration-notes="integrationNotes"
  />
</template>

<script setup name="YyChannelMeituan" lang="ts">
import YyChannelWorkbench from '@/views/yy/components/YyChannelWorkbench.vue';

const integrationNotes = [
  '行业路径：美团开放平台创建到店综合应用，细分类目优先选休闲娱乐 / 摄影。',
  '商家资料：营业执照主体、美团商户/开店宝账号、目标门店需要一致或可授权。',
  '授权字段：AppKey、AppSecret、access_token、refresh_token、shop_id 只保存到后端。',
  'V1 范围：先同步门店订单和核销记录，不先做评价、营销、复杂预约闭环。',
  '当前状态：后端 adapter/client 已预留真实请求框架，接口 path 和签名等登录官方文档确认。',
  '保护策略：未配置 yy.meituan.base-url 前不会请求占位接口，同步失败是预期提示。',
  '联调原则：未授权时同步会失败并写日志；授权后按最近 24 小时 / 7 天拉取订单。'
];
</script>
