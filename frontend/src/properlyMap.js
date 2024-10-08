import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MarkerCluster = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    const markers = L.markerClusterGroup();

    properties.forEach((property) => {
      // Parsing the location string to extract latitude and longitude
      const [latitude, longitude] = property.location
        .replace(/[()]/g, '') // Removing parentheses
        .split(',') // Splitting into [latitude, longitude]
        .map(coord => parseFloat(coord)); // Parsing as float

      if (!isNaN(latitude) && !isNaN(longitude)) {
        const marker = L.marker([latitude, longitude]);

        marker.bindPopup(
          `<strong>${property.property_name}</strong><br>
          Price: $${property.property_price}<br>
          Beds: ${property.beds}, Baths: ${property.baths}<br>
          Location: ${property.property_location}<br>
          Min. Investment: 1/${property.no_of_shares} ownership`
        );

        markers.addLayer(marker);
      }
    });

    map.addLayer(markers);
  }, [map, properties]);

  return null;
};

const PropertyMap = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/properties');
        const data = await response.json();
        console.log(data);
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-center mb-4">Map View of Properties</h2>
      <MapContainer center={[29.7617, 0]} zoom={2.5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerCluster properties={properties} />
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
