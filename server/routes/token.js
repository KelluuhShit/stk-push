const express = require("express");
const router = express.Router();
const { createToken, stkPush, handleCallback } = require("../controller/token");

router.post("/token", createToken, stkPush); // Create token and then STK push
router.post("/pat", handleCallback); // Callback route

module.exports = router;
