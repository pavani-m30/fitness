import React, { createContext, useState } from "react";
import api from "../services/api";

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    graphData: []
  });

  // Load summary from backend
  const loadSummary = async () => {
    try {
      const res = await api.get("/transaction/summary");
      setSummary(res.data);
    } catch (err) {
      console.log("Error loading summary:", err);
    }
  };

  return (
    <TransactionContext.Provider value={{ summary, loadSummary }}>
      {children}
    </TransactionContext.Provider>
  );
};