
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

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    const lastName = parts[0]; // first word is surname
    const firstName = parts.slice(1).join(" "); // rest is given name
    return { firstName, lastName };
  };
  
  const saveContact = () => {
    // vCard template with dynamic content
    const { firstName, lastName } = splitName(name);
const vCardData = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
N:${lastName};${firstName};;;
ORG:${company}
TEL;TYPE=cell:${phone}
EMAIL:${email}
ADR:${address}
URL:${website}
TITLE:${title}
END:VCARD`;

    // Create a Blob from the vCard data
    const blob = new Blob([vCardData], { type: "text/vcard" });

    // Create an anchor element to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name.replace(" ", "_")}_contact.vcf`; // Generate file name based on name
    link.click(); // Trigger download

    // Provide feedback to the user
    toast.success("Contact saved to your device");
  };

  const shareContact = () => {
    const contactText = `
    Contact information for ${name}:
  
    Name: ${name}
    Title: ${title}
    Company: ${company}
    Email: ${email}
    Phone: ${phone}
    Website: ${website}
    Address: ${address}
    `;
  
    // Format the contactText for URL encoding
    const encodedContactText = encodeURIComponent(contactText);
  
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: `Contact - ${name}`,
          text: contactText, // Only the contact text, no URL
        })
        .then(() => {
          toast.success("Contact shared successfully!");
        })
        .catch((err) => {
          toast.error("Error sharing contact: " + err);
        });
    } else {
      // If Web Share API is not supported, manually open platform-specific links
      const platform = prompt("Share via: WhatsApp, Skype, Email, LinkedIn, or Teams?", "WhatsApp").toLowerCase();
  
      const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodedContactText}`,
        skype: `https://web.skype.com/share?url=${encodedContactText}`,
        email: `mailto:?subject=Contact Information for ${name}&body=${encodedContactText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=Contact: ${name}&summary=${encodedContactText}`,
        teams: `https://teams.microsoft.com/l/share?url=${encodedContactText}`,
      };
  
      const selectedPlatform = shareLinks[platform];
  
      if (selectedPlatform) {
        window.open(selectedPlatform, "_blank");
        toast.success(`Sharing with ${platform.charAt(0).toUpperCase() + platform.slice(1)} opened`);
      } else {
        toast.error("Platform not supported");
      }
    }
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
