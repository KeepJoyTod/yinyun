import Link from "next/link";
import { LayoutDashboard, Store, Package, CalendarRange, ClipboardList, Camera, Menu, LogOut, Users, Bell, BarChart3, Plug } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "首页", group: "首页", icon: LayoutDashboard },
  { href: "/stores", label: "门店管理", group: "商户", icon: Store },
  { href: "/staff", label: "员工管理", group: "商户", icon: Users },
  { href: "/service-groups", label: "服务组管理", group: "商户", icon: CalendarRange },
  { href: "/products", label: "商品管理", group: "商品", icon: Package },
  { href: "/orders", label: "订单管理", group: "订单", icon: ClipboardList },
  { href: "/customers", label: "客户管理", group: "订单", icon: Users },
  { href: "/audit-logs", label: "操作日志", group: "订单", icon: ClipboardList },
  { href: "/reports", label: "经营报表", group: "报表", icon: BarChart3 },
  { href: "/analytics", label: "分析评价", group: "报表", icon: BarChart3 },
  { href: "/performance", label: "业绩月报", group: "报表", icon: BarChart3 },
  { href: "/marketing", label: "营销统计", group: "报表", icon: BarChart3 },
  { href: "/photo-albums", label: "客片选片", group: "工具", icon: Camera },
  { href: "/notifications", label: "通知预留", group: "工具", icon: Bell },
  { href: "/booking", label: "预约端", group: "工具", icon: Camera },
  { href: "/channel-plugins", label: "渠道插件", group: "渠道", icon: Plug },
  { href: "/channel-orders", label: "抖音订单", group: "渠道", icon: ClipboardList }
];

export function AppShell({
  title,
  activePath,
  user,
  children
}: {
  title: string;
  activePath: string;
  user?: Pick<SessionPayload, "name" | "role"> | null;
  children: ReactNode;
}) {
  const groupedNav = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white" href="#main-content">
        跳到主要内容
      </a>
      <div className="mx-auto grid min-h-screen max-w-[1480px] grid-cols-1 gap-0 lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-slate-200 bg-white px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-3 lg:mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Menu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">简·约 Jianyue</div>
              <div className="text-xs text-slate-500">一悦照相馆</div>
            </div>
          </div>
          <nav className="hidden space-y-4 lg:block">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group}>
                <div className="mb-1 px-3 text-xs font-medium text-slate-400">{group}</div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100",
                          item.href === activePath ? "bg-slate-950 text-white hover:bg-slate-950" : "text-slate-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    item.href === activePath ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main id="main-content" className="px-4 py-5 sm:px-6 lg:px-8" tabIndex={-1}>
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">项目控制台 / 一悦照相馆</p>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                {(user?.name ?? "访客")} · {roleLabel(user?.role)}
              </div>
              {user ? (
                <form action="/api/auth/logout" method="post">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100" title="退出登录">
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              ) : null}
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    OWNER: "管理员",
    MANAGER: "店长",
    STAFF: "员工",
    VIEWER: "只读"
  };

  return role ? labels[role] ?? role : "预约端";
}
