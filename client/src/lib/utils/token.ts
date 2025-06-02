const TOKEN_KEY = "accessToken";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isTokenExpired = (): boolean => {
  if (typeof window === "undefined") return true;

  const expiry = localStorage.getItem("tokenExpiry");
  if (!expiry) return true;

  const expiryTime = parseInt(expiry, 10) * 1000; // Convert to milliseconds
  return Date.now() >= expiryTime;
};

export const getTokenExpiryTime = (): number | null => {
  if (typeof window === "undefined") return null;

  const expiry = localStorage.getItem("tokenExpiry");
  return expiry ? parseInt(expiry, 10) * 1000 : null;
};
