import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { AppError } from "@/lib/errors/AppError";

export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, AppError>, "queryKey" | "queryFn">
) {
  return useQuery<TData, AppError>({
    queryKey,
    queryFn,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}