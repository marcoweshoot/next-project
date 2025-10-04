'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import HeaderLogo from "./HeaderLogo";

const LIGHT_LOGO = "/lovable-uploads/logo-light.svg";
const DARK_LOGO = "/lovable-uploads/logo-dark.svg";

export default function HeaderLogoDynamic() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

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

  // Logica del logo basata su tema e pagina:
  // - Pagine auth/dashboard/admin: usa logo basato sul tema (dark per light mode, light per dark mode)
  // - Pagine normali: usa logo basato su scroll e tema
  let logoSrc;
  
  if (isAuthPage) {
    // Nelle pagine auth/dashboard/admin: logo dark per light mode, logo light per dark mode
    logoSrc = resolvedTheme === 'dark' ? LIGHT_LOGO : DARK_LOGO;
  } else {
    // Pagine normali: considera sia scroll che tema
    if (isScrolled) {
      // Quando scrollato: logo dark per light mode, logo light per dark mode
      logoSrc = resolvedTheme === 'dark' ? LIGHT_LOGO : DARK_LOGO;
    } else {
      // Quando non scrollato: logo light per light mode, logo dark per dark mode
      logoSrc = resolvedTheme === 'dark' ? DARK_LOGO : LIGHT_LOGO;
    }
  }

  return <HeaderLogo logoSrc={logoSrc} />;
}
