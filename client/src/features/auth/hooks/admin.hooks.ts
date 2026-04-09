"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/instances/queryClient";
import { AppError } from "@/lib/errors/AppError";

import {
  createAdmin,
  listAllAdims,
  getAllUsers,
  blockUser,
  suspendUser,
  deleteUser,
} from "../services/admin.service";

import { AdminCreateFormData } from "../schemas/admin.schema";
import {
  BlockUserResponse,
  CreateAdminResponse,
  ListAllAdminResponse,
  ListAllUserAdminResponse,
  SuspendUserResponse,
  DeleteUserResponse,
} from "../types/types";

import { queryKeys } from "@/constants/queryKeys";

export function useCreateAdmin() {
  return useMutation<CreateAdminResponse, AppError, AdminCreateFormData>({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins });
    },
  });
}

export function useAdmins() {
  return useQuery<ListAllAdminResponse, AppError, void>({
    queryKey: queryKeys.admin.admins,
    queryFn: listAllAdims,
  });
}

export function useAllUsers() {
  return useQuery<ListAllUserAdminResponse, AppError, void>({
    queryKey: queryKeys.admin.users,
    queryFn: getAllUsers,
  });
}

export function useBlockUser() {
  return useMutation<BlockUserResponse, AppError, string>({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useSuspendUser() {
  return useMutation<SuspendUserResponse, AppError, string>({
    mutationFn: suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useDeleteUser() {
  return useMutation<DeleteUserResponse, AppError, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}
