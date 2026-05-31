/**
 * Court detail page – shows court information, a date picker, and the availability grid.
 */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import AvailabilityGrid from './AvailabilityGrid'

export default function CourtDetail() {
  const { id } = useParams()
  const [court, setCourt] = useState(null)
  const [date, setDate] = useState('') // YYYY-MM-DD format
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch court info on mount
  useEffect(() => {
    api
      .get(`/courts/${id}`)
      .then((res) => setCourt(res.data))
      .catch((err) => toast.error('Failed to load court'))
      .finally(() => setLoading(false))
  }, [id])

  // Fetch availability whenever date changes
  useEffect(() => {
    if (!date) return
    api
      .get(`/courts/${id}/availability`, { params: { date } })
      .then((res) => setAvailability(res.data.available_slots))
      .catch((err) => toast.error('Failed to load availability'))
  }, [id, date])

  if (loading) return <p className="text-center text-text-primary">Loading court…</p>
  if (!court) return <p className="text-center text-red-500">Court not found</p>

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-4 max-w-2xl mx-auto text-text-primary">
      <h2 className="text-2xl font-bold mb-2">{court.name}</h2>
      <p className="mb-2 capitalize">Sport: {court.sport_type}</p>
      <p className="mb-2">Hours: {court.open_hour}:00 – {court.close_hour}:00</p>
      <p className="mb-4">{court.description}</p>

      <label className="block mb-2 font-medium" htmlFor="datePicker">
        Select date:
      </label>
      <input
        id="datePicker"
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-xl bg-surface text-text-primary p-2 border border-white/10 mb-4"
      />

      {date && (
        <AvailabilityGrid courtId={court.id} date={date} availableSlots={availability} />
      )}
    </div>
  )
}
