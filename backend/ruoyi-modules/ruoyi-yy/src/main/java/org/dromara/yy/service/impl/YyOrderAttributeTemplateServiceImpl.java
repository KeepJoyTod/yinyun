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
import org.dromara.yy.domain.YyOrderAttributeTemplate;
import org.dromara.yy.domain.bo.YyOrderAttributeTemplateBo;
import org.dromara.yy.domain.vo.YyOrderAttributeTemplateVo;
import org.dromara.yy.mapper.YyOrderAttributeTemplateMapper;
import org.dromara.yy.service.IYyOrderAttributeTemplateService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class YyOrderAttributeTemplateServiceImpl implements IYyOrderAttributeTemplateService {

    private static final Set<String> ALLOWED_FIELD_TYPES = Set.of(
        "TEXT", "TEXTAREA", "PHONE", "DATE", "NUMBER", "SELECT", "CHECKBOX"
    );

    private final YyOrderAttributeTemplateMapper baseMapper;

    @Override
    public YyOrderAttributeTemplateVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyOrderAttributeTemplateVo> queryPageList(YyOrderAttributeTemplateBo bo, PageQuery pageQuery) {
        Page<YyOrderAttributeTemplateVo> result = baseMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyOrderAttributeTemplateVo> queryList(YyOrderAttributeTemplateBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(YyOrderAttributeTemplateBo bo) {
        YyOrderAttributeTemplate add = BeanUtil.toBean(bo, YyOrderAttributeTemplate.class);
        normalizeBeforeSave(add, null);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyOrderAttributeTemplateBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("订单属性模板ID不能为空");
        }
        YyOrderAttributeTemplate existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("订单属性模板不存在");
        }
        YyOrderAttributeTemplate update = BeanUtil.toBean(bo, YyOrderAttributeTemplate.class);
        normalizeBeforeSave(update, existing);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyOrderAttributeTemplate> rows = baseMapper.selectByIds(ids);
            if (rows.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private LambdaQueryWrapper<YyOrderAttributeTemplate> buildQueryWrapper(YyOrderAttributeTemplateBo bo) {
        LambdaQueryWrapper<YyOrderAttributeTemplate> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            lqw.orderByAsc(YyOrderAttributeTemplate::getSort);
            lqw.orderByAsc(YyOrderAttributeTemplate::getId);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyOrderAttributeTemplate::getStoreId, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getFieldCode()), YyOrderAttributeTemplate::getFieldCode, StringUtils.trim(bo.getFieldCode()));
        lqw.like(StringUtils.isNotBlank(bo.getFieldLabel()), YyOrderAttributeTemplate::getFieldLabel, StringUtils.trim(bo.getFieldLabel()));
        lqw.eq(StringUtils.isNotBlank(bo.getFieldType()), YyOrderAttributeTemplate::getFieldType, StringUtils.trim(bo.getFieldType()).toUpperCase(Locale.ROOT));
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyOrderAttributeTemplate::getStatus, StringUtils.trim(bo.getStatus()).toUpperCase(Locale.ROOT));
        lqw.orderByAsc(YyOrderAttributeTemplate::getSort);
        lqw.orderByAsc(YyOrderAttributeTemplate::getId);
        return lqw;
    }

    private void normalizeBeforeSave(YyOrderAttributeTemplate entity, YyOrderAttributeTemplate existing) {
        entity.setStoreId(entity.getStoreId() == null ? existing == null ? null : existing.getStoreId() : entity.getStoreId());
        entity.setFieldCode(StringUtils.substring(StringUtils.trimToEmpty(entity.getFieldCode()), 0, 64));
        entity.setFieldLabel(StringUtils.substring(StringUtils.trimToEmpty(entity.getFieldLabel()), 0, 64));
        entity.setFieldType(StringUtils.trimToEmpty(entity.getFieldType()).toUpperCase(Locale.ROOT));
        entity.setRequired("1".equals(StringUtils.trimToEmpty(entity.getRequired())) ? "1" : "0");
        entity.setStatus(StringUtils.defaultIfBlank(StringUtils.trimToEmpty(entity.getStatus()).toUpperCase(Locale.ROOT), "ACTIVE"));
        entity.setSort(entity.getSort() == null ? 0 : entity.getSort());
        entity.setOptionsJson(StringUtils.defaultString(entity.getOptionsJson(), ""));
        entity.setRemark(StringUtils.substring(StringUtils.trimToEmpty(entity.getRemark()), 0, 500));
        if (entity.getStoreId() == null || StringUtils.isBlank(entity.getFieldCode()) || StringUtils.isBlank(entity.getFieldLabel())) {
            throw new ServiceException("门店、字段编码、字段名称不能为空");
        }
        if (!ALLOWED_FIELD_TYPES.contains(entity.getFieldType())) {
            throw new ServiceException("订单属性字段类型不支持");
        }
    }
}
