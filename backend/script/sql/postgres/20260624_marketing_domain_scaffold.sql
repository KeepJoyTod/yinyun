CREATE TABLE IF NOT EXISTS yy_coupon_template (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  template_code VARCHAR(64) NOT NULL,
  template_name VARCHAR(128) NOT NULL,
  template_type VARCHAR(32) NOT NULL,
  store_id BIGINT,
  store_scope VARCHAR(64),
  product_scope VARCHAR(255),
  face_value_cent BIGINT DEFAULT 0,
  discount_rate INTEGER DEFAULT 0,
  stacked_rule VARCHAR(255),
  restore_on_refund CHAR(1) DEFAULT '1',
  status VARCHAR(32) DEFAULT 'SCAFFOLD',
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_coupon_instance (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  template_id BIGINT NOT NULL,
  customer_id BIGINT,
  order_id BIGINT,
  instance_code VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'UNUSED',
  restore_status VARCHAR(32) DEFAULT 'NONE',
  expires_at VARCHAR(32),
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_coupon_grant_record (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  template_id BIGINT NOT NULL,
  customer_id BIGINT,
  grant_batch_code VARCHAR(64),
  grant_source VARCHAR(64),
  status VARCHAR(32) DEFAULT 'SCAFFOLD',
  remark VARCHAR(255),
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_coupon_writeoff_record (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  instance_id BIGINT NOT NULL,
  order_id BIGINT,
  writeoff_amount_cent BIGINT DEFAULT 0,
  restore_status VARCHAR(32) DEFAULT 'NONE',
  restore_reason VARCHAR(255),
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_campaign (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  campaign_code VARCHAR(64) NOT NULL,
  campaign_name VARCHAR(128) NOT NULL,
  campaign_type VARCHAR(32) NOT NULL,
  store_id BIGINT,
  time_range_start VARCHAR(32),
  time_range_end VARCHAR(32),
  status VARCHAR(32) DEFAULT 'SCAFFOLD',
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_campaign_product (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  campaign_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  special_price_cent BIGINT DEFAULT 0,
  product_scope_snapshot VARCHAR(255),
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_campaign_participation (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  campaign_id BIGINT NOT NULL,
  customer_id BIGINT,
  order_id BIGINT,
  channel_source VARCHAR(64),
  stage VARCHAR(32),
  payable_amount_cent BIGINT DEFAULT 0,
  final_amount_cent BIGINT DEFAULT 0,
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_promotion_capability (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  capability_code VARCHAR(64) NOT NULL,
  capability_name VARCHAR(128) NOT NULL,
  scope_type VARCHAR(32) NOT NULL,
  enabled CHAR(1) DEFAULT '1',
  expires_at VARCHAR(32),
  status VARCHAR(32) DEFAULT 'SCAFFOLD',
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yy_promotion_trial_snapshot (
  id BIGINT PRIMARY KEY,
  tenant_id VARCHAR(20),
  order_id_snapshot VARCHAR(64),
  request_payload TEXT,
  applied_rule_code VARCHAR(64),
  original_amount_cent BIGINT DEFAULT 0,
  final_amount_cent BIGINT DEFAULT 0,
  discount_amount_cent BIGINT DEFAULT 0,
  del_flag CHAR(1) DEFAULT '0',
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP
);
