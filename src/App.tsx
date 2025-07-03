
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import apolloClient from '@/lib/apolloClient';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import Tours from '@/pages/Tours';
import TourDetail from '@/pages/TourDetail';
import Destinations from '@/pages/Destinations';
import DestinationDetail from '@/pages/DestinationDetail';
import LocationDetail from '@/pages/LocationDetail';
import Collections from '@/pages/Collections';
import CollectionDetail from '@/pages/CollectionDetail';
import Stories from '@/pages/Stories';
import StoryDetail from '@/pages/StoryDetail';
import Coaches from '@/pages/Coaches';
import PhotographerDetail from '@/pages/PhotographerDetail';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import Reviews from '@/pages/Reviews';
import Calendar from '@/pages/Calendar';
import CalendarMonth from '@/pages/CalendarMonth';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Contacts from '@/pages/Contacts';
import GiftCard from '@/pages/GiftCard';
import ThankYou from '@/pages/ThankYou';
import NotFound from '@/pages/NotFound';

console.log("App.tsx: Starting application initialization");

const App = () => {
  console.log("App.tsx: Rendering App component");
  
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/viaggi-fotografici/" element={<Tours />} />
            <Route path="/viaggi-fotografici/destinazioni/:stateSlug/:placeSlug/:tourSlug" element={<TourDetail />} />
            <Route path="/viaggi-fotografici/destinazioni/" element={<Destinations />} />
            <Route path="/viaggi-fotografici/destinazioni/:destinationSlug" element={<DestinationDetail />} />
            <Route path="/viaggi-fotografici/destinazioni/:stateSlug/:locationSlug" element={<LocationDetail />} />
            <Route path="/viaggi-fotografici/collezioni/" element={<Collections />} />
            <Route path="/viaggi-fotografici/collezioni/:slug" element={<CollectionDetail />} />
            <Route path="/viaggi-fotografici/storie/" element={<Stories />} />
            <Route path="/viaggi-fotografici/storie/:slug" element={<StoryDetail />} />
            <Route path="/fotografi/" element={<Coaches />} />
            <Route path="/fotografi/:username" element={<PhotographerDetail />} />
            <Route path="/corsi-di-fotografia/" element={<Courses />} />
            <Route path="/corsi-di-fotografia/:slug" element={<CourseDetail />} />
            <Route path="/recensioni/" element={<Reviews />} />
            <Route path="/viaggi-fotografici/calendario/" element={<Calendar />} />
            <Route path="/viaggi-fotografici/calendario/:year/" element={<Calendar />} />
            <Route path="/viaggi-fotografici/calendario/:year/:month/" element={<CalendarMonth />} />
            <Route path="/gdpr/" element={<Privacy />} />
            <Route path="/terms/" element={<Terms />} />
            <Route path="/contatti/" element={<Contacts />} />
            <Route path="/gift-card/" element={<GiftCard />} />
            <Route path="/thank-you/" element={<ThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ApolloProvider>
  );
};

export default App;
