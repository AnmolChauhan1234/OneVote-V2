"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";

import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useVerifyIdentity } from "../hooks/identity.hooks";
import {
  IdentityCreateFormData,
  identityCreateSchema,
} from "../schemas/identity.schema";

export default function IdentityForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const { mutate: verifyIdentity, isPending } = useVerifyIdentity();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IdentityCreateFormData>({
    resolver: zodResolver(identityCreateSchema),
    defaultValues: {
      user_id: userId,
    },
  });

  const onSubmit = (data: IdentityCreateFormData) => {
    verifyIdentity(data, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-sm"
    >
      <div className="space-y-4">
        <Input
          {...register("aadhar_id")}
          label="Aadhaar Number"
          placeholder="Enter your 12-digit Aadhaar number"
          icon={<CreditCard size={16} />}
          variant="light"
          error={errors.aadhar_id?.message}
        />
      </div>

      <PrimaryButton type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Verifying..." : "Verify Identity"}
      </PrimaryButton>
    </form>
  );
}
