# MisViáticos Frontend Agent - Contexto Completo

## 🎯 Descripción del Proyecto
**MisViáticos** es una plataforma de gestión de viáticos empresariales desarrollada en **Next.js 15** con **React 19**, que permite digitalizar el 100% de los gastos de viaje empresariales.

---

## 🏗️ Arquitectura y Stack Tecnológico

### Core Technologies
- **Framework**: Next.js 15.5.2 con Turbopack
- **React**: 19.1.0 (React 19 con RSC)
- **TypeScript**: ^5
- **Styling**: Tailwind CSS 4 con PostCSS
- **Linting/Formatting**: Biome 2.2.0
- **Package Manager**: pnpm
- **Icons**: @heroicons/react 2.2.0

### Configuración TypeScript
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]  // Path alias para imports
    }
  }
}
```

---

## 📁 Estructura de Carpetas (Feature-Based Architecture)

```
mv-frontend/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # Root layout con fonts Geist
│   ├── page.tsx                            # Landing page (/)
│   ├── globals.css                         # Estilos globales + componentes Tailwind
│   │
│   ├── _landingpage/                       # Landing page feature module
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── constants.ts
│   │
│   ├── auth/                               # Autenticación feature module
│   │   ├── login/
│   │   │   ├── page.tsx                    # /auth/login
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SocialLogin.tsx
│   │   │   │   └── LoginHeader.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── api.ts                  # AuthService
│   │   │       └── validation.ts
│   │   │
│   │   ├── register/
│   │   │   ├── page.tsx                    # /auth/register
│   │   │   ├── components/
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── RegisterHeader.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── api.ts
│   │   │       └── validation.ts
│   │   │
│   │   ├── reset-password/
│   │   │   ├── page.tsx                    # /auth/reset-password
│   │   │   ├── components/
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   ├── ResetPasswordHeader.tsx
│   │   │   │   └── SuccessMessage.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── api.ts
│   │   │       └── validation.ts
│   │   │
│   │   └── verify-email/
│   │       └── [token]/
│   │           └── page.tsx                # /auth/verify-email/[token]
│   │
│   └── dashboard/
│       └── page.tsx                        # /dashboard (protegida)
│
├── public/                                 # Assets estáticos
│   └── icon-mv/                            # Brand icons MisViáticos
│
├── .next/                                  # Next.js build output
├── node_modules/
├── next.config.ts                          # Next.js config
├── postcss.config.mjs                      # PostCSS config
├── tsconfig.json                           # TypeScript config
├── biome.json                              # Biome linter/formatter
├── pnpm-lock.yaml
├── package.json
└── README.md
```

---

## 🎨 Sistema de Diseño (Design System)

### Brand Colors (MisViáticos)
```css
:root {
  /* Colores de marca - Purple/Violet Theme */
  --mv-purple-primary: #8B5CF6;
  --mv-purple-secondary: #A855F7;
  --mv-purple-light: #C084FC;
  --mv-purple-dark: #7C3AED;
  --mv-gradient-start: #8B5CF6;
  --mv-gradient-end: #A855F7;
}
```

### Componentes Reutilizables (Tailwind @layer components)
```css
/* Gradient Text */
.gradient-text {
  @apply bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent;
}

/* Gradient Button */
.btn-gradient {
  @apply bg-gradient-to-r from-purple-600 to-violet-600
         hover:from-purple-700 hover:to-violet-700
         text-white px-8 py-4 rounded-lg font-semibold
         transition-all duration-200
         transform hover:scale-105 hover:shadow-lg;
}

/* Secondary Button */
.btn-secondary {
  @apply text-purple-600 hover:text-purple-700
         px-8 py-4 rounded-lg font-semibold
         transition-colors duration-200
         border border-purple-200 hover:border-purple-300
         hover:bg-purple-50;
}

/* Card Hover Effect */
.card-hover {
  @apply p-8 rounded-2xl
         hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50
         transition-all duration-300;
}

/* Feature Icon */
.feature-icon {
  @apply w-16 h-16
         bg-gradient-to-br from-purple-600 to-violet-600
         rounded-2xl flex items-center justify-center
         group-hover:scale-110 transition-transform duration-300;
}

/* Navigation Link */
.nav-link {
  @apply text-gray-700 hover:text-purple-600 transition-colors duration-200;
}
```

### Typography
- **Font Family**: Geist Sans + Geist Mono (Google Fonts)
- **CSS Variables**: `--font-geist-sans`, `--font-geist-mono`

### Animations
```css
/* Custom Utilities (@layer utilities) */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-400 { animation-delay: 400ms; }

