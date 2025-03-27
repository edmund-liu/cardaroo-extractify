import { ContactInfo } from "@/types";
import { toast } from "sonner";

const AZURE_ENDPOINT = "https://isca-azdocumentintel.cognitiveservices.azure.com/";
const AZURE_API_KEY = "9sXZGRdf7kVKWVDmC8Th0kkDJQZoR5dJqiPOWYNUwsRA7GasRn4OJQQJ99BCACqBBLyXJ3w3AAALACOGiAY0";
const AZURE_MODEL_ID = "prebuilt-businessCard";

export const extractTextFromImage = async (imageBase64: string): Promise<ContactInfo> => {
  try {
    // Remove the data URL prefix if present
    const base64Data = imageBase64.includes(',') ? 
      imageBase64.split(',')[1] : 
      imageBase64;
    
    const formData = new FormData();
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    formData.append('file', blob, 'businesscard.jpg');
    
    // Call Azure Document Intelligence API
    const response = await fetch(
      `${AZURE_ENDPOINT}formrecognizer/documentModels/${AZURE_MODEL_ID}:analyze?api-version=2023-07-31`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
        },
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
    }
    
    // Get operation-location header for result polling
    const operationLocation = response.headers.get('operation-location');
    if (!operationLocation) {
      throw new Error('Operation location header not found');
    }
    
    // Poll for results
    const result = await pollForResults(operationLocation);
    return parseAzureResponseToContactInfo(result);
  } catch (error) {
    console.error('Error extracting text from image:', error);
    toast.error('Failed to extract text from business card');
    
    // Return empty contact info on failure
    return {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };
  }
};

const pollForResults = async (operationLocation: string): Promise<any> => {
  let complete = false;
  let result = null;
  
  // Poll every 1 second until complete
  while (!complete) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(operationLocation, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Poll error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'succeeded') {
      complete = true;
      result = data;
    } else if (data.status === 'failed') {
      throw new Error('Document analysis failed');
    }
  }
  
  return result;
};

const parseAzureResponseToContactInfo = (result: any): ContactInfo => {
  try {
    // Default empty contact info
    const contactInfo: ContactInfo = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };
    
    if (!result?.analyzeResult?.documents?.[0]?.fields) {
      return contactInfo;
    }
    
    const fields = result.analyzeResult.documents[0].fields;
    
    // Map Azure fields to our ContactInfo structure
    if (fields.ContactNames?.values?.[0]?.valueObject?.value) {
      contactInfo.name = fields.ContactNames.values[0].valueObject.value || '';
    }
    
    if (fields.JobTitles?.values?.[0]?.valueString) {
      contactInfo.title = fields.JobTitles.values[0].valueString || '';
    }
    
    if (fields.CompanyNames?.values?.[0]?.valueString) {
      contactInfo.company = fields.CompanyNames.values[0].valueString || '';
    }
    
    if (fields.Emails?.values?.[0]?.valueString) {
      contactInfo.email = fields.Emails.values[0].valueString || '';
    }
    
    if (fields.PhoneNumbers?.values?.[0]?.valueObject?.value) {
      contactInfo.phone = fields.PhoneNumbers.values[0].valueObject.value || '';
    }
    
    if (fields.Websites?.values?.[0]?.valueString) {
      contactInfo.website = fields.Websites.values[0].valueString || '';
    }
    
    if (fields.Addresses?.values?.[0]?.valueObject?.value) {
      contactInfo.address = fields.Addresses.values[0].valueObject.value || '';
    }
    
    return contactInfo;
  } catch (error) {
    console.error('Error parsing Azure response:', error);
    
    // Return default empty contact info on parsing error
    return {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };
  }
};

// Keep this function for compatibility with the rest of the app
export const parseTextToContactInfo = (text: string): ContactInfo => {
  // This function is no longer needed with Azure OCR, 
  // but kept for API compatibility
  return {
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: ""
  };
};
