"use client";

import React from "react";
import dynamic from "next/dynamic";
import s from "./MapPickerModal.module.css";
import LeafletMap from "./LeafletMap";
import {
  CloseButtonIcon,
  NovaPoshtaIcon,
  Dandruff2Icon,
} from "../../../Icons/Icons";
import { useScrollLock } from "../../../hooks/useScrollLock";

// Додаємо типи для Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Прості типи для Google Maps
interface GoogleMap {
  new (element: HTMLElement, options: Record<string, unknown>): unknown;
}

interface GoogleMarker {
  new (options: Record<string, unknown>): unknown;
  setMap(map: unknown): void;
  addListener(event: string, callback: () => void): void;
}

interface GoogleInfoWindow {
  new (options: Record<string, unknown>): unknown;
  open(map: unknown, marker: unknown): void;
}

interface GoogleLatLngBounds {
  new (): unknown;
  extend(position: unknown): void;
}

interface GoogleSize {
  new (width: number, height: number): unknown;
}

interface GooglePoint {
  new (x: number, y: number): unknown;
}

declare const google: {
  maps: {
    Map: GoogleMap;
    Marker: GoogleMarker;
    InfoWindow: GoogleInfoWindow;
    LatLngBounds: GoogleLatLngBounds;
    Size: GoogleSize;
    Point: GooglePoint;
    MapTypeId: {
      ROADMAP: string;
    };
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
  selectedCity?: string; // Обране місто з CheckoutSection
};

interface Warehouse {
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  maxWeightPlaceSender?: number;
  maxWeightPlaceRecipient?: number;
  workSchedule: string;
}

interface City {
  name: string;
  ref: string;
  streets: string[];
  branches?: Warehouse[];
  postomats?: Warehouse[];
  warehouses?: Warehouse[];
}

export default function MapPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  selectedCity,
}: Props) {
  useScrollLock(isOpen);

  const [cities, setCities] = React.useState<City[]>([]);
  const [filteredCities, setFilteredCities] = React.useState<City[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCityState, setSelectedCity] = React.useState<City | null>(
    null
  );
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [map, setMap] = React.useState<unknown>(null);
  const [markers, setMarkers] = React.useState<unknown[]>([]);

  // Стан для SVG-карти
  const [svgTransform, setSvgTransform] = React.useState({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const [activeTab, setActiveTab] = React.useState<"branch" | "postomat">(
    "branch"
  );

  // Стан для зберігання координат користувача
  const [userLocation, setUserLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Стан підтвердження геолокації користувача
  const [hasUserConfirmedLocation, setHasUserConfirmedLocation] =
    React.useState(() => {
      // Перевіряємо localStorage при ініціалізації
      if (typeof window !== "undefined") {
        return localStorage.getItem("userLocationConfirmed") === "true";
      }
      return false;
    });

  // Відновлюємо збережену геолокацію при ініціалізації
  React.useEffect(() => {
    if (typeof window !== "undefined" && hasUserConfirmedLocation) {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          setUserLocation(parsedLocation);
          // Автоматично центруємо карту на збереженій геолокації при відкритті
          setShouldCenterOnUserLocation(true);
        } catch (error) {
          // Silent error handling
        }
      }
    }
  }, [hasUserConfirmedLocation]);

  // Стан для контролю центрування карти на геолокації
  const [shouldCenterOnUserLocation, setShouldCenterOnUserLocation] =
    React.useState(false);

  // Динамічне підключення карти Leaflet без SSR
  const LeafletMap = React.useMemo(
    () => dynamic(() => import("./LeafletMap"), { ssr: false }),
    []
  );

  // Ініціалізація карти
  React.useEffect(() => {
    if (isOpen && !map) {
      const initMap = () => {
        const mapElement = document.getElementById("map");
        if (mapElement) {
          try {
            const googleMap = new google.maps.Map(mapElement, {
              zoom: 12,
              center: { lat: 50.4501, lng: 30.5234 }, // Київ
              mapTypeId: google.maps.MapTypeId.ROADMAP,
            });
            setMap(googleMap);
          } catch (error) {
            // Silent error handling
            // Fallback до простого iframe
            mapElement.innerHTML = `
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.534936045404!2d30.516588277052054!3d50.45003377159383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce57e2165b4f%3A0x8d1d3b7c8c2a9f0f!2z0JrQuNC10LLRgdC60LjQuSDQv9C-0LvRjNC90LjQtSDQn9C70L7QstC40L3RgdGM0LrQsCDQmtC-0YDQvtC00L3QuNGG0Y8gLSDQmtC40YDQvtC90LjRhtCw!5e0!3m2!1suk!2sua!4v1712070000000!5m2!1suk!2sua"
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            `;
          }
        }
      };

      // Завантажуємо Google Maps API якщо ще не завантажено
      if (!window.google) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const script = document.createElement("script");

        // Використовуємо API ключ якщо є, інакше безкоштовний підхід
        if (apiKey) {
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        } else {
          // Silent warning
          // Відразу показуємо iframe якщо немає API ключа
          const mapElement = document.getElementById("map");
          if (mapElement) {
            mapElement.innerHTML = `
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.534936045404!2d30.516588277052054!3d50.45003377159383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce57e2165b4f%3A0x8d1d3b7c8c2a9f0f!2z0JrQuNC10LLRgdC60LjQuSDQv9C-0LvRjNC90LjQtSDQn9C70L7QstC40L3RgdGM0LrQsCDQmtC-0YDQvtC00L3QuNGG0Y8gLSDQmtC40YDQvtC90LjRhtCw!5e0!3m2!1suk!2sua!4v1712070000000!5m2!1suk!2sua"
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            `;
          }
          return;
        }

        script.onload = initMap;
        script.onerror = () => {
          // Silent warning
          // Fallback - показуємо iframe замість JavaScript API
          const mapElement = document.getElementById("map");
          if (mapElement) {
            mapElement.innerHTML = `
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.534936045404!2d30.516588277052054!3d50.45003377159383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce57e2165b4f%3A0x8d1d3b7c8c2a9f0f!2z0JrQuNC10LLRgdC60LjQuSDQv9C-0LvRjNC90LjQtSDQn9C70L7QstC40L3RgdGM0LrQsCDQmtC-0YDQvtC00L3QuNGG0Y8gLSDQmtC40YDQvtC90LjRhtCw!5e0!3m2!1suk!2sua!4v1712070000000!5m2!1suk!2sua"
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            `;
          }
        };
        document.head.appendChild(script);
      } else {
        initMap();
      }
    }
  }, [isOpen, map]);

  // Завантаження даних при відкритті модалки
  React.useEffect(() => {
    if (isOpen) {
      if (selectedCity) {
        // Якщо передано обране місто, одразу завантажуємо відділення для нього
        loadWarehousesForCity(selectedCity);
      } else if (cities.length === 0) {
        // Якщо місто не обрано, завантажуємо список міст
        loadCitiesData();
      }
    }
  }, [isOpen, selectedCity, cities.length]);

  const loadCitiesData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/updated_data.json");
      const data = await response.json();
      setCities(data);
      setFilteredCities(data);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const loadWarehousesForCity = async (cityName: string) => {
    setLoading(true);
    try {
      const response = await fetch("/updated_data.json");
      const data = await response.json();

      // Знаходимо місто
      const city = data.find((c: City) => c.name === cityName);
      if (!city) {
        return;
      }

      // Встановлюємо місто як обране
      setSelectedCity(city);

      // Завантажуємо відділення
      const allWarehouses = [
        ...(city.branches || []),
        ...(city.postomats || []),
        ...(city.warehouses || []),
      ];
      setWarehouses(allWarehouses);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  // Фільтрація міст по пошуковому запиту
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCities(cities);
      return;
    }

    const filtered = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.streets.some((street) =>
          street.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredCities(filtered);
  }, [searchQuery, cities]);

  // Оновлення списку відділень при виборі міста
  React.useEffect(() => {
    if (selectedCityState) {
      const allWarehouses = [
        ...(selectedCityState.branches || []),
        ...(selectedCityState.postomats || []),
        ...(selectedCityState.warehouses || []),
      ];
      setWarehouses(allWarehouses);
      // Очищуємо пошук при виборі міста
      setSearchQuery("");
    }
  }, [selectedCityState]);

  const handleWarehouseSelect = React.useCallback(
    (warehouse: Warehouse) => {
      // Форматуємо назву для кращого відображення
      const formattedName = warehouse.name
        .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
        .replace(/Поштомат "Нова Пошта" №\d+: /, "Поштомат: ");

      onSelectLocation(formattedName);
      onClose();
    },
    [onSelectLocation, onClose]
  );

  // Створення статичних маркерів з даних файлу
  React.useEffect(() => {
    if (map && warehouses.length > 0) {
      // Очищуємо попередні маркери
      markers.forEach((marker) => {
        if (marker && typeof marker === "object" && "setMap" in marker) {
          (marker as { setMap: (map: unknown) => void }).setMap(null);
        }
      });
      setMarkers([]);

      const newMarkers: unknown[] = [];
      const bounds = new google.maps.LatLngBounds();

      // Фільтруємо тільки відділення з координатами
      const warehousesWithCoords = warehouses.filter(
        (w) => w.position?.latitude && w.position?.longitude
      );

      warehousesWithCoords.forEach((warehouse) => {
        const info = getWarehouseInfo(warehouse);
        const position = {
          lat: warehouse.position.latitude,
          lng: warehouse.position.longitude,
        };

        // Визначаємо колір та розмір мітки як у Leaflet
        let markerColor = "#3b82f6"; // Синій за замовчуванням
        let markerRadius = 7; // Базовий розмір
        let markerText = "NP";

        if (info.type === "Поштомат") {
          markerColor = "#10b981"; // Зелений для поштоматів
          markerRadius = 8;
          markerText = "П";
        } else if (info.type === "Відділення") {
          markerColor = "#3b82f6"; // Синій для відділень
          markerRadius = 7;
          markerText = "В";
        } else if (info.type === "Пункт приймання") {
          markerColor = "#f59e0b"; // Помаранчевий для пунктів
          markerRadius = 6;
          markerText = "П";
        }

        // Створюємо круглу мітку як у Leaflet CircleMarker
        const icon = {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
              <svg width="${markerRadius * 4}" height="${
              markerRadius * 4
            }" viewBox="0 0 ${markerRadius * 4} ${
              markerRadius * 4
            }" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${markerRadius * 2}" cy="${markerRadius * 2}" r="${
              markerRadius * 1.8
            }" fill="${markerColor}" stroke="#fff" stroke-width="2"/>
                <text x="${markerRadius * 2}" y="${
              markerRadius * 2 + 3
            }" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${markerText}</text>
              </svg>
            `),
          scaledSize: new google.maps.Size(markerRadius * 4, markerRadius * 4),
          anchor: new google.maps.Point(markerRadius * 2, markerRadius * 2),
        };

        const marker = new google.maps.Marker({
          position,
          map,
          icon,
          title: warehouse.name,
        });

        // Створюємо popup як у Leaflet
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 180px; font-family: system-ui;">
              <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <div style="width: 8px; height: 8px; background: ${markerColor}; border-radius: 50%; margin-right: 6px;"></div>
                <h3 style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">${
                  info.type
                }</h3>
              </div>
              <div style="font-size: 12px; color: #374151; margin-bottom: 4px; line-height: 1.3;">
                ${warehouse.name
                  .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
                  .replace(/Поштомат "Нова Пошта" №\d+: /, "")}
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 3px;">
                ${info.features.join(" • ")}
              </div>
              <div style="font-size: 10px; color: #9ca3af;">
                ${info.schedule}
              </div>
            </div>
          `,
        });

        // Обробка кліків як у Leaflet
        if (marker && typeof marker === "object" && "addListener" in marker) {
          (
            marker as {
              addListener: (event: string, callback: () => void) => void;
            }
          ).addListener("click", () => {
            if (
              infoWindow &&
              typeof infoWindow === "object" &&
              "open" in infoWindow
            ) {
              (
                infoWindow as { open: (map: unknown, marker: unknown) => void }
              ).open(map, marker);
            }
            handleWarehouseSelect(warehouse);
          });
        }

        newMarkers.push(marker);
        if (bounds && typeof bounds === "object" && "extend" in bounds) {
          (bounds as { extend: (position: unknown) => void }).extend(position);
        }
      });

      setMarkers(newMarkers);

      // Центруємо карту на всіх маркерах з відступами (як у Leaflet fitBounds)
      if (
        newMarkers.length > 0 &&
        map &&
        typeof map === "object" &&
        "fitBounds" in map
      ) {
        (
          map as {
            fitBounds: (
              bounds: unknown,
              options: Record<string, number>
            ) => void;
          }
        ).fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    }
  }, [map, warehouses, handleWarehouseSelect, markers]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  // Обробники для SVG-карти
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - svgTransform.x,
      y: e.clientY - svgTransform.y,
    });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setSvgTransform({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
        scale: svgTransform.scale,
      });
    }
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
  };

  const handleSvgWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      0.5,
      Math.min(3, svgTransform.scale * scaleFactor)
    );

    setSvgTransform({
      x: svgTransform.x,
      y: svgTransform.y,
      scale: newScale,
    });
  };

  const resetMapView = () => {
    setSvgTransform({ x: 0, y: 0, scale: 1 });
  };

  // Функція для отримання інформації про відділення
  const getWarehouseInfo = (warehouse: Warehouse) => {
    const isPostomat = warehouse.name.includes("Поштомат");
    const maxWeight =
      warehouse.maxWeightPlaceSender || warehouse.maxWeightPlaceRecipient || 0;
    const schedule = warehouse.workSchedule;

    if (isPostomat) {
      // Логіка для поштоматів
      return {
        type: "Поштомат",
        maxWeight,
        schedule,
        is24h: schedule.includes("00:01 - 23:59"),
        isMobile: false, // Поштомати не мобільні
        features: [
          maxWeight > 0 && `До ${maxWeight}кг`,
          schedule.includes("00:01 - 23:59") && "Цілодобово",
          "Автоматичний",
        ].filter(Boolean),
      };
    } else {
      // Логіка для відділень
      const isMobile =
        schedule.includes("мобільне") || schedule.includes("автомобіль");
      const isFullBranch = maxWeight >= 200; // Повноцінні відділення
      const isPoint = maxWeight <= 30; // Пункти приймання-видачі

      return {
        type: isFullBranch ? "Відділення" : "Пункт приймання",
        maxWeight,
        schedule,
        isMobile,
        is24h: false, // Відділення не працюють цілодобово
        features: [
          maxWeight > 0 && `До ${maxWeight}кг`,
          isMobile && "Мобільне",
          isFullBranch && "Повноцінне відділення",
          isPoint && "Пункт приймання",
        ].filter(Boolean),
      };
    }
  };

  if (!isOpen) return null;

  // Фільтруємо склади для карти відповідно до обраного табу
  const filteredWarehousesForMap = warehouses.filter((warehouse) => {
    if (activeTab === "branch") {
      // Показуємо тільки відділення (без поштоматів)
      return (
        (warehouse.name.includes("Відділення") ||
          warehouse.name.includes("Пункт")) &&
        !warehouse.name.includes("Поштомат")
      );
    } else {
      // Показуємо тільки поштомати (без відділень)
      return (
        warehouse.name.includes("Поштомат") &&
        !warehouse.name.includes("Відділення") &&
        !warehouse.name.includes("Пункт")
      );
    }
  });

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.body}>
          <div className={s.mapBox}>
            <LeafletMap
              warehouses={filteredWarehousesForMap}
              onSelect={(text: string) => {
                onSelectLocation(text);
                onClose();
              }}
              center={
                (filteredWarehousesForMap.find(
                  (w) => w.position?.latitude && w.position?.longitude
                ) && {
                  lat: filteredWarehousesForMap.find(
                    (w) => w.position?.latitude && w.position?.longitude
                  )!.position.latitude,
                  lng: filteredWarehousesForMap.find(
                    (w) => w.position?.latitude && w.position?.longitude
                  )!.position.longitude,
                }) ||
                undefined
              }
              userLocation={userLocation}
              shouldCenterOnUserLocation={shouldCenterOnUserLocation}
              onUserLocationFound={(lat: number, lng: number) => {
                setUserLocation({ lat, lng });
                // Автоматично центруємо карту на новій геолокації
                setShouldCenterOnUserLocation(true);
                // Зберігаємо координати в localStorage для наступних відвідувань
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "userLocation",
                    JSON.stringify({ lat, lng })
                  );
                }
                // Після отримання геолокації дозволяємо користувачу вільно переміщуватися
                setTimeout(() => {
                  setShouldCenterOnUserLocation(false);
                }, 2000); // Через 2 секунди після центрування
              }}
            />
          </div>

          <button
            className={s.locationClose}
            onClick={onClose}
            aria-label="Закрити"
          >
            <CloseButtonIcon />
          </button>
        </div>
        <div className={s.sidePanel}>
          <div className={s.panelTitle}>
            {selectedCityState || selectedCity
              ? `${
                  activeTab === "branch"
                    ? "Оберіть адресу доставки"
                    : "Поштомати"
                }`
              : "Оберіть місто"}
          </div>
          <div className={s.panelDivider}></div>

          <div className={s.tabs}>
            <button
              className={`${s.tab} ${
                activeTab === "branch" ? s.tabActive : ""
              }`}
              onClick={() => setActiveTab("branch")}
            >
              На відділення
            </button>
            <button
              className={`${s.tab} ${
                activeTab === "postomat" ? s.tabActive : ""
              }`}
              onClick={() => setActiveTab("postomat")}
            >
              Поштомат
            </button>
          </div>

          <div className={s.searchWrap}>
            <input
              className={s.search}
              placeholder="Введіть назву міста або відділення"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={s.searchIcon}>
              <Dandruff2Icon />
            </span>
          </div>

          <div className={s.list}>
            {loading ? (
              <div className={s.loading}>Завантаження...</div>
            ) : (
              <>
                {/* Показуємо міста якщо не обрано місто і не передано selectedCity з пропсів */}
                {!selectedCityState &&
                  !selectedCity &&
                  filteredCities.slice(0, 20).map((city) => (
                    <button
                      key={city.ref}
                      className={s.listItem}
                      onClick={() => handleCitySelect(city)}
                    >
                      <span className={s.npIcon}>
                        <NovaPoshtaIcon />
                      </span>
                      <span className={s.itemText}>
                        <span className={s.itemTitle}>{city.name}</span>
                        <span className={s.itemMeta}>
                          {city.streets.length} вулиць
                        </span>
                      </span>
                    </button>
                  ))}

                {/* Показуємо відділення якщо обрано місто або передано selectedCity з пропсів */}
                {(selectedCityState || selectedCity) &&
                  (() => {
                    const filteredWarehouses = warehouses.filter(
                      (warehouse) => {
                        if (activeTab === "branch") {
                          // Показуємо тільки відділення (без поштоматів)
                          return (
                            (warehouse.name.includes("Відділення") ||
                              warehouse.name.includes("Пункт")) &&
                            !warehouse.name.includes("Поштомат")
                          );
                        } else {
                          // Показуємо тільки поштомати (без відділень)
                          return (
                            warehouse.name.includes("Поштомат") &&
                            !warehouse.name.includes("Відділення") &&
                            !warehouse.name.includes("Пункт")
                          );
                        }
                      }
                    );

                    const searchFiltered = filteredWarehouses.filter(
                      (warehouse) =>
                        warehouse.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    );

                    if (searchFiltered.length === 0) {
                      return (
                        <div className={s.emptyState}>
                          {activeTab === "branch"
                            ? "В цьому місті немає відділень"
                            : "В цьому місті немає поштоматів"}
                        </div>
                      );
                    }

                    return searchFiltered
                      .slice(0, 20)
                      .map((warehouse, index) => {
                        const info = getWarehouseInfo(warehouse);
                        return (
                          <button
                            key={index}
                            className={s.listItem}
                            onClick={() => handleWarehouseSelect(warehouse)}
                          >
                            <span className={s.npIcon}>
                              {info.isMobile ? (
                                <span style={{ fontSize: "16px" }}>🚐</span>
                              ) : (
                                <NovaPoshtaIcon />
                              )}
                            </span>
                            <span className={s.itemText}>
                              <span className={s.itemTitle}>
                                {warehouse.name
                                  .replace(
                                    /Пункт приймання-видачі \(до \d+ кг\): /,
                                    ""
                                  )
                                  .replace(
                                    /Поштомат "Нова Пошта" №\d+: /,
                                    "Поштомат: "
                                  )}
                              </span>
                              <span className={s.itemMeta}>
                                {info.features.join(" • ")}
                                {info.schedule && ` • ${info.schedule}`}
                              </span>
                            </span>
                          </button>
                        );
                      });
                  })()}
              </>
            )}
          </div>

          {(selectedCityState || selectedCity) && !selectedCity && (
            <button
              className={s.backButton}
              onClick={() => setSelectedCity(null)}
            >
              ← Назад до міст
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
