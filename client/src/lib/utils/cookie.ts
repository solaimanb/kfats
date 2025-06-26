interface CookieOptions {
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
  domain?: string;
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const {
    secure = true,
    sameSite = "strict",
    maxAge = 24 * 60 * 60, // 24 hours by default
    path = "/",
    domain,
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  cookie += `; Max-Age=${maxAge}`;
  cookie += `; Path=${path}`;
  if (secure) cookie += "; Secure";
  cookie += `; SameSite=${sameSite}`;
  if (domain) cookie += `; Domain=${domain}`;

  document.cookie = cookie;
}

export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

export function deleteCookie(name: string, path = "/", domain?: string) {
  setCookie(name, "", {
    maxAge: -1,
    path,
    domain,
    secure: true,
    sameSite: "strict",
  });
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
