"use client";

import { FormEvent, useMemo, useState } from "react";
import type { StaffManagementRow, StaffStoreOption } from "@/server/staff";

type StaffManagerProps = {
  initialStaff: StaffManagementRow[];
  stores: StaffStoreOption[];
  source: "database" | "fallback";
};

const emptyForm = {
  id: "",
  storeId: "",
  name: "",
  phone: "",
  position: ""
};

export function StaffManager({ initialStaff, stores, source }: StaffManagerProps) {
  const [staffRows, setStaffRows] = useState(initialStaff);
  const [form, setForm] = useState(emptyForm);
  const [storeFilter, setStoreFilter] = useState("");
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可维护员工。" : null);
  const [submitting, setSubmitting] = useState(false);

  const filteredStaff = useMemo(
    () => staffRows.filter((staff) => !storeFilter || staff.storeId === storeFilter),
    [staffRows, storeFilter]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(form.id ? `/api/staff/${form.id}` : "/api/staff", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: form.storeId || null,
          name: form.name,
          phone: form.phone || null,
          position: form.position || null
        })
      });
      const body = (await response.json()) as { ok: boolean; staff?: StaffManagementRow; message?: string };
      if (!body.ok || !body.staff) {
        setMessage(body.message ?? "保存失败");
        return;
      }

      const saved = body.staff;
      setStaffRows((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setForm(emptyForm);
      setMessage("员工已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(staff: StaffManagementRow) {
    await patchStaff(staff.id, { enabled: !staff.enabled }, staff.enabled ? "员工已停用" : "员工已启用");
  }

  async function remove(staff: StaffManagementRow) {
    if (!window.confirm(`确认删除员工“${staff.name}”？`)) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok: boolean; message?: string };
      if (!body.ok) {
        setMessage(body.message ?? "删除失败");
        return;
      }
      setStaffRows((current) => current.filter((item) => item.id !== staff.id));
      setMessage("员工已删除");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function patchStaff(id: string, payload: Partial<StaffManagementRow>, successMessage: string) {
    setMessage(null);
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as { ok: boolean; staff?: StaffManagementRow; message?: string };
      if (!body.ok || !body.staff) {
        setMessage(body.message ?? "操作失败");
        return;
      }
      const saved = body.staff;
      setStaffRows((current) => current.map((item) => (item.id === id ? saved : item)));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">员工维护</h2>
          <p className="mt-1 text-sm text-slate-500">维护员工资料、所属门店和在职状态，订单详情里可直接分配员工。</p>
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[180px_1fr_180px_180px_auto]" onSubmit={submit}>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.storeId}
            onChange={(event) => setForm((current) => ({ ...current, storeId: event.target.value }))}
          >
            <option value="">未绑定门店</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="员工姓名"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="手机号"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="岗位"
            value={form.position}
            onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
          />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {form.id ? "保存修改" : "新增员工"}
          </button>
          {form.id ? (
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm lg:col-start-5" type="button" onClick={() => setForm(emptyForm)}>
              取消编辑
            </button>
          ) : null}
        </form>

        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
            <option value="">全部门店</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <div className="flex items-center text-sm text-slate-500">共 {filteredStaff.length} 位员工</div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              {["员工", "门店", "岗位", "手机号", "订单归属", "状态", "操作"].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{staff.name}</td>
                <td className="px-4 py-3 text-slate-700">{staff.storeName}</td>
                <td className="px-4 py-3 text-slate-700">{staff.position}</td>
                <td className="px-4 py-3 text-slate-700">{staff.phone}</td>
                <td className="px-4 py-3 text-slate-700">{staff.orderCount} 单</td>
                <td className="px-4 py-3">
                  <span className={staff.enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"}>
                    {staff.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      onClick={() => setForm({ id: staff.id, storeId: staff.storeId ?? "", name: staff.name, phone: staff.phone === "-" ? "" : staff.phone, position: staff.position === "-" ? "" : staff.position })}
                    >
                      修改
                    </button>
                    <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => toggle(staff)}>
                      {staff.enabled ? "停用" : "启用"}
                    </button>
                    <button className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => remove(staff)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
