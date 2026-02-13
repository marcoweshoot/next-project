'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    // Track ViewCategory only once when component mounts
    trackViewCategory({
      categoryName,
      categoryType,
      contentIds,
    })
  }, [categoryName, categoryType]) // Don't re-track if contentIds change

  // This component doesn't render anything
  return null
}
