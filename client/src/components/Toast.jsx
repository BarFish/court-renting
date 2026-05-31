/**
 * Simple wrapper around `react-hot-toast`.
 * Place <Toast /> once near the root of the app (e.g., in App.jsx).
 */
import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function Toast() {
  return <Toaster position="top-center" reverseOrder={false} />
}
