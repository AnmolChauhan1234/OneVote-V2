"use client";

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useBiometricEnroll } from "../hooks/biometric.hooks";

import { biometricEnrollSchema ,BiometricEnrollFormData } from "../schemas/biometric.schema";

import { CameraCapture } from "./CameraCapture"

export function BiometricEnrollForm({ userId }: { userId: string }) {

  const { mutate: enroll, isPending, isSuccess } = useBiometricEnroll()

  const form = useForm<BiometricEnrollFormData>({
    resolver: zodResolver(biometricEnrollSchema),
    defaultValues: { user_id: userId },
  })

  const imageValue = useWatch({ control: form.control, name: "image" })

  const onSubmit = (data: BiometricEnrollFormData) => {
    enroll(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* Camera captures the File and injects it into the form */}
      <CameraCapture
        onCapture={(file) => form.setValue("image", file, { shouldValidate: true })}
      />

      {/* Show validation error if submitted without capturing */}
      {form.formState.errors.image && (
        <p className="text-red-500 text-sm">
          {form.formState.errors.image.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !imageValue}  // disable until photo captured
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isPending ? "Enrolling..." : "Enroll Biometric"}
      </button>

      {isSuccess && (
        <p className="text-green-500 text-sm">Biometric enrolled successfully</p>
      )}

    </form>
  )
}