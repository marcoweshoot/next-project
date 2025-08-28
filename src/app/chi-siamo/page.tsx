// pages/chi-siamo.js
import Image from "next/image"
import dynamic from "next/dynamic"
import Header from "@/components/Header"

const Footer = dynamic(() => import("@/components/Footer"))

export default function ChiSiamo() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <header>
        <Header />
      </header>

      {/* Hero */}
      <section className="relative h-96 w-full">
        <Image
          src="/fallbacks/chi-siamo.avif"
          alt="Chi Siamo | WeShoot Viaggi Fotografici"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
        {/* Overlay: nero neutro, va bene in light e dark */}
        <span className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-primary-foreground md:text-6xl">
            Chi Siamo
          </h1>
        </div>
      </section>

      <main className="flex-grow">
        {/* Storia */}
        <section className="bg-background py-16 [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-semibold">La Nostra Storia</h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Fondata nel 2014 da un gruppo di appassionati di tecnologia, viaggi e fotografia.
              La nostra azienda è cresciuta fino a diventare un punto di riferimento nel settore
              di esperienze e formazione. In oltre 10 anni di attività, abbiamo accompagnato
              fotografi di ogni livello in percorsi di crescita da 0 a coach.
            </p>
          </div>
        </section>

        {/* Mission / Vision / Community */}
        <section className="bg-muted py-16 [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto grid grid-cols-1 gap-8 px-4 text-center md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-lg transition-shadow hover:shadow-xl">
              <h3 className="mb-4 text-2xl font-semibold">🚀 Mission</h3>
              <p className="leading-relaxed text-muted-foreground">
                WeShoot è il punto di riferimento per i fotografi di paesaggio che vogliono
                migliorare le proprie tecniche e condividere la loro passione. Offriamo
                esperienze di viaggio uniche e percorsi didattici che ti guideranno alla
                scoperta delle meraviglie della natura, creando una community di eccellenza.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-lg transition-shadow hover:shadow-xl">
              <h3 className="mb-4 text-2xl font-semibold">👁️ Vision</h3>
              <p className="leading-relaxed text-muted-foreground">
                Accendiamo la tua passione per la fotografia di paesaggio: ti portiamo a
                esplorare location da sogno, affiniamo insieme il tuo stile e ti mettiamo
                in contatto con altri appassionati pronti a fare nuove amicizie.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-lg transition-shadow hover:shadow-xl">
              <h3 className="mb-4 text-2xl font-semibold">❤️ Community</h3>
              <p className="leading-relaxed text-muted-foreground">
                Siamo un gruppo di fotografi e viaggiatori che vivono la fotografia come
                un’avventura continua. Qui condividiamo esperienze, ci ispiriamo a vicenda,
                cresciamo insieme e si costruiscono amicizie che durano ben oltre un viaggio.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-background py-16 [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-semibold">Il Nostro Team</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Marco Carotenuto", role: "CEO & Founder", img: "/fallbacks/Marco-Carotenuto.avif" },
                { name: "Luca Micheli", role: "Co-Founder", img: "/fallbacks/Luca-Micheli.avif" },
                { name: "Alessandro Cantarelli", role: "Co-Founder & Content-Creator", img: "/fallbacks/Alessandro-Cantarelli.avif" },
                { name: "Giorgia Salvatori", role: "Travel Designer", img: "/fallbacks/Giorgia-Salvatori.avif" },
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <Image
                    src={member.img}
                    alt={`${member.name} — ${member.role}`}
                    width={128}
                    height={128}
                    className="mx-auto mb-4 rounded-full object-cover shadow-md"
                    loading="lazy"
                    sizes="128px"
                    unoptimized
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-secondary text-secondary-foreground py-16 [content-visibility:auto] [contain-intrinsic-size:800px]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-semibold">Vuoi saperne di più?</h2>
            <p className="mb-6">
              Contattaci per scoprire come possiamo aiutare la tua azienda a crescere.
            </p>
            <a
              href="/contatti"
              className="inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Contattaci
            </a>
          </div>
        </section>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}
