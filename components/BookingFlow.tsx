"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  CalendarPlus,
} from "lucide-react";
import { validarNombre } from "@/utils/validarNombre";
import { validateEmail } from "@/utils/emailValidation";

interface EventType {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string | null;
}

interface ProfessionalData {
  id: string;
  name: string;
  specialty?: string;
  bio?: string;
  photoUrl?: string | null;
  publicSlug: string;
  eventTypes: EventType[];
}

export function BookingFlow({ slug }: { slug: string }) {
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados del Flujo (1 = Bienvenida, 2 = Eventos, 3 = Calendario/Hora, 4 = Datos, 5 = Revisión/Éxito)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selecciones del Usuario
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Calendario: Mes y Año actual (Abril 2026 o mes actual)
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 3, 1)); // Abril 2026 por defecto como en wireframe
  const [selectedDay, setSelectedDay] = useState<number | null>(28); // 28 de Abril por defecto
  const [selectedTime, setSelectedTime] = useState<string | null>("11:30"); // 11:30 por defecto

  // Datos del Invitado (US_013 & US_014)
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Resultado de Confirmación (US_015)
  const [bookingSuccess, setBookingSuccess] = useState<{
    idReserva: string;
    mensaje: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/public/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfessional(data.professional);
        } else {
          setErrorMsg(data.message || "No se encuentra la agenda requerida");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar agenda pública:", err);
        setErrorMsg("Error al conectar con la agenda pública");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-500 font-medium text-sm animate-pulse">Cargando agenda pública...</p>
      </div>
    );
  }

  if (errorMsg || !professional) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Agenda no encontrada</h2>
          <p className="text-sm text-slate-600">{errorMsg || "No se encuentra agenda del profesional"}</p>
        </div>
      </div>
    );
  }

  const nameVal = validarNombre(clientName);
  const emailVal = validateEmail(clientEmail);
  const isGuestFormValid = nameVal.valido && emailVal.isValid;

  // Franjas Horarias Disponibles (ej: TP1 p.21)
  const timeSlots = [
    { time: "09:00", available: true },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: false },
    { time: "11:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: false },
    { time: "15:00", available: true },
    { time: "15:30", available: true },
    { time: "16:00", available: false },
    { time: "16:30", available: true },
  ];

  const formattedMonthYear = currentMonthDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const capitalizedMonthYear = formattedMonthYear.charAt(0).toUpperCase() + formattedMonthYear.slice(1);

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    // US_012 Escenario 3: No retroceder antes del mes actual
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const targetMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
    if (targetMonth >= minMonth) {
      setCurrentMonthDate(targetMonth);
    }
  };

  const formattedSelectedDateStr = selectedDay ? `2026-04-${selectedDay.toString().padStart(2, "0")}` : "2026-04-28";

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: professional.publicSlug,
          eventTypeId: selectedEvent?.id || "ev-1",
          eventTitle: selectedEvent?.title || "Consulta",
          date: formattedSelectedDateStr,
          time: selectedTime || "11:30",
          clientName,
          clientEmail,
          clientPhone,
          clientNotes,
          professionalName: professional.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "No pudimos procesar tu reserva. Intenta nuevamente");
        if (data.redirigirAlCalendario) {
          setStep(3); // Volver al calendario si el horario fue ocupado
        }
        setSubmitting(false);
        return;
      }

      setBookingSuccess({
        idReserva: data.idReserva || `RES-202604${selectedDay || 28}-1234`,
        mensaje: data.mensaje || "Reserva confirmada correctamente",
      });
      setSubmitting(false);
    } catch (err) {
      console.error("Error al reservar:", err);
      setErrorMsg("No pudimos procesar tu reserva. Intenta nuevamente");
      setSubmitting(false);
    }
  };

  const initials = professional.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden space-y-0">
        
        {/* Banner de Error si aplica */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center space-x-2 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PANTALLA ÉXITO POST-CONFIRMACIÓN (TP1 p.27) */}
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Reserva confirmada</h2>
              <p className="text-xs text-slate-500">Tu turno ha sido registrado exitosamente</p>
            </div>

            {/* Tarjeta Resumen */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
                {professional.photoUrl ? (
                  <img src={professional.photoUrl} alt={professional.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{professional.name}</p>
                  <p className="text-[11px] text-blue-600 font-medium">{professional.specialty || "Psicología Clínica"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Fecha</span>
                  <span className="font-semibold text-slate-800">{selectedDay} de Abril</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Hora</span>
                  <span className="font-semibold text-slate-800">{selectedTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Nombre</span>
                  <span className="font-semibold text-slate-800">{clientName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{clientEmail}</span>
                </div>
                {clientPhone && (
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Teléfono</span>
                    <span className="font-semibold text-slate-800">{clientPhone}</span>
                  </div>
                )}
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">ID Reserva</span>
                  <span className="font-mono text-blue-600 font-bold">{bookingSuccess.idReserva}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-left flex items-start space-x-2 text-[11px] text-blue-800">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Hemos enviado un email de confirmación a <strong className="font-semibold">{clientEmail}</strong> con los detalles de tu reserva.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert("Evento añadido a tu calendario")}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm"
              >
                <CalendarPlus className="w-4 h-4 text-slate-500" />
                <span>Agregar a Google Calendar</span>
              </button>
              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setStep(1);
                  setSelectedEvent(null);
                }}
                className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Hacer otra reserva
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Powered by AgendaYA
            </div>
          </div>
        ) : (
          <div>
            {/* PASO 1: BIENVENIDA PÚBLICA (TP1 p.17) */}
            {step === 1 && (
              <div className="p-8 text-center space-y-6 animate-fadeIn">
                <div className="flex flex-col items-center space-y-3">
                  {professional.photoUrl ? (
                    <img src={professional.photoUrl} alt={professional.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center shadow-sm">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{professional.name}</h1>
                    <p className="text-xs font-semibold text-sky-600 mt-0.5">{professional.specialty || "Psicología Clínica"}</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                      {professional.bio || "Especialista en terapia cognitivo-conductual con amplia experiencia."}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  Bienvenido a mi agenda online. Selecciona un horario disponible para agendar tu cita de forma rápida y sencilla.
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                  >
                    Reservar turno
                  </button>
                  <button
                    onClick={() => alert("Consulta enviada al profesional")}
                    className="text-xs font-medium text-sky-600 hover:underline block mx-auto"
                  >
                    Contactar
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  Powered by AgendaYA
                </div>
              </div>
            )}

            {/* PASO 2: SELECCIÓN DE TIPO DE CITA (TP1 p.19) */}
            {step === 2 && (
              <div className="p-8 space-y-6 animate-fadeIn">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  {professional.photoUrl ? (
                    <img src={professional.photoUrl} alt={professional.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{professional.name}</h2>
                    <p className="text-[11px] text-sky-600 font-medium">{professional.specialty || "Psicología Clínica"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Selecciona un tipo de cita</h3>
                  <p className="text-xs text-slate-500">Elige el servicio que deseas reservar</p>
                </div>

                <div className="space-y-3">
                  {professional.eventTypes.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setStep(3);
                      }}
                      className="w-full p-4 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 rounded-2xl text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                          {ev.title.includes("Video") ? (
                            <Video className="w-4 h-4" />
                          ) : ev.title.includes("Presencial") ? (
                            <MapPin className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {ev.title}
                          </p>
                          <p className="text-xs text-slate-500">{ev.description || "Atención personalizada"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500">{ev.durationMinutes} min</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors ml-auto mt-1" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Volver al perfil
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: CALENDARIO Y FRANJA HORARIA (TP1 p.20-22) */}
            {step === 3 && (
              <div className="p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  {professional.photoUrl ? (
                    <img src={professional.photoUrl} alt={professional.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{professional.name}</h2>
                    <p className="text-[11px] text-sky-600 font-medium">{selectedEvent?.title || "Consulta"}</p>
                  </div>
                </div>

                {/* Calendario Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold text-slate-900">{capitalizedMonthYear}</span>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-5 text-center text-xs font-semibold text-slate-400">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mie</span>
                    <span>Jue</span>
                    <span>Vie</span>
                  </div>

                  {/* Grid de Días con Touch Targets de 44x44 dp (US_012) */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 27, 28, 29, 30].map((d) => {
                      const isAvailable = [3, 7, 10, 14, 17, 21, 24, 28].includes(d);
                      const isSelected = selectedDay === d;

                      return (
                        <button
                          key={d}
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedDay(d);
                            setSelectedTime(null);
                          }}
                          className={`min-w-[44px] min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-sky-500 text-white shadow-sm ring-2 ring-sky-300"
                              : isAvailable
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                              : "bg-rose-50 text-rose-300 cursor-not-allowed opacity-60"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center space-x-6 text-[11px] font-medium pt-2">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-200"></span>
                      <span className="text-slate-600">Disponible</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-100"></span>
                      <span className="text-slate-400">No disponible</span>
                    </span>
                  </div>
                </div>

                {/* Selección de Franja Horaria (TP1 p.21) */}
                {selectedDay && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-800 text-center">
                      Horarios para el {selectedDay} de Abril
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelectedTime = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 text-xs font-bold rounded-xl transition-all ${
                              isSelectedTime
                                ? "bg-sky-500 text-white shadow-sm ring-2 ring-sky-300"
                                : slot.available
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : "bg-rose-50 text-rose-300 border border-rose-100 cursor-not-allowed"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botón de Confirmar paso */}
                <div className="pt-2">
                  <button
                    disabled={!selectedDay || !selectedTime}
                    onClick={() => setStep(4)}
                    className={`w-full py-3 px-4 font-semibold text-xs rounded-xl text-white transition-all shadow-sm ${
                      selectedDay && selectedTime
                        ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                        : "bg-sky-200 cursor-not-allowed"
                    }`}
                  >
                    {selectedDay && selectedTime
                      ? `Reservar ${selectedDay} a las ${selectedTime}`
                      : "Selecciona fecha y hora"}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: INGRESAR DATOS DEL INVITADO (TP1 p.24) */}
            {step === 4 && (
              <div className="p-8 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-2">
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-sky-600 hover:underline flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver al calendario</span>
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">Tus datos</h2>
                  <p className="text-xs text-slate-500">Completa tu información para confirmar la reserva</p>
                </div>

                {/* Badge Resumen */}
                <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl text-center space-y-0.5 text-xs text-sky-900 font-semibold">
                  <p>Horarios para el {selectedDay} de Abril a las {selectedTime}</p>
                  <p className="text-[11px] font-normal text-sky-700">con {professional.name}</p>
                </div>

                {/* Formulario */}
                <div className="space-y-4">
                  {/* Nombre completo * (US_013) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Nombre completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        placeholder="Tu nombre"
                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                          nameTouched && !nameVal.valido
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                            : "border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        }`}
                      />
                    </div>
                    {nameTouched && !nameVal.valido && (
                      <p className="text-[11px] text-rose-500 font-medium pl-1">{nameVal.error}</p>
                    )}
                  </div>

                  {/* Email * (US_014) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="tu@email.com"
                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                          emailTouched && !emailVal.isValid
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                            : "border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        }`}
                      />
                    </div>
                    {emailTouched && !emailVal.isValid && (
                      <p className="text-[11px] text-rose-500 font-medium pl-1">{emailVal.message}</p>
                    )}
                  </div>

                  {/* Telefono (opcional) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+54 9 11 1234-5678"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Nota o comentario (opcional) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Nota o comentario <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <textarea
                        rows={2}
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Escribe aquí si tienes alguna consulta o información adicional..."
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    disabled={!isGuestFormValid}
                    onClick={() => {
                      setNameTouched(true);
                      setEmailTouched(true);
                      if (isGuestFormValid) setStep(5);
                    }}
                    className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
                      isGuestFormValid
                        ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                        : "bg-sky-200 cursor-not-allowed"
                    }`}
                  >
                    Revisar reserva
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Al confirmar, aceptas la política de privacidad.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 5: REVISIÓN PREVIA Y CONFIRMACIÓN FINAL (US_015 / TP1 p.26) */}
            {step === 5 && (
              <div className="p-8 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-2">
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs font-semibold text-sky-600 hover:underline flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Modificar datos</span>
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">Revisión de reserva</h2>
                  <p className="text-xs text-slate-500">Verifica los datos antes de confirmar definitivamente</p>
                </div>

                {/* Cuadro de Lectura Resumen (US_015) */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
                    <CalendarIcon className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedEvent?.title || "Consulta"}</p>
                      <p className="text-[11px] text-slate-500">con {professional.name}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha:</span>
                      <span className="font-semibold text-slate-900">{selectedDay} de Abril</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hora:</span>
                      <span className="font-semibold text-slate-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre:</span>
                      <span className="font-semibold text-slate-900">{clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-semibold text-slate-900">{clientEmail}</span>
                    </div>
                    {clientPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Teléfono:</span>
                        <span className="font-semibold text-slate-900">{clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    disabled={submitting}
                    onClick={handleConfirmBooking}
                    className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                  >
                    {submitting ? "Confirmando..." : "Confirmar reserva"}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
