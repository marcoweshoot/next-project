/* eslint-disable no-console */
import fs from "node:fs/promises";
import path from "node:path";

const ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "https://api.weshoot.it/graphql";

const OUT_DIR = path.join(process.cwd(), "public", "snapshots");
const OUT_LIST = path.join(OUT_DIR, "tours.json");

const MEDIA_BASE = (process.env.NEXT_PUBLIC_STRAPI_URL || "https://api.weshoot.it")
  .replace(/\/+$/, "");

/* ---------------- Helpers ---------------- */
function toAbsUrl(input) {
  if (!input || typeof input !== "string") return null;
  let url = input.trim();
  if (!url) return null;
  if (url.startsWith("//")) return "https:" + url;
  if (/^https?:\/\//i.test(url)) return url;
  const clean = ("/" + url).replace(/\/{2,}/g, "/");
  return `${MEDIA_BASE}${clean}`;
}
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// estrae una URL da varie forme possibili di “image”
function pickImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") return toAbsUrl(img);
  if (Array.isArray(img)) return toAbsUrl(img[0]?.url || null);
  if (typeof img === "object") return toAbsUrl(img.url || null);
  return null;
}
function pickAlt(img) {
  if (!img) return null;
  if (Array.isArray(img)) return img[0]?.alternativeText || null;
  if (typeof img === "object") return img.alternativeText || null;
  return null;
}

/* --------------- Query completa --------------- */
const TOURS_QUERY = /* GraphQL */ `
  query Tours {
    tours {
      id
      tour_id
      slug
      title
      description
      excerpt
      difficulty
      experience_level
      things_needed
      video_url
      locale

      places { slug locale name }
      states { name slug description locale }

      SEO { metaTitle metaDescription structuredData }

      locations {
        id
        title
        description
        slug
        locale
        pictures {
          image { url alternativeText }
        }
        state {
          name
          slug
          locale
          description
        }
        steps {
          id
          title
          description
          locale
        }
      }

      reviews {
        id
        title
        description
        rating
        ratingOrganization
        ratingCordiality
        ratingProfessionality
        ratingKnowledge
        createdAt: published_at
        user {
          firstName
          lastName
          username
          instagram
          bio
          profilePicture { url alternativeText }
          fiscalCode
        }
      }

      whats_includeds {
        title
        description
        locale
        icon { url }
      }
      whats_not_includeds {
        title
        description
        locale
        icon { url }
      }

      days {
        id
        number
        title
        locale
        steps { id title description locale }
      }

      # 👇 AGGIUNTO: id + icon (con campi utili)
      highlights {
        id
        title
        description
        locale
        icon { url alternativeText width height }
      }

      things2know {
        title
        description
        locale
        icon { url }
      }

      sessions {
        id
        start
        end
        status
        maxPax
        price
        deposit
        balance
        minPax
        currency
        priceCompanion
        users {
          instagram
          firstName
          lastName
          username
          profilePicture { url }
          bio
          level
          role {
            name
            description
            type
          }
        }
      }

      faqs { question answer locale }

      image { alternativeText url }

      pictures {
        type
        title
        image { alternativeText url }
      }
    }
  }
`;

/* --------------- fetch --------------- */
async function fetchGQL(query, variables, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`HTTP ${res.status} – risposta non JSON: ${text.slice(0, 300)}…`);
    }
    if (!res.ok || json.errors) {
      throw new Error(`HTTP ${res.status} – ${JSON.stringify(json.errors, null, 2)}`);
    }
    return json.data;
  } finally {
    clearTimeout(t);
  }
}

