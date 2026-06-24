"use client";

import { FormEvent, useMemo, useState } from "react";
import { channelPluginStatus, productTypeOptions, type ProductType } from "@/domain/product";
import type { ProductManagementRow, StoreOption } from "@/server/backoffice";

const emptyForm = {
  id: "",
  serviceGroupId: "",
  name: "",
  nickname: "",
  externalCode: "",
  selectionUnitPriceYuan: 0,
  albumProductName: "",
  type: "SERVICE" as ProductType,
  priceYuan: 0,
  durationMin: 30
};

export function ProductManager({
  initialProducts,
  serviceGroups,
  source
}: {
  initialProducts: ProductManagementRow[];
  serviceGroups: StoreOption[];
  source: "database" | "fallback";
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [typeFilter, setTypeFilter] = useState("");
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可新增、修改、删除。" : null);
  const [submitting, setSubmitting] = useState(false);
  const visibleProducts = useMemo(() => products.filter((product) => !typeFilter || product.type === typeFilter), [products, typeFilter]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(form.id ? `/api/products/${form.id}` : "/api/products", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceGroupId: form.serviceGroupId || null,
          name: form.name,
          nickname: form.nickname || null,
          externalCode: form.externalCode || null,
          selectionUnitPriceYuan: form.selectionUnitPriceYuan,
          albumProductName: form.albumProductName || null,
          type: form.type,
          priceYuan: form.priceYuan,
          durationMin: form.durationMin
        })
      });
      const body = (await response.json()) as { ok: boolean; product?: ProductManagementRow; message?: string };

      if (!body.ok || !body.product) {
        setMessage(body.message ?? "保存产品失败");
        return;
      }

      const saved = body.product;
      setProducts((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setForm(emptyForm);
      setMessage("产品已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存产品失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(product: ProductManagementRow) {
    await patchProduct(product.id, { enabled: !product.enabled }, product.enabled ? "产品已下架" : "产品已上架");
  }

  async function remove(product: ProductManagementRow) {
    if (!window.confirm(`确认删除产品“${product.name}”？`)) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const body = (await response.json()) as { ok: boolean; message?: string };
      if (!body.ok) {
        setMessage(body.message ?? "删除产品失败");
        return;
      }
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("产品已删除");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除产品失败");
    }
  }

  async function patchProduct(id: string, payload: Partial<ProductManagementRow>, successMessage: string) {
    setMessage(null);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as { ok: boolean; product?: ProductManagementRow; message?: string };
      if (!body.ok || !body.product) {
        setMessage(body.message ?? "产品操作失败");
        return;
      }
      const saved = body.product;
      setProducts((current) => current.map((item) => (item.id === id ? saved : item)));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "产品操作失败");
    }
  }

  async function refreshProducts() {
    const response = await fetch("/api/products");
    const body = (await response.json()) as { ok: boolean; data?: { products: ProductManagementRow[] } };
    if (body.ok && body.data) {
      setProducts(body.data.products);
    }
  }

  async function importProducts() {
    setImporting(true);
    setImportMessage(null);

    try {
      const parsed = JSON.parse(importText);
      const response = await fetch("/api/imports/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const body = (await response.json()) as { ok: boolean; result?: { summary: { total: number; created: number; failed: number }; failed: Array<{ index: number; message: string }> }; message?: string };
      if (!body.ok || !body.result) {
        setImportMessage(body.message ?? "导入失败");
        return;
      }

      await refreshProducts();
      const summary = body.result.summary;
      const failedText = body.result.failed.length ? `，失败 ${summary.failed} 条` : "";
      setImportMessage(`已导入 ${summary.created}/${summary.total} 条${failedText}`);
      setImportText("");
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "导入失败");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">商品维护</h2>
        <p className="mt-1 text-sm text-slate-500">覆盖服务、团单、附加、冲印、抖音、美团产品的基础维护。</p>

        <form className="mt-5 grid gap-3 xl:grid-cols-[1fr_1fr_160px_140px_120px_120px_auto]" onSubmit={submit}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="产品名称"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="产品昵称"
            value={form.nickname}
            onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="外部产品编码"
            value={form.externalCode}
            onChange={(event) => setForm((current) => ({ ...current, externalCode: event.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ProductType }))}
          >
            {productTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            min={0}
            step="0.01"
            type="number"
            value={form.priceYuan}
            onChange={(event) => setForm((current) => ({ ...current, priceYuan: Number(event.target.value) }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            min={1}
            type="number"
            value={form.durationMin}
            onChange={(event) => setForm((current) => ({ ...current, durationMin: Number(event.target.value) }))}
          />
          <button
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {form.id ? "保存修改" : "新增产品"}
          </button>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm xl:col-span-3"
            value={form.serviceGroupId}
            onChange={(event) => setForm((current) => ({ ...current, serviceGroupId: event.target.value }))}
          >
            <option value="">不绑定服务组</option>
            {serviceGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            min={0}
            step="0.01"
            type="number"
            placeholder="选片单价"
            value={form.selectionUnitPriceYuan}
            onChange={(event) => setForm((current) => ({ ...current, selectionUnitPriceYuan: Number(event.target.value) }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm xl:col-span-2"
            placeholder="入册产品名称"
            value={form.albumProductName}
            onChange={(event) => setForm((current) => ({ ...current, albumProductName: event.target.value }))}
          />
          {form.id ? (
            <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm" type="button" onClick={() => setForm(emptyForm)}>
              取消编辑
            </button>
          ) : null}
        </form>

        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">产品导入</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <textarea
            className="min-h-28 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
            placeholder='[{"name":"抖音套餐A","type":"DOUYIN","priceYuan":99,"durationMin":30,"externalCode":"DY-A"}]'
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
          />
          <button className="self-start rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={importing || !importText.trim()} onClick={importProducts}>
            导入产品
          </button>
        </div>
        {importMessage ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{importMessage}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">渠道插件状态</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(["DOUYIN", "MEITUAN"] as ProductType[]).map((type) => {
            const plugin = channelPluginStatus(type);
            return (
              <div key={type} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{plugin.label}</div>
                  <span className={plugin.enabled ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700" : "rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700"}>
                    {plugin.enabled ? "已开通" : "未开通"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{plugin.message}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">全部产品类型</option>
            {productTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <div className="flex items-center text-sm text-slate-500">共 {visibleProducts.length} 个产品</div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{product.nickname || product.serviceGroupName}</p>
              </div>
              <span className={product.enabled ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"}>
                {product.enabled ? "上架" : "下架"}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">类型</dt>
                <dd className="mt-1 font-medium">{product.typeLabel}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">价格</dt>
                <dd className="mt-1 font-medium">{product.price}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">时长</dt>
                <dd className="mt-1 font-medium">{product.durationMin} 分钟</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">服务组</dt>
                <dd className="mt-1 font-medium">{product.serviceGroupName}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">外部编码</dt>
                <dd className="mt-1 font-medium">{product.externalCode || "-"}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">选片单价</dt>
                <dd className="mt-1 font-medium">{product.selectionUnitPrice}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">入册产品</dt>
                <dd className="mt-1 font-medium">{product.albumProductName || "-"}</dd>
              </div>
            </dl>
            {!product.channelPluginEnabled ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{product.channelPluginMessage}，当前作为渠道插件预留。</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onClick={() =>
                  setForm({
                    id: product.id,
                    serviceGroupId: product.serviceGroupId ?? "",
                    name: product.name,
                    nickname: product.nickname,
                    externalCode: product.externalCode,
                    selectionUnitPriceYuan: product.selectionUnitPriceYuan,
                    albumProductName: product.albumProductName,
                    type: product.type,
                    priceYuan: product.priceYuan,
                    durationMin: product.durationMin
                  })
                }
              >
                修改
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => toggle(product)}>
                {product.enabled ? "下架" : "上架"}
              </button>
              <button className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => remove(product)}>
                删除
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
