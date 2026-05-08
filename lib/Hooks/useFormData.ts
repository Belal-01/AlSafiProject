"use client"
import { useActionState, useCallback, useState, type ChangeEvent } from "react";

type FormErrors = Record<string, string>;

type LocationPayload = {
  address: string;
  city: string;
  country: string;
  country_code: string;   // ISO-2 (e.g. "AE")
  postal_code: string;    // can be empty ""
  region: string;
  lat: number;
  lng: number;
  is_default?: boolean;
};

export type ChangeInput =
  | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Record<string, unknown>;

const useFormData = <
  State,
  Payload,
  T extends Record<string, unknown> = Record<string, unknown>
>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  actionInitialState: Awaited<State>,
  initialFormData: T = {} as T
) => {
  const [actionState, formAction, isPending] = useActionState(action, actionInitialState);

  const [formData, setFormData] = useState<T>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const isValid = Object.values(errors).every((err) => err === "");

  const handleAddError = useCallback((id: string, value: string = "") => {
    setErrors((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleChange =
    (field: string) =>
      (input: ChangeInput): void => {
        const value =
          input && typeof input === "object" && "target" in input
            ? (input as ChangeEvent<HTMLInputElement>).target.value
            : input;

        setFormData((prev) => {
          const keys = field.split(".");
          let updated: T;

          if (keys.length > 1) {
            const [parent, child] = keys;
            updated = {
              ...prev,
              [parent]: {
                ...(prev as Record<string, unknown>)[parent] as Record<string, unknown>,
                [child]: value,
              },
            } as unknown as T;
          } else {
            updated = { ...prev, [field]: value } as T;
          }

          return updated;
        });
      };

  const handleArrayChange = <K extends keyof T>(field: K, data: T[K]) => {
    const updated = { ...formData, [field]: data };
    setFormData(updated);
  };

  const updateLocation = (loc: LocationPayload) => {
    console.log("test loc", loc);

    setFormData((prev: T) => ({
      ...prev,
      address: loc.address,
      latitude: loc.lat,
      longitude: loc.lng,
      city: loc.city,
      country: loc.country,
      country_code: loc.country_code,
      region: loc.region,
      postal_code: loc.postal_code,
      is_default: loc.is_default,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    actionState,
    formAction,
    isPending,
    formData,
    setFormData,
    handleChange,
    updateLocation,
    resetForm,
    isValid,
    setErrors,
    errors,
    handleAddError,
  };
};

export default useFormData;
