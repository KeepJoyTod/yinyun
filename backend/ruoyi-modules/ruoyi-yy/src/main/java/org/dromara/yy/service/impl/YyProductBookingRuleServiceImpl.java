package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductBookingRule;
import org.dromara.yy.domain.bo.YyProductBookingRuleBo;
import org.dromara.yy.domain.vo.YyProductBookingRuleVo;
import org.dromara.yy.mapper.YyProductBookingRuleMapper;
import org.dromara.yy.service.IYyProductBookingRuleService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductBookingRuleServiceImpl implements IYyProductBookingRuleService {
    private final YyProductBookingRuleMapper baseMapper;

    @Override
    public YyProductBookingRuleVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductBookingRuleVo> queryPageList(YyProductBookingRuleBo bo, PageQuery pageQuery) {
        Page<YyProductBookingRuleVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductBookingRuleVo> queryList(YyProductBookingRuleBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductBookingRuleBo bo) {
        YyProductBookingRule add = BeanUtil.toBean(bo, YyProductBookingRule.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductBookingRuleBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductBookingRule.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductBookingRule> buildQueryWrapper(YyProductBookingRuleBo bo) {
        LambdaQueryWrapper<YyProductBookingRule> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductBookingRule::getProductId, bo.getProductId());
            lqw.eq(bo.getStoreId() != null, YyProductBookingRule::getStoreId, bo.getStoreId());
            lqw.eq(StringUtils.isNotBlank(bo.getPrepayMode()), YyProductBookingRule::getPrepayMode, bo.getPrepayMode());
            lqw.eq(StringUtils.isNotBlank(bo.getInventoryBindingStatus()), YyProductBookingRule::getInventoryBindingStatus, bo.getInventoryBindingStatus());
            lqw.eq(StringUtils.isNotBlank(bo.getBenefitBindingStatus()), YyProductBookingRule::getBenefitBindingStatus, bo.getBenefitBindingStatus());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductBookingRule::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductBookingRule::getId);
        return lqw;
    }
}
