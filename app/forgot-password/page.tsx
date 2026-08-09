"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { emailRegex } from "@/lib/validations/auth.schema";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const isEmailValid = emailRegex.test(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setServerError(null);

    if (!isEmailValid) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setServerError(data.message || "Error al procesar la solicitud");
          return;
        }

        setSubmittedMessage(data.message);
        if (data.token) {
          setDemoToken(data.token);
        }
      } catch (err) {
        console.error("Error en solicitud de clave:", err);
        setServerError("Error de conexión con el servidor");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recuperar contraseña</h1>
          <p className="text-xs text-slate-500 font-medium">
            Ingrese su email y le enviaremos un enlace para restablecer su contraseña
          </p>
        </div>

        {submittedMessage ? (
          /* Pantalla de Éxito / Neutral (TP1 p.9) */
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Email enviado</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{submittedMessage}</p>
            </div>

            {demoToken && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Demo: Enlace de restablecimiento
                </p>
                <p className="text-xs text-blue-600 font-mono break-all bg-white p-2.5 rounded-lg border border-slate-200">
                  {`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${demoToken}`}
                </p>
                <p className="text-[11px] text-slate-400">
                  El enlace expira en 60 minutos (US_003).
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex justify-center items-center space-x-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a iniciar sesión</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="nombre@ejemplo.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    emailTouched && !isEmailValid && email.length > 0
                      ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
              </div>
              {emailTouched && !isEmailValid && email.length > 0 && (
                <p className="text-[11px] text-rose-500 font-medium pl-1">
                  Por favor ingresá un correo electrónico válido
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !isEmailValid}
              className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
                isEmailValid && !isPending
                  ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                  : "bg-sky-200 cursor-not-allowed opacity-80"
              }`}
            >
              {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a iniciar sesión</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
