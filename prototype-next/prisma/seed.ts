import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedIds = {
  brand: "seed-brand-id",
  store: "seed-store-id",
  serviceGroup: "seed-service-group-id",
  product: "seed-product-id",
  douyinProduct: "seed-douyin-product-id",
  meituanProduct: "seed-meituan-product-id",
  douyinPlugin: "seed-douyin-channel-plugin-id",
  meituanPlugin: "seed-meituan-channel-plugin-id",
  douyinAccount: "seed-douyin-channel-account-id",
  meituanAccount: "seed-meituan-channel-account-id",
  douyinProductMapping: "seed-douyin-product-mapping-id",
  meituanProductMapping: "seed-meituan-product-mapping-id",
  slot: "seed-slot-id"
};

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "change-before-use", 10);
  await prisma.order.deleteMany({
    where: {
      brandId: seedIds.brand
    }
  });
  await prisma.brand.deleteMany({
    where: {
      slug: "yiyue-photo"
    }
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "yiyue-photo" },
    update: {
      name: "一悦照相馆"
    },
    create: {
      id: seedIds.brand,
      name: "一悦照相馆",
      slug: "yiyue-photo"
    }
  });

  const store = await prisma.store.upsert({
    where: { id: seedIds.store },
    update: {
      name: "威海智慧谷店",
      phone: "16620013461",
      address: "威海智慧谷商业区"
    },
    create: {
      id: seedIds.store,
      brandId: brand.id,
      name: "威海智慧谷店",
      phone: "16620013461",
      address: "威海智慧谷商业区"
    }
  });

  const staff = await prisma.staff.upsert({
    where: { id: "seed-staff-id" },
    update: {
      brandId: brand.id,
      storeId: store.id,
      name: "张三",
      phone: "16620010001",
      position: "摄影师",
      enabled: true
    },
    create: {
      id: "seed-staff-id",
      brandId: brand.id,
      storeId: store.id,
      name: "张三",
      phone: "16620010001",
      position: "摄影师"
    }
  });

  await prisma.user.upsert({
    where: { phone: "17863026867" },
    update: {},
    create: {
      brandId: brand.id,
      name: "文瑞",
      phone: "17863026867",
      passwordHash,
      role: "OWNER"
    }
  });

  const serviceGroup = await prisma.serviceGroup.upsert({
    where: { id: seedIds.serviceGroup },
    update: {
      name: "证件照预约",
      description: "证件照拍摄、修图、冲印基础服务组",
      slotMinutes: 30,
      capacityPerSlot: 2
    },
    create: {
      id: seedIds.serviceGroup,
      brandId: brand.id,
      storeId: store.id,
      name: "证件照预约",
      description: "证件照拍摄、修图、冲印基础服务组",
      slotMinutes: 30,
      capacityPerSlot: 2
    }
  });

  const product = await prisma.product.upsert({
    where: { id: seedIds.product },
    update: {
      name: "团购预约-定金20到店退",
      nickname: "证件照团购预约",
      selectionUnitPriceCents: 500,
      albumProductName: "精修入册",
      priceCents: 2000,
      durationMin: 30,
      enabled: true
    },
    create: {
      id: seedIds.product,
      brandId: brand.id,
      serviceGroupId: serviceGroup.id,
      type: "SERVICE",
      name: "团购预约-定金20到店退",
      nickname: "证件照团购预约",
      selectionUnitPriceCents: 500,
      albumProductName: "精修入册",
      priceCents: 2000,
      durationMin: 30
    }
  });

  await prisma.product.upsert({
    where: { id: seedIds.douyinProduct },
    update: {
      brandId: brand.id,
      serviceGroupId: serviceGroup.id,
      type: "DOUYIN",
      name: "抖音团购证件照套餐",
      nickname: "抖音渠道插件预留",
      externalCode: "DY-PHOTO-001",
      priceCents: 9900,
      durationMin: 30,
      selectionUnitPriceCents: 500,
      albumProductName: "抖音精修入册",
      enabled: true
    },
    create: {
      id: seedIds.douyinProduct,
      brandId: brand.id,
      serviceGroupId: serviceGroup.id,
      type: "DOUYIN",
      name: "抖音团购证件照套餐",
      nickname: "抖音渠道插件预留",
      externalCode: "DY-PHOTO-001",
      priceCents: 9900,
      durationMin: 30,
      selectionUnitPriceCents: 500,
      albumProductName: "抖音精修入册"
    }
  });

  await prisma.product.upsert({
    where: { id: seedIds.meituanProduct },
    update: {
      brandId: brand.id,
      serviceGroupId: serviceGroup.id,
      type: "MEITUAN",
      name: "美团核销证件照套餐",
      nickname: "美团核销工具预留",
      externalCode: "MT-PHOTO-001",
      priceCents: 10900,
      durationMin: 30,
      selectionUnitPriceCents: 500,
      albumProductName: "美团精修入册",
      enabled: true
    },
    create: {
      id: seedIds.meituanProduct,
      brandId: brand.id,
      serviceGroupId: serviceGroup.id,
      type: "MEITUAN",
      name: "美团核销证件照套餐",
      nickname: "美团核销工具预留",
      externalCode: "MT-PHOTO-001",
      priceCents: 10900,
      durationMin: 30,
      selectionUnitPriceCents: 500,
      albumProductName: "美团精修入册"
    }
  });

  const douyinPlugin = await prisma.channelPlugin.upsert({
    where: {
      brandId_channelType: {
        brandId: brand.id,
        channelType: "DOUYIN"
      }
    },
    update: {
      name: "抖音渠道插件",
      enabled: false,
      description: "抖店授权、订单列表 order.searchList、订单详情 order.orderDetail 的企业版接入骨架。"
    },
    create: {
      id: seedIds.douyinPlugin,
      brandId: brand.id,
      channelType: "DOUYIN",
      name: "抖音渠道插件",
      enabled: false,
      description: "抖店授权、订单列表 order.searchList、订单详情 order.orderDetail 的企业版接入骨架。"
    }
  });

  const meituanPlugin = await prisma.channelPlugin.upsert({
    where: {
      brandId_channelType: {
        brandId: brand.id,
        channelType: "MEITUAN"
      }
    },
    update: {
      name: "美团渠道插件",
      enabled: false,
      description: "美团核销工具接口待确认，先共用渠道插件授权、映射、同步日志模型。"
    },
    create: {
      id: seedIds.meituanPlugin,
      brandId: brand.id,
      channelType: "MEITUAN",
      name: "美团渠道插件",
      enabled: false,
      description: "美团核销工具接口待确认，先共用渠道插件授权、映射、同步日志模型。"
    }
  });

  const douyinAccount = await prisma.channelAccount.upsert({
    where: { id: seedIds.douyinAccount },
    update: {
      brandId: brand.id,
      pluginId: douyinPlugin.id,
      storeId: store.id,
      channelType: "DOUYIN",
      accountName: "抖音店铺授权待配置",
      appKey: null,
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      expiresAt: null,
      status: "NOT_AUTHORIZED",
      lastAuthorizedAt: null,
      lastSyncAt: null
    },
    create: {
      id: seedIds.douyinAccount,
      brandId: brand.id,
      pluginId: douyinPlugin.id,
      storeId: store.id,
      channelType: "DOUYIN",
      accountName: "抖音店铺授权待配置",
      status: "NOT_AUTHORIZED"
    }
  });

  const meituanAccount = await prisma.channelAccount.upsert({
    where: { id: seedIds.meituanAccount },
    update: {
      brandId: brand.id,
      pluginId: meituanPlugin.id,
      storeId: store.id,
      channelType: "MEITUAN",
      accountName: "美团核销授权待配置",
      appKey: null,
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      expiresAt: null,
      status: "NOT_AUTHORIZED",
      lastAuthorizedAt: null,
      lastSyncAt: null
    },
    create: {
      id: seedIds.meituanAccount,
      brandId: brand.id,
      pluginId: meituanPlugin.id,
      storeId: store.id,
      channelType: "MEITUAN",
      accountName: "美团核销授权待配置",
      status: "NOT_AUTHORIZED"
    }
  });

  await prisma.channelProductMapping.upsert({
    where: { id: seedIds.douyinProductMapping },
    update: {
      brandId: brand.id,
      pluginId: douyinPlugin.id,
      productId: seedIds.douyinProduct,
      channelType: "DOUYIN",
      externalProductId: "DY-PHOTO-001",
      externalSkuId: "DY-SKU-001",
      externalName: "抖音团购证件照套餐",
      enabled: true
    },
    create: {
      id: seedIds.douyinProductMapping,
      brandId: brand.id,
      pluginId: douyinPlugin.id,
      productId: seedIds.douyinProduct,
      channelType: "DOUYIN",
      externalProductId: "DY-PHOTO-001",
      externalSkuId: "DY-SKU-001",
      externalName: "抖音团购证件照套餐"
    }
  });

  await prisma.channelProductMapping.upsert({
    where: { id: seedIds.meituanProductMapping },
    update: {
      brandId: brand.id,
      pluginId: meituanPlugin.id,
      productId: seedIds.meituanProduct,
      channelType: "MEITUAN",
      externalProductId: "MT-PHOTO-001",
      externalSkuId: "MT-SKU-001",
      externalName: "美团核销证件照套餐",
      enabled: true
    },
    create: {
      id: seedIds.meituanProductMapping,
      brandId: brand.id,
      pluginId: meituanPlugin.id,
      productId: seedIds.meituanProduct,
      channelType: "MEITUAN",
      externalProductId: "MT-PHOTO-001",
      externalSkuId: "MT-SKU-001",
      externalName: "美团核销证件照套餐"
    }
  });

  await prisma.notificationTemplate.upsert({
    where: {
      brandId_key: {
        brandId: brand.id,
        key: "appointment_confirm"
      }
    },
    update: {
      content: "您好，您的预约 {{orderNo}} 已确认，时间 {{time}}。"
    },
    create: {
      brandId: brand.id,
      channel: "SMS",
      key: "appointment_confirm",
      name: "预约确认",
      content: "您好，您的预约 {{orderNo}} 已确认，时间 {{time}}。"
    }
  });

  await prisma.notificationTemplate.upsert({
    where: {
      brandId_key: {
        brandId: brand.id,
        key: "appointment_reminder"
      }
    },
    update: {
      content: "您好，您有一个预约将在 {{time}} 到达，请准时到店。"
    },
    create: {
      brandId: brand.id,
      channel: "SMS",
      key: "appointment_reminder",
      name: "预约提醒",
      content: "您好，您有一个预约将在 {{time}} 到达，请准时到店。"
    }
  });

  const customer = await prisma.customer.upsert({
    where: {
      brandId_phone: {
        brandId: brand.id,
        phone: "13800000000"
      }
    },
    update: {},
    create: {
      brandId: brand.id,
      name: "测试客户",
      phone: "13800000000",
      remark: "种子客户"
    }
  });

  const startsAt = new Date();
  startsAt.setHours(10, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

  const slot = await prisma.appointmentSlot.upsert({
    where: { id: seedIds.slot },
    update: {
      startsAt,
      endsAt,
      capacity: 2
    },
    create: {
      id: seedIds.slot,
      brandId: brand.id,
      storeId: store.id,
      serviceGroupId: serviceGroup.id,
      startsAt,
      endsAt,
      capacity: 2
    }
  });

  const order = await prisma.order.create({
    data: {
      orderNo: `YY${Date.now()}`,
      brandId: brand.id,
      storeId: store.id,
      staffId: staff.id,
      serviceGroupId: serviceGroup.id,
      slotId: slot.id,
      customerId: customer.id,
      scheduledAt: startsAt,
      source: "DOUYIN",
      bookingMethod: "ONLINE",
      paymentStatus: "PAID",
      totalCents: product.priceCents,
      remark: "种子预约订单",
      items: {
        create: {
          productId: product.id,
          name: product.name,
          quantity: 1,
          priceCents: product.priceCents
        }
      }
    }
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amountCents: product.priceCents,
      status: "PAID",
      channel: "seed",
      tradeNo: `SEED-${Date.now()}`,
      paidAt: new Date()
    }
  });

  await prisma.channelOrderMapping.upsert({
    where: {
      brandId_channelType_externalOrderId: {
        brandId: brand.id,
        channelType: "DOUYIN",
        externalOrderId: "DY202606010001"
      }
    },
    update: {
      pluginId: douyinPlugin.id,
      accountId: douyinAccount.id,
      orderId: order.id,
      externalStatus: "待确认",
      syncStatus: "LINKED",
      customerName: customer.name,
      customerPhone: customer.phone,
      productName: "抖音团购证件照套餐",
      amountCents: 9900,
      scheduledAt: startsAt,
      rawPayload: {
        method: "order.orderDetail",
        order_id: "DY202606010001",
        source: "mock"
      },
      lastSyncedAt: new Date()
    },
    create: {
      brandId: brand.id,
      pluginId: douyinPlugin.id,
      accountId: douyinAccount.id,
      orderId: order.id,
      channelType: "DOUYIN",
      externalOrderId: "DY202606010001",
      externalStatus: "待确认",
      syncStatus: "LINKED",
      customerName: customer.name,
      customerPhone: customer.phone,
      productName: "抖音团购证件照套餐",
      amountCents: 9900,
      scheduledAt: startsAt,
      rawPayload: {
        method: "order.orderDetail",
        order_id: "DY202606010001",
        source: "mock"
      },
      lastSyncedAt: new Date()
    }
  });

  await prisma.channelSyncLog.createMany({
    data: [
      {
        brandId: brand.id,
        pluginId: douyinPlugin.id,
        accountId: douyinAccount.id,
        channelType: "DOUYIN",
        apiName: "order.searchList",
        requestId: "seed-douyin-search-list",
        success: false,
        syncStatus: "SKIPPED",
        errorMessage: "抖音店铺未授权，当前仅预留接口骨架",
        durationMs: 0
      },
      {
        brandId: brand.id,
        pluginId: douyinPlugin.id,
        accountId: douyinAccount.id,
        channelType: "DOUYIN",
        apiName: "order.orderDetail",
        requestId: "seed-douyin-order-detail",
        success: false,
        syncStatus: "SKIPPED",
        errorMessage: "抖音店铺未授权，当前仅预留接口骨架",
        durationMs: 0
      },
      {
        brandId: brand.id,
        pluginId: meituanPlugin.id,
        accountId: meituanAccount.id,
        channelType: "MEITUAN",
        apiName: "meituan.todo",
        requestId: "seed-meituan-plugin",
        success: false,
        syncStatus: "SKIPPED",
        errorMessage: "美团接口文档待确认",
        durationMs: 0
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      brandId: brand.id,
      actor: "seed",
      action: "create",
      target: `order:${order.orderNo}`,
      detail: { source: "prisma seed" }
    }
  });

  await prisma.customerReview.create({
    data: {
      brandId: brand.id,
      customerId: customer.id,
      orderId: order.id,
      rating: 5,
      content: "服务不错，出片很快"
    }
  });

  await prisma.benefitRedemption.create({
    data: {
      brandId: brand.id,
      customerId: customer.id,
      orderId: order.id,
      channel: "团购",
      code: "RED-001",
      status: "REDEEMED",
      amountCents: product.priceCents,
      redeemedAt: new Date()
    }
  });

  const album = await prisma.photoAlbum.create({
    data: {
      brandId: brand.id,
      customerId: customer.id,
      orderId: order.id,
      title: "测试客户证件照选片",
      description: "种子客片相册，V1 使用照片 URL 或本地挂载路径。",
      status: "PUBLISHED",
      maxSelectCount: 2
    }
  });

  const asset = await prisma.photoAsset.create({
    data: {
      brandId: brand.id,
      albumId: album.id,
      fileName: "seed-photo-01.svg",
      url: "/placeholder-photo.svg",
      sortOrder: 0
    }
  });

  await prisma.photoSelection.create({
    data: {
      brandId: brand.id,
      albumId: album.id,
      assetId: asset.id,
      customerId: customer.id,
      note: "优先精修这一张"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
