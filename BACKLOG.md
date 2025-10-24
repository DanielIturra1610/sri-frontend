# SRI Inventarios - Frontend Backlog

## 📋 Roadmap General

Este backlog contiene todas las user stories e issues para el desarrollo del frontend del sistema SRI Inventarios. Está organizado en fases y priorizado según dependencias y valor de negocio.

---

## 🎯 Fases del Proyecto

### **Fase 1: Fundación** (Sprint 1-2)
- Configuración del proyecto
- Sistema de autenticación
- Layout base y navegación
- Integración con API

### **Fase 2: Gestión de Productos** (Sprint 3-4)
- CRUD de productos
- Gestión de categorías
- Sistema de búsqueda y filtros

### **Fase 3: Gestión de Inventario** (Sprint 5-6)
- Control de stock multi-ubicación
- Transferencias de stock
- Auditoría de transacciones

### **Fase 4: Importación y Reportes** (Sprint 7-8)
- Importación masiva
- Dashboard y métricas
- Reportes y exportación

### **Fase 5: Optimización** (Sprint 9+)
- Mejoras de UX/UI
- Performance
- Features avanzadas

---

## 📝 Backlog Detallado

---

## 🔐 **FASE 1: FUNDACIÓN**

### **Epic 1.1: Configuración Inicial del Proyecto**

#### **US-F001: Setup del proyecto Next.js**
**Como** desarrollador
**Quiero** configurar el proyecto base de Next.js
**Para** tener una estructura sólida y escalable

**Criterios de aceptación:**
- [x] Next.js 15 con App Router
- [x] TypeScript configurado
- [x] Tailwind CSS instalado
- [x] ESLint y Prettier configurados
- [x] Estructura de carpetas definida
- [ ] Variables de entorno configuradas

**Tareas técnicas:**
- [x] Instalar dependencias base
- [x] Configurar tsconfig.json
- [x] Configurar tailwind.config
- [ ] Configurar .env.local
- [ ] Crear estructura de carpetas

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 horas

---

#### **US-F002: Instalar dependencias principales**
**Como** desarrollador
**Quiero** instalar todas las librerías necesarias
**Para** tener las herramientas de desarrollo listas

**Dependencias a instalar:**
```bash
# Estado y data fetching
npm install @tanstack/react-query axios

# Formularios y validación
npm install react-hook-form @hookform/resolvers zod

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast
npm install lucide-react class-variance-authority clsx tailwind-merge

# Tablas
npm install @tanstack/react-table

# Gráficos
npm install recharts

# Auth
npm install next-auth

# Utilidades
npm install date-fns react-hot-toast
```

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 1 hora

---

#### **US-F003: Configurar cliente HTTP (Axios)**
**Como** desarrollador
**Quiero** tener un cliente HTTP configurado
**Para** comunicarme con el backend de forma estandarizada

**Criterios de aceptación:**
- [ ] Cliente Axios configurado con baseURL
- [ ] Interceptor para agregar token JWT
- [ ] Interceptor para refresh token
- [ ] Manejo de errores centralizado
- [ ] TypeScript types para responses

**Archivo:** `lib/api/client.ts`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 horas

---

### **Epic 1.2: Sistema de Autenticación**

#### **US-F004: Implementar login**
**Como** usuario
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder al sistema

**Criterios de aceptación:**
- [ ] Formulario de login con validación
- [ ] Llamada a API POST /auth/login
- [ ] Guardar token en localStorage/cookies
- [ ] Redirección al dashboard después del login
- [ ] Mensajes de error claros
- [ ] Loading state durante autenticación

**Página:** `app/(auth)/login/page.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 4 horas

---

#### **US-F005: Implementar registro de tenant**
**Como** nuevo cliente
**Quiero** registrar mi empresa
**Para** comenzar a usar el sistema

**Criterios de aceptación:**
- [ ] Formulario de registro con validación
- [ ] Campos: nombre empresa, RUT, email, teléfono, plan
- [ ] Llamada a API POST /auth/register
- [ ] Confirmación visual de registro exitoso
- [ ] Redirección a página de verificación

**Página:** `app/(auth)/register/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 5 horas

