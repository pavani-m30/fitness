import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button onClick={() => navigate("/accounts")}>Accounts</button>
      <button onClick={() => navigate("/budget-goals")}>Budget & Goals</button>
    </div>
  );
}

export default Navbar;