'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="w-full mt-20 bg-white/5 border-t border-white/10 backdrop-blur-xl py-12 px-6 relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand section */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="AnchorID Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-cover rounded-lg"
            />
            <span className="text-xl font-bold text-secondary tracking-tight">AnchorID</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
            AnchorID helps displaced people securely prove who they are even when physical documents are lost, damaged, or unavailable. Giving individuals greater control over their identity.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold tracking-widest text-secondary uppercase">Portals</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/wallet" className="text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Holder Wallet
              </Link>
            </li>
            <li>
              <Link href="/issuer" className="text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Issuer Portal
              </Link>
            </li>
            <li>
              <Link href="/verifier" className="text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Verifier Portal
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-xs text-on-surface-variant hover:text-secondary transition-colors">
                Admin Area
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources & Action section */}
        <div className="space-y-4 flex flex-col justify-between items-start">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold tracking-widest text-secondary uppercase">System Status</h4>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-xs font-semibold text-tertiary">All Services Active</span>
            </div>
          </div>
          
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-secondary bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl transition-all active:scale-95"
            aria-label="Back to top of the page"
          >
            BACK TO TOP
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-y-0.5">
              arrow_upward
            </span>
          </button>
        </div>

      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-on-surface-variant">
          &copy; {new Date().getFullYear()} AnchorID. Open source project built for decentralized humanitarian aid.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="text-[10px] text-on-surface-variant hover:text-secondary transition-colors">
            Main Landing
          </Link>
          <span className="text-white/10">|</span>
          <span className="text-[10px] text-on-surface-variant">W3C Compliant</span>
        </div>
      </div>
    </footer>
  )
}
