import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0] || ""}***@${domain}`;
  }
  return `${user.slice(0, 2)}***@${domain}`;
}

function Auth() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("identity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);

  // Handle resend countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus OTP input when step changes to OTP
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const validPhone = /^[6-9]\d{9}$/.test(identifier.replace(/\D/g, ""));
  const validIdentifier = method === "email" ? validEmail : validPhone;

  const requestOtp = async () => {
    if (!validIdentifier) {
      setError(
        method === "email"
          ? "Enter a valid email address."
          : "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setError("");
    setInfoMessage("");
    setLoading(true);

    if (method === "email") {
      try {
        const response = await fetch(`${API_BASE}/api/auth/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier.trim() })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          setStep("otp");
          setCooldown(60);
          setInfoMessage("Verification code sent to your inbox.");
        } else {
          const detail = result.detail || result.message || "Failed to send verification code. Please try again.";
          setError(detail);
        }
      } catch {
        setError("Unable to connect to authentication service. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    } else {
      // Phone verification fallback (demo)
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        setCooldown(60);
      }, 500);
    }
  };

  const completeAuth = (userData) => {
    sessionStorage.setItem("zerotrace_auth", JSON.stringify(userData));
    localStorage.setItem("zerotrace_auth", JSON.stringify(userData));

    // Store login session audit under zerotrace_sessions rather than evaluation history
    try {
      const existingSessions = JSON.parse(
        localStorage.getItem("zerotrace_sessions") || "[]"
      );
      existingSessions.unshift({
        id: "LOGIN-" + Date.now(),
        type: "LOGIN",
        user: userData.identifier,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(
        "zerotrace_sessions",
        JSON.stringify(existingSessions.slice(0, 50))
      );
    } catch {
      // Storage safe
    }

    window.dispatchEvent(new Event("zerotrace-auth-changed"));

    const returnUrl = sessionStorage.getItem("zerotrace_return") || "/dashboard";
    sessionStorage.removeItem("zerotrace_return");
    navigate(returnUrl);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setError("");
    setInfoMessage("");
    setLoading(true);

    if (method === "email") {
      try {
        const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: identifier.trim(),
            otp: otp.trim()
          })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          const userState = result.user || {
            authenticated: true,
            method: "email",
            identifier: identifier.trim().toLowerCase(),
            loginAt: new Date().toISOString()
          };
          completeAuth(userState);
        } else {
          const detail = result.detail || result.message || "Invalid verification code. Please try again.";
          setError(detail);
        }
      } catch {
        setError("Unable to verify code due to network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Phone verification demo fallback
      setTimeout(() => {
        const userState = {
          authenticated: true,
          method: "phone",
          identifier: identifier.trim(),
          loginAt: new Date().toISOString()
        };
        completeAuth(userState);
        setLoading(false);
      }, 500);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;

    setError("");
    setInfoMessage("");
    setOtp("");
    setLoading(true);

    if (method === "email") {
      try {
        const response = await fetch(`${API_BASE}/api/auth/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier.trim() })
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          setCooldown(60);
          setInfoMessage("A new verification code has been sent.");
        } else {
          const detail = result.detail || result.message || "Failed to resend verification code.";
          setError(detail);
        }
      } catch {
        setError("Unable to resend code. Please check your connection.");
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setCooldown(60);
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <button onClick={() => navigate("/")} className="auth-back">
          <ArrowLeft size={15} />
          BACK TO ZEROTRACE
        </button>

        <div className="auth-brand">
          <div className="auth-logo">ZT</div>
          <strong>ZeroTrace</strong>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-intro">
          <span className="auth-kicker">TRASY / SECURE ACCESS</span>

          <h1>
            Your report.
            <span>Your evidence.</span>
          </h1>

          <p>
            Sign in to access your TRASY dashboard, AI evaluations, history,
            and generated reports.
          </p>

          <div className="auth-trust">
            <ShieldCheck size={16} />
            <div>
              <strong>Secure verification</strong>
              <span>Passwordless ZeroTrace email verification.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          {step === "identity" ? (
            <>
              <div className="auth-card-header">
                <span>01 / VERIFY IDENTITY</span>
                <small>ZEROTRACE ACCESS</small>
              </div>

              <h2>Sign in to ZeroTrace</h2>

              <p className="auth-card-description">
                Enter your email address to receive a secure 6-digit verification code.
              </p>

              <div className="method-switch">
                <button
                  className={method === "email" ? "active" : ""}
                  onClick={() => {
                    setMethod("email");
                    setIdentifier("");
                    setError("");
                    setInfoMessage("");
                  }}
                  type="button"
                >
                  <Mail size={15} />
                  EMAIL
                </button>

                <button
                  className={method === "phone" ? "active" : ""}
                  onClick={() => {
                    setMethod("phone");
                    setIdentifier("");
                    setError("");
                    setInfoMessage("");
                  }}
                  type="button"
                >
                  <Smartphone size={15} />
                  PHONE
                </button>
              </div>

              <label>
                {method === "email" ? "EMAIL ADDRESS" : "MOBILE NUMBER"}
              </label>

              <div className="auth-input-wrap">
                {method === "email" ? (
                  <Mail size={15} />
                ) : (
                  <Smartphone size={15} />
                )}

                {method === "phone" && (
                  <span className="country-code">+91</span>
                )}

                <input
                  type={method === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      requestOtp();
                    }
                  }}
                  placeholder={
                    method === "email" ? "you@example.com" : "9876543210"
                  }
                  disabled={loading}
                />
              </div>

              {error && <div className="auth-error">{error}</div>}
              {infoMessage && <div className="auth-success-hint">{infoMessage}</div>}

              <button
                className="auth-primary"
                onClick={requestOtp}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="zt-spin" /> REQUESTING CODE...
                  </>
                ) : (
                  <>
                    Continue with Email <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="auth-legal">
                Authorized AI-agent evaluation & reliability testing.
              </p>
            </>
          ) : (
            <>
              <div className="auth-card-header">
                <span>02 / VERIFY CODE</span>
                <small>OTP REQUIRED</small>
              </div>

              <div className="otp-icon">
                {method === "email" ? (
                  <Mail size={19} />
                ) : (
                  <Smartphone size={19} />
                )}
              </div>

              <h2>Verify your email</h2>

              <p className="auth-card-description">
                Enter the 6-digit verification code sent to:
              </p>

              <div className="otp-masked-badge">
                {method === "email" ? maskEmail(identifier) : identifier}
              </div>

              <label>VERIFICATION CODE</label>

              <input
                ref={otpInputRef}
                className="otp-input"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6 && !loading) {
                    e.preventDefault();
                    verifyOtp();
                  }
                }}
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                autoFocus
                disabled={loading}
              />

              {error && <div className="auth-error">{error}</div>}
              {infoMessage && <div className="auth-success-hint">{infoMessage}</div>}

              <button
                className="auth-primary"
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                type="button"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="zt-spin" /> VERIFYING...
                  </>
                ) : (
                  <>
                    VERIFY & OPEN DASHBOARD <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="otp-actions">
                <button
                  onClick={resendOtp}
                  disabled={loading || cooldown > 0}
                  type="button"
                >
                  <RefreshCw size={13} />
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "RESEND CODE"}
                </button>

                <button
                  onClick={() => {
                    setStep("identity");
                    setOtp("");
                    setError("");
                    setInfoMessage("");
                  }}
                  type="button"
                >
                  CHANGE {method === "email" ? "EMAIL" : "NUMBER"}
                </button>
              </div>

              <p className="auth-legal">
                Code expires in 5 minutes. Never share your verification code.
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Auth;
