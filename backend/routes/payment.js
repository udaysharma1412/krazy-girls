const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require("razorpay");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create-intent
// @access  Private
router.post(
  "/stripe/create-intent",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("currency").optional().isIn(["usd", "inr"]).withMessage("Invalid currency"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { amount, currency = "inr" } = req.body;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents/paise
        currency,
        payment_method_types: ["card"],
        metadata: {
          integration_check: "accept_a_payment",
        },
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Stripe Error:", error);
      res.status(500).json({
        success: false,
        message: "Payment processing failed",
        error: error.message,
      });
    }
  }
);

// @desc    Confirm Stripe payment
// @route   POST /api/payment/stripe/confirm
// @access  Private
router.post(
  "/stripe/confirm",
  [
    body("paymentIntentId").notEmpty().withMessage("Payment intent ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { paymentIntentId } = req.body;

      // Retrieve payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        res.json({
          success: true,
          message: "Payment confirmed successfully",
          paymentIntent,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment not successful",
          status: paymentIntent.status,
        });
      }
    } catch (error) {
      console.error("Stripe Error:", error);
      res.status(500).json({
        success: false,
        message: "Payment confirmation failed",
        error: error.message,
      });
    }
  }
);

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
router.post(
  "/razorpay/create-order",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("currency").optional().isIn(["INR"]).withMessage("Invalid currency"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { amount, currency = "INR" } = req.body;

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: "receipt_" + Date.now(),
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);

      res.json({
        success: true,
        order,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error("Razorpay Error:", error);
      res.status(500).json({
        success: false,
        message: "Payment processing failed",
        error: error.message,
      });
    }
  }
);

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
router.post(
  "/razorpay/verify",
  [
    body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Signature is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Create verification signature
      const crypto = require("crypto");
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature === razorpay_signature) {
        // Payment is verified
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        res.json({
          success: true,
          message: "Payment verified successfully",
          payment,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid signature",
        });
      }
    } catch (error) {
      console.error("Razorpay Error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message,
      });
    }
  }
);

// @desc    Process Cash on Delivery
// @route   POST /api/payment/cod
// @access  Private
router.post(
  "/cod",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("orderId").notEmpty().withMessage("Order ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { amount, orderId } = req.body;

      // For COD, we just confirm the order
      res.json({
        success: true,
        message: "Cash on Delivery order confirmed",
        paymentInfo: {
          method: "cod",
          amount,
          orderId,
          status: "pending",
        },
      });
    } catch (error) {
      console.error("COD Error:", error);
      res.status(500).json({
        success: false,
        message: "Order processing failed",
        error: error.message,
      });
    }
  }
);

// @desc    Get payment methods
// @route   GET /api/payment/methods
// @access  Public
router.get("/methods", (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: "cod",
        name: "Cash on Delivery",
        description: "Pay when you receive the order",
        icon: "💵",
        available: true,
      },
      {
        id: "stripe",
        name: "Credit/Debit Card",
        description: "Pay securely with Stripe",
        icon: "💳",
        available: !!process.env.STRIPE_SECRET_KEY,
      },
      {
        id: "razorpay",
        name: "Razorpay",
        description: "Pay with UPI, Cards, Net Banking",
        icon: "🔷",
        available: !!process.env.RAZORPAY_KEY_ID,
      },
    ],
  });
});

// @desc    Get payment status
// @route   GET /api/payment/status/:paymentId
// @access  Private
router.get("/status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { gateway } = req.query;

    let payment;

    if (gateway === "stripe") {
      payment = await stripe.paymentIntents.retrieve(paymentId);
    } else if (gateway === "razorpay") {
      payment = await razorpay.payments.fetch(paymentId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment gateway",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Payment Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
});

// @desc    Refund payment
// @route   POST /api/payment/refund
// @access  Private
router.post(
  "/refund",
  [
    body("paymentId").notEmpty().withMessage("Payment ID is required"),
    body("amount").optional().isNumeric().withMessage("Amount must be a number"),
    body("gateway").isIn(["stripe", "razorpay"]).withMessage("Invalid gateway"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { paymentId, amount, gateway } = req.body;

      let refund;

      if (gateway === "stripe") {
        refund = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: amount ? Math.round(amount * 100) : undefined,
        });
      } else if (gateway === "razorpay") {
        refund = await razorpay.payments.refund(paymentId, {
          amount: amount ? Math.round(amount * 100) : undefined,
        });
      }

      res.json({
        success: true,
        message: "Refund processed successfully",
        refund,
      });
    } catch (error) {
      console.error("Refund Error:", error);
      res.status(500).json({
        success: false,
        message: "Refund processing failed",
        error: error.message,
      });
    }
  }
);

module.exports = router;
