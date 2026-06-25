package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductDisplayConfig;
import org.dromara.yy.domain.bo.YyProductDisplayConfigBo;
import org.dromara.yy.domain.vo.YyProductDisplayConfigVo;
import org.dromara.yy.mapper.YyProductDisplayConfigMapper;
import org.dromara.yy.service.IYyProductDisplayConfigService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductDisplayConfigServiceImpl implements IYyProductDisplayConfigService {
    private final YyProductDisplayConfigMapper baseMapper;

    @Override
    public YyProductDisplayConfigVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductDisplayConfigVo> queryPageList(YyProductDisplayConfigBo bo, PageQuery pageQuery) {
        Page<YyProductDisplayConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductDisplayConfigVo> queryList(YyProductDisplayConfigBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductDisplayConfigBo bo) {
        YyProductDisplayConfig add = BeanUtil.toBean(bo, YyProductDisplayConfig.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductDisplayConfigBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductDisplayConfig.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductDisplayConfig> buildQueryWrapper(YyProductDisplayConfigBo bo) {
        LambdaQueryWrapper<YyProductDisplayConfig> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductDisplayConfig::getProductId, bo.getProductId());
            lqw.eq(StringUtils.isNotBlank(bo.getShowPlatform()), YyProductDisplayConfig::getShowPlatform, bo.getShowPlatform());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductDisplayConfig::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductDisplayConfig::getId);
        return lqw;
    }
}
