import { SimpleTable } from "@/components/simple-table";
import type { ChannelPluginBoardData } from "@/server/channel";

function toneClass(tone: "success" | "warning" | "danger" | "neutral") {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-700";
    case "warning":
      return "bg-amber-50 text-amber-700";
    case "danger":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export function ChannelPluginManager({ data }: { data: ChannelPluginBoardData }) {
  return (
    <div className="space-y-5">
      {data.source === "fallback" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          当前为渠道插件占位数据，未接入真实抖音 / 美团授权。页面会优先展示“未开通 / 未授权”状态，便于后续授权接入。
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">渠道插件状态</h2>
            <p className="mt-1 text-sm text-slate-500">先保留授权、订单列表、订单详情和同步日志的统一入口，不接真实第三方 token。</p>
          </div>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">{data.source === "database" ? "数据库数据" : "演示数据"}</span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.plugins.map((plugin) => (
            <article key={plugin.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{plugin.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plugin.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass(plugin.statusTone)}`}>{plugin.statusLabel}</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoCard label="授权账号" value={plugin.accountName} />
                <InfoCard label="门店" value={plugin.storeName} />
                <InfoCard label="账号状态" value={plugin.accountStatusLabel} />
                <InfoCard label="最后同步" value={plugin.lastSyncAt} />
                <InfoCard label="账号数" value={plugin.accountCount} />
                <InfoCard label="映射数" value={plugin.mappingCount} />
              </dl>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <div className="font-medium text-slate-900">接口预留</div>
                <div className="mt-1">订单列表：{plugin.apiSearchList}</div>
                <div>订单详情：{plugin.apiOrderDetail}</div>
                <div className="mt-1 text-xs text-slate-500">{plugin.accountStatusMessage}</div>
              </div>

              {!plugin.enabled ? (
                <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{plugin.channelLabel} 当前未开通，后续走授权后再接真实同步。</div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">渠道授权账号</h2>
        <p className="mt-1 text-sm text-slate-500">账号、门店、token 过期时间统一放在这里，后续授权回调只需要补写这张表。</p>
        <div className="mt-4">
          <SimpleTable
            headers={["渠道", "授权账号", "门店", "状态", "appKey", "token 过期", "最后授权", "最后同步"]}
            rows={data.accounts.map((account) => [
              account.channelLabel,
              account.accountName,
              account.storeName,
              account.statusLabel,
              account.appKey,
              account.tokenExpiresAt,
              account.lastAuthorizedAt,
              account.lastSyncAt
            ])}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">同步日志</h2>
        <p className="mt-1 text-sm text-slate-500">只记录接口名、结果、耗时和错误摘要，方便后续排障和重试。</p>
        <div className="mt-4">
          <SimpleTable
            headers={["渠道", "API", "请求 ID", "状态", "耗时", "错误", "时间"]}
            rows={data.logs.map((log) => [log.channelLabel, log.apiName, log.requestId, log.statusLabel, log.durationMs, log.errorMessage, log.createdAt])}
          />
        </div>
      </section>
    </div>
  );
}
