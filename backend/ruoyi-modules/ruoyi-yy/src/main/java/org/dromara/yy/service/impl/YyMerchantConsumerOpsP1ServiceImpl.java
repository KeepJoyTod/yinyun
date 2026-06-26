package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyMerchantConsumerOpsP1ItemVo;
import org.dromara.yy.domain.vo.YyMerchantConsumerOpsP1OverviewVo;
import org.dromara.yy.service.IYyMerchantConsumerOpsP1Service;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class YyMerchantConsumerOpsP1ServiceImpl implements IYyMerchantConsumerOpsP1Service {

    @Override
    public YyMerchantConsumerOpsP1OverviewVo overview() {
        YyMerchantConsumerOpsP1OverviewVo vo = new YyMerchantConsumerOpsP1OverviewVo();
        vo.setTitle("P1 消费者体验与商户运营闭环脚手架");
        vo.setStatus("SCAFFOLD");
        vo.setUpdatedAt(LocalDate.now().toString());
        vo.setItems(List.of(
            item(
                "consumer-booking",
                "消费者预约增强",
                "SCAFFOLD",
                "MEDIUM",
                List.of("C-009", "C-011", "C-012", "C-013"),
                List.of("mobile-uniapp 商品详情页", "服务组/营销/会员资产既有 owner"),
                List.of("消费者端服务组选择", "自定义资料字段", "可用券/权益和不可用原因", "下单核销联动"),
                List.of("补下单前权益试算", "接预约配置字段", "接 serviceGroupId 到真实下单 payload"),
                List.of("docs/product-function-inventory(产品功能清单).md:44", "docs/product-function-inventory(产品功能清单).md:47")
            ),
            item(
                "consumer-assets",
                "消费者会员资产",
                "SCAFFOLD",
                "MEDIUM",
                List.of("C-024", "C-026", "C-027", "B-109"),
                List.of("mobile-uniapp 我的页", "工作台会员资产读侧"),
                List.of("消费者端会员卡/权益/积分/成长值/余额明细", "成长规则引擎", "退单回滚"),
                List.of("补消费者资产 API", "接成长规则和余额明细", "明确退款回滚策略"),
                List.of("docs/product-function-inventory(产品功能清单).md:59", "docs/product-function-inventory(产品功能清单).md:185")
            ),
            item(
                "consumer-aftercare",
                "核销通知与评价",
                "SCAFFOLD",
                "MEDIUM",
                List.of("C-019", "C-022", "C-028"),
                List.of("渠道核销排障页", "通知模板/日志", "评价报表空态"),
                List.of("消费者核销码展示", "下载触达与失败重试", "评价提交/审核/报表入账"),
                List.of("接订单状态下的核销码策略", "接通知发送 SDK", "新增真实评价账本或渠道评价 API"),
                List.of("docs/product-function-inventory(产品功能清单).md:54", "docs/product-function-inventory(产品功能清单).md:63")
            ),
            item(
                "merchant-config",
                "商户运营配置",
                "BUILDING",
                "MEDIUM",
                List.of("B-011", "B-013", "B-093", "B-094"),
                List.of("门店装修", "服务组管理", "资源域水印字段"),
                List.of("订单属性字段落库", "横纵服务模式调度", "个人中心配置联动", "水印全场景验收"),
                List.of("按配置域拆 owner", "补消费者端联动 smoke", "补资源下载水印证据"),
                List.of("docs/product-function-inventory(产品功能清单).md:86", "docs/product-function-inventory(产品功能清单).md:96")
            ),
            item(
                "merchant-order-ops",
                "订单运营动作",
                "BUILDING",
                "HIGH",
                List.of("B-030", "B-033", "B-039"),
                List.of("预约订单页", "订单打印弹窗", "店员录入预约"),
                List.of("导出权限/脱敏/任务记录", "保存并接待一键事务", "打印模板字段权限"),
                List.of("接异步任务中心", "补保存后开始服务事务", "补正式打印模板验收"),
                List.of("docs/product-function-inventory(产品功能清单).md:124", "docs/product-function-inventory(产品功能清单).md:133")
            ),
            item(
                "merchant-growth-coupons",
                "发券宝与角色成长",
                "SCAFFOLD",
                "MEDIUM",
                List.of("B-083", "B-088", "B-109"),
                List.of("营销券 owner", "角色权限矩阵", "会员资产读侧"),
                List.of("发券宝插件授权传播", "店长/店员模板维护", "成长值规则引擎"),
                List.of("补插件授权边界", "补角色模板映射", "补成长值获取/扣减/回滚规则"),
                List.of("docs/product-function-inventory(产品功能清单).md:205", "docs/product-function-inventory(产品功能清单).md:215")
            )
        ));
        vo.setDataLedgers(List.of(
            "yy_order",
            "yy_customer",
            "yy_booking_slot_inventory",
            "yy_coupon_template/instance/writeoff",
            "yy_member_*",
            "yy_notification_*",
            "yy_merchant_decoration",
            "yy_photo_*"
        ));
        vo.setDeliveryStandard(List.of(
            "P1 本包只完成 owner、API facade、后端只读骨架和地图文档。",
            "真实权益核销、支付退款、通知 SDK、评价账本、数据库迁移不在本包执行。",
            "后续每个 owner 必须补端到端验收、权限、审计和失败态。"
        ));
        return vo;
    }

    private YyMerchantConsumerOpsP1ItemVo item(
        String key,
        String name,
        String status,
        String risk,
        List<String> sourceItems,
        List<String> owners,
        List<String> missing,
        List<String> nextSteps,
        List<String> evidence
    ) {
        YyMerchantConsumerOpsP1ItemVo vo = new YyMerchantConsumerOpsP1ItemVo();
        vo.setItemKey(key);
        vo.setItemName(name);
        vo.setStatus(status);
        vo.setRisk(risk);
        vo.setSourceItems(sourceItems);
        vo.setExistingOwners(owners);
        vo.setMissingCapabilities(missing);
        vo.setNextSteps(nextSteps);
        vo.setEvidenceRefs(evidence);
        return vo;
    }
}
