"use client";

import { forwardRef } from "react";
import type { JerseyDesign } from "@/types/jersey";

interface JerseyPreviewProps {
  design: JerseyDesign;
  primary: string;
  secondary: string;
  accent: string;
  playerName: string;
  playerNumber: string;
  sponsorText: string;
  logoDataUrl: string | null;
  className?: string;
}

export const JerseyPreview = forwardRef<SVGSVGElement, JerseyPreviewProps>(
  function JerseyPreview(
    { design, primary, secondary, accent, playerName, playerNumber, sponsorText, logoDataUrl, className },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 400 480"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={shade(primary, -12)} />
          </linearGradient>
          <linearGradient id="sleeveGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={secondary} />
            <stop offset="100%" stopColor={shade(secondary, -10)} />
          </linearGradient>
        </defs>

        {/* shirt body */}
        <path
          d="M70 80 L150 50 L170 70 Q200 90 230 70 L250 50 L330 80 L370 160 L320 180 L320 430 Q320 450 300 450 L100 450 Q80 450 80 430 L80 180 L30 160 Z"
          fill="url(#bodyGrad)"
          stroke={shade(primary, -25)}
          strokeWidth="2"
        />

        {/* sleeves */}
        <path d="M70 80 L30 160 L80 180 L110 110 Z" fill="url(#sleeveGrad)" />
        <path d="M330 80 L370 160 L320 180 L290 110 Z" fill="url(#sleeveGrad)" />

        {/* cuff stripes */}
        <rect x="35" y="155" width="55" height="10" fill={accent} />
        <rect x="310" y="155" width="55" height="10" fill={accent} />

        {/* design-specific overlay */}
        <DesignOverlay design={design} primary={primary} secondary={secondary} accent={accent} />

        {/* collar */}
        <path d="M170 70 Q200 90 230 70 L220 95 Q200 108 180 95 Z" fill={secondary} />

        {/* sponsor text */}
        {sponsorText && (
          <g>
            <rect x="100" y="240" width="200" height="40" rx="6" fill={accent} opacity="0.92" />
            <text
              x="200"
              y="266"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill={shade(secondary, -30)}
              fontFamily="Arial, sans-serif"
            >
              {sponsorText.toUpperCase().slice(0, 14)}
            </text>
          </g>
        )}

        {/* player number — large center bottom */}
        {playerNumber && (
          <text
            x="200"
            y="380"
            textAnchor="middle"
            fontSize="92"
            fontWeight="900"
            fill={accent}
            stroke={shade(secondary, -30)}
            strokeWidth="2"
            fontFamily="Arial Black, sans-serif"
          >
            {playerNumber.slice(0, 2)}
          </text>
        )}

        {/* player name — chest small */}
        {playerName && (
          <text
            x="200"
            y="160"
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            fill={accent}
            fontFamily="Arial, sans-serif"
            letterSpacing="2"
          >
            {playerName.toUpperCase().slice(0, 12)}
          </text>
        )}

        {/* logo (top-left of chest) */}
        {logoDataUrl && (
          <image href={logoDataUrl} x="120" y="170" width="46" height="46" preserveAspectRatio="xMidYMid meet" />
        )}
      </svg>
    );
  },
);

function DesignOverlay({
  design,
  secondary,
  accent,
}: {
  design: JerseyDesign;
  primary: string;
  secondary: string;
  accent: string;
}) {
  switch (design) {
    case "cross":
      return (
        <g opacity="0.55">
          <path d="M80 180 L320 430" stroke={secondary} strokeWidth="40" />
          <path d="M320 180 L80 430" stroke={secondary} strokeWidth="40" />
        </g>
      );
    case "tackle":
      return (
        <g>
          <rect x="80" y="220" width="240" height="20" fill={secondary} />
          <rect x="80" y="260" width="240" height="6" fill={accent} />
          <rect x="80" y="280" width="240" height="20" fill={secondary} />
        </g>
      );
    case "city":
      return null;
    case "pool":
      return (
        <g opacity="0.85">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={80 + i * 35} y={180} width="14" height="270" fill={secondary} opacity={i % 2 === 0 ? 0.5 : 0} />
          ))}
        </g>
      );
    case "nouCamp":
      return (
        <g>
          <rect x="80" y="180" width="60" height="270" fill={secondary} />
          <rect x="200" y="180" width="60" height="270" fill={secondary} />
          <rect x="140" y="180" width="60" height="270" fill={accent} opacity="0.4" />
          <rect x="260" y="180" width="60" height="270" fill={accent} opacity="0.4" />
        </g>
      );
  }
}

function shade(hex: string, percent: number): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  const r = clamp(((num >> 16) & 0xff) + Math.round(255 * (percent / 100)));
  const g = clamp(((num >> 8) & 0xff) + Math.round(255 * (percent / 100)));
  const b = clamp((num & 0xff) + Math.round(255 * (percent / 100)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, n));
}
