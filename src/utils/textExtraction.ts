import { ContactInfo } from "@/types";

export const extractTextFromImage = async (
  image: string | object // Allow both string and object types
) => {
  // Convert object to JSON string if necessary
  const jsonString = typeof image === 'string' ? image : JSON.stringify(image);
  // Check if the extracted text is a valid JSON string
  let dataObject;
  try {
    dataObject = JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // Handle the case where the extracted text is not valid JSON
    return {
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      address: "",
    };
  }
// console.log(dataObject,"%%%%%#########%%%%%%")
  return {
    name: dataObject.ContactNames[0]?.value || "", // Get the first contact name
    title: dataObject.JobTitles[0]?.value || "", // Get the first job title
    company: dataObject.CompanyNames[0]?.value || "", // Get the first company name
    email: dataObject.Emails[0]?.value || "", // Get the first email
    phone: dataObject.WorkPhones[0]?.value || "", // Get the first work phone
    website: dataObject.Websites[0]?.value || "", // Get the first website
    address: dataObject.Addresses[0]?.value || "", // Get the first address
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
    address: "123 Tech Boulevard, San Francisco, CA 94107",
  };
};
