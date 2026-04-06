"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 3L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
        stroke={active ? "#8eabff" : "#5a5a5a"}
        strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2"
        stroke={active ? "#8eabff" : "#5a5a5a"}
        strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"} />
      <path d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11H15M9 15H13"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        stroke={active ? "#8eabff" : "#5a5a5a"}
        strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"} />
      <path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { href: "/",               label: "홈",    Icon: HomeIcon },
  { href: "/my/applications",label: "내 신청", Icon: ClipboardIcon },
  { href: "/my",             label: "MY",    Icon: PersonIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-6 py-1.5 min-w-[72px]"
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-semibold tracking-[0.05em] uppercase transition-colors"
                style={{ color: active ? "#8eabff" : "#5a5a5a" }}
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
