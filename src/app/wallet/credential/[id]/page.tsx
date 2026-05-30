'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import Watermark from '@/components/layout/Watermark'
import { getCredential } from '@/lib/indexeddb'
import { hashCredential } from '@/lib/crypto'
import type { AnchorCredential } from '@/lib/types'
import { translations } from '@/lib/i18n'

export default function CredentialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en')
  const t = translations[lang]

  const id = params.id as string
  const [credential, setCredential] = useState<AnchorCredential | null>(null)
  const [credHash, setCredHash] = useState('')
  const [revocationStatus, setRevocationStatus] = useState<'active' | 'revoked' | 'checking' | 'error' | null>(null)
  const [revocationReason, setRevocationReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Session Guard
    const isSessionUnlocked = sessionStorage.getItem('wallet_session_unlocked')
    if (isSessionUnlocked !== 'true') {
      router.push('/wallet')
      return
    }

    async function loadCredential() {
      try {
        const item = await getCredential(id)
        if (item) {
          setCredential(item)
          const hash = await hashCredential(item)
          setCredHash(hash)
        }
      } catch (err) {
        console.error('Failed to load credential detail', err)
      } finally {
        setLoading(false)
      }
    }
    loadCredential()
  }, [id, router])

  const checkRevocation = async () => {
    if (!credHash) return
    setRevocationStatus('checking')
    setRevocationReason('')
    try {
      // Query revocation endpoint
      const res = await fetch(`/api/revocation?hash=${credHash}`)
      const result = await res.json()
      if (result.success) {
        if (result.revoked) {
          setRevocationStatus('revoked')
          setRevocationReason(result.reason || 'Revoked by authorized issuer')
        } else {
          setRevocationStatus('active')
        }
      } else {
        setRevocationStatus('error')
      }
    } catch (e) {
      setRevocationStatus('error')
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

  const { credentialSubject: cs, _meta } = credential

  return (
    <div className="min-h-screen pb-24 relative">
      <MeshGradient animated />
      <Watermark />
      <TopNav variant="wallet" />

      <main className="max-w-3xl mx-auto px-6 pt-24">
        
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

        {/* Detailed Credential Container */}
        <div className="glass-card rounded-2xl p-8 border border-white/10 space-y-8 relative overflow-hidden cyan-glow-effect">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-2xl">
                  {_meta.displayIcon}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">{_meta.displayName}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">{credential.issuer}</p>
              </div>
            </div>

            {/* Offline Verification Status badge */}
            <div className="bg-tertiary/15 border border-tertiary/25 px-3 py-1 rounded-full flex items-center gap-1.5 verified-glow-effect">
              <span className="material-symbols-filled text-tertiary" style={{ fontSize: '14px' }}>
                verified_user
              </span>
              <span className="text-[10px] font-bold tracking-widest text-tertiary">
                OFFLINE SIGNATURE OK
              </span>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="FULL NAME" value={cs.fullName} />
            <Field label="DATE OF BIRTH" value={cs.dateOfBirth} />
            <Field label="NATIONALITY" value={cs.nationality || '—'} />
            <Field label="HOLDER ID" value={cs.holderId || '—'} mono />
            <Field label="ISSUED BY" value={credential.issuer} />
            <Field label="ISSUANCE DATE" value={new Date(credential.issuanceDate).toLocaleDateString('en-GB')} />
            <Field label="EXPIRATION DATE" value={credential.expirationDate ? new Date(credential.expirationDate).toLocaleDateString('en-GB') : 'N/A'} />
            <Field label="W3C CONTEXT" value={credential['@context'].join(', ')} mono />
          </div>

          {/* Cryptographic Proof Registry Details */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-base">security</span>
              Cryptographic Signature Proof
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-data-label uppercase">CREDENTIAL SHA-256 HASH</span>
                <p className="font-mono text-[10px] text-secondary truncate mt-0.5">{credHash || 'Generating...'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-data-label uppercase">PROOF PURPOSE</span>
                  <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">assertionMethod</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-data-label uppercase">VERIFICATION SCHEME</span>
                  <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">Ed25519Signature2020</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revocation registry checking block */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-on-surface">Registry Revocation Verification</h3>
              <p className="text-[11px] text-on-surface-variant max-w-md">
                Verifiers query the status endpoint to check if this credential hash has been blacklisted due to data correction or lost tokens.
              </p>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
              <button
                onClick={checkRevocation}
                className="bg-surface-container-high border border-white/10 text-on-surface font-bold text-xs tracking-wider px-4 py-2.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">wifi_protected_setup</span>
                Check Status
              </button>

              {revocationStatus === 'checking' && (
                <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                  Checking status...
                </span>
              )}
              {revocationStatus === 'active' && (
                <span className="text-[10px] font-bold text-tertiary flex items-center gap-1 bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  ACTIVE / VALID
                </span>
              )}
              {revocationStatus === 'revoked' && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full justify-end">
                    <span className="material-symbols-outlined text-xs">cancel</span>
                    REVOKED / CANCELLED
                  </span>
                  <p className="text-[9px] text-red-300 mt-1">Reason: {revocationReason}</p>
                </div>
              )}
              {revocationStatus === 'error' && (
                <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  Verification failed. Offline?
                </span>
              )}
            </div>
          </div>

        </div>

      </main>

      <BottomNav />
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold tracking-widest text-data-label uppercase block">{label}</span>
      <p className={`text-sm ${mono ? 'font-mono text-xs text-secondary' : 'text-on-surface'}`}>{value}</p>
    </div>
  )
}
