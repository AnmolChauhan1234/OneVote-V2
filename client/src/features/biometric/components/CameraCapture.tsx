// "use client";
// import { useRef, useState, useCallback } from "react";
// import Image from "next/image";

// import { CameraProps } from "../types/types";
// import { PrimaryButton } from "@/components/buttons/PrimaryButton";
// import { CameraIcon } from "lucide-react";

// export function CameraCapture({ onCapture }: CameraProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const startCamera = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: false,
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         streamRef.current = stream;
//         setIsCameraOn(true);
//         setError(null);
//       } else {
//         stream.getTracks().forEach((t) => t.stop());
//         setError("Camera could not initialize. Please try again.");
//       }
//     } catch (err) {
//       setError("Camera access denied. Please allow camera permissions.");
//     }
//   }, []);

//   const stopCamera = useCallback(() => {
//     streamRef.current?.getTracks().forEach((track) => track.stop());
//     streamRef.current = null;
//     setIsCameraOn(false);
//   }, []);

//   const capturePhoto = useCallback(() => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     ctx.translate(canvas.width, 0);
//     ctx.scale(-1, 1);
//     ctx.drawImage(video, 0, 0);

//     canvas.toBlob(
//       (blob) => {
//         if (!blob) return;

//         const file = new File([blob], "biometric-capture.jpg", {
//           type: "image/jpeg",
//         });

//         const previewUrl = URL.createObjectURL(blob);
//         setCapturedImage(previewUrl);

//         onCapture(file);
//         stopCamera();
//       },
//       "image/jpeg",
//       0.95,
//     );
//   }, [onCapture, stopCamera]);

//   const retake = useCallback(() => {
//     if (capturedImage) URL.revokeObjectURL(capturedImage);
//     setCapturedImage(null);
//     startCamera();
//   }, [capturedImage, startCamera]);

//   return (
//     <div className="flex flex-col items-center gap-4">
//       {/* Error */}
//       {error && (
//         <p className="text-red-500 text-[11px] uppercase tracking-wider">
//           {error}
//         </p>
//       )}

//       {/* Open Camera button — only when idle */}
//       {!isCameraOn && !capturedImage && (
//         <PrimaryButton
//           type="button"
//           onClick={startCamera}
//           className="px-4 py-2 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition"
//           startIcon={<CameraIcon />}
//         >
//           Open Camera
//         </PrimaryButton>
//       )}

//       {/* Video — always in DOM so ref is available, hidden when not active */}
//       <div className={isCameraOn ? "block w-full" : "hidden"}>
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="rounded-none w-80 h-60 object-cover scale-x-[-1]"
//         />
//         <PrimaryButton
//           type="button"
//           onClick={capturePhoto}
//           className="mt-3 w-full px-4 py-2 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition"
//           startIcon={<CameraIcon />}
//         >
//           Capture Photo
//         </PrimaryButton>
//       </div>

//       {/* Captured preview */}
//       {capturedImage && (
//         <div className="flex flex-col items-center gap-3 w-full">
//           <Image
//             src={capturedImage}
//             alt="Captured"
//             width={320}
//             height={240}
//             unoptimized
//             className="w-80 h-60 object-cover"
//           />
//           <PrimaryButton
//             type="button"
//             onClick={retake}
//             // className="px-4 py-2 text-[11px] uppercase tracking-[0.2em] border border-black text-black hover:bg-black hover:text-white transition"
//           >
//             Retake
//           </PrimaryButton>
//         </div>
//       )}

//       {/* Hidden canvas */}
//       <canvas ref={canvasRef} className="hidden" />
//     </div>
//   );
// }

"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { CameraProps } from "../types/types";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { CameraIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";