---

#### **US-F006: Implementar logout**
**Como** usuario autenticado
**Quiero** cerrar sesión
**Para** salir del sistema de forma segura

**Criterios de aceptación:**
- [ ] Botón de logout en header
- [ ] Llamada a API POST /auth/logout
- [ ] Limpiar tokens almacenados
- [ ] Redirección a página de login
- [ ] Confirmación antes de cerrar sesión

**Prioridad:** 🟡 ALTA
**Estimación:** 2 horas

---

#### **US-F007: Implementar refresh token**
**Como** sistema
**Quiero** refrescar el token automáticamente
**Para** mantener la sesión activa sin interrupciones

**Criterios de aceptación:**
- [ ] Detectar token expirado (401)
- [ ] Llamar a POST /auth/refresh
- [ ] Actualizar token en storage
- [ ] Reintentar request original
- [ ] Logout si refresh falla

**Archivo:** `lib/api/client.ts`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

#### **US-F008: Implementar protección de rutas**
**Como** sistema
**Quiero** proteger rutas privadas
**Para** evitar acceso no autorizado

**Criterios de aceptación:**
- [ ] Middleware para verificar autenticación
- [ ] Redirección a login si no autenticado
- [ ] Verificar permisos por rol (RBAC)
- [ ] Bloquear rutas según permisos
- [ ] Mostrar 403 si sin permisos

**Archivo:** `middleware.ts`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 horas

---

### **Epic 1.3: Layout y Navegación**

#### **US-F009: Crear layout principal (Dashboard)**
**Como** usuario autenticado
**Quiero** un layout consistente
**Para** navegar fácilmente por el sistema

**Criterios de aceptación:**
- [ ] Sidebar con navegación
- [ ] Header con info del usuario y logout
- [ ] Breadcrumbs
- [ ] Responsive (mobile-friendly)
- [ ] Logo y branding

**Componentes:**
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/Breadcrumbs.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 6 horas

---

#### **US-F010: Implementar navegación principal**
**Como** usuario
**Quiero** ver un menú de navegación
**Para** acceder a diferentes secciones

**Menú items:**
- 🏠 Dashboard
- 📦 Productos
  - Ver productos
  - Categorías
- 📊 Inventario
  - Stock
  - Ubicaciones
  - Transferencias
  - Transacciones
- 📥 Importar
- 📈 Reportes
- ⚙️ Configuración
- 👥 Usuarios (solo Admin/Owner)

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 4 horas

---

#### **US-F011: Implementar sistema de permisos en UI**
**Como** sistema
**Quiero** mostrar/ocultar elementos según permisos
**Para** adaptar la UI al rol del usuario

**Criterios de aceptación:**
- [ ] Hook usePermissions()
- [ ] Hook useHasPermission(permission)
- [ ] Componente <Can permission="">
- [ ] Ocultar menús sin permisos
- [ ] Deshabilitar botones sin permisos

**Archivo:** `lib/hooks/usePermissions.ts`

**Prioridad:** 🟡 ALTA
**Estimación:** 3 horas

---

### **Epic 1.4: Componentes UI Base**

#### **US-F012: Crear biblioteca de componentes UI**
**Como** desarrollador
**Quiero** componentes reutilizables
**Para** construir interfaces consistentes

**Componentes a crear:**
- [ ] Button
- [ ] Input
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Textarea
- [ ] Card
- [ ] Badge
- [ ] Alert
- [ ] Modal/Dialog
- [ ] Dropdown
- [ ] Tooltip
- [ ] Skeleton
- [ ] Spinner

**Directorio:** `components/ui/`

**Prioridad:** 🟡 ALTA
**Estimación:** 8 horas

---

#### **US-F013: Crear componente de tabla reutilizable**
**Como** desarrollador
**Quiero** un componente de tabla flexible
**Para** mostrar datos tabulares con paginación y filtros

