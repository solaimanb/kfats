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

export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
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
