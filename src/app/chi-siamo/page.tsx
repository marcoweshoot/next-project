// pages/chi-siamo.js
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'

const Footer = dynamic(() => import('@/components/Footer'))

export default function ChiSiamo() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <header>
        <Header />
      </header>

      <section className="relative w-full h-96">
        <Image
          src="/fallbacks/chi-siamo.avif"
          alt="Chi Siamo | WeShoot Viaggi Fotografici"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
        <span
          className="pointer-events-none absolute inset-0 bg-black/50"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-5xl md:text-6xl font-bold">Chi Siamo</h1>
        </div>
      </section>

      <main className="flex-grow">
        <section className="py-16 bg-white [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-6">La Nostra Storia</h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              Fondata nel 2014 da un gruppo di appassionati di tecnologia, viaggi e fotografia. 
              La nostra azienda è cresciuta fino a diventare un punto di riferimento nel settore 
              di esperienze e formazione. In oltre 10 anni di attività, abbiamo accompagnato 
              fotografi di ogni livello in percorsi di crescita da 0 a coach.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50 [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold mb-4">🚀 Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                WeShoot è il punto di riferimento per i fotografi di paesaggio che vogliono 
                migliorare le proprie tecniche e condividere la loro passione. Offriamo 
                esperienze di viaggio uniche e percorsi didattici che ti guideranno alla 
                scoperta delle meraviglie della natura, creando una community di eccellenza.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold mb-4">👁️ Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                Accendiamo la tua passione per la fotografia di paesaggio: ti portiamo a 
                esplorare location da sogno, affiniamo insieme il tuo stile e ti mettiamo 
                in contatto con altri appassionati pronti a fare nuove amicizie.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold mb-4">❤️ Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Siamo un gruppo di fotografi e viaggiatori che vivono la fotografia come 
                un’avventura continua. Qui condividiamo esperienze, ci ispiriamo a vicenda, 
                cresciamo insieme e si costruiscono amicizie che durano ben oltre un viaggio.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-8">Il Nostro Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'Marco Carotenuto', role: 'CEO & Founder', img: '/fallbacks/Marco-Carotenuto.avif' },
                { name: 'Luca Micheli', role: 'Co-Founder', img: '/fallbacks/Luca-Micheli.avif' },
                { name: 'Alessandro Cantarelli', role: 'Co-Founder & Content-Creator', img: '/fallbacks/Alessandro-Cantarelli.avif' },
                { name: 'Giorgia Salvatori', role: 'Travel Designer', img: '/fallbacks/Giorgia-Salvatori.avif' },
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <Image
                    src={member.img}
                    alt={`${member.name} — ${member.role}`}
                    width={128}
                    height={128}
                    className="mx-auto rounded-full mb-4 shadow-md object-cover"
                    loading="lazy"
                    sizes="128px"
                    unoptimized
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F7F7F7] text-black [content-visibility:auto] [contain-intrinsic-size:800px]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-4">Vuoi saperne di più?</h2>
            <p className="mb-6">Contattaci per scoprire come possiamo aiutare la tua azienda a crescere.</p>
            <a
              href="/contatti"
              className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full shadow hover:bg-gray-100 transition"
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
