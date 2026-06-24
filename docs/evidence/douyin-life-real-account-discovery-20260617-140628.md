# Douyin Life Real Account Discovery

GeneratedAt: 2026-06-17 14:06:21

## Result

Mode: READ_ONLY_DISCOVERY
Success: True

Safety boundary: no database writes, no inventory writes, no order creation, no raw private payload saved.

## Environment

```text
server: 103.24.216.8
remoteEnvFile: /opt/yingyue/backend/.env.production
account_id: 7228763224957519924
env_poi_id: 7407304729216157722
client_key: present=True, length=16
client_secret: present=True, length=32
sku_id_present: False
sku_out_id_present: False
```

## Query Window

```text
start: 2026-06-16 14:06:22
end: 2026-06-17 14:06:22
maxPages: 3
pageSize: 50
useTestDataHeader: False
```

## Token And Orders

```text
client_token_http_status: 200
client_token_success: True
client_token_logid: 202606171406215639A8EC98887F903163
order_rows_detected: 7
deduped_order_count: 7
```

## Order API Calls

page | http | err_no | orders | logid | message
--- | --- | --- | --- | --- | ---
1 | 200 |  | 7 | 2026061714062287B8A0ECCBD58CA0D546 | 

## POI Summary

poi_id | orders | product_ids | sku_ids | product_names
--- | --- | --- | --- | ---
7342410951733282851 | 4 | 1772297209231363, 1834803890491392, 1765136728900670 | 1772297209231363, 1834803890491392, 1765136728900670 | 儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印, 【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆/立等可取, 【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取
7228779175929186363 | 3 | 1768121210918952, 1867489036547136, 1765136728900670 | 1768121210918952, 1867489036547136, 1765136728900670 | 【2026马年孕妈单人照】孕妇照｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台, 【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台, 【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取

## Product SKU Summary

product_id | sku_id | orders | poi_ids | product_names | sku_names
--- | --- | --- | --- | --- | ---
1765136728900670 | 1765136728900670 | 2 | 7342410951733282851, 7228779175929186363 | 【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取 | 【毕业工作季】成人精致证件照｜大学入学工作简历驾照通用｜含装造｜现场精修立等可取
1772297209231363 | 1772297209231363 | 2 | 7342410951733282851 | 儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印 | 儿童证件照｜适用入园、入学、钢琴美术书法舞蹈竞赛考级等｜提供服装化妆｜精修+打印
1768121210918952 | 1768121210918952 | 1 | 7228779175929186363 | 【2026马年孕妈单人照】孕妇照｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台 | 【2026马年孕妈单人照】孕妇照｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台
1834803890491392 | 1834803890491392 | 1 | 7342410951733282851 | 【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆/立等可取 | 【大学开学必备】精致证件照｜三色三版打印｜适用校园卡四六级教资公考、入职晋升｜提供服装化妆/立等可取
1867489036547136 | 1867489036547136 | 1 | 7228779175929186363 | 【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台 | 【孕妈准爸合影】孕妇照双人｜幸孕照｜风格任选｜服装妆造｜精修四张｜送摆台

## Status Counts

status | count
--- | ---
201 | 5
1 | 2

## Reserve Field Signal

```text
orders_with_poi: 7
orders_with_product_id: 7
orders_with_sku_id: 7
orders_with_non_empty_buyer_reserve_info: 0
orders_with_reserve_time_candidates: 0
orders_with_phone_present_flag: 7
orders_with_open_id_present_flag: 7
```

## POI Discovery

poi_id | matched | http | err_no | name | address | logid | message
--- | --- | --- | --- | --- | --- | --- | ---
7407304729216157722 | True | 200 |  | 一悦照相馆(滨州店) | 通山街天兴城2-134商铺（恰尔呐牛排对面） | 20260617140623171FB180905129A593EB | success
7342410951733282851 | True | 200 |  | 一悦照相馆(滨州万达店) | 彭李街道黄河十二路繁华里商业街森林花语北门向东100米134商户 | 20260617140623760F328FC426148BB01A | success
7228779175929186363 | True | 200 |  | 一悦照相馆(滨州吾悦店) | 渤海十八路长江三路交汇处吾悦金街二楼s-235号 | 2026061714062422BEDBBA22D9A5A5285F | success

## Time Stock Discovery

poi_id | http | err_no | dates | times | rooms | stocks | logid | message
--- | --- | --- | --- | --- | --- | --- | --- | ---
7407304729216157722 | 200 |  |  |  | 1833219768687673 |  | 202606171406258241EBFF60F896A4DF72 | 
7342410951733282851 | 200 |  |  |  |  |  | 2026061714062527BAB05800D989433752 | 
7228779175929186363 | 200 |  |  |  | 1804981296454668 | 1, 2 | 20260617140626203114E57F9BFF809D8B | 

## Write Readiness Gate

```text
yy_product candidates: True
yy_channel_product_mapping candidates: True
orders can sync after review: True
can build yy_booking_slot_inventory from this order query: False
note: Do not write yy_booking_slot_inventory unless real reserve slot fields are present.
```

## Next Step

After reviewing this evidence, write operations should be separate and explicit: seed/update `yy_product`, seed/update `yy_channel_product_mapping`, then run order sync/backfill. Booking slot inventory must only be written when real reserve slot fields exist.

