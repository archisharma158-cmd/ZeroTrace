import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    localStorage.setItem("zerotrace_user", JSON.stringify({
      email: email || "demo@zerotrace.ai",
      loggedIn: true
    }));
    navigate("/dashboard");
  };

  return (
    <main className="zt-login">
      <div className="zt-login-card">
        <div className="zt-login-logo">ZT</div>
        <span className="zt-eyebrow">ZEROTRACE / SECURE ACCESS</span>
        <h1>Enter the <span>Command Center.</span></h1>
        <p>Sign in to access AI evaluations, TRASY and reliability reports.</p>
        <form onSubmit={login}>
          <label>EMAIL<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>PASSWORD<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button type="submit">ACCESS ZEROTRACE ↗</button>
        </form>
        <small>Demo access is enabled for submission.</small>
      </div>
    </main>
  );
}
