package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyMerchantReadinessItemVo;
import org.dromara.yy.service.IYyMerchantReadinessService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class YyMerchantReadinessServiceImpl implements IYyMerchantReadinessService {

    @Override
    public List<YyMerchantReadinessItemVo> summary() {
        List<YyMerchantReadinessItemVo> items = new ArrayList<>();
        items.addAll(schedule());
        items.addAll(channels());
        items.addAll(governance());
        items.addAll(dependencies());
        return items;
    }

    @Override
    public List<YyMerchantReadinessItemVo> schedule() {
        return List.of(item(
            "schedule-governance",
            "档期治理",
            "BLOCKED",
            "P0",
            List.of("B-016", "B-017", "X-013"),
            List.of(
                "节假日/临时关档仍缺真实规则账本和批量例外处理",
                "档期并发控制尚未落到版本号或行锁保护",
                "库存冲突只读视图已存在，但冲突生成与恢复策略未闭环"
            ),
            List.of(
                "补节假日模板、例外日期和临时关档契约",
                "在 yy_booking_slot_inventory 写链路接入并发抢占保护",
                "把冲突原因、释放策略和人工修复动作纳入库存 owner"
            ),
            List.of(
                "docs/product-function-inventory(产品功能清单).md:89",
                "docs/product-function-inventory(产品功能清单).md:90",
                "docs/product-function-inventory(产品功能清单).md:299"
            )
        ));
    }

    @Override
    public List<YyMerchantReadinessItemVo> channels() {
        return List.of(item(
            "channel-readiness",
            "渠道承接",
            "PARTIAL",
            "P1",
            List.of("B-026", "B-027", "B-045", "B-046"),
            List.of(
                "抖音产品已有入口，但开通、授权和商品映射仍需按插件状态验收",
                "美团产品与美团核销仍缺真实授权和核销适配层",
                "活动订单和表单订单只读承接已拆 owner，真实闭环仍依赖营销/表单后续写链路"
            ),
            List.of(
                "按 DOUYIN_LIFE 与 MEITUAN 分别收敛插件状态和授权证据",
                "补美团核销只读证据和失败原因归一化",
                "把活动订单、表单订单的 owner 和 yy_order 主账本关系固定到地图"
            ),
            List.of(
                "docs/product-function-inventory(产品功能清单).md:113",
                "docs/product-function-inventory(产品功能清单).md:114",
                "docs/product-function-inventory(产品功能清单).md:137",
                "docs/product-function-inventory(产品功能清单).md:138"
            )
        ));
    }

    @Override
    public List<YyMerchantReadinessItemVo> governance() {
        return List.of(item(
            "governance",
            "商家治理",
            "BUILDING",
            "P0",
            List.of("P-003", "P-004", "P-005", "P-006"),
            List.of(
                "RBAC 和数据范围仍需覆盖品牌、门店、服务组、本人订单和岗位工单",
                "高风险审批只有统一契约位，尚未接真实审批流",
                "操作审计可见但覆盖面仍需按退款、充值、提现、批量卡项和导出补齐"
            ),
            List.of(
                "把商户页权限、门店范围和 feature-scope 聚合到统一门禁",
                "为退款、提现、批量开卡、人工调整补审批状态来源",
                "把系统日志、渠道日志和业务动作证据统一挂到页面只读入口"
            ),
            List.of(
                "docs/product-function-inventory(产品功能清单).md:258",
                "docs/product-function-inventory(产品功能清单).md:259",
                "docs/product-function-inventory(产品功能清单).md:260",
                "docs/product-function-inventory(产品功能清单).md:261"
            )
        ));
    }

    @Override
    public List<YyMerchantReadinessItemVo> dependencies() {
        return List.of(item(
            "dependency-readiness",
            "直接依赖闭环",
            "PARTIAL",
            "P1",
            List.of("X-001", "X-002", "X-003", "X-004", "B-068", "B-069", "R-014", "R-015"),
            List.of(
                "订单、商品、服务生产已有 owner，但权益、储值、营销互斥和报表对账仍未形成统一验收面",
                "会员充值/提现、权益预占和核销明细仍缺完整审批、风控和财务对账闭环",
                "报表导出任务和财务对账报表仍需异步任务、脱敏、下载过期和第三方流水校验"
            ),
            List.of(
                "把订单、商品、服务生产、会员权益、营销、报表对账依赖列入 readiness 看板",
                "按 yy_order 主账本和 yy_booking_slot_inventory 容量账本确认依赖边界",
                "后续任务包逐个补真实接口、权限、审计、回滚和生产 smoke 证据"
            ),
            List.of(
                "docs/product-function-inventory(产品功能清单).md:180",
                "docs/product-function-inventory(产品功能清单).md:181",
                "docs/product-function-inventory(产品功能清单).md:248",
                "docs/product-function-inventory(产品功能清单).md:249",
                "docs/product-function-inventory(产品功能清单).md:287",
                "docs/product-function-inventory(产品功能清单).md:290"
            )
        ));
    }

    private YyMerchantReadinessItemVo item(
        String moduleKey,
        String moduleName,
        String status,
        String priority,
        List<String> sourceItems,
        List<String> blockers,
        List<String> nextActions,
        List<String> evidenceRefs
    ) {
        YyMerchantReadinessItemVo item = new YyMerchantReadinessItemVo();
        item.setModuleKey(moduleKey);
        item.setModuleName(moduleName);
        item.setStatus(status);
        item.setPriority(priority);
        item.setSourceItems(sourceItems);
        item.setBlockers(blockers);
        item.setNextActions(nextActions);
        item.setEvidenceRefs(evidenceRefs);
        return item;
    }
}
