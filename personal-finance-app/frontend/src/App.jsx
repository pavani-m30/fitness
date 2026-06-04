import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./components/login";
import Home from "./components/home";
import AccountsPage from "./components/accounts/accountpage";
import Income from "./components/accounts/income";
import Expenses from "./components/accounts/expenses";
import Transfers from "./components/accounts/transfers";
import BudgetGoals from "./components/budgetgoals";

import { AuthProvider } from "./context/authcontext";
import { TransactionProvider } from "./context/transactioncontext";

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/budget-goals" element={<BudgetGoals />} />
        </Routes>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;