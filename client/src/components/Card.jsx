/**
 * Generic card component for dark‑mode UI.
 * Accepts optional title and children. Applies rounded corners,
 * a subtle border, and the surface background color.
 */
import React from 'react'
import clsx from 'clsx'

export default function Card({ title, children, className = '' }) {
  return (
    <div className={clsx('bg-surface rounded-xl border border-white/10 p-4', className)}>
      {title && <h3 className="mb-2 text-lg font-medium text-text-primary">{title}</h3>}
      {children}
    </div>
  )
}
