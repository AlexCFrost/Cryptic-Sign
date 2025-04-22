const balanceService = require("../Balance/balanceService");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes, hexToBytes} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function getBalance(req, res) {
  const { address } = req.params;
  const balance = balanceService.getBalance(address);
  res.send({ balance });
}

// Function to has transaction data.
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
    
    // Convert signature from JSON format to secp256k1 expects
    const sig = {
      r: BigInt(signature.r),
      s: BigInt(signature.s),
      recovery: signature.recovery
    };
    
    // Hash the transaction data
    const transactionHash = hashTransaction(sender, recipient, amount);
    
    // Verify the signature
    try {
      // Attempt to recover the public key from the signature
      const recoveredPublicKey = secp256k1.recoverPublicKey(
        toHex(transactionHash),
        { r: sig.r, s: sig.s },
        sig.recovery
      );
      
      // Convert to hex format to match our stored addresses
      const recoveredAddress = toHex(recoveredPublicKey);
      
      // Check if recovered address matches the sender
      if (recoveredAddress !== sender) {
        return res.status(400).send({ 
          message: "Invalid signature: Recovered address doesn't match sender" 
        });
      }
      
      // If the signature is valid - process the transaction
      const updatedBalance = balanceService.send(sender, recipient, amount);
      res.send({ balance: updatedBalance });
    } catch (error) {
      return res.status(400).send({ 
        message: "Invalid signature: " + error.message
      });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
}

module.exports = { getBalance, sendAmount };
