import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { SimpleTable } from "@/components/simple-table";
import { getMarketingData } from "@/server/marketing";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type MarketingSearchParams = {
  month?: string | string[];
  channel?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function exportHref(filters: { month: string; channel: string | null }) {
  const params = new URLSearchParams({ month: filters.month });
  if (filters.channel) {
    params.set("channel", filters.channel);
  }
  return `/api/exports/marketing?${params.toString()}`;
}

export default async function MarketingPage({ searchParams }: { searchParams?: Promise<MarketingSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getMarketingData(session.brandId, {
    month: firstParam(params.month),
    channel: firstParam(params.channel)
  });

  return (
    <AppShell title="营销统计" activePath="/marketing" user={session}>
      <div className="space-y-6">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_auto_auto]" action="/marketing">
          <label className="text-sm font-medium text-slate-700">
            月份
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="month" name="month" defaultValue={data.filters.month} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            渠道
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="channel" defaultValue={data.filters.channel ?? ""}>
              <option value="">全部渠道</option>
              <option value="直营">直营</option>
              <option value="团购">团购</option>
              <option value="抖音">抖音</option>
              <option value="美团">美团</option>
            </select>
          </label>
          <button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">筛选</button>
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/marketing">
            重置
          </Link>
          <a className="self-end rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm text-slate-700" href={exportHref(data.filters)}>
            导出统计
          </a>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="预约总数" value={data.metrics.orderCount} delta={data.filters.month} tone="success" />
          <MetricCard label="渠道收入" value={data.metrics.revenue} delta={data.filters.channel ?? "全部渠道"} tone="success" />
          <MetricCard label="核销数" value={data.metrics.redeemedCount} delta="权益核销" tone="neutral" />
          <MetricCard label="核销金额" value={data.metrics.redeemedAmount} delta="已完成" tone="warning" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">渠道收入</h2>
            <SimpleTable headers={["渠道", "订单数", "收入", "核销数"]} rows={data.channelRows.length ? data.channelRows : [["暂无数据", "0 单", "¥0", "0 次"]]} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">核销明细</h2>
            <SimpleTable headers={["渠道", "状态", "金额", "备注"]} rows={data.redemptionRows.length ? data.redemptionRows : [["暂无核销", "-", "-", "-"]]} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">订购分析</h2>
          <SimpleTable headers={["渠道", "订单号", "客户/券码", "状态", "金额"]} rows={data.orderRows.length ? data.orderRows : [["暂无数据", "-", "-", "-", "¥0"]]} />
        </section>

        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示营销统计数据。</p> : null}
      </div>
    </AppShell>
  );
}
