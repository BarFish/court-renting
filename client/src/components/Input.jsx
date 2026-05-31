/**
 * Reusable input component with Tailwind styling.
 * Designed for dark mode – background is dark, text is light.
 * Supports optional label and error message.
 */
import React from 'react'
import clsx from 'clsx'

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  className = '',
}) {
  const inputClasses = clsx(
    'w-full rounded-xl bg-surface text-text-primary placeholder:text-muted-text border border-white/10 focus:border-accent-green focus:outline-none p-2',
    { 'border-red-500': error },
    className
  )

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  )
}
