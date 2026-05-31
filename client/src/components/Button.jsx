/**
 * Reusable button component with Tailwind styling.
 * Supports three visual variants:
 *  - primary: accent‑filled (neon‑green) with white text
 *  - ghost:   transparent with accent border
 *  - danger:  red background for destructive actions
 */
import React from 'react'
import clsx from 'clsx'

const VARIANT_STYLES = {
  primary: 'bg-accent-green text-white hover:bg-accent-blue',
  ghost: 'bg-transparent border border-white/10 text-white hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) {
  const baseStyles = 'rounded-xl px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantStyles = VARIANT_STYLES[variant] || VARIANT_STYLES.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseStyles, variantStyles, className)}
    >
      {children}
    </button>
  )
}
