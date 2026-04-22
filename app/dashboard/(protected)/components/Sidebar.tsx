"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── 아이콘 ── */
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4V3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11H15M9 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ── 네비게이션 항목 ── */
const NAV_ITEMS = [
  { href: "/dashboard",              label: "개요",       Icon: GridIcon,      exact: true },
  { href: "/dashboard/applications", label: "신청 관리",  Icon: ClipboardIcon, exact: false },
  { href: "/dashboard/trainers",     label: "트레이너",   Icon: PersonIcon,    exact: false },
  { href: "/dashboard/reviews",      label: "후기 관리",  Icon: StarIcon,      exact: false },
  { href: "/dashboard/stats",        label: "통계",       Icon: BarChartIcon,  exact: false },
  { href: "/dashboard/settings",     label: "설정",       Icon: SettingsIcon,  exact: false },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const width = isMobile ? 240 : (collapsed ? 64 : 232);

  return (
    <aside
      className="flex flex-col h-full transition-all duration-200"
      style={isMobile ? {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        width,
        zIndex: 50,
        background: "var(--dash-sidebar)",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: mobileOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
      } : {
        width,
        background: "var(--dash-sidebar)",
        flexShrink: 0,
        transition: "width 0.2s ease",
      }}
    >
      {/* 로고 */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ height: 64 }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z"
              fill="rgba(0,0,0,0.6)" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[14px] font-bold leading-tight whitespace-nowrap" style={{ color: "var(--dash-text)" }}>
              James Gym
            </p>
            <p className="text-[10px] whitespace-nowrap" style={{ color: "var(--dash-text-dimmed)" }}>
              Admin Dashboard
            </p>
          </div>
        )}
      </div>

      {/* 네비 */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {!collapsed && (
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase px-5 py-2"
            style={{ color: "var(--dash-text-faint)" }}
          >
            메뉴
          </p>
        )}

        {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3 transition-all"
              style={{
                padding: collapsed ? "11px 0" : "11px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "var(--dash-nav-active-bg)" : "transparent",
                color: active ? "var(--dash-nav-active-text)" : "var(--dash-text-muted)",
                borderRight: active ? `2px solid var(--dash-nav-active-border)` : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--dash-nav-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span className="flex-shrink-0">
                <Icon />
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-[13.5px] font-semibold whitespace-nowrap">{label}</span>
                  {active && (
                    <span style={{ color: "var(--dash-nav-active-text)", opacity: 0.4 }}>
                      <ChevronIcon />
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      {!collapsed && (
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid var(--dash-border-xs)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--dash-text-faint)" }}>
            v2.0 · Supabase 연동됨
          </p>
        </div>
      )}
    </aside>
  );
}
