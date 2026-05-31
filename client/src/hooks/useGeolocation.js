/**
 * Hook that wraps the browser Geolocation API.
 * Returns { lat, lng, loading, error }.
 */
import { useState, useEffect } from 'react'

export default function useGeolocation() {
  const [state, setState] = useState({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false, error: 'Geolocation not supported' }))
      return
    }
    const onSuccess = (pos) => {
      const { latitude, longitude } = pos.coords
      setState({ lat: latitude, lng: longitude, loading: false, error: null })
    }
    const onError = (err) => {
      setState({ lat: null, lng: null, loading: false, error: err.message })
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError)
  }, [])

  return state
}
