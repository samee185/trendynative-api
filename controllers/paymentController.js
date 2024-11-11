const axios = require('axios');
const asyncHandler = require("express-async-handler");
const { createOrder } = require('../controllers/orders'); 
const Order = require('../model/orders'); 

const payment_url = process.env.PAYMENT_URL;

// Initiate Payment
const initiatePayment = asyncHandler(async (req, res) => {
  try {
    const { amount, userId, items } = req.body;  
    console.log(req.body);
    
    if (!req.user || !req.user.email) {
      return res.status(400).json({ success: false, message: 'User not authenticated' });
    }

    const { email } = req.user;  

    const initializeUrl = `${payment_url}/transaction/initialize`;

    const response = await axios.post(
      initializeUrl,
      {
        email: email,
        amount: amount * 100,  
        callback_url: 'https://trendynativewears.com/payment-callback',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
      
      
    );
    console.log(response.data);
    

    if (response.data && response.data.data && response.data.data.authorization_url) {
      res.json({
        success: true,
        payment_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
        user: userId,
        items: items,
      });
      
    } else {
      res.status(400).json({ success: false, message: 'Payment initiation failed' });
    }
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error);
    res.status(500).json({ success: false, message: 'Server error during payment initiation' });
  }
});

// Verify Payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `${payment_url}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data && response.data.data && response.data.data.status === 'success') {
      // Payment is successful, proceed to create order using existing createOrder function
      const { userId, items, address, taxPrice, shippingPrice } = req.body;
      
      const orderData = {
        orderItems: items,
        shippingAddress: address,
        itemsPrice: response.data.data.amount / 100,
        taxPrice: taxPrice || 0,  
        shippingPrice: shippingPrice || 0,  
        totalPrice: response.data.data.amount / 100,
      };

      const user = { _id: userId, email: req.body.email, firstname: req.body.firstname };

      const createdOrder = await createOrder(orderData, user);

      res.status(201).json({ success: true, order: createdOrder });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment verification' });
  }
});

module.exports = { initiatePayment, verifyPayment };
