"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ServiceGroupRow, StoreOption } from "@/server/backoffice";

type ServiceGroupManagerProps = {
  initialGroups: ServiceGroupRow[];
  stores: StoreOption[];
  source: "database" | "fallback";
};

const emptyForm = {
  id: "",
  storeId: "",
  name: "",
  description: "",
  slotMinutes: 30,
  capacityPerSlot: 1
};

export function ServiceGroupManager({ initialGroups, stores, source }: ServiceGroupManagerProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [form, setForm] = useState(emptyForm);
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "18:00"
  });
  const [storeFilter, setStoreFilter] = useState("");
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可新增、修改、删除。" : null);
  const [submitting, setSubmitting] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!storeFilter) {
      return groups;
    }
    return groups.filter((group) => group.storeId === storeFilter || group.storeName === storeFilter);
  }, [groups, storeFilter]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(form.id ? `/api/service-groups/${form.id}` : "/api/service-groups", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: form.storeId || null,
          name: form.name,
          description: form.description,
          slotMinutes: form.slotMinutes,
          capacityPerSlot: form.capacityPerSlot
        })
      });
      const body = (await response.json()) as { ok: boolean; group?: ServiceGroupRow; message?: string };
      if (!body.ok || !body.group) {
        setMessage(body.message ?? "保存失败");
        return;
      }

      const saved = body.group;
      setGroups((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setForm(emptyForm);
      setMessage("服务组已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(group: ServiceGroupRow) {
    await patchGroup(group.id, { enabled: !group.enabled }, group.enabled ? "服务组已停用" : "服务组已启用");
  }

  async function remove(group: ServiceGroupRow) {
    if (!window.confirm(`确认删除服务组“${group.name}”？`)) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(`/api/service-groups/${group.id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok: boolean; message?: string };
      if (!body.ok) {
        setMessage(body.message ?? "删除失败");
        return;
      }
      setGroups((current) => current.filter((item) => item.id !== group.id));
      setMessage("服务组已删除");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function patchGroup(id: string, payload: Partial<ServiceGroupRow>, successMessage: string) {
    setMessage(null);
    try {
      const response = await fetch(`/api/service-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as { ok: boolean; group?: ServiceGroupRow; message?: string };
      if (!body.ok || !body.group) {
        setMessage(body.message ?? "操作失败");
        return;
      }
      const saved = body.group;
      setGroups((current) => current.map((item) => (item.id === id ? saved : item)));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function generateSlots(group: ServiceGroupRow) {
    setMessage(null);
    try {
      const response = await fetch(`/api/service-groups/${group.id}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm)
      });
      const body = (await response.json()) as {
        ok: boolean;
        result?: { created: number; skipped: number; total: number };
        message?: string;
      };
      if (!body.ok || !body.result) {
        setMessage(body.message ?? "生成档期失败");
        return;
      }
      setMessage(`已生成 ${body.result.total} 个档期，新增 ${body.result.created} 个，跳过 ${body.result.skipped} 个。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成档期失败");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">服务组维护</h2>
            <p className="mt-1 text-sm text-slate-500">对应 PRD 的 P0：查看、新增/编辑、删除/状态操作。</p>
          </div>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
          >
            <option value="">全部门店</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_120px_120px_auto]" onSubmit={submit}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="服务组名称"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.storeId}
            onChange={(event) => setForm((current) => ({ ...current, storeId: event.target.value }))}
          >
            <option value="">不绑定门店</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            min={5}
            max={480}
            type="number"
            value={form.slotMinutes}
            onChange={(event) => setForm((current) => ({ ...current, slotMinutes: Number(event.target.value) }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            min={1}
            max={99}
            type="number"
            value={form.capacityPerSlot}
            onChange={(event) => setForm((current) => ({ ...current, capacityPerSlot: Number(event.target.value) }))}
          />
          <button
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {form.id ? "保存修改" : "新增服务组"}
          </button>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm lg:col-span-4"
            placeholder="说明，例如：证件照拍摄、修图、冲印基础服务组"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          {form.id ? (
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              type="button"
              onClick={() => setForm(emptyForm)}
            >
              取消编辑
            </button>
          ) : null}
        </form>

        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">档期生成</h2>
          <p className="mt-1 text-sm text-slate-500">按服务组时长和容量批量生成可预约时段。</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="date"
            value={scheduleForm.date}
            onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="time"
            value={scheduleForm.startTime}
            onChange={(event) => setScheduleForm((current) => ({ ...current, startTime: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="time"
            value={scheduleForm.endTime}
            onChange={(event) => setScheduleForm((current) => ({ ...current, endTime: event.target.value }))}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {filteredGroups.map((group) => (
          <article key={group.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{group.storeName}</p>
              </div>
              <span className={group.enabled ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"}>
                {group.enabled ? "启用" : "停用"}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">时长</dt>
                <dd className="mt-1 font-medium">{group.slotMinutes} 分钟</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">容量</dt>
                <dd className="mt-1 font-medium">{group.capacityPerSlot} 人</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">产品</dt>
                <dd className="mt-1 font-medium">{group.productCount} 个</dd>
              </div>
            </dl>
            {group.description ? <p className="mt-3 text-sm text-slate-500">{group.description}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onClick={() =>
                  setForm({
                    id: group.id,
                    storeId: group.storeId ?? "",
                    name: group.name,
                    description: group.description,
                    slotMinutes: group.slotMinutes,
                    capacityPerSlot: group.capacityPerSlot
                  })
                }
              >
                修改
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => toggle(group)}>
                {group.enabled ? "停用" : "启用"}
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => generateSlots(group)}>
                生成档期
              </button>
              <button className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => remove(group)}>
                删除
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
