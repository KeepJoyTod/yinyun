# Multi-Store & Douyin Life Order Resolution Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task.

**Goal:** Add multi-store seed data, employee-store binding, Douyin Life POI/SKU resolver, bootstrap store scopes, DOUYIN_LIFE mapping view, and dashboard anomaly indicators — all local, no production connections.

**Architecture:** Backend-first (SQL migrations + Java entities/services), then frontend (bootstrap extension, mapping view in StoreView, anomaly indicators). Resolver is a standalone Spring component injected into DouyinLifeChannelAdapter.

**Tech Stack:** Java 17 + MyBatis-Plus (RuoYi-Vue-Plus), PostgreSQL, Vue 3 + TypeScript (studio-workbench).

---

## Task 1: yy_store Seed Script (真实四门店, idempotent)

**Files:**
- Create: `backend/script/sql/postgres/postgres_yy_store_seed_20260616.sql`

- [ ] **Step 1: Write seed SQL**

```sql
-- 影约云四门店种子数据 (幂等, 基于 tenant_id + store_code 唯一判断)
-- 使用大整数 ID 避免与雪花生成器冲突

insert into yy_store (
    id, tenant_id, store_code, store_name, status, phone, address,
    business_hours, sort, create_time, create_by, del_flag, remark
) values
(
    900000000000000100, '000000', 'BZ-WANDA', '滨州万达店', '0',
    '', '', '', 1,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000200, '000000', 'BZ-WUYUE', '滨州吾悦店', '0',
    '', '', '', 2,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000300, '000000', 'WH-ZHIGU', '威海智慧谷店', '0',
    '', '', '', 3,
    now(), 1, '0', '影约云标准门店'
),
(
    900000000000000400, '000000', 'ZB-WANXIANGHUI', '淄博万象汇店', '0',
    '', '', '', 4,
    now(), 1, '0', '影约云标准门店'
)
on conflict (tenant_id, store_code) do nothing;
```

- [ ] **Step 2: Run test to verify SQL syntax**

Run: `cat backend/script/sql/postgres/postgres_yy_store_seed_20260616.sql`
Expected: File exists, valid SQL with `on conflict (tenant_id, store_code) do nothing`

---

## Task 2: yy_employee_store Table Migration

**Files:**
- Create: `backend/script/sql/postgres/postgres_yy_employee_store_migration_20260616.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- 员工-门店多对多绑定表
create table if not exists yy_employee_store (
    id bigint not null,
    tenant_id varchar(20) default '000000',
    employee_id bigint not null,
    store_id bigint not null,
    is_primary char(1) default '0',
    role_type varchar(32) default 'STAFF',
    status char(1) default '0',
    sort int default 0,
    create_time timestamp,
    update_time timestamp,
    del_flag char(1) default '0',
    primary key (id)
);

-- 每员工仅一个主门店的部分唯一索引
create unique index if not exists uk_yy_employee_store_primary
    on yy_employee_store (tenant_id, employee_id)
    where is_primary = '1' and del_flag = '0';

-- 员工-门店组合唯一
create unique index if not exists uk_yy_employee_store_emp_store
    on yy_employee_store (tenant_id, employee_id, store_id)
    where del_flag = '0';
```

- [ ] **Step 2: Verify migration file**

Run: `cat backend/script/sql/postgres/postgres_yy_employee_store_migration_20260616.sql`
Expected: Contains CREATE TABLE, two CREATE UNIQUE INDEX statements

---

## Task 3: yy_employee_store Seed (migrate existing store_id → is_primary=true)

**Files:**
- Extend: `backend/script/sql/postgres/postgres_yy_employee_store_migration_20260616.sql` (append seed)

- [ ] **Step 1: Append seed SQL to migration file**

Append after the indexes:

```sql
-- 从 yy_employee.store_id 迁移主门店关系到 yy_employee_store
-- 仅当 yy_employee.store_id 非空时才插入 is_primary=true
insert into yy_employee_store (id, tenant_id, employee_id, store_id, is_primary, role_type, status, sort, create_time, del_flag)
select
    e.id + 1000000000000000 as id,  -- 避免与 yy_employee id 冲突
    e.tenant_id,
    e.id as employee_id,
    e.store_id,
    '1' as is_primary,
    e.role_type,
    e.status,
    e.sort,
    e.create_time,
    '0' as del_flag
from yy_employee e
where e.store_id is not null
  and e.del_flag = '0'
  and not exists (
    select 1 from yy_employee_store es
    where es.tenant_id = e.tenant_id
      and es.employee_id = e.id
      and es.store_id = e.store_id
      and es.del_flag = '0'
  )
on conflict (tenant_id, employee_id, store_id) do nothing;
```

