# Security Improvements Guide

This document outlines the critical security improvements needed for the SRI Inventarios application, based on the production readiness assessment.

## 🔴 Critical Priority (Immediate Action Required)

### 1. Migrate from localStorage to httpOnly Cookies (CRITICAL)

**Current Vulnerability:**
```typescript
// ❌ CRITICAL XSS VULNERABILITY
// Location: services/authService.ts:212-214
localStorage.setItem('access_token', tokens.access_token);
localStorage.setItem('refresh_token', tokens.refresh_token);
```

**Impact:**
- XSS attacks can steal tokens from localStorage
- Tokens exposed to all JavaScript code
- No httpOnly protection

**Required Changes:**

#### Backend Changes (sri-backend):

1. **Update Authentication Response Headers**
   ```go
   // internal/http/handlers/auth_handler.go
   func (h *AuthHandler) Login(c *fiber.Ctx) error {
       // ... authentication logic ...

       // Set httpOnly cookies in response
       c.Cookie(&fiber.Cookie{
           Name:     "access_token",
           Value:    accessToken,
           Path:     "/",
           HTTPOnly: true,
           Secure:   true, // Only in production
           SameSite: "Strict",
           MaxAge:   3600, // 1 hour
       })

       c.Cookie(&fiber.Cookie{
           Name:     "refresh_token",
           Value:    refreshToken,
           Path:     "/",
           HTTPOnly: true,
           Secure:   true,
           SameSite: "Strict",
           MaxAge:   604800, // 7 days
       })

       // DO NOT return tokens in response body for storage
       return c.JSON(fiber.Map{
           "success": true,
           "data": fiber.Map{
               "user": user,
               // Remove: "access_token": accessToken,
               // Remove: "refresh_token": refreshToken,
           },
       })
   }
   ```

2. **Update CORS Configuration**
   ```go
   // Allow credentials (cookies) in CORS
   app.Use(cors.New(cors.Config{
       AllowOrigins:     "http://localhost:3000,https://yourdomain.com",
       AllowCredentials: true,
       AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
   }))
   ```

3. **Update Middleware to Read from Cookies**
   ```go
   // internal/http/middleware/auth_middleware.go
   func AuthMiddleware() fiber.Handler {
       return func(c *fiber.Ctx) error {
           // Read token from cookie instead of Authorization header
           token := c.Cookies("access_token")

           if token == "" {
               // Fallback to Authorization header for API clients
               token = extractTokenFromHeader(c)
           }

           // ... validation logic ...
       }
   }
   ```

#### Frontend Changes (sri-frontend):

1. **Update API Client Configuration**
   ```typescript
   // lib/api/client.ts
   const apiClient = axios.create({
       baseURL: process.env.NEXT_PUBLIC_API_URL,
       headers: {
           'Content-Type': 'application/json',
       },
       withCredentials: true, // ✅ Send httpOnly cookies automatically
   });

   // Remove Authorization header interceptor
   // Cookies will be sent automatically
   ```

2. **Update AuthService**
   ```typescript
   // services/authService.ts
   export class AuthService {
       static async login(credentials: LoginCredentials) {
           const response = await apiClient.post(
               API_ENDPOINTS.AUTH.LOGIN,
               credentials
           );

           // Backend sets httpOnly cookies automatically
           // Only store user info (not tokens)
           const { user } = response.data.data;
           this.setUser(user);

           return { user };
       }

       // Remove all localStorage token operations
       // Remove: getAccessToken()
       // Remove: getRefreshToken()
       // Remove: setTokens()

       // Keep only user info methods
       static getCurrentUser(): AuthUser | null {
           const userStr = localStorage.getItem('user');
           return userStr ? JSON.parse(userStr) : null;
       }

       static isAuthenticated(): boolean {
           // Check if user exists (backend validates cookie)
           return !!this.getCurrentUser();
       }
   }
   ```

