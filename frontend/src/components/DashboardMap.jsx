import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, Calendar } from 'lucide-react';

// Helper component to recenter the map dynamically when coordinates change
const RecenterMap = ({ center }) => {
  const map = useMap();
  const lat = center ? center[0] : null;
  const lng = center ? center[1] : null;

  useEffect(() => {
    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

const createStatusIcon = (status) => {
  let colorClass = 'bg-safety-crimson';
  let pulseClass = 'bg-safety-crimson/30';

  if (status === 'Resolved') {
    colorClass = 'bg-safety-emerald';
    pulseClass = 'bg-safety-emerald/30';
  } else if (status === 'Investigating' || status === 'Evidence Verification') {
    colorClass = 'bg-safety-amber';
    pulseClass = 'bg-safety-amber/30';
  }

  return L.divIcon({
    className: `custom-status-marker-${status}`,
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 ${pulseClass} rounded-full animate-ping"></div>
        <div class="w-5 h-5 ${colorClass} border-2 border-white rounded-full flex items-center justify-center shadow-lg">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
        <div class="w-5 h-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const DashboardMap = ({ cases, height = "400px", userLocation = null, showUserLocation = false }) => {
  const navigate = useNavigate();

  // Handle empty state gracefully by centering on user location or first case or NY
  const center = showUserLocation && userLocation
    ? userLocation
    : (cases.length > 0 && cases[0].location?.coordinates
      ? [cases[0].location.coordinates[1], cases[0].location.coordinates[0]]
      : [40.7128, -73.98513]);

  const handleMarkerClick = (caseId) => {
    // If we have a user logged in, we can direct them, or redirect to public track page
    const storedUser = localStorage.getItem('theft_protect_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'citizen') {
        navigate(`/citizen/track/${caseId}`);
      } else if (parsed.role === 'officer') {
        navigate(`/officer/case/${caseId}`);
      } else if (parsed.role === 'admin') {
        navigate(`/officer/case/${caseId}`); // Admins can reuse officer details page
      }
    } else {
      navigate(`/track-case?id=${caseId}`);
    }
  };

  return (
    <div className="w-full rounded-xl border border-navy-border overflow-hidden dark-map shadow-glass" style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {showUserLocation && userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>
              <div className="text-white p-2 text-xs font-sans font-semibold">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Your Current Location</span>
                </div>
                <p className="text-[10px] text-slate-light font-normal mt-1">
                  GPS Coordinates: {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        {cases.map((c) => {
          if (!c.location?.coordinates || c.location.coordinates.length !== 2) return null;
          // coordinates is [lng, lat], Leaflet wants [lat, lng]
          const lat = c.location.coordinates[1];
          const lng = c.location.coordinates[0];

          return (
            <Marker key={c._id} position={[lat, lng]} icon={createStatusIcon(c.status)}>
              <Popup>
                <div className="text-white p-1 max-w-[220px]">
                  <div className="flex justify-between items-center border-b border-navy-border pb-1 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-300">{c.caseId}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold capitalize ${
                      c.status === 'Resolved' ? 'bg-safety-emerald/20 text-safety-emerald' :
                      (c.status === 'Investigating' || c.status === 'Evidence Verification') ? 'bg-safety-amber/20 text-safety-amber' :
                      'bg-safety-crimson/20 text-safety-crimson'
                    }`}>{c.status}</span>
                  </div>

                  <h4 className="font-semibold text-sm mb-1 leading-tight">{c.theftType}</h4>
                  
                  <p className="text-[10px] text-slate-light flex items-center mb-1">
                    <MapPin className="h-3 w-3 mr-0.5 shrink-0" />
                    <span className="truncate">{c.location.address}</span>
                  </p>
                  
                  <p className="text-[10px] text-slate-light flex items-center mb-2">
                    <Calendar className="h-3 w-3 mr-0.5 shrink-0" />
                    <span>{new Date(c.incidentDate).toLocaleDateString()}</span>
                  </p>

                  <button
                    onClick={() => handleMarkerClick(c.caseId)}
                    className="w-full text-center py-1 bg-navy-light text-white text-[10px] font-mono font-semibold rounded hover:bg-[#2C4F72] transition"
                  >
                    ACCESS DOSSIER &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;