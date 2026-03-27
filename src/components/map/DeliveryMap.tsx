import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
const restaurantIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DeliveryMapProps {
  currentStep: number;
}

// Component to update map view when driver moves
const MapUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ currentStep }) => {
  // Riyadh coordinates
  const restaurantPosition: LatLngExpression = [24.7136, 46.6753];
  const customerPosition: LatLngExpression = [24.7036, 46.6553];
  
  // Simulated driver route points
  const routePoints: LatLngExpression[] = [
    [24.7136, 46.6753], // Start - Restaurant
    [24.7116, 46.6703],
    [24.7096, 46.6653],
    [24.7076, 46.6603],
    [24.7036, 46.6553], // End - Customer
  ];

  const [driverPosition, setDriverPosition] = useState<LatLngExpression>(routePoints[0]);
  const [routeIndex, setRouteIndex] = useState(0);

  // Simulate driver movement when in transit
  useEffect(() => {
    if (currentStep >= 3 && currentStep < 4) {
      const interval = setInterval(() => {
        setRouteIndex((prev) => {
          const next = prev + 1;
          if (next < routePoints.length) {
            setDriverPosition(routePoints[next]);
            return next;
          }
          clearInterval(interval);
          return prev;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const mapCenter: LatLngExpression = currentStep >= 3 ? driverPosition : [24.7086, 46.6653];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentStep >= 3 && <MapUpdater center={driverPosition} />}
        
        {/* Restaurant Marker */}
        <Marker position={restaurantPosition} icon={restaurantIcon}>
          <Popup>
            <div className="text-center font-arabic">
              <strong>مطعم مزاج</strong>
              <br />
              نقطة الانطلاق
            </div>
          </Popup>
        </Marker>

        {/* Customer Marker */}
        <Marker position={customerPosition} icon={customerIcon}>
          <Popup>
            <div className="text-center font-arabic">
              <strong>موقع التوصيل</strong>
              <br />
              وجهتك
            </div>
          </Popup>
        </Marker>

        {/* Driver Marker - Show only when in transit */}
        {currentStep >= 3 && currentStep < 4 && (
          <Marker position={driverPosition} icon={driverIcon}>
            <Popup>
              <div className="text-center font-arabic">
                <strong>السائق</strong>
                <br />
                في الطريق إليك
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: 'hsl(var(--primary))',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
          }}
        />

        {/* Traveled Route - Solid line */}
        {currentStep >= 3 && routeIndex > 0 && (
          <Polyline
            positions={routePoints.slice(0, routeIndex + 1)}
            pathOptions={{
              color: 'hsl(var(--accent))',
              weight: 5,
              opacity: 1,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