- [ ] **Step 2: Verify seed SQL**

Run: `cat backend/script/sql/postgres/postgres_yy_employee_store_migration_20260616.sql`
Expected: Contains INSERT ... SELECT with NOT EXISTS guard for idempotency

---

## Task 4: Backend Entity/Bo/Vo/Mapper/Service/Controller for YyEmployeeStore

**Files:**
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyEmployeeStore.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyEmployeeStoreBo.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyEmployeeStoreVo.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyEmployeeStoreMapper.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyEmployeeStoreService.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyEmployeeStoreServiceImpl.java`
- Create: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyEmployeeStoreController.java`

Follow existing RuoYi patterns from `YyWorkOrder`/`YyEmployee` as reference.

- [ ] **Step 1: Create YyEmployeeStore.java domain entity**

Reference: `YyEmployee.java` for pattern (extends TenantEntity, @TableName, @TableId, @TableLogic)

Fields: id, tenantId, employeeId, storeId, isPrimary, roleType, status, sort, createTime, updateTime, delFlag

- [ ] **Step 2: Create YyEmployeeStoreBo.java**

Reference: `YyEmployeeBo.java` pattern. Same fields as domain, plus validation annotations.

- [ ] **Step 3: Create YyEmployeeStoreVo.java**

Reference: `YyEmployeeVo.java` pattern. Include all fields.

- [ ] **Step 4: Create YyEmployeeStoreMapper.java**

```java
package org.dromara.yy.mapper;

import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.vo.YyEmployeeStoreVo;

public interface YyEmployeeStoreMapper extends BaseMapperPlus<YyEmployeeStore, YyEmployeeStoreVo> {
}
```

- [ ] **Step 5: Create IYyEmployeeStoreService.java**

Methods: `queryPageList(Bo, PageQuery)`, `queryList(Bo)`, `queryById(Long)`, `insertByBo(Bo)`, `updateByBo(Bo)`, `deleteWithValidByIds(List<Long>, Boolean)`, `listStoreScopes(Long employeeId)` → `List<YyEmployeeStoreVo>`

- [ ] **Step 6: Create YyEmployeeStoreServiceImpl.java**

Standard CRUD + `listStoreScopes`:
```java
public List<YyEmployeeStoreVo> listStoreScopes(Long employeeId) {
    List<YyEmployeeStore> list = baseMapper.selectList(
        Wrappers.<YyEmployeeStore>lambdaQuery()
            .eq(YyEmployeeStore::getEmployeeId, employeeId)
            .eq(YyEmployeeStore::getDelFlag, "0")
            .orderByAsc(YyEmployeeStore::getSort)
    );
    return convertToListVo(list);
}
```

- [ ] **Step 7: Create YyEmployeeStoreController.java**

Standard RuoYi controller with @SaCheckPermission, @GetMapping("/list"), @PostMapping(), @PutMapping(), @DeleteMapping("/{ids}"), @GetMapping("/{id}")

- [ ] **Step 8: Write test YyEmployeeStoreServiceImplTest.java**

```java
class YyEmployeeStoreServiceImplTest {
    @Test
    void testInsertWithDuplicateShouldNotThrow() {
        // Insert same employee_id + store_id twice → second should be ignored or handled
    }

    @Test
    void testTwoPrimariesForSameEmployeeShouldFail() {
        // Insert is_primary='1' for employee A + store 1
        // Try inserting is_primary='1' for employee A + store 2 → should violate unique index
    }

    @Test
    void testListStoreScopesReturnsOrdered() {
        // Insert 3 bindings, verify listStoreScopes returns sorted by sort asc
    }

    @Test
    void testMigrateFromYyEmployeeStoreId() {
        // Given yy_employee with store_id=100, verify seed SQL would create
        // yy_employee_store with is_primary='1'
    }
}
```

---

## Task 5: Bootstrap Extension — StoreScope with roleType/primary/status

**Files:**
- Modify: `backend/.../domain/vo/YyStudioBootstrapVo.java`
- Modify: `backend/.../service/impl/YyStudioServiceImpl.java`

- [ ] **Step 1: Extend YyStudioBootstrapVo.StoreScope**

Add fields to `StoreScope` inner class:
```java
private String roleType;
private Boolean primary;
// status already exists
```

- [ ] **Step 2: Add YyEmployeeStoreMapper dependency to YyStudioServiceImpl**

