const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Add your key to .env
const User = require("../models/User");

// 1. Create a Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, studentId } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe works in cents (e.g., ₹100 = 10000)
      currency: "inr",
      metadata: { studentId }, // Store studentId to track who paid
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Verify Payment and Update Database
router.post("/verify-payment", async (req, res) => {
  try {
    const { paymentIntentId, studentId } = req.body;
    
    // Retrieve payment intent from stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const user = await User.findOneAndUpdate(
        { userId: studentId },
        { isFeePaid: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      return res.json({ success: true, message: "Payment Verified & Database Updated" });
    }
    
    res.status(400).json({ success: false, message: "Payment not successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;