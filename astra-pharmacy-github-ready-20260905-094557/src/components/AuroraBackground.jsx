import React from 'react';

// The drifting color blobs that the glass refracts.
// All animation is gated by the `prefers-reduced-motion` media query
// AND by the `reducedMotion` user setting (handled via .reduced-motion
// class on <html> in the CSS).

export default function AuroraBackground() {
  return (
    <>
      {/* SVG filter for the optional glass distortion (used on header / loop) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="glass-distort" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="2"
              seed="3"
            />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
        </defs>
      </svg>

      <div className="aurora-stage" aria-hidden="true">
        <div className="aurora-blob aurora-blob--mint animate-blob-3" />
        <div className="aurora-blob aurora-blob--mint-2 animate-blob-5" />
        <div className="aurora-blob aurora-blob--violet animate-blob-1" />
        <div className="aurora-blob aurora-blob--cyan animate-blob-2" />
        <div className="aurora-blob aurora-blob--coral animate-blob-4" />
        <div className="aurora-blob aurora-blob--violet-2 animate-blob-1" />
      </div>
    </>
  );
}