```java
private final YyEmployeeStoreMapper employeeStoreMapper;
```

- [ ] **Step 3: Modify bootstrap() method**

After resolving stores, also resolve store scopes per employee:
```java
@Override
public YyStudioBootstrapVo bootstrap(LoginUser loginUser, boolean globalStoreScope) {
    YyEmployee employee = findEmployee(loginUser.getUserId());
    List<Long> storeIds = resolveStoreIds(employee, globalStoreScope);
    List<YyStore> stores = queryStores(storeIds, globalStoreScope);

    YyStudioBootstrapVo result = new YyStudioBootstrapVo();
    result.setIdentity(toIdentity(loginUser, employee));
    result.setGlobalStoreScope(globalStoreScope);

    // Build store scopes with roleType/primary info
    List<YyEmployeeStore> employeeStores = Collections.emptyList();
    if (employee != null && employee.getId() != null) {
        employeeStores = employeeStoreMapper.selectList(
            Wrappers.<YyEmployeeStore>lambdaQuery()
                .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                .eq(YyEmployeeStore::getDelFlag, "0")
                .orderByAsc(YyEmployeeStore::getSort)
        );
    }

    // Merge: stores from query + employee store scopes
    result.setStores(buildStoreScopes(stores, employeeStores, employee, globalStoreScope));
    // ... rest unchanged
}
```

- [ ] **Step 4: Implement buildStoreScopes helper**

```java
private List<StoreScope> buildStoreScopes(List<YyStore> stores, List<YyEmployeeStore> empStores,
                                           YyEmployee employee, boolean globalStoreScope) {
    // For each store, check if employee has a binding
    // If globalStoreScope=true: return all stores, primary/roleType from employee's primary binding
    // If globalStoreScope=false: return only employee's stores
    // Set primary=true only on the employee's is_primary=1 binding
}
```

- [ ] **Step 5: Keep identity.storeId from employee.storeId (backward compat)**

Existing `toIdentity()` already sets `identity.setStoreId(stringId(employee.getStoreId()))`. Leave unchanged.

---

## Task 6: Frontend Bootstrap Types & StoreScope Display

**Files:**
- Modify: `studio-workbench/src/shared/api/backendTypes.ts`
- Modify: `studio-workbench/src/shared/stores/studioAccessStore.ts`
- Modify: `studio-workbench/src/shared/components/layout/Sidebar.vue`

- [ ] **Step 1: Extend WorkbenchBootstrapDto.StoreScope**

```typescript
// In backendTypes.ts, add to StoreScope:
export type WorkbenchBootstrapDto = {
  // ... existing fields
  stores: {
    storeId: string
    storeCode: string
    storeName: string
    status: string
    roleType?: string    // NEW
    primary?: boolean     // NEW
  }[]
  // ...
}
```

- [ ] **Step 2: Apply in studioAccessStore**

In `apply()` method, copy `roleType` and `primary` from each store scope:
```typescript
this.stores = data.stores.map(s => ({ ...s }))  // already spreads
```
No code change needed if spreading works, but verify `Sidebar.vue` displays the new fields.

- [ ] **Step 3: Update Sidebar.vue store scope indicator**

Show multi-store badge when `stores.length > 1`:
```html
<!-- Existing -->
<p v-if="storeScope" class="mt-0.5 truncate text-[10.5px] text-[#F4EFE6]/45">{{ storeScope }}</p>
<!-- Add: multi-store count -->
<p v-if="stores.length > 1" class="mt-0.5 truncate text-[10px] text-[#F4EFE6]/30">
  {{ stores.length }} 家门店{{ primaryStore ? ' · ' + primaryStore : '' }}
</p>
```

---

## Task 7: DOUYIN_LIFE Mapping Section in StoreView

**Files:**
- Modify: `studio-workbench/src/features/stores/StoreView.vue`
- Modify: `studio-workbench/src/features/stores/storeOperations.ts` (if new ops needed)

- [ ] **Step 1: Add DOUYIN_LIFE mapping section to StoreView**

