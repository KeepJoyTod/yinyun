import Link from "next/link";
import type { ChannelOrderBoardData, ChannelOrderDetailData } from "@/server/channel";

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

function DetailBlock({ detail }: { detail: ChannelOrderDetailData | null }) {
  if (!detail) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold">订单详情预览</h3>
        <p className="mt-2 text-sm text-slate-500">当前没有可预览的抖音订单详情，等授权和同步数据后这里会展示 `order.orderDetail` 的返回结果。</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold">订单详情预览</h3>
      <p className="mt-1 text-sm text-slate-500">
        接口：<span className="font-medium text-slate-900">{detail.detailApiName}</span>，同步状态：<span className="font-medium text-slate-900">{detail.syncStatusLabel}</span>
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">外部订单号</dt>
          <dd className="mt-1 text-sm font-medium">{detail.externalOrderId}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">客户</dt>
          <dd className="mt-1 text-sm font-medium">{detail.customerName}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">商品</dt>
          <dd className="mt-1 text-sm font-medium">{detail.productName}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">金额</dt>
          <dd className="mt-1 text-sm font-medium">{detail.amount}</dd>
        </div>
      </dl>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{detail.rawPayloadObject}</pre>
    </div>
  );
}

export function ChannelOrderManager({ data, detail }: { data: ChannelOrderBoardData; detail: ChannelOrderDetailData | null }) {
  const firstOrder = data.orders[0]
    ? ({
        ...data.orders[0],
        source: data.source,
        rawPayloadObject: data.orders[0].rawPayload
      } satisfies ChannelOrderDetailData)
    : null;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">抖音订单</h2>
            <p className="mt-1 text-sm text-slate-500">先做列表同步骨架和详情接口骨架，后续再决定是否把外部订单自动转成本地预约单。</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass(data.plugin.statusTone)}`}>{data.plugin.statusLabel}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">列表接口</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{data.searchApiName}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">详情接口</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{data.detailApiName}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">接入策略</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{data.note}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">订单列表</h2>
            <p className="mt-1 text-sm text-slate-500">展示外部订单号、外部状态、本地映射和同步状态，详情会直接跳到接口返回。</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{data.orders.length} 条</span>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1280px] border-collapse text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                {["外部订单号", "客户", "手机号", "商品", "金额", "外部状态", "本地单号", "同步状态", "预约时间", "最后同步", "详情"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.orders.length ? (
                data.orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.externalOrderId}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerPhone}</td>
                    <td className="px-4 py-3 text-slate-700">{order.productName}</td>
                    <td className="px-4 py-3 text-slate-700">{order.amount}</td>
                    <td className="px-4 py-3 text-slate-700">{order.externalStatus}</td>
                    <td className="px-4 py-3 text-slate-700">{order.localOrderNo}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass(order.syncStatusTone)}`}>{order.syncStatusLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order.scheduledAt}</td>
                    <td className="px-4 py-3 text-slate-700">{order.lastSyncedAt}</td>
                    <td className="px-4 py-3">
                      <Link className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50" href={`/api/channel-orders/douyin/${order.externalOrderId}`} target="_blank" rel="noreferrer">
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={11}>
                    暂无抖音订单同步数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <DetailBlock detail={detail ?? firstOrder} />
    </div>
  );
}
