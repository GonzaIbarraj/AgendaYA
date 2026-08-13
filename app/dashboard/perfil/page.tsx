"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Globe,
  Link as LinkIcon,
  Pencil,
  Copy,
  Check,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { validarNombreProfesional } from "@/utils/professionalName";
import { validateEmail } from "@/utils/emailValidation";

export default function ProfilePage() {
  const [name, setName] = useState("Pepe Lopez");
  const [email, setEmail] = useState("pepelopez@gmail.com");
  const [timezone, setTimezone] = useState("(UTC-03:00) Buenos Aires");
  const [publicSlug, setPublicSlug] = useState("pepe-lopez");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Estados de edición individual por campo
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.name) setName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.timezone) setTimezone(data.user.timezone);
          if (data.user.publicSlug) setPublicSlug(data.user.publicSlug);
          if (data.user.photoUrl) setPhotoUrl(data.user.photoUrl);
        }
      })
      .catch((err) => console.error("Error al cargar perfil:", err));
  }, []);

  const handleCopyLink = () => {
    const fullUrl = `https://agendaya.com/${publicSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setFeedback(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
    setFeedback(null);
  };

  const saveField = async (field: string) => {
    setFeedback(null);

    // Validaciones locales según TPs
    if (field === "name") {
      const v = validarNombreProfesional(tempValue);
      if (!v.valido) {
        setFeedback({ type: "error", message: v.error || "El nombre es obligatorio" });
        return;
      }
    }

    if (field === "email") {
      const v = validateEmail(tempValue);
      if (!v.isValid) {
        setFeedback({ type: "error", message: v.message });
        return;
      }
    }

    if (field === "publicSlug") {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(tempValue.trim().toLowerCase())) {
        setFeedback({
          type: "error",
          message: "El enlace solo puede contener letras minúsculas, números y guiones",
        });
        return;
      }
    }

    try {
      const payload: Record<string, string> = {};
      payload[field] = tempValue;

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({ type: "error", message: data.message || "Error al actualizar perfil" });
        return;
      }

      // Actualizar estado local
      if (field === "name") setName(data.user.name);
      if (field === "email") setEmail(data.user.email);
      if (field === "timezone") setTimezone(data.user.timezone);
      if (field === "publicSlug") setPublicSlug(data.user.publicSlug);

      setEditingField(null);
      setFeedback({ type: "success", message: "Cambio guardado correctamente" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("Error al guardar campo:", err);
      setFeedback({ type: "error", message: "No se pudo actualizar el perfil" });
    }
  };

  // US_008: Subida de Foto de Perfil
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación M01-RN02: .jpg, .png, .webp <= 5MB
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFeedback({ type: "error", message: "Formato no permitido. Solo JPG, PNG o WEBP." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "El archivo supera el límite de 5 MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Photo = reader.result as string;
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: base64Photo }),
        });
        const data = await res.json();
        if (data.success) {
          setPhotoUrl(data.user.photoUrl);
          setFeedback({ type: "success", message: "Foto actualizada correctamente" });
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (err) {
        console.error("Error al subir foto:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const timezoneOptions = [
    "(UTC-03:00) Buenos Aires",
    "(UTC-03:00) Sao Paulo",
    "(UTC-03:00) Santiago",
    "(UTC-05:00) Bogota",
    "(UTC-05:00) Lima",
    "(UTC-06:00) Ciudad de Mexico",
    "(UTC-05:00) Nueva York",
    "(UTC-08:00) Los Angeles",
    "(UTC+01:00) Madrid",
    "(UTC+00:00) Londres",
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Administre su informacion personal y configuracion de cuenta
        </p>
      </div>

      {/* Banner de Feedback (M01-RN03) */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Profile Card (Imagen 3) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-50 shadow-sm"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-50 text-blue-600 font-bold text-3xl flex items-center justify-center border-4 border-blue-100 shadow-sm">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105"
              title="Cambiar foto de perfil"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">
              Haga clic en el lapiz para cambiar su foto de perfil
            </p>
            <p className="text-[11px] text-slate-400">
              Formatos: JPG, PNG, WEBP (max. 5MB)
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Form Fields */}
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Field 1: Nombre completo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nombre completo</span>
              </label>
              {editingField !== "name" && (
                <button
                  onClick={() => startEditing("name", name)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {editingField === "name" ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-blue-500 rounded-xl focus:outline-none"
                />
                <button
                  onClick={() => saveField("name")}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800">
                {name}
              </div>
            )}
          </div>

          {/* Field 2: Correo electronico */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Correo electronico</span>
              </label>
              {editingField !== "email" && (
                <button
                  onClick={() => startEditing("email", email)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {editingField === "email" ? (
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-blue-500 rounded-xl focus:outline-none"
                />
                <button
                  onClick={() => saveField("email")}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800">
                {email}
              </div>
            )}
          </div>

          {/* Field 3: Zona horaria (US_007) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Zona horaria</span>
              </label>
              {editingField !== "timezone" && (
                <button
                  onClick={() => startEditing("timezone", timezone)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {editingField === "timezone" ? (
              <div className="flex items-center space-x-2">
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-blue-500 rounded-xl focus:outline-none"
                >
                  {timezoneOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => saveField("timezone")}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800">
                {timezone}
              </div>
            )}
          </div>

          {/* Field 4: Enlace publico (M01-R06F) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Enlace publico</span>
              </label>
              {editingField !== "publicSlug" && (
                <button
                  onClick={() => startEditing("publicSlug", publicSlug)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {editingField === "publicSlug" ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-blue-500 rounded-xl overflow-hidden px-3 py-1.5 text-sm">
                  <span className="text-slate-400 text-xs mr-1">https://agendaya.com/</span>
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 font-medium"
                  />
                </div>
                <button
                  onClick={() => saveField("publicSlug")}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 truncate">
                  https://agendaya.com/{publicSlug}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
