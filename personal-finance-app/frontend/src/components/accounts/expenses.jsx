import React, { useState, useContext } from "react";
import api from "../../services/api";
import { TransactionContext } from "../../context/transactioncontext";

function Expenses() {
  const { loadSummary } = useContext(TransactionContext);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("cash");
  const [date, setDate] = useState("");

  const addExpense = async () => {
    if (!amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/transaction/expense", {
        amount: Number(amount) * -1, // ensure negative value
        category,
        mode,
        date,
      });

      loadSummary();
      alert("Expense added");

      setAmount("");
      setCategory("");
      setMode("cash");
      setDate("");
    } catch (error) {
      console.error("Error adding expense", error);
      alert("Error adding expense");
    }
  };

  return (
    <div className="expense-form">
      <h2>Add Expense</h2>

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

      <button onClick={addExpense}>Add Expense</button>
    </div>
  );
}

export default Expenses;