**Criterios de aceptación:**
- [ ] Usar TanStack Table
- [ ] Paginación
- [ ] Ordenamiento
- [ ] Búsqueda
- [ ] Selección múltiple
- [ ] Acciones por fila
- [ ] Responsive

**Componente:** `components/ui/DataTable.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 6 horas

---

---

## 📦 **FASE 2: GESTIÓN DE PRODUCTOS**

### **Epic 2.1: CRUD de Productos**

#### **US-F014: Ver lista de productos**
**Como** usuario
**Quiero** ver todos los productos
**Para** conocer el inventario disponible

**Criterios de aceptación:**
- [ ] Tabla con productos (SKU, nombre, categoría, precio)
- [ ] Paginación (10, 25, 50, 100 items)
- [ ] Búsqueda por SKU, nombre, código de barras
- [ ] Filtro por categoría
- [ ] Filtro por estado (activo/inactivo)
- [ ] Ordenamiento por columnas
- [ ] Loading states
- [ ] Empty state

**API:** `GET /api/v1/products`

**Página:** `app/(dashboard)/products/page.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 6 horas

---

#### **US-F015: Crear producto**
**Como** usuario con permisos
**Quiero** agregar un nuevo producto
**Para** registrarlo en el sistema

**Criterios de aceptación:**
- [ ] Modal/página de creación
- [ ] Formulario con validación
- [ ] Campos: SKU, código de barras, nombre, descripción, categoría, marca, unidad de medida, precio costo, precio venta, IVA, stock mínimo/máximo
- [ ] Llamada a POST /api/v1/products
- [ ] Mensaje de éxito
- [ ] Actualizar lista después de crear

**API:** `POST /api/v1/products`

**Componente:** `components/products/CreateProductModal.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 5 horas

---

#### **US-F016: Ver detalle de producto**
**Como** usuario
**Quiero** ver toda la información de un producto
**Para** conocer sus características

**Criterios de aceptación:**
- [ ] Vista detallada con toda la info
- [ ] Stock por ubicación
- [ ] Historial de transacciones
- [ ] Botón editar (si tiene permisos)
- [ ] Botón eliminar (si tiene permisos)

**API:** `GET /api/v1/products/:id`

**Página:** `app/(dashboard)/products/[id]/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

#### **US-F017: Editar producto**
**Como** usuario con permisos
**Quiero** modificar un producto existente
**Para** actualizar su información

**Criterios de aceptación:**
- [ ] Formulario pre-cargado con datos actuales
- [ ] Validación de cambios
- [ ] Llamada a PATCH /api/v1/products/:id
- [ ] Mensaje de éxito
- [ ] Actualizar vista después de editar

**API:** `PATCH /api/v1/products/:id`

**Componente:** `components/products/EditProductModal.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

#### **US-F018: Eliminar producto**
**Como** usuario con permisos
**Quiero** eliminar un producto
**Para** removerlo del catálogo

**Criterios de aceptación:**
- [ ] Modal de confirmación
- [ ] Advertencia si tiene stock
- [ ] Llamada a DELETE /api/v1/products/:id
- [ ] Mensaje de éxito/error
- [ ] Actualizar lista después de eliminar

**API:** `DELETE /api/v1/products/:id`

**Prioridad:** 🟢 MEDIA
**Estimación:** 2 horas

---

### **Epic 2.2: Gestión de Categorías**

#### **US-F019: CRUD de categorías**
**Como** usuario con permisos
**Quiero** gestionar categorías
**Para** organizar los productos

**Criterios de aceptación:**
- [ ] Lista de categorías
- [ ] Crear categoría
- [ ] Editar categoría
- [ ] Eliminar categoría (si no tiene productos)
- [ ] Búsqueda y filtros

**APIs:**
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

**Página:** `app/(dashboard)/categories/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 6 horas

---

---

## 📊 **FASE 3: GESTIÓN DE INVENTARIO**

### **Epic 3.1: Gestión de Stock**

#### **US-F020: Ver inventario por ubicación**
**Como** usuario
**Quiero** ver el stock de todos los productos por ubicación
**Para** conocer el inventario disponible

