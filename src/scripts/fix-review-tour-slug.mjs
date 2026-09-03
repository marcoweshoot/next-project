/* eslint-disable no-console */
/**
 * Normalizza le recensioni Supabase salvate con `tour_slug` valorizzato con l'id numerico del tour.
 *
 * Succedeva perché `bookings.tour_slug` non è mai stato popolato e il form di recensione
 * ripiegava su `booking.tour_id`. Le recensioni così salvate non venivano mai mostrate
 * sulla pagina del tour, che filtrava per slug esatto.
 *
 * Uso:
 *   DOTENV_CONFIG_PATH=.env.local node -r dotenv/config ./src/scripts/fix-review-tour-slug.mjs [--dry-run]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const isDryRun = process.argv.includes("--dry-run");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function loadSlugByTourId() {
  const file = path.join(process.cwd(), "public", "snapshots", "tours.json");
  const tours = JSON.parse(await fs.readFile(file, "utf8"));

  return new Map(
    tours
      .filter((tour) => tour?.id != null && tour?.slug)
      .map((tour) => [String(tour.id), tour.slug])
  );
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante: serve per aggiornare le recensioni");
  }

  const slugByTourId = await loadSlugByTourId();
  console.log(`[FIX-SLUG] Mappa id -> slug caricata: ${slugByTourId.size} tour`);

  const { data, error } = await supabase
    .from("reviews")
    .select("id, tour_id, tour_slug");

  if (error) throw new Error(`Errore lettura recensioni: ${error.message}`);

  // Sono da sistemare quelle senza slug o con lo slug valorizzato con un id numerico
  const broken = (data || []).filter(
    (review) => !review.tour_slug || /^\d+$/.test(review.tour_slug)
  );

  if (broken.length === 0) {
    console.log("[FIX-SLUG] ✅ Nessuna recensione da sistemare");
    return;
  }

  console.log(`[FIX-SLUG] Trovate ${broken.length} recensioni con tour_slug non valido`);

  let fixed = 0;
  let skipped = 0;

  for (const review of broken) {
    const slug = slugByTourId.get(String(review.tour_id));

    if (!slug) {
      console.warn(`[FIX-SLUG] ⚠️  ${review.id}: nessuno slug per tour_id="${review.tour_id}", salto`);
      skipped += 1;
      continue;
    }

    console.log(`[FIX-SLUG] ${review.id}: "${review.tour_slug}" -> "${slug}"`);

    if (isDryRun) {
      fixed += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ tour_slug: slug })
      .eq("id", review.id);

    if (updateError) {
      console.error(`[FIX-SLUG] ❌ ${review.id}: ${updateError.message}`);
      skipped += 1;
      continue;
    }

    fixed += 1;
  }

  console.log(
    `[FIX-SLUG] ${isDryRun ? "(dry-run) " : ""}✅ Sistemate ${fixed}, saltate ${skipped}`
  );
}

main().catch((err) => {
  console.error("[FIX-SLUG] ❌", err?.message || err);
  process.exit(1);
});
