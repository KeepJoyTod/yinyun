create table if not exists yy_merchant_micro_page (
    id                    bigint       not null,
    tenant_id             varchar(20)  default '000000',
    store_id              bigint       default 0 not null,
    page_title            varchar(120) not null,
    page_desc             varchar(500) default null,
    cover_url             varchar(500) default null,
    cover_oss_id          bigint       default null,
    background_color      varchar(16)  default '#FBF8F2' not null,
    edit_mode             varchar(32)  default 'COMPONENT' not null,
    status                varchar(32)  default 'DRAFT' not null,
    config_json           jsonb        not null,
    published_config_json jsonb        default null,
    published_at          timestamp,
    link_key              varchar(64)  not null,
    create_dept           bigint       default null,
    create_by             bigint       default null,
    create_time           timestamp,
    update_by             bigint       default null,
    update_time           timestamp,
    del_flag              char(1)      default '0',
    remark                varchar(500) default null,
    primary key (id),
    unique (tenant_id, link_key)
);

create index if not exists idx_yy_merchant_micro_page_filter on yy_merchant_micro_page (tenant_id, store_id, status, published_at);

insert into sys_menu (menu_id, menu_name, parent_id, order_num, path, component, query_param, is_frame, is_cache, menu_type, visible, status, perms, icon, create_dept, create_by, create_time, update_by, update_time, remark)
values
(9120, '微页面管理', 6200, 20, 'microPage', 'yy/micro-page/index', '', 1, 0, 'C', '0', '0', 'yy:microPage:list', 'guide', 103, 1, now(), null, null, '商户微页面管理'),
(9121, '微页面查询', 9120, 1, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microPage:list', '#', 103, 1, now(), null, null, '微页面查询'),
(9122, '微页面新增', 9120, 2, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microPage:add', '#', 103, 1, now(), null, null, '微页面新增'),
(9123, '微页面修改', 9120, 3, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microPage:edit', '#', 103, 1, now(), null, null, '微页面修改'),
(9124, '微页面删除', 9120, 4, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microPage:remove', '#', 103, 1, now(), null, null, '微页面删除'),
(9125, '微页面发布', 9120, 5, '#', '', '', 1, 0, 'F', '0', '0', 'yy:microPage:publish', '#', 103, 1, now(), null, null, '微页面发布和下线')
on conflict (menu_id) do nothing;
