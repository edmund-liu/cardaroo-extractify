
import React from "react";
import { Scan } from "lucide-react";

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 w-full h-full appear">
      <div className="relative">
        <Scan className="w-16 h-16 text-primary animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-400/20 blur-xl rounded-full opacity-50 animate-pulse"></div>
      </div>
      
      <h2 className="text-xl font-medium text-foreground/80">Processing Card</h2>
      
      <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-blue-400 animate-shimmer"
          style={{ 
            backgroundSize: "200% 100%",
            width: "100%" 
          }}
        ></div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 max-w-xs text-center">
        Extracting contact information using AI technology
      </p>
    </div>
  );
};

export default Loader;
