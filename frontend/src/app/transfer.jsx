"use client";

import { useState } from "react";
import server from "./server";
import { secp256k1 } from '@noble/curves/secp256k1';
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // creating a hash for transaction data
  function hashTransaction(sender, recipient, amount) {
    return keccak256(utf8ToBytes(JSON.stringify({
      sender, recipient, amount
    })));
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const amount = parseInt(sendAmount);
      
      // Create transaction hash
      const transactionHash = hashTransaction(address, recipient, amount);
      
      // Sign the transaction hash using the private key
      let signature;
      try {
        if (!privateKey) {
          throw new Error("Private key is required to sign transactions");
        }
        
        // Sign the transaction hash
        signature = secp256k1.sign(toHex(transactionHash), privateKey);
        
        // Get the signature in the format.
        const signatureFormatted = {
          r: signature.r.toString(),
          s: signature.s.toString(),
          recovery: signature.recovery
        };

        // Send the transaction with signature.
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
      } catch (err) {
        alert("Error signing transaction: " + err.message);
      }
    } catch (ex) {
      alert(ex.response?.data?.message || ex.message);
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
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;