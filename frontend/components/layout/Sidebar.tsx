"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConsoleLegalNote } from "@/components/layout/Footer";
import type { NavRoute } from "@/lib/routes";

function ConsoleMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <svg className={collapsed ? "h-5 w-5" : "h-4 w-4"} fill="none" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 6.2 10 3l6 3.2v7.4L10 17l-6-3.4V6.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M4.4 6.5 10 9.7l5.6-3.2M10 9.7V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function RouteIcon({ href, collapsed = false }: { href: string; collapsed?: boolean }) {
  const common = collapsed ? "h-5 w-5" : "h-4 w-4";

  if (href === "/dashboard" || href === "/admin") {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 4h5v5H4V4Zm7 0h5v5h-5V4ZM4 11h5v5H4v-5Zm7 0h5v5h-5v-5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.endsWith("/tasks/new")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (href.endsWith("/tasks")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M6.5 5.5h9M6.5 10h9M6.5 14.5h9M4 5.5h.01M4 10h.01M4 14.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (href.includes("workers")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 5.5h10v4H5v-4Zm0 5h10v4H5v-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M7 7.5h.01M7 12.5h.01M13 7.5h1M13 12.5h1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (href.includes("registries")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="m10 3.5 6 3.3v6.4l-6 3.3-6-3.3V6.8l6-3.3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M4.4 7 10 10.2 15.6 7M10 10.2v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("points")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 16.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7.8 8.2c.4-.8 1.2-1.2 2.2-1.2 1.2 0 2 .6 2 1.5 0 2-4 .9-4 3 0 .9.8 1.5 2 1.5 1 0 1.8-.4 2.2-1.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("orders")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 3.5h10v13l-1.8-1-1.8 1-1.8-1-1.8 1-1.8-1-1.8 1v-13Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M7.5 7h5M7.5 10h5M7.5 13h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("activities")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 8h12v8H4V8Zm-1-3.5h14V8H3V4.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M10 4.5V16M7.2 4.5C6.2 3.2 5 3.1 4.5 3.8c-.5.8.2 1.7 2.7 1.7m5.6-1c1-1.3 2.2-1.4 2.7-.7.5.8-.2 1.7-2.7 1.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("messages") || href.includes("announcements")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 5h12v8H8l-4 3V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M7 8h6M7 10.8h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("users")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.5 9a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8.5 9Zm-5 7c.5-2.7 2.4-4.3 5-4.3s4.5 1.6 5 4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path d="M13 8.8a2.3 2.3 0 0 0 0-4.4M14.7 11.7c1.2.7 2 1.9 2.3 3.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("docs") || href.includes("/admin/help")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M6 3.5h6l3 3V16.5H6v-13Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M12 3.5V7h3M8 10h5M8 13h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("error-codes")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="m7 6-3 4 3 4M13 6l3 4-3 4M11 5 9 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("config") || href.includes("settings")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M15.5 10c0-.4-.1-.8-.2-1.2l1.3-1-1.4-2.4-1.6.6a6 6 0 0 0-1-.6L12.4 3H7.6l-.2 2.4c-.4.2-.7.4-1 .6l-1.6-.6-1.4 2.4 1.3 1c-.1.4-.2.8-.2 1.2s.1.8.2 1.2l-1.3 1 1.4 2.4 1.6-.6c.3.2.6.4 1 .6l.2 2.4h4.8l.2-2.4c.4-.2.7-.4 1-.6l1.6.6 1.4-2.4-1.3-1c.1-.4.2-.8.2-1.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (href.includes("audit-logs")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 3.5 15 5v4.2c0 3.1-1.8 5.6-5 7.3-3.2-1.7-5-4.2-5-7.3V5l5-1.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M8 9.8 9.3 11 12 7.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (href.includes("health")) {
    return (
      <svg className={common} fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3.5 10h3l1.3-3.5 3 7 1.5-3.5h4.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return <ConsoleMark />;
}

export function Sidebar({
  title,
  routes,
  collapsed = false,
  onCollapsedChange
}: {
  title: string;
  routes: NavRoute[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`relative hidden h-fit rounded-panel border border-borderSoft bg-white p-3 shadow-panel transition-all duration-200 ease-out lg:sticky lg:top-24 lg:block ${collapsed ? "w-[76px]" : "w-full"}`}>
      {onCollapsedChange ? (
        <button
          aria-label={collapsed ? "展开菜单" : "折叠菜单"}
          className="absolute -right-3.5 top-5 z-20 grid h-8 w-8 place-items-center rounded-[10px] border border-blue-100 bg-white text-primary shadow-panel transition duration-150 ease-out hover:border-blue-200 hover:bg-blue-50 hover:shadow-lg"
          title={collapsed ? "展开菜单" : "折叠菜单"}
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          <svg className={`h-[18px] w-[18px] transition-transform duration-150 ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3.75 5.75 8 10 12.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      ) : null}

      <div className={`flex min-h-10 items-center ${collapsed ? "justify-center" : "px-3"}`}>
        {!collapsed ? (
          <div className="py-2 text-xs font-black uppercase tracking-wide text-muted">{title}</div>
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-blue-50 text-xs font-black text-primary" title={title}>
            <ConsoleMark collapsed />
          </div>
        )}
      </div>
      <nav className="mt-2 space-y-1">
        {routes.map((route) => {
          const active = pathname === route.href;
          return (
            <Link
              className={`flex min-h-10 items-center gap-2 rounded-control text-sm font-extrabold transition ${
                collapsed ? "min-h-12 justify-center px-2" : "px-3"
              } ${
                active ? "border-l-2 border-primary bg-blue-50 text-primary shadow-sm" : "border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
              href={route.href}
              key={route.href}
              title={route.label}
            >
              <span className={`grid shrink-0 place-items-center rounded-[10px] font-black ${collapsed ? "h-10 w-10" : "h-7 w-7"} ${active ? "bg-white text-primary" : "bg-slate-100 text-slate-600"}`}>
                <RouteIcon href={route.href} collapsed={collapsed} />
              </span>
              {!collapsed ? <span className="truncate">{route.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className={`mt-5 ${collapsed ? "hidden" : ""}`}>
        <ConsoleLegalNote />
      </div>
    </aside>
  );
}