3. **Update Middleware**
   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
       // Cookies are automatically included in requests
       // Backend validates the httpOnly cookie

       const response = await fetch(`${API_URL}/auth/verify`, {
           credentials: 'include', // Include cookies
       });

       if (!response.ok) {
           return NextResponse.redirect(new URL('/login', request.url));
       }

       return NextResponse.next();
   }
   ```

**Testing Checklist:**
- [ ] Login flow works with httpOnly cookies
- [ ] Tokens not visible in localStorage/sessionStorage
- [ ] Cookies have httpOnly, Secure, SameSite flags
- [ ] API requests include cookies automatically
- [ ] Refresh token flow works with cookies
- [ ] Logout clears cookies on backend
- [ ] XSS cannot access tokens

---

### 2. Implement CSRF Protection

**Current Vulnerability:**
- No CSRF token implementation
- Cookies use SameSite=Lax (not Strict)

**Required Implementation:**

#### Backend:

```go
// internal/http/middleware/csrf_middleware.go
package middleware

import (
    "crypto/rand"
    "encoding/base64"
    "github.com/gofiber/fiber/v2"
)

func CSRFMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        // GET, HEAD, OPTIONS requests don't need CSRF validation
        if c.Method() == "GET" || c.Method() == "HEAD" || c.Method() == "OPTIONS" {
            // Generate new token for GET requests
            token := generateCSRFToken()

            // Set CSRF token in cookie
            c.Cookie(&fiber.Cookie{
                Name:     "csrf_token",
                Value:    token,
                Path:     "/",
                HTTPOnly: false, // Must be accessible to JavaScript
                Secure:   true,
                SameSite: "Strict",
                MaxAge:   3600,
            })

            // Also return in header for SPA
            c.Set("X-CSRF-Token", token)
            return c.Next()
        }

        // POST, PUT, DELETE, PATCH require CSRF validation
        cookieToken := c.Cookies("csrf_token")
        headerToken := c.Get("X-CSRF-Token")

        if cookieToken == "" || headerToken == "" || cookieToken != headerToken {
            return c.Status(403).JSON(fiber.Map{
                "error": "Invalid CSRF token",
            })
        }

        return c.Next()
    }
}

func generateCSRFToken() string {
    b := make([]byte, 32)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}
```

#### Frontend:

```typescript
// lib/api/client.ts
import { getCookie } from '@/lib/utils/cookies';

// Add CSRF token to all non-GET requests
apiClient.interceptors.request.use((config) => {
    // Add CSRF token for state-changing requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const csrfToken = getCookie('csrf_token');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }

    return config;
});
```

**Testing Checklist:**
- [ ] CSRF token generated on GET requests
- [ ] CSRF token required for POST/PUT/DELETE
- [ ] Requests without valid CSRF token are rejected
- [ ] CSRF token rotates on each request
- [ ] Cross-origin requests blocked

---

### 3. Rate Limiting Implementation

**Current State:**
- Rate limiting configured but NOT implemented
- No protection against brute force attacks

**Backend Implementation:**

```go
// internal/http/middleware/rate_limit_middleware.go
package middleware

import (
    "time"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/limiter"
)

func RateLimitMiddleware() fiber.Handler {
    return limiter.New(limiter.Config{
        Max:               100,                     // Max requests
        Expiration:        1 * time.Minute,         // Per minute
        LimiterMiddleware: limiter.SlidingWindow{}, // Sliding window algorithm
        KeyGenerator: func(c *fiber.Ctx) string {
            // Rate limit by IP + User ID
            userID := c.Locals("user_id")
            if userID != nil {
                return c.IP() + "_" + userID.(string)
            }
            return c.IP()
        },
        LimitReached: func(c *fiber.Ctx) error {
            return c.Status(429).JSON(fiber.Map{
                "error": "Too many requests",
                "retry_after": 60,
            })
        },
    })
}

