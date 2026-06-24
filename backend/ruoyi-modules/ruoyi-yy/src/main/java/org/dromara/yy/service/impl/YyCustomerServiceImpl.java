package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyCustomerBo;
import org.dromara.yy.domain.vo.YyCustomerVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.service.IYyCustomerService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * 影约云客户Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyCustomerServiceImpl implements IYyCustomerService {

    private final YyCustomerMapper baseMapper;
    private final IdentifierGenerator identifierGenerator;
    private final YyOrderMapper orderMapper;

    @Override
    public YyCustomerVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyCustomerVo> queryPageList(YyCustomerBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyCustomer> lqw = buildQueryWrapper(bo);
        Page<YyCustomerVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyCustomerVo> queryList(YyCustomerBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyCustomer> buildQueryWrapper(YyCustomerBo bo) {
        LambdaQueryWrapper<YyCustomer> lqw = Wrappers.lambdaQuery();
        lqw.and(StringUtils.isNotBlank(bo.getKeyword()), wrapper -> wrapper
            .like(YyCustomer::getCustomerName, bo.getKeyword())
            .or()
            .like(YyCustomer::getMobile, bo.getKeyword())
            .or()
            .like(YyCustomer::getTags, bo.getKeyword())
            .or()
            .like(YyCustomer::getRemark, bo.getKeyword()));
        lqw.like(StringUtils.isNotBlank(bo.getCustomerName()), YyCustomer::getCustomerName, bo.getCustomerName());
        lqw.like(StringUtils.isNotBlank(bo.getMobile()), YyCustomer::getMobile, bo.getMobile());
        lqw.eq(StringUtils.isNotBlank(bo.getSource()), YyCustomer::getSource, bo.getSource());
        lqw.eq(StringUtils.isNotBlank(bo.getMemberLevel()), YyCustomer::getMemberLevel, bo.getMemberLevel());
        lqw.like(StringUtils.isNotBlank(bo.getTags()), YyCustomer::getTags, bo.getTags());
        lqw.orderByDesc(YyCustomer::getLastOrderTime);
        lqw.orderByDesc(YyCustomer::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyCustomerBo bo) {
        YyCustomer add = BeanUtil.toBean(bo, YyCustomer.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyCustomerBo bo) {
        YyCustomer update = BeanUtil.toBean(bo, YyCustomer.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    public Long upsertByMobile(String customerName, String mobile, String source, BigDecimal spend, Date orderTime, String remark) {
        if (StringUtils.isBlank(mobile)) {
            return null;
        }
        YyCustomer entity = baseMapper.selectOne(Wrappers.<YyCustomer>lambdaQuery()
            .eq(YyCustomer::getMobile, mobile)
            .orderByDesc(YyCustomer::getId)
            .last("limit 1"));
        BigDecimal safeSpend = spend == null ? BigDecimal.ZERO : spend;
        Date safeOrderTime = orderTime == null ? new Date() : orderTime;
        if (entity == null) {
            entity = new YyCustomer();
            entity.setId(nextLongId());
            entity.setCustomerName(StringUtils.isNotBlank(customerName) ? customerName : "影约云客户");
            entity.setMobile(mobile);
            entity.setGender("0");
            entity.setSource(StringUtils.isNotBlank(source) ? source : "LOCAL");
            entity.setMemberLevel("NORMAL");
            entity.setTotalOrderCount(1);
            entity.setTotalSpend(safeSpend);
            entity.setLastOrderTime(safeOrderTime);
            entity.setTags("");
            entity.setRemark(StringUtils.isNotBlank(remark) ? remark : "");
            baseMapper.insert(entity);
            return entity.getId();
        }
        entity.setCustomerName(StringUtils.isNotBlank(customerName) ? customerName : entity.getCustomerName());
        entity.setSource(StringUtils.isNotBlank(source) ? source : entity.getSource());
        entity.setMemberLevel(StringUtils.isNotBlank(entity.getMemberLevel()) ? entity.getMemberLevel() : "NORMAL");
        entity.setTotalOrderCount((entity.getTotalOrderCount() == null ? 0 : entity.getTotalOrderCount()) + 1);
        entity.setTotalSpend((entity.getTotalSpend() == null ? BigDecimal.ZERO : entity.getTotalSpend()).add(safeSpend));
        entity.setLastOrderTime(safeOrderTime);
        if (StringUtils.isNotBlank(remark)) {
            entity.setRemark(remark);
        }
        baseMapper.updateById(entity);
        return entity.getId();
    }

    private Long nextLongId() {
        return identifierGenerator.nextId(null).longValue();
    }

    private void validEntityBeforeSave(YyCustomer entity) {
        // 预留手机号唯一性、客户等级、标签规则等校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyCustomer> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public List<YyOrderVo> queryRecentOrdersByCustomerId(Long customerId, int limit) {
        if (customerId == null || limit <= 0) {
            return List.of();
        }
        YyCustomer customer = baseMapper.selectById(customerId);
        if (customer == null || StringUtils.isBlank(customer.getMobile())) {
            return List.of();
        }
        return orderMapper.selectVoList(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getCustomerPhone, customer.getMobile())
            .orderByDesc(YyOrder::getArrivalTime)
            .orderByDesc(YyOrder::getId)
            .last("limit " + limit));
    }
}
