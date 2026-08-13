# Guía de Funcionalidades Integradas - Proyecto AgendaYA

Este documento proporciona una explicación detallada de todas las nuevas funcionalidades, arquitecturas de backend, formularios de frontend y pruebas que se han incorporado al repositorio en la rama `feature/desarrollo-completo`.Está pensado para que cualquier integrante del equipo pueda entender la estructura, probar el sistema localmente y continuar extendiendo el desarrollo.

---

## 🛠️ Requisitos de Entorno y Configuración Inicial

### 1. Variables de Entorno (`.env`)
Asegurate de contar con el archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="agendaya-secret-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Base de Datos SQLite y Datos de Prueba
Para sincronizar el esquema de Prisma y cargar el usuario de prueba (`pepelopez@gmail.com`), ejecutá los siguientes comandos en la terminal:

```bash
# Sincronizar esquema Prisma con la BD SQLite
npx prisma db push

# Poblar el usuario de prueba de administrador (Pepe López)
node scripts/seed.cjs
```

### 3. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en **`http://localhost:3000`**.

### 4. Ejecutar la Suite de Pruebas (Jest)
```bash
npm test
```
*(Verifica los 6 test suites unitarios originales en `utils/`)*.

---

## 👤 Credenciales del Usuario de Prueba

Para probar el inicio de sesión y acceder al panel privado de administración:
- **URL Login**: `http://localhost:3000/login`
- **Email**: `pepelopez@gmail.com`
- **Contraseña**: `ClaveValida123!`

---

## 📋 Detalle de Historias de Usuario Incorporadas

### 1. Registro de Usuario Administrador (`US_001`)
- **Ruta Web**: `/register`
- **Endpoint API**: `POST /api/auth/register`
- **Características**:
  - Validaciones defensivas Zod (`lib/validations/auth.schema.ts`).
  - **Políticas de Seguridad en Contraseña**: Mínimo 8 caracteres (máx. 64), al menos 1 letra mayúscula, 1 minúscula, 1 número y 1 carácter especial (`!@#$%^&*...`).
  - **Checklist dinámico en tiempo real** en el formulario con indicadores en verde/gris.
  - Generación de hash seguro con `bcrypt` (factor de costo 10).
  - Creación de cuenta en estado *"En espera"* (`isEmailConfirmed: false`) con token de activación por correo válido por 60 minutos.
  - Pantalla de aviso *"Revise su email"* con enlace simulado.
  - Validación de correo duplicado: si el email ya existe, responde: `"Este correo ya está registrado. ¿Deseas iniciar sesión?"`.

### 2. Inicio de Sesión Estándar y Control de Seguridad (`US_002`)
- **Ruta Web**: `/login`
- **Endpoint API**: `POST /api/auth/login`
- **Características**:
  - Verificación de credenciales con hash `bcrypt`.
  - **Mensaje genérico de error**: ante fallos devuelve `"Usuario o contraseña incorrectos"` para prevenir la enumeración de usuarios.
  - **Casilla "Recordarme"**: extiende la duración del token JWT a 7 días (en lugar de 24 horas).
  - **Token JWT en Cookie HTTP-Only**: Cookie segura `agendaya_session` gestionada automáticamente por la API.
  - **Control de Intentos Fallidos & Captcha (Regla US_002 / CP-M01-002)**:
    - Integra la función de seguridad `verificarIntentosLogin` de `utils/authSecurity.ts`.
    - Cada fallo consecutivo incrementa el contador del usuario en BD.
    - Al **5to intento fallido consecutivo**, la cuenta pasa a estado bloqueada (`isBlocked: true`), inhabilitando el botón de login y desplegando en pantalla un desafío de seguridad **Captcha** obligatorio.

