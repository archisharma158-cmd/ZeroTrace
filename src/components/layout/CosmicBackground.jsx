import React from "react";

/**
 * Global Subtle StarField Component for ZeroTrace
 *
 * Renders ONLY a subtle, elegant layer of tiny scattered stars
 * over the original dark ZeroTrace background.
 * Completely transparent container with zero colored nebula or fog overlays.
 */
export default function CosmicBackground() {
  return (
    <div className="zt-starfield" aria-hidden="true">
      {/* 1. Distant Tiny Stars (0.8px - 1px) in soft white, purple, cyan, pink */}
      <div className="zt-stars-layer zt-stars-distant" />

      {/* 2. Mid-tier Scattered Stars (1.2px - 1.5px) with gentle asynchronous twinkle */}
      <div className="zt-stars-layer zt-stars-mid" />

      {/* 3. Sparse Accent Stars (2px - 2.5px) with soft subtle glow */}
      <div className="zt-stars-layer zt-stars-glow" />
    </div>
  );
}
