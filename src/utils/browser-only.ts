'use client';

export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) element.scrollIntoView({ behavior: 'smooth' });
};

export const openWhatsApp = (tour: { title: string }) => {
  const message = `Ciao WeShoot, mi potete dare più info sul viaggio ${tour.title}?`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/393495269093?text=${encodedMessage}`, '_blank');
};
