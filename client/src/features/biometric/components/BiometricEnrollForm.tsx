"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CameraCapture } from "./CameraCapture";
import { useBiometricEnroll } from "../hooks/biometric.hooks";
import {
  biometricEnrollSchema,
  BiometricEnrollFormData,
} from "../schemas/biometric.schema";

export function BiometricEnrollForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useBiometricEnroll();

  const form = useForm<BiometricEnrollFormData>({
    resolver: zodResolver(biometricEnrollSchema),
    defaultValues: {
      user_id: userId,
    },
  });

  const image = useWatch({
    control: form.control,
    name: "image",
  });

  const onSubmit = (data: BiometricEnrollFormData) => {
    mutate(data, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-sm"
    >
      <div className="space-y-4">
        <CameraCapture
          onCapture={(file) =>
            form.setValue("image", file, { shouldValidate: true })
          }
        />

        {form.formState.errors.image && (
          <p className="text-red-500 text-[11px] uppercase tracking-wider">
            {form.formState.errors.image.message}
          </p>
        )}
      </div>

      <PrimaryButton
        type="submit"
        className="w-full mt-2"
        disabled={isPending || !image}
      >
        {isPending ? "Enrolling..." : "Enroll Biometric"}
      </PrimaryButton>
    </form>
  );
}
