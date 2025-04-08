import { ContactInfo } from "@/types";

// Interface for the combined data format
interface CombinedContactInfo extends ContactInfo {
  extractedText: string;
  isMockData: boolean;
}

/**
 * Extracts text from image and returns both real data and mock data
 */
export const extractTextFromImage = async (
  image: string
): Promise<CombinedContactInfo> => {
  // First, extract the real text from the image
  const extractedText = await extractRealTextFromImage(image);

  // Convert JSON string to JavaScript object
  const dataObject = JSON.parse(extractedText);
  // Create the combined result with both real and mock data
  return {
    extractedText,
    isMockData: false,
    name: dataObject.name,
    title: dataObject.company,
    company: dataObject.company,
    email: dataObject.email,
    phone: dataObject.phone,
    website: dataObject.website,
    address: dataObject.address,
  }
}

/**
 * Extracts only real text from the image
 */
async function extractRealTextFromImage(image: string): Promise<string> {
  try {
    // Try to parse the input as JSON
    let result: any;

    try {
      if (typeof image === "string") {
        if (image.startsWith("{")) {
          // It's a JSON string
          result = JSON.parse(image);
        } else if (image.includes("analyzeResult")) {
          // It might be a stringified object inside a string
          const jsonStart = image.indexOf("{");
          const jsonEnd = image.lastIndexOf("}") + 1;
          if (jsonStart >= 0 && jsonEnd > 0) {
            const jsonString = image.substring(jsonStart, jsonEnd);
            result = JSON.parse(jsonString);
          }
        }
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }

    // If we have a valid result object from OCR
    if (result) {
      // For simple text-only format where the OCR result directly includes text field
      if (result.text) {
        // Regular expressions for matching
        const emailRegex = /\b\S+@\S+\.\S+\b/; // Regex to match email addresses
        const phoneRegex = /(?:\+65\s?\d{4}\s?\d{4})|(?:\d{4}\s?\d{4})/;

        // const phoneRegex =
        //   /(?:\+?\d{1,3}[- ]?)?(?:\(?\d{1,4}?\)?[- ]?)?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}/; // Regex to match phone numbers
        const urlRegex =
          /(?<!@)\b(?:https?:\/\/|www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\b/; // Regex to match URLs, ensuring they don't contain @

        // Split the text into lines
        const lines = result.text.split("\n");

        // Initialize variables
        let name = "";
        let company = "";
        let phone = "";
        let email = "";
        let address = "";
        let website = "";

        // Process each line
        lines.forEach((line) => {
          line = line.trim();
          if (emailRegex.test(line) && !email) {
            email = line; // Capture the first valid email
          } else if (urlRegex.test(line) && !website) {
            website = line; // Capture the first valid URL as the website
          } else if (phoneRegex.test(line) && !phone) {
            phone = line; // If it matches phone pattern and phone is not already set
          } else if (!name) {
            name = line; // First valid line is considered name
          } else if (!company) {
            company = line; // Capture the first line after name as company
          } else if (line.length > 0) {
            address += (address ? ", " : "") + line; // Remaining valid lines are considered address
          }
        });

        // Clean up address to ensure it doesn't include the phone number
        address = address
          .replace(phone, "")
          .trim()
          .replace(/,+/g, ",")
          .replace(/,$/, ""); // Remove phone from address if included

        const response = { name, company, phone, email, address, website };
        // console.log(response); // Uncomment to log the response
        return JSON.stringify(response);
      }

      // For Azure OCR format - extract text from results
      if (result.analyzeResult || result.status === "succeeded") {
        const analyzeResult = result.analyzeResult;

        if (
          analyzeResult &&
          analyzeResult.readResults &&
          analyzeResult.readResults.length > 0
        ) {
          let extractedText = "";

          // Extract text from all pages
          for (const readResult of analyzeResult.readResults) {
            if (readResult.lines && readResult.lines.length > 0) {
              for (const line of readResult.lines) {
                extractedText += line.text + "\n";
              }
            }
          }

          console.log("Extracted text:", extractedText);
          return extractedText;
        }
      }
    }

    return "No text could be extracted from the image";
  } catch (error) {
    console.error("Error extracting text:", error);
    return "Error extracting text from image";
  }
}

/**
 * Parses text to ContactInfo - includes both real and mock data
 */
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
