"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Clock,
  User,
  Settings,
  LogOut,
  BookmarkCheck,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    photoUrl?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const name = user?.name || "Pepe Lopez";
  const email = user?.email || "pepelopez@gmail.com";

  // Iniciales para el avatar (ej: Pepe Lopez -> PL)
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const navItems = [
    { name: "Agenda", href: "/dashboard", icon: CalendarDays },
    { name: "Reservas", href: "/dashboard/reservas", icon: BookmarkCheck },
    { name: "Disponibilidad", href: "/dashboard/disponibilidad", icon: Clock },
    { name: "Mi Perfil", href: "/dashboard/perfil", icon: User },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 font-sans">
      {/* Upper Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">AgendaYA</span>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Block */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
            <p className="text-[11px] text-slate-400 truncate">{email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
