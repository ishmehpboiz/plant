"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createPlant, KANYAKUMARI } from "@/lib/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read photo"));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

type Props = {
  onSuccess?: (plantId: number) => void;
};

export function AddPlantForm({ onSuccess }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const missingName = !name.trim();
    const missingPhoto = !photo;
    setNameError(missingName ? "Give the plant a name." : null);
    setPhotoError(missingPhoto ? "Add a photo so species can be identified." : null);
    if (missingName || missingPhoto) return;

    setBusy(true);
    try {
      const photo_base64 = await fileToBase64(photo);
      const plant = await createPlant({
        name: name.trim(),
        photo_base64,
        location_lat: KANYAKUMARI.lat,
        location_lng: KANYAKUMARI.lng,
      });
      if (onSuccess) {
        onSuccess(plant.id);
      } else {
        router.push(`/plants/${plant.id}`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create plant");
      setBusy(false);
    }
  }

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          placeholder="e.g. Backyard papaya"
          autoComplete="off"
          aria-invalid={!!nameError}
        />
      </label>
      {nameError && <p className="form-error form-error--field">{nameError}</p>}

      <label className="field">
        <span>Photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setPhoto(e.target.files?.[0] ?? null);
            if (photoError) setPhotoError(null);
          }}
          aria-invalid={!!photoError}
        />
        <em className="field-hint">
          Mock mode guesses species from the name (try “mango”, “coconut”, “hibiscus”).
          Location defaults to Kanyakumari.
        </em>
      </label>
      {photoError && <p className="form-error form-error--field">{photoError}</p>}

      {submitError && <p className="form-error">{submitError}</p>}

      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? "Identifying…" : "Add plant"}
      </button>
    </form>
  );
}
