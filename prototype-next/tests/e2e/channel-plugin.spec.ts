import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  execFileSync("npm", ["run", "prisma:seed"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32"
  });
});

test("channel smoke: plugin status and douyin order detail skeleton", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page.getByRole("heading", { name: "首页仪表盘" })).toBeVisible();

  await page.goto("/channel-plugins");
  await expect(page.getByRole("heading", { name: "渠道插件", exact: true })).toBeVisible();
  await expect(page.getByText("抖音渠道插件")).toBeVisible();
  await expect(page.getByText("美团渠道插件")).toBeVisible();
  await expect(page.getByText("订单列表：order.searchList", { exact: true })).toBeVisible();
  await expect(page.getByText("订单详情：order.orderDetail", { exact: true })).toBeVisible();
  await expect(page.getByText("未开通").first()).toBeVisible();

  await page.goto("/channel-orders");
  await expect(page.getByRole("heading", { name: "抖音订单", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("cell", { name: "DY202606010001" })).toBeVisible();
  await expect(page.getByText("订单详情预览")).toBeVisible();
  await expect(page.getByText(/接口：\s*order\.orderDetail/)).toBeVisible();

  const detailResponse = await page.request.get("/api/channel-orders/douyin/DY202606010001");
  expect(detailResponse.ok()).toBe(true);
  const detailBody = await detailResponse.json();
  expect(detailBody).toMatchObject({
    ok: true,
    data: {
      externalOrderId: "DY202606010001",
      detailApiName: "order.orderDetail"
    }
  });
});
