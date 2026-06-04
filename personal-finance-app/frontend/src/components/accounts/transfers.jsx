import React, { useState, useContext } from "react";
import api from "../../services/api";
import { TransactionContext } from "../../context/transactioncontext";

function Transfers() {
  const { loadSummary } = useContext(TransactionContext);

  const [fromAcc, setFromAcc] = useState("");
  const [toAcc, setToAcc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const submitTransfer = async () => {
    if (!fromAcc || !toAcc || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    if (fromAcc === toAcc) {
      alert("From and To account cannot be the same");
      return;
    }

    try {
      await api.post("/transaction/transfer", {
        from_account: fromAcc,
        to_account: toAcc,
        amount: Number(amount),
        date,
      });

      loadSummary();
      alert("Transfer recorded!");

      setFromAcc("");
      setToAcc("");
      setAmount("");
      setDate("");

    } catch (error) {
      console.error("Transfer error:", error);
      alert("Error processing transfer");
    }
  };

  return (
    <div className="transfer-form">
      <h2>Transfer Money</h2>

      <select value={fromAcc} onChange={(e) => setFromAcc(e.target.value)}>
        <option value="">From Account</option>
        <option value="bank">Bank</option>
        <option value="wallet">Wallet</option>
        <option value="cash">Cash</option>
      </select>

      <select value={toAcc} onChange={(e) => setToAcc(e.target.value)}>
        <option value="">To Account</option>
        <option value="bank">Bank</option>
        <option value="wallet">Wallet</option>
        <option value="cash">Cash</option>
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={submitTransfer}>Submit Transfer</button>
    </div>
  );
}

export default Transfers;