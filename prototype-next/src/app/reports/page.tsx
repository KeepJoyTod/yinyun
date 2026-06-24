import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SimpleTable } from "@/components/simple-table";
import { getReportData } from "@/server/reports";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type ReportSearchParams = {
  date?: string | string[];
  storeId?: string | string[];
  serviceGroupId?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function exportHref(filters: { date: string; storeId: string | null; serviceGroupId: string | null }) {
  const params = new URLSearchParams({ date: filters.date });
  if (filters.storeId) {
    params.set("storeId", filters.storeId);
  }
  if (filters.serviceGroupId) {
    params.set("serviceGroupId", filters.serviceGroupId);
  }
  return `/api/exports/reports?${params.toString()}`;
}

export default async function ReportsPage({ searchParams }: { searchParams?: Promise<ReportSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getReportData(session.brandId, {
    date: firstParam(params.date),
    storeId: firstParam(params.storeId),
    serviceGroupId: firstParam(params.serviceGroupId)
  });

  return (
    <AppShell title="经营报表" activePath="/reports" user={session}>
      <div className="space-y-6">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_260px_auto_auto_auto]" action="/reports">
          <label className="text-sm font-medium text-slate-700">
            日期
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="date" name="date" defaultValue={data.filters.date} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            门店
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="storeId" defaultValue={data.filters.storeId ?? ""}>
              <option value="">全部门店</option>
              {data.stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            服务组
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="serviceGroupId" defaultValue={data.filters.serviceGroupId ?? ""}>
              <option value="">全部服务组</option>
              {data.serviceGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} / {group.storeName}
                </option>
              ))}
            </select>
          </label>
          <button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">筛选</button>
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/reports">
            重置
          </Link>
          <a className="self-end rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm text-slate-700" href={exportHref(data.filters)}>
            导出报表
          </a>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="预约总数" value={data.metrics.orderCount} delta={data.filters.date} tone="success" />
          <MetricCard label="预计收入" value={data.metrics.grossRevenue} delta="不含取消" tone="success" />
          <MetricCard label="已收款" value={data.metrics.paidRevenue} delta="订单口径" tone="neutral" />
          <MetricCard label="已退款" value={data.metrics.refundedRevenue} delta="退款口径" tone="warning" />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">服务组统计</h2>
            <SimpleTable headers={["服务组", "订单数", "收入"]} rows={data.serviceGroupRows.length ? data.serviceGroupRows : [["暂无数据", "0 单", "¥0"]]} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">收支统计</h2>
            <SimpleTable headers={["状态", "订单数", "金额"]} rows={data.paymentRows} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">产品统计</h2>
          <SimpleTable headers={["产品", "数量", "收入"]} rows={data.productRows.length ? data.productRows : [["暂无数据", "0 件", "¥0"]]} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">近期订单</h2>
          <SimpleTable headers={["订单号", "客户", "门店", "服务组", "状态", "收款", "预约时间", "金额"]} rows={data.orderRows.length ? data.orderRows : [["暂无数据", "-", "-", "-", "-", "-", "-", "¥0"]]} />
        </section>

        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示报表数据。</p> : null}
      </div>
    </AppShell>
  );
}
