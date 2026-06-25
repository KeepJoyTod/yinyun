CREATE TABLE IF NOT EXISTS yy_platform_setting (
    id BIGINT NOT NULL COMMENT '主键',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户编号',
    setting_key VARCHAR(128) NOT NULL COMMENT '配置键',
    setting_name VARCHAR(128) DEFAULT '' COMMENT '配置名称',
    setting_value TEXT COMMENT '配置值',
    setting_status VARCHAR(32) DEFAULT 'SCAFFOLD' COMMENT '状态 SCAFFOLD/READY/RETIRED',
    remark VARCHAR(500) DEFAULT '' COMMENT '备注',
    create_dept BIGINT DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT DEFAULT NULL COMMENT '创建者',
    create_time DATETIME DEFAULT NULL COMMENT '创建时间',
    update_by BIGINT DEFAULT NULL COMMENT '更新者',
    update_time DATETIME DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_yy_platform_setting (tenant_id, setting_key)
) COMMENT='影约云平台设置脚手架';
