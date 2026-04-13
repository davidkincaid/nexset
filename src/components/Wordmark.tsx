"use client";

import React from "react";

interface WordmarkProps {
  /** Override brand name (white-label mode) */
  name?: string;
  /** Client logo URL — replaces the thin rule when provided */
  logoSrc?: string | null;
  /** Hide the tagline (white-label mode) */
  hideTagline?: boolean;
  /** Scale variant */
  size?: "default" | "small";
  /** Light text for dark backgrounds */
  inverted?: boolean;
}

const defaults = {
  name: "Nexset",
  tagline: "Less admin. More portfolio.",
};

export default function Wordmark({
  name = defaults.name,
  logoSrc = null,
  hideTagline = false,
  size = "default",
  inverted = false,
}: WordmarkProps) {
  const nameColor = inverted ? "#fff" : "#111";
  const ruleColor = inverted ? "rgba(255,255,255,0.3)" : "#111";
  const taglineColor = inverted ? "rgba(255,255,255,0.35)" : "#ccc";

  const nameSize = size === "small" ? "28px" : "38px";
  const taglineSize = size === "small" ? "8px" : "10px";
  const ruleWidth = size === "small" ? "16px" : "20px";

  return (
    <div className="flex flex-col items-start">
      {/* Rule or client logo */}
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={name}
          className={size === "small" ? "h-5 mb-1.5" : "h-6 mb-2"}
        />
      ) : (
        <div
          style={{
            width: ruleWidth,
            height: "1.5px",
            backgroundColor: ruleColor,
            marginBottom: size === "small" ? "6px" : "8px",
          }}
        />
      )}

      {/* Brand name */}
      <span
        style={{
          fontSize: nameSize,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: nameColor,
          lineHeight: 1,
        }}
      >
        {name}
      </span>

      {/* Tagline */}
      {!hideTagline && (
        <span
          style={{
            fontSize: taglineSize,
            fontWeight: 400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: taglineColor,
            marginTop: size === "small" ? "4px" : "6px",
          }}
        >
          {defaults.tagline}
        </span>
      )}
    </div>
  );
}
