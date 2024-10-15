const axios = require("axios");

// Store the generated token and its expiry
let token = "";
let tokenExpiry = 0;

const createToken = async (req, res, next) => {
    const secret = process.env.MPESA_SECRET; // Use environment variable
    const consumer = process.env.MPESA_CONSUMER; // Use environment variable
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    if (token && tokenExpiry > Date.now()) {
        console.log("Using cached token");
        return next(); // Use cached token
    }

    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    authorization: `Basic ${auth}`,
                },
            }
        );
        token = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000); // Set expiry time
        console.log("Token generated:", token);
        next(); // Move to the next middleware or route handler
    } catch (err) {
        console.error("Token generation error:", err);
        res.status(400).json({ error: "Token generation failed", details: err.response.data });
    }
};


// STK Push handler
const stkPush = async (req, res) => {
    const shortCode = process.env.MPESA_SHORTCODE; // Use environment variable
    const phone = req.body.phone.substring(1); // Get phone number
    const amount = req.body.amount; // Amount from request
    const passkey = process.env.MPESA_PASSKEY; // Use environment variable
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const date = new Date();
    const timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortCode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "https://yourdomain.com/mpesa/callback", // Update to your actual callback URL
        AccountReference: "Apex Ventures",
        TransactionDesc: "Payment for product",
    };

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - Token is missing or invalid." });
    }

    try {
        const response = await axios.post(url, data, {
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        console.log("STK Push Request Sent", response.data);
        res.status(200).json(response.data); // Send STK Push response to the frontend
    } catch (err) {
        console.error("STK Push error:", err);
        res.status(400).json({ error: "STK Push request failed", details: err.response.data });
    }
};

// Callback handling route
const handleCallback = async (req, res) => {
    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode; // 0 means success
    const resultDesc = callbackData.ResultDesc;

    if (resultCode === 0) {
        const amount = callbackData.CallbackMetadata.Item.find(item => item.Name === "Amount").Value;
        const mpesaReceipt = callbackData.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber").Value;
        const phone = callbackData.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber").Value;

        console.log(`Payment successful! Amount: ${amount}, MpesaReceiptNumber: ${mpesaReceipt}, Phone: ${phone}`);
        // Update the payment status in your database as successful
    } else if (resultCode === 1) { // Replace with actual cancellation code if applicable
        console.log(`Payment canceled: ${resultDesc}`);
        // Handle cancellation logic here (e.g., update database status)
    } else {
        console.log(`Payment failed: ${resultDesc}`);
        // Update the payment status in your database as failed
    }

    // Send a success acknowledgment to Safaricom to avoid retries
    res.status(200).send({ message: "Callback received successfully" });
};



module.exports = { createToken, stkPush, handleCallback };
