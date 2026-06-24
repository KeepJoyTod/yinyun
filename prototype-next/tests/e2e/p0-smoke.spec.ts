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

test("P0 smoke: login, booking submission, order processing", async ({ page }) => {
  const customerName = `E2E客户${Date.now()}`;
  const customerPhone = `139${Date.now().toString().slice(-8)}`;

  await page.goto("/login");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page.getByRole("heading", { name: "首页仪表盘" })).toBeVisible();

  await page.goto("/booking");
  await page.getByPlaceholder("客户姓名").fill(customerName);
  await page.getByPlaceholder("手机号").fill(customerPhone);
  await page.getByRole("button", { name: "提交预约" }).click();
  await expect(page.getByText("预约已提交")).toBeVisible();
  const orderNo = (await page.locator("text=/YY\\d+/").last().textContent())?.trim();
  expect(orderNo).toMatch(/^YY\d+/);

  await page.goto("/orders");
  await page.getByPlaceholder("搜索订单号、客户、手机号、门店、产品、员工").fill(orderNo!);
  await expect(page.getByRole("cell", { name: orderNo })).toBeVisible();

  await page.getByRole("button", { name: "确认" }).click();
  await expect(page.getByRole("cell", { name: "待服务" })).toBeVisible();

  await page.getByRole("button", { name: "开始服务" }).click();
  await expect(page.getByRole("cell", { name: "服务中" })).toBeVisible();

  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.getByRole("cell", { name: "已完成" })).toBeVisible();
});
