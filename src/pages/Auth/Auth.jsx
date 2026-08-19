import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Smartphone,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("identity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  const validPhone =
    /^[6-9]\d{9}$/.test(identifier.replace(/\D/g, ""));

  const validIdentifier =
    method === "email" ? validEmail : validPhone;

  const requestOtp = () => {
    if (!validIdentifier) {
      setError(
        method === "email"
          ? "Enter a valid email address."
          : "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 700);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      sessionStorage.setItem(
        "zerotrace_auth",
        JSON.stringify({
          authenticated: true,
          method,
          identifier,
          verifiedAt: new Date().toISOString()
        })
      );

      setLoading(false);
      navigate("/full-report");
    }, 700);
  };

  const resendOtp = () => {
    setError("");
    setOtp("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <div className="auth-page">

      <header className="auth-topbar">

        <button
          onClick={() => navigate("/")}
          className="auth-back"
        >
          <ArrowLeft size={15} />
          BACK TO ZEROTRACE
        </button>

        <div className="auth-brand">
          <div className="auth-logo">Z</div>
          <strong>ZeroTrace</strong>
        </div>

      </header>


      <main className="auth-main">

        <section className="auth-intro">

          <span className="auth-kicker">
            TRASY / SECURE ACCESS
          </span>

          <h1>
            Your report.
            <span>
              Your evidence.
            </span>
          </h1>

          <p>
            Verify your identity to unlock the complete
            TRASY reliability report and download the
            generated PDF.
          </p>


          <div className="auth-trust">

            <ShieldCheck size={16} />

            <div>
              <strong>
                Secure verification
              </strong>

              <span>
                No password required.
              </span>
            </div>

          </div>

        </section>


        <section className="auth-card">

          {step === "identity" ? (

            <>

              <div className="auth-card-header">

                <span>
                  01 / VERIFY IDENTITY
                </span>

                <small>
                  TRASY ACCESS
                </small>

              </div>


              <h2>
                How should we verify you?
              </h2>

              <p className="auth-card-description">
                Choose email or phone verification.
              </p>


              <div className="method-switch">

                <button
                  className={
                    method === "email"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setMethod("email");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  <Mail size={15} />
                  EMAIL
                </button>

                <button
                  className={
                    method === "phone"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setMethod("phone");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  <Smartphone size={15} />
                  PHONE
                </button>

              </div>


              <label>
                {method === "email"
                  ? "EMAIL ADDRESS"
                  : "MOBILE NUMBER"}
              </label>


              <div className="auth-input-wrap">

                {method === "email" ? (
                  <Mail size={15} />
                ) : (
                  <Smartphone size={15} />
                )}

                {method === "phone" && (
                  <span className="country-code">
                    +91
                  </span>
                )}

                <input
                  type={
                    method === "email"
                      ? "email"
                      : "tel"
                  }
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(event.target.value)
                  }
                  placeholder={
                    method === "email"
                      ? "you@example.com"
                      : "9876543210"
                  }
                  autoComplete={
                    method === "email"
                      ? "email"
                      : "tel"
                  }
                />

              </div>


              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}


              <button
                className="auth-primary"
                onClick={requestOtp}
                disabled={loading}
              >

                {loading
                  ? "REQUESTING CODE..."
                  : "SEND VERIFICATION CODE"}

                <ArrowRight size={16} />

              </button>


              <p className="auth-legal">
                By continuing, you agree to use ZeroTrace
                for authorized AI-agent evaluation only.
              </p>

            </>

          ) : (

            <>

              <div className="auth-card-header">

                <span>
                  02 / VERIFY CODE
                </span>

                <small>
                  OTP REQUIRED
                </small>

              </div>


              <div className="otp-icon">
                {method === "email"
                  ? <Mail size={19} />
                  : <Smartphone size={19} />}
              </div>


              <h2>
                Check your {method}.
              </h2>

              <p className="auth-card-description">
                Enter the 6-digit verification code sent
                to your {method === "email"
                  ? identifier
                  : `+91 ${identifier}`}.
              </p>


              <label>
                VERIFICATION CODE
              </label>


              <input
                className="otp-input"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />


              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}


              <button
                className="auth-primary"
                onClick={verifyOtp}
                disabled={
                  loading || otp.length !== 6
                }
              >

                {loading
                  ? "VERIFYING..."
                  : "VERIFY & CONTINUE"}

                <ArrowRight size={16} />

              </button>


              <div className="otp-actions">

                <button
                  onClick={resendOtp}
                  disabled={loading}
                >
                  <RefreshCw size={13} />
                  RESEND CODE
                </button>

                <button
                  onClick={() => {
                    setStep("identity");
                    setOtp("");
                    setError("");
                  }}
                >
                  CHANGE {method === "email"
                    ? "EMAIL"
                    : "NUMBER"}
                </button>

              </div>

            </>

          )}

        </section>

      </main>

    </div>
  );
}

export default Auth;

