import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // disable retry (axios handles retry via refresh)
      staleTime: 30_000,
      refetchOnWindowFocus: false, // avoid random refetch
      refetchOnReconnect: true, // good for network recovery
    },
    mutations: {
      retry: false,
    },
  },
});