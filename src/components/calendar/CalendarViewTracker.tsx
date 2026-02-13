'use client'

import { useEffect, useRef } from 'react'
import { trackViewCategory } from '@/utils/facebook'

interface GroupedSessions {
  [key: string]: {
    month: string;
    year: number;
    tours: any[];
  };
}

interface CalendarViewTrackerProps {
  groupedSessions: GroupedSessions
}

/**
 * Client-side component to track ViewCategory for Calendar page
 */
export function CalendarViewTracker({ groupedSessions }: CalendarViewTrackerProps) {
  const lastTrackedRef = useRef<string>('')

  useEffect(() => {
    // Extract all tour IDs from all months
    const allTourIds: string[] = []
    Object.values(groupedSessions).forEach(monthData => {
      monthData.tours.forEach((tour: any) => {
        if (tour.id) {
          allTourIds.push(tour.id)
        }
      })
    })

    // Create a unique key to track if we've already sent this exact event
    const trackingKey = `Calendario|${allTourIds.sort().join(',')}`
    
    // Only track if this exact combination hasn't been tracked yet
    if (lastTrackedRef.current !== trackingKey) {
      trackViewCategory({
        categoryName: 'Calendario Viaggi Fotografici',
        categoryType: 'Calendario',
        contentIds: allTourIds,
      })
      
      lastTrackedRef.current = trackingKey
    }
  }, [groupedSessions])

  return null
}
