# Sistema de Autenticación y Autorización

Este documento explica cómo funciona el sistema de autenticación y autorización (RBAC) implementado en SRI Inventarios Frontend.

## Arquitectura

El sistema utiliza:
- **JWT Tokens** para autenticación
- **Cookies + localStorage** para persistencia de tokens
- **Next.js Middleware** para protección de rutas en el servidor
- **RBAC (Role-Based Access Control)** para autorización

---

## Roles y Jerarquía

### Roles Disponibles

1. **OWNER** (Propietario)
   - Acceso total al sistema
   - Puede gestionar todo, incluyendo usuarios y configuración

2. **ADMIN** (Administrador)
   - Administración completa del tenant
   - Puede gestionar usuarios, productos, inventario y configuración

3. **MANAGER** (Gerente)
   - Gestión de inventario y productos
   - Puede crear/editar productos, ajustar stock, crear transferencias

4. **AUDITOR** (Auditor)
   - Solo lectura y reportes
   - Puede ver todo pero no modificar nada

5. **OPERATOR** (Operador)
   - Operaciones básicas de inventario
   - Puede ver productos y stock, registrar transacciones básicas

### Jerarquía de Roles

```
OWNER (5) > ADMIN (4) > MANAGER (3) > AUDITOR (2) > OPERATOR (1)
```

---

## Middleware de Protección de Rutas

El middleware (`middleware.ts`) protege automáticamente todas las rutas del dashboard.

### Rutas Públicas (no requieren autenticación)

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Rutas Protegidas por Rol

```typescript
// Solo OWNER y ADMIN
/users
/settings/users

// MANAGER y superior
/products/create
/products/edit
/categories
/locations
/transfers/create
/import

// AUDITOR y superior
/inventory/transactions
/reports

// Todos los usuarios autenticados
/dashboard
/products
/inventory
```

### Comportamiento del Middleware

1. **No autenticado** → Redirige a `/login`
2. **Sin permisos** → Redirige a `/dashboard?error=unauthorized`
3. **Autenticado en ruta pública** → Redirige a `/dashboard`

---

## Uso en Componentes

### 1. Hook `usePermissions()`

```typescript
import { usePermissions } from '@/lib/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();

  // Verificar permiso específico
  if (hasPermission('products.create')) {
    // Mostrar botón crear
  }

  // Verificar rol
  if (hasRole('ADMIN')) {
    // Mostrar panel admin
  }

  // Verificar múltiples roles
  if (hasAnyRole('OWNER', 'ADMIN')) {
    // Mostrar configuración
  }
}
```

#### Métodos disponibles:

- `hasPermission(permission: string): boolean`
- `hasAnyPermission(...permissions: string[]): boolean`
- `hasAllPermissions(...permissions: string[]): boolean`
- `hasRole(role: string): boolean`
- `hasAnyRole(...roles: string[]): boolean`
- `permissions: string[]` - Lista de permisos del usuario
- `role: UserRole` - Rol del usuario

---

### 2. Componente `<Can>`

Renderiza contenido condicionalmente basado en permisos o roles.

```tsx
import { Can } from '@/components/auth';

// Por permiso
<Can permission="products.create">
  <CreateProductButton />
</Can>

// Por múltiples permisos (cualquiera)
<Can permissions={['products.create', 'products.update']}>
  <EditButton />
</Can>

// Por múltiples permisos (todos)
<Can permissions={['products.create', 'inventory.adjust']} requireAll>
  <AdvancedFeature />
</Can>

// Por rol
<Can role="ADMIN">
  <AdminPanel />
</Can>

// Por múltiples roles
<Can role={['OWNER', 'ADMIN']}>
  <ManageUsers />
</Can>

// Con fallback
<Can permission="products.create" fallback={<p>No tienes permisos</p>}>
  <CreateProductButton />
</Can>
```

---

### 3. Componente `<Cannot>`

Opuesto de `<Can>` - renderiza cuando NO tiene permisos.

```tsx
import { Cannot } from '@/components/auth';

<Cannot role="OPERATOR">
  <AdminFeature />
</Cannot>
```

---

### 4. Componente `<ProtectedRoute>`

Protege páginas completas requiriendo autenticación y/o permisos.

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function CreateProductPage() {
  return (
    <ProtectedRoute requiredPermission="products.create">
      <CreateProductForm />
    </ProtectedRoute>
  );
}

// Con múltiples permisos
<ProtectedRoute requiredPermissions={['products.create', 'inventory.adjust']} requireAll>
  <AdvancedPage />
</ProtectedRoute>

// Por rol
<ProtectedRoute requiredRole={['OWNER', 'ADMIN']}>
  <AdminPage />
</ProtectedRoute>

// Con redirección personalizada
<ProtectedRoute requiredRole="ADMIN" redirectTo="/dashboard">
  <AdminPanel />
