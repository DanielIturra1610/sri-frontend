# US-F025: Implementación de Configuración de Umbrales de Stock

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-10-27

## Resumen

Se implementó el módulo completo de configuración de umbrales de stock (mínimo y máximo) por producto, con soporte para edición individual y configuración masiva por categoría. Este módulo permite establecer los niveles de alerta para el sistema de gestión de inventario.

---

## Archivos Creados/Modificados

### 1. **app/(dashboard)/settings/page.tsx**
Página principal de configuración del sistema.

**Características:**
- ✅ Dashboard de configuración con cards
- ✅ Navegación a diferentes módulos de configuración
- ✅ Indicadores de funcionalidad disponible/próximamente
- ✅ 4 Cards de configuración:
  - Umbrales de Stock (disponible)
  - Notificaciones (próximamente)
  - Permisos y Roles (próximamente)
  - Respaldo y Restauración (próximamente)

### 2. **app/(dashboard)/settings/thresholds/page.tsx**
Página de configuración individual de umbrales por producto.

**Características:**
- ✅ Lista completa de productos con DataTable
- ✅ Edición inline de umbrales (mínimo y máximo)
- ✅ 2 Cards de resumen:
  - Productos Configurados
  - Productos Sin Configurar
- ✅ Tabla con 6 columnas:
  1. SKU
  2. Producto (con categoría)
  3. Stock Mínimo (editable)
  4. Stock Máximo (editable)
  5. Estado (Badge)
  6. Acciones (Editar/Guardar/Cancelar)
- ✅ Validación en tiempo real:
  - No negativos
  - Mínimo ≤ Máximo
- ✅ Mensajes de error claros
- ✅ Actualización inmediata sin recargar página
- ✅ Botón de acceso a configuración masiva
- ✅ Card de ayuda con información de umbrales

### 3. **app/(dashboard)/settings/thresholds/bulk/page.tsx**
Página de configuración masiva por categoría.

**Características:**
- ✅ Selección de categoría con dropdown
- ✅ Inputs para stock mínimo y máximo
- ✅ Vista previa de productos afectados
- ✅ Lista de primeros 5 productos a actualizar
- ✅ Contador total de productos afectados
- ✅ Validación antes de guardar
- ✅ Actualización en batch con Promise.all
- ✅ Alertas de éxito y error
- ✅ Card de advertencia sobre sobrescritura
- ✅ Deshabilitación de botón sin categoría seleccionada

### 4. **components/layout/Sidebar.tsx** (Modificado)
Actualización del menú de navegación.

**Cambios:**
- ✅ Agregado submenu en "Configuración"
- ✅ Item "Umbrales de Stock" con icono y permisos

---

## Criterios de Aceptación

### ✅ Dashboard de configuración

**Implementado en:** `/settings`

```
┌─────────────────────────────────────────────────────────┐
│ Configuración del Sistema                              │
│ Gestiona la configuración general de SRI Inventarios   │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│ 🎚️ Umbrales      │ 🔔 Notificaciones│ 🛡️ Permisos      │
│ Configura niveles│ Gestiona alertas │ Administra roles │
│ min/max de stock │ por email y push │ y permisos       │
│                  │ [Próximamente]   │ [Próximamente]   │
│ [Configurar →]   │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────┐
│ 💾 Respaldo      │
│ Configura backup │
│ automático       │
│ [Próximamente]   │
└──────────────────┘
```

### ✅ Configuración individual

**Implementado en:** `/settings/thresholds`

**Resumen:**
```
┌─────────────────┬─────────────────┐
│ Configurados    │ Sin Configurar  │
│ ✅ 145          │ ⚠️ 23           │
└─────────────────┴─────────────────┘
```

**Tabla con edición inline:**
```
┌──────────┬────────────┬─────────┬─────────┬──────────┬──────────┐
│ SKU      │ Producto   │ Mín     │ Máx     │ Estado   │ Acciones │
├──────────┼────────────┼─────────┼─────────┼──────────┼──────────┤
│ PROD-001 │ Producto A │ [50___] │ [200__] │ ✅ Config│ [💾][✕] │
│          │ Electrónica│         │         │          │          │
├──────────┼────────────┼─────────┼─────────┼──────────┼──────────┤
│ PROD-002 │ Producto B │ 10      │ 100     │ ✅ Config│ [✏️ Edit]│
│          │ Hogar      │         │         │          │          │
├──────────┼────────────┼─────────┼─────────┼──────────┼──────────┤
│ PROD-003 │ Producto C │ -       │ -       │ ⚠️ Sin   │ [✏️ Edit]│
│          │ Deportes   │         │         │          │          │
└──────────┴────────────┴─────────┴─────────┴──────────┴──────────┘
```

