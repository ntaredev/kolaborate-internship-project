'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => {
            console.log('AnchorID SW registered: ', reg.scope)
          })
          .catch(err => {
            console.warn('AnchorID SW registration failed: ', err)
          })
      })
    }
  }, [])

  return null
}
