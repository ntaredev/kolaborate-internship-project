'use client'

import React from 'react'

export default function Watermark() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.02] dark:opacity-[0.025] select-none"
      aria-hidden="true"
    >
      <img
        src="/logo.png"
        alt=""
        loading="lazy"
        width={450}
        height={450}
        className="w-[75vw] max-w-[450px] aspect-square object-contain"
      />
    </div>
  )
}
