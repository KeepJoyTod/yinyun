CREATE TABLE IF NOT EXISTS yy_member_account (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  member_no VARCHAR(64) DEFAULT '',
  current_level VARCHAR(32) DEFAULT 'NORMAL',
  points_balance INT DEFAULT 0,
  growth_value INT DEFAULT 0,
  balance_amount NUMERIC(12,2) DEFAULT 0.00,
  pending_recharge_count INT DEFAULT 0,
  last_trade_time TIMESTAMP,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP,
  CONSTRAINT uk_yy_member_account_customer UNIQUE (tenant_id, customer_id, del_flag)
);
CREATE INDEX IF NOT EXISTS idx_yy_member_account_store ON yy_member_account (tenant_id, store_id, status);

CREATE TABLE IF NOT EXISTS yy_member_card_instance (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  order_id BIGINT,
  card_name VARCHAR(128) NOT NULL,
  card_type VARCHAR(32) DEFAULT 'COUNT_CARD',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  total_quota NUMERIC(12,2) DEFAULT 0.00,
  used_quota NUMERIC(12,2) DEFAULT 0.00,
  remaining_quota NUMERIC(12,2) DEFAULT 0.00,
  balance_amount NUMERIC(12,2) DEFAULT 0.00,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_yy_member_card_customer ON yy_member_card_instance (tenant_id, customer_id, status);
CREATE INDEX IF NOT EXISTS idx_yy_member_card_order ON yy_member_card_instance (tenant_id, order_id);

CREATE TABLE IF NOT EXISTS yy_member_benefit_ledger (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  benefit_name VARCHAR(128) NOT NULL,
  benefit_type VARCHAR(32) DEFAULT 'COUPON_BUNDLE',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  total_amount NUMERIC(12,2) DEFAULT 0.00,
  used_amount NUMERIC(12,2) DEFAULT 0.00,
  remaining_amount NUMERIC(12,2) DEFAULT 0.00,
  source_type VARCHAR(32) DEFAULT 'MANUAL',
  source_id BIGINT,
  expire_time TIMESTAMP,
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_yy_member_benefit_customer ON yy_member_benefit_ledger (tenant_id, customer_id, status);
CREATE INDEX IF NOT EXISTS idx_yy_member_benefit_source ON yy_member_benefit_ledger (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS yy_member_points_ledger (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  change_type VARCHAR(32) DEFAULT 'MANUAL_ADD',
  change_amount INT DEFAULT 0,
  balance_after INT DEFAULT 0,
  source_type VARCHAR(32) DEFAULT 'MANUAL',
  source_id BIGINT,
  happened_at TIMESTAMP,
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_yy_member_points_customer ON yy_member_points_ledger (tenant_id, customer_id, happened_at);
CREATE INDEX IF NOT EXISTS idx_yy_member_points_source ON yy_member_points_ledger (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS yy_member_growth_ledger (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  change_type VARCHAR(32) DEFAULT 'MANUAL_ADD',
  change_amount INT DEFAULT 0,
  balance_after INT DEFAULT 0,
  source_type VARCHAR(32) DEFAULT 'MANUAL',
  source_id BIGINT,
  happened_at TIMESTAMP,
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_yy_member_growth_customer ON yy_member_growth_ledger (tenant_id, customer_id, happened_at);
CREATE INDEX IF NOT EXISTS idx_yy_member_growth_source ON yy_member_growth_ledger (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS yy_member_balance_ledger (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  change_type VARCHAR(32) DEFAULT 'MANUAL_RECHARGE',
  change_amount NUMERIC(12,2) DEFAULT 0.00,
  balance_after NUMERIC(12,2) DEFAULT 0.00,
  source_type VARCHAR(32) DEFAULT 'MANUAL',
  source_id BIGINT,
  happened_at TIMESTAMP,
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_yy_member_balance_customer ON yy_member_balance_ledger (tenant_id, customer_id, happened_at);
CREATE INDEX IF NOT EXISTS idx_yy_member_balance_source ON yy_member_balance_ledger (tenant_id, source_type, source_id);

CREATE TABLE IF NOT EXISTS yy_member_recharge_order (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20) DEFAULT '000000',
  store_id BIGINT,
  customer_id BIGINT NOT NULL,
  recharge_order_no VARCHAR(64) NOT NULL,
  recharge_amount NUMERIC(12,2) DEFAULT 0.00,
  gift_amount NUMERIC(12,2) DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'PENDING',
  channel_type VARCHAR(32) DEFAULT 'LOCAL',
  paid_time TIMESTAMP,
  external_trade_no VARCHAR(128) DEFAULT '',
  remark VARCHAR(500),
  del_flag CHAR(1) DEFAULT '0',
  create_dept BIGINT,
  create_by BIGINT,
  create_time TIMESTAMP,
  update_by BIGINT,
  update_time TIMESTAMP,
  CONSTRAINT uk_yy_member_recharge_no UNIQUE (tenant_id, recharge_order_no, del_flag)
);
CREATE INDEX IF NOT EXISTS idx_yy_member_recharge_customer ON yy_member_recharge_order (tenant_id, customer_id, status);
