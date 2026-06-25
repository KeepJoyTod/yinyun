package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductRelation;
import org.dromara.yy.domain.bo.YyProductRelationBo;
import org.dromara.yy.domain.vo.YyProductRelationVo;
import org.dromara.yy.mapper.YyProductRelationMapper;
import org.dromara.yy.service.IYyProductRelationService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductRelationServiceImpl implements IYyProductRelationService {
    private final YyProductRelationMapper baseMapper;

    @Override
    public YyProductRelationVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductRelationVo> queryPageList(YyProductRelationBo bo, PageQuery pageQuery) {
        Page<YyProductRelationVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductRelationVo> queryList(YyProductRelationBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductRelationBo bo) {
        YyProductRelation add = BeanUtil.toBean(bo, YyProductRelation.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductRelationBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductRelation.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductRelation> buildQueryWrapper(YyProductRelationBo bo) {
        LambdaQueryWrapper<YyProductRelation> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductRelation::getProductId, bo.getProductId());
            lqw.eq(bo.getTargetProductId() != null, YyProductRelation::getTargetProductId, bo.getTargetProductId());
            lqw.eq(StringUtils.isNotBlank(bo.getRelationType()), YyProductRelation::getRelationType, bo.getRelationType());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductRelation::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductRelation::getSort);
        lqw.orderByAsc(YyProductRelation::getId);
        return lqw;
    }
}
