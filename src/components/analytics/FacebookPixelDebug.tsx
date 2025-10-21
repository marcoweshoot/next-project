'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Componente di debug per Facebook Pixel
 * Mostra lo stato del pixel e permette di testare eventi
 * 
 * ATTENZIONE: Usare solo in development! Non includere in production.
 */
export function FacebookPixelDebug() {
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [pixelId, setPixelId] = useState<string>('')
  const [sessionData, setSessionData] = useState<any>(null)
  const [lastEvent, setLastEvent] = useState<string>('')

  useEffect(() => {
    // Check pixel status
    const checkPixel = () => {
      if (typeof window !== 'undefined') {
        const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL || 'NOT_SET'
        setPixelId(fbPixelId)

        if (window.fbq) {
          setPixelStatus('loaded')
        } else {
          setPixelStatus('error')
        }

        // Check session storage
        const purchaseData = sessionStorage.getItem('lastPurchase')
        if (purchaseData) {
          try {
            setSessionData(JSON.parse(purchaseData))
          } catch (e) {
            console.error('Error parsing session data:', e)
          }
        }
      }
    }

    checkPixel()
    const interval = setInterval(checkPixel, 1000)

    return () => clearInterval(interval)
  }, [])

  const testPageView = () => {
    if (window.fbq) {
      window.fbq('track', 'PageView')
      setLastEvent('PageView - ' + new Date().toLocaleTimeString())
      console.log('🧪 [TEST] PageView event sent')
    }
  }

  const testPurchase = () => {
    if (window.fbq) {
      const testData = {
        content_name: 'Test Tour',
        content_category: 'Viaggi Fotografici',
        value: 99.99,
        currency: 'EUR',
        num_items: 1
      }
      window.fbq('track', 'Purchase', testData)
      setLastEvent('Purchase (Test) - ' + new Date().toLocaleTimeString())
      console.log('🧪 [TEST] Purchase event sent with data:', testData)
    }
  }

  const testInitiateCheckout = () => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Test Tour',
        value: 99.99,
        currency: 'EUR'
      })
      setLastEvent('InitiateCheckout - ' + new Date().toLocaleTimeString())
      console.log('🧪 [TEST] InitiateCheckout event sent')
    }
  }

  const clearSessionData = () => {
    sessionStorage.removeItem('lastPurchase')
    setSessionData(null)
    console.log('🧹 [DEBUG] Session data cleared')
  }

  const saveMockData = () => {
    const mockData = {
      tourTitle: 'Test Tour - Debug',
      value: 199.99,
      quantity: 2,
      tourDestination: 'Test Destination',
      sessionDate: new Date().toISOString()
    }
    sessionStorage.setItem('lastPurchase', JSON.stringify(mockData))
    setSessionData(mockData)
    console.log('💾 [DEBUG] Mock data saved to sessionStorage:', mockData)
  }

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto shadow-lg z-50 border-2 border-orange-500">
      <CardHeader className="bg-orange-50 dark:bg-orange-950">
        <CardTitle className="text-sm flex items-center justify-between">
          🧪 Facebook Pixel Debug
          <Badge variant={pixelStatus === 'loaded' ? 'default' : 'destructive'}>
            {pixelStatus === 'loaded' ? '✓ Active' : '✗ Inactive'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Development only - Hidden in production
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Pixel Status */}
        <div>
          <div className="text-xs font-semibold mb-1">Pixel ID:</div>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded block overflow-x-auto">
            {pixelId}
          </code>
        </div>

        {/* Session Data */}
        <div>
          <div className="text-xs font-semibold mb-1 flex items-center justify-between">
            Session Data:
            <div className="space-x-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 text-xs px-2"
                onClick={saveMockData}
              >
                Save Mock
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 text-xs px-2"
                onClick={clearSessionData}
                disabled={!sessionData}
              >
                Clear
              </Button>
            </div>
          </div>
          {sessionData ? (
            <pre className="text-xs bg-green-50 dark:bg-green-950 p-2 rounded overflow-x-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          ) : (
            <div className="text-xs text-gray-500 italic">No data in sessionStorage</div>
          )}
        </div>

        {/* Test Events */}
        <div>
          <div className="text-xs font-semibold mb-2">Test Events:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={testPageView}
              disabled={pixelStatus !== 'loaded'}
              className="text-xs"
            >
              PageView
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={testInitiateCheckout}
              disabled={pixelStatus !== 'loaded'}
              className="text-xs"
            >
              Checkout
            </Button>
            <Button 
              size="sm" 
              variant="default"
              onClick={testPurchase}
              disabled={pixelStatus !== 'loaded'}
              className="col-span-2 text-xs"
            >
              Purchase (Test)
            </Button>
          </div>
        </div>

        {/* Last Event */}
        {lastEvent && (
          <div className="text-xs">
            <div className="font-semibold mb-1">Last Event:</div>
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
              {lastEvent}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">
          <div className="font-semibold mb-1">Quick Guide:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Open console to see detailed logs</li>
            <li>Use Chrome Facebook Pixel Helper extension</li>
            <li>Check Events Manager for real-time events</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

