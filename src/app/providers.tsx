"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,   // 5 menit — server cache handle refresh
          gcTime: 10 * 60 * 1000,     // 10 menit tetap di memory
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          retry: 1,
        },
      },
    })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}