'use client'

import Script from 'next/script'
import { useEffect } from 'react'

export function FacebookPixel() {
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL

  useEffect(() => {
    console.log('🔧 [FB PIXEL INIT] FB_PIXEL_ID:', FB_PIXEL_ID ? `${FB_PIXEL_ID.substring(0, 8)}...` : 'NOT SET')
    
    if (!FB_PIXEL_ID) {
      console.warn('⚠️ [FB PIXEL INIT] Facebook Pixel ID is not set. Facebook Pixel will not be initialized.')
      console.warn('💡 [FB PIXEL INIT] Set NEXT_PUBLIC_FB_PIXEL in your environment variables')
      return
    }

    // Wait a bit for script to load, then check
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.fbq) {
        console.log('✅ [FB PIXEL INIT] Facebook Pixel loaded successfully!')
        console.log('✅ [FB PIXEL INIT] window.fbq is available')
        clearInterval(checkInterval)
      }
    }, 100)

    // Stop checking after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      if (typeof window !== 'undefined' && !window.fbq) {
        console.error('❌ [FB PIXEL INIT] Facebook Pixel failed to load after 5 seconds')
      }
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [FB_PIXEL_ID])

  if (!FB_PIXEL_ID) {
    return null
  }

  return (
    <>
      <Script
        id="fb-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{display:'none'}} 
             src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}/>
      </noscript>
    </>
  )
}