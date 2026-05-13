'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

// Fix default icon URLs broken by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const customIcon = L.divIcon({
  html: `<div style="
    width: 28px; height: 28px;
    background: #00815c;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
})

const MAP_CENTER = [-37.3195, -57.0228]

export default function MapView({ locations, activeId, onMarkerClick }) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={14}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>'
      />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.loc.lat, loc.loc.lon]}
          icon={customIcon}
          eventHandlers={{
            click: () => onMarkerClick(loc.id),
          }}
        >
          <Popup className="map-popup">
            <div className="popup-inner">
              {loc.photo && (
                <img src={loc.photo} alt={loc.address} className="popup-img" />
              )}
              <div className="popup-body">
                <p className="popup-name">{loc.name}</p>
                <p className="popup-address">{loc.address}</p>
                <Link href={`/propiedad/${loc.id}`} className="popup-btn">
                  Ver propiedad →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
