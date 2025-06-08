"use client";

import { CVErrorFallback } from "@/components/ErrorBoundary";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <CVErrorFallback
      error={error}
      resetErrorBoundary={reset}
      operation="editing"
    />
  );
}