export function CameraCapture({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Wait for video element to be available
    if (!videoRef.current) {
      console.log("Waiting for video element...");
      // Try again after a short delay
      setTimeout(() => {
        if (videoRef.current) {
          startCamera();
        } else {
          setError("Video element not found. Please refresh the page.");
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    console.log("Video element found, requesting camera...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log("Camera access granted");

      // Clean up any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = stream;

      // Set the stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          setIsVideoReady(true);
          videoRef.current
            ?.play()
            .then(() => {
              console.log("Video playing");
              setIsCameraOn(true);
              setIsLoading(false);
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              setError("Failed to start video playback");
              setIsLoading(false);
            });
        };

        videoRef.current.onerror = (err) => {
          console.error("Video error:", err);
          setError("Video element error occurred");
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Camera error details:", err);

      let errorMessage = "Camera could not initialize.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Camera access denied. Please allow camera permissions.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application.";
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Track stopped:", track.kind);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setIsCameraOn(false);
    setIsVideoReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not ready");
      return;
    }

    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setError("Video not ready. Please wait a moment.");
      return;
    }

    console.log("Capturing photo...");
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not create canvas context");
      return;
    }

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply mirror effect for selfie view
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture photo");
          return;
        }

        console.log("Photo captured, size:", blob.size);
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
    console.log("Retaking photo...");
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setError(null);
    // Small delay to ensure cleanup
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [capturedImage, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up...");
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [stopCamera, capturedImage]);

  // Check if camera is supported
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        setError("Camera API not supported in this browser");
      }
    }
  }, []);

  // Animation variants
  const cameraVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  if (!isCameraSupported) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <XCircleIcon className="w-12 h-12 text-red-500" />
        <p className="text-red-600 text-sm">
          Camera is not supported in your browser
        </p>
        <p className="text-xs text-muted">
          Please use a modern browser like Chrome, Firefox, or Safari
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6 w-full"
      initial="hidden"
      animate="visible"
      variants={cameraVariants}
    >
      {/* Always render video element but hide when not needed */}
      <div
        className={!isCameraOn && !capturedImage ? "hidden" : "block w-full"}
      >
        <div className="relative rounded-sm overflow-hidden border border-border shadow-lg bg-black/5">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-80 h-60 object-cover scale-x-[-1]"
          />
          {isCameraOn && (
            <>
              <div className="absolute inset-0 pointer-events-none border-2 border-black/10 rounded-sm" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-2 text-[8px] text-white bg-black/50 px-2 py-0.5 rounded">
                Ready
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-sm max-w-sm"
          >
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-4 h-4 text-red-600" />
              <p className="text-red-600 text-[11px] uppercase tracking-wider font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={startCamera}
              className="text-[10px] text-red-600 underline hover:no-underline mt-1"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open Camera button — only when idle */}
      {!isCameraOn && !capturedImage && !isLoading && !error && (
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <PrimaryButton
            type="button"
            onClick={startCamera}
            className="px-8 py-3 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/85 transition-all duration-300 rounded-sm group"
            startIcon={
              <CameraIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            }
          >
            Open Camera
          </PrimaryButton>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          animate={pulseAnimation}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Initializing camera...
          </p>
          <p className="text-[9px] text-muted">
            Please grant camera permission when prompted
          </p>
        </motion.div>
      )}

      {/* Capture button when camera is on */}
      {isCameraOn && !capturedImage && (
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <PrimaryButton
            type="button"
            onClick={capturePhoto}
            className="px-6 py-2.5 bg-black text-white text-[11px] uppercase tracking-[0.2em] hover:bg-black/80 transition-all duration-300 rounded-sm group"
            startIcon={
              <CameraIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
            }
          >
            Capture Photo
          </PrimaryButton>
        </motion.div>
      )}

      {/* Captured preview */}
      <AnimatePresence>
        {capturedImage && (
          <motion.div
            key="preview"
            variants={cameraVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="relative rounded-sm overflow-hidden border border-border shadow-lg group">
              <Image
                src={capturedImage}
                alt="Captured biometric photo"
                width={320}
                height={240}
                unoptimized
                className="w-80 h-60 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <PrimaryButton
                type="button"
                onClick={retake}
                className="px-6 py-2.5 bg-transparent border border-black text-black text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 rounded-sm group"
                startIcon={
                  <RefreshCwIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                }
              >
                Retake Photo
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instruction text */}
      {!isCameraOn && !capturedImage && !isLoading && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] uppercase tracking-[0.2em] text-muted text-center max-w-xs"
        >
          Position your face clearly in frame
        </motion.p>
      )}
    </motion.div>
  );
}
