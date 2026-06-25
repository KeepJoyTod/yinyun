package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductSku;
import org.dromara.yy.domain.bo.YyProductSkuBo;
import org.dromara.yy.domain.vo.YyProductSkuVo;
import org.dromara.yy.mapper.YyProductSkuMapper;
import org.dromara.yy.service.IYyProductSkuService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductSkuServiceImpl implements IYyProductSkuService {
    private final YyProductSkuMapper baseMapper;

    @Override
    public YyProductSkuVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductSkuVo> queryPageList(YyProductSkuBo bo, PageQuery pageQuery) {
        Page<YyProductSkuVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductSkuVo> queryList(YyProductSkuBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductSkuBo bo) {
        YyProductSku add = BeanUtil.toBean(bo, YyProductSku.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductSkuBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductSku.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductSku> buildQueryWrapper(YyProductSkuBo bo) {
        LambdaQueryWrapper<YyProductSku> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductSku::getProductId, bo.getProductId());
            lqw.like(StringUtils.isNotBlank(bo.getSpecName()), YyProductSku::getSpecName, bo.getSpecName());
            lqw.eq(StringUtils.isNotBlank(bo.getOnShow()), YyProductSku::getOnShow, bo.getOnShow());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductSku::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductSku::getSort);
        lqw.orderByAsc(YyProductSku::getId);
        return lqw;
    }
}
