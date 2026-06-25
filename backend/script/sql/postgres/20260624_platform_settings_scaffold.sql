CREATE TABLE IF NOT EXISTS yy_platform_setting (
    id BIGINT NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(20) DEFAULT '000000',
    setting_key VARCHAR(128) NOT NULL,
    setting_name VARCHAR(128) DEFAULT '',
    setting_value TEXT,
    setting_status VARCHAR(32) DEFAULT 'SCAFFOLD',
    remark VARCHAR(500) DEFAULT '',
    create_dept BIGINT DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    create_time TIMESTAMP DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    update_time TIMESTAMP DEFAULT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_yy_platform_setting
    ON yy_platform_setting (tenant_id, setting_key);

COMMENT ON TABLE yy_platform_setting IS '影约云平台设置脚手架';
COMMENT ON COLUMN yy_platform_setting.setting_key IS '配置键';
COMMENT ON COLUMN yy_platform_setting.setting_status IS '状态 SCAFFOLD/READY/RETIRED';
