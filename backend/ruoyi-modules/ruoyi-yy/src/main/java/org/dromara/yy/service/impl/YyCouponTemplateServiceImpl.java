package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyCouponGrantRecord;
import org.dromara.yy.domain.YyCouponInstance;
import org.dromara.yy.domain.YyCouponTemplate;
import org.dromara.yy.domain.YyCouponWriteoffRecord;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyCouponIssueBo;
import org.dromara.yy.domain.bo.YyCouponTemplateBo;
import org.dromara.yy.domain.vo.YyCouponGrantRecordVo;
import org.dromara.yy.domain.vo.YyCouponInstanceScaffoldVo;
import org.dromara.yy.domain.vo.YyCouponScaffoldVo;
import org.dromara.yy.domain.vo.YyCouponTemplateScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCouponGrantRecordVo;
import org.dromara.yy.domain.vo.YyMarketingCouponInstanceVo;
import org.dromara.yy.domain.vo.YyMarketingCouponTemplateVo;
import org.dromara.yy.domain.vo.YyMarketingCouponWriteoffVo;
import org.dromara.yy.mapper.YyCouponGrantRecordMapper;
import org.dromara.yy.mapper.YyCouponInstanceMapper;
import org.dromara.yy.mapper.YyCouponTemplateMapper;
import org.dromara.yy.mapper.YyCouponWriteoffRecordMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyCouponTemplateService;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class YyCouponTemplateServiceImpl implements IYyCouponTemplateService {

    private final YyCouponTemplateMapper couponTemplateMapper;
    private final YyCouponGrantRecordMapper couponGrantRecordMapper;
    private final YyCouponInstanceMapper couponInstanceMapper;
    private final YyCouponWriteoffRecordMapper couponWriteoffRecordMapper;
    private final YyCustomerMapper customerMapper;
    private final YyProductMapper productMapper;
    private final YyStoreMapper storeMapper;

    @Override
    public YyCouponScaffoldVo getCouponScaffold() {
        YyCouponScaffoldVo scaffold = new YyCouponScaffoldVo();
        scaffold.setStatus("ready");
        scaffold.setBoundary("营销券模板脚手架仅保留给 demoMode 与回归对照；真实模式请改用真实 list/create/update/issue 接口。");
        queryPageList(new YyCouponTemplateBo(), null).getRows().forEach(item -> {
            YyCouponTemplateScaffoldVo vo = new YyCouponTemplateScaffoldVo();
            vo.setTemplateId(String.valueOf(item.getTemplateId()));
            vo.setTemplateName(item.getTemplateName());
            vo.setTemplateType(item.getTemplateType());
            vo.setStatus(item.getStatus());
            vo.setStoreScopeLabel(item.getStoreScopeLabel());
            vo.setProductScopeLabel(item.getProductScopeLabel());
            vo.setFaceValueCent(item.getFaceValueCent());
            vo.setStackedWith(item.getStackPolicy());
            vo.setRestoreOnRefund(Boolean.TRUE.equals(item.getRestoreOnRefund()));
            vo.setIssuedCount(item.getIssuedCount());
            vo.setWriteoffCount(item.getWriteoffCount());
            vo.setExpiresAt(item.getEndAt());
            scaffold.getTemplates().add(vo);
        });
        listGrantRecords(null).stream().limit(10).forEach(item -> {
            YyCouponGrantRecordVo vo = new YyCouponGrantRecordVo();
            vo.setGrantId(String.valueOf(item.getGrantId()));
            vo.setTemplateId(String.valueOf(item.getTemplateId()));
            vo.setTemplateName(item.getTemplateName());
            vo.setTargetCustomer(item.getCustomerName());
            vo.setTargetMobile(item.getCustomerMobile());
            vo.setGrantSource(item.getIssueSource());
            vo.setStatus(item.getStatus());
            scaffold.getGrantRecords().add(vo);
        });
        listInstances(null).stream().limit(10).forEach(item -> {
            YyCouponInstanceScaffoldVo vo = new YyCouponInstanceScaffoldVo();
            vo.setInstanceId(String.valueOf(item.getInstanceId()));
            vo.setTemplateId(String.valueOf(item.getTemplateId()));
            vo.setTemplateName(item.getTemplateName());
            vo.setHolderName(item.getHolderName());
            vo.setStatus(item.getStatus());
            vo.setOrderId(item.getOrderId() == null ? null : String.valueOf(item.getOrderId()));
            vo.setExpiresAt(item.getExpiresAt());
            scaffold.getInstances().add(vo);
        });
        return scaffold;
    }

    @Override
    public TableDataInfo<YyMarketingCouponTemplateVo> queryPageList(YyCouponTemplateBo bo, PageQuery pageQuery) {
        List<YyMarketingCouponTemplateVo> list = couponTemplateMapper.selectList(Wrappers.lambdaQuery(YyCouponTemplate.class)
                .like(StringUtils.isNotBlank(bo == null ? null : bo.getTemplateName()), YyCouponTemplate::getTemplateName, bo.getTemplateName())
                .eq(StringUtils.isNotBlank(bo == null ? null : bo.getTemplateType()), YyCouponTemplate::getTemplateType, bo.getTemplateType())
                .eq(StringUtils.isNotBlank(bo == null ? null : bo.getStatus()), YyCouponTemplate::getStatus, bo.getStatus())
                .orderByDesc(YyCouponTemplate::getUpdateTime)
                .orderByDesc(YyCouponTemplate::getId))
            .stream()
            .map(this::toCouponTemplateVo)
            .filter(item -> bo == null || bo.getQueryStoreId() == null || item.getStoreIds().contains(bo.getQueryStoreId()))
            .toList();
        return pageQuery == null ? TableDataInfo.build(list) : TableDataInfo.build(list, pageQuery.build());
    }

    @Override
    public Boolean insertByBo(YyCouponTemplateBo bo) {
        YyCouponTemplate entity = BeanUtil.toBean(bo, YyCouponTemplate.class);
        fillCouponTemplateEntity(entity, bo);
        validTemplate(entity, bo);
        return couponTemplateMapper.insert(entity) > 0;
    }

    @Override
    public Boolean updateByBo(YyCouponTemplateBo bo) {
        YyCouponTemplate existing = requireTemplate(bo.getId());
        BeanUtil.copyProperties(bo, existing, "id", "tenantId", "createBy", "createTime");
        fillCouponTemplateEntity(existing, bo);
        validTemplate(existing, bo);
        return couponTemplateMapper.updateById(existing) > 0;
    }

    @Override
    public Boolean issueCoupons(Long templateId, YyCouponIssueBo bo) {
        YyCouponTemplate template = requireTemplate(templateId);
        int issueCount = Math.max(1, bo.getIssueCount() == null ? 1 : bo.getIssueCount());
        if (CollUtil.isEmpty(bo.getCustomerIds())) {
            throw new ServiceException("发券客户不能为空");
        }
        String batchCode = "GRANT-" + System.currentTimeMillis();
        for (Long customerId : bo.getCustomerIds()) {
            YyCouponGrantRecord grantRecord = new YyCouponGrantRecord();
            grantRecord.setTemplateId(template.getId());
            grantRecord.setCustomerId(customerId);
            grantRecord.setGrantBatchCode(batchCode);
            grantRecord.setGrantSource(bo.getIssueSource());
            grantRecord.setIssueCount(issueCount);
            grantRecord.setStatus("ISSUED");
            grantRecord.setRemark(StringUtils.defaultString(bo.getRemark()));
            couponGrantRecordMapper.insert(grantRecord);
            for (int i = 0; i < issueCount; i += 1) {
                YyCouponInstance instance = new YyCouponInstance();
                instance.setTemplateId(template.getId());
                instance.setCustomerId(customerId);
                instance.setInstanceCode(batchCode + "-" + customerId + "-" + i);
                instance.setStatus("UNUSED");
                instance.setRestoreStatus("NONE");
                instance.setExpiresAt(template.getEndAt());
                couponInstanceMapper.insert(instance);
            }
        }
        return true;
    }

    @Override
    public List<YyMarketingCouponGrantRecordVo> listGrantRecords(Long templateId) {
        Map<Long, YyCouponTemplate> templates = couponTemplateMapper.selectList(Wrappers.lambdaQuery(YyCouponTemplate.class)).stream()
            .collect(Collectors.toMap(YyCouponTemplate::getId, item -> item, (left, right) -> left));
        Map<Long, YyCustomer> customers = customerMapper.selectList(Wrappers.lambdaQuery(YyCustomer.class)).stream()
            .collect(Collectors.toMap(YyCustomer::getId, item -> item, (left, right) -> left));
        return couponGrantRecordMapper.selectList(Wrappers.lambdaQuery(YyCouponGrantRecord.class)
                .eq(templateId != null, YyCouponGrantRecord::getTemplateId, templateId)
                .orderByDesc(YyCouponGrantRecord::getCreateTime)
                .orderByDesc(YyCouponGrantRecord::getId))
            .stream()
            .map(item -> {
                YyMarketingCouponGrantRecordVo vo = new YyMarketingCouponGrantRecordVo();
                YyCouponTemplate template = templates.get(item.getTemplateId());
                YyCustomer customer = customers.get(item.getCustomerId());
                vo.setGrantId(item.getId());
                vo.setTemplateId(item.getTemplateId());
                vo.setTemplateName(template == null ? "" : template.getTemplateName());
                vo.setCustomerId(item.getCustomerId());
                vo.setCustomerName(customer == null ? "" : customer.getCustomerName());
                vo.setCustomerMobile(customer == null ? "" : customer.getMobile());
                vo.setIssueSource(item.getGrantSource());
                vo.setIssueCount(item.getIssueCount());
                vo.setStatus(item.getStatus());
                vo.setRemark(item.getRemark());
                vo.setCreateTime(item.getCreateTime());
                return vo;
            })
            .toList();
    }

    @Override
    public List<YyMarketingCouponInstanceVo> listInstances(Long templateId) {
        Map<Long, YyCouponTemplate> templates = couponTemplateMapper.selectList(Wrappers.lambdaQuery(YyCouponTemplate.class)).stream()
            .collect(Collectors.toMap(YyCouponTemplate::getId, item -> item, (left, right) -> left));
        Map<Long, YyCustomer> customers = customerMapper.selectList(Wrappers.lambdaQuery(YyCustomer.class)).stream()
            .collect(Collectors.toMap(YyCustomer::getId, item -> item, (left, right) -> left));
        return couponInstanceMapper.selectList(Wrappers.lambdaQuery(YyCouponInstance.class)
                .eq(templateId != null, YyCouponInstance::getTemplateId, templateId)
                .orderByDesc(YyCouponInstance::getCreateTime)
                .orderByDesc(YyCouponInstance::getId))
            .stream()
            .map(item -> {
                YyMarketingCouponInstanceVo vo = new YyMarketingCouponInstanceVo();
                YyCouponTemplate template = templates.get(item.getTemplateId());
                YyCustomer customer = customers.get(item.getCustomerId());
                vo.setInstanceId(item.getId());
                vo.setTemplateId(item.getTemplateId());
                vo.setTemplateName(template == null ? "" : template.getTemplateName());
                vo.setCustomerId(item.getCustomerId());
                vo.setHolderName(customer == null ? "" : customer.getCustomerName());
                vo.setStatus(item.getStatus());
                vo.setRestoreStatus(item.getRestoreStatus());
                vo.setOrderId(item.getOrderId());
                vo.setExpiresAt(item.getExpiresAt());
                return vo;
            })
            .toList();
    }

    @Override
    public List<YyMarketingCouponWriteoffVo> listWriteoffs(Long templateId) {
        List<YyCouponInstance> instances = couponInstanceMapper.selectList(Wrappers.lambdaQuery(YyCouponInstance.class)
            .eq(templateId != null, YyCouponInstance::getTemplateId, templateId));
        if (instances.isEmpty()) {
            return List.of();
        }
        Map<Long, YyCouponInstance> instanceMap = instances.stream()
            .collect(Collectors.toMap(YyCouponInstance::getId, item -> item, (left, right) -> left));
        Map<Long, YyCouponTemplate> templates = couponTemplateMapper.selectList(Wrappers.lambdaQuery(YyCouponTemplate.class)).stream()
            .collect(Collectors.toMap(YyCouponTemplate::getId, item -> item, (left, right) -> left));
        return couponWriteoffRecordMapper.selectList(Wrappers.lambdaQuery(YyCouponWriteoffRecord.class)
                .in(YyCouponWriteoffRecord::getInstanceId, instanceMap.keySet())
                .orderByDesc(YyCouponWriteoffRecord::getCreateTime)
                .orderByDesc(YyCouponWriteoffRecord::getId))
            .stream()
            .map(item -> {
                YyMarketingCouponWriteoffVo vo = new YyMarketingCouponWriteoffVo();
                YyCouponInstance instance = instanceMap.get(item.getInstanceId());
                YyCouponTemplate template = instance == null ? null : templates.get(instance.getTemplateId());
                vo.setWriteoffId(item.getId());
                vo.setInstanceId(item.getInstanceId());
                vo.setTemplateName(template == null ? "" : template.getTemplateName());
                vo.setOrderId(item.getOrderId());
                vo.setWriteoffAmountCent(item.getWriteoffAmountCent());
                vo.setRestoreStatus(item.getRestoreStatus());
                vo.setRestoreReason(item.getRestoreReason());
                vo.setCreateTime(item.getCreateTime());
                return vo;
            })
            .toList();
    }

    private YyMarketingCouponTemplateVo toCouponTemplateVo(YyCouponTemplate entity) {
        List<Long> storeIds = parseScope(entity.getStoreScope());
        List<Long> productIds = parseScope(entity.getProductScope());
        Map<Long, String> storeNames = storeMapper.selectByIds(storeIds).stream()
            .collect(Collectors.toMap(YyStore::getId, YyStore::getStoreName, (left, right) -> left));
        Map<Long, String> productNames = productMapper.selectByIds(productIds).stream()
            .collect(Collectors.toMap(YyProduct::getId, YyProduct::getProductName, (left, right) -> left));
        int issuedCount = couponGrantRecordMapper.selectList(Wrappers.lambdaQuery(YyCouponGrantRecord.class)
                .eq(YyCouponGrantRecord::getTemplateId, entity.getId()))
            .stream()
            .map(YyCouponGrantRecord::getIssueCount)
            .filter(Objects::nonNull)
            .mapToInt(Integer::intValue)
            .sum();
        int writeoffCount = couponWriteoffRecordMapper.selectList(Wrappers.lambdaQuery(YyCouponWriteoffRecord.class)
                .inSql(YyCouponWriteoffRecord::getInstanceId, "select id from yy_coupon_instance where template_id = " + entity.getId() + " and del_flag = '0'"))
            .size();
        YyMarketingCouponTemplateVo vo = new YyMarketingCouponTemplateVo();
        vo.setTemplateId(entity.getId());
        vo.setTemplateName(entity.getTemplateName());
        vo.setTemplateType(entity.getTemplateType());
        vo.setStatus(entity.getStatus());
        vo.setStoreIds(storeIds);
        vo.setProductIds(productIds);
        vo.setStoreScopeLabel(joinScopeLabel(storeIds, storeNames, "全部门店"));
        vo.setProductScopeLabel(joinScopeLabel(productIds, productNames, "全部商品"));
        vo.setFaceValueCent(defaultLong(entity.getFaceValueCent()));
        vo.setMinSpendCent(defaultLong(entity.getMinSpendCent()));
        vo.setStackPolicy(StringUtils.defaultIfBlank(entity.getStackedRule(), "COUPON_CODE_MUTEX"));
        vo.setRestoreOnRefund("1".equals(entity.getRestoreOnRefund()) || "true".equalsIgnoreCase(entity.getRestoreOnRefund()));
        vo.setIssuedCount(issuedCount);
        vo.setWriteoffCount(writeoffCount);
        vo.setStartAt(entity.getStartAt());
        vo.setEndAt(entity.getEndAt());
        return vo;
    }

    private void fillCouponTemplateEntity(YyCouponTemplate entity, YyCouponTemplateBo bo) {
        entity.setTemplateCode(entity.getId() == null ? "CPN-" + System.currentTimeMillis() : StringUtils.defaultIfBlank(entity.getTemplateCode(), "CPN-" + entity.getId()));
        entity.setStoreId(CollUtil.isEmpty(bo.getStoreIds()) ? null : bo.getStoreIds().get(0));
        entity.setStoreScope(joinScope(bo.getStoreIds()));
        entity.setProductScope(joinScope(bo.getProductIds()));
        entity.setMinSpendCent(defaultLong(bo.getMinSpendCent()));
        entity.setStackedRule(StringUtils.defaultIfBlank(bo.getStackPolicy(), "COUPON_CODE_MUTEX"));
        entity.setRestoreOnRefund(Boolean.TRUE.equals(bo.getRestoreOnRefund()) ? "1" : "0");
        entity.setStartAt(bo.getStartAt());
        entity.setEndAt(bo.getEndAt());
        entity.setStatus(StringUtils.defaultIfBlank(bo.getStatus(), "ACTIVE"));
        entity.setFaceValueCent(defaultLong(bo.getFaceValueCent()));
    }

    private void validTemplate(YyCouponTemplate entity, YyCouponTemplateBo bo) {
        if (entity.getFaceValueCent() <= 0L) {
            throw new ServiceException("券面额必须大于 0");
        }
        if (CollUtil.isEmpty(bo.getStoreIds()) || CollUtil.isEmpty(bo.getProductIds())) {
            throw new ServiceException("适用门店和商品不能为空");
        }
    }

    private YyCouponTemplate requireTemplate(Long id) {
        YyCouponTemplate template = couponTemplateMapper.selectById(id);
        if (template == null) {
            throw new ServiceException("券模板不存在");
        }
        return template;
    }

    private static String joinScope(List<Long> ids) {
        return ids == null ? "" : ids.stream().filter(Objects::nonNull).map(String::valueOf).collect(Collectors.joining(","));
    }

    private static List<Long> parseScope(String scope) {
        if (StringUtils.isBlank(scope)) return List.of();
        return Arrays.stream(scope.split(","))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .map(Long::valueOf)
            .toList();
    }

    private static String joinScopeLabel(List<Long> ids, Map<Long, String> names, String emptyLabel) {
        if (CollUtil.isEmpty(ids)) return emptyLabel;
        return ids.stream().map(id -> names.getOrDefault(id, String.valueOf(id))).collect(Collectors.joining("、"));
    }

    private static long defaultLong(Long value) {
        return value == null ? 0L : value;
    }
}
