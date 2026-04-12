import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppError } from "@/lib/errors/AppError";

type ApiMutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  AppError,
  TVariables
> & {
  showSuccessToast?: boolean;
};

export function useApiMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: ApiMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, AppError, TVariables>({
    mutationFn,

    onSuccess: (data, variables, context, mutation) => {
      //success toast
      if (
        options?.showSuccessToast !== false &&
        typeof data === "object" &&
        data !== null &&
        "message" in data
      ) {
        toast.success((data as { message: string }).message);
      }

      options?.onSuccess?.(data, variables, context, mutation);
    },

    onError: (error, variables, context, mutation) => {
      //DON'T toast here (already handled globally)
      options?.onError?.(error, variables, context, mutation);
    },

    ...options,
  });
}
