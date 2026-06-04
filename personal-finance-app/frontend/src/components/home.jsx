import React, { useEffect, useContext } from "react";
import { TransactionContext } from "../context/transactioncontext";
import Navbar from "./navbar";
import MonthlyGraph from "./graphs/monthlygraph";

function Home() {
  const { summary, loadSummary } = useContext(TransactionContext);

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      <div className="balances">
        <h2 style={{ color: "green" }}>Income: +{summary.income}</h2>
        <h2 style={{ color: "red" }}>Expenses: -{summary.expenses}</h2>
        <h2 style={{ color: "blue" }}>Balance: {summary.balance}</h2>
      </div>

      <MonthlyGraph data={summary.graphData} />
    </div>
  );
}

export default Home;