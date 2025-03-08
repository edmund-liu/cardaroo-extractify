
import React, { useState } from "react";
import { ContactInfo } from "@/types";
import NameCard from "./NameCard";
import ExtractedInfo from "./ExtractedInfo";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsProps {
  contactInfo: ContactInfo;
  onBack: () => void;
  onNewScan: () => void;
}

const Results: React.FC<ResultsProps> = ({ contactInfo, onBack, onNewScan }) => {
  const [currentInfo, setCurrentInfo] = useState<ContactInfo>(contactInfo);
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 slide-up">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onNewScan}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>New Scan</span>
        </Button>
      </div>
      
      <div className="md:flex gap-8 space-y-8 md:space-y-0">
        <div className="md:w-1/2">
          <NameCard contactInfo={currentInfo} />
        </div>
        
        <div className="md:w-1/2">
          <ExtractedInfo 
            contactInfo={currentInfo} 
            onUpdate={setCurrentInfo} 
          />
        </div>
      </div>
    </div>
  );
};

export default Results;
