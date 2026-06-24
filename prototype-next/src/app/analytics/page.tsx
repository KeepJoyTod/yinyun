import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SimpleTable } from "@/components/simple-table";
import { getAnalyticsData } from "@/server/analytics";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type AnalyticsSearchParams = {
  date?: string | string[];
  storeId?: string | string[];
  serviceGroupId?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnalyticsPage({ searchParams }: { searchParams?: Promise<AnalyticsSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getAnalyticsData(session.brandId, {
    date: firstParam(params.date),
    storeId: firstParam(params.storeId),
    serviceGroupId: firstParam(params.serviceGroupId)
  });

  return (
    <AppShell title="分析评价" activePath="/analytics" user={session}>
      <div className="space-y-6">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_260px_auto_auto]" action="/analytics">
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
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/analytics">
            重置
          </Link>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="客户数" value={data.customerMetrics.customerCount} delta="筛选期" tone="success" />
          <MetricCard label="复购客户" value={data.customerMetrics.repeatCustomerCount} delta="2单及以上" tone="neutral" />
          <MetricCard label="活跃客户" value={data.customerMetrics.activeCustomerCount} delta="未完成订单" tone="warning" />
          <MetricCard label="客单价" value={data.customerMetrics.averageOrderValue} delta="不含取消" tone="success" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">产品分析</h2>
            <SimpleTable headers={["产品", "数量", "收入"]} rows={data.productRows.length ? data.productRows : [["暂无数据", "0 件", "¥0"]]} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">评价概览</h2>
            <section className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="评价数" value={data.reviewSummary.reviewCount} delta="筛选期" tone="neutral" />
              <MetricCard label="平均评分" value={data.reviewSummary.averageRating} delta="满分5分" tone="success" />
            </section>
            <SimpleTable headers={["评分", "客户", "订单号", "内容", "时间"]} rows={data.reviewRows.length ? data.reviewRows : [["暂无评价", "-", "-", "-", "-"]]} />
          </div>
        </section>

        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示分析数据。</p> : null}
      </div>
    </AppShell>
  );
}