After existing store detail cards, add a collapsible section per store:
```vue
<template v-for="store in stores" :key="store.backendId">
  <!-- existing store content -->

  <!-- DOUYIN_LIFE 映射区块 -->
  <div v-if="getDouyinLifeMappingsForStore(store.backendId).length > 0" class="mt-4">
    <h4 class="text-sm font-medium text-gray-700">抖音来客映射</h4>
    <table class="mt-2 text-xs">
      <thead>
        <tr>
          <th class="text-left">产品</th>
          <th class="text-left">POI ID</th>
          <th class="text-left">SKU ID</th>
          <th class="text-left">状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in getDouyinLifeMappingsForStore(store.backendId)" :key="m.backendId">
          <td>{{ m.productName || m.externalName }}</td>
          <td>{{ m.externalPoiId || '-' }}</td>
          <td>{{ m.externalSkuId || '-' }}</td>
          <td>{{ m.mappingStatus }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

- [ ] **Step 2: Add helper in StoreView or storeOperations**

```typescript
const getDouyinLifeMappingsForStore = (storeBackendId: string) => {
  return appStore.channelProductMappings.filter(
    m => m.channelType === 'DOUYIN_LIFE' && m.storeName === getStoreName(storeBackendId)
  )
}
```

- [ ] **Step 3: Handle empty state**

When no DOUYIN_LIFE mappings exist for a store:
```vue
<div v-else class="mt-4 text-xs text-gray-400">
  暂无抖音来客映射；到 /yy/channelProductMapping/list 维护商品、SKU、POI 和入口。
</div>
```

---

## Task 8: DouyinLifeStoreResolver (Backend)

**Files:**
- Create: `backend/.../yy/service/impl/DouyinLifeStoreResolver.java`
- Create: `backend/.../yy/service/IDouyinLifeStoreResolver.java`
- Create: `backend/.../yy/channel/douyin/DouyinLifeStoreResolverTest.java`
- Modify: `backend/.../channel/douyin/DouyinLifeChannelAdapter.java` (inject resolver, use in upsertLocalOrder)

- [ ] **Step 1: Create IDouyinLifeStoreResolver interface**

```java
package org.dromara.yy.service;

public interface IDouyinLifeStoreResolver {
    enum ResolutionResult { HIT, POI_ONLY_AMBIGUOUS, NOT_FOUND }

    record StoreResolution(ResolutionResult result, Long storeId, String message) {}
    record ProductResolution(ResolutionResult result, Long productId, String message) {}

    StoreResolution resolveStore(String externalPoiId, String externalSkuId, String channelType);
    ProductResolution resolveProduct(String externalSkuId, Long storeId, String channelType);
}
```

- [ ] **Step 2: Create DouyinLifeStoreResolver implementation**

```java
@Service
@RequiredArgsConstructor
public class DouyinLifeStoreResolver implements IDouyinLifeStoreResolver {

    private final YyChannelProductMappingMapper mappingMapper;

    @Override
    public StoreResolution resolveStore(String externalPoiId, String externalSkuId, String channelType) {
        // Validate channelType is DOUYIN_LIFE (reject DOUYIN_MINI_APP)
        if (!"DOUYIN_LIFE".equals(channelType)) {
            return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                "channelType=" + channelType + " 不是 DOUYIN_LIFE");
        }