/* --------------- normalizzazione --------------- */
function normalizeTour(t) {
  // cover
  const image = t.image ? { ...t.image, url: toAbsUrl(t.image.url) } : null;

  // pictures dal tour
  const tourPictures = arr(t.pictures).map((p, i) => {
    const url = pickImageUrl(p.image) || null;
    const alt = pickAlt(p.image) || p.title || null;
    return {
      id: String(p.id ?? i),
      type: p.type ?? null,
      title: p.title ?? null,
      url,
      alt,
    };
  });

  // pictures dalle locations (fallback)
  const locationPictures = arr(t.locations)
    .flatMap((loc, li) =>
      arr(loc.pictures).map((p, pi) => ({
        id: String(p.id ?? `locpic-${li}-${pi}`),
        type: "location",
        title: p.title ?? null,
        url: pickImageUrl(p.image) || null,
        alt: pickAlt(p.image) || p.title || null,
      }))
    );

  // unisco, elimino null, dedup per URL, e se ancora vuoto metto la cover
  const merged = [...tourPictures, ...locationPictures].filter((x) => !!x.url);

  const seen = new Set();
  const pictures = merged.filter((p) => {
    if (!p.url) return false;
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  if (pictures.length === 0 && image?.url) {
    pictures.push({
      id: "cover",
      type: "cover",
      title: t.title ?? null,
      url: image.url,
      alt: image.alternativeText ?? t.title ?? null,
    });
  }

  // sessions + coach avatars
  const sessions = arr(t.sessions).map((s, i) => ({
    id: s.id || `${s.start || "?"}-${s.end || "?"}-${i}`,
    ...s,
    users: arr(s.users).map((u) => ({
      ...u,
      profilePicture: u?.profilePicture
        ? { ...u.profilePicture, url: toAbsUrl(u.profilePicture.url) }
        : null,
    })),
  }));

  // ✅ reviews -> normalizza e garantisce created_at + avatar assoluto
  const reviews = arr(t.reviews).map((r, i) => ({
    id: String(r.id ?? `rev-${i}`),
    title: r.title ?? "",
    description: r.description ?? "",
    rating: Number.isFinite(r.rating) ? r.rating : 5,
    ratingOrganization: Number.isFinite(r.ratingOrganization) ? r.ratingOrganization : null,
    ratingCordiality: Number.isFinite(r.ratingCordiality) ? r.ratingCordiality : null,
    ratingProfessionality: Number.isFinite(r.ratingProfessionality) ? r.ratingProfessionality : null,
    ratingKnowledge: Number.isFinite(r.ratingKnowledge) ? r.ratingKnowledge : null,
    created_at: r.createdAt ?? r.published_at ?? null, // il front-end legge created_at
    user: {
      firstName: r.user?.firstName ?? "",
      lastName: r.user?.lastName ?? "",
      username: r.user?.username ?? "",
      instagram: r.user?.instagram ?? "",
      bio: r.user?.bio ?? "",
      profilePicture: r.user?.profilePicture
        ? {
            url: toAbsUrl(r.user.profilePicture.url),
            alternativeText: r.user.profilePicture.alternativeText ?? null,
          }
        : null,
      fiscalCode: r.user?.fiscalCode ?? null,
    },
  }));

  // icons -> absolute
  const whats_includeds = arr(t.whats_includeds).map((x) => ({
    ...x,
    icon: x.icon ? { url: toAbsUrl(x.icon.url) } : null,
  }));
  const whats_not_includeds = arr(t.whats_not_includeds).map((x) => ({
    ...x,
    icon: x.icon ? { url: toAbsUrl(x.icon.url) } : null,
  }));
  const things2know = arr(t.things2know).map((x) => ({
    ...x,
    icon: x.icon ? { url: toAbsUrl(x.icon.url) } : null,
  }));

  // ✅ highlights: mantieni id reale (se presente) e salva ICON
  const highlights = arr(t.highlights).map((h, i) => ({
    id: String(h.id ?? `hl-${i}`),
    title: h.title ?? "",
    description: h.description ?? "",
    locale: h.locale ?? null,
    icon: h.icon
      ? {
          url: toAbsUrl(h.icon.url),
          alternativeText: h.icon.alternativeText ?? null,
          width: h.icon.width ?? null,
          height: h.icon.height ?? null,
        }
      : null,
  }));

  const faqs = arr(t.faqs).map((f, i) => ({
    id: String(f.id ?? `faq-${i}`),
    question: f.question ?? "",
    answer: f.answer ?? "",
    locale: f.locale ?? null,
  }));

  const days = arr(t.days).map((d, di) => ({
    id: String(d.id ?? `day-${di}`),
    number: d.number ?? di + 1,
    title: d.title ?? "",
    locale: d.locale ?? null,
    steps: arr(d.steps).map((s, si) => ({
      id: String(s.id ?? `day-${di}-step-${si}`),
      title: s.title ?? "",
      description: s.description ?? "",
      locale: s.locale ?? null,
    })),
  }));

  // locations con id e steps normalizzati
  const locations = arr(t.locations).map((loc, li) => ({
    id: String(loc.id ?? loc.slug ?? `loc-${li}`),
    title: loc.title ?? "",
    description: loc.description ?? "",
    slug: loc.slug ?? "",
    locale: loc.locale ?? null,
    state: loc.state ?? null,
    steps: arr(loc.steps).map((s, si) => ({
      id: String(s.id ?? `loc-${li}-step-${si}`),
      title: s.title ?? "",
      description: s.description ?? "",
      locale: s.locale ?? null,
    })),
    pictures: arr(loc.pictures).map((p, pi) => ({
      id: String(p.id ?? `locpic-${li}-${pi}`),
      title: p.title ?? null,
      url: pickImageUrl(p.image) || null,
      alternativeText: pickAlt(p.image) || null,
    })),
  }));

  return {
    ...t,
    image,
    pictures,
    sessions,
    reviews,
    whats_includeds,
    whats_not_includeds,
    things2know,
    highlights, // <-- ora con icon
    faqs,
    days,
    locations,
  };
}

/* --------------- main --------------- */
async function main() {
  console.log("[SNAPSHOT] endpoint:", ENDPOINT);
  console.log("[SNAPSHOT] out dir:", OUT_DIR);

  const data = await fetchGQL(TOURS_QUERY);
  const toursRaw = data?.tours || [];
  const tours = toursRaw.map(normalizeTour);

  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const t of tours) {
    const file = path.join(OUT_DIR, `tour.${t.slug}.json`);
    await fs.writeFile(file, JSON.stringify(t, null, 2), "utf8");
  }

  await fs.writeFile(OUT_LIST, JSON.stringify(tours, null, 2), "utf8");

  console.log(`[SNAPSHOT] scritto ${tours.length} tour in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("[SNAPSHOT] errore fatale:", err?.message || err);
  process.exit(1);
});
