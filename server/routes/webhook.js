const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Customer = require('../models/customer');

// Use express.raw to read raw buffer
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const customerData = {
        name: session.customer_details.name,
        email: session.customer_details.email,
        phone: session.customer_details.phone || session.metadata.phone,
        address: session.customer_details.address,
        subServiceId: session.metadata.subServiceId,
        features: JSON.parse(session.metadata.features || '[]'),
        serviceName: session.metadata.serviceName,       // ✅ updated here
        servicePrice: parseFloat(session.metadata.servicePrice || 0),
        status: session.metadata.status || 'pending',
      };

      await Customer.create(customerData);
    } catch (err) {
      console.error('Error saving customer:', err.message);
    }
  }

  res.status(200).end();
});





module.exports = router;
