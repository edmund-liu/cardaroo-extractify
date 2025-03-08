
import React, { useRef, useState, useEffect } from "react";
import { Camera, X, ScanText } from "lucide-react";

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" }, 
          audio: false 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && cameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current frame from video to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and pass to handler
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black fade-in">
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-white">
            <p className="text-center mb-4">{error}</p>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-white text-black rounded-full font-medium"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[60%] rounded-lg border-2 border-white/60 flex items-center justify-center">
                <ScanText className="w-12 h-12 text-white/70" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-center gap-4">
              <button
                onClick={onCancel}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-lg text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <button
                onClick={captureImage}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-white"
                disabled={!cameraReady}
              >
                <Camera className="w-8 h-8 text-black" />
              </button>
              
              <div className="w-12 h-12" />
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraComponent;
