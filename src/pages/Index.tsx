
import React, { useState } from "react";
import { Camera, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraComponent from "@/components/Camera";
import Loader from "@/components/Loader";
import Results from "@/components/Results";
import { AppState, ContactInfo } from "@/types";
import { extractTextFromImage } from "@/utils/textExtraction";

const Index = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<ContactInfo | null>(null);

  const handleOpenCamera = () => {
    setAppState(AppState.CAMERA);
  };

  const handleCaptureImage = async (image: string) => {
    setCapturedImage(image);
    setAppState(AppState.PROCESSING);
    
    try {
      const info = await extractTextFromImage(image);
       // Example: Use regex to detect and clean phone numbers
      if (info.phone) {
        const phoneRegex = /(\+?\d{1,2})?(\(?\d{1,4}\)?[\s\-]?)?[\d\s\-]{7,}/g;
        const match = info.phone.match(phoneRegex);
        if (match) {
          info.phone = match[0];  // Use the matched phone number
        }
      }
      
      console.log(info)
      setExtractedInfo(info);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Error extracting text:", error);
      // Handle error (would show toast in real app)
      setAppState(AppState.LANDING);
    }
  };

  const handleCancelCamera = () => {
    setAppState(AppState.LANDING);
  };

  const handleBackToLanding = () => {
    setCapturedImage(null);
    setExtractedInfo(null);
    setAppState(AppState.LANDING);
  };

  const handleNewScan = () => {
    setCapturedImage(null);
    setExtractedInfo(null);
    setAppState(AppState.CAMERA);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {appState === AppState.LANDING && (
        <div className="flex-1 flex flex-col">
          <header className="pt-12 px-8 pb-6">
            <div className="w-full max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 mb-1">
                <div className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  AI Powered
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-gradient">CardScan</span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-md">
                Instantly extract contact information from business cards using your camera
              </p>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
            <div className="relative">
              <div className="absolute -inset-32 bg-primary/5 blur-3xl rounded-full"></div>
              <div className="relative bg-white/80 backdrop-blur-md border border-border p-8 rounded-3xl shadow-xl max-w-lg mx-auto text-center space-y-6 appear">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ScanText className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Scan Business Cards</h2>
                  <p className="text-muted-foreground">
                    Point your camera at a business card to instantly capture and organize contact information
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleOpenCamera}
                  className="px-8 py-6 rounded-xl text-base font-medium"
                >
                  <Camera className="mr-2 h-5 w-5" /> Open Camera
                </Button>
              </div>
            </div>
            
            <div className="mt-16 max-w-xs text-center text-sm text-muted-foreground">
              <p>Your data stays on your device. No cards are stored on our servers.</p>
            </div>
          </main>
        </div>
      )}
      
      {appState === AppState.CAMERA && (
        <CameraComponent 
          onCapture={handleCaptureImage} 
          onCancel={handleCancelCamera} 
        />
      )}
      
      {appState === AppState.PROCESSING && (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      )}
      
      {appState === AppState.RESULTS && extractedInfo && (
        <Results 
          contactInfo={extractedInfo}
          onBack={handleBackToLanding}
          onNewScan={handleNewScan}
        />
      )}
    </div>
  );
};

export default Index;
