import Link from "next/link";
import { AddPlantForm } from "@/components/AddPlantForm";

export default function NewPlantPage() {
  return (
    <main>
      <Link href="/" className="back-link">
        ← All plants
      </Link>
      <section className="hero-block">
        <h1>Add a plant</h1>
        <p>
          Upload a photo for species ID (mocked for now) and register it at the
          Kanyakumari garden location.
        </p>
      </section>
      <AddPlantForm />
    </main>
  );
}
