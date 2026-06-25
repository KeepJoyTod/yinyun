package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductCategory;
import org.dromara.yy.domain.bo.YyProductCategoryBo;
import org.dromara.yy.domain.vo.YyProductCategoryVo;
import org.dromara.yy.mapper.YyProductCategoryMapper;
import org.dromara.yy.service.IYyProductCategoryService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductCategoryServiceImpl implements IYyProductCategoryService {
    private final YyProductCategoryMapper baseMapper;

    @Override
    public YyProductCategoryVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductCategoryVo> queryPageList(YyProductCategoryBo bo, PageQuery pageQuery) {
        Page<YyProductCategoryVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductCategoryVo> queryList(YyProductCategoryBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductCategoryBo bo) {
        YyProductCategory add = BeanUtil.toBean(bo, YyProductCategory.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductCategoryBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductCategory.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductCategory> buildQueryWrapper(YyProductCategoryBo bo) {
        LambdaQueryWrapper<YyProductCategory> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getStoreId() != null, YyProductCategory::getStoreId, bo.getStoreId());
            lqw.like(StringUtils.isNotBlank(bo.getCategoryCode()), YyProductCategory::getCategoryCode, bo.getCategoryCode());
            lqw.like(StringUtils.isNotBlank(bo.getCategoryName()), YyProductCategory::getCategoryName, bo.getCategoryName());
            lqw.eq(bo.getParentId() != null, YyProductCategory::getParentId, bo.getParentId());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductCategory::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductCategory::getSort);
        lqw.orderByAsc(YyProductCategory::getId);
        return lqw;
    }
}
