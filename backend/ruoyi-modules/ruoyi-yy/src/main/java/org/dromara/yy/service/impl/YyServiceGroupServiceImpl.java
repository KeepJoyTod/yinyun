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
import org.dromara.yy.domain.YyServiceGroup;
import org.dromara.yy.domain.bo.YyServiceGroupBo;
import org.dromara.yy.domain.vo.YyServiceGroupVo;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.dromara.yy.service.IYyServiceGroupService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 影约云服务组Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyServiceGroupServiceImpl implements IYyServiceGroupService {

    private static final Set<String> ALLOWED_SERVICE_MODES = Set.of("HORIZONTAL", "VERTICAL");

    private final YyServiceGroupMapper baseMapper;

    @Override
    public YyServiceGroupVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyServiceGroupVo> queryPageList(YyServiceGroupBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyServiceGroup> lqw = buildQueryWrapper(bo);
        Page<YyServiceGroupVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyServiceGroupVo> queryList(YyServiceGroupBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyServiceGroup> buildQueryWrapper(YyServiceGroupBo bo) {
        LambdaQueryWrapper<YyServiceGroup> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyServiceGroup::getStoreId, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getGroupCode()), YyServiceGroup::getGroupCode, bo.getGroupCode());
        lqw.like(StringUtils.isNotBlank(bo.getGroupName()), YyServiceGroup::getGroupName, bo.getGroupName());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyServiceGroup::getStatus, bo.getStatus());
        lqw.orderByAsc(YyServiceGroup::getSort);
        lqw.orderByAsc(YyServiceGroup::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyServiceGroupBo bo) {
        YyServiceGroup add = BeanUtil.toBean(bo, YyServiceGroup.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyServiceGroupBo bo) {
        YyServiceGroup update = BeanUtil.toBean(bo, YyServiceGroup.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyServiceGroup entity) {
        entity.setServiceMode(StringUtils.defaultIfBlank(entity.getServiceMode(), "HORIZONTAL").trim().toUpperCase(Locale.ROOT));
        if (!ALLOWED_SERVICE_MODES.contains(entity.getServiceMode())) {
            throw new ServiceException("服务模式不支持");
        }
        // 预留容量、唯一编码和门店隔离校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyServiceGroup> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
