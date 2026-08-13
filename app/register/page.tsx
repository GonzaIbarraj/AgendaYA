"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { checkPasswordRequirements, emailRegex } from "@/lib/validations/auth.schema";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    activationToken: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const passwordReqs = checkPasswordRequirements(password);
  const isPasswordValid =
    passwordReqs.minLength &&
    passwordReqs.hasUppercase &&
    passwordReqs.hasLowercase &&
    passwordReqs.hasNumber &&
    passwordReqs.hasSpecialChar;

  const isEmailValid = emailRegex.test(email.trim());
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = isEmailValid && isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setConfirmPasswordTouched(true);
    setServerError(null);

    if (!isFormValid) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setServerError(data.message || "Error al intentar crear la cuenta");
          return;
        }

        setRegistrationSuccess({
          email: data.user.email,
          activationToken: data.activationToken,
        });
      } catch (err) {
        console.error("Error al enviar registro:", err);
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
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido</h1>
          <p className="text-sm text-slate-500 font-medium">Plataforma para profesionales</p>
        </div>

        {registrationSuccess ? (
          /* Escenario de Exito - Pantalla de Confirmación de Email (TP1 p.6) */
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Revise su email</h2>
              <p className="text-sm text-slate-600">
                Hemos enviado un enlace de confirmación a{" "}
                <span className="font-semibold text-slate-900">{registrationSuccess.email}</span>.
                Por favor haga clic en el enlace para activar su cuenta.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Demo: Link de activación
              </p>
              <p className="text-xs text-blue-600 font-mono break-all bg-white p-2.5 rounded-lg border border-slate-200">
                {`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/confirmar?token=${
                  registrationSuccess.activationToken
                }`}
              </p>
              <p className="text-[11px] text-slate-400">
                El enlace expira en 60 minutos (US_001).
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex justify-center items-center w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                Ir a Iniciar sesión
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de Registro */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-slate-800">Crear cuenta</h2>
              <p className="text-xs text-slate-500">Ingrese sus datos para registrarse</p>
            </div>

            {/* Mensaje de Error de Servidor (ej: Email ya registrado - US_001 Escenario 4) */}
            {serverError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{serverError}</span>
                  {serverError.includes("iniciar sesión") && (
                    <Link
                      href="/login"
                      className="block mt-1 font-semibold underline hover:text-rose-900"
                    >
                      Ir a inicio de sesión
                    </Link>
                  )}
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
                  Por favor ingrese un email válido (ej: usuario@dominio.com)
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
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

              {/* Checklist dinámico de requisitos de contraseña (TP1 p.5) */}
              {password.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 mt-2">
                  <p className="text-[11px] font-semibold text-slate-600">Requisitos de contraseña:</p>
                  <ul className="space-y-1 text-[11px]">
                    <li className={`flex items-center space-x-1.5 ${passwordReqs.minLength ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
                      {passwordReqs.minLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
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

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Confirmar contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  placeholder="Confirme su contraseña"
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
                <p className="text-[11px] text-rose-500 font-medium pl-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={isPending || !isFormValid}
              className={`w-full py-3 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
                isFormValid && !isPending
                  ? "bg-sky-500 hover:bg-sky-600 active:bg-sky-700"
                  : "bg-sky-300 cursor-not-allowed opacity-80"
              }`}
            >
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            {/* Footer */}
            <div className="text-center pt-2 text-xs text-slate-500">
              <span>Ya tiene una cuenta? </span>
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
