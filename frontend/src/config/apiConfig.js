// API Configuration
export const API_CONFIG = {
  // Gemini AI API
  GEMINI: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
    API_KEY: 'AIzaSyANwL7_uwatlyvU3wDyGcFwoSSkpkdBEhY',
    MODEL: 'gemini-1.5-flash'
  },
  
  // Polkadot testnet RPC
  POLKADOT: {
    RPC_URL: 'https://testnet-passet-hub-eth-rpc.polkadot.io'
  }
};

// API request helper
export const makeAPIRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}; 