/* Hero background pattern */
.hero-dots-pattern {
  background-color: white;
  background-image:
    radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.3) 1px, transparent 0),
    radial-gradient(circle at 22px 22px, rgba(124, 58, 237, 0.2) 1px, transparent 0);
  background-size: 20px 20px, 40px 40px;
}
```

---

## 📋 Patrones y Convenciones de Código

### 1. **Estructura de Features por Módulos**
Cada feature tiene su propia carpeta con:
- `page.tsx` - Página principal de la ruta
- `components/` - Componentes específicos del feature
- `types/` - TypeScript types e interfaces
- `utils/` - Funciones de utilidad (api.ts, validation.ts, etc.)

### 2. **Naming Conventions**
- **Componentes**: PascalCase (`LoginForm.tsx`, `ResetPasswordHeader.tsx`)
- **Utilities/Types**: camelCase para exports (`validateEmail`, `LoginFormData`)
- **Archivos de utils**: snake_case para archivos (`api.ts`, `validation.ts`)
- **CSS Classes**: kebab-case y Tailwind utilities

### 3. **Patrón de Componentes de Formulario**

#### Estructura estándar de Form Component:
```tsx
'use client'

import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import type { FormData, FormProps } from '../types'

export default function Form({ onSubmit, isLoading }: FormProps) {
  const [formData, setFormData] = useState<FormData>({ /* initial */ })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<FormData> = {}

    // Validación inline
    if (!formData.field) newErrors.field = 'Error message'

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fields */}
    </form>
  )
}
```

### 4. **Patrón de Input con Error Handling**
```tsx
<div>
  <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-2">
    Label
  </label>
  <input
    id="field"
    type="text"
    value={formData.field}
    onChange={(e) => handleChange('field', e.target.value)}
    className={`w-full px-4 py-3 border rounded-lg
                focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-colors ${
                  errors.field ? 'border-red-500' : 'border-gray-300'
                }`}
    placeholder="Placeholder"
  />
  {errors.field && (
    <p className="mt-1 text-sm text-red-600">{errors.field}</p>
  )}
</div>
```

### 5. **Patrón de Password Toggle**
```tsx
const [showPassword, setShowPassword] = useState(false)

<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    {...props}
    className="w-full px-4 py-3 pr-12 border rounded-lg"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  >
    {showPassword ? (
      <EyeSlashIcon className="w-5 h-5" />
    ) : (
      <EyeIcon className="w-5 h-5" />
    )}
  </button>
</div>
```

### 6. **Estructura de API Services**
```typescript
// utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export class AuthService {
  static async operation(data: DataType): Promise<ResponseType> {
    try {
      const response = await fetch(`${API_BASE_URL}/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error message')
      }

      return {
        success: true,
        // Map backend response to frontend format
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}
```

### 7. **Validación de Formularios (utils/validation.ts)**
```typescript
export const validateField = (value: string): string | null => {
  if (!value) return 'El campo es requerido'
  if (/* condition */) return 'Error específico'
  return null
}

export const validateForm = (data: FormData): Record<keyof FormData, string | null> => {
  return {
    field1: validateField(data.field1),
    field2: validateField(data.field2)
  }
}

export const hasValidationErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some(error => error !== null)
}
```

### 8. **TypeScript Types Pattern (types/index.ts)**
```typescript
// Form Data
export interface LoginFormData {
  email: string
  password: string
}

// Component Props
export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading: boolean
}

// API Response
export interface LoginResponse {
  success: boolean
  token?: string
  user?: UserData
  error?: string
}

// User Data
export interface UserData {
  id: number
  firstname: string
  lastname: string
  email: string
  is_active: boolean
  email_verified: boolean
}

// Error handling
export interface AuthError {
  code: string
  message: string
}
```

### 9. **Patrón de Page Component con Estado**
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Service } from './utils/api'
import type { FormData } from './types'

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await Service.action(data)

      if (result.success) {
        // Business logic (storage, validation, etc.)
        if (result.token) {
          localStorage.setItem('auth_token', result.token)
        }
        router.push('/destination')
      } else {
        setError(result.error || 'Error message')
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Content */}
      </div>
    </div>
  )
}
```

### 10. **Error Display Pattern**
```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}
```

---

## 🔄 Flujo de Autenticación

### Login Flow
1. Usuario ingresa email/password en `LoginForm`
2. Validación básica client-side
3. `AuthService.login()` hace POST a `/api/v1/auth/login`
4. Backend responde con:
   ```json
   {
     "data": {
       "access_token": "...",
       "refresh_token": "...",
       "user": { /* user data */ },
       "expires_in": 3600
     }
   }
   ```
5. Frontend valida:
   - `user.is_active` (cuenta activa)
   - `user.email_verified` (email verificado)
6. Si OK:
   - Guarda tokens en `localStorage`
   - Redirige a `/dashboard`
7. Si ERROR:
   - Muestra mensaje específico

### Register Flow
1. Usuario completa `RegisterForm` (firstname, lastname, email, phone, password, password_confirm)
2. Validación client-side (campos requeridos + passwords match)
3. `AuthService.register()` → POST `/api/v1/auth/register`
4. Backend crea usuario y envía email de verificación
5. Frontend muestra mensaje de éxito y redirige a verificación

### Reset Password Flow
1. Usuario ingresa email en `ResetPasswordForm`
2. `AuthService.requestReset()` → POST `/api/v1/auth/reset-password`
3. Backend envía email con token
4. Usuario hace click en link → `/auth/reset-password?token=xxx`
5. Usuario ingresa nueva password
6. `AuthService.resetPassword(token, newPassword)`

### Email Verification
- Ruta: `/auth/verify-email/[token]`
- Muestra UI de verificación (loading/success/error)
- Llama a backend para verificar token

---

## 🗂️ Constants y Configuración

### Navigation (Landing)
```typescript
// app/_landingpage/utils/constants.ts
export const NAVIGATION_ITEMS = [
  {
    label: 'Producto',
    href: '/producto',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Características', href: '/producto/caracteristicas' },
      { label: 'Integrations', href: '/producto/integraciones' },
      { label: 'Seguridad', href: '/producto/seguridad' }
    ]
  },
  // ...más items
]
```

### Features Data
```typescript
export const FEATURES_DATA = [
  {
    id: 'app-movil',
    title: 'App Móvil',
    description: '...',
    benefits: [
      'Escaneo automático de recibos',
      'Modo offline disponible',
      'Geolocalización automática'
    ]
  },
  // ...
]
```

---

## 🚀 Scripts y Comandos

```json
{
  "dev": "next dev --turbopack",        // Dev server con Turbopack
  "build": "next build --turbopack",    // Build para producción
  "start": "next start",                // Start production server
  "lint": "biome check",                // Linting con Biome
  "format": "biome format --write"      // Format código
}
```

---

## 🔧 Configuración de Herramientas

### Biome (Linter/Formatter)
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noUnknownAtRules": "off"  // Para Tailwind @layer
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  }
}
```

