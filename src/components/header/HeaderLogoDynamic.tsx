'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HeaderLogo from "./HeaderLogo";

const LIGHT_LOGO = "/lovable-uploads/logo-light.svg";
const DARK_LOGO = "/lovable-uploads/logo-dark.svg";

export default function HeaderLogoDynamic() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    updateScroll(); // imposta lo stato al load iniziale
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // Rileva se siamo in pagine di autenticazione (ottimizzato)
  const isAuthPage = pathname.startsWith('/auth/') || 
                     pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/admin');

  // Nelle pagine auth/dashboard/admin usa sempre il logo light (per sfondo chiaro)
  // Altrimenti usa la logica normale: light quando non scrollato, dark quando scrollato
  const logoSrc = isAuthPage ? LIGHT_LOGO : (isScrolled ? DARK_LOGO : LIGHT_LOGO);

  return <HeaderLogo logoSrc={logoSrc} />;
}
