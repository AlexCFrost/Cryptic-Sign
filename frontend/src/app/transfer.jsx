"use client";

import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);

  const setValue = (setter) => (evt) => setter(evt.target.value);
  
  // creating a hash for transaction data.
  function hashTransaction(sender, recipient, amount) {
    return keccak256(utf8ToBytes(JSON.stringify({
      sender, recipient, amount
    })));
  }

  async function transfer(evt) {
    evt.preventDefault();
    setLoading(true);
  
    try {
      const amount = parseInt(sendAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      if (!recipient) {
        throw new Error("Please enter a recipient address");
      }
      
      if (!privateKey) {
        throw new Error("Private key is required to sign transactions");
      }
      
      // Create transaction hash
      const transactionHash = hashTransaction(address, recipient, amount);
      console.log("Transaction hash:", toHex(transactionHash));
      
      // Convert privateKey to format
      const privateKeyBytes = typeof privateKey === "string" && privateKey.startsWith("0x") 
        ? hexToBytes(privateKey.slice(2)) 
        : typeof privateKey === "string" 
          ? hexToBytes(privateKey) 
          : privateKey;
      
      let signatureHex, recoveryBit;
      
      try {
        const signature = secp256k1.sign(transactionHash, privateKeyBytes);
        signatureHex = toHex(signature.toCompactRawBytes ? signature.toCompactRawBytes() : signature);
        recoveryBit = signature.recovery !== undefined ? signature.recovery : signature[64]; 
      } catch (e) {
        console.log("Modern signing failed, trying legacy approach:", e);
        try {
          const signatureData = await secp256k1.sign(transactionHash, privateKeyBytes, { recovered: true });
          signatureHex = toHex(signatureData[0]);
          recoveryBit = signatureData[1];
        } catch (e2) {
          console.error("All signing methods failed:", e2);
          throw new Error("Failed to sign transaction with the available secp256k1 implementation");
        }
      }
      
      // Format signature for the server
      const signatureFormatted = {
        signature: signatureHex,
        recovery: recoveryBit
      };
      
      console.log("Sending transaction with signature:", signatureFormatted);
      
      // Send the transaction with signature
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: amount,
        recipient,
        signature: signatureFormatted
      });
      
      setBalance(balance);
      
      // Clear fields after successful transaction
      setSendAmount("");
      setRecipient("");
      alert("Transaction successful!");
    } catch (ex) {
      console.error("Transaction error:", ex);
      alert(ex.response?.data?.message || ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          disabled={loading}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          disabled={loading}
        ></input>
      </label>

      <input 
        type="submit" 
        className="button" 
        value={loading ? "Processing..." : "Transfer"} 
        disabled={loading}
      />
    </form>
  );
}

export default Transfer;