---

## 📝 Mejores Prácticas del Proyecto

### ✅ DO's - Fundamentos
1. **Usar 'use client' solo cuando sea necesario** (forms, useState, eventos)
2. **Colocar componentes en la carpeta del feature** correspondiente
3. **Validar en cliente Y servidor** (doble validación)
4. **Usar TypeScript types estrictos** - definir interfaces para todo
5. **Manejar errores de forma granular** (diferentes mensajes para cada caso)
6. **Usar Tailwind utilities** antes que CSS custom
7. **Aprovechar las clases reutilizables** del globals.css (.btn-gradient, .card-hover, etc.)
8. **Usar Heroicons** para iconografía
9. **Mantener imports organizados** (React → Next → Heroicons → Local)

### ❌ DON'Ts - Evitar
1. **No usar CSS modules** - usar Tailwind o @layer components
2. **No hardcodear URLs de API** - usar `process.env.NEXT_PUBLIC_API_URL`
3. **No mezclar lógica de negocio en componentes de UI** - separar en utils/
4. **No hacer fetch directo en componentes** - usar Service classes
5. **No ignorar TypeScript errors** - resolver todos los tipos

---

## 🏆 Mejores Prácticas Avanzadas (World-Class Development)

### 1. 🎯 **Arquitectura Limpia y Escalable**

#### **Separación de Responsabilidades (SoC)**
```typescript
// ❌ MAL - Todo mezclado en un componente
export default function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/users/1').then(r => r.json()).then(setUser)
  }, [])

  return <div>{user?.name}</div>
}

// ✅ BIEN - Responsabilidades separadas
// hooks/useUser.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    UserService.getById(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [userId])

  return { user, isLoading, error }
}

// components/UserProfile.tsx
export default function UserProfile({ userId }: Props) {
  const { user, isLoading, error } = useUser(userId)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!user) return <EmptyState />

  return <UserDetails user={user} />
}
```

#### **Principio DRY (Don't Repeat Yourself)**
```typescript
// ❌ MAL - Código duplicado
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // ... validation logic
}

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // ... same validation logic (duplicated!)
}

// ✅ BIEN - Lógica reutilizable
// hooks/useFormField.ts
export function useFormField<T>(initialValue: T, validator?: (value: T) => string | null) {
  const [value, setValue] = useState<T>(initialValue)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (newValue: T) => {
    setValue(newValue)
    if (error && validator) {
      setError(validator(newValue))
    }
  }

  const validate = () => {
    if (validator) {
      const errorMsg = validator(value)
      setError(errorMsg)
      return errorMsg === null
    }
    return true
  }

  return { value, error, setValue: handleChange, validate }
}

// Uso en cualquier form
const email = useFormField('', validateEmail)
const password = useFormField('', validatePassword)
```

### 2. 🔒 **Seguridad y Manejo de Datos**

