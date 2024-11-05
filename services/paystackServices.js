const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = process.env.PAYMENT_BASE_URL;

const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

const initializePayment = async (email, amount) => {
  try {
    const data = { email, amount: amount * 100 };
    const response = await axios.post(`${BASE_URL}/transaction/initialize`, data, { headers: paystackHeaders });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(`${BASE_URL}/transaction/verify/${reference}`, { headers: paystackHeaders });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};

module.exports = { initializePayment, verifyPayment };
