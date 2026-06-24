# Studio Workbench yy-demo Permission Fix 2026-06-12

## Result

`yy-demo` failed to enter `https://studio.evanshine.me/photo-mgmt` with:

```text
没有访问权限，请联系管理员授权
```

Root cause: the account was enabled, but it only had `superadmin`; in this production database that role currently had only one menu binding, so the workbench API permission checks still failed.

## Fix

Added the existing minimal workbench role `studio_staff` to `yy-demo`.

No password, customer data, order data, or existing role was changed.

## Production Evidence

```text
yy-demo -> user_id=990001, status=0, del_flag=0, tenant_id=000000
yy-demo roles -> studio_staff, superadmin
studio_staff role menu rows -> 16
```

## Required User Action

If the browser still has the previous failed token cached, log out and log in again as `yy-demo`, or clear the site local storage and retry.
