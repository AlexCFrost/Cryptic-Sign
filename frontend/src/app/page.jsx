"use client";

import Wallet from "./Wallet";
import Transfer from "./Transfer";
import { useState } from "react";

function Page() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div className="page">
      
      <Wallet
        balance={balance}
        privateKey = {privateKey}
        setPrivateKey = {setPrivateKey}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
      />
      <Transfer setBalance={setBalance}
       address={address}
       privateKey = {privateKey} />
    </div>
  );
}

export default Page;