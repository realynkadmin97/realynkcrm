export function configuredEmailDomain() {
  const raw = process.env.REALYNK_EMAIL_DOMAIN?.trim().toLowerCase() ?? "";
  if (!raw) return null;
  return raw.startsWith("@") ? raw.slice(1) : raw;
}

export function bootstrapAdmin() {
  const email = process.env.REALYNK_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const name = process.env.REALYNK_BOOTSTRAP_ADMIN_NAME?.trim() ?? "";
  const password = process.env.REALYNK_BOOTSTRAP_ADMIN_PASSWORD ?? "";
  if (!email || !name || !password) return null;
  return { email, name, password };
}

/** Hostnames that may serve the CRM. Empty means any host (local default). */
export function allowedHosts(): string[] | null {
  const raw = process.env.REALYNK_ALLOWED_HOSTS?.trim().toLowerCase() ?? "";
  if (!raw) return null;
  const hosts = raw
    .split(",")
    .map((part) => part.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, ""))
    .filter(Boolean);
  return hosts.length ? hosts : null;
}

export function hostIsAllowed(hostHeader: string | null): boolean {
  const allowed = allowedHosts();
  if (!allowed) return true;
  const host = (hostHeader ?? "").split(":")[0]?.trim().toLowerCase() ?? "";
  if (!host) return false;
  return allowed.includes(host);
}
