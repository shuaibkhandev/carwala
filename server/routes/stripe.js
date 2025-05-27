const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const YOUR_DOMAIN = 'http://localhost:3000';
router.post("/create-checkout-session-multiple", async (req, res) => {
  try {
    const {
      items, // array of cart items
      customerName,
      customerEmail,
      customerPhone
    } = req.body;

    const line_items = items.map(item => {
      const price = parseFloat(item.price.replace(/,/g, '').replace(' lakh', '')); // Adjusted multiplier
      return {
        price_data: {
          currency: "pkr",
          product_data: {
            name: item.name,
            description: item.description || "No description"
          },
          unit_amount: price
        },
        quantity: 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PK']
      },
      customer_creation: 'always',
      customer_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        customerPhone,
        status: 'pending'
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});
router.post("/create-checkout-session", async (req, res) => {
    
  try {
    const {
      subServiceId,
      name,
      price,
      description,
      features,
      customerName,
      customerEmail,
      customerPhone
    } = req.body;


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: name, 
              description: description
            },
            unit_amount: price 
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['PK']
      },
      customer_creation: 'always',
      customer_email: customerEmail, // this pre-fills email at checkout
      metadata: {
        subServiceId: subServiceId,
        features: JSON.stringify(features),
        serviceName: name,
        servicePrice: price.toString(),
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        status: 'pending'
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;