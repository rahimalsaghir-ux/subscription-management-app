import type { ClerkErrorLike } from "@/types/auth";

export function getErrorMessage(error: unknown): string {
  const e = error as ClerkErrorLike | null;
  return (
    e?.longMessage ?? e?.message ?? "Something went wrong. Please try again."
  );
}