#### **Sanitización de Inputs**
```typescript
// utils/sanitize.ts
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Prevenir XSS básico
    .substring(0, 255)    // Limitar longitud
}

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// Uso en formularios
const handleSubmit = (data: FormData) => {
  const sanitizedData = {
    email: sanitizeEmail(data.email),
    firstname: sanitizeInput(data.firstname),
    lastname: sanitizeInput(data.lastname)
  }

  await AuthService.register(sanitizedData)
}
```

#### **Token Management Seguro**
```typescript
// lib/auth/tokenManager.ts
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_KEY = 'refresh_token'

  static setTokens(accessToken: string, refreshToken: string) {
    // En producción, considerar usar httpOnly cookies
    localStorage.setItem(this.TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_KEY, refreshToken)
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY)
  }

  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_KEY)
    localStorage.removeItem('user_data')
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
}
```

### 3. 🎣 **Custom Hooks para Lógica Reutilizable**

#### **useDebounce - Para búsquedas optimizadas**
```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Uso en búsqueda
function SearchExpenses() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearch) {
      ExpenseService.search(debouncedSearch)
    }
  }, [debouncedSearch])
}
```

#### **useLocalStorage - Estado persistente**
```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// Uso
const [user, setUser] = useLocalStorage<User | null>('user_data', null)
```

#### **useAsync - Para operaciones asíncronas**
```typescript
// hooks/useAsync.ts
interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true
  })

  useEffect(() => {
    let isMounted = true

    setState({ data: null, error: null, isLoading: true })

    asyncFunction()
      .then(data => {
        if (isMounted) {
          setState({ data, error: null, isLoading: false })
        }
      })
      .catch(error => {
        if (isMounted) {
          setState({ data: null, error, isLoading: false })
        }
      })

    return () => {
      isMounted = false
    }
  }, dependencies)

  return state
}

// Uso
function ExpenseList() {
  const { data: expenses, isLoading, error } = useAsync(
    () => ExpenseService.getAll(),
    []
  )
}
```

### 4. 🧪 **Testing y Quality Assurance**

#### **Estructura de tests (preparación futura)**
```typescript
// __tests__/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/app/auth/login/components/LoginForm'

describe('LoginForm', () => {
  it('should validate email format', async () => {
    const mockSubmit = jest.fn()
    render(<LoginForm onSubmit={mockSubmit} isLoading={false} />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email válido/i)).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })
})
```

#### **Type Guards para TypeScript**
```typescript
// utils/typeGuards.ts
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'firstname' in value
  )
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

// Uso
const data = await response.json()
if (isUser(data.user)) {
  setUser(data.user) // TypeScript sabe que es User
}
```

### 5. 📊 **Performance y Optimización**

#### **Memoización de componentes costosos**
```typescript
// components/ExpenseCard.tsx
import { memo } from 'react'

interface ExpenseCardProps {
  expense: Expense
  onDelete: (id: number) => void
  onEdit: (id: number) => void
}

// ✅ Usar memo para evitar re-renders innecesarios
export const ExpenseCard = memo(function ExpenseCard({
  expense,
  onDelete,
  onEdit
}: ExpenseCardProps) {
  return (
    <div className="card-hover">
      <h3>{expense.description}</h3>
      <p>${expense.amount}</p>
      <button onClick={() => onEdit(expense.id)}>Editar</button>
      <button onClick={() => onDelete(expense.id)}>Eliminar</button>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.expense.id === nextProps.expense.id &&
         prevProps.expense.amount === nextProps.expense.amount
})
```

#### **useCallback para funciones estables**
```typescript
import { useCallback, useMemo } from 'react'

function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  // ✅ useCallback para callbacks estables
  const handleDelete = useCallback((id: number) => {
    ExpenseService.delete(id)
      .then(() => setExpenses(prev => prev.filter(e => e.id !== id)))
  }, [])

  const handleEdit = useCallback((id: number) => {
    router.push(`/expenses/${id}/edit`)
  }, [router])

  // ✅ useMemo para cálculos costosos
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  return (
    <>
      <h2>Total: ${totalAmount}</h2>
      {expenses.map(expense => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </>
  )
}
```

#### **Lazy Loading de componentes**
```typescript
// app/dashboard/page.tsx
import { lazy, Suspense } from 'react'

// ✅ Lazy load de componentes pesados
const ExpenseChart = lazy(() => import('./components/ExpenseChart'))
const ReportGenerator = lazy(() => import('./components/ReportGenerator'))

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<ChartSkeleton />}>
        <ExpenseChart />
      </Suspense>

      <Suspense fallback={<div>Cargando reportes...</div>}>
        <ReportGenerator />
      </Suspense>
    </div>
  )
}
```

### 6. 🌐 **API y Estado Global**

#### **React Query/TanStack Query Pattern (futuro)**
```typescript
// lib/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})

// hooks/useExpenses.ts
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: ExpenseService.getAll,
    select: (data) => data.expenses, // Transform data
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ExpenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })
}
```

#### **Zustand para estado global (alternativa ligera)**
```typescript
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'auth-storage'
    }
  )
)

// Uso en componentes
function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      <p>Hola, {user?.firstname}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </header>
  )
}
```

