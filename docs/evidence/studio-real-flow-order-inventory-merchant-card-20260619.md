# Studio Workbench Real Flow Evidence - 2026-06-19

Release markers:

- Backend: deployed `backend/ruoyi-admin/target/ruoyi-admin.jar` to HK2 `/opt/yingyue/backend/ruoyi-admin.jar`.
- Frontend: `prod-e31a83a-merchant-status-slot-20260619-194007`.
- Site: `https://studio.evanshine.me`.

## Appointment / Inventory Chain

Test order:

- `YY-STAFF-2067932763408805890`
- Store: `900000000000000100` / 滨州万达店
- Customer: `Codex验收新链路1129`

Verified path:

1. Staff booking created from logged-in workbench.
2. Initial slot: `2026-06-19 11:00-11:30`.
3. Inventory after create: `11:00-11:30|capacity=2|paid_count=1|conflict=0|ACTIVE`.
4. Opened order detail from appointment list after resetting the accidental `quick=all` Douyin-only filter.
5. Rescheduled to `2026-06-19 11:30-12:00`.
6. Inventory after reschedule:
   - `11:00-11:30|2|0|0|ACTIVE`
   - `11:30-12:00|2|1|0|ACTIVE`
7. Cancelled from order detail with reason `真实登录态验收：取消释放库存`.
8. Final order state: `CANCELLED / RELEASED`.
9. Inventory after cancel:
   - `11:00-11:30|2|0|0|ACTIVE`
   - `11:30-12:00|2|0|0|ACTIVE`

Backend fix verified:

- Unpaid `STAFF_MANUAL` / `LOCAL` staff bookings now reserve inventory when rescheduled.
- Cancelling a `CONFIRMED` inventory order releases the occupied slot.

## Merchant Decoration

Issue found:

- `MerchantDecorationView` provided save/publish buttons through `#status`, but `MerchantModuleChrome` did not render the named slot.
- Production page therefore showed inputs and preview, but no `保存草稿 / 保存并下一步 / 发布上线` buttons.

Fix:

- `studio-workbench/src/features/merchant/components/MerchantModuleChrome.vue` now renders `<slot name="status" />`.
- Contract test updated: `MerchantModuleChrome.contract.test.ts`.

Verification:

- `npm --prefix studio-workbench run test -- src/features/merchant/MerchantModuleChrome.contract.test.ts src/features/merchant/MerchantDecorationView.contract.test.ts`
- `npm --prefix studio-workbench run build`
- Production DOM after deploy contains:
  - `保存草稿`
  - `保存并下一步`
  - `发布上线`

## Photo Delivery

Verified page:

- `/service/photos`

Result:

- Real albums load after async API completion.
- For visible real-store albums, actions are correctly locked until photos exist:
  - `通知客户 请先上传底片`
  - `客片确认 请先上传底片`
  - `资料发送 请先上传底片`

Data finding:

- Production has one old-default-store album with assets.
- Four real-store albums currently have placeholders but no photo assets, so notify/confirm/deliver cannot be completed without uploading or migrating real assets.

## Card Products

Verified page:

- `/product/card-management`
- `/product/card-catalog`

Result:

- Card management page opens.
- `添加次卡 / 添加储值卡` entries render.
- `新增储值卡` modal renders real fields and `创建卡项`.

Remaining issue:

- In the in-app browser 1280x720 viewport, the modal bottom action is hard to hit reliably by automation. This is a UI ergonomics issue for the card product modal footer and should be fixed before declaring the card-product closed loop complete.

## Notes

- Two `store-admin` password errors in production logs were caused by a stale local `.env.local` password check. Do not reuse that local password for API smoke.
- `quick=all` currently maps to the Douyin 30-day filter on appointment orders. Resetting filters shows local staff bookings. This naming should be clarified later.

## 2026-06-19 19:55 Follow-up Deployment

Frontend release:

- `prod-e31a83a-workbench-real-actions-20260619-195346`
- Site: `https://studio.evanshine.me`
- Scope: frontend-only `studio-workbench`; backend, database, nginx site config unchanged.

Fixes shipped:

1. Card product modal now uses a viewport-bounded flex layout:
   - long form body scrolls inside the modal;
   - footer is fixed within the modal surface;
   - `创建卡项` stays visible in the 1280px browser viewport.
2. Appointment order quick filters are split:
   - `quick=all` now means normal all-order staff scope;
   - `quick=douyin30` means Douyin Life 30-day ledger view;
   - dashboard slot links using `quick=all` no longer hide local staff bookings behind the Douyin ledger view.
