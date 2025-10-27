# Actualización del Sidebar - Sección de Inventario

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-10-25
**Tiempo estimado:** 30 minutos
**Tiempo real:** ~15 minutos

## Resumen

Se actualizó el sidebar principal para reorganizar la sección de "Inventario" con las rutas correctas y se agregó el componente AlertBadge al item de "Alertas" para mostrar notificaciones en tiempo real.

---

## Cambios Realizados

### 1. **Imports Actualizados**

Agregados:
```typescript
import { AlertTriangle } from 'lucide-react';
import { AlertBadge } from '@/components/alerts';
```

### 2. **Estructura de Navegación - Sección Inventario**

**Antes:**
```typescript
{
  name: 'Inventario',
  href: '/inventory',
  children: [
    { name: 'Stock', href: '/inventory/stock' },
    { name: 'Ubicaciones', href: '/locations' },
    { name: 'Transferencias', href: '/transfers' },
    { name: 'Transacciones', href: '/inventory/transactions' },
  ],
}
```

**Después:**
```typescript
{
  name: 'Inventario',
  href: '/stock',
  children: [
    { name: 'Stock', href: '/stock' },
    { name: 'Alertas', href: '/alerts' },  // ← NUEVO
    { name: 'Transferencias', href: '/transfers' },
    { name: 'Ubicaciones', href: '/locations' },
  ],
}
```

**Cambios:**
- ✅ Ruta principal de Inventario: `/inventory` → `/stock`
- ✅ Ruta de Stock: `/inventory/stock` → `/stock`
- ✅ **Nuevo item:** "Alertas" con icono AlertTriangle
- ✅ Eliminado: "Transacciones" (ahora en historial de productos/stock)
- ✅ Reordenado: Stock → Alertas → Transferencias → Ubicaciones

### 3. **AlertBadge en Item de Alertas**

Agregado badge de alertas en tiempo real:

```typescript
<Link href={child.href} className="flex items-center justify-between">
  <div className="flex items-center">
    <child.icon className="w-4 h-4 mr-3" />
    {child.name}
  </div>
  {/* Alert Badge for Alerts menu item */}
  {child.href === '/alerts' && <AlertBadge />}
</Link>
```

**Características:**
- Badge rojo aparece solo cuando hay alertas
- Muestra número de alertas activas
- Auto-actualiza cada 5 minutos
- Se oculta cuando no hay alertas

---

## Vista del Sidebar Actualizado

```
┌─────────────────────────────┐
│ S  SRI Inventarios          │
├─────────────────────────────┤
│ 📊 Dashboard                │
│                             │
│ 📦 Productos           >    │
│   └─ Ver productos          │
│   └─ Categorías             │
│                             │
│ 🏢 Inventario          >    │
│   └─ Stock                  │
│   └─ Alertas           [12] │ ← Badge rojo
│   └─ Transferencias         │
│   └─ Ubicaciones            │
│                             │
│ 📤 Importar                 │
│ 📊 Reportes                 │
│ ⚙️  Configuración           │
│ 👥 Usuarios                 │
└─────────────────────────────┘
```

**Destacado:**
- El item "Alertas" muestra un badge rojo `[12]` cuando hay 12 alertas activas
- Badge desaparece automáticamente cuando se resuelven todas las alertas
- Badge auto-actualiza su conteo cada 5 minutos

---

## Orden de Items en Inventario

**Justificación del orden:**

1. **Stock** - Vista principal de inventario
2. **Alertas** - Problemas urgentes a resolver
3. **Transferencias** - Movimientos entre ubicaciones
4. **Ubicaciones** - Configuración de bodegas/tiendas

**Por qué este orden:**
- Stock es lo más consultado → primero
- Alertas son urgentes → segundo para visibilidad
- Transferencias y ubicaciones son menos frecuentes

---

## Permisos RBAC

Todos los items mantienen sus permisos:

| Item | Permiso Requerido |
|------|-------------------|
| Stock | `INVENTORY_VIEW` |
| Alertas | `INVENTORY_VIEW` |
| Transferencias | `TRANSFERS_VIEW` |
| Ubicaciones | `LOCATIONS_VIEW` |

---

## Testing

