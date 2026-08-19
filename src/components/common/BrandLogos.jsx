import zerotraceLogo from "../../assets/branding/zerotrace-logo.jpeg";
import trasyLogo from "../../assets/branding/trasy-logo.jpeg";

export function ZeroTraceLogo({ className = "" }) {
  return (
    <img
      src={zerotraceLogo}
      alt="ZeroTrace"
      className={`brand-logo brand-logo-zerotrace ${className}`}
    />
  );
}

export function TrasyLogo({ className = "" }) {
  return (
    <img
      src={trasyLogo}
      alt="TRASY"
      className={`brand-logo brand-logo-trasy ${className}`}
    />
  );
}