### 7. 🛡️ **Error Boundaries y Manejo de Errores**

#### **Error Boundary Component**
```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
    // Enviar a servicio de logging (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-600">Algo salió mal</h2>
          <p className="text-red-500">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 btn-gradient"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Uso en layout
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

#### **Manejo centralizado de errores API**
```typescript
// lib/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    throw new ApiError(
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || 'Ha ocurrido un error'
    )
  }

  return response.json()
}

// Uso en services
export class ExpenseService {
  static async getAll(): Promise<Expense[]> {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      headers: { Authorization: `Bearer ${TokenManager.getAccessToken()}` }
    })

    const data = await handleApiResponse<{ expenses: Expense[] }>(response)
    return data.expenses
  }
}
```

### 8. 🎨 **Design System Componentizado**

#### **Componentes atómicos reutilizables**
```typescript
// components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white',
        secondary: 'text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 hover:bg-purple-50',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        ghost: 'hover:bg-gray-100'
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  isLoading?: boolean
}

export function Button({
  children,
  variant,
  size,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="mr-2" />
          Cargando...
        </>
      ) : children}
    </button>
  )
}

// Uso
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Crear Gasto
</Button>
```

#### **Input component reutilizable**
```typescript
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  const inputId = useId()

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 border rounded-lg
          focus:ring-2 focus:ring-purple-500 focus:border-transparent
          transition-colors
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  )
}
```

### 9. 📱 **Accesibilidad (a11y)**

#### **Mejores prácticas de accesibilidad**
```typescript
// components/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'

      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable = focusableElements?.[0]
      firstFocusable?.focus()

      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
        <h2 id="modal-title" className="text-xl font-bold">
          {title}
        </h2>

        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### 10. 📈 **Logging y Monitoreo**

#### **Sistema de logging centralizado**
```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export class Logger {
  private static logs: LogEntry[] = []

  private static log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    }

    this.logs.push(entry)

    // En producción, enviar a servicio externo
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry)
    } else {
      console[level](message, context)
    }
  }

  static info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  static error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack
    })
  }

  static warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  private static sendToLoggingService(entry: LogEntry) {
    // Integrar con Sentry, LogRocket, Datadog, etc.
  }
}

// Uso
Logger.info('User logged in', { userId: user.id })
Logger.error('Failed to fetch expenses', error, { userId: user.id })
```

---

---

## 🏗️ Estructura Modular Recomendada (Carpetas Compartidas)

### Organización escalable de carpetas compartidas

```
mv-frontend/
├── app/                          # Next.js App Router
│   ├── (features)/               # Feature routes
│   └── api/                      # API routes (si se usan)
│
├── lib/                          # 🔧 Core utilities & configs
│   ├── api/
│   │   ├── client.ts             # Axios/Fetch client configurado
│   │   ├── errorHandler.ts       # Manejo centralizado de errores
│   │   └── interceptors.ts       # Request/Response interceptors
│   ├── auth/
│   │   ├── tokenManager.ts       # Gestión de tokens
│   │   └── authGuard.ts          # Protección de rutas
│   ├── utils/
│   │   ├── sanitize.ts           # Sanitización de inputs
│   │   ├── formatters.ts         # Formateo de datos (fechas, moneda)
│   │   └── typeGuards.ts         # Type guards TypeScript
│   └── logger.ts                 # Sistema de logging
│
├── hooks/                        # 🎣 Custom React Hooks compartidos
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useAsync.ts
│   ├── useFormField.ts
│   └── useAuth.ts
│
├── components/                   # 🧩 Componentes compartidos
│   ├── ui/                       # Atomic design components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── ErrorBoundary.tsx         # Error boundary global
│
├── types/                        # 📝 TypeScript types globales
│   ├── api.ts                    # API response types
│   ├── models.ts                 # Domain models (User, Expense, etc.)
│   └── common.ts                 # Common types
│
├── store/                        # 🗃️ Estado global (Zustand/Redux)
│   ├── authStore.ts
│   ├── expenseStore.ts
│   └── uiStore.ts
│
├── services/                     # 🔌 API Services
│   ├── authService.ts
│   ├── expenseService.ts
│   └── userService.ts
│
├── constants/                    # 📋 Constantes globales
│   ├── routes.ts
│   ├── apiEndpoints.ts
│   └── config.ts
│
└── middleware.ts                 # Next.js middleware (auth, etc.)
```

### ¿Cuándo usar carpetas compartidas vs feature folders?

#### ✅ Usar carpetas compartidas (`lib/`, `hooks/`, `components/`) cuando:
- El código se usa en **3+ features diferentes**
- Es una **utilidad genérica** (formatters, validators)
- Es un **componente UI reutilizable** (Button, Input, Modal)
- Es **lógica de negocio compartida** (auth, logging)

