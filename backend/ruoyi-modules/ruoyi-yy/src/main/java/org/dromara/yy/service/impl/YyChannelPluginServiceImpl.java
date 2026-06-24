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
import org.dromara.yy.domain.YyChannelPlugin;
import org.dromara.yy.domain.bo.YyChannelPluginBo;
import org.dromara.yy.domain.vo.YyChannelPluginVo;
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.service.IYyChannelPluginService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道插件Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyChannelPluginServiceImpl implements IYyChannelPluginService {

    private final YyChannelPluginMapper baseMapper;

    @Override
    public YyChannelPluginVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyChannelPluginVo> queryPageList(YyChannelPluginBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelPlugin> lqw = buildQueryWrapper(bo);
        Page<YyChannelPluginVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelPluginVo> queryList(YyChannelPluginBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyChannelPlugin> buildQueryWrapper(YyChannelPluginBo bo) {
        LambdaQueryWrapper<YyChannelPlugin> lqw = Wrappers.lambdaQuery();
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelPlugin::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getPluginName()), YyChannelPlugin::getPluginName, bo.getPluginName());
        lqw.eq(StringUtils.isNotBlank(bo.getEnabled()), YyChannelPlugin::getEnabled, bo.getEnabled());
        lqw.eq(StringUtils.isNotBlank(bo.getAuthStatus()), YyChannelPlugin::getAuthStatus, bo.getAuthStatus());
        lqw.orderByAsc(YyChannelPlugin::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyChannelPluginBo bo) {
        YyChannelPlugin add = BeanUtil.toBean(bo, YyChannelPlugin.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyChannelPluginBo bo) {
        YyChannelPlugin update = BeanUtil.toBean(bo, YyChannelPlugin.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyChannelPlugin entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyChannelPlugin> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
