import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, CircleDot } from "lucide-react";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCaptureComplete: (frames: string[], snapshot: string) => void;
  analysisType?: string;
  recordDuration?: number;
  instructions?: string;
  title?: string;
}

export default function CameraCapture({
  open,
  onClose,
  onCaptureComplete,
  analysisType = "overhead_squat",
  recordDuration = 12,
  instructions = "Stand 6–8 feet from the camera. Arms overhead, feet shoulder-width apart. Perform a full squat when recording starts.",
  title = "Overhead Squat Assessment",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<"setup" | "countdown" | "recording" | "processing">("setup");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const framesRef = useRef<string[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
    }
  }, [facingMode]);

  useEffect(() => {
    if (open) {
      startCamera();
      setPhase("setup");
      setElapsed(0);
      framesRef.current = [];
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, startCamera]);

  const flipCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  const startCountdown = () => {
    setCountdown(3);
    setPhase("countdown");
    let c = 3;
    const timer = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timer);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    setPhase("recording");
    setElapsed(0);
    framesRef.current = [];

    // Capture a frame every 500ms
    intervalRef.current = window.setInterval(() => {
      const frame = captureFrame();
      if (frame) framesRef.current.push(frame);
    }, 500);

    // Stop after recordDuration seconds
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase("processing");

      const snapshot = framesRef.current[Math.floor(framesRef.current.length / 2)] || framesRef.current[0] || "";
      onCaptureComplete(framesRef.current, snapshot);
    }, recordDuration * 1000);

    // Update elapsed timer
    const elapsed_timer = setInterval(() => {
      setElapsed(prev => {
        if (prev >= recordDuration) {
          clearInterval(elapsed_timer);
          return recordDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm z-10 safe-top">
        <button onClick={onClose} className="p-2 rounded-full bg-secondary">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display font-bold text-foreground text-sm">{title}</h2>
        <button onClick={flipCamera} className="p-2 rounded-full bg-secondary">
          <RotateCcw className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Guide overlay */}
        {phase === "setup" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-primary/40 rounded-2xl w-[70%] h-[85%] flex items-end justify-center pb-6">
              <p className="text-primary/70 text-xs font-medium bg-background/60 px-3 py-1 rounded-full">
                Position yourself in frame
              </p>
            </div>
          </div>
        )}

        {/* Countdown overlay */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.span
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-7xl font-display font-bold text-primary"
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording indicator */}
        {phase === "recording" && (
          <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-destructive/90 px-3 py-1.5 rounded-full">
              <CircleDot className="w-3 h-3 text-white animate-pulse" />
              <span className="text-white text-xs font-semibold">REC</span>
            </div>
            <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(elapsed / recordDuration) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
            <span className="text-white text-xs font-mono">{elapsed}s/{recordDuration}s</span>
          </div>
        )}

        {/* Processing overlay */}
        {phase === "processing" && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground font-medium">Analyzing your movement...</p>
            <p className="text-muted-foreground text-xs">This may take a moment</p>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 bg-background flex items-center justify-center p-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">{cameraError}</p>
              <button onClick={startCamera} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {phase === "setup" && !cameraError && (
        <div className="px-6 py-5 bg-card/80 backdrop-blur-sm safe-bottom">
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-xs">{instructions}</p>
          </div>
          <button
            onClick={startCountdown}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Camera className="w-4 h-4" />
            Start Assessment
          </button>
        </div>
      )}
    </motion.div>
  );
}
