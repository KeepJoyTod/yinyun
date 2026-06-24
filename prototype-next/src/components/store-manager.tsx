"use client";

import { FormEvent, useState } from "react";
import type { StoreManagementRow } from "@/server/stores";

type StoreManagerProps = {
  initialStores: StoreManagementRow[];
  source: "database" | "fallback";
};

const emptyForm = {
  id: "",
  name: "",
  phone: "",
  address: ""
};

export function StoreManager({ initialStores, source }: StoreManagerProps) {
  const [stores, setStores] = useState(initialStores);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可新增、修改、删除。" : null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(form.id ? `/api/stores/${form.id}` : "/api/stores", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          address: form.address || null
        })
      });
      const body = (await response.json()) as { ok: boolean; store?: StoreManagementRow; message?: string };
      if (!body.ok || !body.store) {
        setMessage(body.message ?? "保存失败");
        return;
      }

      const saved = body.store;
      setStores((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setForm(emptyForm);
      setMessage("门店已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(store: StoreManagementRow) {
    await patchStore(store.id, { enabled: !store.enabled }, store.enabled ? "门店已停用" : "门店已启用");
  }

  async function remove(store: StoreManagementRow) {
    if (!window.confirm(`确认删除门店“${store.name}”？`)) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(`/api/stores/${store.id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok: boolean; message?: string };
      if (!body.ok) {
        setMessage(body.message ?? "删除失败");
        return;
      }
      setStores((current) => current.filter((item) => item.id !== store.id));
      setMessage("门店已删除");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function patchStore(id: string, payload: Partial<StoreManagementRow>, successMessage: string) {
    setMessage(null);
    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as { ok: boolean; store?: StoreManagementRow; message?: string };
      if (!body.ok || !body.store) {
        setMessage(body.message ?? "操作失败");
        return;
      }
      const saved = body.store;
      setStores((current) => current.map((item) => (item.id === id ? saved : item)));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">门店维护</h2>
          <p className="mt-1 text-sm text-slate-500">对应 P0：新增、编辑、启停、删除门店；已有订单门店禁止删除。</p>
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_1.5fr_auto]" onSubmit={submit}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="门店名称"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="联系电话"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="门店地址"
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          />
          <button
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {form.id ? "保存修改" : "新增门店"}
          </button>
          {form.id ? (
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm lg:col-start-4" type="button" onClick={() => setForm(emptyForm)}>
              取消编辑
            </button>
          ) : null}
        </form>

        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {stores.map((store) => (
          <article key={store.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{store.name}</h2>
              <span className={store.enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"}>
                {store.status}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><dt>员工</dt><dd>{store.staff}</dd></div>
              <div className="flex justify-between"><dt>本月订单</dt><dd>{store.monthOrderCount}</dd></div>
              <div className="flex justify-between"><dt>待服务单</dt><dd>{store.waitingServiceCount}</dd></div>
              <div className="flex justify-between"><dt>档期</dt><dd>{store.slots}</dd></div>
              <div className="flex justify-between"><dt>电话</dt><dd>{store.phone}</dd></div>
              <div className="flex justify-between gap-4"><dt>地址</dt><dd className="text-right">{store.address}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onClick={() => setForm({ id: store.id, name: store.name, phone: store.phone === "-" ? "" : store.phone, address: store.address === "-" ? "" : store.address })}
              >
                修改
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => toggle(store)}>
                {store.enabled ? "停用" : "启用"}
              </button>
              <button className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => remove(store)}>
                删除
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
