'use client'

/** Glassmorphic mesh gradient background – animated */
export default function MeshGradient({ animated = false }: { animated?: boolean }) {
  return (
    <>
      <div className="mesh-gradient" aria-hidden="true" />
      {animated && <div className="mesh-gradient-animated" aria-hidden="true" />}
    </>
  )
}