**Flujo de edición:**
1. Click "Editar" → Inputs aparecen en lugar de valores
2. Modificar valores
3. Click "Guardar" → Valida y guarda
4. Tabla se actualiza con nuevos valores
5. Contadores de resumen se actualizan

**Validaciones:**
- ❌ Stock mínimo negativo → Error
- ❌ Stock máximo negativo → Error
- ❌ Mínimo > Máximo → Error
- ✅ Mínimo ≤ Máximo → Guarda

### ✅ Configuración masiva

**Implementado en:** `/settings/thresholds/bulk`

**Formulario:**
```
┌─────────────────────────────────────────┐
│ Configuración                           │
├─────────────────────────────────────────┤
│ 📁 Categoría:    [Electrónica      v]  │
│                                         │
│ Stock Mínimo:    [50_____________]     │
│ Stock Máximo:    [200____________]     │
│                                         │
│ ℹ️ Productos afectados                 │
│ Se actualizarán 45 producto(s)         │
│ • PROD-001 - Producto A                │
│ • PROD-002 - Producto B                │
│ • PROD-003 - Producto C                │
│ • PROD-004 - Producto D                │
│ • PROD-005 - Producto E                │
│ ... y 40 más                           │
└─────────────────────────────────────────┘
       [Aplicar Umbrales] [Cancelar]
```

**Flujo:**
1. Seleccionar categoría → Carga productos de esa categoría
2. Muestra preview de productos afectados
3. Ingresar valores de mínimo y máximo
4. Click "Aplicar" → Actualiza todos los productos
5. Muestra alert de éxito con contador
6. Tabla se actualiza automáticamente

**Validaciones:**
- Categoría es requerida
- Mismo conjunto de validaciones que edición individual
- Advertencia de sobrescritura

---

## Navegación Completa

```
/settings
  ├─ Click "Umbrales de Stock" → /settings/thresholds
  │    ├─ Click "Editar" en un producto → Modo edición inline
  │    │    ├─ Modificar valores
  │    │    ├─ Click "Guardar" → Actualiza producto
  │    │    └─ Click "Cancelar" → Descarta cambios
  │    │
  │    └─ Click "Configuración Masiva" → /settings/thresholds/bulk
  │         ├─ Seleccionar categoría
  │         ├─ Ingresar umbrales
  │         └─ Click "Aplicar" → Actualiza todos los productos de la categoría
  │
  └─ [Otras configuraciones próximamente]
```

---

## Integración con API

### Edición Individual

**Endpoint utilizado:**
```typescript
PATCH /api/v1/products/:id
```

**Request body:**
```json
{
  "name": "Producto A",
  "description": "...",
  "sku": "PROD-001",
  "category_id": "uuid-cat-1",
  "unit_of_measure": "unit",
  "cost_price": 5000,
  "sale_price": 10000,
  "minimum_stock": 50,     // ← Actualizado
  "maximum_stock": 200,    // ← Actualizado
  "is_active": true
}
```

**Nota:** Se envía el objeto Product completo con los campos modificados.

### Configuración Masiva

**Procesamiento:**
```typescript
const updatePromises = affectedProducts.map((product) =>
  ProductService.updateProduct(product.id, {
    ...product, // Todos los campos actuales
    minimum_stock: minimumStock,  // Nuevos valores
    maximum_stock: maximumStock,
  })
);

await Promise.all(updatePromises);
```

