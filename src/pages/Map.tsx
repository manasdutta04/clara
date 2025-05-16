import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../lib/leafletFix';
import 'leaflet/dist/leaflet.css';

interface Hospital {
  id: number;
  lat: number;
  lon: number;
  name: string;
}

const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>You are here!</Popup>
    </Marker>
  ) : null;
};

const MapComponent: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        const radius = 10000;
        const query = `
  [out:json];
  (
    node["amenity"="hospital"](around:${radius},${latitude},${longitude});
    way["amenity"="hospital"](around:${radius},${latitude},${longitude});
    relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
    node["amenity"="nursing_home"](around:${radius},${latitude},${longitude});
    way["amenity"="nursing_home"](around:${radius},${latitude},${longitude});
    relation["amenity"="nursing_home"](around:${radius},${latitude},${longitude});
    node["healthcare"](around:${radius},${latitude},${longitude});
    way["healthcare"](around:${radius},${latitude},${longitude});
    relation["healthcare"](around:${radius},${latitude},${longitude});
  );
  out center;
`;

        fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('Overpass response:', data);
            const results: Hospital[] = data.elements.map((el: any) => ({
              id: el.id,
              lat: el.lat || el.center?.lat,
              lon: el.lon || el.center?.lon,
              name: el.tags?.name || 'Unnamed Hospital',
            }));
            setHospitals(results);
            console.log(results)
          })
          .catch((err) => console.error('Overpass API error:', err));
      },
      (err) => alert('Failed to fetch location: ' + err.message)
    );
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Map View</h3>
        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          <MapContainer center={[0, 0]} zoom={2} className="h-full w-full z-0">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <LocationMarker position={position} />
            {hospitals.map((h) => (
              <Marker key={h.id} position={[h.lat, h.lon]} icon={greenHospitalIcon}>
                <Popup>{h.name}</Popup>
              </Marker>
            ))}
            
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;