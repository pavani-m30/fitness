import React, { useState, useContext } from "react";
import api from "../../services/api";
import { TransactionContext } from "../../context/transactioncontext";

function Income() {
  const { loadSummary } = useContext(TransactionContext);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("cash");
  const [date, setDate] = useState("");

  const addIncome = async () => {
    if (!amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/transaction/income", {
        amount: Number(amount),
        category,
        mode,
        date,
      });

      loadSummary();
      alert("Income added");
      setAmount("");
      setCategory("");
      setMode("cash");
      setDate("");
    } catch (error) {
      console.error("Error adding income", error);
      alert("Error adding income");
    }
  };

  return (
    <div className="income-form">
      <h2>Add Income</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="food">Food</option>
        <option value="shopping">Shopping</option>
        <option value="medical">Medical</option>
        <option value="grocery">Grocery</option>
        <option value="others">Others</option>
      </select>

      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="upi">Import from UPI</option>
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button onClick={addIncome}>Add Income</button>
    </div>
  );
}

export default Income;