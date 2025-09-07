// Midtrans Configuration
const MIDTRANS_CONFIG = {
  // Production environment
  PRODUCTION: {
    CLIENT_KEY: 'Mid-client-I2eQnF0U5AfjcUB4', // Replace with actual production client key
    SNAP_URL: 'https://app.midtrans.com/snap/snap.js',
    IS_PRODUCTION: true
  },
  
  // Sandbox environment  
  SANDBOX: {
    CLIENT_KEY: 'Mid-client-I2eQnF0U5AfjcUB4',
    SNAP_URL: 'https://app.sandbox.midtrans.com/snap/snap.js',
    IS_PRODUCTION: false
  }
};

// Current environment - change this to switch between sandbox and production
const CURRENT_ENV = 'SANDBOX'; // Change to 'PRODUCTION' for production

export const getCurrentMidtransConfig = () => {
  return MIDTRANS_CONFIG[CURRENT_ENV];
};

export const getMidtransClientKey = () => {
  return getCurrentMidtransConfig().CLIENT_KEY;
};

export const getMidtransSnapUrl = () => {
  return getCurrentMidtransConfig().SNAP_URL;
};

export const isMidtransProduction = () => {
  return getCurrentMidtransConfig().IS_PRODUCTION;
};

export default MIDTRANS_CONFIG;
