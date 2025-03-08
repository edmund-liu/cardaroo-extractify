
import { ContactInfo } from "@/types";

// This is a mock implementation of text extraction
// In a real implementation, you would use a proper OCR library or API

export const extractTextFromImage = async (image: string): Promise<ContactInfo> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock data - in a real app, you would use OCR to extract text from the image
  return {
    name: "Alex Johnson",
    title: "Product Manager",
    company: "Innovative Solutions Inc.",
    email: "alex.johnson@innovative.com",
    phone: "+1 (555) 123-4567",
    website: "www.innovative.com",
    address: "123 Tech Boulevard, San Francisco, CA 94107"
  };
};

export const parseTextToContactInfo = (text: string): ContactInfo => {
  // This function would parse raw extracted text into structured contact info
  // For now, we're just returning a mock object
  return {
    name: "Alex Johnson",
    title: "Product Manager",
    company: "Innovative Solutions Inc.",
    email: "alex.johnson@innovative.com",
    phone: "+1 (555) 123-4567",
    website: "www.innovative.com",
    address: "123 Tech Boulevard, San Francisco, CA 94107"
  };
};
