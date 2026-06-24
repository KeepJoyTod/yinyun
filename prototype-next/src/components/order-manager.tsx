"use client";

import { Fragment, useMemo, useState } from "react";
import type { OrderAction } from "@/domain/order";
import type { OrderManagementRow, StaffOption } from "@/server/backoffice";

export function OrderManager({ initialOrders, staffOptions }: { initialOrders: OrderManagementRow[]; staffOptions: StaffOption[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const [arrivalDateFilter, setArrivalDateFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { scheduledAt: string; staffId: string; remark: string }>>({});

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatched = !statusFilter || order.status === statusFilter;
      const storeMatched = !storeFilter || order.storeName === storeFilter;
      const sourceMatched = !sourceFilter || order.source === sourceFilter;
      const methodMatched = !methodFilter || order.bookingMethod === methodFilter;
      const createdMatched = !createdDateFilter || order.createdAtDate === createdDateFilter;
      const arrivalMatched = !arrivalDateFilter || order.arrivalAtDate === arrivalDateFilter;
      const keywordMatched =
        !normalizedKeyword ||
        [order.orderNo, order.customerName, order.customerPhone, order.storeName, order.products, order.staffName, order.sourceLabel, order.bookingMethodLabel]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
      return statusMatched && storeMatched && sourceMatched && methodMatched && createdMatched && arrivalMatched && keywordMatched;
    });
  }, [arrivalDateFilter, createdDateFilter, keyword, methodFilter, orders, sourceFilter, statusFilter, storeFilter]);

  const storeOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.storeName))).filter(Boolean), [orders]);

  function detailDraft(order: OrderManagementRow) {
    return drafts[order.id] ?? { scheduledAt: order.scheduledAtInput, staffId: order.staffId ?? "", remark: order.remark };
  }

  function setDetailDraft(order: OrderManagementRow, patch: Partial<{ scheduledAt: string; staffId: string; remark: string }>) {
    setDrafts((current) => ({
      ...current,
      [order.id]: {
        ...detailDraft(order),
        ...patch
      }
    }));
  }

  async function runAction(order: OrderManagementRow, action: OrderAction) {
    let cancelReason: string | null = null;
    if (action === "CANCEL") {
      cancelReason = window.prompt(`请输入取消订单“${order.orderNo}”的原因`)?.trim() ?? "";
      if (!cancelReason) {
        setMessage("取消订单必须填写原因");
        return;
      }
    }

    setLoadingId(order.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cancelReason })
      });
      const body = (await response.json()) as { ok: boolean; order?: OrderManagementRow; message?: string };

      if (!body.ok || !body.order) {
        setMessage(body.message ?? "订单操作失败");
        return;
      }

      const updated = body.order;
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("订单状态已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "订单操作失败");
    } finally {
      setLoadingId(null);
    }
  }

  async function saveDetails(order: OrderManagementRow) {
    const draft = detailDraft(order);
    setLoadingId(order.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: draft.scheduledAt,
          staffId: draft.staffId || null,
          remark: draft.remark
        })
      });
      const body = (await response.json()) as { ok: boolean; order?: OrderManagementRow; message?: string };
      if (!body.ok || !body.order) {
        setMessage(body.message ?? "保存订单详情失败");
        return;
      }

      const updated = body.order;
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDrafts((current) => ({ ...current, [updated.id]: { scheduledAt: updated.scheduledAtInput, staffId: updated.staffId ?? "", remark: updated.remark } }));
      setMessage("订单详情已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存订单详情失败");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[160px_180px_160px_160px_160px_160px_1fr_auto]">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            <option value="PENDING_CONFIRM">待确认</option>
            <option value="WAITING_SERVICE">待服务</option>
            <option value="IN_SERVICE">服务中</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
            <option value="">全部门店</option>
            {storeOptions.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="">全部来源</option>
            <option value="ONLINE">线上</option>
            <option value="DOUYIN">抖音</option>
            <option value="MEITUAN">美团</option>
            <option value="WALK_IN">到店</option>
            <option value="PHONE">电话</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
            <option value="">全部方式</option>
            <option value="ONLINE">线上预约</option>
            <option value="STORE">到店预约</option>
            <option value="PHONE">电话预约</option>
          </select>
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="date" value={createdDateFilter} onChange={(event) => setCreatedDateFilter(event.target.value)} title="下单时间" />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="date" value={arrivalDateFilter} onChange={(event) => setArrivalDateFilter(event.target.value)} title="到店时间" />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="搜索订单号、客户、手机号、门店、产品、员工"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm" type="button" onClick={() => { setStatusFilter(""); setStoreFilter(""); setSourceFilter(""); setMethodFilter(""); setCreatedDateFilter(""); setArrivalDateFilter(""); setKeyword(""); }}>
            重置
          </button>
        </div>
      </div>

      {message ? <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              {["订单号", "客户", "手机号", "门店", "来源", "方式", "下单时间", "到店时间", "员工", "产品", "状态", "金额", "操作"].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const draft = detailDraft(order);
              return (
                <Fragment key={order.id}>
                  <tr className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.orderNo}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerPhone}</td>
                    <td className="px-4 py-3 text-slate-700">{order.storeName}</td>
                    <td className="px-4 py-3 text-slate-700">{order.sourceLabel}</td>
                    <td className="px-4 py-3 text-slate-700">{order.bookingMethodLabel}</td>
                    <td className="px-4 py-3 text-slate-700">{order.createdAtDate}</td>
                    <td className="px-4 py-3 text-slate-700">{order.scheduledAt}</td>
                    <td className="px-4 py-3 text-slate-700">{order.staffName}</td>
                    <td className="px-4 py-3 text-slate-700">{order.products}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{order.statusLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                          {expandedId === order.id ? "收起" : "详情"}
                        </button>
                        {order.actions.length ? (
                          order.actions.map((item) => (
                            <button
                              key={item.action}
                              className={item.action === "CANCEL" ? "rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 disabled:opacity-50" : "rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 disabled:opacity-50"}
                              disabled={loadingId === order.id}
                              onClick={() => runAction(order, item.action)}
                            >
                              {item.label}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">无可用操作</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id ? (
                    <tr className="border-t border-slate-100 bg-slate-50/70">
                      <td className="px-4 py-4" colSpan={13}>
                        <div className="grid gap-3 lg:grid-cols-[220px_220px_1fr_auto]">
                          <input
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            type="datetime-local"
                            value={draft.scheduledAt}
                            onChange={(event) => setDetailDraft(order, { scheduledAt: event.target.value })}
                          />
                          <select
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            value={draft.staffId}
                            onChange={(event) => setDetailDraft(order, { staffId: event.target.value })}
                          >
                            <option value="">未分配员工</option>
                            {staffOptions.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name} / {staff.storeName}
                              </option>
                            ))}
                          </select>
                          <input
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            placeholder="订单备注"
                            value={draft.remark}
                            onChange={(event) => setDetailDraft(order, { remark: event.target.value })}
                          />
                          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={loadingId === order.id} onClick={() => saveDetails(order)}>
                            保存详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
