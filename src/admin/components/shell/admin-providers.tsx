"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ConfirmProvider } from "@/admin/components/cms/confirm-dialog";
import { Toaster } from "@/admin/components/ui/sonner";
import { TooltipProvider } from "@/admin/components/ui/tooltip";
import { usePreferencesSync } from "@/admin/lib/preferences";

/** Client providers for the whole admin: data cache, tooltips, toasts, theme sync. */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  usePreferencesSync();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ConfirmProvider>{children}</ConfirmProvider>
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
