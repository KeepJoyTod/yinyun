"use client";

import { FormEvent, useMemo, useState } from "react";
import type { NotificationLogRow, NotificationTemplateRow } from "@/server/notifications";

const emptySendForm = {
  templateId: "",
  channel: "SMS",
  recipient: "",
  content: "",
  variables: "{\n  \"name\": \"张三\",\n  \"orderNo\": \"YY001\",\n  \"time\": \"10:00\"\n}"
};

export function NotificationManager({
  initialTemplates,
  initialLogs,
  source
}: {
  initialTemplates: NotificationTemplateRow[];
  initialLogs: NotificationLogRow[];
  source: "database" | "fallback";
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [logs, setLogs] = useState(initialLogs);
  const [sendForm, setSendForm] = useState(emptySendForm);
  const [sendMessage, setSendMessage] = useState<string | null>(source === "fallback" ? "当前使用演示数据；启动数据库后可预览通知模板与发送日志。" : null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const templateMap = useMemo(() => new Map(templates.map((template) => [template.id, template])), [templates]);

  async function saveTemplate(template: NotificationTemplateRow) {
    setSavingId(template.id);
    setSendMessage(null);

    try {
      const response = await fetch(`/api/notifications/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template)
      });
      const body = (await response.json()) as { ok: boolean; template?: NotificationTemplateRow; message?: string };
      if (!body.ok || !body.template) {
        setSendMessage(body.message ?? "保存模板失败");
        return;
      }

      setTemplates((current) => current.map((item) => (item.id === body.template!.id ? body.template! : item)));
      setSendMessage("模板已保存");
    } catch (error) {
      setSendMessage(error instanceof Error ? error.message : "保存模板失败");
    } finally {
      setSavingId(null);
    }
  }

  async function sendPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setSendMessage(null);

    try {
      const variables = sendForm.variables.trim() ? JSON.parse(sendForm.variables) : {};
      const template = sendForm.templateId ? templateMap.get(sendForm.templateId) : null;
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: sendForm.templateId || null,
          channel: sendForm.channel,
          recipient: sendForm.recipient,
          content: template ? null : sendForm.content,
          variables
        })
      });
      const body = (await response.json()) as { ok: boolean; result?: { log: NotificationLogRow; renderedContent: string }; message?: string };
      const result = body.result;
      if (!body.ok || !result) {
        setSendMessage(body.message ?? "发送失败");
        return;
      }

      setLogs((current) => [result.log, ...current].slice(0, 50));
      setSendMessage(`dry-run 完成：${result.renderedContent}`);
    } catch (error) {
      setSendMessage(error instanceof Error ? error.message : "发送失败");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Dry-run 发送</h2>
        <form className="mt-4 grid gap-3 xl:grid-cols-[120px_220px_1fr]" onSubmit={sendPreview}>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={sendForm.channel} onChange={(event) => setSendForm((current) => ({ ...current, channel: event.target.value }))}>
            <option value="SMS">短信</option>
            <option value="WECHAT">微信</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={sendForm.templateId} onChange={(event) => setSendForm((current) => ({ ...current, templateId: event.target.value }))}>
            <option value="">手动内容</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="接收人" value={sendForm.recipient} onChange={(event) => setSendForm((current) => ({ ...current, recipient: event.target.value }))} />
          {!sendForm.templateId ? (
            <textarea className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm xl:col-span-3" placeholder="通知内容" value={sendForm.content} onChange={(event) => setSendForm((current) => ({ ...current, content: event.target.value }))} />
          ) : null}
          <textarea className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono xl:col-span-3" value={sendForm.variables} onChange={(event) => setSendForm((current) => ({ ...current, variables: event.target.value }))} />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={sending}>
            发送 dry-run
          </button>
        </form>
        {sendMessage ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{sendMessage}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">通知模板</h2>
        <div className="space-y-4">
          {templates.map((template) => (
            <article key={template.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-3 xl:grid-cols-[120px_160px_1fr_auto]">
                <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={template.channel} onChange={(event) => setTemplates((current) => current.map((item) => (item.id === template.id ? { ...item, channel: event.target.value as NotificationTemplateRow["channel"] } : item)))}>
                  <option value="SMS">短信</option>
                  <option value="WECHAT">微信</option>
                </select>
                <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={template.key} onChange={(event) => setTemplates((current) => current.map((item) => (item.id === template.id ? { ...item, key: event.target.value } : item)))} />
                <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={template.name} onChange={(event) => setTemplates((current) => current.map((item) => (item.id === template.id ? { ...item, name: event.target.value } : item)))} />
                <label className="flex items-center justify-end gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={template.enabled} onChange={(event) => setTemplates((current) => current.map((item) => (item.id === template.id ? { ...item, enabled: event.target.checked } : item)))} />
                  启用
                </label>
                <textarea className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono xl:col-span-4" value={template.content} onChange={(event) => setTemplates((current) => current.map((item) => (item.id === template.id ? { ...item, content: event.target.value } : item)))} />
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm" disabled={savingId === template.id} onClick={() => saveTemplate(template)}>
                  保存模板
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              {["时间", "通道", "接收人", "状态", "内容", "提供方", "结果"].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{log.createdAt}</td>
                <td className="px-4 py-3">{log.channel}</td>
                <td className="px-4 py-3">{log.recipient}</td>
                <td className="px-4 py-3">{log.status}</td>
                <td className="px-4 py-3">{log.content}</td>
                <td className="px-4 py-3">{log.provider}</td>
                <td className="px-4 py-3">{log.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
