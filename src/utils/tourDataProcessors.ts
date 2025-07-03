
export const getNextSession = (sessions: any[]) => {
  if (!sessions || sessions.length === 0) return null;
  
  const now = new Date();
  const futureSessions = sessions
    .filter(session => new Date(session.start) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  return futureSessions[0] || sessions[0];
};

export const getCoachesFromSessions = (sessions: any[]) => {
  if (!sessions || sessions.length === 0) return [];
  
  const now = new Date();
  
  // Filtra solo le sessioni future
  const futureSessions = sessions.filter(session => new Date(session.start) > now);
  
  // Se non ci sono sessioni future, usa tutte le sessioni come fallback
  const sessionsToProcess = futureSessions.length > 0 ? futureSessions : sessions;
  
  // Collect all unique coaches from future sessions
  const allCoaches = new Map();
  
  sessionsToProcess.forEach(session => {
    if (session.users && session.users.length > 0) {
      session.users.forEach((user: any) => {
        // Only add coaches (users with coach-like properties)
        if (user.id && !allCoaches.has(user.id)) {
          allCoaches.set(user.id, {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            instagram: user.instagram,
            profilePicture: user.profilePicture
          });
        }
      });
    }
  });
  
  // If no coaches found in sessions, return empty array
  // The fallback coach will be created in the component level
  return Array.from(allCoaches.values());
};

export const processGalleryImages = (pictures: any[]) => {
  console.log("Processing gallery images:", pictures);
  
  if (!pictures || !Array.isArray(pictures)) {
    console.log("No pictures array found");
    return [];
  }

  const processedImages = pictures
    .filter(picture => picture?.image && Array.isArray(picture.image) && picture.image.length > 0)
    .flatMap(picture => 
      picture.image.map((img: any) => ({
        id: img.id || Math.random().toString(),
        url: img.url,
        alt: img.alternativeText || picture.title || 'Tour image',
        title: picture.title || ''
      }))
    );

  console.log("Processed gallery images:", processedImages);
  return processedImages;
};

export const processItinerary = (days: any[]) => {
  if (!days || !Array.isArray(days)) return [];
  
  return days.map((day, index) => ({
    day: index + 1,
    title: day.title || `Day ${index + 1}`,
    description: day.description || '',
    steps: day.steps?.map((step: any) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      locations: step.locations?.map((location: any) => ({
        id: location.id,
        title: location.title,
        slug: location.slug,
        description: location.description,
        pictures: location.pictures?.map((picture: any) => {
          // Gestisce la struttura delle immagini delle location
          const imageData = Array.isArray(picture.image) ? picture.image[0] : picture.image;
          
          // Controlla se abbiamo dati validi dell'immagine
          if (!imageData || typeof imageData.url !== 'string') {
            console.warn('Invalid image data for location picture:', picture.id);
            return null;
          }
          
          return {
            id: picture.id,
            title: picture.title,
            url: imageData.url,
            alternativeText: imageData.alternativeText || picture.title || 'Location image'
          };
        }).filter(Boolean) || [] // Rimuove elementi null
      })) || []
    })) || [],
    activities: day.activities || [],
    accommodation: day.accommodation || '',
    meals: day.meals || []
  }));
};

export const calculateTourDuration = (nextSession: any, allSessions: any[]) => {
  if (nextSession?.start && nextSession?.end) {
    const start = new Date(nextSession.start);
    const end = new Date(nextSession.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  if (allSessions && allSessions.length > 0) {
    const firstSession = allSessions[0];
    if (firstSession?.start && firstSession?.end) {
      const start = new Date(firstSession.start);
      const end = new Date(firstSession.end);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  
  return 7; // Default fallback
};
