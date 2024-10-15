const express = require("express");
const router = express.Router();
const { createToken, stkPush, handleCallback, getPaymentStatus } = require("../controller/token");

// Route to create a token and then STK push
router.post("/token", createToken, stkPush); 

// Route for handling callback from MPesa
router.post("/pat", handleCallback); 

// Route to get payment status
router.get("/payment-status", getPaymentStatus); // Add this line

module.exports = router;
