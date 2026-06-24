package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyNotificationLog;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.mapper.YyNotificationLogMapper;
import org.dromara.yy.service.IYyNotificationLogService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 通知发送日志Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyNotificationLogServiceImpl implements IYyNotificationLogService {

    private final YyNotificationLogMapper baseMapper;

    @Override
    public YyNotificationLogVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyNotificationLogVo> queryPageList(YyNotificationLogBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyNotificationLog> lqw = buildQueryWrapper(bo);
        Page<YyNotificationLogVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyNotificationLogVo> queryList(YyNotificationLogBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyNotificationLog> buildQueryWrapper(YyNotificationLogBo bo) {
        LambdaQueryWrapper<YyNotificationLog> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyNotificationLog::getStoreId, bo.getStoreId());
        lqw.eq(bo.getOrderId() != null, YyNotificationLog::getOrderId, bo.getOrderId());
        lqw.eq(bo.getCustomerId() != null, YyNotificationLog::getCustomerId, bo.getCustomerId());
        lqw.eq(bo.getTemplateId() != null, YyNotificationLog::getTemplateId, bo.getTemplateId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyNotificationLog::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getReceiver()), YyNotificationLog::getReceiver, bo.getReceiver());
        lqw.eq(StringUtils.isNotBlank(bo.getSendStatus()), YyNotificationLog::getSendStatus, bo.getSendStatus());
        lqw.like(StringUtils.isNotBlank(bo.getRequestId()), YyNotificationLog::getRequestId, bo.getRequestId());
        lqw.orderByDesc(YyNotificationLog::getCreateTime);
        lqw.orderByDesc(YyNotificationLog::getId);
        return lqw;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyNotificationLog> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
