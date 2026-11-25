const shanghaiDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Shanghai",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shanghaiDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Shanghai",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return shanghaiDate.format(new Date(`${value}T00:00:00+08:00`));
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return shanghaiDate.format(date);
}

export function formatWhen(value: unknown) {
  if (value == null || value === "") return "—";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return `${shanghaiDateTime.format(date)} Shanghai`;
}

export function formatMoney(value: unknown) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}
