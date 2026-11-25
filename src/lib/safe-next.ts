const SAFE_PATH = /^\/(?!\/)[A-Za-z0-9/_-]{0,200}$/;

export function safeNext(value: string | null | undefined) {
  if (!value || !SAFE_PATH.test(value)) return "/";
  if (value.startsWith("/login") || value.startsWith("/verify") || value.startsWith("/session")) return "/";
  return value;
}
