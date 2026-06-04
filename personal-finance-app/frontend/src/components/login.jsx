import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { name, mobile });

      if (res.data.status === "success") {
        setUser({ name, mobile });
        navigate("/home");
      } else {
        setError("Not a valid user");
      }
    } catch {
      setError("Server error. Backend not running?");
    }
  };

  return (
    <div className="login-container">
      <h1>Finance Tracker</h1>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;