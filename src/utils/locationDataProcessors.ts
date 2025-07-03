
export const processLocationData = (locationsData: any[], stateSlug: string) => {
  console.log("🔍 processLocationData - Input:", { locationsData, stateSlug });
  
  if (!locationsData || locationsData.length === 0) {
    console.log("🔍 processLocationData - No locations data");
    return null;
  }

  const locationData = locationsData[0];
  
  console.log("🔍 processLocationData - Location data:", locationData);

  // Process state data
  const stateData = locationData.state;
  if (!stateData) {
    console.log("🔍 processLocationData - No state data");
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

  console.log("🔍 processLocationData - Processed location:", location);
  return location;
};

export const processPicturesData = (locationPictures: any[], additionalPictures: any[]) => {
  console.log("🔍 processPicturesData - Input:", { locationPictures, additionalPictures });
  
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

  console.log("🔍 processPicturesData - Processed pictures:", processedPictures);
  return processedPictures;
};

export const processToursData = (toursData: any[], locationSlug: string) => {
  console.log("🔍 processToursData - Input:", { toursData, locationSlug });
  
  if (!toursData || toursData.length === 0) {
    console.log("🔍 processToursData - No tours data");
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

  console.log("🔍 processToursData - Processed tours:", processedTours);
  return processedTours;
};
