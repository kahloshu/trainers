"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
        stroke={active ? "var(--accent)" : "var(--text-muted)"}
        strokeWidth="1.8"
        fill={active ? "var(--accent-subtle-hi)" : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7"
        stroke={active ? "var(--accent)" : "var(--text-muted)"}
        strokeWidth="1.8"
        fill={active ? "var(--accent-subtle-hi)" : "none"} />
      <path d="M16.5 16.5L21 21"
        stroke={active ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        stroke={active ? "var(--accent)" : "var(--text-muted)"}
        strokeWidth="1.8"
        fill={active ? "var(--accent-subtle-hi)" : "none"} />
      <path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke={active ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { href: "/",       label: "홈",    Icon: HomeIcon },
  { href: "/lookup", label: "신청 조회", Icon: SearchIcon },
  { href: "/my",     label: "MY",    Icon: PersonIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href === "/lookup" && pathname.startsWith("/lookup"));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-6 py-1.5 min-w-[72px]"
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-semibold tracking-[0.05em] uppercase transition-colors"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