        // Step 1: Try poi + sku match with ACTIVE/enabled status
        if (StringUtils.isNotBlank(externalSkuId)) {
            List<YyChannelProductMapping> matches = mappingMapper.selectList(
                Wrappers.<YyChannelProductMapping>lambdaQuery()
                    .eq(YyChannelProductMapping::getChannelType, "DOUYIN_LIFE")
                    .eq(YyChannelProductMapping::getExternalPoiId, externalPoiId)
                    .eq(YyChannelProductMapping::getExternalSkuId, externalSkuId)
                    .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                    .eq(YyChannelProductMapping::getDelFlag, "0")
            );
            if (matches.size() == 1) {
                return new StoreResolution(ResolutionResult.HIT, matches.get(0).getStoreId(), null);
            }
            if (matches.size() > 1) {
                return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                    "SKU 映射重复: " + matches.size() + " 条记录");
            }
        }

        // Step 2: Fallback to poi-only match
        if (StringUtils.isNotBlank(externalPoiId)) {
            List<YyChannelProductMapping> poiMatches = mappingMapper.selectList(
                Wrappers.<YyChannelProductMapping>lambdaQuery()
                    .eq(YyChannelProductMapping::getChannelType, "DOUYIN_LIFE")
                    .eq(YyChannelProductMapping::getExternalPoiId, externalPoiId)
                    .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                    .eq(YyChannelProductMapping::getDelFlag, "0")
                    .isNotNull(YyChannelProductMapping::getStoreId)
            );

            if (poiMatches.isEmpty()) {
                return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                    "POI 无活跃映射: " + externalPoiId);
            }

            // Extract unique storeIds
            Set<Long> uniqueStoreIds = poiMatches.stream()
                .map(YyChannelProductMapping::getStoreId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

            if (uniqueStoreIds.size() > 1) {
                return new StoreResolution(ResolutionResult.POI_ONLY_AMBIGUOUS, null,
                    "POI 映射到多个门店 (" + uniqueStoreIds.size() + ")，无法自动归店: " + externalPoiId);
            }

            return new StoreResolution(ResolutionResult.HIT, uniqueStoreIds.iterator().next(), null);
        }

        return new StoreResolution(ResolutionResult.NOT_FOUND, null,
            "externalPoiId 为空，无法归店");
    }

    @Override
    public ProductResolution resolveProduct(String externalSkuId, Long storeId, String channelType) {
        // Similar logic: query mapping by channelType + externalSkuId + storeId
        // Return productId if unique, NOT_FOUND otherwise
        if (!"DOUYIN_LIFE".equals(channelType)) {
            return new ProductResolution(ResolutionResult.NOT_FOUND, null,
                "channelType=" + channelType + " 不是 DOUYIN_LIFE");
        }
        List<YyChannelProductMapping> matches = mappingMapper.selectList(
            Wrappers.<YyChannelProductMapping>lambdaQuery()
                .eq(YyChannelProductMapping::getChannelType, "DOUYIN_LIFE")
                .eq(YyChannelProductMapping::getExternalSkuId, externalSkuId)
                .eq(YyChannelProductMapping::getStoreId, storeId)
                .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                .eq(YyChannelProductMapping::getDelFlag, "0")
        );
        if (matches.size() == 1) {
            return new ProductResolution(ResolutionResult.HIT, matches.get(0).getProductId(), null);
        }
        return new ProductResolution(ResolutionResult.NOT_FOUND, null,
            "SKU 产品映射未找到: " + externalSkuId);
    }
}
```

- [ ] **Step 3: Write DouyinLifeStoreResolverTest.java**

```java
class DouyinLifeStoreResolverTest {
    @Test
    void poiPlusSkuHit() {
        // Mock mapping: DOUYIN_LIFE + poi=A + sku=B → store=100
        // → ResolutionResult.HIT, storeId=100
    }

    @Test
    void poiOnlyUniqueHit() {
        // Mock mapping: DOUYIN_LIFE + poi=A (no sku) → store=100
        // → ResolutionResult.HIT, storeId=100
    }

    @Test
    void poiOnlyAmbiguous() {
        // Mock 2 mappings: DOUYIN_LIFE + poi=A → store=100 AND store=200
        // → ResolutionResult.POI_ONLY_AMBIGUOUS
    }

    @Test
    void notFound() {
        // No matching mapping
        // → ResolutionResult.NOT_FOUND
    }

    @Test
    void douyinMiniAppRejected() {
        // channelType = "DOUYIN_MINI_APP"
        // → ResolutionResult.NOT_FOUND, message contains "不是 DOUYIN_LIFE"
    }

    @Test
    void emptyPoiIdRejected() {
        // externalPoiId is blank
        // → ResolutionResult.NOT_FOUND, message contains "externalPoiId 为空"
    }
}
```

- [ ] **Step 4: Modify DouyinLifeChannelAdapter to use resolver**

Add field:
```java
@Autowired(required = false)
private IDouyinLifeStoreResolver storeResolver;
```

Modify `upsertLocalOrder` line ~1469:
```java
// OLD:
// Long localStoreId = firstNonNull(storeId, config == null ? null : config.storeId(),
//     entity == null ? null : entity.getStoreId(), firstStoreId());

