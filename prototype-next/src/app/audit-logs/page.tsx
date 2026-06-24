import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SimpleTable } from "@/components/simple-table";
import { getAuditLogData } from "@/server/audit-logs";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

type AuditLogSearchParams = {
  date?: string | string[];
  actor?: string | string[];
  target?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuditLogsPage({ searchParams }: { searchParams?: Promise<AuditLogSearchParams> }) {
  const session = await requireCurrentSession();
  const params = searchParams ? await searchParams : {};
  const data = await getAuditLogData(session.brandId, {
    date: firstParam(params.date),
    actor: firstParam(params.actor),
    target: firstParam(params.target)
  });

  return (
    <AppShell title="操作日志" activePath="/audit-logs" user={session}>
      <div className="space-y-5">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_220px_260px_auto_auto]" action="/audit-logs">
          <label className="text-sm font-medium text-slate-700">
            日期
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="date" name="date" defaultValue={data.filters.date} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            操作人
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="actor" defaultValue={data.filters.actor ?? ""} placeholder="姓名或系统账号" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            对象
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" name="target" defaultValue={data.filters.target ?? ""} placeholder="order / product / customer" />
          </label>
          <button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">筛选</button>
          <Link className="self-end rounded-xl border border-slate-200 px-4 py-2 text-center text-sm text-slate-700" href="/audit-logs">
            重置
          </Link>
        </form>

        <SimpleTable
          headers={["时间", "操作人", "动作", "对象", "详情"]}
          rows={data.logs.map((log) => [log.createdAt, log.actor, log.action, log.target, log.detail])}
        />
        {data.source === "fallback" ? <p className="text-sm text-slate-500">当前数据库未连接，页面展示演示操作日志。</p> : null}
      </div>
    </AppShell>
  );
}
