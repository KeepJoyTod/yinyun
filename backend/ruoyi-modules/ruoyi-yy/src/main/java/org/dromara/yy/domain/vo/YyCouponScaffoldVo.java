package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class YyCouponScaffoldVo {

    private String status;

    private String boundary;

    private List<YyCouponTemplateScaffoldVo> templates = new ArrayList<>();

    private List<YyCouponGrantRecordVo> grantRecords = new ArrayList<>();

    private List<YyCouponInstanceScaffoldVo> instances = new ArrayList<>();
}