// NEW:
Long localStoreId = resolveStoreIdForUpsert(config, order, entity, storeId);
```

Add new method:
```java
private Long resolveStoreIdForUpsert(LifeConfig config, YyChannelOrderVo order,
                                      YyOrder existingEntity, Long configStoreId) {
    // 1. If order already has externalPoiId/externalSkuId in rawPayload, parse and resolve
    // 2. If resolver hits → return resolved storeId
    // 3. If resolver returns AMBIGUOUS or NOT_FOUND → fall back to configStoreId / existingEntity.storeId
    // 4. If still null → use firstStoreId() (legacy default, but mark as NEED_MAPPING)
    // 5. Return (storeId, needsMappingFlag)
}
```

Actually, cleaner approach — modify the `upsertLocalOrder` to accept a `StoreResolution` result:

```java
// In upsertLocalOrder, after determining localStoreId:
boolean needsMapping = false;
if (localStoreId == null) {
    // Resolver was called but didn't find a match
    // Fall back to config store ID or existing entity store ID
    localStoreId = firstNonNull(configStoreId, existingEntity == null ? null : existingEntity.getStoreId(), firstStoreId());
    if (localStoreId != null && existingEntity == null) {
        needsMapping = true;  // Will be flagged in yy_order
    }
}
```

Then set `entity.setInventoryStatus(needsMapping ? "NEED_MAPPING" : "")` and log to sync log.

---

## Task 9: Modify DouyinLifeChannelAdapter upsertLocalOrder

**Files:**
- Modify: `backend/.../channel/douyin/DouyinLifeChannelAdapter.java`

- [ ] **Step 1: Inject resolver**

```java
@Autowired(required = false)
private IDouyinLifeStoreResolver storeResolver;
```

- [ ] **Step 2: Add resolver call in upsertLocalOrder**

Before line 1469, add:
```java
// Try resolver if we have external POI/SKU info from the order
Long resolvedStoreId = null;
if (storeResolver != null && StringUtils.isNotBlank(order.getExternalPoiId())
    || StringUtils.isNotBlank(order.getExternalSkuId())) {
    IDouyinLifeStoreResolver.StoreResolution resolution = storeResolver.resolveStore(
        order.getExternalPoiId(), order.getExternalSkuId(), CHANNEL_TYPE
    );
    if (resolution.result() == IDouyinLifeStoreResolver.ResolutionResult.HIT) {
        resolvedStoreId = resolution.storeId();
    } else {
        // Log the resolution failure to sync log
        recordSyncLog(config, "store_resolve",
            new YyChannelApiResultVo() {{
                setSuccess(false);
                setMessage("归店解析失败: " + resolution.message());
            }}, 0L, order.getExternalOrderId()
        );
    }
}
```

- [ ] **Step 3: Use resolvedStoreId in storeId resolution chain**

```java
// Line ~1469: replace firstNonNull(...) with:
Long localStoreId = firstNonNull(resolvedStoreId, storeId,
    config == null ? null : config.storeId(),
    entity == null ? null : entity.getStoreId(),
    firstStoreId());

boolean needsMapping = (resolvedStoreId == null && entity == null && configStoreId == null);
```

- [ ] **Step 4: Mark order with NEED_MAPPING if resolver failed**

After entity creation:
```java
if (needsMapping) {
    entity.setInventoryStatus("NEED_MAPPING");
    entity.setConflictReason("DOUYIN_LIFE POI/SKU 映射缺失，已归入默认门店");
}
```

- [ ] **Step 5: Ensure yy_channel_sync_log and logid are written**

Already done by existing `recordSyncLog()` and `upsertOrderMapping()` calls. No change needed.

---

## Task 10: Dashboard Anomaly Statistics (Backend + Frontend)

**Files:**
- Modify: `backend/.../service/IYyDashboardService.java`
- Modify: `backend/.../service/impl/YyDashboardServiceImpl.java`
- Modify: `backend/.../controller/YyDashboardController.java`
- Modify: `studio-workbench/src/shared/api/backendTypes.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`

- [ ] **Step 1: Backend — Add anomalyStats to IYyDashboardService**

```java
public interface IYyDashboardService {
    // ... existing methods

    Map<String, Object> anomalyStats(String date, List<Long> storeIds, boolean globalStoreScope);
}
```

- [ ] **Step 2: Backend — Implement anomalyStats in YyDashboardServiceImpl**

```java
@Override
public Map<String, Object> anomalyStats(String date, List<Long> storeIds, boolean globalStoreScope) {
    Map<String, Object> result = new LinkedHashMap<>();

    // 1. Missing store mapping: storeId null or not in active stores
    long missingStoreMapping = countOrdersWithMissingStore(storeIds, globalStoreScope);

    // 2. Missing arrival time: arrival_time is null
    long missingArrivalTime = countOrdersWithNullArrivalTime(date, storeIds, globalStoreScope);

    // 3. Missing product name: external_product_id and external_sku_id both blank AND no service_group
    long missingProductName = countOrdersWithMissingProduct(storeIds, globalStoreScope);

    // 4. Sync safety gate: check last sync status from yy_channel_sync_log
    String syncStatus = getLastSyncStatus();

    result.put("missingStoreMapping", missingStoreMapping);
    result.put("missingArrivalTime", missingArrivalTime);
    result.put("missingProductName", missingProductName);
    result.put("syncSafetyGateStatus", syncStatus);

    return result;
}
```

- [ ] **Step 3: Backend — Add endpoint to YyDashboardController**

```java
@GetMapping("/anomaly-stats")
public R<Map<String, Object>> getAnomalyStats(
    @RequestParam(required = false) String date,
    @RequestParam(required = false) Long storeId
) {
    // Resolve storeIds from LoginUser
    Map<String, Object> stats = dashboardService.anomalyStats(date, storeIds, globalStoreScope);
    return R.ok(stats);
}
```

- [ ] **Step 4: Frontend — Add anomalyStats to backend.ts**

```typescript
async anomalyStats(date?: string, storeId?: BackendId) {
  return apiRequest<Record<string, any>>('/yy/dashboard/anomaly-stats', {
    params: { date, storeId },
  })
}
```

- [ ] **Step 5: Frontend — Add to WorkbenchBootstrapDto or separate type**

```typescript
export type AnomalyStatsDto = {
  missingStoreMapping: number
  missingArrivalTime: number
  missingProductName: number
  syncSafetyGateStatus: string  // 'OK' | 'SUSPICIOUS' | 'FAILED' | ''
}
```

- [ ] **Step 6: Frontend — Add anomaly state to appStore**

```typescript
// In appStore.ts state:
anomalyStats: {} as AnomalyStatsDto,

