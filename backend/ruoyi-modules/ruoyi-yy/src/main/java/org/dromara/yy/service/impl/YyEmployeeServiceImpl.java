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
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.bo.YyEmployeeBo;
import org.dromara.yy.domain.vo.YyEmployeeVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.service.IYyEmployeeService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 影约云员工Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyEmployeeServiceImpl implements IYyEmployeeService {

    private final YyEmployeeMapper baseMapper;

    @Override
    public YyEmployeeVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyEmployeeVo> queryPageList(YyEmployeeBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyEmployee> lqw = buildQueryWrapper(bo);
        Page<YyEmployeeVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyEmployeeVo> queryList(YyEmployeeBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyEmployee> buildQueryWrapper(YyEmployeeBo bo) {
        LambdaQueryWrapper<YyEmployee> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyEmployee::getStoreId, bo.getStoreId());
        lqw.eq(bo.getUserId() != null, YyEmployee::getUserId, bo.getUserId());
        lqw.eq(StringUtils.isNotBlank(bo.getEmployeeNo()), YyEmployee::getEmployeeNo, bo.getEmployeeNo());
        lqw.like(StringUtils.isNotBlank(bo.getEmployeeName()), YyEmployee::getEmployeeName, bo.getEmployeeName());
        lqw.like(StringUtils.isNotBlank(bo.getMobile()), YyEmployee::getMobile, bo.getMobile());
        lqw.eq(StringUtils.isNotBlank(bo.getRoleType()), YyEmployee::getRoleType, bo.getRoleType());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyEmployee::getStatus, bo.getStatus());
        lqw.orderByAsc(YyEmployee::getSort);
        lqw.orderByAsc(YyEmployee::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyEmployeeBo bo) {
        YyEmployee add = BeanUtil.toBean(bo, YyEmployee.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyEmployeeBo bo) {
        YyEmployee update = BeanUtil.toBean(bo, YyEmployee.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyEmployee entity) {
        // 预留员工编号唯一、系统账号绑定和门店隔离校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyEmployee> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