**Criterios de aceptación:**
- [ ] Tabla con stock (producto, ubicación, cantidad, min, max)
- [ ] Filtro por ubicación
- [ ] Filtro por producto
- [ ] Indicador de stock bajo (cantidad < mínimo)
- [ ] Indicador de stock crítico
- [ ] Búsqueda
- [ ] Paginación

**API:** `GET /api/v1/inventory/stock`

**Página:** `app/(dashboard)/inventory/stock/page.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 6 horas

---

#### **US-F021: Ver stock de un producto específico**
**Como** usuario
**Quiero** ver el stock de un producto en todas las ubicaciones
**Para** saber dónde está disponible

**Criterios de aceptación:**
- [ ] Vista de stock por ubicación
- [ ] Total de stock
- [ ] Stock disponible vs reservado
- [ ] Historial de movimientos
- [ ] Gráfico de evolución de stock

**API:** `GET /api/v1/inventory/stock/product/:id`

**Página:** `app/(dashboard)/inventory/stock/product/[id]/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

#### **US-F022: Ajustar stock manualmente**
**Como** usuario con permisos
**Quiero** ajustar el stock manualmente
**Para** corregir diferencias de inventario

**Criterios de aceptación:**
- [ ] Modal de ajuste
- [ ] Seleccionar producto y ubicación
- [ ] Ingresar cantidad de ajuste (+/-)
- [ ] Razón del ajuste (requerido)
- [ ] Llamada a API
- [ ] Registro en auditoría

**API:** `POST /api/v1/inventory/transactions`

**Componente:** `components/inventory/AdjustStockModal.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

### **Epic 3.2: Ubicaciones**

#### **US-F023: CRUD de ubicaciones**
**Como** usuario con permisos
**Quiero** gestionar ubicaciones de almacenamiento
**Para** organizar el inventario físicamente

**Criterios de aceptación:**
- [ ] Lista de ubicaciones
- [ ] Crear ubicación (código, nombre, tipo, descripción)
- [ ] Editar ubicación
- [ ] Desactivar ubicación
- [ ] Filtros y búsqueda

**APIs:**
- `GET /api/v1/locations`
- `POST /api/v1/locations`
- `PATCH /api/v1/locations/:id`
- `DELETE /api/v1/locations/:id`

**Página:** `app/(dashboard)/locations/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 5 horas

---

### **Epic 3.3: Transferencias de Stock**

#### **US-F024: Crear transferencia de stock**
**Como** usuario con permisos
**Quiero** transferir stock entre ubicaciones
**Para** redistribuir inventario

**Criterios de aceptación:**
- [ ] Formulario de transferencia
- [ ] Seleccionar producto
- [ ] Ubicación origen
- [ ] Ubicación destino
- [ ] Cantidad a transferir
- [ ] Validar stock disponible
- [ ] Razón de la transferencia
- [ ] Llamada a API

**API:** `POST /api/v1/transfers`

**Página:** `app/(dashboard)/transfers/create/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 6 horas

---

#### **US-F025: Ver lista de transferencias**
**Como** usuario
**Quiero** ver todas las transferencias
**Para** hacer seguimiento de movimientos

**Criterios de aceptación:**
- [ ] Tabla con transferencias
- [ ] Estados: pending, in_transit, completed, cancelled
- [ ] Filtro por estado
- [ ] Filtro por producto
- [ ] Filtro por fechas
- [ ] Búsqueda
- [ ] Acciones: ver detalle, completar, cancelar

**API:** `GET /api/v1/transfers`

**Página:** `app/(dashboard)/transfers/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 5 horas

---

#### **US-F026: Completar transferencia**
**Como** usuario con permisos
**Quiero** marcar una transferencia como completada
**Para** actualizar el stock en destino

**Criterios de aceptación:**
- [ ] Botón "Completar" en transferencia
- [ ] Modal de confirmación
- [ ] Llamada a API
- [ ] Actualizar estado
- [ ] Actualizar stock

**API:** `POST /api/v1/transfers/:id/complete`