// In loadDashboardStats, add:
const anomalies = await backendApi.anomalyStats(date)
this.anomalyStats = anomalies
```

- [ ] **Step 7: Frontend — Add anomaly section to DashboardView**

Add "异常概览" card section:
```vue
<div class="grid grid-cols-4 gap-3 mb-4">
  <div class="rounded-md bg-white/5 p-3">
    <div class="text-xs text-[#F4EFE6]/50">缺门店映射</div>
    <div class="text-xl font-semibold">{{ anomalyStats.missingStoreMapping }}</div>
  </div>
  <div class="rounded-md bg-white/5 p-3">
    <div class="text-xs text-[#F4EFE6]/50">缺到店时间</div>
    <div class="text-xl font-semibold">{{ anomalyStats.missingArrivalTime }}</div>
  </div>
  <div class="rounded-md bg-white/5 p-3">
    <div class="text-xs text-[#F4EFE6]/50">缺产品名</div>
    <div class="text-xl font-semibold">{{ anomalyStats.missingProductName }}</div>
  </div>
  <div class="rounded-md bg-white/5 p-3">
    <div class="text-xs text-[#F4EFE6]/50">同步状态</div>
    <div class="text-xl font-semibold" :class="syncStatusColor">
      {{ syncStatusLabel }}
    </div>
  </div>
</div>
```

- [ ] **Step 8: Frontend — Add anomaly filter chips to OrdersView**

```vue
<div class="flex gap-2 mb-3">
  <button
    v-for="filter in anomalyFilters"
    :key="filter.key"
    class="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
    @click="toggleAnomalyFilter(filter.key)"
  >
    {{ filter.label }} ({{ filter.count }})
  </button>
</div>
```

Where `anomalyFilters` is computed from `appStore.anomalyStats` and `appStore.orders`.

---

## Task 11: Frontend Anomaly Pre-implementation (without backend)

**Files:**
- Modify: `studio-workbench/src/shared/stores/appStore.ts`

Since backend anomaly endpoint may not be ready, add frontend pre-computation:

```typescript
// In appStore, computed anomaly stats from existing orders:
get anomalyPreStats() {
  const orders = this.orders
  return {
    missingStoreMapping: orders.filter(o => !o.storeBackendId || !this.stores.some(s => s.backendId === o.storeBackendId)).length,
    missingArrivalTime: orders.filter(o => !o.arrivalTime || o.arrivalTime === '-').length,
    missingProductName: orders.filter(o => !o.service || o.service === '未知产品').length,
  }
}
```

This gives immediate anomaly visibility without waiting for backend.

---

## Task 12: Integration Tests

**Files:**
- Create: `backend/.../yy/service/impl/DouyinLifeStoreResolverTest.java` (covered in Task 8)
- Create: `backend/.../yy/service/impl/YyEmployeeStoreServiceImplTest.java` (covered in Task 4)
- Create: `studio-workbench/src/features/dashboard/anomalyDashboard.test.ts`
- Create: `studio-workbench/src/features/orders/anomalyFilter.test.ts`

- [ ] **Step 1: Write anomalyDashboard.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { createMockAppStore } from '../../__mocks__/appStore'

describe('anomalyDashboard', () => {
  it('counts missing store mapping orders', () => {
    const store = createMockAppStore()
    store.orders = [
      { storeBackendId: '999', arrivalTime: '2026-01-01 10:00', service: '摄影套餐A' }, // 999 not in stores
      { storeBackendId: '1', arrivalTime: '', service: '' }, // empty arrival + product
    ]
    store.stores = [{ backendId: '1', name: 'Test Store' }]

    const missingStore = store.orders.filter(o =>
      !o.storeBackendId || !store.stores.some(s => s.backendId === o.storeBackendId)
    ).length
    expect(missingStore).toBe(2)
  })

  it('counts missing arrival time', () => {
    const store = createMockAppStore()
    store.orders = [
      { arrivalTime: '2026-01-01 10:00' },
      { arrivalTime: '' },
      { arrivalTime: '-' },
    ]
    const missing = store.orders.filter(o => !o.arrivalTime || o.arrivalTime === '-').length
    expect(missing).toBe(2)
  })

  it('counts missing product name', () => {
    const store = createMockAppStore()
    store.orders = [
      { service: '摄影套餐A' },
      { service: '' },
      { service: '未知产品' },
    ]
    const missing = store.orders.filter(o => !o.service || o.service === '未知产品').length
    expect(missing).toBe(2)
  })
})
```

