"use client";

import React from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

type Warehouse = {
  name: string;
  position: { latitude: number; longitude: number };
  maxWeightPlaceSender?: number;
  maxWeightPlaceRecipient?: number;
  workSchedule: string;
};

type Props = {
  warehouse: Warehouse;
  onSelect: (text: string) => void;
};

function getWarehouseInfo(warehouse: Warehouse) {
  const isPostomat = warehouse.name.includes("Поштомат");
  const maxWeight =
    warehouse.maxWeightPlaceSender || warehouse.maxWeightPlaceRecipient || 0;
  const schedule = warehouse.workSchedule;

  if (isPostomat) {
    return {
      type: "Поштомат",
      isMobile: false,
      schedule,
      maxWeight,
      color: "#10b981",
      radius: 8,
      label: "П",
    };
  }

  const isMobile =
    schedule.includes("мобільне") || schedule.includes("автомобіль");
  const isFullBranch = maxWeight >= 200;
  const isPoint = maxWeight <= 30;
  return {
    type: isFullBranch ? "Відділення" : "Пункт приймання",
    isMobile,
    schedule,
    maxWeight,
    color: isFullBranch ? "#3b82f6" : "#f59e0b",
    radius: isFullBranch ? 7 : 6,
    label: isFullBranch ? "В" : "П",
  };
}

// Створюємо іконку з публічного SVG без додаткових стилів
function createCustomIcon(_warehouse: Warehouse) {
  return new Icon({
    iconUrl: "/Frame-1321317314.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

export default function CustomMarker({ warehouse, onSelect }: Props) {
  const info = getWarehouseInfo(warehouse);
  const icon = createCustomIcon(warehouse);

  return (
    <Marker
      position={[warehouse.position.latitude, warehouse.position.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          const formattedName = warehouse.name
            .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
            .replace(/Поштомат "Нова Пошта" №\d+: /, "Поштомат: ");
          onSelect(formattedName);
        },
      }}
    >
      <Popup>
        <div style={{ minWidth: 180 }}>
          <strong>{info.type}</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {warehouse.name
              .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
              .replace(/Поштомат "Нова Пошта" №\d+: /, "")}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {info.schedule}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
