import React from "react";
import { useNavigate } from "react-router-dom";

function AccountsPage() {
  const navigate = useNavigate();

  return (
    <div className="accounts-container">
      <h1>Accounts</h1>

      <button onClick={() => navigate("/income")}>Income</button>
      <button onClick={() => navigate("/expenses")}>Expenses</button>
      <button onClick={() => navigate("/transfers")}>Transfers</button>
    </div>
  );
}

export default AccountsPage;