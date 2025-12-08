import React, { useEffect, useMemo, useRef, useState } from "react";
import { useThemeSettingsQuery } from "../../../hooks/useWpQueries";
import { ThemeSettingsPost } from "../../../../lib/bfbApi";
import Image from "next/image";
import styles from "./TrainerMap.module.css";
import { TrainerUser } from "../../types";
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
} from "../../../Icons/Icons";
import InstructingSlider from "../InstructingSlider/InstructingSlider";
import ContactsTrainerMapSkeleton from "./TrainerMapSkeleton";

declare global {
  interface Window {
    L: {
      map: (element: HTMLElement) => LeafletMap;
      tileLayer: (
        url: string,
        options: Record<string, unknown>
      ) => LeafletTileLayer;
      marker: (
        coords: [number, number],
        options?: { icon?: unknown }
      ) => LeafletMarker;
      icon: (options: {
        iconUrl: string;
        iconSize: [number, number];
        iconAnchor: [number, number];
        popupAnchor: [number, number];
      }) => unknown;
      latLngBounds: (coords: [number, number][]) => unknown;
    };
  }
}

interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
  fitBounds: (
    bounds: unknown,
    options?: { padding?: [number, number]; maxZoom?: number }
  ) => void;
  eachLayer?: (cb: (layer: unknown) => void) => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: string) => LeafletMarker;
}

interface MapMarker {
  title: string;
  coordinates: [number, number][];
}

interface TrainerMapProps {
  mapMarkers?: MapMarker[];
  trainer?: TrainerUser;
}

interface GalleryItem {
  hl_img_link_photo: string[];
}

interface ContactItem {
  hl_input_text_link?: string;
  hl_img_svg_icon: string;
}

