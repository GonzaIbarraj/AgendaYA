# AgendaYA - Sistema de Gestión de Agenda y Reservas

AgendaYA es una plataforma web desarrollada con **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM** y **Jest**.

Diseñada para profesionales independientes y clientes:
- **Vista Desktop**: Panel de administración privado para configurar la agenda, ver estadísticas de citas y editar el perfil profesional.
- **Vista Mobile-First**: Flujo de reserva pública rápido e intuitivo para invitados (sin registro obligatorio), con un máximo de 4 pasos e interfaces táctiles adaptadas.

---

## 📖 Guía Rápida

Para consultar la documentación completa de todas las nuevas funcionalidades de backend, frontend, endpoints de la API y suite de pruebas desarrolladas en esta rama, ingresá a:

👉 **[NUEVAS_FUNCIONALIDADES.md](./NUEVAS_FUNCIONALIDADES.md)**

---

## 🚀 Inicio Rápido Local

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno y Base de Datos
Asegurate de contar con el archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="agendaya-secret-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Luego inicializá la base de datos y poblala con el usuario de prueba:
```bash
npx prisma db push
node scripts/seed.cjs
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Accedé a **`http://localhost:3000`** en tu navegador.

### 4. Ejecutar Suite de Pruebas (Jest)
```bash
npm test
```

---

## 🔑 Credenciales de Prueba

- **URL de Login**: `http://localhost:3000/login`
- **Email**: `pepelopez@gmail.com`
- **Contraseña**: `ClaveValida123!`
- **Enlace de Reserva Pública**: `http://localhost:3000/pepe-lopez`
