let adminToken: string | null = null;

export function getAdminToken() {
  return adminToken;
}

export function setAdminToken(token: string | null) {
  adminToken = token;
}

export function fetchWithAdminAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers);
  if (adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }
  return fetch(input, { ...init, headers });
}