#### ✅ Usar carpetas de feature (`app/[feature]/`) cuando:
- El código es **específico de una feature**
- Solo se usa en **1-2 lugares**
- Tiene **lógica de negocio única**

---

## 🎯 Checklist para Nuevas Features (Actualizado)

Al agregar una nueva feature, seguir este checklist:

### 📁 Estructura
- [ ] Crear carpeta feature en `/app/[feature-name]/`
- [ ] Crear `page.tsx` con 'use client' si usa estado
- [ ] Crear subcarpeta `/components/` con componentes específicos de la feature
- [ ] Crear `/types/index.ts` con interfaces TypeScript del feature
- [ ] Si tiene API calls, crear `/utils/api.ts` con Service class
- [ ] Si tiene validaciones específicas, crear `/utils/validation.ts`

### 🎨 UI/UX
- [ ] Usar componentes compartidos de `/components/ui/` (Button, Input, etc.)
- [ ] Aplicar clases reutilizables de `globals.css` (.btn-gradient, .card-hover)
- [ ] Usar Heroicons para iconos
- [ ] Aplicar colores de marca (purple-600, violet-600)
- [ ] Agregar estados de loading y disabled en botones
- [ ] Implementar skeleton loaders para mejor UX

### 🔒 Seguridad y Validación
- [ ] Sanitizar todos los inputs con `sanitizeInput()` de `lib/utils/sanitize.ts`
- [ ] Validar inputs client-side Y server-side (doble validación)
- [ ] Implementar error handling granular con mensajes específicos
- [ ] Usar Type Guards para validar tipos en runtime

### ⚡ Performance
- [ ] Usar `memo()` para componentes que renderizan listas
- [ ] Usar `useCallback()` para funciones pasadas como props
- [ ] Usar `useMemo()` para cálculos costosos
- [ ] Lazy load componentes pesados con `lazy()` y `Suspense`

### 🧪 Calidad de Código
- [ ] Definir todas las interfaces TypeScript (strict types)
- [ ] Mantener imports organizados (React → Next → Libs → Local)
- [ ] Extraer lógica compleja a custom hooks si se repite
- [ ] Agregar comentarios JSDoc para funciones públicas
- [ ] Formatear código con `pnpm format` antes de commit

### 🔄 Estado y Data Fetching
- [ ] Usar custom hooks para data fetching (`useAsync`, `useExpenses`, etc.)
- [ ] Implementar estados de loading, error y empty states
- [ ] Considerar usar React Query/Zustand para estado complejo
- [ ] Implementar optimistic updates cuando sea apropiado

### ♿ Accesibilidad
- [ ] Agregar `aria-label` en iconos y botones sin texto
- [ ] Asegurar que todos los inputs tengan labels asociados
- [ ] Implementar keyboard navigation (Tab, Enter, Escape)
- [ ] Usar roles ARIA apropiados (dialog, button, etc.)

### 📊 Monitoreo
- [ ] Agregar logging en operaciones críticas con `Logger`
- [ ] Implementar error tracking (preparar para Sentry)
- [ ] Agregar analytics events si es necesario

---

## 🚀 Arquitectura Escalable - Principios SOLID

### 1. **Single Responsibility Principle (SRP)**
Cada módulo/clase debe tener una única responsabilidad.

```typescript
// ❌ MAL - Múltiples responsabilidades
class UserManager {
  async login(email: string, password: string) { /* ... */ }
  async register(data: RegisterData) { /* ... */ }
  validateEmail(email: string) { /* ... */ }
  formatUserName(user: User) { /* ... */ }
  sendEmail(to: string, subject: string) { /* ... */ }
}

// ✅ BIEN - Responsabilidades separadas
// services/authService.ts
export class AuthService {
  static async login(email: string, password: string) { /* ... */ }
  static async register(data: RegisterData) { /* ... */ }
}

// utils/validators.ts
export const validateEmail = (email: string) => { /* ... */ }

// utils/formatters.ts
export const formatUserName = (user: User) => { /* ... */ }

// services/emailService.ts
export class EmailService {
  static async send(to: string, subject: string) { /* ... */ }
}
```

### 2. **Open/Closed Principle (OCP)**
Abierto a extensión, cerrado a modificación.

```typescript
// ✅ Patrón Strategy para diferentes tipos de pago
// types/payment.ts
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>
}

// strategies/creditCardPayment.ts
export class CreditCardPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Lógica de tarjeta de crédito
  }
}

// strategies/transferPayment.ts
export class TransferPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Lógica de transferencia
  }
}

// services/paymentService.ts
export class PaymentService {
  constructor(private strategy: PaymentStrategy) {}

  async pay(amount: number) {
    return this.strategy.process(amount)
  }
}

// Uso - Fácil agregar nuevos métodos sin modificar código existente
const creditCardService = new PaymentService(new CreditCardPayment())
const transferService = new PaymentService(new TransferPayment())
```

