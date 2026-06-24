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
import org.dromara.yy.domain.YyReportSnapshot;
import org.dromara.yy.domain.bo.YyReportSnapshotBo;
import org.dromara.yy.domain.vo.YyReportSnapshotVo;
import org.dromara.yy.mapper.YyReportSnapshotMapper;
import org.dromara.yy.service.IYyReportSnapshotService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

/**
 * 经营报表快照Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyReportSnapshotServiceImpl implements IYyReportSnapshotService {

    private final YyReportSnapshotMapper baseMapper;

    @Override
    public YyReportSnapshotVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyReportSnapshotVo> queryPageList(YyReportSnapshotBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyReportSnapshot> lqw = buildQueryWrapper(bo);
        Page<YyReportSnapshotVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyReportSnapshotVo> queryList(YyReportSnapshotBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyReportSnapshot> buildQueryWrapper(YyReportSnapshotBo bo) {
        LambdaQueryWrapper<YyReportSnapshot> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyReportSnapshot::getStoreId, bo.getStoreId());
        lqw.eq(bo.getReportDate() != null, YyReportSnapshot::getReportDate, bo.getReportDate());
        lqw.eq(StringUtils.isNotBlank(bo.getReportType()), YyReportSnapshot::getReportType, bo.getReportType());
        lqw.orderByDesc(YyReportSnapshot::getReportDate);
        lqw.orderByAsc(YyReportSnapshot::getStoreId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyReportSnapshotBo bo) {
        YyReportSnapshot add = BeanUtil.toBean(bo, YyReportSnapshot.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyReportSnapshotBo bo) {
        YyReportSnapshot update = BeanUtil.toBean(bo, YyReportSnapshot.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyReportSnapshot entity) {
        normalizeNumbers(entity);
        if (entity.getCompletedTotal() > entity.getOrderTotal()) {
            throw new ServiceException("完成数不能大于订单总数");
        }
        if (entity.getArrivedTotal() > entity.getOrderTotal()) {
            throw new ServiceException("到店数不能大于订单总数");
        }
    }

    private void normalizeNumbers(YyReportSnapshot entity) {
        entity.setReportType(StringUtils.blankToDefault(entity.getReportType(), "DAILY"));
        entity.setOrderTotal(nonNegative(entity.getOrderTotal()));
        entity.setArrivedTotal(nonNegative(entity.getArrivedTotal()));
        entity.setCompletedTotal(nonNegative(entity.getCompletedTotal()));
        entity.setRevenueTotal(nonNegative(entity.getRevenueTotal()));
        entity.setSelectionTotal(nonNegative(entity.getSelectionTotal()));
    }

    private Integer nonNegative(Integer value) {
        return Math.max(value == null ? 0 : value, 0);
    }

    private BigDecimal nonNegative(BigDecimal value) {
        return value == null || value.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : value;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyReportSnapshot> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
