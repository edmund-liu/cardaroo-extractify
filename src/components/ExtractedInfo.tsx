
import React, { useState } from "react";
import { ContactInfo } from "@/types";
import { Check, Pencil } from "lucide-react";

interface ExtractedInfoProps {
  contactInfo: ContactInfo;
  onUpdate: (updated: ContactInfo) => void;
}

const ExtractedInfo: React.FC<ExtractedInfoProps> = ({ contactInfo, onUpdate }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ContactInfo>(contactInfo);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-border p-6 space-y-4 slide-up">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <button 
            onClick={() => setEditing(true)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{contactInfo.name || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-medium">{contactInfo.title || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium">{contactInfo.company || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{contactInfo.email || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium">{contactInfo.phone || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Website</p>
            <p className="text-sm font-medium">{contactInfo.website || "Not detected"}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="text-sm font-medium">{contactInfo.address || "Not detected"}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-border p-6 space-y-4 appear"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Information</h3>
        <button 
          type="submit"
          className="p-2 rounded-full bg-primary/10 text-primary"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-input rounded-md"
          />
        </div>
      </div>
    </form>
  );
};

export default ExtractedInfo;
