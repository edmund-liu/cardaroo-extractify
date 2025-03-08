
import React from "react";
import { ContactInfo } from "@/types";
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Download,
  Share2,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface NameCardProps {
  contactInfo: ContactInfo;
}

const NameCard: React.FC<NameCardProps> = ({ contactInfo }) => {
  const { name, title, company, email, phone, website, address } = contactInfo;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const saveContact = () => {
    // In a real app, this would create a vCard or similar format
    toast.success("Contact saved to your device");
  };

  const shareContact = () => {
    // In a real app, this would use the Web Share API if available
    toast.success("Sharing options opened");
  };

  return (
    <div className="w-full max-w-md mx-auto appear">
      <div className="glass rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 pb-4">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
            <div className="space-y-0.5">
              <p className="text-base text-muted-foreground">{title}</p>
              <p className="text-base font-medium">{company}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border"></div>
        
        <div className="p-6 space-y-4">
          {email && (
            <div className="flex items-center gap-3" onClick={() => copyToClipboard(email, "Email")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          {phone && (
            <div className="flex items-center gap-3" onClick={() => copyToClipboard(phone, "Phone")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{phone}</p>
                <p className="text-xs text-muted-foreground">Phone</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          {website && (
            <div className="flex items-center gap-3" onClick={() => copyToClipboard(website, "Website")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{website}</p>
                <p className="text-xs text-muted-foreground">Website</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          {address && (
            <div className="flex items-center gap-3" onClick={() => copyToClipboard(address, "Address")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{address}</p>
                <p className="text-xs text-muted-foreground">Address</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="border-t border-border"></div>
        
        <div className="p-4 flex gap-2">
          <button 
            onClick={saveContact}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Save</span>
          </button>
          
          <button 
            onClick={shareContact}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameCard;
