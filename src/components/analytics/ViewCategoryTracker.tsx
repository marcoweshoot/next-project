'use client'

import { useEffect, useRef } from 'react'
import { trackViewCategory } from '@/utils/facebook'

interface ViewCategoryTrackerProps {
  categoryName: string
  categoryType: string
  contentIds?: string[]
}

/**
 * Client-side component to track ViewCategory Facebook Pixel event
 * 
 * Usage:
 * <ViewCategoryTracker 
 *   categoryName="Italia" 
 *   categoryType="Destinazione"
 *   contentIds={tourIds}
 * />
 */
export function ViewCategoryTracker({
  categoryName,
  categoryType,
  contentIds = [],
}: ViewCategoryTrackerProps) {
  const lastTrackedRef = useRef<string>('')

  useEffect(() => {
    // Create a unique key to track if we've already sent this exact event
    const trackingKey = `${categoryName}|${categoryType}|${contentIds.sort().join(',')}`
    
    // Only track if this exact combination hasn't been tracked yet
    if (lastTrackedRef.current !== trackingKey) {
      trackViewCategory({
        categoryName,
        categoryType,
        contentIds,
      })
      
      lastTrackedRef.current = trackingKey
    }
  }, [categoryName, categoryType, contentIds])

  // This component doesn't render anything
  return null
}
