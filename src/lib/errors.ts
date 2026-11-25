const MESSAGES: Record<string, string> = {
  "CRM:domain_rejected": "That email is outside the configured company domain, or it is not a valid address.",
  "CRM:not_allowed": "That account is not allowed to do this.",
  "CRM:sample_mode": "Invites stay closed until the company email domain is configured.",
  "CRM:duplicate_email": "That email already has an account.",
  "CRM:invalid_token": "This verification link is invalid or has expired.",
  "CRM:last_admin": "The workspace needs at least one active admin.",
  "CRM:invalid_role": "Choose Admin, Sales, or Manager.",
  "CRM:invalid_name": "Enter the person's name.",
  "CRM:weak_password": "Use at least 10 characters.",
  "CRM:invalid_domain": "The configured company email domain is not valid.",
  "CRM:bootstrap_domain": "The bootstrap admin email does not match the configured company domain.",
  "CRM:forbidden": "You do not have permission to do that.",
  "CRM:sheet_too_large": "That sheet is too large. Keep it to 500 rows and 40 columns.",
  "CRM:duplicate_column": "Two columns would share the same name. Skip one or keep it as an extra column.",
  "CRM:busy": "The cleaner is busy. Wait a minute and try again.",
};

export function crmError(error: unknown, fallback = "That change could not be saved.") {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const code = message.match(/CRM:[a-z0-9_]+/)?.[0];
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (/row-level security/i.test(message) || /permission denied/i.test(message)) return MESSAGES["CRM:forbidden"];
  return fallback;
}
