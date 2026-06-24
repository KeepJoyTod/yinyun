package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyMerchantDecoration;
import org.dromara.yy.domain.bo.YyMerchantDecorationBo;
import org.dromara.yy.domain.vo.YyMerchantDecorationVo;
import org.dromara.yy.mapper.YyMerchantDecorationMapper;
import org.dromara.yy.service.IYyMerchantDecorationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Locale;
import java.util.UUID;

@Service
public class YyMerchantDecorationServiceImpl implements IYyMerchantDecorationService {

    private static final long TENANT_SCOPE_STORE_ID = 0L;
    private static final String DEFAULT_CHANNEL_TYPE = "WECHAT";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";

    private final YyMerchantDecorationMapper baseMapper;
    private final ObjectMapper objectMapper;

    @Autowired
    public YyMerchantDecorationServiceImpl(YyMerchantDecorationMapper baseMapper, ObjectMapper objectMapper) {
        this.baseMapper = baseMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public YyMerchantDecorationVo getCurrent(Long storeId, String channelType) {
        Long normalizedStoreId = normalizeStoreId(storeId);
        String normalizedChannelType = normalizeChannelType(channelType);
        YyMerchantDecoration existing = baseMapper.selectOne(Wrappers.<YyMerchantDecoration>lambdaQuery()
            .eq(YyMerchantDecoration::getStoreId, normalizedStoreId)
            .eq(YyMerchantDecoration::getChannelType, normalizedChannelType)
            .last("limit 1"));
        if (existing == null) {
            return defaultVo(normalizedStoreId, normalizedChannelType);
        }
        return ensureDefaults(BeanUtil.toBean(existing, YyMerchantDecorationVo.class));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMerchantDecorationVo saveDraft(YyMerchantDecorationBo bo) {
        YyMerchantDecoration entity = prepareForSave(bo, false);
        YyMerchantDecoration existing = findExisting(entity.getId(), entity.getStoreId(), entity.getChannelType());
        if (existing == null) {
            entity.setStatus(STATUS_DRAFT);
            entity.setPreviewToken(generatePreviewToken());
            baseMapper.insert(entity);
            return queryInserted(entity);
        }
        entity.setId(existing.getId());
        entity.setStatus(STATUS_DRAFT);
        entity.setPublishedAt(existing.getPublishedAt());
        entity.setPublishedConfigJson(existing.getPublishedConfigJson());
        entity.setPreviewToken(StringUtils.blankToDefault(existing.getPreviewToken(), generatePreviewToken()));
        baseMapper.updateById(entity);
        return getCurrent(entity.getStoreId(), entity.getChannelType());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyMerchantDecorationVo publish(YyMerchantDecorationBo bo) {
        YyMerchantDecoration entity = prepareForSave(bo, true);
        YyMerchantDecoration existing = findExisting(entity.getId(), entity.getStoreId(), entity.getChannelType());
        entity.setStatus(STATUS_PUBLISHED);
        entity.setPublishedAt(new Date());
        entity.setPublishedConfigJson(entity.getConfigJson());
        entity.setPreviewToken(existing == null ? generatePreviewToken() : StringUtils.blankToDefault(existing.getPreviewToken(), generatePreviewToken()));
        if (existing == null) {
            baseMapper.insert(entity);
            return queryInserted(entity);
        }
        entity.setId(existing.getId());
        baseMapper.updateById(entity);
        return getCurrent(entity.getStoreId(), entity.getChannelType());
    }

    private YyMerchantDecoration prepareForSave(YyMerchantDecorationBo bo, boolean publishing) {
        if (bo == null) {
            throw new ServiceException("decoration payload is required");
        }
        YyMerchantDecoration entity = BeanUtil.toBean(bo, YyMerchantDecoration.class);
        entity.setStoreId(normalizeStoreId(entity.getStoreId()));
        entity.setChannelType(normalizeChannelType(entity.getChannelType()));
        entity.setConfigJson(normalizeConfigJson(entity.getConfigJson()));
        entity.setStatus(publishing ? STATUS_PUBLISHED : STATUS_DRAFT);
        entity.setRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getRemark()), 0, 500));
        return entity;
    }

