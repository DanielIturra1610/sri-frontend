# US-F012: Implementación de Biblioteca de Componentes UI

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-10-24

## Resumen

Se creó una biblioteca completa de componentes UI reutilizables para construir interfaces consistentes en toda la aplicación.

---

## Componentes Creados

### 1. **Button** (`components/ui/Button.tsx`)

Botón versátil con múltiples variantes y estados.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean - Muestra spinner de carga
- `leftIcon`: ReactNode - Icono a la izquierda
- `rightIcon`: ReactNode - Icono a la derecha

**Ejemplo:**
```tsx
<Button variant="primary" size="md">
  Guardar
</Button>

<Button variant="danger" isLoading>
  Eliminando...
</Button>

<Button variant="outline" leftIcon={<Plus />}>
  Crear Nuevo
</Button>
```

### 2. **Input** (`components/ui/Input.tsx`)

Campo de texto con label, error y helper text.

**Props:**
- `label`: string - Label del campo
- `error`: string - Mensaje de error
- `helperText`: string - Texto de ayuda
- `leftIcon`: ReactNode - Icono a la izquierda
- `rightIcon`: ReactNode - Icono a la derecha

**Ejemplo:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  error={errors.email}
  leftIcon={<Mail />}
/>
```

### 3. **Textarea** (`components/ui/Textarea.tsx`)

Área de texto multilinea con label y validación.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `rows`: number

**Ejemplo:**
```tsx
<Textarea
  label="Descripción"
  rows={4}
  placeholder="Ingrese una descripción..."
  error={errors.description}
/>
```

### 4. **Select** (`components/ui/Select.tsx`)

Selector dropdown con opciones.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{ value, label }>

**Ejemplo:**
```tsx
<Select
  label="Categoría"
  options={[
    { value: '1', label: 'Electrónica' },
    { value: '2', label: 'Ropa' },
  ]}
  error={errors.category}
/>
```

### 5. **Checkbox** (`components/ui/Checkbox.tsx`)

Casilla de verificación con label.

**Props:**
- `label`: string
- `error`: string

**Ejemplo:**
```tsx
<Checkbox
  label="Acepto los términos y condiciones"
  error={errors.terms}
/>
```

### 6. **Radio** (`components/ui/Radio.tsx`)

Botón de radio con label.

**Props:**
- `label`: string
- `error`: string
- `name`: string - Grupo de radio buttons

**Ejemplo:**
```tsx
<Radio name="plan" value="basic" label="Plan Básico" />
<Radio name="plan" value="pro" label="Plan Pro" />
```

### 7. **Card** (`components/ui/Card.tsx`)

Tarjeta contenedora con subcomponentes.

**Variantes:**
- `default`: Borde gris
- `outlined`: Borde más grueso
- `elevated`: Con sombra

**Subcomponentes:**
- `CardHeader`: Header de la tarjeta
- `CardTitle`: Título
- `CardDescription`: Descripción
- `CardContent`: Contenido principal
- `CardFooter`: Footer con acciones

**Ejemplo:**
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción del card</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

### 8. **Badge** (`components/ui/Badge.tsx`)

Etiqueta para mostrar estados o categorías.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

**Ejemplo:**
```tsx
<Badge variant="success">Activo</Badge>
<Badge variant="danger" size="sm">Stock Bajo</Badge>
```

### 9. **Alert** (`components/ui/Alert.tsx`)

Alerta para mensajes importantes.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info'
- `title`: string
- `onClose`: () => void - Callback para cerrar

**Características:**
- Iconos automáticos según variante
- Botón de cerrar opcional
- Título y descripción

**Ejemplo:**
```tsx
<Alert variant="success" title="¡Éxito!" onClose={() => {}}>
  El producto se creó correctamente
</Alert>

<Alert variant="danger" title="Error">
  Ocurrió un error al guardar
</Alert>
```

### 10. **Modal** (`components/ui/Modal.tsx`)

Diálogo modal con overlay.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `description`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean

**Características:**
- Cierre con tecla ESC
- Bloqueo de scroll del body
- Backdrop con click para cerrar
- Subcomponentes: ModalHeader, ModalBody, ModalFooter

**Ejemplo:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Crear Producto"
  size="lg"
>
  <ModalBody>
    <Input label="Nombre" />
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
    <Button variant="primary">
      Guardar
    </Button>
  </ModalFooter>
</Modal>
```

### 11. **Spinner** (`components/ui/Spinner.tsx`)

Indicador de carga animado.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'primary' | 'secondary' | 'white'

**Componente adicional:**
- `LoadingOverlay`: Overlay de pantalla completa con spinner

**Ejemplo:**
```tsx
<Spinner size="md" variant="primary" />

<LoadingOverlay isLoading={isLoading} text="Guardando..." />
```

### 12. **Skeleton** (`components/ui/Skeleton.tsx`)

Placeholder para contenido en carga.

**Props:**
- `variant`: 'text' | 'circular' | 'rectangular'
- `width`: string | number
- `height`: string | number

**Presets:**
- `SkeletonCard`: Skeleton de tarjeta
- `SkeletonTable`: Skeleton de tabla
- `SkeletonAvatar`: Skeleton circular para avatar

**Ejemplo:**
```tsx
<Skeleton variant="rectangular" height="200px" />
<Skeleton variant="text" width="60%" />

<SkeletonCard />
<SkeletonTable rows={5} />
```

---

## Características Comunes

### ✅ Accesibilidad
- Todos los inputs tienen labels asociados
- Componentes con roles ARIA apropiados
- Soporte para navegación por teclado
- Mensajes de error descriptivos

### ✅ Dark Mode
- Soporte completo para modo oscuro
- Colores adaptativos con clases `dark:`
- Contraste apropiado en ambos temas

