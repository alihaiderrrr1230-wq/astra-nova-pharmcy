import React from 'react';

// Reusable glass surface. Composes the CSS .glass class with optional
// size variants, padding, and the optional SVG distortion filter.
export default function GlassCard({
  as: Tag = 'div',
  size = 'lg', // lg | sm | xs
  strong = false,
  distort = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const sizeClass =
    size === 'xs' ? 'glass-xs' : size === 'sm' ? 'glass-sm' : '';
  const classes = [
    'glass',
    sizeClass,
    strong ? 'glass-strong' : '',
    distort ? 'glass-distort' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}
