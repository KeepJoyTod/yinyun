"use client";

import { useState } from "react";
import type { PhotoAlbumRow } from "@/server/photo-albums";
import { toggleSelectedAssetId } from "@/domain/photo-selection";

export function PublicPhotoSelection({ initialAlbum }: { initialAlbum: PhotoAlbumRow }) {
  const [album, setAlbum] = useState(initialAlbum);
  const [selectedAssetIds, setSelectedAssetIds] = useState(album.selectedAssetIds);
  const [note, setNote] = useState(album.selectionNote);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasReachedLimit = selectedAssetIds.length >= album.maxSelectCount;

  function toggle(assetId: string) {
    setSelectedAssetIds((current) => {
      const next = toggleSelectedAssetId(current, assetId, album.maxSelectCount);
      if (next === current && !current.includes(assetId)) {
        setMessage(`最多选择 ${album.maxSelectCount} 张照片`);
      } else {
        setMessage(null);
      }
      return next;
    });
  }

  async function submitSelection() {
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/public/photo-albums/${album.shareToken}/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAssetIds, note })
      });
      const body = (await response.json()) as { ok: boolean; album?: PhotoAlbumRow; message?: string };
      if (!body.ok || !body.album) {
        setMessage(body.message ?? "提交失败");
        return;
      }
      setAlbum(body.album);
      setSelectedAssetIds(body.album.selectedAssetIds);
      setNote(body.album.selectionNote);
      setMessage("选片结果已提交");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-900">
      <main className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">一悦照相馆 / 在线选片</p>
          <h1 className="mt-1 text-2xl font-semibold">{album.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {album.customerName} · 最多选择 {album.maxSelectCount} 张 · 已选 {selectedAssetIds.length}/{album.maxSelectCount}
          </p>
          {album.description ? <p className="mt-3 text-sm text-slate-600">{album.description}</p> : null}
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {album.assets.map((asset) => {
            const selected = selectedAssetIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                aria-pressed={selected}
                className={selected ? "overflow-hidden rounded-2xl border-2 border-slate-950 bg-white text-left shadow-sm" : "overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm"}
                onClick={() => toggle(asset.id)}
                type="button"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={asset.fileName} className="h-full w-full object-cover" src={asset.url} />
                </div>
                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="truncate text-sm font-medium">{asset.fileName}</span>
                  <span className={selected ? "rounded-full bg-slate-950 px-2 py-1 text-xs text-white" : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"}>
                    {selected ? "已选" : hasReachedLimit ? "已满" : "选择"}
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <textarea className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="选片备注，例如需要精修、裁剪、冲印要求" value={note} onChange={(event) => setNote(event.target.value)} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting || selectedAssetIds.length === 0} onClick={submitSelection}>
              {submitting ? "提交中" : "提交选片"}
            </button>
            <span className="text-sm text-slate-500">已选择 {selectedAssetIds.length}/{album.maxSelectCount}</span>
          </div>
          {message ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </main>
    </div>
  );
}