</ProtectedRoute>
```

---

## Permisos Disponibles

Los permisos están definidos en `lib/constants/permissions.ts`:

### Productos
- `products.view` - Ver productos
- `products.create` - Crear productos
- `products.update` - Editar productos
- `products.delete` - Eliminar productos

### Categorías
- `categories.view` - Ver categorías
- `categories.manage` - Gestionar categorías

### Inventario
- `inventory.view` - Ver inventario
- `inventory.adjust` - Ajustar stock

### Ubicaciones
- `locations.view` - Ver ubicaciones
- `locations.manage` - Gestionar ubicaciones

### Transferencias
- `transfers.view` - Ver transferencias
- `transfers.create` - Crear transferencias
- `transfers.complete` - Completar transferencias
- `transfers.cancel` - Cancelar transferencias

### Transacciones
- `transactions.view` - Ver transacciones
- `transactions.export` - Exportar transacciones

### Importación
- `import.products` - Importar productos
- `import.stock` - Importar stock

### Reportes
- `reports.view` - Ver reportes
- `reports.export` - Exportar reportes

### Usuarios
- `users.view` - Ver usuarios
- `users.create` - Crear usuarios
- `users.update` - Editar usuarios
- `users.delete` - Eliminar usuarios

### Configuración
- `settings.view` - Ver configuración
- `settings.update` - Actualizar configuración

---

## Almacenamiento de Tokens

Los tokens se almacenan de forma dual para compatibilidad:

### localStorage (client-side)
```typescript
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

### Cookies (middleware)
```typescript
setCookie('access_token', token, {
  expires: expiresInSeconds,
  path: '/',
  secure: true, // solo HTTPS en producción
  sameSite: 'Lax',
});
```

### Beneficios del Enfoque Dual
- ✅ Middleware puede leer cookies en Edge Runtime
- ✅ JavaScript del cliente puede acceder rápido a localStorage
- ✅ Compatibilidad con código existente
- ✅ Mejor seguridad (HttpOnly podría implementarse después)

---

## Refresh Token

El sistema automáticamente refresca tokens expirados:

1. Request falla con 401
2. Interceptor detecta token expirado
3. Llama a `/auth/refresh` con refresh token
4. Actualiza tokens en localStorage y cookies
5. Reintenta request original

Ver `lib/api/client.ts` líneas 34-94.

---

## Utilidades

### Obtener nombre del rol

```typescript
import { getRoleDisplayName } from '@/lib/constants/permissions';

getRoleDisplayName('ADMIN'); // "Administrador"
```

### Obtener descripción del rol

```typescript
import { getRoleDescription } from '@/lib/constants/permissions';

getRoleDescription('MANAGER'); // "Gestión de inventario y productos"
```

### Verificar jerarquía de roles

```typescript
import { hasMinimumRole } from '@/lib/constants/permissions';

hasMinimumRole('ADMIN', 'MANAGER'); // true (ADMIN >= MANAGER)
hasMinimumRole('OPERATOR', 'ADMIN'); // false (OPERATOR < ADMIN)
```

---

## Ejemplo Completo

```tsx
'use client';

import { usePermissions } from '@/lib/hooks/usePermissions';
import { Can, ProtectedRoute } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';

export default function ProductsPage() {
  const { hasPermission, hasAnyRole } = usePermissions();

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.PRODUCTS_VIEW}>
      <div>
        <h1>Productos</h1>

        {/* Botón crear - solo para MANAGER y superior */}
        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <button>Crear Producto</button>
        </Can>

        {/* Botón eliminar - solo para ADMIN y OWNER */}
        <Can role={['OWNER', 'ADMIN']}>
          <button>Eliminar Producto</button>
        </Can>

        {/* Tabla de productos - todos pueden ver */}
        <ProductTable />
      </div>
    </ProtectedRoute>
  );
}
```

---

## Seguridad

### Buenas Prácticas

✅ **SIEMPRE** verifica permisos en el backend también
✅ **NUNCA** confíes solo en permisos del frontend
✅ **USA** el middleware para proteger rutas sensibles
✅ **VALIDA** tokens en cada request del API
✅ **LIMPIA** tokens al hacer logout

### Consideraciones

- El middleware protege rutas pero el backend debe validar permisos
- Los tokens en cookies NO son HttpOnly (para acceso JS)
- En producción, usa HTTPS siempre (secure: true)
- Los refresh tokens duran más que access tokens

---

## Testing

Para probar diferentes roles, puedes modificar temporalmente el usuario en localStorage:

```javascript
// En DevTools Console
const user = JSON.parse(localStorage.getItem('user'));
user.role = 'ADMIN'; // o 'OPERATOR', 'MANAGER', etc.
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

---

## Troubleshooting

### "No tienes permisos"
- Verifica que el rol del usuario tenga el permiso necesario
- Revisa `ROLE_PERMISSIONS` en `lib/constants/permissions.ts`

### Middleware redirige en loop
- Verifica que las cookies se estén seteando correctamente
- Revisa que `/login` esté en `publicRoutes`

### Tokens no se refrescan
- Verifica que `refresh_token` esté en localStorage y cookies
- Revisa interceptor en `lib/api/client.ts`

---

## Migración Futura (HttpOnly Cookies)

Para mayor seguridad, considera migrar a HttpOnly cookies:

1. Mover seteo de cookies al backend
2. Usar `Set-Cookie` header con `HttpOnly; Secure; SameSite=Strict`
3. Actualizar middleware para leer cookies HttpOnly
4. Crear endpoint `/auth/me` para obtener usuario actual

---

**Última actualización:** 2025-10-24
**Versión:** 1.0
