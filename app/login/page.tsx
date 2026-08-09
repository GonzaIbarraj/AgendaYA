"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { emailRegex } from "@/lib/validations/auth.schema";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);

  // Estados de seguridad US_002 (intentos fallidos, bloqueo y Captcha)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEmailValid = emailRegex.test(email.trim());

  // Captcha simple de prueba (ej: 5 + 3)
  const isCaptchaValid = captchaAnswer.trim() === "8";

  const canSubmit =
    isEmailValid &&
    password.length > 0 &&
    (!requiresCaptcha || (requiresCaptcha && (captchaSolved || isCaptchaValid)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setServerError(null);

    if (!canSubmit) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            rememberMe,
            captchaToken: requiresCaptcha ? "captcha-token-valid" : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setServerError(data.message || "Usuario o contraseña incorrectos");

          if (data.attempts !== undefined) setFailedAttempts(data.attempts);
          if (data.isBlocked !== undefined) setIsBlocked(data.isBlocked);
          if (data.requiresCaptcha !== undefined) setRequiresCaptcha(data.requiresCaptcha);

          return;
        }

        // Login Exitoso -> Redirigir al Dashboard (CP-M01-001)
        router.push("/dashboard");
      } catch (err) {
        console.error("Error al iniciar sesión:", err);
        setServerError("No pudimos conectar con el servidor. Intente nuevamente.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido</h1>
          <p className="text-sm text-slate-500 font-medium">Plataforma para profesionales</p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-slate-800">Iniciar sesión</h2>
            <p className="text-xs text-slate-500">Ingrese sus credenciales para acceder</p>
          </div>

          {/* Mensaje de Error Genérico (TP1 p.7, US_002 Escenario 2) */}
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Banner de Bloqueo por Límite de Seguridad (US_002 Escenario 3 / CP-M01-002) */}
          {requiresCaptcha && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Control de Seguridad (5to intento fallido)</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Se ha alcanzado el límite de {failedAttempts} intentos fallidos consecutivos. Por favor resuelva el siguiente desafío para habilitar el reintento:
              </p>

              <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Desafío Captcha: ¿Cuánto es <span className="font-bold text-slate-900">5 + 3</span>?
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      if (e.target.value.trim() === "8") {
                        setCaptchaSolved(true);
                      } else {
                        setCaptchaSolved(false);
                      }
                    }}
                    placeholder="Resultado"
                    className="w-24 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  {captchaSolved && (
                    <span className="text-xs text-emerald-600 flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Desafío resuelto
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Campo Email */}
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
                Por favor ingrese un email válido
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-blue-600 hover:underline"
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Casilla Recordarme (US_002 Escenario 4) */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
              Recordarme en este dispositivo
            </label>
          </div>

          {/* Botón de Iniciar Sesión */}
          <button
            type="submit"
            disabled={isPending || !canSubmit}
            className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
              canSubmit && !isPending
                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                : "bg-blue-300 cursor-not-allowed opacity-80"
            }`}
          >
            {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          {/* Footer */}
          <div className="text-center pt-2 text-xs text-slate-500">
            <span>¿No tiene una cuenta? </span>
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Registrarse
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
