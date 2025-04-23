const balanceService = require("../Balance/balanceService");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function getBalance(req, res) {
  const { address } = req.params;
  const balance = balanceService.getBalance(address);
  res.send({ balance });
}

// Function to hash transaction data.
function hashTransaction(sender, recipient, amount) {
  return keccak256(utf8ToBytes(JSON.stringify({
    sender, recipient, amount
  })));
}

function sendAmount(req, res) {
  const { sender, recipient, amount, signature } = req.body;
  
  try {
    // Verify the signature
    if (!signature) {
      return res.status(400).send({ message: "Transaction must be signed" });
    }
    
    // Hash the transaction data
    const transactionHash = hashTransaction(sender, recipient, amount);
    console.log("Transaction hash:", toHex(transactionHash));
    
    try {
      const signatureBytes = hexToBytes(signature.signature);
      const recoveryBit = signature.recovery;
      
      let recoveredPublicKey;
      
      try {
        const signatureObj = secp256k1.Signature.fromCompact(signatureBytes);
        signatureObj.recovery = recoveryBit;
        recoveredPublicKey = signatureObj.recoverPublicKey(transactionHash).toRawBytes();
      } catch (e) {
        try {
          recoveredPublicKey = secp256k1.recover(transactionHash, signatureBytes, recoveryBit);
        } catch (e2) {
          throw new Error("Could not recover public key using any available method");
        }
      }
      
      // Get the address from the public key
      const recoveredAddress = toHex(recoveredPublicKey);
      console.log("Recovered address:", recoveredAddress);
      console.log("Sender address:", sender);
      
      // Check if recovered address matches the sender
      if (recoveredAddress.toLowerCase() !== sender.toLowerCase()) {
        return res.status(400).send({ 
          message: "Invalid signature: Recovered address doesn't match sender",
          expected: sender,
          recovered: recoveredAddress
        });
      }
      
      // If the signature is valid - process the transaction
      const updatedBalance = balanceService.send(sender, recipient, amount);
      res.send({ balance: updatedBalance });
    } catch (error) {
      console.error("Signature verification error:", error);
      return res.status(400).send({ 
        message: "Invalid signature: " + error.message
      });
    }
  } catch (error) {
    console.error("Transaction processing error:", error);
    res.status(400).send({ message: error.message });
  }
}

module.exports = { getBalance, sendAmount };