'use client'

import type { AnchorCredential } from '@/lib/types'
import Link from 'next/link'

interface CredentialCardProps {
  credential: AnchorCredential
  variant?: 'featured' | 'compact'
  onPresent?: () => void
  onView?: () => void
}

const ACCENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  RefugeeRegistration: {
    bg: 'bg-primary-container',
    text: 'text-primary',
    border: 'border-primary/20',
  },
  BirthCertificate: {
    bg: 'bg-primary-container',
    text: 'text-primary',
    border: 'border-primary/20',
  },
  VaccinationRecord: {
    bg: 'bg-tertiary-container',
    text: 'text-tertiary',
    border: 'border-tertiary/20',
  },
  AcademicTranscript: {
    bg: 'bg-surface-container-highest',
    text: 'text-on-surface',
    border: 'border-white/10',
  },
  AsylumSeeker: {
    bg: 'bg-secondary-container/30',
    text: 'text-secondary',
    border: 'border-secondary/20',
  },
  StatelessPerson: {
    bg: 'bg-surface-container-highest',
    text: 'text-on-surface-variant',
    border: 'border-white/10',
  },
  MedicalRecord: {
    bg: 'bg-tertiary-container',
    text: 'text-tertiary',
    border: 'border-tertiary/20',
  },
}

export default function CredentialCard({
  credential,
  variant = 'compact',
  onPresent,
  onView,
}: CredentialCardProps) {
  const accent = ACCENT_COLORS[credential._meta.credentialType] ?? ACCENT_COLORS.RefugeeRegistration
  const { credentialSubject: cs, _meta, issuer } = credential

  if (variant === 'featured') {
    return (
      <div className="glass-card glass-card-hover rounded-2xl p-card-padding
        flex flex-col md:flex-row gap-8 relative overflow-hidden cyan-glow-effect">

        {/* Verified badge */}
        {_meta.isVerified && (
          <div className="absolute top-0 right-0 p-5">
            <div className="bg-tertiary/15 border border-tertiary/25 px-3 py-1 rounded-full
              flex items-center gap-1.5 verified-glow-effect">
              <span className="material-symbols-filled text-tertiary" style={{ fontSize: '14px' }}>
                verified_user
              </span>
              <span className="text-[10px] font-bold tracking-widest text-tertiary">
                OFFLINE VERIFIED
              </span>
            </div>
          </div>
        )}

        {/* Avatar & name */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-surface-container-highest
            border border-white/10 overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '64px' }}>
              person
            </span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-widest text-data-label uppercase">ID HOLDER</p>
            <h3 className="text-xl font-semibold text-on-surface mt-1">{cs.fullName}</h3>
          </div>
        </div>

        {/* Details grid */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Field label="CREDENTIAL TYPE" value={_meta.displayName} valueClass="text-secondary" />
            <Field label="HOLDER ID" value={cs.holderId ?? '—'} mono />
            <Field label="DATE OF BIRTH" value={cs.dateOfBirth ? formatDate(cs.dateOfBirth) : '—'} />
          </div>
          <div className="space-y-4">
            <Field label="ISSUED BY" value={issuer} />
            <Field label="EXPIRY DATE" value={credential.expirationDate ? formatDate(credential.expirationDate) : '—'} />
            <Field label="NATIONALITY" value={cs.nationality ?? '—'} />
          </div>
          <div className="flex flex-col justify-end gap-3 lg:border-l lg:border-white/10 lg:pl-6">
            <button
              id={`present-${credential.id}`}
              onClick={onPresent}
              className="w-full bg-surface-container-high border border-white/10 text-on-surface
                py-3 rounded-xl flex items-center justify-center gap-2
                hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">qr_code_2</span>
              <span className="font-medium">Present QR</span>
            </button>
            <Link
              href={`/wallet/credential/${credential.id}`}
              id={`view-${credential.id}`}
              className="w-full bg-white/5 border border-white/10 text-on-surface-variant
                py-3 rounded-xl flex items-center justify-center gap-2
                hover:text-on-surface hover:bg-white/8 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
              <span className="font-medium">View Details</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Compact card
  return (
    <div className="flex-shrink-0 w-[280px] snap-start glass-card glass-card-hover rounded-xl p-5">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-10 h-10 rounded-lg ${accent.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${accent.text}`}>
            {_meta.displayIcon}
          </span>
        </div>
        <button
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
          aria-label="Credential options"
        >
          <span className="material-symbols-outlined text-sm">more_vert</span>
        </button>
      </div>

      <h5 className="text-base font-bold text-on-surface mb-1">{_meta.displayName}</h5>
      <p className="text-sm text-on-surface-variant mb-6">{issuer}</p>

      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs ${_meta.isVerified ? 'text-tertiary' : 'text-data-label'}`}>
          {_meta.isVerified ? 'VERIFIED' : 'PENDING'}
        </span>
        <Link
          href={`/wallet/present/${credential.id}`}
          className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors"
        >
          PRESENT
        </Link>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  valueClass,
  mono,
}: {
  label: string
  value: string
  valueClass?: string
  mono?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-widest text-data-label block mb-1">
        {label}
      </label>
      <p className={`text-base ${mono ? 'font-mono text-xs' : ''} ${valueClass ?? 'text-on-surface'}`}>
        {value}
      </p>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase()
  } catch {
    return iso
  }
}
