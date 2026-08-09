"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { checkPasswordRequirements } from "@/lib/validations/auth.schema";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const passwordReqs = checkPasswordRequirements(password);
  const isPasswordValid =
    passwordReqs.minLength &&
    passwordReqs.hasUppercase &&
    passwordReqs.hasLowercase &&
    passwordReqs.hasNumber &&
    passwordReqs.hasSpecialChar;

  const doPasswordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && token.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmPasswordTouched(true);
    setServerError(null);

    if (!isFormValid) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setServerError(data.message || "No se pudo restablecer la contraseña");
          return;
        }

        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err) {
        console.error("Error al restablecer clave:", err);
        setServerError("Error de conexión con el servidor");
      }
    });
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Enlace no válido</h2>
          <p className="text-xs text-slate-600">No se proporcionó un token de recuperación válido en la URL.</p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center space-x-1.5 py-2.5 px-4 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Solicitar nuevo enlace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Restablecer contraseña</h1>
        <p className="text-xs text-slate-500 font-medium">Ingresa tu nueva contraseña para recuperar el acceso</p>
      </div>

      {successMessage ? (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">¡Contraseña restablecida!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{successMessage}</p>
          </div>
          <p className="text-[11px] text-slate-400">Redirigiendo a inicio de sesión en 3 segundos...</p>
          <Link
            href="/login"
            className="inline-flex justify-center items-center w-full py-2.5 px-4 bg-blue-600 text-white font-semibold text-xs rounded-xl"
          >
            Ir a Iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p>{serverError}</p>
                {serverError.includes("expirado") || serverError.includes("no es válido") ? (
                  <Link
                    href="/forgot-password"
                    className="inline-block text-xs font-bold underline hover:text-rose-900"
                  >
                    Solicitar nuevo enlace
                  </Link>
                ) : null}
              </div>
            </div>
          )}

          {/* Nueva contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Nueva contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su nueva contraseña"
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

            {/* Indicator of password requirements in real time (US_004 Escenario 3) */}
            {password.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 mt-2 text-[11px]">
                <p className="font-semibold text-slate-600">Requisitos de contraseña:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center space-x-1.5 ${passwordReqs.minLength ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}`}>
                    {passwordReqs.minLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Mínimo 8 caracteres (máx. 64)</span>
                  </li>
                  <li className={`flex items-center space-x-1.5 ${passwordReqs.hasUppercase ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
                    {passwordReqs.hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Al menos una letra mayúscula</span>
                  </li>
                  <li className={`flex items-center space-x-1.5 ${passwordReqs.hasLowercase ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
                    {passwordReqs.hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Al menos una letra minúscula</span>
                  </li>
                  <li className={`flex items-center space-x-1.5 ${passwordReqs.hasNumber ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
                    {passwordReqs.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Al menos un número</span>
                  </li>
                  <li className={`flex items-center space-x-1.5 ${passwordReqs.hasSpecialChar ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
                    {passwordReqs.hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Al menos un carácter especial (!@#$%^&amp;*...)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Confirmar nueva contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                placeholder="Confirme su nueva contraseña"
                className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  confirmPasswordTouched && !doPasswordsMatch && confirmPassword.length > 0
                    ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPasswordTouched && !doPasswordsMatch && confirmPassword.length > 0 && (
              <p className="text-[11px] text-rose-500 font-medium pl-1">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !isFormValid}
            className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
              isFormValid && !isPending
                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                : "bg-blue-300 cursor-not-allowed opacity-80"
            }`}
          >
            {isPending ? "Restableciendo..." : "Restablecer contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <Suspense fallback={<div className="text-center text-xs text-slate-400">Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
