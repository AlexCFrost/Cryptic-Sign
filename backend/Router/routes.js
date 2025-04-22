const express = require("express");
const router = express.Router();
const {
  getBalance,
  sendAmount,
} = require("../Controller/balanceController");

router.get("/balance/:address", getBalance);
router.post("/send", sendAmount);

module.exports = router;
