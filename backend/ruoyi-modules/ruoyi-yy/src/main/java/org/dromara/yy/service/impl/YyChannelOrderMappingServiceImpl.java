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
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.bo.YyChannelOrderMappingBo;
import org.dromara.yy.domain.vo.YyChannelOrderMappingVo;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.service.IYyChannelOrderMappingService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道订单映射Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyChannelOrderMappingServiceImpl implements IYyChannelOrderMappingService {

    private final YyChannelOrderMappingMapper baseMapper;

    @Override
    public YyChannelOrderMappingVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyChannelOrderMappingVo> queryPageList(YyChannelOrderMappingBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelOrderMapping> lqw = buildQueryWrapper(bo);
        Page<YyChannelOrderMappingVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelOrderMappingVo> queryList(YyChannelOrderMappingBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyChannelOrderMapping> buildQueryWrapper(YyChannelOrderMappingBo bo) {
        LambdaQueryWrapper<YyChannelOrderMapping> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyChannelOrderMapping::getStoreId, bo.getStoreId());
        lqw.eq(bo.getOrderId() != null, YyChannelOrderMapping::getOrderId, bo.getOrderId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelOrderMapping::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getExternalOrderId()), YyChannelOrderMapping::getExternalOrderId, bo.getExternalOrderId());
        lqw.eq(StringUtils.isNotBlank(bo.getExternalStatus()), YyChannelOrderMapping::getExternalStatus, bo.getExternalStatus());
        lqw.eq(StringUtils.isNotBlank(bo.getSyncStatus()), YyChannelOrderMapping::getSyncStatus, bo.getSyncStatus());
        lqw.orderByDesc(YyChannelOrderMapping::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyChannelOrderMappingBo bo) {
        YyChannelOrderMapping add = BeanUtil.toBean(bo, YyChannelOrderMapping.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyChannelOrderMappingBo bo) {
        YyChannelOrderMapping update = BeanUtil.toBean(bo, YyChannelOrderMapping.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyChannelOrderMapping entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyChannelOrderMapping> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
