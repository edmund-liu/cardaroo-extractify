import React, { useRef, useState } from "react";
import { X, ScanText, Upload } from "lucide-react";
import Loader from "./Loader";

interface CameraComponentProps {
  onCapture: (result: string) => void;
  onCancel: () => void;
}

const API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT;

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, onCancel }) => {
  // Refs for file input and hidden canvas
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Component state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles file selection and updates state.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
      setError(null);
    }
  };

  /**
   * Opens the file upload dialog.
   */
  const openFileUpload = (): void => {
    fileInputRef.current?.click();
  };

  /**
   * Converts the selected file to a Blob using FileReader.
   */
  const getImageBlob = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const binaryStr = reader.result as ArrayBuffer;
          const byteArray = new Uint8Array(binaryStr);
          const imageBlob = new Blob([byteArray], { type: file.type });
          resolve(imageBlob);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the image file"));
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Submits the image blob to the Azure OCR API.
   */
  const submitImageToAzure = async (imageBlob: Blob): Promise<string> => {
    const readUrl = `${ENDPOINT}/vision/v3.2/read/analyze`;
    const response = await fetch(readUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": API_KEY,
      },
      body: imageBlob,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const operationLocation = response.headers.get("Operation-Location");
    if (!operationLocation) {
      throw new Error("Operation location not found in response headers");
    }
    return operationLocation;
  };

  /**
   * Polls the Azure API until the OCR process completes or fails.
   */
  const pollForAzureResult = async (operationLocation: string): Promise<any> => {
    let pollAttempt = 0;
    let result: any = { status: "notStarted" };

    while (result.status !== "succeeded" && result.status !== "failed" && pollAttempt < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const resultResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": API_KEY,
        },
      });
      if (!resultResponse.ok) {
        throw new Error(`Azure API error: ${resultResponse.status} ${resultResponse.statusText}`);
      }
      result = await resultResponse.json();
      pollAttempt++;
    }

    if (result.status === "failed") {
      throw new Error("Azure OCR processing failed");
    }
    return result;
  };

  /**
   * Processes the selected image using Azure OCR.
   */
  const processImage = async (): Promise<void> => {
    if (!imageFile) return;
    setIsProcessing(true);
    setError(null);

    try {
      const imageBlob = await getImageBlob(imageFile);
      const operationLocation = await submitImageToAzure(imageBlob);
      const result = await pollForAzureResult(operationLocation);

      const textContent = result.analyzeResult.readResults
        .flatMap((page: any) => page.lines)
        .map((line: any) => line.text)
        .join("\n");

      const formattedResult = {
        text: textContent,
        rawResult: result.analyzeResult,
        processedBy: "Microsoft Azure Computer Vision",
        imageUrl: selectedImage,
      };

      onCapture(JSON.stringify(formattedResult));
    } catch (err: any) {
      console.error("Error processing image:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show a full-screen loader while processing
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
      {/* Header Section */}
      <header className="p-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Image Text Extractor
        </h1>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="bg-red-600 text-white p-3 rounded-lg">
            <p>Error: {error}</p>
          </div>
        </div>
      )}

      {/* Main Content: Image Display or Upload Area */}
      <main className="flex-grow flex items-center justify-center p-4">
        {selectedImage ? (
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

      {/* Hidden File Input */}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />


      {/* Footer: Action Buttons */}
      <footer className="p-6 flex justify-between items-center">
        <button
          onClick={onCancel}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {selectedImage ? (
          <button
            onClick={processImage}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition"
          >
            <ScanText className="w-8 h-8 text-black" />
          </button>
        ) : (
          <button
            onClick={openFileUpload}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition"
          >
            <Upload className="w-8 h-8 text-black" />
          </button>
        )}
        <div className="w-12 h-12" />
      </footer>

      {/* Hidden Canvas for potential image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraComponent;