### 3. **Dependency Inversion Principle (DIP)**
Depender de abstracciones, no de implementaciones concretas.

```typescript
// ✅ Inyección de dependencias
// types/storage.ts
interface StorageAdapter {
  set(key: string, value: string): void
  get(key: string): string | null
  remove(key: string): void
}

// adapters/localStorageAdapter.ts
export class LocalStorageAdapter implements StorageAdapter {
  set(key: string, value: string) {
    localStorage.setItem(key, value)
  }

  get(key: string) {
    return localStorage.getItem(key)
  }

  remove(key: string) {
    localStorage.removeItem(key)
  }
}

// adapters/sessionStorageAdapter.ts (alternativa)
export class SessionStorageAdapter implements StorageAdapter {
  set(key: string, value: string) {
    sessionStorage.setItem(key, value)
  }
  // ...
}

// lib/auth/tokenManager.ts
export class TokenManager {
  constructor(private storage: StorageAdapter) {}

  setToken(token: string) {
    this.storage.set('auth_token', token)
  }

  getToken() {
    return this.storage.get('auth_token')
  }
}

// Uso - Fácil cambiar implementación sin cambiar TokenManager
const tokenManager = new TokenManager(new LocalStorageAdapter())
// o
const tokenManager = new TokenManager(new SessionStorageAdapter())
```

---

## 🧩 Patrones de Diseño Recomendados

### 1. **Repository Pattern** (para data fetching)
```typescript
// repositories/expenseRepository.ts
interface ExpenseRepository {
  getAll(): Promise<Expense[]>
  getById(id: number): Promise<Expense>
  create(data: CreateExpenseDTO): Promise<Expense>
  update(id: number, data: UpdateExpenseDTO): Promise<Expense>
  delete(id: number): Promise<void>
}

export class ApiExpenseRepository implements ExpenseRepository {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<Expense[]> {
    const response = await this.apiClient.get<{ expenses: Expense[] }>('/expenses')
    return response.expenses
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const response = await this.apiClient.post<{ expense: Expense }>('/expenses', data)
    return response.expense
  }

  // ...
}

// Uso en hooks
export function useExpenses() {
  const repository = new ApiExpenseRepository(apiClient)

  return useAsync(() => repository.getAll(), [])
}
```

### 2. **Factory Pattern** (para crear objetos complejos)
```typescript
// factories/formFactory.ts
export class FormFactory {
  static createLoginForm(): LoginFormData {
    return {
      email: '',
      password: '',
      rememberMe: false
    }
  }

  static createRegisterForm(): RegisterFormData {
    return {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
      acceptTerms: false
    }
  }

  static createExpenseForm(expense?: Expense): ExpenseFormData {
    return {
      description: expense?.description || '',
      amount: expense?.amount || 0,
      category: expense?.category || '',
      date: expense?.date || new Date().toISOString(),
      receipt: null
    }
  }
}

// Uso
const [formData, setFormData] = useState(FormFactory.createExpenseForm(expense))
```

### 3. **Observer Pattern** (con Custom Events)
```typescript
// lib/eventBus.ts
type EventCallback = (data?: unknown) => void

export class EventBus {
  private static events = new Map<string, EventCallback[]>()

  static on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)?.push(callback)
  }

  static off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
  }

  static emit(event: string, data?: unknown) {
    const callbacks = this.events.get(event)
    callbacks?.forEach(callback => callback(data))
  }
}

// Uso
// En componente A
EventBus.on('expense:created', (expense) => {
  toast.success('Gasto creado exitosamente')
  refreshExpenseList()
})

// En componente B
EventBus.emit('expense:created', newExpense)
```

### 4. **Adapter Pattern** (para APIs externas)
```typescript
// adapters/apiAdapter.ts
interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export class BackendApiAdapter {
  // Adapta respuesta del backend a formato del frontend
  static adaptExpense(backendExpense: BackendExpense): Expense {
    return {
      id: backendExpense.expense_id,
      description: backendExpense.desc,
      amount: Number(backendExpense.total_amount),
      createdAt: new Date(backendExpense.created_ts),
      // ...transformaciones necesarias
    }
  }

  static adaptExpenseList(response: ApiResponse<BackendExpense[]>): Expense[] {
    return response.data.map(this.adaptExpense)
  }
}

// Uso en service
export class ExpenseService {
  static async getAll(): Promise<Expense[]> {
    const response = await apiClient.get<ApiResponse<BackendExpense[]>>('/expenses')
    return BackendApiAdapter.adaptExpenseList(response)
  }
}
```

---

## 🌐 URLs y Rutas de la Aplicación

```
/ → Landing page
/auth/login → Login
/auth/register → Registro
/auth/reset-password → Recuperar contraseña
/auth/verify-email/[token] → Verificación de email
/dashboard → Dashboard (protegido)
```

---

## 📦 Variables de Entorno

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## 🎨 Assets y Recursos

