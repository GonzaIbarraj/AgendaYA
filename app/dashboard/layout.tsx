"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null; photoUrl?: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 overflow-y-auto">
        <main className="p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
