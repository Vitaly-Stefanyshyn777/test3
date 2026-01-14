"use client";
import React, { useState } from "react";
import { NovaPoshtaIcon } from "@/components/Icons/Icons";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import DropdownField, {
  DropdownOption,
} from "@/components/ui/FormFields/DropdownField";
import BranchDropdownField, {
  BranchDropdownOption,
} from "@/components/ui/FormFields/BranchDropdownField";
import SecondaryInput from "@/components/ui/FormFields/SecondaryInput";
import secondaryInputStyles from "@/components/ui/FormFields/SecondaryInput.module.css";

interface Warehouse {
  name: string;
  position?: {
    latitude: number;
    longitude: number;
  };
  maxWeightPlaceSender?: number;
  maxWeightPlaceRecipient?: number;
  workSchedule?: string;
}

interface DeliveryFormProps {
  deliveryType: string;
  formData: FormData;
  setDeliveryType: (value: string) => void;
  setFormData: (data: FormData) => void;
  setIsMapOpen: (value: boolean) => void;
  errors?: {
    deliveryType?: string;
    city?: string;
    branch?: string;
    house?: string;
    building?: string;
    apartment?: string;
  };
}

export default function DeliveryForm({
  deliveryType,
  formData,
  setDeliveryType,
  setFormData,
  setIsMapOpen,
  errors = {},
}: DeliveryFormProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const deliveryOptions: BranchDropdownOption[] = [
    { value: "branch", label: "На відділення" },
    { value: "postomat", label: "Поштомат" },
    { value: "courier", label: "Курʼєр" },
  ];

  const [cities, setCities] = React.useState<DropdownOption[]>([]);
  const [loadingCities, setLoadingCities] = React.useState(false);

  // Завантаження міст з updated_data.json
  React.useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch("/updated_data.json");
        const data = await response.json();

        // Витягуємо унікальні міста
        const uniqueCities = (data as Array<{ name?: string }>)
          .map((city) => city.name || "")
          .filter(
            (name: string, index: number, arr: string[]) =>
              arr.indexOf(name) === index
          )
          .sort()
          .slice(0, 100) // Обмежуємо до 100 міст для продуктивності
          .map((name: string) => ({ value: name, label: name }));

        setCities(uniqueCities);
      } catch (error) {
        // Silent error handling
        // Fallback до статичних міст
        setCities([
          { value: "Київ", label: "Київ" },
          { value: "Чернігів", label: "Чернігів" },
          { value: "Львів", label: "Львів" },
        ]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  const [branches, setBranches] = React.useState<DropdownOption[]>([]);
  const [loadingBranches, setLoadingBranches] = React.useState(false);

  // Завантаження відділень для обраного міста
  React.useEffect(() => {
    if (!formData.city) {
      setBranches([]);
      return;
    }

    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await fetch("/updated_data.json");
        const data = await response.json();

        // Знаходимо місто
        const selectedCity = (
          data as Array<{
            name?: string;
            branches?: Array<{ name: string }>;
            warehouses?: Array<{ name: string }>;
          }>
        ).find((city) => city.name === formData.city);
        if (!selectedCity) {
          setBranches([]);
          return;
        }

        // Фільтруємо відділення залежно від типу доставки
        let allWarehouses: Warehouse[] = [];

        if (deliveryType === "branch") {
          // Для "На відділення" показуємо відділення та пункти приймання (без поштоматів)
          allWarehouses = [
            ...(selectedCity.branches || []),
            ...(selectedCity.warehouses || []).filter(warehouse =>
              !warehouse.name.includes("Поштомат")
            ),
          ];
        } else if (deliveryType === "postomat") {
          // Для "Поштомат" показуємо тільки поштомати з warehouses
          allWarehouses = [
            ...(selectedCity.warehouses || []).filter(warehouse =>
              warehouse.name.includes("Поштомат")
            ),
          ];
        } else {
          // Для інших типів (якщо знадобиться) показуємо все
          allWarehouses = [
            ...(selectedCity.branches || []),
            ...(selectedCity.warehouses || []),
          ];
        }

        const branchesList: DropdownOption[] = allWarehouses
          .map((warehouse: { name: string }) => {
            const formattedName = warehouse.name
              .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
              .replace(/Поштомат "Нова Пошта" №\d+: /, "Поштомат: ");
            return {
              value: formattedName,
              label: formattedName,
            };
          })
          .slice(0, 50); // Обмежуємо до 50 для продуктивності

        setBranches(branchesList);
      } catch (error) {
        // Silent error handling
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [formData.city, deliveryType]);

  return (
    <div className={s.deliveryBlock}>
      <h2 className={s.sectionTitle}>Доставка</h2>
      <div className={s.deliveryGrid}>
        <div className={s.deliveryRow}>
          <div className={s.inputWrap}>
            <BranchDropdownField
              label=""
              value={deliveryType}
              options={deliveryOptions}
              placeholder="Обери спосіб доставки"
              onChange={(value) => {
                setDeliveryType(value);
                // Очищуємо обране відділення при зміні типу доставки
                setFormData({ ...formData, branch: "" });
              }}
              showLabel={false}
              icon={<NovaPoshtaIcon />}
              hasError={!!errors.deliveryType}
              supportingText={errors.deliveryType || ""}
              isOpen={openDropdown === "delivery"}
              onOpenChange={(isOpen) =>
                setOpenDropdown(isOpen ? "delivery" : null)
              }
              backgroundColor="white"
            />
          </div>
          <div className={s.inputWrap}>
            <DropdownField
              label=""
              value={formData.city}
              options={cities}
              placeholder={loadingCities ? "Завантаження міст..." : "Місто"}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  city: value,
                  branch: "",
                })
              }
              showLabel={false}
              hasError={!!errors.city}
              supportingText={errors.city || ""}
              isOpen={openDropdown === "city"}
              onOpenChange={(isOpen) => setOpenDropdown(isOpen ? "city" : null)}
              backgroundColor="white"
            />
          </div>
        </div>

        <div className={s.deliveryRow}>
          <div className={s.inputWrapBranch}>
            {deliveryType === "courier" ? (
              <SecondaryInput
                label="Адреса доставки"
                type="text"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                inputClassName={secondaryInputStyles.inputWhite}
                hasError={!!errors.branch}
                supportingText={errors.branch || ""}
                placeholder="Введіть повну адресу доставки"
              />
            ) : (
              <DropdownField
                label=""
                value={formData.branch}
                options={branches}
                key={branches.length} // Force re-render when branches change
                placeholder={
                  loadingBranches
                    ? "Завантаження..."
                    : !formData.city
                    ? "Спочатку оберіть місто"
                    : branches.length === 0
                    ? "Немає поштових відділень"
                    : deliveryType === "postomat"
                    ? "Оберіть поштомат"
                    : "На відділення"
                }
                onChange={(value) => setFormData({ ...formData, branch: value })}
                showLabel={false}
                hasError={!!errors.branch}
                supportingText={errors.branch || ""}
                isOpen={openDropdown === "branch"}
                onOpenChange={(isOpen) =>
                  setOpenDropdown(isOpen ? "branch" : null)
                }
                backgroundColor="white"
                disabled={!formData.city || branches.length === 0}
              />
            )}
          </div>
          {deliveryType === "courier" && (
            <div className={s.addressFields}>
              <div className={`${s.inputWrap} ${s.inputWrapHouse}`}>
                <SecondaryInput
                  label="Будинок"
                  type="text"
                  value={formData.house}
                  onChange={(e) =>
                    setFormData({ ...formData, house: e.target.value })
                  }
                  inputClassName={secondaryInputStyles.inputWhite}
                  hasError={!!errors.house}
                  supportingText={errors.house || ""}
                />
              </div>
              <div className={`${s.inputWrap} ${s.inputWrapBuilding}`}>
                <SecondaryInput
                  label="Корпус"
                  type="text"
                  value={formData.building}
                  onChange={(e) =>
                    setFormData({ ...formData, building: e.target.value })
                  }
                  inputClassName={secondaryInputStyles.inputWhite}
                  hasError={!!errors.building}
                  supportingText={errors.building || ""}
                />
              </div>
              <div className={`${s.inputWrap} ${s.inputWrapApartment}`}>
                <SecondaryInput
                  label="Квартира"
                  type="text"
                  value={formData.apartment}
                  onChange={(e) =>
                    setFormData({ ...formData, apartment: e.target.value })
                  }
                  inputClassName={secondaryInputStyles.inputWhite}
                  hasError={!!errors.apartment}
                  supportingText={errors.apartment || ""}
                />
              </div>
            </div>
          )}
          {deliveryType !== "courier" && (
            <button
              className={s.primary}
              onClick={() => setIsMapOpen(true)}
              disabled={!formData.city}
            >
              Обрати на мапі
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
