export type FieldErrors = Record<string, string[]>;

export type FormState =
  | { success: true }
  | { success: false; error: string | FieldErrors }
  | null;

export function getFieldError(
  state: { success?: boolean; error?: string | FieldErrors } | null,
  field: string
): string | undefined {
  if (!state?.error || typeof state.error === "string") return undefined;
  return state.error[field]?.[0];
}

export function getStringError(
  state: { success?: boolean; error?: string | FieldErrors } | null
): string | undefined {
  if (!state?.error || typeof state.error !== "string") return undefined;
  return state.error;
}
