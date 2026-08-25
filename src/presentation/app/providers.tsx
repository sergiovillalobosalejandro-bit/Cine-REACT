import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorState } from "../components/error-state.js";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ErrorBoundary
      FallbackComponent={({ resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
          <ErrorState onRetry={resetErrorBoundary} />
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ErrorBoundary>
  );
}
