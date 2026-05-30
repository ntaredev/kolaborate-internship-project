'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import Watermark from '@/components/layout/Watermark'
import { getCredential, getActiveKeyPair } from '@/lib/indexeddb'
import { generateQRPayload } from '@/lib/crypto'
import type { AnchorCredential, QRPayload } from '@/lib/types'
import { translations } from '@/lib/i18n'
import QRCode from 'qrcode'

export default function PresentCredentialPage() {
  const params = useParams()
  const router = useRouter()
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en')
  const t = translations[lang]

  const id = params.id as string
  const [credential, setCredential] = useState<AnchorCredential | null>(null)
  const [holderDid, setHolderDid] = useState('')
  const [loading, setLoading] = useState(true)

  // Selective disclosure fields
  const [disclosedFields, setDisclosedFields] = useState<string[]>(['fullName'])
  const [qrUrl, setQrUrl] = useState('')
  const [payloadText, setPayloadText] = useState('')
  
  // Timer countdown
  const [timeLeft, setTimeLeft] = useState(60)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Session Guard
    const isSessionUnlocked = sessionStorage.getItem('wallet_session_unlocked')
    if (isSessionUnlocked !== 'true') {
      router.push('/wallet')
      return
    }

    async function loadCredentialData() {
      try {
        const kp = await getActiveKeyPair()
        if (kp) setHolderDid(kp.did)

        const item = await getCredential(id)
        if (item) setCredential(item)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadCredentialData()
  }, [id, router])

  // Countdown clock effect
  useEffect(() => {
    if (!qrUrl) return
    if (timeLeft <= 0) {
      setIsExpired(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, qrUrl])

  const handleFieldToggle = (field: string) => {
    setDisclosedFields(prev =>
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const handleGeneratePresentation = async () => {
    if (!credential || !holderDid) return
    setIsExpired(false)
    setTimeLeft(60)
    
    try {
      const payload = await generateQRPayload(credential, disclosedFields, holderDid, 60)
      const payloadString = JSON.stringify(payload)
      setPayloadText(payloadString)

      // Convert JSON payload to Data URL QR code
      const url = await QRCode.toDataURL(payloadString, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#0b1326',
          light: '#ffffff'
        }
      })
      setQrUrl(url)
    } catch (err) {
      alert('Failed to generate presentation QR code.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <MeshGradient />
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-secondary animate-spin">sync</span>
          <p className="text-xs font-bold tracking-widest text-secondary uppercase">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!credential) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 relative">
        <MeshGradient />
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 text-center space-y-6">
          <span className="material-symbols-outlined text-5xl text-red-400">warning</span>
          <h3 className="text-lg font-bold text-on-surface">Credential Not Found</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            The requested verifiable credential could not be located in your local browser sandbox.
          </p>
          <Link
            href="/wallet/dashboard"
            className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl block text-center"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    )
  }

  const availableFields = Object.keys(credential.credentialSubject).filter(
    k => k !== 'id' && k !== 'issuedBy' && k !== 'expiryDate'
  )

  return (
    <div className="min-h-screen pb-24 relative">
      <MeshGradient animated />
      <Watermark />
      <TopNav variant="wallet" />

      <main className="max-w-4xl mx-auto px-6 pt-24">
        
        {/* Back navigation */}
        <div className="flex justify-between items-center mb-6 z-10 relative">
          <Link 
            href="/wallet/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-secondary hover:text-secondary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t.common.back.toUpperCase()}
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-on-surface-variant hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            BACK TO HOME
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left panel: Config selective disclosure fields */}
          <div className="glass-card rounded-2xl p-8 border border-white/10 space-y-6 h-fit">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{t.wallet.presentTitle}</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {t.wallet.presentDesc}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary uppercase">{t.wallet.discloseFields}</h3>
              
              <div className="space-y-2.5">
                {availableFields.map(field => {
                  const label = field.replace(/([A-Z])/g, ' $1').toUpperCase()
                  const isChecked = disclosedFields.includes(field)
                  return (
                    <label 
                      key={field}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all
                        ${isChecked 
                          ? 'bg-secondary/10 border-secondary/30 text-on-surface' 
                          : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/8'}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider">{label}</span>
                        <span className="text-xs text-on-surface font-semibold truncate max-w-[200px] mt-0.5">
                          {credential.credentialSubject[field]}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFieldToggle(field)}
                        className="w-4 h-4 rounded text-secondary bg-white/10 border-white/20 outline-none cursor-pointer focus:ring-transparent accent-secondary"
                      />
                    </label>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleGeneratePresentation}
              className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">qr_code_2</span>
              {t.wallet.generateQR}
            </button>
          </div>

          {/* Right panel: Live Presentation QR Code */}
          <div className="glass-card rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            {!qrUrl ? (
              <div className="space-y-4 py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant animate-pulse">qr_code_2</span>
                <p className="text-xs text-on-surface-variant max-w-[240px] leading-relaxed mx-auto">
                  Select attributes and click generate. A secure, cryptographically-signed short-lived presentation payload will appear here.
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
                
                {/* QR Display Frame with expiring blur protection */}
                <div className="relative p-4 bg-white rounded-2xl border border-white/25 shadow-glass overflow-hidden w-64 h-64 flex items-center justify-center">
                  
                  {/* QR Image */}
                  <img 
                    src={qrUrl} 
                    alt="Verifiable presentation QR payload" 
                    className={`w-56 h-56 transition-all duration-300 ${isExpired ? 'blur-md opacity-25' : ''}`}
                  />
                  
                  {/* Expired Cover Panel */}
                  {isExpired && (
                    <div className="absolute inset-0 bg-surface-dim/80 backdrop-blur-sm flex flex-col justify-center items-center p-4">
                      <span className="material-symbols-outlined text-red-400 text-3xl mb-2">error</span>
                      <h4 className="text-xs font-bold text-on-surface">PRESENTATION EXPIRED</h4>
                      <p className="text-[10px] text-on-surface-variant max-w-[180px] leading-relaxed mt-1">
                        Tap button below to regenerate signed presentation.
                      </p>
                    </div>
                  )}

                  {/* Scan Line Overlay */}
                  {!isExpired && <div className="absolute left-0 w-full h-0.5 bg-secondary opacity-70 scan-line" />}
                </div>

                {/* Countdown clock */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                    {t.wallet.qrExpires}
                  </p>
                  <div className={`text-xl font-mono font-bold tracking-wide transition-colors ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-secondary'}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                  </div>
                </div>

                {isExpired ? (
                  <button
                    onClick={handleGeneratePresentation}
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    REGENERATE QR CODE
                  </button>
                ) : (
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-left space-y-2">
                    <span className="text-[9px] font-bold tracking-widest text-data-label uppercase">Signed JSON presentation Payload</span>
                    <p className="font-mono text-[9px] text-on-surface-variant truncate">{payloadText}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(payloadText)
                        alert('Presentation payload copied!')
                      }}
                      className="text-[10px] font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 mt-1"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                      Copy Raw Payload
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  )
}
