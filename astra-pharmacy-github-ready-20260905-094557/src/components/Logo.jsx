import React from 'react';

// ---------------------------------------------------------------------
// ASTRA logo mark — uses the brand's official reference image
// (`astra-logo-reference.jpg` in /public) directly. The image is the
// ground-truth shape (cream five-pointed star with R + A monogram
// cutouts) so it always matches the brand. The cream star is also
// exposed as a recolourable inline-SVG fallback for contexts that
// need a transparent, theme-tinted star.
// ---------------------------------------------------------------------
export default function Logo({
  size = 40,
  className = '',
  title = 'Astra Pharmacy',
  variant = 'image', // 'image' | 'svg'
}) {
  if (variant === 'svg') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label={title}
        fill="currentColor"
      >
        <defs>
          <mask id="astra-monogram-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
            <rect x="0" y="0" width="64" height="64" fill="black" />
            <path
              d="M 32 4 L 39.2 22.4 L 58.8 23.4 L 43.6 35.6 L 48.8 54.6 L 32 44 L 15.2 54.6 L 20.4 35.6 L 5.2 23.4 L 24.8 22.4 Z"
              fill="white"
              stroke="white"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path d="M 32 4 L 39.2 22.4 L 33 22.4 L 32 12 L 31 22.4 L 24.8 22.4 Z" fill="black" />
            <rect x="28.5" y="20" width="8" height="2.6" rx="1.2" fill="black" />
            <circle cx="20" cy="26" r="5" fill="black" />
            <path d="M 18 30 L 24 33 L 14 50 L 8 47 Z" fill="black" />
          </mask>
        </defs>
        <path
          d="M 32 4 L 39.2 22.4 L 58.8 23.4 L 43.6 35.6 L 48.8 54.6 L 32 44 L 15.2 54.6 L 20.4 35.6 L 5.2 23.4 L 24.8 22.4 Z"
          mask="url(#astra-monogram-mask)"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Default: show the reference image as-is (cream star on navy).
  // The navy square is the brand's identity color and acts as a
  // small "logo badge" inside the glass header.
  return (
    <img
      src="/astra-logo-reference.jpg"
      alt={title}
      width={size}
      height={size}
      className={className}
      draggable="false"
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: Math.round(size * 0.2),
        display: 'block',
      }}
    />
  );
}