**Prioridad:** 🟡 ALTA
**Estimación:** 3 horas

---

### **Epic 3.4: Auditoría de Transacciones**

#### **US-F027: Ver historial de transacciones**
**Como** auditor
**Quiero** ver todas las transacciones de inventario
**Para** auditar movimientos

**Criterios de aceptación:**
- [ ] Tabla con transacciones
- [ ] Tipos: purchase, sale, adjustment, transfer_in, transfer_out
- [ ] Filtro por tipo
- [ ] Filtro por producto
- [ ] Filtro por ubicación
- [ ] Filtro por usuario
- [ ] Filtro por fechas
- [ ] Exportar a Excel

**API:** `GET /api/v1/inventory/transactions`

**Página:** `app/(dashboard)/inventory/transactions/page.tsx`

**Prioridad:** 🟢 MEDIA
**Estimación:** 5 horas

---

---

## 📥 **FASE 4: IMPORTACIÓN Y REPORTES**

### **Epic 4.1: Importación Masiva**

#### **US-F028: Descargar plantillas de importación**
**Como** usuario
**Quiero** descargar plantillas Excel
**Para** preparar mis datos de importación

**Criterios de aceptación:**
- [ ] Botón "Descargar plantilla"
- [ ] Selector de tipo: products-with-stock, products-only, stock-only
- [ ] Llamada a GET /api/v1/import/template?type=...
- [ ] Descarga automática del archivo

**API:** `GET /api/v1/import/template`

**Página:** `app/(dashboard)/import/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 2 horas

---

#### **US-F029: Importar productos con stock (Option B)**
**Como** usuario con permisos
**Quiero** importar productos y su stock desde Excel
**Para** cargar datos masivamente

**Criterios de aceptación:**
- [ ] Drag & drop para subir archivo
- [ ] Validación de tipo de archivo (.xlsx, .xls, .csv)
- [ ] Opciones de importación (update_existing, create_categories, etc.)
- [ ] Preview de datos antes de importar
- [ ] Progress bar durante importación
- [ ] Resultados de la importación (éxitos, errores, warnings)
- [ ] Opción de dry-run
- [ ] Descargar reporte de errores

**API:** `POST /api/v1/import/products-with-stock`

**Página:** `app/(dashboard)/import/products-with-stock/page.tsx`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 8 horas

---

#### **US-F030: Importar solo productos (Option A)**
**Como** usuario con permisos
**Quiero** importar solo productos sin stock
**Para** actualizar el catálogo

**Criterios de aceptación:**
- [ ] Similar a US-F029 pero para productos-only
- [ ] Opciones específicas de esta modalidad

**API:** `POST /api/v1/import/products-only`

**Página:** `app/(dashboard)/import/products-only/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

#### **US-F031: Importar solo stock (Option C)**
**Como** usuario con permisos
**Quiero** importar stock para productos existentes
**Para** actualizar inventario masivamente

**Criterios de aceptación:**
- [ ] Similar a US-F029 pero para stock-only
- [ ] Validación de productos existentes
- [ ] Opciones específicas de esta modalidad

**API:** `POST /api/v1/import/stock-only`

