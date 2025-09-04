import Image from 'next/image'

type Logo = {
  src: string
  alt: string
  w: number
  h: number
  invertInDark?: boolean
}

const logos: Logo[] = [
  { src: '/lovable-uploads/58ac45e5-e33d-4269-92bc-6a1ce2626512.png', alt: 'The New York Times', w: 300, h: 100, invertInDark: true },
  { src: '/lovable-uploads/1a40734e-4233-4acd-9d62-a1576ea5be4e.png', alt: 'Forbes', w: 280, h: 100, invertInDark: true },
  { src: '/lovable-uploads/257f2f5c-7be2-4a6b-b173-59285d91c4d5.png', alt: 'Sky TG24', w: 260, h: 100, invertInDark: false },
  { src: '/lovable-uploads/75691805-1c34-46d2-b105-dbb7c9cb0093.png', alt: 'National Geographic', w: 320, h: 100, invertInDark: false },
]

export default function SocialProofSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container text-center">
        <p className="mb-8 text-xl md:text-2xl font-medium text-muted-foreground">
          1200 Viaggiatori, 100+ Viaggi organizzati, 18.000 WeShooters dal 2015 con pubblicazioni su
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((l) => (
            <Image
              key={l.src}
              src={l.src}
              alt={l.alt}
              width={l.w}
              height={l.h}
              className={`h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity
                ${l.invertInDark ? 'dark:invert' : 'dark:brightness-125 dark:contrast-110'}`}
              sizes="(max-width: 768px) 33vw, 20vw"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