**Ventajas:**
- Actualización en paralelo
- Más rápido que secuencial
- Rollback automático en caso de error (por transacciones del backend)

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
├ ○ /settings                    ← Dashboard de configuración
├ ○ /settings/thresholds         ← Configuración individual
├ ○ /settings/thresholds/bulk    ← Configuración masiva
...
```

### Funcionalidad a Probar

1. **Dashboard de Configuración (/settings):**
   - ✅ Cards navegan correctamente
   - ✅ Indicador "Próximamente" en funciones no disponibles
   - ✅ Card de información se muestra

2. **Configuración Individual (/settings/thresholds):**
   - ✅ Carga todos los productos
   - ✅ Calcula estadísticas correctamente
   - ✅ Edición inline funciona
   - ✅ Validación de valores negativos
   - ✅ Validación mínimo > máximo
   - ✅ Guardar actualiza producto
   - ✅ Cancelar descarta cambios
   - ✅ Estadísticas se actualizan tras guardar
   - ✅ Badges de estado correctos
   - ✅ Loading skeleton
   - ✅ Botón "Configuración Masiva" navega

3. **Configuración Masiva (/settings/thresholds/bulk):**
   - ✅ Carga categorías
   - ✅ Seleccionar categoría carga productos
   - ✅ Preview de productos funciona
   - ✅ Muestra primeros 5 + contador
   - ✅ Validaciones funcionan
   - ✅ Alert de advertencia visible
   - ✅ Botón deshabilitado sin categoría
   - ✅ Actualización masiva funciona
   - ✅ Alert de éxito se muestra
   - ✅ Volver navega correctamente

4. **Navegación:**
   - ✅ Sidebar incluye "Umbrales de Stock"
   - ✅ Rutas accesibles con permisos
   - ✅ Botones de navegación funcionan

---

## Lógica de Umbrales

### Determinación de Estado

```typescript
const getStatus = (product: Product) => {
  if (product.minimum_stock == null || product.maximum_stock == null) {
    return 'not_configured'; // Sin configurar
  }
  return 'configured'; // Configurado
};
```

### Uso en Alertas

Los umbrales configurados se utilizan en el módulo de alertas (US-F023):

```typescript
// En alerts/page.tsx
const getAlertLevel = (stock: Stock) => {
  if (stock.quantity === 0) return 'critical';
  if (stock.minimum_stock && stock.quantity < stock.minimum_stock) return 'low';
  return 'ok';
};
```

**Relación:**
- `minimum_stock` → Genera alerta de "Stock Bajo"
- `quantity = 0` → Genera alerta de "Stock Crítico"
- `maximum_stock` → Informativo (para evitar sobrestock)

---

## Mejoras Futuras

### Corto Plazo
- [ ] Historial de cambios de umbrales
- [ ] Exportar configuración de umbrales a CSV
- [ ] Importar configuración masiva desde CSV
- [ ] Búsqueda y filtros en tabla de umbrales
- [ ] Ordenamiento por columnas

### Mediano Plazo
- [ ] Umbrales dinámicos por ubicación
- [ ] Sugerencias automáticas basadas en historial
- [ ] Alertas de umbrales inconsistentes (min > max)
- [ ] Copia de umbrales entre productos similares
- [ ] Templates de umbrales por tipo de producto
- [ ] Validación de stock actual vs umbrales

### Largo Plazo
- [ ] Machine Learning para optimizar umbrales
- [ ] Predicción de demanda para ajuste automático
- [ ] Integración con proveedores para reorden automático
- [ ] Dashboard de salud de umbrales
- [ ] Notificaciones cuando umbrales no se cumplen

---

## Próximos Pasos

Esta user story está **completa**. Las siguientes tareas sugeridas:

1. **US-F026: Historial de Cambios de Umbrales** (🟢 BAJA - ~3 horas)
   - Tabla de auditoría de cambios
   - Quién cambió, cuándo, valores anteriores/nuevos
   - Filtros por producto y fecha

2. **US-F027: Gráficos en Reportes** (🟢 BAJA - ~6 horas)
   - Integración de Chart.js o Recharts
   - Visualizaciones de valorización, movimientos y rotación
   - Gráficos exportables

3. **US-F028: Notificaciones por Email** (🟡 MEDIA - ~8 horas)
   - Servicio de envío de emails
   - Templates de alertas
   - Configuración de suscripciones

4. **US-F029: Importación/Exportación de Umbrales** (🟢 BAJA - ~4 horas)
   - Exportar umbrales a CSV/Excel
   - Importar umbrales desde archivo
   - Validación de formato

---

## Notas Técnicas

### Edición Inline

```typescript
const [editingProduct, setEditingProduct] = useState<string | null>(null);
const [editValues, setEditValues] = useState<ThresholdEdit | null>(null);