// Stricter rate limiting for authentication endpoints
func AuthRateLimitMiddleware() fiber.Handler {
    return limiter.New(limiter.Config{
        Max:        5,                  // Max 5 attempts
        Expiration: 15 * time.Minute,   // Per 15 minutes
        KeyGenerator: func(c *fiber.Ctx) string {
            return c.IP()
        },
        LimitReached: func(c *fiber.Ctx) error {
            return c.Status(429).JSON(fiber.Map{
                "error": "Too many login attempts. Please try again in 15 minutes.",
                "retry_after": 900,
            })
        },
    })
}
```

**Apply to Routes:**

```go
// cmd/api/main.go
// Apply stricter rate limit to auth routes
authRoutes := api.Group("/auth")
authRoutes.Post("/login", middleware.AuthRateLimitMiddleware(), authHandler.Login)
authRoutes.Post("/register", middleware.AuthRateLimitMiddleware(), authHandler.Register)

// Apply general rate limit to all API routes
api.Use(middleware.RateLimitMiddleware())
```

---

### 4. Security Headers (✅ Implemented)

Security headers have been added to `next.config.ts`:

✅ X-XSS-Protection
✅ X-Frame-Options (SAMEORIGIN)
✅ X-Content-Type-Options (nosniff)
✅ Referrer-Policy
✅ Permissions-Policy
✅ Content-Security-Policy (CSP)
✅ Strict-Transport-Security (HSTS - production only)
✅ Disabled X-Powered-By header

**Remaining CSP Work:**
- Remove 'unsafe-inline' for scripts
- Remove 'unsafe-eval'
- Implement nonce or hash-based CSP
- Add report-uri for CSP violations

---

## 🟡 High Priority

### 5. Input Validation & Sanitization

**Backend:**
- Implement strict input validation on all endpoints
- Use prepared statements (already done with GORM)
- Sanitize user inputs before database operations
- Validate file uploads (size, type, content)

**Frontend:**
- Implement DOMPurify for HTML sanitization
- Validate all form inputs with Zod
- Escape user-generated content before rendering

### 6. Error Handling

**Backend:**
- Don't expose stack traces in production
- Log errors securely (no sensitive data)
- Return generic error messages to clients

**Frontend:**
- Implement global error boundary
- Don't expose internal errors to users
- Log errors to monitoring service (Sentry)

### 7. Dependency Security

```bash
# Run security audits regularly
npm audit
go list -json -m all | nancy sleuth

# Update dependencies
npm update
go get -u ./...
```

---

## 🟢 Medium Priority

### 8. Session Management

- Implement session timeout (30 minutes)
- Implement token rotation on refresh
- Blacklist tokens on logout
- Detect concurrent sessions
- Implement "Remember Me" securely

### 9. API Security

- Add API versioning
- Implement request signing for sensitive operations
- Add webhook signature verification
- Implement API key rotation

### 10. Audit Logging

- Log all authentication events
- Log all data modifications
- Log access to sensitive resources
- Include: user, IP, timestamp, action, result

---

## Implementation Timeline

### Week 1: Critical Fixes
- [ ] Implement httpOnly cookies (backend + frontend)
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Test security changes

### Week 2: High Priority
- [ ] Input validation improvements
- [ ] Error handling improvements
- [ ] Security audit of dependencies
- [ ] CSP improvements (remove unsafe-inline)

### Week 3: Medium Priority
- [ ] Session management improvements
- [ ] API security enhancements
- [ ] Audit logging implementation
- [ ] Penetration testing

### Week 4: Testing & Documentation
- [ ] Security testing (OWASP Top 10)
- [ ] Document security practices
- [ ] Train team on security
- [ ] Set up security monitoring

---

## Security Testing Checklist

### Authentication & Authorization
- [ ] SQL injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Session fixation testing
- [ ] Privilege escalation testing
- [ ] Brute force testing
- [ ] Token expiration testing

### API Security
- [ ] Rate limiting testing
- [ ] Input validation testing
- [ ] File upload testing
- [ ] API abuse testing

### Infrastructure
- [ ] HTTPS enforcement
- [ ] Cookie flags validation
- [ ] CORS configuration testing
- [ ] Security headers validation

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Go Security Best Practices](https://github.com/guardrailsio/awesome-golang-security)

---

## Questions or Issues?

If you encounter any issues while implementing these security improvements, please:
1. Review the OWASP guidelines
2. Test thoroughly in development
3. Document any deviations from this plan
4. Update this document as needed

**Remember:** Security is not a one-time task. Regular audits and updates are essential.
