package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductChannelConfig;
import org.dromara.yy.domain.bo.YyProductChannelConfigBo;
import org.dromara.yy.domain.vo.YyProductChannelConfigVo;
import org.dromara.yy.mapper.YyProductChannelConfigMapper;
import org.dromara.yy.service.IYyProductChannelConfigService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductChannelConfigServiceImpl implements IYyProductChannelConfigService {
    private final YyProductChannelConfigMapper baseMapper;

    @Override
    public YyProductChannelConfigVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductChannelConfigVo> queryPageList(YyProductChannelConfigBo bo, PageQuery pageQuery) {
        Page<YyProductChannelConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductChannelConfigVo> queryList(YyProductChannelConfigBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductChannelConfigBo bo) {
        YyProductChannelConfig add = BeanUtil.toBean(bo, YyProductChannelConfig.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductChannelConfigBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductChannelConfig.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductChannelConfig> buildQueryWrapper(YyProductChannelConfigBo bo) {
        LambdaQueryWrapper<YyProductChannelConfig> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductChannelConfig::getProductId, bo.getProductId());
            lqw.eq(bo.getChannelMappingId() != null, YyProductChannelConfig::getChannelMappingId, bo.getChannelMappingId());
            lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyProductChannelConfig::getChannelType, bo.getChannelType());
            lqw.like(StringUtils.isNotBlank(bo.getExternalProductId()), YyProductChannelConfig::getExternalProductId, bo.getExternalProductId());
            lqw.like(StringUtils.isNotBlank(bo.getExternalSkuId()), YyProductChannelConfig::getExternalSkuId, bo.getExternalSkuId());
            lqw.eq(StringUtils.isNotBlank(bo.getExternalPoiId()), YyProductChannelConfig::getExternalPoiId, bo.getExternalPoiId());
            lqw.eq(StringUtils.isNotBlank(bo.getMappingStatus()), YyProductChannelConfig::getMappingStatus, bo.getMappingStatus());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductChannelConfig::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductChannelConfig::getId);
        return lqw;
    }
}
