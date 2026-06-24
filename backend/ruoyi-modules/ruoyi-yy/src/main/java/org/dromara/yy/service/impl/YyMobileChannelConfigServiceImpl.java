package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyMobileChannelConfig;
import org.dromara.yy.domain.bo.YyMobileChannelConfigBo;
import org.dromara.yy.domain.vo.YyMobileChannelConfigVo;
import org.dromara.yy.mapper.YyMobileChannelConfigMapper;
import org.dromara.yy.service.IYyMobileChannelConfigService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 多端预约入口配置Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyMobileChannelConfigServiceImpl implements IYyMobileChannelConfigService {

    private static final String SECRET_MASK = "******";

    private final YyMobileChannelConfigMapper baseMapper;

    @Override
    public YyMobileChannelConfigVo queryById(Long id) {
        return maskSecret(baseMapper.selectVoById(id));
    }

    @Override
    public TableDataInfo<YyMobileChannelConfigVo> queryPageList(YyMobileChannelConfigBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyMobileChannelConfig> lqw = buildQueryWrapper(bo);
        Page<YyMobileChannelConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        result.getRecords().forEach(this::maskSecret);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyMobileChannelConfigVo> queryList(YyMobileChannelConfigBo bo) {
        List<YyMobileChannelConfigVo> list = baseMapper.selectVoList(buildQueryWrapper(bo));
        list.forEach(this::maskSecret);
        return list;
    }

    private LambdaQueryWrapper<YyMobileChannelConfig> buildQueryWrapper(YyMobileChannelConfigBo bo) {
        LambdaQueryWrapper<YyMobileChannelConfig> lqw = Wrappers.lambdaQuery();
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyMobileChannelConfig::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getChannelName()), YyMobileChannelConfig::getChannelName, bo.getChannelName());
        lqw.eq(StringUtils.isNotBlank(bo.getEnabled()), YyMobileChannelConfig::getEnabled, bo.getEnabled());
        lqw.eq(StringUtils.isNotBlank(bo.getSdkStatus()), YyMobileChannelConfig::getSdkStatus, bo.getSdkStatus());
        lqw.orderByAsc(YyMobileChannelConfig::getChannelType);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyMobileChannelConfigBo bo) {
        YyMobileChannelConfig add = BeanUtil.toBean(bo, YyMobileChannelConfig.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyMobileChannelConfigBo bo) {
        YyMobileChannelConfig update = BeanUtil.toBean(bo, YyMobileChannelConfig.class);
        preserveSecret(update);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyMobileChannelConfig entity) {
        LambdaQueryWrapper<YyMobileChannelConfig> lqw = Wrappers.lambdaQuery();
        lqw.eq(YyMobileChannelConfig::getChannelType, entity.getChannelType());
        lqw.ne(entity.getId() != null, YyMobileChannelConfig::getId, entity.getId());
        if (baseMapper.selectCount(lqw) > 0) {
            throw new ServiceException("端类型已存在，请勿重复配置");
        }
    }

    private void preserveSecret(YyMobileChannelConfig update) {
        if (update.getId() == null) {
            return;
        }
        YyMobileChannelConfig existing = baseMapper.selectById(update.getId());
        if (existing == null) {
            return;
        }
        if (StringUtils.isBlank(update.getAppSecretEnc()) || SECRET_MASK.equals(update.getAppSecretEnc())) {
            update.setAppSecretEnc(existing.getAppSecretEnc());
        }
    }

    private YyMobileChannelConfigVo maskSecret(YyMobileChannelConfigVo vo) {
        if (vo == null) {
            return null;
        }
        vo.setAppSecretEnc(StringUtils.isBlank(vo.getAppSecretEnc()) ? "" : SECRET_MASK);
        return vo;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyMobileChannelConfig> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
