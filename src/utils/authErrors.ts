import { ConvexError } from "convex/values";

/** Приводить помилку Convex Auth до зрозумілого повідомлення українською. */
export function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError && typeof err.data === "string") {
    return err.data;
  }
  const raw = err instanceof Error ? err.message : "";
  if (/InvalidAccountId|InvalidSecret/i.test(raw)) {
    return "Невірний email або пароль";
  }
  if (/already exists|AccountAlreadyExists/i.test(raw)) {
    return "Користувач з таким email вже існує";
  }
  if (/Invalid password/i.test(raw)) {
    return "Пароль має містити мінімум 8 символів";
  }
  return fallback;
}
