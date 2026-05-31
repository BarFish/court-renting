/**
 * Grid that displays hourly slots for a court on a selected date.
 * Open slots are clickable (green) and will create a booking via the API.
 * Taken slots are shown in muted style and are not clickable.
 */
import React from 'react'
import Button from '../../components/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AvailabilityGrid({ courtId, date, availableSlots }) {
  const handleBook = async (slot) => {
    try {
      await api.post('/bookings/', { court_id: courtId, booking_date: date, time_slot: slot })
      toast.success(`Booked ${slot}:00 – ${slot + 1}:00`)
      // Refresh could be handled by parent re-fetch; here we just trigger a simple reload
      window.location.reload()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to book slot'
      toast.error(msg)
    }
  }

  // Determine full range based on court open/close – we rely on parent to provide full range via availableSlots only.
  // To render the full grid with taken slots, we need the court's operating hours.
  // For simplicity, assume slots 0‑23; render each hour with appropriate state.
  const allHours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {allHours.map((hour) => {
        const isAvailable = availableSlots.includes(hour)
        const label = `${hour}:00 – ${hour + 1}:00`
        return isAvailable ? (
          <Button
            key={hour}
            variant="primary"
            onClick={() => handleBook(hour)}
            className="text-sm"
          >
            {label}
          </Button>
        ) : (
          <div
            key={hour}
            className="rounded-xl bg-muted text-muted-text p-2 text-center text-sm"
          >
            {label}\nTaken
          </div>
        )
      })}
    </div>
  )
}
