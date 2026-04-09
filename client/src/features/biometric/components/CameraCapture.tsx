// src/features/biometric/components/CameraCapture.tsx
"use client"
import { useRef, useState, useCallback } from "react"
import Image from "next/image";

import { CameraProps } from "../types/types";

export function CameraCapture({ onCapture }: CameraProps) {
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)  // preview URL
  const [error, setError] = useState<string | null>(null)

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",   // front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraOn(true)
        setError(null)
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.")
    }
  }, [])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraOn(false)
  }, [])

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mirror the image (front camera is mirrored by default)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    // Convert canvas to File
    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], "biometric-capture.jpg", {
        type: "image/jpeg",
      })

      const previewUrl = URL.createObjectURL(blob)
      setCapturedImage(previewUrl)

      onCapture(file)   // pass File up to the form
      stopCamera()      // stop stream after capture
    }, "image/jpeg", 0.95)
  }, [onCapture, stopCamera])

  // Retake — clear capture and restart camera
  const retake = useCallback(() => {
    if (capturedImage) URL.revokeObjectURL(capturedImage)  // cleanup memory
    setCapturedImage(null)
    startCamera()
  }, [capturedImage, startCamera])

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Camera not started */}
      {!isCameraOn && !capturedImage && (
        <button
          type="button"
          onClick={startCamera}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Open Camera
        </button>
      )}

      {/* Live video feed */}
      {isCameraOn && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="rounded-lg w-80 h-60 object-cover scale-x-[-1]"  // mirror for natural feel
          />
          <button
            type="button"
            onClick={capturePhoto}
            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Capture Photo
          </button>
        </div>
      )}

      {/* Captured preview */}
      {capturedImage && (
        <div className="flex flex-col items-center gap-3">
          <Image
            src={capturedImage}
            alt="Captured"
            width={320}
            height={240}
            unoptimized
            className="rounded-lg w-80 h-60 object-cover"
          />
          <button
            type="button"
            onClick={retake}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Retake
          </button>
        </div>
      )}

      {/* Hidden canvas — used for frame capture only */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}