"use client";

import { FormEvent, useMemo, useState } from "react";
import type { PhotoAlbumCustomerOption, PhotoAlbumOrderOption, PhotoAlbumRow } from "@/server/photo-albums";

type PhotoAlbumManagerProps = {
  initialAlbums: PhotoAlbumRow[];
  customers: PhotoAlbumCustomerOption[];
  orders: PhotoAlbumOrderOption[];
  source: "database" | "fallback";
};

const emptyAlbumForm = {
  customerId: "",
  orderId: "",
  title: "",
  description: "",
  maxSelectCount: 6
};

const emptyAssetForm = {
  albumId: "",
  fileName: "",
  url: "",
  sortOrder: 0
};

export function PhotoAlbumManager({ initialAlbums, customers, orders, source }: PhotoAlbumManagerProps) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [albumForm, setAlbumForm] = useState(emptyAlbumForm);
  const [assetForm, setAssetForm] = useState(emptyAssetForm);
  const [selectionDrafts, setSelectionDrafts] = useState<Record<string, { selectedAssetIds: string[]; note: string }>>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可维护真实客片相册。" : null);
  const [submitting, setSubmitting] = useState(false);

  const visibleAlbums = useMemo(() => albums.filter((album) => !statusFilter || album.status === statusFilter), [albums, statusFilter]);

  function replaceAlbum(album: PhotoAlbumRow) {
    setAlbums((current) => current.map((item) => (item.id === album.id ? album : item)));
  }

  async function createAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/photo-albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: albumForm.customerId || null,
          orderId: albumForm.orderId || null,
          title: albumForm.title,
          description: albumForm.description || null,
          maxSelectCount: albumForm.maxSelectCount
        })
      });
      const body = (await response.json()) as { ok: boolean; album?: PhotoAlbumRow; message?: string };
      if (!body.ok || !body.album) {
        setMessage(body.message ?? "创建相册失败");
        return;
      }
      setAlbums((current) => [body.album as PhotoAlbumRow, ...current]);
      setAlbumForm(emptyAlbumForm);
      setMessage("相册已创建");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建相册失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assetForm.albumId) {
      setMessage("请先选择相册");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/photo-albums/${assetForm.albumId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: assetForm.fileName || null,
          url: assetForm.url,
          sortOrder: assetForm.sortOrder
        })
      });
      const body = (await response.json()) as { ok: boolean; album?: PhotoAlbumRow; message?: string };
      if (!body.ok || !body.album) {
        setMessage(body.message ?? "添加照片失败");
        return;
      }
      replaceAlbum(body.album);
      setAssetForm((current) => ({ ...emptyAssetForm, albumId: current.albumId, sortOrder: current.sortOrder + 1 }));
      setMessage("照片已添加");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加照片失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(album: PhotoAlbumRow, status: PhotoAlbumRow["status"]) {
    setMessage(null);
    try {
      const response = await fetch(`/api/photo-albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const body = (await response.json()) as { ok: boolean; album?: PhotoAlbumRow; message?: string };
      if (!body.ok || !body.album) {
        setMessage(body.message ?? "更新相册失败");
        return;
      }
      replaceAlbum(body.album);
      setMessage("相册状态已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新相册失败");
    }
  }

  function selectionDraft(album: PhotoAlbumRow) {
    return selectionDrafts[album.id] ?? {
      selectedAssetIds: album.selectedAssetIds,
      note: album.selectionNote
    };
  }

  function toggleAsset(album: PhotoAlbumRow, assetId: string) {
    const draft = selectionDraft(album);
    const exists = draft.selectedAssetIds.includes(assetId);
    const selectedAssetIds = exists ? draft.selectedAssetIds.filter((id) => id !== assetId) : [...draft.selectedAssetIds, assetId];
    setSelectionDrafts((current) => ({ ...current, [album.id]: { ...draft, selectedAssetIds } }));
  }

  async function submitSelection(album: PhotoAlbumRow) {
    const draft = selectionDraft(album);
    setMessage(null);
    try {
      const response = await fetch(`/api/photo-albums/${album.id}/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const body = (await response.json()) as { ok: boolean; album?: PhotoAlbumRow; message?: string };
      if (!body.ok || !body.album) {
        setMessage(body.message ?? "提交选片失败");
        return;
      }
      replaceAlbum(body.album);
      setSelectionDrafts((current) => {
        const next = { ...current };
        delete next[album.id];
        return next;
      });
      setMessage("选片结果已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交选片失败");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">创建相册</h2>
        <form className="mt-5 grid gap-3 xl:grid-cols-[180px_180px_1fr_1fr_120px_auto]" onSubmit={createAlbum}>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={albumForm.customerId} onChange={(event) => setAlbumForm((current) => ({ ...current, customerId: event.target.value }))}>
            <option value="">不绑定客户</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} / {customer.phone}
              </option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={albumForm.orderId} onChange={(event) => setAlbumForm((current) => ({ ...current, orderId: event.target.value }))}>
            <option value="">不绑定订单</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNo} / {order.customerName}
              </option>
            ))}
          </select>
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="相册名称" required value={albumForm.title} onChange={(event) => setAlbumForm((current) => ({ ...current, title: event.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="相册说明" value={albumForm.description} onChange={(event) => setAlbumForm((current) => ({ ...current, description: event.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" min={1} type="number" value={albumForm.maxSelectCount} onChange={(event) => setAlbumForm((current) => ({ ...current, maxSelectCount: Number(event.target.value) }))} />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={submitting}>
            新建相册
          </button>
        </form>
        {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">登记照片</h2>
        <form className="mt-5 grid gap-3 lg:grid-cols-[220px_1fr_1fr_120px_auto]" onSubmit={addAsset}>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={assetForm.albumId} onChange={(event) => setAssetForm((current) => ({ ...current, albumId: event.target.value }))}>
            <option value="">选择相册</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="照片名称" value={assetForm.fileName} onChange={(event) => setAssetForm((current) => ({ ...current, fileName: event.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="/uploads/customer/photo.jpg 或 https://..." required value={assetForm.url} onChange={(event) => setAssetForm((current) => ({ ...current, url: event.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" min={0} type="number" value={assetForm.sortOrder} onChange={(event) => setAssetForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={submitting}>
            添加照片
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="ARCHIVED">已归档</option>
          </select>
          <div className="flex items-center text-sm text-slate-500">共 {visibleAlbums.length} 个相册</div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleAlbums.map((album) => {
          const draft = selectionDraft(album);
          return (
            <article key={album.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{album.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{album.customerName} · {album.orderNo} · {album.createdAt}</p>
                  {album.description ? <p className="mt-2 text-sm text-slate-600">{album.description}</p> : null}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{album.statusLabel}</span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">照片数</dt>
                  <dd className="mt-1 font-medium">{album.assetCount}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">选片</dt>
                  <dd className="mt-1 font-medium">{album.progressLabel}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">最多可选</dt>
                  <dd className="mt-1 font-medium">{album.maxSelectCount}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">分享路径</dt>
                  <dd className="mt-1 truncate font-medium">{album.sharePath}</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {album.assets.map((asset) => (
                  <label key={asset.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" checked={draft.selectedAssetIds.includes(asset.id)} onChange={() => toggleAsset(album, asset.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{asset.fileName}</span>
                      <span className="block truncate text-slate-500">{asset.url}</span>
                    </span>
                  </label>
                ))}
                {album.assets.length === 0 ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">暂无照片，先在上方登记照片地址。</p> : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">底片列表</div>
                <div className="divide-y divide-slate-100">
                  {album.assets.map((asset) => (
                    <div key={`${asset.id}-row`} className="grid grid-cols-[1fr_80px_80px] gap-3 px-3 py-2 text-sm">
                      <span className="truncate">{asset.fileName}</span>
                      <span className="text-slate-500">排序 {asset.sortOrder}</span>
                      <span className={asset.selected ? "text-emerald-700" : "text-slate-400"}>{asset.selected ? "已选" : "未选"}</span>
                    </div>
                  ))}
                  {album.assets.length === 0 ? <div className="px-3 py-2 text-sm text-slate-500">暂无底片</div> : null}
                </div>
              </div>

              <textarea
                className="mt-4 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="选片备注"
                value={draft.note}
                onChange={(event) => setSelectionDrafts((current) => ({ ...current, [album.id]: { ...draft, note: event.target.value } }))}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => updateStatus(album, "PUBLISHED")}>
                  发布
                </button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm" onClick={() => updateStatus(album, "ARCHIVED")}>
                  归档
                </button>
                <button className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white" onClick={() => submitSelection(album)} disabled={album.assets.length === 0}>
                  保存选片
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
