"use client";
import { useRef, useState, useCallback } from "react";
import Image from "next/image";

import { CameraProps } from "../types/types";

export function CameraCapture({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setError(null);
      } else {
        stream.getTracks().forEach((t) => t.stop());
        setError("Camera could not initialize. Please try again.");
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOn(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], "biometric-capture.jpg", {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage(previewUrl);

        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.95,
    );
  }, [onCapture, stopCamera]);

  const retake = useCallback(() => {
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    setCapturedImage(null);
    startCamera();
  }, [capturedImage, startCamera]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Error */}
      {error && (
        <p className="text-red-500 text-[11px] uppercase tracking-wider">
          {error}
        </p>
      )}

      {/* Open Camera button — only when idle */}
      {!isCameraOn && !capturedImage && (
        <button
          type="button"
          onClick={startCamera}
          className="px-4 py-2 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition"
        >
          Open Camera
        </button>
      )}

      {/* Video — always in DOM so ref is available, hidden when not active */}
      <div className={isCameraOn ? "block w-full" : "hidden"}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-none w-80 h-60 object-cover scale-x-[-1]"
        />
        <button
          type="button"
          onClick={capturePhoto}
          className="mt-3 w-full px-4 py-2 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition"
        >
          Capture Photo
        </button>
      </div>

      {/* Captured preview */}
      {capturedImage && (
        <div className="flex flex-col items-center gap-3 w-full">
          <Image
            src={capturedImage}
            alt="Captured"
            width={320}
            height={240}
            unoptimized
            className="w-80 h-60 object-cover"
          />
          <button
            type="button"
            onClick={retake}
            className="px-4 py-2 text-[11px] uppercase tracking-[0.2em] border border-black text-black hover:bg-black hover:text-white transition"
          >
            Retake
          </button>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
