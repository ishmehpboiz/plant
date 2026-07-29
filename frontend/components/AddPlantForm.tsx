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
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the plant a name.");
      return;
    }
    if (!photo) {
      setError("Add a photo so species can be identified.");
      return;
    }

    setBusy(true);
    setError(null);
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
      setError(err instanceof Error ? err.message : "Could not create plant");
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
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Backyard papaya"
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>Photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        <em className="field-hint">
          Mock mode guesses species from the name (try “mango”, “coconut”, “hibiscus”).
          Location defaults to Kanyakumari.
        </em>
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? "Identifying…" : "Add plant"}
      </button>
    </form>
  );
}
