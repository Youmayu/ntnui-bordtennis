const UNSAFE_TEXT_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u061C\u200B\u200E\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/gu;
const INLINE_WHITESPACE = /[^\S\r\n]+/gu;
const DASH_VARIANTS = /[\u2010-\u2015\u2212]/gu;
const APOSTROPHE_VARIANTS = /[\u2018\u2019\u02BC\u02BB\u02B9\uFF07`\u00B4]/gu;
const NAME_ALLOWED_CHARS = /^[\p{L}\p{M} .'\-\u00B7]+$/u;

export const ALLOWED_LEVEL_VALUES = ["Nybegynner", "Viderekommen", "Erfaren"] as const;

const ALLOWED_LEVEL_SET = new Set<string>(ALLOWED_LEVEL_VALUES);

function stripUnsafeTextChars(value: string) {
  return value.normalize("NFC").replace(UNSAFE_TEXT_CHARS, "");
}

export function normalizeSingleLineDisplay(value: string) {
  return stripUnsafeTextChars(value)
    .replace(/\r\n?/g, " ")
    .replace(/\n/g, " ")
    .replace(INLINE_WHITESPACE, " ")
    .trim();
}

export function normalizeMultilineDisplay(value: string) {
  return stripUnsafeTextChars(value)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(INLINE_WHITESPACE, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeMemberName(value: string) {
  const normalized = normalizeSingleLineDisplay(value)
    .replace(DASH_VARIANTS, "-")
    .replace(APOSTROPHE_VARIANTS, "'");

  if (normalized.length < 2 || normalized.length > 80) {
    return null;
  }

  if (!/\p{L}/u.test(normalized)) {
    return null;
  }

  if (!NAME_ALLOWED_CHARS.test(normalized)) {
    return null;
  }

  return normalized;
}

export function sanitizeLevel(value: string) {
  const normalized = normalizeSingleLineDisplay(value);
  return ALLOWED_LEVEL_SET.has(normalized) ? normalized : null;
}

export function sanitizeAnnouncementTitle(value: string) {
  const normalized = normalizeSingleLineDisplay(value);
  return normalized.length >= 3 && normalized.length <= 140 ? normalized : null;
}

export function sanitizeAnnouncementBody(value: string) {
  const normalized = normalizeMultilineDisplay(value);
  return normalized.length >= 3 && normalized.length <= 2000 ? normalized : null;
}

export function sanitizeLocation(value: string) {
  const normalized = normalizeSingleLineDisplay(value);
  return normalized.length >= 3 && normalized.length <= 120 ? normalized : null;
}
