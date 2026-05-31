/**
 * List of the current user's bookings with cancel functionality.
 * Shows court name, sport, date, time slot and a Cancel button.
 * Cancel is disabled if the booking is within 24 hours.
 */
import React, { useEffect, useState, useContext } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { AuthContext } from '../auth/authContext'
import { format } from 'date-fns'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const { token } = useContext(AuthContext)

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me')
      setBookings(res.data)
    } catch (err) {
      toast.error('Failed to load your bookings')
    }
  }

  useEffect(() => {
    if (token) fetchBookings()
  }, [token])

  const handleCancel = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel booking'
      toast.error(msg)
    }
  }

  const now = new Date()

  const isCancellable = (booking) => {
    const bookingDate = new Date(booking.booking_date)
    const bookingDateTime = new Date(bookingDate)
    bookingDateTime.setHours(booking.time_slot, 0, 0, 0)
    const diffMs = bookingDateTime - now
    return diffMs >= 24 * 60 * 60 * 1000 // at least 24h ahead
  }

  if (!bookings.length) {
    return <p className="text-center text-text-primary">You have no bookings.</p>
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {bookings.map((b) => (
        <Card key={b.id} title={b.court_name || 'Court'}>
          <p className="mb-1">Sport: {b.sport_type}</p>
          <p className="mb-1">Date: {format(new Date(b.booking_date), 'PPP')}</p>
          <p className="mb-2">Time: {b.time_slot}:00 – {b.time_slot + 1}:00</p>
          <Button
            variant="danger"
            onClick={() => handleCancel(b.id)}
            disabled={!isCancellable(b)}
            className="
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </Button>
        </Card>
      ))}
    </div>
  )
}