**Página:** `app/(dashboard)/import/stock-only/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 4 horas

---

### **Epic 4.2: Dashboard y Métricas**

#### **US-F032: Crear dashboard principal**
**Como** usuario
**Quiero** ver un dashboard con métricas clave
**Para** tener una visión general del negocio

**Métricas a mostrar:**
- [ ] Total de productos
- [ ] Valor total del inventario
- [ ] Productos con stock bajo
- [ ] Transacciones del día
- [ ] Gráfico de valor de inventario por ubicación
- [ ] Gráfico de movimientos de stock (últimos 30 días)
- [ ] Top 10 productos más vendidos
- [ ] Alertas de stock crítico

**APIs:**
- `GET /api/v1/dashboard/metrics`
- `GET /api/v1/dashboard/charts`

**Página:** `app/(dashboard)/page.tsx`

**Prioridad:** 🟡 ALTA
**Estimación:** 10 horas

---

#### **US-F033: Crear reportes de inventario**
**Como** gerente
**Quiero** generar reportes de inventario
**Para** analizar el negocio

**Tipos de reportes:**
- [ ] Inventario valorizado
- [ ] Movimientos por período
- [ ] Stock bajo/crítico
- [ ] Transferencias por ubicación
- [ ] Productos sin movimiento
- [ ] Filtros por fechas, categorías, ubicaciones
- [ ] Exportar a Excel/PDF

**Página:** `app/(dashboard)/reports/page.tsx`

**Prioridad:** 🟢 MEDIA
**Estimación:** 8 horas

---

---

## 🎨 **FASE 5: OPTIMIZACIÓN Y FEATURES AVANZADAS**

### **Epic 5.1: Mejoras de UX/UI**

#### **US-F034: Implementar dark mode**
**Como** usuario
**Quiero** cambiar entre modo claro y oscuro
**Para** adaptarlo a mis preferencias

**Prioridad:** 🔵 BAJA
**Estimación:** 4 horas

---

#### **US-F035: Agregar animaciones y transiciones**
**Como** usuario
**Quiero** una interfaz fluida y animada
**Para** una mejor experiencia de uso

**Prioridad:** 🔵 BAJA
**Estimación:** 3 horas

---

#### **US-F036: Implementar tooltips y ayuda contextual**
**Como** usuario nuevo
**Quiero** ver ayuda contextual
**Para** aprender a usar el sistema

**Prioridad:** 🔵 BAJA
**Estimación:** 4 horas

---

#### **US-F037: Crear onboarding para nuevos usuarios**
**Como** nuevo usuario
**Quiero** un tour guiado
**Para** conocer las funcionalidades

**Prioridad:** 🔵 BAJA
**Estimación:** 6 horas

---

### **Epic 5.2: Performance y Optimización**

#### **US-F038: Implementar virtual scrolling en tablas grandes**
**Como** sistema
**Quiero** renderizar solo elementos visibles
**Para** mejorar performance con datos grandes

**Prioridad:** 🟢 MEDIA
**Estimación:** 4 horas

---

#### **US-F039: Implementar caching con React Query**
**Como** sistema
**Quiero** cachear datos frecuentes
**Para** reducir llamadas al API

**Prioridad:** 🟢 MEDIA
**Estimación:** 3 horas

---

#### **US-F040: Optimizar imágenes con Next.js Image**
**Como** sistema
**Quiero** usar optimización de imágenes
**Para** mejorar tiempos de carga

**Prioridad:** 🟢 MEDIA
**Estimación:** 2 horas

---

### **Epic 5.3: Features Avanzadas**

#### **US-F041: Búsqueda global con keyboard shortcuts**
**Como** usuario
**Quiero** buscar desde cualquier lugar (Cmd/Ctrl + K)
**Para** navegar rápidamente

**Prioridad:** 🔵 BAJA
**Estimación:** 5 horas

---

#### **US-F042: Notificaciones en tiempo real**
**Como** usuario
**Quiero** recibir notificaciones de eventos importantes
**Para** estar al tanto de cambios

**Prioridad:** 🔵 BAJA
**Estimación:** 8 horas

---

#### **US-F043: Gestión de usuarios (Admin)**
**Como** administrador
**Quiero** gestionar usuarios del tenant
**Para** controlar accesos

**APIs:**
- `GET /api/v1/users`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

**Página:** `app/(dashboard)/users/page.tsx`

**Prioridad:** 🟢 MEDIA
**Estimación:** 6 horas

---

#### **US-F044: Configuración de perfil**
**Como** usuario
**Quiero** editar mi perfil
**Para** actualizar mi información

**Página:** `app/(dashboard)/settings/profile/page.tsx`

**Prioridad:** 🟢 MEDIA
**Estimación:** 4 horas

---

#### **US-F045: Cambiar contraseña**
**Como** usuario
**Quiero** cambiar mi contraseña
**Para** mantener mi cuenta segura

**Página:** `app/(dashboard)/settings/security/page.tsx`

**Prioridad:** 🟢 MEDIA
**Estimación:** 3 horas

---

#### **US-F046: Exportar datos a Excel**
**Como** usuario
**Quiero** exportar datos a Excel
**Para** trabajar con ellos offline

**Prioridad:** 🟢 MEDIA
**Estimación:** 4 horas

---

#### **US-F047: Imprimir etiquetas de productos (barcode)**
**Como** usuario
**Quiero** imprimir etiquetas con código de barras
**Para** etiquetar productos físicamente

**Prioridad:** 🔵 BAJA
**Estimación:** 6 horas

---

#### **US-F048: Escanear código de barras (móvil)**
**Como** usuario en móvil
**Quiero** escanear códigos de barras
**Para** buscar productos rápidamente

**Prioridad:** 🔵 BAJA
**Estimación:** 8 horas

---

---

## 📊 Estimación Total por Fase

### **Fase 1 - Fundación:**
- **User Stories:** 13
- **Estimación:** ~55 horas (~7 días)
- **Prioridad:** CRÍTICA

### **Fase 2 - Gestión de Productos:**
- **User Stories:** 6
- **Estimación:** ~32 horas (~4 días)
- **Prioridad:** CRÍTICA

### **Fase 3 - Gestión de Inventario:**
- **User Stories:** 8
- **Estimación:** ~42 horas (~5.5 días)
- **Prioridad:** ALTA

### **Fase 4 - Importación y Reportes:**
- **User Stories:** 6
- **Estimación:** ~36 horas (~4.5 días)
- **Prioridad:** ALTA

### **Fase 5 - Optimización:**
- **User Stories:** 15
- **Estimación:** ~78 horas (~10 días)
- **Prioridad:** MEDIA/BAJA

---

## 📈 Total General

- **Total User Stories:** 48
- **Estimación Total:** ~243 horas (~30 días de desarrollo)
- **Sprints Estimados:** 8-10 sprints de 2 semanas

---

## 🏷️ Leyenda de Prioridades

- 🔴 **CRÍTICA:** Bloquea funcionalidad core, debe hacerse primero
- 🟡 **ALTA:** Importante para MVP, debe hacerse pronto
- 🟢 **MEDIA:** Mejora la experiencia, puede esperar
- 🔵 **BAJA:** Nice to have, puede posponerse

---

## 📝 Notas de Implementación

### Stack Tecnológico Confirmado:
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query** (React Query)
- **React Hook Form + Zod**
- **TanStack Table**
- **Recharts**
- **Axios**
- **Lucide React** (iconos)
- **Radix UI** (componentes base)

### Decisiones de Arquitectura:
- **App Router** de Next.js para mejor SEO y performance
- **Server Components** donde sea posible
- **Client Components** para interactividad
- **Optimistic Updates** con React Query
- **Suspense** para loading states
- **Error Boundaries** para manejo de errores
- **TypeScript strict mode** para type safety

### Convenciones de Código:
- **Nombres de archivos:** kebab-case
- **Componentes:** PascalCase
- **Funciones:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **CSS:** Tailwind utility-first

---

## 🚀 Cómo Usar Este Backlog

1. **Priorizar:** Empezar por ítems 🔴 CRÍTICA
2. **Estimar:** Ajustar estimaciones según el equipo
3. **Asignar:** Distribuir US entre desarrolladores
4. **Trackear:** Mover items a "In Progress" y "Done"
5. **Revisar:** Hacer retrospectiva después de cada sprint

---

## 📅 Roadmap Sugerido

**Sprint 1-2:** US-F001 a US-F013 (Fundación)
**Sprint 3-4:** US-F014 a US-F019 (Productos)
**Sprint 5-6:** US-F020 a US-F027 (Inventario)
**Sprint 7-8:** US-F028 a US-F033 (Importación/Reportes)
**Sprint 9+:** US-F034 a US-F048 (Optimización)

---

**Última actualización:** 2025-10-24
**Versión:** 1.0
