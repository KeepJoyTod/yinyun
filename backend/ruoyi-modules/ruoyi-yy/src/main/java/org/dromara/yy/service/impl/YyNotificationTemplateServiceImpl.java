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
import org.dromara.yy.domain.YyNotificationTemplate;
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.mapper.YyNotificationTemplateMapper;
import org.dromara.yy.service.IYyNotificationTemplateService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 通知模板Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyNotificationTemplateServiceImpl implements IYyNotificationTemplateService {

    private final YyNotificationTemplateMapper baseMapper;

    @Override
    public YyNotificationTemplateVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyNotificationTemplateVo> queryPageList(YyNotificationTemplateBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyNotificationTemplate> lqw = buildQueryWrapper(bo);
        Page<YyNotificationTemplateVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyNotificationTemplateVo> queryList(YyNotificationTemplateBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyNotificationTemplate> buildQueryWrapper(YyNotificationTemplateBo bo) {
        LambdaQueryWrapper<YyNotificationTemplate> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(bo.getTemplateCode()), YyNotificationTemplate::getTemplateCode, bo.getTemplateCode());
        lqw.like(StringUtils.isNotBlank(bo.getScene()), YyNotificationTemplate::getScene, bo.getScene());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyNotificationTemplate::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getTitle()), YyNotificationTemplate::getTitle, bo.getTitle());
        lqw.eq(StringUtils.isNotBlank(bo.getEnabled()), YyNotificationTemplate::getEnabled, bo.getEnabled());
        lqw.orderByDesc(YyNotificationTemplate::getUpdateTime);
        lqw.orderByAsc(YyNotificationTemplate::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyNotificationTemplateBo bo) {
        YyNotificationTemplate add = BeanUtil.toBean(bo, YyNotificationTemplate.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyNotificationTemplateBo bo) {
        YyNotificationTemplate update = BeanUtil.toBean(bo, YyNotificationTemplate.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyNotificationTemplate entity) {
        // 预留模板编码唯一、渠道授权和服务商模板校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyNotificationTemplate> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
