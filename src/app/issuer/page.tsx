'use client'

import { useState } from 'react'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import { translations } from '@/lib/i18n'
import { createDemoCredential, hashCredential } from '@/lib/crypto'
import type { AnchorCredential, CredentialType, IssuanceRequest } from '@/lib/types'

export default function IssuerDashboard() {
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en')
  const t = translations[lang]

  // Form states
  const [schemaType, setSchemaType] = useState<CredentialType>('RefugeeRegistration')
  const [holderName, setHolderName] = useState('')
  const [holderDid, setHolderDid] = useState('')
  const [dob, setDob] = useState('')
  const [nationality, setNationality] = useState('')
  const [holderId, setHolderId] = useState('')
  
  // Issuance outcomes
  const [issuedCred, setIssuedCred] = useState<AnchorCredential | null>(null)
  const [credPayloadString, setCredPayloadString] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Registry history state
  const [registry, setRegistry] = useState<Array<{
    cred: AnchorCredential
    hash: string
    revocationStatus: 'active' | 'revoked'
  }>>([
    // Prepulate sample data for simulation
    {
      cred: createDemoCredential('RefugeeRegistration', 'did:key:z6Mkexampledidforrefugeeholder8829', {
        holderName: 'Fatoumata Diallo',
        holderId: 'UNHCR-MOI-4881-A',
        nationality: 'Guinean'
      }),
      hash: 'revoked-credential-sha256-hash-demo-value',
      revocationStatus: 'revoked'
    }
  ])

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIssuedCred(null)
    setCredPayloadString('')

    if (!holderDid.trim().startsWith('did:key:')) {
      setErrorMsg('Recipient must have a valid DID Key (starting with did:key:).')
      return
    }

    try {
      setLoading(true)
      // Simulate signing key delays
      await new Promise(resolve => setTimeout(resolve, 1500))

      const overrides: Partial<IssuanceRequest> = {
        holderName,
        dateOfBirth: dob,
        nationality: nationality || undefined,
        holderId
      }

      // Generate the signed credential
      const cred = createDemoCredential(schemaType, holderDid, overrides)
      const hash = await hashCredential(cred)

      // Post to Holder's Mailbox
      const mailboxRes = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: cred })
      })

      const mailboxData = await mailboxRes.json()

      if (mailboxData.success) {
        setIssuedCred(cred)
        setCredPayloadString(JSON.stringify(cred, null, 2))

        // Add to local audit/revocation registry
        setRegistry(prev => [
          { cred, hash, revocationStatus: 'active' },
          ...prev
        ])

        // Reset form
        setHolderName('')
        setHolderDid('')
        setDob('')
        setNationality('')
        setHolderId('')
      } else {
        setErrorMsg('Failed to post signed credential to holder mailbox.')
      }

    } catch (err) {
      setErrorMsg('Cryptographic signature routine failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeCredential = async (hash: string, index: number) => {
    const confirmRev = confirm('Are you sure you want to revoke this credential? This action is immediate and public verifiers will block it.')
    if (!confirmRev) return

    try {
      const res = await fetch('/api/revocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash, reason: 'Revoked by UNHCR issuer agency' })
      })
      
      const data = await res.json()
      if (data.success) {
        setRegistry(prev => {
          const updated = [...prev]
          updated[index].revocationStatus = 'revoked'
          return updated
        })
        alert('Credential hash successfully revoked!')
      }
    } catch (e) {
      alert('Failed to connect to revocation status server.')
    }
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <MeshGradient animated />
      <TopNav variant="issuer" />

      <main className="max-w-6xl mx-auto px-6 pt-24 space-y-12">
        
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">domain</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">{t.issuer.title}</h1>
            <p className="text-xs text-on-surface-variant">NGO/UNHCR authorized digital credentials issuance desk.</p>
          </div>
        </div>

        {/* Dynamic Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Form panel */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 relative overflow-hidden">
              <h3 className="text-base font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">edit_document</span>
                Issue Signed Verifiable Credential (VC)
              </h3>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
                  <p className="text-xs font-bold tracking-widest text-primary uppercase">Cryptographically Signing Claims...</p>
                </div>
              ) : (
                <form onSubmit={handleIssueCredential} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Schema Selection */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.credentialType}
                    </label>
                    <select
                      value={schemaType}
                      onChange={e => setSchemaType(e.target.value as CredentialType)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 outline-none text-xs text-on-surface focus:border-secondary cursor-pointer"
                    >
                      <option value="RefugeeRegistration">Refugee Registration Card (UNHCR)</option>
                      <option value="BirthCertificate">Birth Certificate (Interior Ministry)</option>
                      <option value="VaccinationRecord">Vaccination Immunization Record (WHO)</option>
                      <option value="AcademicTranscript">Academic Transcript (University)</option>
                      <option value="AsylumSeeker">Asylum Seeker Status Certificate</option>
                      <option value="StatelessPerson">Stateless Person ID Record</option>
                      <option value="MedicalRecord">Medical Health Record (IMC)</option>
                    </select>
                  </div>

                  {/* Holder Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.holderName}
                    </label>
                    <input
                      type="text"
                      value={holderName}
                      onChange={e => setHolderName(e.target.value)}
                      placeholder="e.g. Amir Al-Sabah"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                      required
                    />
                  </div>

                  {/* Holder ID */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.holderId}
                    </label>
                    <input
                      type="text"
                      value={holderId}
                      onChange={e => setHolderId(e.target.value)}
                      placeholder="e.g. UNHCR-IRQ-8829-Z"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.dob}
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 outline-none text-xs text-on-surface focus:border-secondary cursor-pointer"
                      required
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.nationality}
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      placeholder="e.g. Syrian"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                    />
                  </div>

                  {/* Recipient DID */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                      {t.issuer.holderDid}
                    </label>
                    <input
                      type="text"
                      value={holderDid}
                      onChange={e => setHolderDid(e.target.value)}
                      placeholder="e.g. did:key:z6Mk..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 outline-none text-xs text-secondary font-mono focus:border-secondary"
                      required
                    />
                  </div>

                  <div className="pt-4 sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      {t.issuer.issueBtn.toUpperCase()}
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Issued registry logs */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">assignment</span>
                {t.issuer.credentialRegistry}
              </h3>
              
              <div className="space-y-3">
                {registry.map((item, index) => (
                  <div 
                    key={item.cred.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/10 gap-4"
                  >
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-on-surface">{item.cred._meta.displayName}</h4>
                        <span className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full border
                          ${item.revocationStatus === 'active' 
                            ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' 
                            : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                          {item.revocationStatus === 'active' ? t.issuer.activeStatus : t.issuer.revokedStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-mono truncate max-w-sm sm:max-w-md">
                        Recipient: {item.cred.credentialSubject.id}
                      </p>
                    </div>

                    {item.revocationStatus === 'active' && (
                      <button
                        onClick={() => handleRevokeCredential(item.hash, index)}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[10px] tracking-wider px-3.5 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                      >
                        {t.issuer.revokeBtn.toUpperCase()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic signing preview */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 h-fit min-h-[400px]">
              <div>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Signing Terminal Output</h3>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Real-time cryptographic variables of the Ed25519 verifiable credential generated.
                </p>
              </div>

              {!issuedCred ? (
                <div className="border border-dashed border-white/10 rounded-xl p-12 text-center text-on-surface-variant space-y-4">
                  <span className="material-symbols-outlined text-4xl">drafts</span>
                  <p className="text-xs leading-relaxed max-w-[180px] mx-auto">
                    Draft and issue a credential. Compliant W3C JSON representation outputs here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary p-3 rounded-xl text-xs font-semibold text-center">
                    {t.issuer.issueSuccess}
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold tracking-widest text-data-label uppercase">VC JSON-LD DATA</span>
                    <pre className="w-full max-h-80 overflow-y-auto bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-secondary scrollbar no-scrollbar">
                      {credPayloadString}
                    </pre>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credPayloadString)
                      alert('JSON Payload copied to clipboard!')
                    }}
                    className="w-full bg-white/5 border border-white/10 text-on-surface font-bold text-xs tracking-wider py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    {t.issuer.copyPayload}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