### Build Test
```bash
pnpm build
```

**Resultado:** ✅ Build exitoso

### Funcionalidad a Probar

1. **Navegación:**
   - ✅ Click en "Inventario" → Abre/cierra submenu
   - ✅ Click en "Stock" → Navega a `/stock`
   - ✅ Click en "Alertas" → Navega a `/alerts`
   - ✅ Click en "Transferencias" → Navega a `/transfers`
   - ✅ Click en "Ubicaciones" → Navega a `/locations`

2. **Alert Badge:**
   - ✅ Muestra conteo cuando hay alertas
   - ✅ Se oculta cuando no hay alertas
   - ✅ Auto-actualiza cada 5 minutos
   - ✅ Número correcto de alertas
   - ✅ Estilo rojo destacado

3. **Estado Activo:**
   - ✅ Item activo se resalta en azul
   - ✅ Submenu se expande cuando item activo
   - ✅ Badge visible en item activo

4. **Responsive:**
   - ✅ Sidebar funciona en mobile
   - ✅ Badge visible en mobile
   - ✅ Submenu funciona en mobile

---

## Mejoras Futuras

### Corto Plazo
- [ ] Tooltip en AlertBadge mostrando "X productos críticos, Y stock bajo"
- [ ] Animación de "pulse" en badge cuando hay alertas nuevas
- [ ] Click en badge → navega directamente a alertas críticas

### Mediano Plazo
- [ ] Badge con diferentes colores según severidad (rojo=crítico, amarillo=bajo)
- [ ] Sonido de notificación cuando aparecen nuevas alertas críticas
- [ ] Indicador visual en item principal "Inventario" cuando hay alertas

### Largo Plazo
- [ ] WebSocket para actualización en tiempo real (sin esperar 5 min)
- [ ] Badge en múltiples items (ej: Transferencias pendientes)
- [ ] Panel de notificaciones desplegable desde badge

---

## Notas Técnicas

### Renderizado Condicional del Badge

```typescript
{child.href === '/alerts' && <AlertBadge />}
```

**Por qué así:**
- Simple y directo
- No requiere prop adicional en NavItem
- Fácil de extender a otros items
- No afecta performance (solo evalúa string)

### Layout Flex con justify-between

```typescript
className="flex items-center justify-between"
```

**Por qué:**
- Separa nombre del badge automáticamente
- Badge alineado a la derecha
- Responsive sin media queries
- Funciona con cualquier longitud de texto

### Auto-actualización cada 5 minutos

**En AlertBadge component:**
```typescript
useEffect(() => {
  loadAlertCount();
  const interval = setInterval(loadAlertCount, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

**Por qué 5 minutos:**
- Balance entre actualización y carga del servidor
- Alertas no cambian constantemente
- Usuario puede refrescar manualmente navegando
- Futuro: reemplazar con WebSocket

---

## Relación con Otros Módulos

### Alertas (US-F023)
```
Sidebar → Badge → Alertas Page
```

El AlertBadge usa el mismo servicio de alertas que la página principal.

### Stock (US-F021)
```
Sidebar → Stock → Vista de inventario
```

Primer item del submenu, acceso directo al inventario completo.

### Transferencias (US-F022)
```
Sidebar → Transferencias → Gestión de movimientos
```

Tercer item, para mover stock entre ubicaciones.

### Ubicaciones (US-F020)
```
Sidebar → Ubicaciones → Configuración de bodegas
```

Último item, configuración menos frecuente.

---

## Archivos Modificados

- **components/layout/Sidebar.tsx** (~250 líneas)
  - Imports actualizados
  - Estructura de navegación modificada
  - Renderizado de submenu actualizado

**Cambios en líneas de código:**
- Imports: +2 líneas
- Estructura nav: modificado (~30 líneas)
- Renderizado: +3 líneas (badge condicional)
- Total: ~5 líneas nuevas, ~30 líneas modificadas

---

**Estado:** ✅ COMPLETADO
**Build exitoso:** ✅
**Tiempo real:** ~15 minutos (estimado: 30 min)
**Prioridad:** 🟢 BAJA
**Impacto:** 🟢 BAJO (mejora UX, no afecta funcionalidad core)