### 3. Solicitud y Restablecimiento de Contraseña (`US_003` & `US_004`)
- **Rutas Web**: `/forgot-password` y `/reset-password?token=...`
- **Endpoints API**: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`
- **Características**:
  - **Mensaje Neutro de Seguridad**: Tanto si el mail ingresado existe como si no, el sistema responde: `"Si ese correo está registrado, recibirás un enlace en los próximos minutos"`.
  - Token de recuperación con validez estricta de 60 minutos.
  - **Invalidación de Tokens Anteriores**: Solicitar un nuevo correo invalida automáticamente los tokens generados previamente para esa cuenta.
  - Al cambiar la clave: actualiza la contraseña con `bcrypt`, invalida el token utilizado y cierra las sesiones activas en otros dispositivos.

### 4. Dashboard de Resumen y Mi Perfil (`US_005` a `US_008`)
- **Rutas Web**: `/dashboard` y `/dashboard/perfil`
- **Endpoints API**: `GET /api/dashboard/stats` y `GET/PUT /api/profile`
- **Características**:
  - **Sidebar Persistente**: Menú con navegación (*Agenda, Reservas, Disponibilidad, Mi Perfil, Configuración*), avatar con iniciales o foto, y botón de *"Cerrar sesión"*.
  - **Vista de Agenda (`/dashboard`)**: 4 Tarjetas de métricas (*Citas hoy: 5, Clientes: 48, Pendientes: 3, Esta semana: 24*) y lista de *"Citas de hoy"* (con horarios, nombres de clientes y consultas).
  - **Vista de Mi Perfil (`/dashboard/perfil`)**:
    - Subida de **Foto de Perfil** (JPG, PNG, WEBP <= 5MB - `US_008`) con previsualización.
    - Edición interactiva de **Nombre completo** (`validarNombreProfesional` - `US_005`).
    - Edición de **Correo electrónico de contacto** (`validateEmail` - `US_006`).
    - Selección de **Zona horaria** (desplegable UTC - `US_007`).
    - Campo de **Enlace público personalizado** (slug `agendaya.com/pepe-lopez` con validación de unicidad en tiempo real y botón *"Copiar"* - `M01-R06F`).

### 5. Flujo de Booking Público Mobile-First (`US_010` a `US_015`)
- **Rutas Web Públicas**: `/[slug]` o `/p/[slug]` (ej: `http://localhost:3000/pepe-lopez`)
- **Endpoint API**: `POST /api/appointments/book`
- **Características**:
  - **Sin Registro Obligatorio** para los invitados (`M04-RN04`).
  - **Reglas de Usabilidad Mobile**: Máximo 4 pasos, elementos en zona de alcance del pulgar, áreas de toque de días en el calendario de al menos **44x44 dp** (`US_012`).
  - **Paso 1 (Bienvenida)**: Foto, nombre, especialidad y botón *"Reservar turno"*.
  - **Paso 2 (Tipo de Cita)**: Selección de servicio (*Consulta Individual*, *Videollamada*, *Cita Presencial*).
  - **Paso 3 (Calendario e Horarios)**: Navegación mensual hacia el futuro, días sin disponibilidad grisados e inhabilitados, botones de selección de franja horaria.
  - **Paso 4 (Tus datos)**: Nombre completo (`validarNombre` - `US_013`), Email (`validateEmail` - `US_014`), teléfono y notas opcionales.
  - **Paso 5 (Revisión & Confirmación Final)**: Vista previa de lectura de datos antes de enviar.
  - **Manejo de Concurrencia e ID Único**: Verifica la disponibilidad del horario en BD y genera el ID de reserva con formato `RES-YYYYMMDD-XXXX` (usando `utils/confirmReservation.ts`). Muestra la pantalla de éxito con aviso de mail enviado y botones para agregar a Google Calendar.

---

## 📁 Arquitectura del Código Creado

```text
AgendaYA/
├── app/
│   ├── [slug]/page.tsx              # Ruta pública de booking por slug directo
│   ├── p/[slug]/page.tsx            # Ruta pública de booking secundaria
│   ├── register/page.tsx            # Pantalla de Registro (US_001)
│   ├── login/page.tsx               # Pantalla de Login con Captcha (US_002)
│   ├── forgot-password/page.tsx     # Pantalla de solicitud de recuperación (US_003)
│   ├── reset-password/page.tsx      # Pantalla de restablecimiento de contraseña (US_004)
│   ├── dashboard/
│   │   ├── layout.tsx               # Layout del Dashboard con Sidebar persistente
│   │   ├── page.tsx                 # Vista de Resumen de Agenda (Imagen 2)
│   │   └── perfil/page.tsx          # Vista de Mi Perfil (Imagen 3)
│   └── api/
│       ├── auth/                    # Endpoints (register, login, me, logout, forgot/reset password)
│       ├── profile/                 # Endpoint GET/PUT del perfil de administrador
│       ├── dashboard/stats/         # Endpoint GET de métricas del dashboard
│       ├── public/[slug]/           # Endpoint GET de datos públicos del profesional
│       └── appointments/book/       # Endpoint POST de confirmación de reserva
├── components/
│   ├── Sidebar.tsx                  # Componente de navegación lateral
│   └── BookingFlow.tsx              # Componente interactivo del flujo de booking mobile
├── lib/
│   ├── db.ts                        # Singleton de PrismaClient
│   ├── services/auth.service.ts     # Lógica de negocio de autenticación y JWT
│   └── validations/auth.schema.ts   # Esquemas de validación Zod
├── prisma/
│   └── schema.prisma                # Esquema de base de datos ORM
├── utils/                           # Funciones de reglas de negocio y tests unitarios
└── scripts/
    └── seed.cjs                     # Script de inicialización de datos de prueba
```
