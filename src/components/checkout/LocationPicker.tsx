import React, { useCallback, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { Icon, LatLng } from 'leaflet';
import { Locate, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

const locationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} icon={locationIcon} />;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, onClose }) => {
  const defaultPosition: [number, number] = [24.7136, 46.6753]; // Riyadh
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleGetCurrentLocation = useCallback(() => {
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      toast.error('المتصفح لا يدعم خدمة الموقع');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos: [number, number] = [latitude, longitude];
        setSelectedPosition(newPos);
        mapRef.current?.flyTo(new LatLng(latitude, longitude), 15);
        setIsLocating(false);
        toast.success('تم تحديد موقعك الحالي');
      },
      () => {
        setIsLocating(false);
        toast.error('تعذر الحصول على موقعك. يرجى السماح بالوصول للموقع.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleConfirmLocation = async () => {
    if (!selectedPosition) {
      toast.error('يرجى تحديد موقع على الخريطة');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${selectedPosition[0]}&lon=${selectedPosition[1]}&format=json&accept-language=ar`
      );
      const data = await response.json();
      const address = data.display_name || `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`;
      onLocationSelect(address, selectedPosition[0], selectedPosition[1]);
    } catch {
      onLocationSelect(
        `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`,
        selectedPosition[0],
        selectedPosition[1]
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elegant w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            تحديد موقع التوصيل
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="h-72 relative">
          <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={selectedPosition} setPosition={setSelectedPosition} />
          </MapContainer>

          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[1000] bg-card shadow-lg p-3 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Locate className={`w-5 h-5 text-primary ${isLocating ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        <div className="p-4 bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">اضغط على الخريطة لتحديد موقعك أو استخدم زر الموقع الحالي</p>
        </div>

        <div className="p-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmLocation}
            className="flex-1 btn-primary rounded-full"
            disabled={!selectedPosition}
          >
            تأكيد الموقع
          </Button>
        </div>
      </div>
    </div>
  );
};
