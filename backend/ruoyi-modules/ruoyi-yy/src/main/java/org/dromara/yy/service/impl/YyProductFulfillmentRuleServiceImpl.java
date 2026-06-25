package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyProductFulfillmentRule;
import org.dromara.yy.domain.bo.YyProductFulfillmentRuleBo;
import org.dromara.yy.domain.vo.YyProductFulfillmentRuleVo;
import org.dromara.yy.mapper.YyProductFulfillmentRuleMapper;
import org.dromara.yy.service.IYyProductFulfillmentRuleService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductFulfillmentRuleServiceImpl implements IYyProductFulfillmentRuleService {
    private final YyProductFulfillmentRuleMapper baseMapper;

    @Override
    public YyProductFulfillmentRuleVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyProductFulfillmentRuleVo> queryPageList(YyProductFulfillmentRuleBo bo, PageQuery pageQuery) {
        Page<YyProductFulfillmentRuleVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyProductFulfillmentRuleVo> queryList(YyProductFulfillmentRuleBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyProductFulfillmentRuleBo bo) {
        YyProductFulfillmentRule add = BeanUtil.toBean(bo, YyProductFulfillmentRule.class);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyProductFulfillmentRuleBo bo) {
        return baseMapper.updateById(BeanUtil.toBean(bo, YyProductFulfillmentRule.class)) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyProductFulfillmentRule> buildQueryWrapper(YyProductFulfillmentRuleBo bo) {
        LambdaQueryWrapper<YyProductFulfillmentRule> lqw = Wrappers.lambdaQuery();
        if (bo != null) {
            lqw.eq(bo.getProductId() != null, YyProductFulfillmentRule::getProductId, bo.getProductId());
            lqw.eq(bo.getCollaborationConfigId() != null, YyProductFulfillmentRule::getCollaborationConfigId, bo.getCollaborationConfigId());
            lqw.eq(StringUtils.isNotBlank(bo.getWorkflowCode()), YyProductFulfillmentRule::getWorkflowCode, bo.getWorkflowCode());
            lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyProductFulfillmentRule::getStatus, bo.getStatus());
        }
        lqw.orderByAsc(YyProductFulfillmentRule::getId);
        return lqw;
    }
}
