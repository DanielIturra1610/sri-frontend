# SRI Inventarios - Frontend

Sistema de gestión de inventarios multi-tenant construido con Next.js 15, React 19, TypeScript y Tailwind CSS.

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: React Query (TanStack Query)
- **Formularios**: React Hook Form + Zod
- **Autenticación**: JWT + NextAuth.js
- **HTTP Client**: Axios
- **Tablas**: TanStack Table
- **Gráficos**: Recharts
- **Notificaciones**: React Hot Toast
- **Iconos**: Lucide React

## Estructura del Proyecto

```
sri-frontend/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI base
│   ├── forms/            # Componentes de formularios
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuración
│   ├── api/             # Cliente API y endpoints
│   ├── hooks/           # Custom hooks
│   └── utils/           # Funciones de utilidad
├── types/               # Tipos TypeScript
└── public/             # Archivos estáticos
```

## Primeros Pasos

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build

```bash
pnpm build
pnpm start
```

## Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=http://localhost:3000
```

## Características

- ✅ Multi-tenancy con aislamiento de datos
- ✅ Sistema RBAC (5 roles)
- ✅ Autenticación JWT
- ✅ Gestión de productos
- ✅ Control de inventario multi-ubicación
- ✅ Transferencias de stock
- ✅ Importación masiva Excel/CSV
- ✅ Auditoría de transacciones
- ✅ Dashboard con métricas
- ✅ Reportes y analytics

## Documentación

Ver [BACKLOG.md](./BACKLOG.md) para el roadmap completo del proyecto.
