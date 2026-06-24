import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SimpleTable } from "@/components/simple-table";
import { getPerformanceData } from "@/server/performance";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type PerformanceSearchParams = {
  month?: string | string[];
  storeId?: string | string[];
  staffId?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function exportHref(filters: { month: string; storeId: string | null; staffId: string | null }) {
  const params = new URLSearchParams({ month: filters.month });
  if (filters.storeId) {
    params.set("storeId", filters.storeId);
  }
  if (filters.staffId) {
    params.set("staffId", filters.staffId);
  }
  return `/api/exports/performance?${params.toString()}`;
}

export default async function PerformancePage({ searchParams }: { searchParams?: Promise<PerformanceSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getPerformanceData(session.brandId, {
    month: firstParam(params.month),
    storeId: firstParam(params.storeId),
    staffId: firstParam(params.staffId)
  });

  return (
    <AppShell title="业绩月报" activePath="/performance" user={session}>
      <div className="space-y-6">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_260px_auto_auto_auto]" action="/performance">
          <label className="text-sm font-medium text-slate-700">
            月份
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="month" name="month" defaultValue={data.filters.month} />
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
            员工
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="staffId" defaultValue={data.filters.staffId ?? ""}>
              <option value="">全部员工</option>
              {data.staff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} / {staff.storeName}
                </option>
              ))}
            </select>
          </label>
          <button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">筛选</button>
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/performance">
            重置
          </Link>
          <a className="self-end rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm text-slate-700" href={exportHref(data.filters)}>
            导出月报
          </a>
        </form>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">员工业绩</h2>
            <SimpleTable headers={["员工", "订单数", "完成数", "收入"]} rows={data.staffRows.length ? data.staffRows : [["暂无数据", "0 单", "0 单", "¥0"]]} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">门店月报</h2>
            <SimpleTable headers={["门店", "订单数", "完成数", "收入"]} rows={data.storeRows.length ? data.storeRows : [["暂无数据", "0 单", "0 单", "¥0"]]} />
          </div>
        </section>

        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示业绩数据。</p> : null}
      </div>
    </AppShell>
  );
}
