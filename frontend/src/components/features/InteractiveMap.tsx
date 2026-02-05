import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import type { Destination } from '../../types';

// Fix for default Leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
  destinations?: Destination[];
  className?: string;
}

// Fallback data
const defaultLocations = [
  {
    id: '1',
    name: 'Santorini, Greece',
    lat: 36.3932,
    lng: 25.4615,
    description: 'Iconic white buildings and blue domes overlooking the Aegean Sea.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2070&auto=format&fit=crop'
  },
  // ... (keep other defaults if needed, but usually props will be passed)
];

// Component to handle auto-zooming
function MapController({ destinations }: { destinations: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 0) return;

    // Create bounds from all destination points
    const bounds = L.latLngBounds(destinations.map(d => [d.lat, d.lng]));
    
    // Fit map to bounds with padding
    map.fitBounds(bounds, { 
      padding: [50, 50],
      maxZoom: 12 // Prevent zooming in too close for single points
    });
  }, [destinations, map]);

  return null;
}

export function InteractiveMap({ destinations, className }: InteractiveMapProps) {
  const navigate = useNavigate();
  // If destinations is provided (even empty), use it. Only use defaultLocations if undefined.
  const mapData = destinations !== undefined ? destinations : defaultLocations;

  return (
    <div className={`h-full w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative ${className || ''}`}>
      <MapContainer 
        center={[20, 0] as L.LatLngExpression} 
        zoom={2} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController destinations={mapData} />

        {mapData.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]}
            eventHandlers={{
              click: () => navigate(`/destinations/${loc.id}`),
              mouseover: (e: L.LeafletMouseEvent) => e.target.openTooltip(),
              mouseout: (e: L.LeafletMouseEvent) => e.target.closeTooltip()
            }}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -30]} 
              opacity={1}
              className="custom-map-tooltip"
            >
              <div className="w-48 p-0 overflow-hidden rounded-lg shadow-lg bg-white border-0">
                <div className="h-24 w-full relative">
                  <img src={loc.image} alt={loc.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold text-sm truncate shadow-sm">{loc.name}</p>
                    {'price' in loc && (
                      <p className="text-white/90 text-xs font-medium">From ${String(loc.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Global styles for Leaflet Tooltip customization */}
      <style>{`
        .leaflet-tooltip.custom-map-tooltip {
          background-color: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before {
          border: none !important;
        }
      `}</style>
    </div>
  );
}
