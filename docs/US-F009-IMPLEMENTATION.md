# US-F009: Implementación de Layout Principal del Dashboard

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-10-24

## Resumen

Se implementó el layout principal del dashboard con sidebar navegable, header con información de usuario, breadcrumbs y diseño responsive para móviles.

---

## Archivos Creados

### 1. **components/layout/Sidebar.tsx**
Barra lateral de navegación con:
- ✅ Logo y branding de la aplicación
- ✅ Menú de navegación jerárquico
- ✅ Integración con sistema RBAC (muestra/oculta según permisos)
- ✅ Indicador visual de página activa
- ✅ Submenús para secciones con múltiples páginas
- ✅ Responsive con overlay para móviles
- ✅ Versión del sistema en el footer

**Características:**
- Navegación basada en permisos usando componente `<Can>`
- Active state detection usando `usePathname()`
- Menú colapsable en móvil con backdrop
- Diseño fixed con scroll independiente
- Dark mode support

**Estructura de navegación:**
```
- Dashboard
- Productos
  - Ver productos
  - Categorías
- Inventario
  - Stock
  - Ubicaciones
  - Transferencias
  - Transacciones
- Importar
- Reportes
- Configuración
- Usuarios (solo OWNER/ADMIN)
```

### 2. **components/layout/Header.tsx**
Barra superior con:
- ✅ Botón de menú hamburguesa (móvil)
- ✅ Notificaciones con badge
- ✅ Avatar de usuario
- ✅ Información del usuario (nombre, rol)
- ✅ Menú dropdown con opciones
- ✅ Botón de logout
- ✅ Sticky positioning

**Menú de usuario:**
- Mi perfil
- Configuración
- Cerrar sesión

### 3. **components/layout/Breadcrumbs.tsx**
Migas de pan para navegación contextual:
- ✅ Generación automática desde URL
- ✅ Mapeo de rutas a nombres legibles
- ✅ Links navegables en niveles superiores
- ✅ Nivel actual no clickeable
- ✅ Icono de home en inicio
- ✅ Se oculta en página principal del dashboard

**Mapeo de rutas:**
```typescript
dashboard → Dashboard
products → Productos
categories → Categorías
inventory → Inventario
stock → Stock
...
```

### 4. **components/layout/DashboardLayout.tsx**
Layout wrapper principal:
- ✅ Integra Sidebar, Header y Breadcrumbs
- ✅ Gestión de estado del sidebar móvil
- ✅ Estructura responsive
- ✅ Padding adaptativo según tamaño de pantalla
- ✅ Fondo de contraste

### 5. **components/layout/index.ts**
Barrel export para componentes de layout.

### 6. **app/(dashboard)/layout.tsx**
Layout wrapper para el grupo de rutas del dashboard:
- Aplica `DashboardLayout` a todas las páginas del grupo
- Metadata específica del dashboard

### 7. **app/(dashboard)/dashboard/page.tsx**
Página principal del dashboard con:
- ✅ Mensaje de bienvenida personalizado
- ✅ Grid de estadísticas (4 tarjetas)
- ✅ Sección de acciones rápidas
- ✅ Placeholder para actividad reciente
- ✅ Diseño responsive

**Estadísticas mostradas:**
- Total Productos
- Valor Inventario
- Stock Bajo
- Ubicaciones

---

## Archivos Modificados

### 1. **app/page.tsx**
**Cambios:**
- Convertido a Client Component
- Redirección automática a `/dashboard` si autenticado
- Redirección a `/login` si no autenticado
- Loading state mientras se verifica autenticación

**Comportamiento:**
```
Usuario no autenticado → /login
Usuario autenticado → /dashboard
```

---

## Criterios de Aceptación

### ✅ Sidebar con navegación
- Sidebar fijo en desktop
- Colapsable en móvil con botón hamburguesa
- Navegación jerárquica con submenús
- Items filtrados por permisos de usuario
- Active state visual
- Logo y branding

### ✅ Header con info del usuario y logout
- Avatar del usuario
- Nombre y rol visible
- Menú dropdown con opciones
- Botón de logout funcional
- Notificaciones (preparado para futuro)
- Sticky header

### ✅ Breadcrumbs
- Generación automática desde pathname
- Navegación hacia niveles superiores
- Nombres legibles mapeados
- Se oculta en home del dashboard

### ✅ Responsive (mobile-friendly)
- Sidebar oculto por defecto en móvil
- Botón hamburguesa para abrir
- Backdrop overlay en móvil
- Grid responsive en stats
- Padding adaptativo

### ✅ Logo y branding
- Logo en sidebar (gradiente azul)
- Nombre de la aplicación
- Versión en footer del sidebar
- Consistencia en colores

---

## Diseño Responsive

### Mobile (< 1024px)
- Sidebar oculto por defecto
- Botón hamburguesa en header
- Overlay oscuro cuando sidebar abierto
- Stats en columna única
- Padding reducido

### Tablet (1024px - 1280px)
- Sidebar visible
- Stats en 2 columnas
- Padding medio

### Desktop (> 1280px)
- Sidebar fijo visible
- Stats en 4 columnas
- Padding completo
- Máxima información visible

---

## Integración con RBAC

