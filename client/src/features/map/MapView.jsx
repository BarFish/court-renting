/**
 * Map view that shows nearby courts based on user's geolocation.
 * Uses react-leaflet for the map and displays CourtMarker components.
 */
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import useGeolocation from '../../hooks/useGeolocation'
import api from '../../services/api'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

// Fix missing default icon issue in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default function MapView() {
  const { lat, lng, loading, error } = useGeolocation()
  const [courts, setCourts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (lat && lng) {
      api
        .get('/courts/nearby', { params: { lat, lng } })
        .then((res) => setCourts(res.data))
        .catch((err) => console.error('Failed to load nearby courts', err))
    }
  }, [lat, lng])

  if (loading) return <p className="text-center text-text-primary">Fetching location…</p>
  if (error) return <p className="text-center text-red-500">{error}</p>

  const position = [lat, lng]

  return (
    <MapContainer center={position} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* User location marker */}
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
      {/* Courts markers */}
      {courts.map((court) => (
        <Marker
          key={court.id}
          position={[court.latitude, court.longitude]}
          eventHandlers={{
            click: () => navigate(`/courts/${court.id}`),
          }}
        >
          <Popup>
            <div className="flex flex-col items-start">
              <strong>{court.name}</strong>
              <span className="text-sm capitalize">{court.sport_type}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
