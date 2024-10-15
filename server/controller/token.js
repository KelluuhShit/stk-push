const axios = require("axios");

let token = ""; // Store the generated token

// Middleware to create token
const createToken = async (req, res, next) => {
    const secret = "rFgSiLYrO30JvquYI7iUHLZx1Cs4mAF4KZ1xsArn0sXZvhQrA61xvgcme8bZWRhA";
    const consumer = "zkNP0DwqSy5O5k72biYXZAMM1WpGGcDdeleVFbwxJAKwMJS0";
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

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
        console.log("Generated token:", token);
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error generating token:", error.message);
        res.status(400).json({ error: "Token generation failed" });
    }
};

// STK Push handler
const stkPush = async (req, res) => {
    const shortCode = 174379; // Update your shortcode here
    const phone = req.body.phone.substring(1); // Get phone number
    const amount = req.body.amount; // Amount from request
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    // Generate timestamp
    const date = new Date();
    const timestamp = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}`;

    // Generate password
    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const data = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`, // Phone number initiating the transaction
        PartyB: shortCode,
        PhoneNumber: `254${phone}`, // Same phone number
        CallBackURL: "https://stk-push-murex.vercel.app/pat", // Make sure this is your actual callback URL
        AccountReference: "Apex Ventures",
        TransactionDesc: "Payment for product",
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        console.log("STK Push Request Sent", response.data);
        res.status(200).json(response.data); // Send STK Push response to the frontend
    } catch (error) {
        console.error("Error in STK Push:", error.message);
        res.status(400).json({ error: "STK Push failed" });
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
    } else if (resultCode === 1032) {
        console.log(`Transaction cancelled by the user`);
        // Handle user cancellation
    } else {
        console.log(`Payment failed: ${resultDesc}`);
        // Handle other failures
    }

    // Send a success acknowledgment to Safaricom to avoid retries
    res.status(200).send({ message: "Callback received successfully" });
};

module.exports = { createToken, stkPush, handleCallback };
