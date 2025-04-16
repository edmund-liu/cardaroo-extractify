// src/api/SaveCardData.js
import axios from 'axios';

// === GET SALESFORCE ACCESS TOKEN ===
export const getSalesforceToken = async () => {
  try {
    const response = await axios.post('/salesforce-token?grant_type=password&client_id=3MVG9g4ncJRWcPBDh89ueagpLPTxXg3xpedRqSR9gkPJzn_70mAWOhGDU4gUH9Xw_BkZE7E7GQsXO.pah07l.&client_secret=7E9C5AB638E5820E814CC579D80157D4B0C00EEDC4DC71CB725918E8A0F0A7B1&username=salesforce@isca.org.sg.uat&password=Singap0re@12%2322#22');

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Token fetch error:", error.response?.data || error);
    throw error;
  }
};

// === SEND CARD DATA USING TOKEN ===
export const sendCardDataToSalesforce = async (cardData) => {
  try {
    const token = await getSalesforceToken();

    const response = await axios.post(
      '/businesscard', // Vite proxy will handle the actual URL
      cardData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // console.log("✅ Card data sent successfully:", response);
    return response.data;
  } catch (error) {
    console.error("❌ Card data send error:", error.response?.data || error);
    throw error;
  }
};
