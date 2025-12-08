"use client";

import React from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import s from "./UserLocationMarker.module.css";

type Props = {
  onLocationFound?: (lat: number, lng: number) => void;
  onLocationError?: (error: string) => void;
  refreshTrigger?: number; // Зовнішній тригер для оновлення локації
  shouldCenter?: boolean; // Чи потрібно центрувати карту на геолокації
  userLocation?: { lat: number; lng: number } | null; // Зовнішня геолокація
};

// Компонент для керування центром карти
function MapController({
  userLocation,
  shouldCenter,
}: {
  userLocation: { lat: number; lng: number } | null;
  shouldCenter: boolean;
}) {
  const map = useMap();
  const [hasCentered, setHasCentered] = React.useState(false);

  React.useEffect(() => {
    if (userLocation && shouldCenter && !hasCentered) {
      // Додаємо невелику затримку для стабільності
      const timer = setTimeout(() => {
        map.setView([userLocation.lat, userLocation.lng], 15, {
          animate: true,
          duration: 1.0, // Зменшуємо до 1 секунди
        });
        setHasCentered(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [map, userLocation, shouldCenter, hasCentered]);

  // Скидаємо стан при зміні локації
  React.useEffect(() => {
    setHasCentered(false);
  }, [userLocation]);

  return null;
}

export default function UserLocationMarker({
  onLocationFound,
  onLocationError,
  refreshTrigger,
  shouldCenter = false,
  userLocation: externalUserLocation,
}: Props) {
  // Component loading
  const [userLocation, setUserLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Використовуємо CircleMarker замість іконки

  // Отримуємо геолокацію користувача
  const getUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Геолокація не підтримується цим браузером";
      setError(errorMsg);
      onLocationError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };

        setUserLocation(location);
        setIsLoading(false);
        onLocationFound?.(latitude, longitude);
      },
      (error) => {
        let errorMessage = "Не вдалося отримати геолокацію";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Доступ до геолокації заборонено";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Інформація про місцезнаходження недоступна";
            break;
          case error.TIMEOUT:
            errorMessage = "Час очікування геолокації вичерпано";
            break;
        }

        setError(errorMessage);
        setIsLoading(false);
        onLocationError?.(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 хвилин
      }
    );
  }, [onLocationFound, onLocationError]);

  // Не автоматично запитуємо геолокацію - тільки при зовнішньому тригері

  // Оновлюємо локацію при зміні refreshTrigger
  React.useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      // Додаємо невелику затримку для стабільності
      const timer = setTimeout(() => {
        getUserLocation();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [refreshTrigger, getUserLocation]);

  // Використовуємо зовнішню userLocation якщо вона є
  const currentUserLocation = externalUserLocation || userLocation;

  // Створюємо кастомну іконку для геолокації користувача
  const userLocationIcon = React.useMemo(() => {
    const icon = new Icon({
      iconUrl: "/Frame-1321317309.svg",
      iconSize: [40, 40], // Розмір іконки
      iconAnchor: [20, 40], // Точка якоря внизу іконки
      popupAnchor: [0, -40], // Зміщення попапу
    });

    return icon;
  }, []);

  // Component state

  return (
    <>
      {/* Контролер карти для переходу до координат користувача */}
      <MapController
        userLocation={currentUserLocation}
        shouldCenter={shouldCenter}
      />

      {/* Показуємо маркер тільки якщо є локація */}
      {currentUserLocation ? (
        <>
          {/* Marker з кастомною іконкою для геолокації користувача */}
          <Marker
            position={[currentUserLocation.lat, currentUserLocation.lng]}
            icon={userLocationIcon}
            key={`user-location-${currentUserLocation.lat}-${currentUserLocation.lng}`} // Додаємо key для примусового оновлення
            eventHandlers={{
              add: () => {
                // Marker added
              },
              remove: () => {
                // Marker removed
              },
            }}
          >
            <Popup>
              <div className={s.popupContainer}>
                <strong>Ваше місцезнаходження</strong>
                <div className={s.coordinates}>
                  {currentUserLocation.lat.toFixed(6)},{" "}
                  {currentUserLocation.lng.toFixed(6)}
                </div>
                {isLoading && (
                  <div className={s.loading}>Оновлення локації...</div>
                )}
                {error && <div className={s.error}>{error}</div>}
              </div>
            </Popup>
          </Marker>
        </>
      ) : null}
    </>
  );
}
