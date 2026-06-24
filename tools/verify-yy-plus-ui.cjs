const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = process.cwd();
const BASE_URL = process.env.BASE_URL || "http://localhost:5174";
const OUT_DIR = path.join(ROOT, "output", "playwright", "yy-plus-ui");
const HEADLESS = process.env.HEADLESS !== "0";

const ROUTES = [
  { name: "预约概况", url: "/yy/dashboard", file: "yy-dashboard.png", expect: ["预约", "订单"] },
  { name: "预约订单", url: "/yy/order", file: "yy-order.png", expect: ["YY202606010001", "李女士"] },
  { name: "门店管理", url: "/yy/store", file: "yy-store.png", expect: ["朝阳旗舰店", "徐汇亲子店"] },
  { name: "产品管理/在线选片配置", url: "/yy/product", file: "yy-product.png", expect: ["证件照精修套餐", "选片"] },
  { name: "客片选片", url: "/yy/photo", file: "yy-photo.png", tabText: "底片列表", expect: ["IMG_0001.jpg", "客户已选底片"] },
  { name: "抖音产品插件", url: "/yy/channel-douyin", file: "yy-channel-douyin.png", expect: ["抖音", "未开通"] },
  { name: "美团产品插件", url: "/yy/channel-meituan", file: "yy-channel-meituan.png", expect: ["美团", "未开通"] },
  { name: "企业版结构", url: "/yy/enterprise", file: "yy-enterprise.png", expect: ["企业版结构", "下一批模块清单"] },
  { name: "预约配置", url: "/yy/booking-config", file: "yy-booking-config.png", expect: ["预约配置", "服务组"] },
  { name: "员工管理", url: "/yy/employee", file: "yy-employee.png", expect: ["员工管理", "订单分配"] },
  { name: "客户管理", url: "/yy/customer", file: "yy-customer.png", expect: ["客户管理", "客户档案"] },
  { name: "通知中心", url: "/yy/notification", file: "yy-notification.png", expect: ["通知中心", "发送日志"] },
  { name: "经营报表", url: "/yy/report", file: "yy-report.png", expect: ["经营报表", "日报快照"] },
  { name: "多端预约", url: "/yy/mobile", file: "yy-mobile.png", expect: ["多端预约", "微信小程序"] },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUi(page, ms = 1200) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
  await sleep(ms);
}

async function loginIfNeeded(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitUi(page, 1800);
  if (!page.url().includes("/login")) return;

  const username = page.getByPlaceholder("用户名");
  const password = page.getByPlaceholder("密码");
  if (await username.count()) await username.fill("admin");
  if (await password.count()) await password.fill("admin123");
  await page.getByRole("button", { name: /^登\s*录$/ }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 }).catch(() => {});
  await waitUi(page, 2200);

  if (page.url().includes("/login")) {
    const text = await page.locator("body").innerText().catch(() => "");
    throw new Error(`登录未跳出登录页：${text.replace(/\s+/g, " ").slice(0, 160)}`);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  page.setDefaultTimeout(25000);

  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    const url = response.url();
    if (response.status() >= 400 && /\/(yy|auth|system)\//.test(url)) {
      failedResponses.push({ status: response.status(), url });
    }
  });

  await loginIfNeeded(page);

  const results = [];
  for (const route of ROUTES) {
    await page.goto(BASE_URL + route.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitUi(page, 2200);
    if (route.tabText) {
      await page.getByRole("tab", { name: route.tabText }).click();
      await waitUi(page, 1800);
    }
    for (const item of route.expect) {
      await page.getByText(item, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
    }
    const text = await page.locator("body").innerText().catch(() => "");
    const missing = route.expect.filter((item) => !text.includes(item));
    await page.screenshot({ path: path.join(OUT_DIR, route.file), fullPage: true, animations: "disabled" });
    results.push({
      name: route.name,
      url: route.url,
      ok: missing.length === 0,
      missing,
      textSample: text.replace(/\s+/g, " ").slice(0, 180),
    });
  }

  const report = {
    baseUrl: BASE_URL,
    screenshotDir: OUT_DIR,
    results,
    consoleErrors: consoleErrors.slice(0, 20),
    failedResponses: failedResponses.slice(0, 20),
  };
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  await browser.close();

  if (results.some((item) => !item.ok) || failedResponses.length > 0) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