### Iconos de Marca
- Ubicación: `/public/icon-mv/`
- Assets disponibles:
  - `Assets MV_Elemento6.svg`
  - `Assets MV_Logo2.svg`

### Fonts
- **Geist Sans** (variable font)
- **Geist Mono** (variable font)

---

## 🔐 Gestión de Estado de Autenticación

### localStorage Keys
```typescript
'auth_token'       // Access token JWT
'refresh_token'    // Refresh token
'user_data'        // JSON.stringify(user)
```

### Auth Utilities
```typescript
// utils/api.ts
export const saveAuthToken = (token: string): void
export const getAuthToken = (): string | null
export const isAuthenticated = (): boolean
```

---

## 🚦 Status del Proyecto

### ✅ Implementado
- Landing page completa con componentes modulares
- Sistema de autenticación (login, register, reset password, verify email)
- Validación de formularios client-side
- Integración con backend API
- Sistema de diseño con Tailwind
- TypeScript configurado con strict mode

### 🚧 Por Implementar (TODOs en código)
- Social login (Google, Microsoft)
- Dashboard funcional
- Rutas protegidas con middleware
- Refresh token flow
- Logout completo
- Páginas de producto, soluciones, precios, etc.

---

## 📚 Guía de Uso del Agente

### Para agregar un nuevo formulario:
```bash
"Crea un formulario de [nombre] siguiendo el patrón de LoginForm en auth/login,
incluyendo validación, manejo de errores y tipos TypeScript"
```

### Para crear una nueva página:
```bash
"Crea la página [nombre] siguiendo la estructura de feature-based architecture,
con su propia carpeta components/, types/ y utils/"
```

### Para agregar un componente reutilizable:
```bash
"Crea un componente [nombre] usando las clases de globals.css como
.btn-gradient, .card-hover y los colores de marca purple-600/violet-600"
```

---

---

## 📚 Recursos y Referencias

### Documentación Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### Patrones y Arquitectura
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [React Patterns](https://www.patterns.dev/posts/react-patterns)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Tools & Libraries (recomendadas)
- **State Management**: Zustand, Jotai (ligeras) o TanStack Query (data fetching)
- **Form Handling**: React Hook Form + Zod
- **UI Components**: shadcn/ui, Radix UI
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Error Tracking**: Sentry
- **Analytics**: Posthog, Mixpanel

---

## 🎓 Guía Rápida de Comandos

```bash
# Desarrollo
pnpm dev              # Dev server con Turbopack
pnpm build            # Build producción
pnpm start            # Start producción
pnpm lint             # Lint con Biome
pnpm format           # Format código

# Futuros comandos (cuando se implementen tests)
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Test coverage report
```

---

## ✨ Resumen de Mejores Prácticas

### 🏆 Top 10 Reglas de Oro

1. **Separación de responsabilidades** - Un archivo, una responsabilidad
2. **TypeScript strict** - Tipar todo, evitar `any`
3. **Componentes pequeños** - Máximo 200 líneas, idealmente <100
4. **Custom hooks** - Extraer lógica reutilizable
5. **Error handling** - Siempre manejar errores gracefully
6. **Performance first** - memo, useCallback, useMemo cuando sea necesario
7. **Accesibilidad** - aria-labels, keyboard navigation, roles
8. **Seguridad** - Sanitizar inputs, validar en cliente y servidor
9. **Testing** - Preparar para tests desde el inicio
10. **Documentación** - JSDoc en funciones públicas y complejas

### 🚨 Anti-Patrones a Evitar

1. ❌ Props drilling excesivo (usar context/store)
2. ❌ Lógica de negocio en componentes UI
3. ❌ Mutaciones directas de estado
4. ❌ Fetch directo en componentes (usar hooks/services)
5. ❌ Hardcodear valores (usar constants)
6. ❌ Componentes God (>500 líneas)
7. ❌ useEffect sin cleanup
8. ❌ Ignorar warnings de TypeScript
9. ❌ Copy-paste código (DRY)
10. ❌ CSS inline para estilos complejos

---

**Última actualización**: Enero 2025
**Branch actual**: login-register-forgot-reset-verified
**Versión Next.js**: 15.5.2
**Versión React**: 19.1.0

---

**💡 Este agente contiene:**
- ✅ Arquitectura feature-based actual del proyecto
- ✅ 10 patrones de código documentados
- ✅ 10 mejores prácticas avanzadas (world-class)
- ✅ Principios SOLID aplicados a React/Next.js
- ✅ 4 patrones de diseño implementables
- ✅ Estructura modular escalable
- ✅ Custom hooks reutilizables
- ✅ Sistema de diseño componentizado
- ✅ Manejo de errores y logging
- ✅ Performance y optimización
- ✅ Accesibilidad (a11y)
- ✅ Seguridad y sanitización
- ✅ Checklist completo para nuevas features

**🎯 Úsalo como referencia para mantener código de calidad enterprise-level.**