export default function TrainerMap({ mapMarkers, trainer }: TrainerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [localMarkers, setLocalMarkers] = useState<MapMarker[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  type ThemeTrainerLike = {
    input_text_phone?: string;
    input_text_email?: string;
    input_text_address?: string;
    hl_data_contact?: ContactItem[];
    hl_data_gallery?: GalleryItem[];
    location_city?: string;
    location_country?: string;
    my_wlocation?: Array<{
      hl_input_text_title?: string;
      hl_input_text_email?: string;
      hl_input_text_phone?: string;
      hl_input_text_schedule_two?: string;
      hl_input_text_schedule_five?: string;
      hl_input_text_address?: string;
      hl_input_text_coord_lat?: string;
      hl_input_text_coord_ln?: string;
      coord_lat?: string;
      coord_lng?: string;
      latitude?: string | number;
      longitude?: string | number;
      lat?: string | number;
      lng?: string | number;
    }>;
    my_experience?: Array<{
      hl_input_text_gym?: string;
    }>;
    social_phone?: string;
  };
  const [localTrainer, setLocalTrainer] = useState<ThemeTrainerLike | null>(
    null
  );

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsSliderOpen(true);
  };

  const closeGallery = () => {
    setIsSliderOpen(false);
  };

  // Load theme_settings (available for gallery fallback/priority)

  const getGalleryImages = () => {
    // 1) пріоритетна галерея з theme_settings
    const themeFirst: ThemeSettingsPost | undefined = Array.isArray(
      themeSettingsData
    )
      ? (themeSettingsData[0] as ThemeSettingsPost)
      : (themeSettingsData as ThemeSettingsPost | undefined);
    const themeGallery =
      (themeFirst?.acf?.hl_data_gallery as
        | Array<{ hl_img_link_photo?: string[] }>
        | undefined) ||
      ((
        themeFirst as unknown as {
          hl_data_gallery?: Array<{ hl_img_link_photo?: string[] }>;
        }
      )?.hl_data_gallery as
        | Array<{ hl_img_link_photo?: string[] }>
        | undefined);
    if (Array.isArray(themeGallery) && themeGallery.length > 0) {
      return themeGallery.map(
        (item) =>
          (item?.hl_img_link_photo?.[0] as string) ||
          "/images/location-placeholder.svg"
      );
    }

    // 2) галерея тренера / effectiveTrainer
    const t = (effectiveTrainer || trainer) as
      | ThemeTrainerLike
      | TrainerUser
      | undefined;
    const gallery = (t && (t as ThemeTrainerLike).hl_data_gallery) as
      | GalleryItem[]
      | undefined;
    if (gallery && gallery.length > 0) {
      return gallery.map(
        (galleryItem: GalleryItem) =>
          galleryItem.hl_img_link_photo[0] || "/images/location-placeholder.svg"
      );
    }

    // 3) фолбек
    return [
      "/images/location-placeholder.svg",
      "/images/location-placeholder.svg",
    ];
  };

  // Load theme_settings when props not provided
  const { data: themeSettingsData } = useThemeSettingsQuery();
  useEffect(() => {
    const shouldLoad = !mapMarkers || mapMarkers.length === 0 || !trainer;
    if (!shouldLoad) {
      setIsLoading(false);
      return;
    }
    const raw = themeSettingsData as unknown;
    if (!raw) {
      setIsLoading(false);
      return;
    }
    type ThemeSettings = {
      map_markers?: Array<{ title?: string; coordinates?: [number, number][] }>;
      input_text_phone?: string;
      input_text_email?: string;
      input_text_address?: string;
      hl_data_contact?: unknown[];
      hl_data_gallery?: unknown[];
    };
    const first: ThemeSettings | undefined = Array.isArray(raw)
      ? ((raw as ThemeSettings[])[0] as ThemeSettings)
      : (raw as ThemeSettings);
    if (!first) {
      setIsLoading(false);
      return;
    }
    const markers: MapMarker[] = Array.isArray(first?.map_markers)
      ? (
          first.map_markers as Array<{
            title?: string;
            coordinates?: [number, number][];
          }>
        ).map((m) => ({
          title: m?.title || "Головний зал BFB",
          coordinates: Array.isArray(m?.coordinates)
            ? (m.coordinates as [number, number][])
            : [],
        }))
      : [];
    const trainerLike: ThemeTrainerLike = {
      input_text_phone: first?.input_text_phone,
      input_text_email: first?.input_text_email,
      input_text_address: first?.input_text_address,
      hl_data_contact: Array.isArray(first?.hl_data_contact)
        ? (first.hl_data_contact as ContactItem[])
        : [],
      hl_data_gallery: Array.isArray(first?.hl_data_gallery)
        ? (first.hl_data_gallery as GalleryItem[])
        : [],
      location_city: undefined,
      location_country: undefined,
      my_wlocation: [],
      my_experience: [],
      social_phone: undefined,
    };
    if (markers.length > 0) setLocalMarkers(markers);
    setLocalTrainer(trainerLike);
    setIsLoading(false);
  }, [mapMarkers, trainer, themeSettingsData]);

  const effectiveTrainer = useMemo(() => {
    return trainer || localTrainer || undefined;
  }, [trainer, localTrainer]);

  const effectiveMarkers = useMemo<MapMarker[] | undefined>(() => {
    // Отримуємо координати з my_wlocation тренера
    const myWlocationMarkers: MapMarker[] = [];
    if (effectiveTrainer?.my_wlocation) {
      effectiveTrainer.my_wlocation.forEach(
        (location: Record<string, unknown>) => {
          const lat = location?.hl_input_text_coord_lat as string;
          const lng = location?.hl_input_text_coord_ln as string;
          if (lat && lng) {
            myWlocationMarkers.push({
              title:
                (location?.hl_input_text_title as string) || "Місце проведення",
              coordinates: [[parseFloat(lat), parseFloat(lng)]],
            });
          }
        }
      );
    }

    // Пріоритет: my_wlocation > mapMarkers > localMarkers
    if (myWlocationMarkers.length > 0) {
      return myWlocationMarkers;
    }

    const result =
      mapMarkers && mapMarkers.length > 0
        ? mapMarkers
        : localMarkers || undefined;

    return result;
  }, [mapMarkers, localMarkers, effectiveTrainer]);

  useEffect(() => {
    const loadMap = async () => {
      try {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        script.onload = () => {
          if (mapRef.current && window.L) {
            const L = window.L;

            const map = L.map(mapRef.current).setView([48.3794, 31.1656], 6);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap contributors",
              maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;

            if (effectiveMarkers && effectiveMarkers.length > 0) {
              const allCoords: Array<[number, number]> = [];
              effectiveMarkers.forEach((markerGroup, groupIndex) => {
                markerGroup.coordinates.forEach((coord, coordIndex) => {
                  allCoords.push(coord);
                  // Створюємо кастомний маркер з SVG іконкою
                  const marker = L.marker(coord, {
                    icon: L.icon({
                      iconUrl: "images/Colour.svg",
                      iconSize: [150, 150],
                      iconAnchor: [20, 40],
                      popupAnchor: [0, -40],
                    }),
                  }).addTo(map);
                  marker.bindPopup(
                    `<div style="min-width: 180px; text-align: center;">
                      <strong>${markerGroup.title}</strong>
                      <div style="font-size: 12px; margin-top: 4px; color: #64748b;">
                        Координати: ${coord[0].toFixed(6)}, ${coord[1].toFixed(
                      6
                    )}
                      </div>
                    </div>`
                  );
                });
              });

              try {
                if (allCoords.length === 1) {
                  map.setView(allCoords[0], 18);
                } else if (allCoords.length > 1 && L.latLngBounds) {
                  const bounds = L.latLngBounds(allCoords);
                  map.fitBounds(bounds, {
                    padding: [32, 32],
                    maxZoom: 18,
                  });
                }
              } catch {}
            }
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        // Silent error handling
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [effectiveMarkers]);

  if (isLoading) {
    return <ContactsTrainerMapSkeleton />;
  }

  return (
    <div id="locations" className={styles.container}>
      <div className={styles.mapHeader}>
        <h4 className={styles.mapTitle}>Карта</h4>
        <h3 className={styles.title}>Головний зал BFB</h3>
      </div>

      <div className={styles.mapContainer}>
        <div ref={mapRef} className={styles.map} />

        {effectiveTrainer && (
          <div className={styles.locationCard}>
            <div className={styles.locationImages}>
              {(() => {
                const previews = getGalleryImages().slice(0, 3);
                if (previews.length === 0) {
                  return (
                    <>
                      <div
                        className={styles.imageWrapper}
                        onClick={() => openGallery(0)}
                      >
                        <Image
                          src="https://via.placeholder.com/160x160/f0f0f0/666?text=Зал"
                          alt="Фото залу"
                          width={160}
                          height={160}
                          className={styles.locationImage}
                        />
                      </div>
                      <div
                        className={styles.imageWrapper}
                        onClick={() => openGallery(1)}
                      >
                        <Image
                          src="https://via.placeholder.com/160x160/f0f0f0/666?text=Зал"
                          alt="Фото залу"
                          width={160}
                          height={160}
                          className={styles.locationImage}
                        />
                      </div>
                    </>
                  );
                }
                return previews.map((src, index) => (
                  <div
                    key={index}
                    className={styles.imageWrapper}
                    onClick={() => openGallery(index)}
                  >
                    <Image
                      src={src}
                      alt="Фото залу"
                      width={160}
                      height={160}
                      unoptimized={src.startsWith(
                        "https://via.placeholder.com"
                      )}
                      onError={(e) => {
                        try {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/location-placeholder.svg";
                        } catch {}
                      }}
                      className={styles.locationImage}
                    />
                  </div>
                ));
              })()}
            </div>
            <h3>Головний зал BFB</h3>
            <div className={styles.locationInfoCont}>
              <div className={styles.locationInfo}>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Телефон:</span>
                    <span className={styles.value}>
                      {effectiveTrainer.input_text_phone ||
                        effectiveTrainer.my_wlocation?.[0]
                          ?.hl_input_text_phone ||
                        effectiveTrainer.social_phone ||
                        "Номер телефону поки що не доступний"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>
                      {effectiveTrainer.input_text_email ||
                        effectiveTrainer.my_wlocation?.[0]
                          ?.hl_input_text_email ||
                        "Email поки що не додано"}
                    </span>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Час роботи у вихідні:</span>
                    <span className={styles.value}>
                      {effectiveTrainer.my_wlocation?.[0]
                        ?.hl_input_text_schedule_two ||
                        "Графік у вихідні не додано"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Час роботи у будні:</span>
                    <span className={styles.value}>
                      {effectiveTrainer.my_wlocation?.[0]
                        ?.hl_input_text_schedule_five ||
                        "Графік у будні не додано"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.infoItemCenter}>
                <span className={styles.label}>Адреса:</span>
                <span className={styles.value}>
                  {effectiveTrainer.input_text_address ||
                    effectiveTrainer.my_wlocation?.[0]?.hl_input_text_address ||
                    "Адресу поки що не додано"}
                </span>
              </div>
            </div>

            <div className={styles.locationSocial}>
              {effectiveTrainer.hl_data_contact &&
              effectiveTrainer.hl_data_contact.length > 0 ? (
                effectiveTrainer.hl_data_contact.map(
                  (contact: ContactItem, index: number) => (
                    <a
                      key={index}
                      href={contact.hl_input_text_link || "#"}
                      className={styles.socialIcon}
                      dangerouslySetInnerHTML={{
                        __html: contact.hl_img_svg_icon,
                      }}
                    />
                  )
                )
              ) : (
                <>
                  <div className={styles.IconsBlock}>
                    <InstagramIcon />
                  </div>
                  <div className={styles.IconsBlock}>
                    <FacebookIcon />
                  </div>
                  <div className={styles.IconsBlock}>
                    <TelegramIcon />
                  </div>
                  <div className={styles.IconsBlock}>
                    <WhatsappIcon />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* List of halls intentionally removed as requested */}
      <InstructingSlider
        images={getGalleryImages()}
        isOpen={isSliderOpen}
        onClose={closeGallery}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
}
