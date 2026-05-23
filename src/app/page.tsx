'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import { translations, type Language } from '@/lib/i18n'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en')
  
  // Set document direction for RTL support (Arabic)
  useEffect(() => {
    document.documentElement.dir = translations[lang].dir
    document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang]

  return (
    <div className="min-h-screen pb-16 relative">
      <MeshGradient animated />
      <TopNav variant="public" />

      {/* Main Hero Container */}
      <main className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 flex flex-col items-center">
        
        {/* Language Selector */}
        <div className="w-full flex justify-end mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1 backdrop-blur-md">
            {(['en', 'sw', 'fr', 'ar'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider
                  ${lang === l 
                    ? 'bg-secondary text-surface-dim shadow-glass' 
                    : 'text-on-surface-variant hover:text-on-surface'}`}
                aria-label={`Switch language to ${l}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Presentation */}
        <div className="text-center max-w-3xl my-8 md:my-12">
          <div className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/20 px-4 py-1.5 rounded-full mb-6 verified-glow-effect">
            <span className="material-symbols-filled text-secondary text-sm">anchor</span>
            <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">
              W3C VERIFIABLE CREDENTIALS PLATFORM
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-tight">
            {t.landing.heroTitle}
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-secondary mt-3 tracking-wide">
            {t.landing.heroSubtitle}
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant mt-6 leading-relaxed">
            {t.landing.heroDesc}
          </p>
        </div>

        {/* Portal Entry Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 max-w-5xl">
          
          {/* Card 1: Holder Wallet */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between h-64 border border-white/10 cyan-glow-effect">
            <div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">account_balance_wallet</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Holder Wallet</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Unlock your credentials offline, presentation QR codes, manage recovery contacts.
              </p>
            </div>
            <Link 
              href="/wallet"
              className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-center"
            >
              {t.landing.openWallet}
            </Link>
          </div>

          {/* Card 2: Issuer Portal */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between h-64 border border-white/10">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">domain</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Issuer Dashboard</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Authorized NGOs and agencies issue cryptographically signed credentials.
              </p>
            </div>
            <Link 
              href="/issuer"
              className="w-full bg-surface-container-high border border-white/10 text-on-surface font-bold text-xs tracking-wider py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-center"
            >
              {t.landing.issuePortal}
            </Link>
          </div>

          {/* Card 3: Verifier Portal */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between h-64 border border-white/10">
            <div>
              <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary text-2xl">qr_code_scanner</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Verifier Portal</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Banks, employers, health clinics verify credentials instantly offline.
              </p>
            </div>
            <Link 
              href="/verifier"
              className="w-full bg-surface-container-high border border-white/10 text-on-surface font-bold text-xs tracking-wider py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-center"
            >
              {t.landing.verifyPortal}
            </Link>
          </div>

          {/* Card 4: Admin Console */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between h-64 border border-white/10">
            <div>
              <div className="w-12 h-12 bg-on-surface-variant/10 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">admin_panel_settings</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Admin Console</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Humanitarian headquarters register authorized NGOs and view audit logs.
              </p>
            </div>
            <Link 
              href="/admin"
              className="w-full bg-surface-container-high border border-white/10 text-on-surface font-bold text-xs tracking-wider py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-center"
            >
              {t.landing.adminPortal}
            </Link>
          </div>

        </div>

        {/* Mission Statement */}
        <section className="w-full max-w-5xl mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-on-surface">{t.landing.missionTitle}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t.landing.missionText}</p>
          </div>
          <div className="glass-card rounded-2xl p-8 border border-white/10 space-y-6 relative overflow-hidden cyan-glow-effect">
            <h4 className="text-base font-bold text-secondary">{t.landing.accessibilityTitle}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{t.landing.accessibilityText}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-3 py-1 rounded-full border border-secondary/20">WCAG 2.1 AA</span>
              <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-3 py-1 rounded-full border border-secondary/20">RTL ARABIC</span>
              <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-3 py-1 rounded-full border border-secondary/20">HIGH CONTRAST</span>
              <span className="bg-secondary/15 text-secondary text-[10px] font-bold px-3 py-1 rounded-full border border-secondary/20">OFFLINE FIRST</span>
            </div>
          </div>
        </section>

        {/* Supported Organizations */}
        <section id="how-it-works" className="w-full max-w-5xl mt-20 text-center">
          <h3 className="text-lg font-bold text-data-label tracking-widest uppercase mb-10">
            {t.landing.organizationsTitle}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-70">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">partner_exchange</span>
              <span className="text-xs font-bold tracking-wider">UNHCR REGIONAL</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">health_and_safety</span>
              <span className="text-xs font-bold tracking-wider">WHO HEALTH</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">gavel</span>
              <span className="text-xs font-bold tracking-wider">CIVIL REGISTRY</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">school</span>
              <span className="text-xs font-bold tracking-wider">UNIVERSITIES</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">emergency</span>
              <span className="text-xs font-bold tracking-wider">RED CROSS COOP</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
