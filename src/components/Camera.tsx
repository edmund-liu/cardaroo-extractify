import React, { useRef, useState, useEffect } from "react";
import { X, ScanText, Upload, Camera } from "lucide-react";
import Loader from "./Loader";

interface CameraComponentProps {
  onCapture: (result: any) => void;
  onCancel: () => void;
}

const API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;

const CameraComponent: React.FC<CameraComponentProps> = ({onCapture,onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraMode, setIsCameraMode] = useState<boolean>(false);

  useEffect(() => {
    if (isCameraMode) {
      startCamera();
    }
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [isCameraMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      console.error("Camera access error:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      setError(null);
    }
  };

  const openFileUpload = (): void => {
    fileInputRef.current?.click();
  };

  // const getImageBlob = (file: File): Promise<Blob> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       try {
  //         const binaryStr = reader.result as ArrayBuffer;
  //         const byteArray = new Uint8Array(binaryStr);
  //         const imageBlob = new Blob([byteArray], { type: file.type });
  //         resolve(imageBlob);
  //       } catch (err) {
  //         reject(err);
  //       }
  //     };
  //     reader.onerror = () => reject(new Error("Failed to read the image file"));
  //     reader.readAsArrayBuffer(file);
  //   });
  // };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          0.7 // 70% quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const submitBusinessCardToAzure = async (
    imageBlob: Blob
  ): Promise<string> => {
    const url = `${ENDPOINT}/formrecognizer/documentModels/prebuilt-businessCard:analyze?api-version=2023-07-31`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": API_KEY,
      },
      body: imageBlob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Azure API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const operationLocation = response.headers.get("Operation-Location");
    if (!operationLocation) {
      throw new Error("Operation-Location not found in headers");
    }

    return operationLocation;
  };

  const pollForBusinessCardResult = async (
    operationLocation: string
  ): Promise<any> => {
    let attempts = 0;
    let result: any = { status: "notStarted" };

    while (
      result.status !== "succeeded" &&
      result.status !== "failed" &&
      attempts < 30
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": API_KEY,
        },
      });
      if (!res.ok) {
        throw new Error(`Polling failed: ${res.statusText}`);
      }
      result = await res.json();
      attempts++;
    }

    if (result.status === "failed") {
      throw new Error("Business card recognition failed.");
    }

    return result.analyzeResult.documents?.[0]?.fields || {};
  };

  const extractBusinessCardFields = (fields: any) => {
    const extractArray = (arr: any[] = []) =>
      arr.map((item) => ({
        value: item?.content || "N/A",
        confidence: item?.confidence?.toFixed(2) || "0.00",
      }));

    return {
      ContactNames: extractArray(fields.ContactNames?.valueArray),
      CompanyNames: extractArray(fields.CompanyNames?.valueArray),
      Departments: extractArray(fields.Departments?.valueArray),
      JobTitles: extractArray(fields.JobTitles?.valueArray),
      Emails: extractArray(fields.Emails?.valueArray),
      Websites: extractArray(fields.Websites?.valueArray),
      Addresses: extractArray(fields.Addresses?.valueArray),
      MobilePhones: extractArray(fields.MobilePhones?.valueArray),
      Faxes: extractArray(fields.Faxes?.valueArray),
      WorkPhones: extractArray(fields.WorkPhones?.valueArray),
      OtherPhones: extractArray(fields.OtherPhones?.valueArray),
    };
  };

  const captureImage = async (): Promise<Blob> => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error("Camera or canvas not initialized");
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(video, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to capture image"));
        }
      }, 'image/jpeg');
    });
  };

  const processImage = async (): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    try {
      let imageBlob: Blob;
      
      if (isCameraMode) {
        // Capture from camera
        imageBlob = await captureImage();
      } else if (imageFile) {
        // Use uploaded file
        imageBlob = await compressImage(imageFile);
      } else {
        throw new Error("No image source available");
      }

      const operationLocation = await submitBusinessCardToAzure(imageBlob);
      const fields = await pollForBusinessCardResult(operationLocation);
      const structuredResult = extractBusinessCardFields(fields);
      console.log({ structuredResult });
      
      // Stop camera if in camera mode
      if (isCameraMode && stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCameraMode(false);
      }
      
      onCapture(structuredResult);
    } catch (err: any) {
      console.error("Error processing image:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
      <header className="p-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Business Card Reader
        </h1>
      </header>

      {error && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-red-600 text-white p-3 rounded-lg">
            <p>Error: {error}</p>
          </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center p-4">
        {isCameraMode ? (
          <div className="relative w-full max-w-2xl border border-white rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-h-[60vh] object-contain bg-gray-800"
            />
          </div>
        ) : selectedImage ? (
          <div className="relative w-full max-w-2xl border border-white rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full max-h-[60vh] object-contain bg-gray-800"
            />
          </div>
        ) : (
          <div
            onClick={openFileUpload}
            className="w-full max-w-2xl border-2 border-dashed border-white rounded-lg p-8 flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <Upload className="w-16 h-16 text-white mb-4" />
            <p className="text-white text-center">
              Drag & drop an image here, or click to select one
            </p>
          </div>
        )}
      </main>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <footer className="p-6 flex justify-between items-center">
        <button
          onClick={onCancel}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {isCameraMode || selectedImage ? (
          <button
            onClick={processImage}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition"
          >
            <ScanText className="w-8 h-8 text-black" />
          </button>
        ) : (
          <button
            onClick={() => setIsCameraMode(true)}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition"
          >
            <Camera className="w-8 h-8 text-black" />
          </button>
        )}
        <div className="w-12 h-12" />
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraComponent;
