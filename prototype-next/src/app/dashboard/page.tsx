import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SimpleTable } from "@/components/simple-table";
import { getDashboardOverview } from "@/server/backoffice";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type DashboardSearchParams = {
  date?: string | string[];
  storeId?: string | string[];
  serviceGroupId?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<DashboardSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getDashboardOverview(session.brandId, {
    date: firstParam(params.date),
    storeId: firstParam(params.storeId),
    serviceGroupId: firstParam(params.serviceGroupId)
  });

  return (
    <AppShell title="首页仪表盘" activePath="/dashboard" user={session}>
      <div className="space-y-6">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_260px_auto_auto]" action="/dashboard">
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
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/dashboard">
            重置
          </Link>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">预约列表</h2>
              <span className="text-sm text-slate-500">最近 5 条</span>
            </div>
            <div className="space-y-3">
              {data.orders.length ? (
                data.orders.map((item, index) => (
                  <div key={`${item.title}-${item.meta}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{item.status}</div>
                        <div className="text-sm text-slate-500">{item.meta}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">当前筛选条件下暂无预约。</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">经营概况</h2>
            <SimpleTable
              headers={["指标", "今日"]}
              rows={data.businessRows}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">服务订单状态</h2>
            <SimpleTable headers={["状态", "数量"]} rows={data.appointmentOverview.statusRows} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">预约时段工位</h2>
            <SimpleTable headers={["门店", "工位/时段"]} rows={data.appointmentOverview.workstationRows.length ? data.appointmentOverview.workstationRows : [["暂无", "0 个预约时段"]]} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">预约趋势</h2>
            <SimpleTable headers={["日期", "预约数"]} rows={data.appointmentOverview.trendRows.length ? data.appointmentOverview.trendRows : [[data.filters.date, "0 单"]]} />
          </div>
        </section>
        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示数据。</p> : null}
      </div>
    </AppShell>
  );
}
