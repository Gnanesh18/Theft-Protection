import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Navigation, MapPin } from 'lucide-react';

// Custom Gold Pin Icon matching Safeguard Security
const customMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-[#D9A752]/30 rounded-full animate-ping"></div>
      <div class="w-5 h-5 bg-[#141416] border-2 border-[#D9A752] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(217,167,82,0.6)]">
        <div class="w-2 h-2 bg-[#D9A752] rounded-full"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Helper component to recenter the map dynamically when coordinates change
const RecenterMap = ({ position }) => {
  const map = useMap();
  const lat = position ? position[0] : null;
  const lng = position ? position[1] : null;

  useEffect(() => {
    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

const MapSelector = ({ value, onChange, onAddressFetch }) => {
  const [position, setPosition] = useState([40.7128, -73.98513]); // Default: New York
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  const valLng = value && value.length === 2 ? value[0] : null;
  const valLat = value && value.length === 2 ? value[1] : null;

  useEffect(() => {
    if (valLat !== null && valLng !== null) {
      setPosition([valLat, valLng]);
    }
  }, [valLat, valLng]);

  const handleLocationSelect = async (lat, lng) => {
    setPosition([lat, lng]);
    onChange([lng, lat]); // Save as [longitude, latitude] for MongoDB GeoJSON spec

    // Reverse geocode
    setLoadingGeocode(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.data && res.data.display_name) {
        onAddressFetch(res.data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err.message);
      onAddressFetch(`Incident Spot (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } finally {
      setLoadingGeocode(false);
    }
  };

  // Click handler sub-component for Leaflet map events
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  const locateUserGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          handleLocationSelect(latitude, longitude);
        },
        (err) => {
          alert('Unable to retrieve your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-light">
        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 text-safety-crimson mr-1" /> CLICK THE MAP TO SET THEFT LOCATION</span>
        <button
          type="button"
          onClick={locateUserGPS}
          className="flex items-center space-x-1 text-white bg-navy-light/60 hover:bg-navy-light px-2.5 py-1 rounded border border-navy-border transition"
        >
          <Navigation className="h-3 w-3" />
          <span>USE CURRENT GPS</span>
        </button>
      </div>

      <div className="relative w-full h-64 md:h-72 rounded-lg border border-navy-border overflow-hidden dark-map shadow-inner">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          <RecenterMap position={position} />
          <Marker position={position} icon={customMarkerIcon} />
        </MapContainer>

        {loadingGeocode && (
          <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm z-[1000] flex items-center justify-center text-xs font-mono">
            <span className="animate-pulse">DECODING GPS ADDRESS COORDINATES...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;