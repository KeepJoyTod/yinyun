"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Camera, CheckCircle2, LockKeyhole, Phone, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("17863026867");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const body = (await response.json()) as { ok: boolean; message?: string };

      if (!body.ok) {
        setMessage(body.message ?? "登录失败");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next ?? "/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3f7] px-4 py-8 text-slate-900 sm:py-12">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="relative bg-slate-950 px-7 py-9 text-white sm:px-10 lg:px-12">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,rgba(20,184,166,.32),transparent_30%),linear-gradient(45deg,rgba(59,130,246,.18),transparent_38%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold">影约云</div>
                <div className="text-sm text-slate-300">相馆经营与客户服务入口</div>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold text-teal-200">Merchant Portal</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">从预约到选片，先让门店每天好用。</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                统一查看预约、客户、订单和渠道状态。微信/H5 面向客户展示，本页面用于商家和员工进入工作台。
              </p>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {[
                ["预约", "今日排期"],
                ["订单", "状态跟进"],
                ["选片", "移动端体验"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                  <div className="text-xs text-slate-300">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form className="px-6 py-8 sm:px-8 lg:px-9" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-700">安全登录</p>
              <h2 className="mt-2 text-2xl font-semibold">进入工作台</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">使用已分配的手机号和密码登录。</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <label className="mt-8 block text-sm font-semibold text-slate-700">
            手机号
            <span className="mt-2 flex min-h-12 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15">
              <Phone className="mr-2 h-4 w-4 flex-none text-slate-400" />
              <input
                className="h-11 w-full bg-transparent text-base outline-none"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="username"
                inputMode="tel"
              />
            </span>
          </label>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            密码
            <span className="mt-2 flex min-h-12 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/15">
              <LockKeyhole className="mr-2 h-4 w-4 flex-none text-slate-400" />
              <input
                className="h-11 w-full bg-transparent text-base outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </span>
          </label>

          <button
            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "登录中" : "登录"}
          </button>

          {message ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}

          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
            {["登录后进入经营看板", "客户预约页无需后台壳", "订单和手机号按本地权限查询"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 flex-none text-teal-700" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </form>
      </section>
    </main>
  );
}