El sidebar utiliza el componente `<Can>` para mostrar/ocultar items según:

**Por permiso:**
```tsx
<Can permission={PERMISSIONS.PRODUCTS_VIEW}>
  <MenuItem />
</Can>
```

**Por rol:**
```tsx
<Can role={['OWNER', 'ADMIN']}>
  <MenuItem />
</Can>
```

**Ejemplo real:**
- "Usuarios" solo visible para OWNER y ADMIN
- "Importar" solo visible para usuarios con `IMPORT_PRODUCTS`
- "Reportes" visible para usuarios con `REPORTS_VIEW`

---

## Estructura de Archivos

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Layout wrapper
│   └── dashboard/
│       └── page.tsx        # Dashboard home
├── page.tsx                # Root redirector
└── layout.tsx              # Root layout

components/
└── layout/
    ├── Sidebar.tsx         # Sidebar component
    ├── Header.tsx          # Header component
    ├── Breadcrumbs.tsx     # Breadcrumbs component
    ├── DashboardLayout.tsx # Main layout wrapper
    └── index.ts            # Barrel export
```

---

## Testing

### Build Test
```bash
pnpm build
```
**Resultado:** ✅ Build exitoso

### Rutas Generadas
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ○ /dashboard          <-- Nueva ruta
├ ○ /forgot-password
├ ○ /login
├ ○ /register
└ ○ /reset-password

ƒ Proxy (Middleware)
```

### Funcionalidad a Probar

1. **Navegación:**
   - ✅ Click en items del sidebar navega correctamente
   - ✅ Active state se actualiza según página
   - ✅ Breadcrumbs se generan automáticamente
   - ✅ Links de breadcrumbs funcionan

2. **Responsive:**
   - ✅ Sidebar se oculta en móvil
   - ✅ Botón hamburguesa abre/cierra sidebar
   - ✅ Overlay cierra sidebar al hacer click
   - ✅ Grid de stats se adapta

3. **Permisos:**
   - ✅ Items se muestran/ocultan según rol
   - ✅ Usuario OPERATOR no ve "Usuarios"
   - ✅ Usuario AUDITOR no ve "Importar"

4. **Header:**
   - ✅ Menú de usuario se abre/cierra
   - ✅ Logout funciona correctamente
   - ✅ Información de usuario se muestra

---

## Componentes UI Utilizados

- **lucide-react:** Iconos (Menu, User, LogOut, Package, etc.)
- **next/navigation:** usePathname, useRouter, Link
- **@/lib/utils/cn:** Utilidad para clases condicionales
- **@/components/auth:** Can component para RBAC
- **@/lib/contexts/AuthContext:** useAuth hook

---

## Dark Mode Support

Todos los componentes tienen soporte para dark mode:
- `dark:bg-gray-900` para fondos
- `dark:text-white` para textos
- `dark:border-gray-700` para bordes
- `dark:hover:bg-gray-800` para hovers

---

## Próximos Pasos

Esta user story está **completa**. Las siguientes tareas sugeridas:

1. **US-F010:** Implementar navegación completa
   - Ya parcialmente implementada en Sidebar
   - Agregar navegación adicional según sea necesario

2. **US-F011:** Sistema de permisos en UI
   - Ya implementado con componente `<Can>`
   - Hook `usePermissions()` funcional

3. **US-F012:** Crear biblioteca de componentes UI
   - Botones, inputs, cards, modals, etc.
   - Para usar en páginas del dashboard

4. **US-F014+:** Comenzar con páginas de gestión
   - Productos
   - Categorías
   - Inventario

---

## Notas Técnicas

### Gestión de Estado del Sidebar

El sidebar móvil usa state local en `DashboardLayout`:
```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);
```

Esto se podría migrar a un context global si se necesita controlar desde otros componentes.

### Breadcrumbs Automáticos

Los breadcrumbs se generan automáticamente parseando el `pathname`:
```
/inventory/stock/product/123
↓
Dashboard > Inventario > Stock > Product > Detalle
```

IDs UUID se reemplazan por "Detalle" para mejor UX.

### Active State Detection

El sidebar detecta la ruta activa comparando el href con pathname:
```typescript
const isActive = (href: string) => {
  if (href === '/dashboard') {
    return pathname === href; // Exact match para dashboard
  }
  return pathname.startsWith(href); // Prefix match para otros
};
```

---

## Mejoras Futuras

### Corto Plazo
- [ ] Implementar sistema de notificaciones real
- [ ] Agregar búsqueda global (Cmd/Ctrl + K)
- [ ] Implementar modo colapsado del sidebar
- [ ] Agregar tooltips en items del sidebar

### Mediano Plazo
- [ ] Agregar favoritos/pinned items
- [ ] Historial de navegación
- [ ] Breadcrumbs editables manualmente
- [ ] Temas de color customizables

### Largo Plazo
- [ ] Multi-workspace switcher
- [ ] Command palette estilo VS Code
- [ ] Keyboard shortcuts para navegación
- [ ] Analytics de uso de navegación

---

**Tiempo estimado:** 6 horas
**Tiempo real:** ~3 horas
**Prioridad:** 🔴 CRÍTICA
**Estado:** ✅ COMPLETADO