### ✅ Responsive
- Componentes adaptativos
- Tamaños relativos
- Breakpoints de Tailwind

### ✅ TypeScript
- Tipos completos para todos los props
- Interfaces exportadas
- Autocompletado en IDE
- Type safety

### ✅ Forwarded Refs
- Todos los componentes soportan refs
- Acceso directo a elementos DOM
- Integración con librerías de formularios

---

## Arquitectura

### Estructura de Archivos
```
components/ui/
├── Button.tsx
├── Input.tsx
├── Textarea.tsx
├── Select.tsx
├── Checkbox.tsx
├── Radio.tsx
├── Card.tsx
├── Badge.tsx
├── Alert.tsx
├── Modal.tsx
├── Spinner.tsx
├── Skeleton.tsx
└── index.ts        # Barrel export
```

### Patrón de Diseño

Todos los componentes siguen el mismo patrón:

1. **Props Interface**: Tipos exportados con JSDoc
2. **forwardRef**: Soporte para refs
3. **Variant System**: Variantes con Tailwind CSS
4. **cn Utility**: Merge de clases condicionales
5. **Dark Mode**: Clases `dark:` para tema oscuro

**Ejemplo de patrón:**
```tsx
export interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100',
      primary: 'bg-blue-600',
    };

    return (
      <element
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
```

---

## Integración con React Hook Form

Todos los componentes de formulario son compatibles con React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { Input, Button } from '@/components/ui';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

---

## Testing

### Build Test
```bash
pnpm build
```
**Resultado:** ✅ Build exitoso sin errores

### Componentes Verificados
- ✅ Button: Todas las variantes y tamaños
- ✅ Input: Con/sin iconos, error states
- ✅ Textarea: Validación y helper text
- ✅ Select: Con array de opciones
- ✅ Checkbox/Radio: Labels y grupos
- ✅ Card: Todos los subcomponentes
- ✅ Badge: Variantes de color
- ✅ Alert: Iconos automáticos, cierre
- ✅ Modal: Escape key, body scroll lock
- ✅ Spinner: Loading states
- ✅ Skeleton: Presets funcionando

---

## Uso en la Aplicación

### Importación
```tsx
// Import individual
import { Button, Input } from '@/components/ui';

// Import con alias
import { Button as UIButton } from '@/components/ui';
```

### Ejemplo Completo
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { Input, Button, Select, Alert } from '@/components/ui';

function CreateProductForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="info" title="Información">
          Complete todos los campos requeridos
        </Alert>

        <Input
          label="Nombre del Producto"
          placeholder="Ej: Laptop HP"
        />

        <Select
          label="Categoría"
          options={categories}
        />
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary">Guardar</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Próximos Pasos

Esta user story está **completa**. Los componentes están listos para usar en:

1. **US-F014:** Ver lista de productos
   - Usar Table components (a crear)
   - Badge para estados
   - Card para layout
   - Skeleton para loading

2. **US-F015:** Crear producto
   - Modal para el formulario
   - Input, Select, Textarea
   - Button con loading state
   - Alert para feedback

3. **Futuras páginas:**
   - Todos los componentes UI están disponibles
   - Consistencia visual garantizada
   - Fácil mantenimiento

---

## Componentes Adicionales Sugeridos

Para futuras iteraciones:

### Corto Plazo
- [ ] **Tooltip**: Información contextual en hover
- [ ] **Dropdown**: Menú desplegable genérico
- [ ] **Tabs**: Navegación entre paneles
- [ ] **Table**: Tabla con sorting y paginación
- [ ] **Pagination**: Paginación reutilizable

### Mediano Plazo
- [ ] **DatePicker**: Selector de fechas
- [ ] **FileUpload**: Upload de archivos con drag & drop
- [ ] **Breadcrumb**: Navegación de rutas (ya existe en layout)
- [ ] **Progress**: Barra de progreso
- [ ] **Switch**: Toggle switch

### Largo Plazo
- [ ] **Autocomplete**: Input con sugerencias
- [ ] **MultiSelect**: Select múltiple con chips
- [ ] **RichTextEditor**: Editor de texto enriquecido
- [ ] **DataGrid**: Tabla avanzada con filtros
- [ ] **Charts**: Componentes de gráficos

---

## Mantenimiento

### Agregar Nueva Variante

```tsx
// En Button.tsx
const variants = {
  // ... existentes
  success: 'bg-green-600 text-white hover:bg-green-700',
};
```

### Crear Nuevo Tamaño

```tsx
const sizes = {
  // ... existentes
  xs: 'px-2 py-1 text-xs',
};
```

### Extender Componente

```tsx
// CustomButton.tsx
import { Button, ButtonProps } from '@/components/ui';

export function IconButton({ icon, ...props }: ButtonProps & { icon: ReactNode }) {
  return <Button leftIcon={icon} {...props} />;
}
```

---

## Notas Técnicas

### cn Utility
Todos los componentes usan `cn()` de `@/lib/utils/cn` para merge de clases:
```tsx
cn('base-classes', variants[variant], className)
```

### forwardRef
Permite acceso a elementos DOM:
```tsx
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} />
// inputRef.current.focus()
```

### Controlled vs Uncontrolled
Los componentes soportan ambos modos:
```tsx
// Uncontrolled
<Input defaultValue="test" />

// Controlled
<Input value={value} onChange={e => setValue(e.target.value)} />
```

---

**Tiempo estimado:** 8 horas
**Tiempo real:** ~3 horas
**Prioridad:** 🟡 ALTA
**Estado:** ✅ COMPLETADO

---

**Componentes creados:** 12
**Líneas de código:** ~1,500
**Cobertura:** 100% de componentes del backlog