    private YyMerchantDecoration findExisting(Long id, Long storeId, String channelType) {
        if (id != null) {
            YyMerchantDecoration byId = baseMapper.selectById(id);
            if (byId != null) {
                return byId;
            }
        }
        return baseMapper.selectOne(Wrappers.<YyMerchantDecoration>lambdaQuery()
            .eq(YyMerchantDecoration::getStoreId, storeId)
            .eq(YyMerchantDecoration::getChannelType, channelType)
            .last("limit 1"));
    }

    private YyMerchantDecorationVo queryInserted(YyMerchantDecoration entity) {
        if (entity.getId() == null) {
            return getCurrent(entity.getStoreId(), entity.getChannelType());
        }
        return ensureDefaults(BeanUtil.toBean(entity, YyMerchantDecorationVo.class));
    }

    private YyMerchantDecorationVo ensureDefaults(YyMerchantDecorationVo vo) {
        vo.setStoreId(normalizeStoreId(vo.getStoreId()));
        vo.setChannelType(normalizeChannelType(vo.getChannelType()));
        if (StringUtils.isBlank(vo.getStatus())) {
            vo.setStatus(STATUS_DRAFT);
        }
        if (StringUtils.isBlank(vo.getConfigJson())) {
            vo.setConfigJson(defaultConfigJson());
        }
        if (StringUtils.isBlank(vo.getPreviewToken())) {
            vo.setPreviewToken(generatePreviewToken());
        }
        return vo;
    }

    private YyMerchantDecorationVo defaultVo(Long storeId, String channelType) {
        YyMerchantDecorationVo vo = new YyMerchantDecorationVo();
        vo.setStoreId(storeId);
        vo.setChannelType(channelType);
        vo.setStatus(STATUS_DRAFT);
        vo.setConfigJson(defaultConfigJson());
        vo.setPreviewToken(generatePreviewToken());
        return vo;
    }

    private Long normalizeStoreId(Long storeId) {
        return storeId == null || storeId < 0 ? TENANT_SCOPE_STORE_ID : storeId;
    }

    private String normalizeChannelType(String channelType) {
        String value = StringUtils.blankToDefault(channelType, DEFAULT_CHANNEL_TYPE).trim().toUpperCase(Locale.ROOT);
        if (!"WECHAT".equals(value)) {
            throw new ServiceException("Unsupported decoration channel: " + value);
        }
        return value;
    }

    private String normalizeConfigJson(String configJson) {
        String source = StringUtils.blankToDefault(StringUtils.trimToEmpty(configJson), defaultConfigJson());
        try {
            objectMapper.readTree(source);
            return source;
        } catch (Exception ex) {
            throw new ServiceException("configJson is invalid");
        }
    }

    private String defaultConfigJson() {
        return """
            {"theme":{"brandName":"","themeColor":"#F58235","shareTitle":"","shareDesc":"","shareIconUrl":""},"bookingFlow":{"home":{"currentHomepage":"DEFAULT","homepageTitle":""},"appointment":{"forceFollowWechat":false,"guideImageUrl":""},"category":{"showProductCategories":false},"product":{"listStyle":"grid","showRelatedProducts":false,"hotKeywords":""},"customer":{"needEmail":false,"needBirthday":false,"needIdCard":false,"needRemark":false,"remarkRequired":false,"remarkPlaceholder":"","customFields":[]},"confirm":{"orderNotice":"disabled","couponNotice":"disabled","serviceAgreement":false,"agreementMode":"modal","agreementContent":""}},"profileMenus":[],"bottomMenus":[],"watermark":{"enabled":false,"imageUrl":"","previewBackground":"light"},"platform":{"wechatMenuTemplates":[],"activeTemplate":"","syncStatus":"未同步"},"wechatMiniProgram":{"appId":"","callbackUrl":"","enabled":"","sdkStatus":"","miniProgramPath":""}}
            """.trim();
    }

    private String generatePreviewToken() {
        return "dec" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
    }
}
