'use client';

import { useEffect, useState } from "react";
import HeaderLogo from "./HeaderLogo";

const DEFAULT_LOGO = "/lovable-uploads/11f40570-4fe1-4259-a79d-7c9d26dc7505.png";
const SCROLLED_LOGO = "/lovable-uploads/64763a8e-c4be-4770-b713-082d8d5b4f9e.png";

export default function HeaderLogoDynamic() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    updateScroll(); // imposta lo stato al load iniziale
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return <HeaderLogo logoSrc={isScrolled ? SCROLLED_LOGO : DEFAULT_LOGO} />;
}
