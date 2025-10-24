/**
 * Cookie utility functions for client-side cookie management
 */

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Set expiration
  if (options.expires) {
    const expires = options.expires instanceof Date
      ? options.expires
      : new Date(Date.now() + options.expires * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  // Set path (default to '/')
  cookieString += `; path=${options.path || '/'}`;

  // Set domain
  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  // Set secure flag (default to true in production)
  if (options.secure !== false) {
    cookieString += '; secure';
  }

  // Set sameSite (default to 'Lax')
  cookieString += `; sameSite=${options.sameSite || 'Lax'}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, options: CookieOptions = {}): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}
