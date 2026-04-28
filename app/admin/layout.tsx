"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminBottomNav from "./components/AdminBottomNav";

export interface TrainerInfo {
  trainerId: string;
  trainerName: string;
  phone: string;
}

const TrainerContext = createContext<TrainerInfo | null>(null);
export const useTrainer = () => useContext(TrainerContext);

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div
        className="w-9 h-9 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return; }

    fetch("/api/trainer/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.trainer) {
          setTrainer(data.trainer);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]);

  if (isLoginPage) return <>{children}</>;
  if (checking)    return <LoadingScreen />;
  if (!trainer)    return <LoadingScreen />;

  return (
    <TrainerContext.Provider value={trainer}>
      {children}
      <AdminBottomNav />
    </TrainerContext.Provider>
  );
}
