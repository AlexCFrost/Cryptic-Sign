"use client";

import server from "@/app/server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    try {
      const privateKey = evt.target.value;
      setPrivateKey(privateKey);
      
      if (!privateKey) {
        setAddress("");
        setBalance(0);
        return;
      }
      
      // Get public key from private key
      const publicKey = secp256k1.getPublicKey(privateKey);
      const address = toHex(publicKey);
      setAddress(address);
      
      // Get balance for this address
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance || 0);
    } catch (error) {
      console.error("Error processing private key:", error);
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input 
          placeholder="Enter your private key" 
          value={privateKey} 
          onChange={onChange}
          type="password"
        ></input>
      </label>

      <div>
        {address && (
          <label>
            Address: {address.slice(0, 10)}...{address.slice(-10)}
          </label>
        )}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;