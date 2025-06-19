export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || null;
};

export const setAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;

  // Set access token cookie
  const cookieValue = `accessToken=${token}; path=/; secure; samesite=lax; max-age=3600`;
  document.cookie = cookieValue;

  // Extract and set user role from token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
      const roleCookie = `user-role=${payload.roles[0]}; path=/; secure; samesite=lax; max-age=3600`;
      document.cookie = roleCookie;
    }
  } catch {
    // Silently handle error
  }
};

export const removeAccessToken = (): void => {
  if (typeof window === "undefined") return;
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const isTokenExpired = (): boolean => {
  if (typeof window === "undefined") return true;

  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const getTokenExpiryTime = (): number | null => {
  if (typeof window === "undefined") return null;

  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};
