"use client";

import { CVErrorFallback } from "@/components/ErrorBoundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <CVErrorFallback error={error} resetError={reset} />;
}