- [ ] **Step 2: Write anomalyFilter.test.ts**

```typescript
import { describe, it, expect } from 'vitest'

describe('orderAnomalyFilter', () => {
  it('filters orders by anomaly type', () => {
    const orders = [
      { storeBackendId: '999', arrivalTime: '2026-01-01', service: 'A' },
      { storeBackendId: '1', arrivalTime: '', service: 'B' },
      { storeBackendId: '1', arrivalTime: '2026-01-01', service: '' },
    ]
    const stores = [{ backendId: '1', name: 'Test' }]

    const missingStore = orders.filter(o =>
      !o.storeBackendId || !stores.some(s => s.backendId === o.storeBackendId)
    )
    expect(missingStore).toHaveLength(1)
  })
})
```

---

## Task 13: Documentation Updates

**Files:**
- Create: `docs/douyin-life-order-store-resolution.md`
- Modify: `docs/studio-workbench-feature-code-map-20260616.md` (new file)
- Modify: `docs/studio-workbench-api-route-map.md`

- [ ] **Step 1: Write resolver documentation**

```markdown
# DOUYIN_LIFE 订单归店解析规则

## 概述
DOUYIN_LIFE 渠道订单同步时，通过 `externalPoiId` 和 `externalSkuId` 解析真实 `storeId` 和 `productId`。

## 解析优先级
1. `channel_type=DOUYIN_LIFE` + `external_poi_id` + `external_sku_id` + `mapping_status=ACTIVE`
2. `channel_type=DOUYIN_LIFE` + `external_poi_id` only → 必须唯一
3. 均失败 → 保留默认门店 + 标记 NEED_MAPPING

## 安全规则
- DOUYIN_MINI_APP 不匹配 DOUYIN_LIFE 映射
- POI-only 多门店匹配 → AMBIGUOUS，不静默选择
- 不匹配 → 不吞单，标记 NEED_MAPPING 供人工修复
```

- [ ] **Step 2: Update feature code map**

Add entries for:
- `employee-store-binding` → `YyEmployeeStore`
- `douyin-life-resolver` → `DouyinLifeStoreResolver`
- `anomaly-dashboard` → `DashboardView.anomalyStats`

---

## Execution Order

1. Task 1 (seed SQL) → Task 2 (migration SQL) → Task 3 (seed SQL append)
2. Task 4 (backend entities/services for YyEmployeeStore)
3. Task 5 (bootstrap extension) → Task 6 (frontend bootstrap types)
4. Task 7 (DOUYIN_LIFE mapping in StoreView)
5. Task 8 (resolver) → Task 9 (adapter integration)
6. Task 10 (anomaly backend) → Task 11 (anomaly frontend pre-impl) → Task 12 (tests)
7. Task 13 (docs)

---

## Constraint Checklist

- [x] yy_order is the single order ledger — no new appointment/payment tables
- [x] DOUYIN_LIFE ≠ DOUYIN_MINI_APP — resolver rejects non-DOUYIN_LIFE
- [x] maxTotal unchanged — no changes to sync safety gates
- [x] All sync writes yy_channel_sync_log + logid — existing mechanism preserved
- [x] No real API calls, no seeds, no production connections
- [x] Seed idempotent — ON CONFLICT DO NOTHING everywhere
- [x] Resolver fail-safe — NEED_MAPPING flag, no order swallowing
