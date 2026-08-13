"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";

interface StatsData {
  citasHoy: number;
  clientes: number;
  pendientes: number;
  estaSemana: number;
}

interface AppointmentItem {
  id: string;
  time: string;
  clientName: string;
  serviceType: string;
}

export default function DashboardAgendaPage() {
  const [userName, setUserName] = useState("Pepe");
  const [stats, setStats] = useState<StatsData>({
    citasHoy: 5,
    clientes: 48,
    pendientes: 3,
    estaSemana: 24,
  });
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserName(data.userName || "Pepe");
          setStats(data.stats);
          setAppointments(data.appointmentsToday || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar métricas:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {userName}</h1>
        <p className="text-sm text-slate-500 mt-1">Aqui esta el resumen de su agenda</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Citas hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Citas hoy</p>
            <p className="text-2xl font-bold text-slate-900">{stats.citasHoy}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Clientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Clientes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.clientes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Pendientes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendientes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Esta semana */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Esta semana</p>
            <p className="text-2xl font-bold text-slate-900">{stats.estaSemana}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table/Card: Citas de hoy */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Citas de hoy</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Cargando citas del día...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((item) => (
              <div key={item.id} className="p-5 flex items-center hover:bg-slate-50/50 transition-colors">
                <div className="w-24 text-sm font-semibold text-blue-600">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.clientName}</p>
                  <p className="text-xs text-slate-500">{item.serviceType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
