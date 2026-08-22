import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reusable Global Cosmic Background System for ZeroTrace
 * 
 * Provides a continuous, premium digital galaxy environment across all pages
 * with page-specific intensity hierarchy and theme-aligned AI execution traces.
 */
export default function CosmicBackground({ variant }) {
  const location = useLocation();
  const path = location.pathname;

  // Determine intensity variant based on current route (or explicit prop)
  const intensityClass = useMemo(() => {
    if (variant) return `cosmic-${variant}`;

    if (path === "/" || path === "") {
      return "cosmic-home"; // 1.0 (100% full intensity)
    }
    if (path === "/about") {
      return "cosmic-about"; // 0.65 (calm, soft haze)
    }
    if (path === "/test-ai") {
      return "cosmic-testai"; // 0.45 (clean, functional)
    }
    if (path === "/auth" || path === "/login") {
      return "cosmic-auth"; // 0.55 (moderate cosmic around cards)
    }
    if (path === "/dashboard") {
      return "cosmic-dashboard"; // 0.35 (restrained mission control)
    }
    if (
      path === "/evaluation" ||
      path === "/mission-control" ||
      path === "/investigation"
    ) {
      return "cosmic-eval"; // 0.20 (low-intensity for focused evaluation)
    }
    if (
      path === "/report" ||
      path === "/full-report" ||
      path === "/history"
    ) {
      return "cosmic-report"; // 0.15 (minimal for data-heavy results)
    }
    if (
      path === "/trasy" ||
      path === "/team" ||
      path === "/contact" ||
      path === "/license" ||
      path === "/profile"
    ) {
      return "cosmic-subpage"; // 0.50 (balanced atmospheric)
    }

    return "cosmic-subpage";
  }, [path, variant]);

  // Show execution traces only on designated conceptual pages
  const showTrace = useMemo(() => {
    return (
      path === "/" ||
      path === "" ||
      path === "/about" ||
      path === "/test-ai" ||
      path === "/trasy"
    );
  }, [path]);

  return (
    <div
      className={`zt-cosmic-wrapper ${intensityClass}`}
      aria-hidden="true"
    >
      {/* 1. Milky Way Nebula Layer (Purple / Pink / Violet blurred clouds) */}
      <div className="zt-nebula-cluster" />

      {/* 2. Cosmic Dust & Soft Violet/Magenta Atmospheric Haze */}
      <div className="zt-cosmic-dust" />

      {/* 3. Multi-tier Sparse Starfield (1px, 1.5px, 2px with gentle twinkle) */}
      <div className="zt-stars-layer zt-stars-deep" />
      <div className="zt-stars-layer zt-stars-mid" />
      <div className="zt-stars-layer zt-stars-bright" />

      {/* 4. AI Agent Execution Trace & Constellation Graph */}
      {showTrace && (
        <svg
          className="zt-execution-trace-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Theme-aligned gradient for execution trace path */}
            <linearGradient id="ztTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.04" />
              <stop offset="25%" stopColor="#A855F7" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#EC4899" stopOpacity="0.14" />
              <stop offset="80%" stopColor="#22D3EE" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFA04D" stopOpacity="0.04" />
            </linearGradient>

            {/* Traveling Signal Pulse Gradient */}
            <linearGradient id="ztPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>

            {/* Soft Glow Filter */}
            <filter id="ztGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Deeper Glow Filter */}
            <filter id="ztDeepGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint Neural / Constellation Graph Lines */}
          <g className="zt-neural-lines">
            <line
              x1="1020"
              y1="130"
              x2="1140"
              y2="175"
              stroke="rgba(168, 85, 247, 0.05)"
              strokeWidth="0.75"
              strokeDasharray="3 4"
            />
            <line
              x1="1140"
              y1="175"
              x2="1250"
              y2="230"
              stroke="rgba(236, 72, 153, 0.04)"
              strokeWidth="0.75"
              strokeDasharray="4 4"
            />
            <line
              x1="1140"
              y1="175"
              x2="1090"
              y2="340"
              stroke="rgba(168, 85, 247, 0.04)"
              strokeWidth="0.75"
              strokeDasharray="3 5"
            />
            <line
              x1="1090"
              y1="340"
              x2="980"
              y2="350"
              stroke="rgba(34, 211, 238, 0.04)"
              strokeWidth="0.75"
              strokeDasharray="4 4"
            />
            <line
              x1="980"
              y1="350"
              x2="840"
              y2="470"
              stroke="rgba(168, 85, 247, 0.035)"
              strokeWidth="0.75"
              strokeDasharray="2 4"
            />
            <line
              x1="840"
              y1="470"
              x2="680"
              y2="530"
              stroke="rgba(255, 160, 77, 0.03)"
              strokeWidth="0.75"
              strokeDasharray="3 6"
            />
          </g>

          {/* Primary Curved AI Agent Execution Trace */}
          <path
            d="M 940,95 C 1080,120 1200,160 1250,230 C 1300,300 1220,380 1090,340 C 960,300 900,430 840,470 C 780,510 680,540 560,560"
            fill="none"
            stroke="url(#ztTraceGrad)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            className="zt-trace-base-path"
          />

          {/* Subtle Traveling Signal Pulse */}
          <path
            d="M 940,95 C 1080,120 1200,160 1250,230 C 1300,300 1220,380 1090,340 C 960,300 900,430 840,470 C 780,510 680,540 560,560"
            fill="none"
            stroke="url(#ztPulseGrad)"
            strokeWidth="2.2"
            className="zt-trace-pulse-path"
          />

          {/* Autonomous AI Decision / Trace Nodes */}
          <circle
            cx="1020"
            cy="130"
            r="2.2"
            fill="#A855F7"
            opacity="0.38"
            filter="url(#ztGlow)"
            className="zt-trace-node pulse-slow"
          />
          <circle
            cx="1140"
            cy="175"
            r="2.8"
            fill="#EC4899"
            opacity="0.40"
            filter="url(#ztDeepGlow)"
            className="zt-trace-node pulse-fast"
          />
          <circle
            cx="1140"
            cy="175"
            r="5.5"
            fill="none"
            stroke="rgba(236, 72, 153, 0.18)"
            strokeWidth="0.8"
            className="zt-trace-ring"
          />
          <circle
            cx="1250"
            cy="230"
            r="2.2"
            fill="#C084FC"
            opacity="0.35"
            filter="url(#ztGlow)"
            className="zt-trace-node"
          />
          <circle
            cx="1090"
            cy="340"
            r="2.6"
            fill="#22D3EE"
            opacity="0.36"
            filter="url(#ztDeepGlow)"
            className="zt-trace-node pulse-slow"
          />
          <circle
            cx="840"
            cy="470"
            r="2"
            fill="#E879F9"
            opacity="0.30"
            filter="url(#ztGlow)"
            className="zt-trace-node"
          />

          {/* Secondary Celestial Constellation Nodes */}
          <circle cx="980" cy="350" r="1.5" fill="#E2E8F0" opacity="0.30" />
          <circle cx="860" cy="440" r="1.6" fill="#C084FC" opacity="0.25" />
          <circle cx="680" cy="530" r="1.8" fill="#FFA04D" opacity="0.22" />
        </svg>
      )}
    </div>
  );
}