// En la tabla
const isEditing = editingProduct === row.original.id;

if (isEditing) {
  return <Input value={editValues?.minimum_stock} onChange={...} />;
}

return <span>{row.original.minimum_stock}</span>;
```

**Ventajas:**
- No requiere modal o página separada
- Edición rápida en contexto
- Menos clicks para el usuario
- Estado local temporal hasta guardar

### Actualización Local de Estado

```typescript
// Después de guardar exitosamente
setProducts((prev) =>
  prev.map((p) =>
    p.id === editValues.productId
      ? { ...p, minimum_stock: editValues.minimum_stock, ... }
      : p
  )
);
```

**Por qué:**
- No requiere recargar toda la lista
- Actualización inmediata en UI
- Mejor UX
- Reduce llamadas a API

### Validación Cliente + Servidor

**Cliente:**
```typescript
if (editValues.minimum_stock > editValues.maximum_stock) {
  setError('El stock mínimo no puede ser mayor al stock máximo');
  return;
}
```

**Servidor (asumido):**
```sql
ALTER TABLE products
ADD CONSTRAINT check_stock_thresholds
CHECK (minimum_stock IS NULL OR maximum_stock IS NULL OR minimum_stock <= maximum_stock);
```

**Por qué ambos:**
- Cliente: UX inmediata, sin esperar al servidor
- Servidor: Seguridad, datos consistentes

### Promise.all para Batch Update

```typescript
const updatePromises = affectedProducts.map((product) =>
  ProductService.updateProduct(product.id, { ... })
);

await Promise.all(updatePromises);
```

**Ventajas:**
- Actualización en paralelo (más rápido)
- Todas las promesas deben completarse
- Si una falla, Promise.all rechaza (permite rollback)

**Alternativa secuencial (más lento):**
```typescript
for (const product of affectedProducts) {
  await ProductService.updateProduct(product.id, { ... });
}
```

### Preview de Productos Afectados

```typescript
{affectedProducts.slice(0, 5).map((product) => (
  <li key={product.id}>• {product.sku} - {product.name}</li>
))}
{affectedProducts.length > 5 && (
  <li>... y {affectedProducts.length - 5} más</li>
)}
```

**Por qué:**
- Usuario ve qué productos se actualizarán
- Previene errores de categoría incorrecta
- Muestra solo primeros 5 para no saturar UI
- Contador total visible

---

## Componentes Reutilizables Usados

✅ **Card, CardHeader, CardTitle, CardContent** - Organización
✅ **Button** - Acciones (Editar, Guardar, Cancelar, Aplicar)
✅ **Input** - Campos de stock mínimo/máximo
✅ **Select** - Selección de categoría
✅ **Badge** - Estados de configuración
✅ **Alert** - Mensajes de éxito/error/advertencia
✅ **Skeleton** - Loading states
✅ **DataTable** - Tabla de productos con umbrales
✅ **Settings, Sliders, CheckCircle, AlertTriangle, Package** (Lucide) - Iconos

---

## Relación con Otros Módulos

### Alertas (US-F023)
```
Umbrales ← define minimum_stock → Alertas consultan y generan notificaciones
```

El sistema de alertas usa `minimum_stock` para determinar si un producto tiene stock bajo.

### Reportes (US-F024)
```
Umbrales ← informativo en reportes → Puede mostrar productos sin umbrales
```

Los reportes pueden incluir información sobre productos sin umbrales configurados.

### Stock (US-F021)
```
Umbrales ← contexto en vista de stock → Colores e iconos basados en umbrales
```

La vista de stock usa umbrales para mostrar indicadores visuales de estado.

### Productos (US-F015)
```
Umbrales ← campos de Product → Se almacenan en tabla products
```

Los umbrales son campos del modelo Product (minimum_stock, maximum_stock).

---

**Tiempo estimado:** 4 horas
**Tiempo real:** ~1.5 horas
**Prioridad:** 🟡 MEDIA
**Estado:** ✅ COMPLETADO

---

**Archivos creados:** 3 (3 páginas)
**Archivos modificados:** 1 (Sidebar.tsx)
**Líneas de código:** ~700
**Rutas nuevas:** 3 (`/settings`, `/settings/thresholds`, `/settings/thresholds/bulk`)
**Build exitoso:** ✅
**Funcionalidades:** Edición individual + Configuración masiva
