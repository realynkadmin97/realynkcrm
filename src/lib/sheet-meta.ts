export type CleanerMeta = {
  prompts: Record<string, string>;
  frozen: string[];
};

export function emptyMeta(): CleanerMeta {
  return { prompts: {}, frozen: [] };
}

export function readMeta(value: unknown, headers: string[]): CleanerMeta {
  if (!value || typeof value !== "object") return emptyMeta();
  const raw = value as { prompts?: unknown; frozen?: unknown };
  const prompts: Record<string, string> = {};
  if (raw.prompts && typeof raw.prompts === "object") {
    for (const [key, prompt] of Object.entries(raw.prompts)) {
      if (!headers.includes(key) || typeof prompt !== "string") continue;
      const text = prompt.trim().slice(0, 4000);
      if (text) prompts[key] = text;
    }
  }
  const frozen = Array.isArray(raw.frozen)
    ? raw.frozen.filter((item): item is string => typeof item === "string" && headers.includes(item)).slice(0, 12)
    : [];
  return { prompts, frozen };
}
