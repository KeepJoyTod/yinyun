# 产品功能清单 84 - 21 项脚手架验收数据流

## 用户路径

1. 店员或验收人从工作台、客户端进入 21 个对应入口。
2. 页面展示 canonical owner、功能编号、边界说明和下一步动作。
3. 页面只读取现有 scaffold/read-only facade。
4. 缺真实账本时显示 `scaffold/building/not_connected`，不伪装为 `ready`。

## Mermaid 数据流

```mermaid
flowchart TD
  A["用户进入脚手架入口"] --> B["表现层\n工作台 owner 页 / 客户端 P1 页"]
  B --> C["控制逻辑层\nshared scaffold meta / facade / composable"]
  C --> D["后端只读 facade 或本地 scaffold DTO"]
  D --> E["既有事实账本\n商品 / 会员 / 营销 / 平台只读账本"]
  E --> D
  D --> C
  C --> B
  B --> F["显示 inventoryCode / boundary / nextActions / ownerLayers"]
```

## 21 项归并流向

```mermaid
flowchart LR
  P1["C-023 / C-025\n消费者 P1"] --> MP["mobile-uniapp\nmy / coupons"]
  Product["B-018/B-019/B-020/B-021/B-022/B-023/B-024/B-025/B-028"] --> PW["工作台商品 owner"]
  MemberMarketing["B-110/B-111/B-073/B-074/B-077"] --> MM["会员账户 / 营销券 owner"]
  Platform["B-085/B-115/B-116/B-117/B-118"] --> PF["平台设置 owner"]
```

## 输出要求

- 页面必须展示：
  - `inventoryCodes`
  - `acceptanceLabel`
  - `boundaryNotes`
  - `nextActions`
  - `ownerLayers`
- 文档必须同步：
  - `docs/yiyue/function_map.md`
  - `docs/yiyue/code_map.md`
  - `docs/yiyue/api_map.md`
  - `docs/yiyue/optimization_map.md`
