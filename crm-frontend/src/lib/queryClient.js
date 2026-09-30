import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => error.status !== 401 && error.status !== 403 && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
});
