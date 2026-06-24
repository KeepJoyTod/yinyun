"use client";

import { Fragment, useMemo, useState } from "react";
import type { CustomerManagementRow } from "@/server/customers";

export function CustomerManager({ initialCustomers, source }: { initialCustomers: CustomerManagementRow[]; source: "database" | "fallback" }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [keyword, setKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可维护客户备注。" : null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { name: string; phone: string; remark: string }>>({});

  const filteredCustomers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return customers.filter((customer) => !q || [customer.name, customer.phone, customer.remark].join(" ").toLowerCase().includes(q));
  }, [customers, keyword]);

  function getDraft(customer: CustomerManagementRow) {
    return drafts[customer.id] ?? { name: customer.name, phone: customer.phone, remark: customer.remark };
  }

  function setDraft(customer: CustomerManagementRow, patch: Partial<{ name: string; phone: string; remark: string }>) {
    setDrafts((current) => ({
      ...current,
      [customer.id]: {
        ...getDraft(customer),
        ...patch
      }
    }));
  }

  async function save(customer: CustomerManagementRow) {
    const draft = getDraft(customer);
    setLoadingId(customer.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const body = (await response.json()) as { ok: boolean; customer?: CustomerManagementRow; message?: string };
      if (!body.ok || !body.customer) {
        setMessage(body.message ?? "保存客户失败");
        return;
      }

      const saved = body.customer;
      setCustomers((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setDrafts((current) => ({ ...current, [saved.id]: { name: saved.name, phone: saved.phone, remark: saved.remark } }));
      setMessage("客户资料已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存客户失败");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="搜索客户姓名、手机号、备注"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm" type="button" onClick={() => setKeyword("")}>
            重置
          </button>
        </div>
        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              {["客户", "手机号", "订单数", "进行中", "已完成", "消费金额", "最近预约", "备注", "操作"].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const draft = getDraft(customer);
              return (
                <Fragment key={customer.id}>
                  <tr className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.activeCount}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.completedCount}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.totalSpent}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.latestOrderAt}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-700">{customer.remark || "-"}</td>
                    <td className="px-4 py-3">
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}>
                        {expandedId === customer.id ? "收起" : "详情"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === customer.id ? (
                    <tr className="border-t border-slate-100 bg-slate-50/70">
                      <td className="px-4 py-4" colSpan={9}>
                        <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
                          <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                value={draft.name}
                                onChange={(event) => setDraft(customer, { name: event.target.value })}
                              />
                              <input
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                value={draft.phone}
                                onChange={(event) => setDraft(customer, { phone: event.target.value })}
                              />
                            </div>
                            <textarea
                              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              placeholder="客户备注"
                              value={draft.remark}
                              onChange={(event) => setDraft(customer, { remark: event.target.value })}
                            />
                            <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={loadingId === customer.id} onClick={() => save(customer)}>
                              保存客户
                            </button>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-100">
                                <tr>
                                  {["订单号", "时间", "产品", "状态", "金额"].map((header) => (
                                    <th key={header} className="px-3 py-2 text-left font-medium text-slate-600">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {customer.recentOrders.map((order) => (
                                  <tr key={order.orderNo} className="border-t border-slate-100">
                                    <td className="px-3 py-2">{order.orderNo}</td>
                                    <td className="px-3 py-2">{order.scheduledAt}</td>
                                    <td className="px-3 py-2">{order.products}</td>
                                    <td className="px-3 py-2">{order.statusLabel}</td>
                                    <td className="px-3 py-2">{order.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
