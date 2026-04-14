"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getAllApplications } from "@/app/data/applications";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"} strokeLinejoin="round" />
    </svg>
  );
}
function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"} />
      <path d="M9 4V3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V4"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11H15M9 15H13"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={active ? "rgba(142,171,255,0.12)" : "none"}
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.8"
        fill={active ? "rgba(142,171,255,0.12)" : "none"} />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
        stroke={active ? "#8eabff" : "#5a5a5a"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.5" fill={active ? "#8eabff" : "#5a5a5a"} />
      <circle cx="12" cy="12" r="1.5" fill={active ? "#8eabff" : "#5a5a5a"} />
      <circle cx="19" cy="12" r="1.5" fill={active ? "#8eabff" : "#5a5a5a"} />
    </svg>
  );
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white px-1"
      style={{ background: "#f87171" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const NAV = [
  { href: "/admin",              label: "홈",      Icon: HomeIcon },
  { href: "/admin/applications", label: "신청",    Icon: ClipboardIcon },
  { href: "/admin/reviews",      label: "후기",    Icon: StarIcon },
  { href: "/admin/trainers",     label: "트레이너", Icon: PersonIcon },
  { href: "/admin/more",         label: "더보기",  Icon: MoreIcon },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getAllApplications().then((apps) => {
      setPendingCount(apps.filter((a) => a.status === "pending").length);
    });
  }, []);

  const badges: Record<string, number> = {
    "/admin/applications": pendingCount,
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          const badge = badges[href] ?? 0;
          return (
            <Link key={href} href={href}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 min-w-[58px]">
              <span className="relative">
                <Icon active={active} />
                <Badge count={badge} />
              </span>
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
