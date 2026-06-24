# Studio Workbench Dashboard Finance API Evidence - 2026-06-17

## Scope

- Added backend `GET /yy/dashboard/finance`.
- Aggregates dashboard business overview from `yy_order`.
- Operational date priority: `slotDate`, then `arrivalTime`, then `orderTime`.
- Frontend `studio-workbench` now uses backend finance data first and falls back to local order cache only when unavailable.

## Verification

```powershell
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyDashboardServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Result: `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`.

```powershell
npm --prefix studio-workbench run test -- src/shared/api/backend.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/shared/stores/appStore.contract.test.ts
```

Result: `3 passed`, `58 passed`.

```powershell
npm --prefix studio-workbench run build
```

Result: `vue-tsc -b && vite build` passed. Vite still reports the existing large chunk warning for `echarts-vendor`.

## Notes

- No Douyin OpenAPI call is made by this dashboard endpoint.
- No new finance ledger table was introduced.
- Discount amount remains `0` until a real discount field or payment ledger exists.