3. Photo delivery no-photo state now exposes a direct upload-next action:
   - real action APIs remain gated by `buildAlbumActionAvailability`;
   - albums without negatives still do not allow fake notify/confirm/deliver success.

Validation:

```powershell
npm --prefix studio-workbench run test -- src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/albums/photoMgmtOperations.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/products/components/CardProductModal.contract.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/merchant/MerchantModuleChrome.contract.test.ts src/features/merchant/MerchantDecorationView.contract.test.ts
# 8 files / 142 tests passed

npm --prefix studio-workbench run build
# passed; no ECharts chunk warning
```

Deploy and smoke:

- Remote service: `yingyue-admin.service active`.
- `https://studio.evanshine.me/release.txt` -> `prod-e31a83a-workbench-real-actions-20260619-195346`.
- `nginx -t` -> successful.
- Routes HTTP `200`: `/order/appointment?quick=all`, `/order/appointment?quick=douyin30`, `/service/photos`, `/product/card-management`, `/merchant/decoration`.

Real logged-in browser checks:

- `/order/appointment?quick=all`: visible `全部订单`, `新增预约`, `预约订单`.
- `/order/appointment?quick=douyin30`: visible `抖音来客近30天`, `近30天来客`, `同步订单`.
- `/service/photos`: visible `客片操作`, `通知客户`, `客片确认`, `资料发送`; `needsUpload=1` shows `上传第一批底片` and no fake thumbnails.
- `/merchant/decoration`: visible `保存草稿`, `保存并下一步`, `发布上线`.
- `/product/card-management`: scoped top `添加储值卡` opens modal; `创建卡项` visible in viewport (`top=490`, `bottom=523`, viewport height `560`).

Rollback:

```bash
cp -a /opt/yingyue/backups/20260619-195447-pre-studio-workbench-prod-e31a83a-workbench-real-actions-20260619-195346/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## 2026-06-19 21:24 Card Product Store Binding Follow-up

Frontend release:

- `prod-e31a83a-card-product-store-scope-20260619-2120`
- Site: `https://studio.evanshine.me`
- Scope: frontend-only `studio-workbench`; backend jar and database unchanged.

Issue verified:

- Creating a card product previously showed success but the management table and card catalog could still be empty.
- Root causes:
  - new card payload did not bind a concrete workbench store;
  - product API mapping did not carry `yy_product.store_id` back to `ProductConfig`;
  - generic backend product rows returned after save did not infer `bizCategory=CARD` from card product `spec`.

Fixes shipped:

1. `ProductConfig`, `ProductDto`, and `ProductPayload` now carry product `storeId` / `storeBackendId`.
2. Backend product rows are mapped with `storeName` from cached `yy_store` data.
3. `mapProduct()` infers card product fields from `spec` values such as `储值卡`, `单项次卡`, and `共享次卡`.
4. `ProductCardManagementView` binds newly created cards to the current concrete workbench store and blocks creation until store data is loaded.

Validation:

```powershell
npm --prefix studio-workbench run test -- src/shared/stores/appStoreTransforms.test.ts src/features/products/ProductCardManagementView.contract.test.ts src/features/products/ProductCardCatalogView.contract.test.ts src/features/products/derivedProductModules.test.ts src/shared/stores/appStore.contract.test.ts
# 5 files / 42 tests passed

$env:VITE_STUDIO_DEMO='false'; $env:VITE_API_BASE_URL='https://api.evanshine.me'; $env:VITE_STUDIO_RELEASE_ID='local-card-product-store-scope-20260619'; npm --prefix studio-workbench run build
# passed; no chunk size warning
```

Deploy and smoke:

- `https://studio.evanshine.me/release.txt` -> `prod-e31a83a-card-product-store-scope-20260619-2120`.
- `nginx -t` -> successful.
- Routes HTTP `200`: `/product/card-management`, `/product/card-catalog`.

Real logged-in browser checks:

- `/product/card-management`: created draft card `Codex验收储值卡2120`; success notice appeared; table immediately showed the card; status showed `草稿 / 停用`.
- `/product/card-catalog`: current store `滨州万达店` showed `显示 2 / 2 个商品`; both old `Codex验收储值卡草稿` and new `Codex验收储值卡2120` were visible.
- `/service/photos`: real-store album scope currently has `0 / 0`; `通知客户 / 客片确认 / 资料发送` remain locked until an album is selected and photos are uploaded.
- `/merchant/decoration`: `保存草稿 / 保存并下一步 / 发布上线` remain visible after this frontend deployment.

Rollback:

```bash
cp -a /opt/yingyue/backups/prod-e31a83a-card-product-store-scope-20260619-2120-pre/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```
