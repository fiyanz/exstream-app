/**
 * This is a test script to verify the storeOrder functionality.
 * You can run it directly in the browser console or use it as a reference.
 */

import { createStoreOrder, formatOrderData } from './storeOrder';

// Sample checkout data
const sampleCheckoutData = {
  fullName: "Andi Wijaya",
  telephone: "081234567890",
  address: "Jl. Merdeka No. 123",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  shippingMethod: "jne - reg (Reguler)",
  paymentMethod: "COD",
  shippingCost: 15000,
  destination_id: 3174,
  items: [
    {
      id: 1,
      name: "Kaos Premium",
      variant: "Hitam - L",
      price: 89000,
      quantity: 2,
      weight: 250,
      width: 20,
      height: 3,
      length: 30
    },
    {
      id: 2,
      name: "Celana Chino",
      variant: "Navy - 32",
      price: 129000,
      quantity: 1,
      weight: 500,
      width: 30,
      height: 5,
      length: 40
    }
  ],
  totalAmount: 307000
};

// Format the checkout data for the API
const formattedOrderData = formatOrderData(sampleCheckoutData);

console.log('Formatted Order Data:', formattedOrderData);

// Test the API call
const testStoreOrder = async () => {
  try {
    const response = await createStoreOrder(formattedOrderData);
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('Test failed:', error.message);
    return null;
  }
};

// You can run this function in the browser console:
// testStoreOrder().then(result => console.log('Test result:', result));

export { testStoreOrder, sampleCheckoutData };
