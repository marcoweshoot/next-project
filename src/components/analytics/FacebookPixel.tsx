'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Data shape for Advanced Matching, according to Meta documentation
interface AdvancedMatchingData {
  em?: string // Email
  fn?: string // First name
  ln?: string // Last name
  ph?: string // Phone
  external_id?: string // User ID
}

export function FacebookPixel() {
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL

  useEffect(() => {
    if (!FB_PIXEL_ID) {
      console.warn('[FB PIXEL] Pixel ID not found. Aborting initialization.')
      return
    }

    let isInitialized = false

    const initializePixel = async () => {
      // Prevent re-initialization
      if (isInitialized || typeof window === 'undefined' || window.fbq) {
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const matchingData: AdvancedMatchingData = {}

        if (user) {
          // If user is logged in, try to get more details from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name, mobile_phone')
            .eq('id', user.id)
            .single()
          
          matchingData.external_id = user.id
          matchingData.em = (profile?.email || user.email || '').toLowerCase()
          if (profile?.first_name) matchingData.fn = profile.first_name.toLowerCase().trim()
          if (profile?.last_name) matchingData.ln = profile.last_name.toLowerCase().trim()
          if (profile?.mobile_phone) {
            const phoneDigits = profile.mobile_phone.replace(/\D/g, '')
            if (phoneDigits.length >= 10) matchingData.ph = phoneDigits
          }
        }

        // --- CORE LOGIC ---
        // Load the Facebook Pixel base code
        /* eslint-disable @typescript-eslint/no-unused-expressions, prefer-spread, prefer-rest-params */
        (function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)})(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable @typescript-eslint/no-unused-expressions, prefer-spread, prefer-rest-params */
        
        // Initialize the pixel with Advanced Matching data
        // For logged-out users, we pass an empty object {} to signal that we have
        // implemented the logic, thus resolving the "manual configuration" warning.
        window.fbq('init', FB_PIXEL_ID, matchingData)
        window.fbq('track', 'PageView')

        isInitialized = true

        console.log(`✅ [FB PIXEL] Initialized for ${user ? 'logged-in user' : 'anonymous user'}.`, {
          hasEmail: !!matchingData.em,
          hasFirstName: !!matchingData.fn,
          hasLastName: !!matchingData.ln
        })

      } catch (error) {
        console.error('❌ [FB PIXEL] Error during initialization:', error)
      }
    }

    initializePixel()
  }, [FB_PIXEL_ID])

  if (!FB_PIXEL_ID) {
    return null
  }

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  )
}