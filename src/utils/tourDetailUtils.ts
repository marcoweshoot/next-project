
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const openWhatsApp = (tour: { title: string }) => {
  const message = `Ciao WeShoot, mi potete dare più info sul viaggio ${tour.title}?`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/393495269093?text=${encodedMessage}`);
};

export const createDefaultCoach = (coaches: any[]) => {
  // If we have coaches from sessions, use the first one
  if (coaches && coaches.length > 0) {
    return {
      id: coaches[0].id,
      name: coaches[0].firstName ? 
        `${coaches[0].firstName} ${coaches[0].lastName || ''}`.trim() : 
        coaches[0].username,
      avatar: {
        url: coaches[0].profilePicture?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        alt: coaches[0].firstName || coaches[0].username
      }
    };
  }
  
  // Fallback default coach
  return {
    id: 'default',
    name: 'Team WeShoot',
    avatar: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      alt: 'Team WeShoot'
    }
  };
};
