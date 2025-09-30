
export const processLocationData = (locationsData: any[], stateSlug: string) => {
  
  if (!locationsData || locationsData.length === 0) {
    return null;
  }

  const locationData = locationsData[0];
  

  // Process state data
  const stateData = locationData.state;
  if (!stateData) {
    return null;
  }

  const location = {
    id: locationData.id,
    title: locationData.title,
    slug: locationData.slug,
    description: locationData.description,
    longitude: locationData.longitude,
    latitude: locationData.latitude,
    state: {
      id: stateData.id,
      name: stateData.name,
      slug: stateData.slug,
      description: stateData.description
    }
  };

  return location;
};

export const processPicturesData = (locationPictures: any[], additionalPictures: any[]) => {
  
  const allPictures = [...(locationPictures || []), ...(additionalPictures || [])];
  
  const processedPictures = allPictures.map((picture: any) => {
    // Handle both single image and array of images
    const imageArray = Array.isArray(picture.image) ? picture.image : [picture.image];
    const imageData = imageArray[0]; // Take the first image
    
    return {
      id: picture.id,
      title: picture.title,
      url: imageData?.url || '',
      alternativeText: imageData?.alternativeText || picture.title || '',
      type: picture.type || 'image'
    };
  }).filter(picture => picture.url); // Filter out pictures without URLs

  return processedPictures;
};

export const processToursData = (toursData: any[], locationSlug: string) => {
  
  if (!toursData || toursData.length === 0) {
    return [];
  }

  const processedTours = toursData.map((tour: any) => {
    // Process states
    const states = Array.isArray(tour.states) ? tour.states.map((state: any) => ({
      id: state.id,
      name: state.name,
      slug: state.slug
    })) : [];

    // Process places
    const places = Array.isArray(tour.places) ? tour.places.map((place: any) => ({
      id: place.id,
      name: place.name,
      slug: place.slug
    })) : [];

    // Process sessions
    const sessions = Array.isArray(tour.sessions) ? tour.sessions.map((session: any) => {
      const users = Array.isArray(session.users) ? session.users.map((user: any) => {
        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          profilePicture: user.profilePicture ? {
            url: user.profilePicture.url,
            alternativeText: user.profilePicture.alternativeText
          } : null
        };
      }) : [];

      return {
        id: session.id,
        start: session.start,
        end: session.end,
        price: session.price,
        maxPax: session.maxPax,
        users
      };
    }) : [];

    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      excerpt: tour.excerpt,
      difficulty: tour.difficulty,
      image: tour.image ? {
        url: tour.image.url,
        alternativeText: tour.image.alternativeText
      } : null,
      states,
      places,
      sessions
    };
  });

  return processedTours;
};
