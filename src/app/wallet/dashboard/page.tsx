'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import Watermark from '@/components/layout/Watermark'
import Footer from '@/components/layout/Footer'
import CredentialCard from '@/components/wallet/CredentialCard'
import { getActiveKeyPair, getAllCredentials, saveCredential, wipeWallet, getRecoveryContacts, saveRecoveryContact, deleteRecoveryContact } from '@/lib/indexeddb'
import type { AnchorCredential, AnchorKeyPair, RecoveryContact } from '@/lib/types'
import { translations } from '@/lib/i18n'
import { createDemoCredential } from '@/lib/crypto'

export default function WalletDashboard() {
  const router = useRouter()
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en') // Default EN
  const t = translations[lang]

  const [keyPair, setKeyPair] = useState<AnchorKeyPair | null>(null)
  const [credentials, setCredentials] = useState<AnchorCredential[]>([])
  const [contacts, setContacts] = useState<RecoveryContact[]>([])
  const [activeTab, setActiveTab] = useState<'credentials' | 'recovery' | 'settings'>('credentials')
  
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPayload, setImportPayload] = useState('')
  const [syncStatus, setSyncStatus] = useState('')
  const [importError, setImportError] = useState('')

  // Guardian contact state
  const [newGuardianName, setNewGuardianName] = useState('')
  const [newGuardianPhone, setNewGuardianPhone] = useState('')

  useEffect(() => {
    // 1. Session Unlock Guard
    const isSessionUnlocked = sessionStorage.getItem('wallet_session_unlocked')
    if (isSessionUnlocked !== 'true') {
      router.push('/wallet')
      return
    }

    async function loadWalletData() {
      try {
        const kp = await getActiveKeyPair()
        if (!kp) {
          router.push('/wallet')
          return
        }
        setKeyPair(kp)

        const creds = await getAllCredentials()
        setCredentials(creds)

        const recv = await getRecoveryContacts()
        setContacts(recv)
      } catch (err) {
        console.error('Failed to load wallet data', err)
      } finally {
        setLoading(false)
      }
    }

    loadWalletData()
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Import Logic ──
  const checkMailbox = async () => {
    if (!keyPair) return
    setSyncStatus('Syncing with UNHCR & NGO endpoints...')
    setImportError('')
    try {
      const res = await fetch(`/api/credentials?holderDid=${encodeURIComponent(keyPair.did)}`)
      const result = await res.json()
      if (result.success && result.credentials && result.credentials.length > 0) {
        let count = 0
        for (const cred of result.credentials) {
          // Add metadata
          cred._meta = {
            ...cred._meta,
            isVerified: true,
            verifiedAt: new Date().toISOString(),
            storedAt: new Date().toISOString()
          }
          await saveCredential(cred)
          count++
        }

        // Clear mailbox
        await fetch(`/api/credentials?holderDid=${encodeURIComponent(keyPair.did)}`, { method: 'DELETE' })

        // Reload credentials
        const updated = await getAllCredentials()
        setCredentials(updated)
        setSyncStatus(`Successfully imported ${count} credentials!`)
      } else {
        setSyncStatus('Your credential mailbox is currently empty.')
      }
    } catch (err) {
      setImportError('Failed to fetch from mailbox. Check connection.')
      setSyncStatus('')
    }
  }

  const handleManualImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setImportError('')
    setSyncStatus('')
    if (!importPayload.trim()) {
      setImportError('Please paste a credential JSON payload.')
      return
    }

    try {
      const cred = JSON.parse(importPayload)
      if (!cred.id || !cred.type || !cred.credentialSubject) {
        setImportError('Invalid W3C Verifiable Credential format.')
        return
      }

      // Format local metadata
      cred._meta = cred._meta || {
        localId: cred.id,
        credentialType: cred.type[1] || 'RefugeeRegistration',
        displayName: cred.type[1] ? cred.type[1].replace(/([A-Z])/g, ' $1').trim() : 'Humanitarian Credential',
        displayIcon: 'badge',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        storedAt: new Date().toISOString()
      }

      await saveCredential(cred)
      
      const updated = await getAllCredentials()
      setCredentials(updated)
      
      setImportPayload('')
      setShowImportModal(false)
      alert('Credential successfully imported offline!')
    } catch (err) {
      setImportError('JSON parsing error. Ensure the payload is copied accurately.')
    }
  }

  // ── Import Demo Credential (convenience button) ──
  const handleLoadDemoCreds = async () => {
    if (!keyPair) return
    setLoading(true)
    try {
      const refugee = createDemoCredential('RefugeeRegistration', keyPair.did)
      const vaccine = createDemoCredential('VaccinationRecord', keyPair.did)
      await saveCredential(refugee)
      await saveCredential(vaccine)

      const updated = await getAllCredentials()
      setCredentials(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Social Recovery Logic ──
  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuardianName.trim()) return

    const newContact: RecoveryContact = {
      id: Math.random().toString(36).substring(7),
      name: newGuardianName,
      phone: newGuardianPhone || undefined,
      shareId: `recovery-share-did-${keyPair?.did.slice(-8)}-slice-${contacts.length + 1}`,
      hasConfirmed: true,
      addedAt: new Date().toISOString()
    }

    await saveRecoveryContact(newContact)
    const updated = await getRecoveryContacts()
    setContacts(updated)
    
    setNewGuardianName('')
    setNewGuardianPhone('')
  }

  const handleDeleteGuardian = async (id: string) => {
    await deleteRecoveryContact(id)
    const updated = await getRecoveryContacts()
    setContacts(updated)
  }

  // ── Settings Logic ──
  const handleEmergencyWipe = async () => {
    const doubleCheck = confirm('CRITICAL DANGER: This will delete your DID and all credentials permanently from this device. Are you sure?')
    if (doubleCheck) {
      await wipeWallet()
      sessionStorage.clear()
      localStorage.clear()
      router.push('/')
    }
  }

  const handleLockWallet = () => {
    sessionStorage.removeItem('wallet_session_unlocked')
    router.push('/wallet')
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

  return (
    <div className="min-h-screen pb-24 relative">
      <MeshGradient animated />
      <Watermark />
      <TopNav variant="wallet" />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-24">
        
        {/* Back Navigation */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-on-surface-variant hover:text-secondary mb-4 transition-colors relative z-10"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            BACK TO HOME
          </Link>
        </div>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-2xl">dashboard</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">Identity Wallet Dashboard</h1>
            <p className="text-sm text-on-surface-variant mt-1">Access platform tools, credentials, and verification services.</p>
          </div>
        </div>

        {/* Holder Identity Panel */}
        <section className="glass-card rounded-2xl p-6 border border-white/10 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cyan-glow-effect">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-secondary block uppercase">
              {t.wallet.didLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-on-surface-variant max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                {keyPair?.did}
              </span>
              <button 
                onClick={() => copyToClipboard(keyPair?.did || '')}
                className="text-secondary hover:text-secondary-variant p-1.5 bg-white/5 rounded-lg border border-white/10 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Copy DID string to clipboard"
              >
                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-grow md:flex-none bg-secondary text-surface-dim font-bold text-xs tracking-wider px-4 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">cloud_download</span>
              {t.wallet.addCredentialBtn}
            </button>
            <button
              onClick={handleLockWallet}
              className="bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface p-3 rounded-xl active:scale-95 transition-all flex items-center justify-center"
              aria-label="Lock Wallet"
            >
              <span className="material-symbols-outlined text-base">lock</span>
            </button>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="border-b border-white/10 mb-6 flex gap-6">
          {(['credentials', 'recovery', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all
                ${activeTab === tab 
                  ? 'border-secondary text-secondary' 
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab === 'credentials' ? t.wallet.myCredentials : tab === 'recovery' ? 'Guardian Recovery' : 'Settings'}
            </button>
          ))}
        </div>

        {/* Tab 1: Credentials List */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            {credentials.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-white/10 space-y-4">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">badge</span>
                <h3 className="text-lg font-bold text-on-surface">{t.wallet.noCredentials}</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  {t.wallet.noCredentialsDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button 
                    onClick={() => setShowImportModal(true)}
                    className="bg-secondary text-surface-dim font-bold text-xs tracking-wider px-5 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Import Verifiable Credential
                  </button>
                  <button 
                    onClick={handleLoadDemoCreds}
                    className="bg-white/5 border border-white/10 text-on-surface font-bold text-xs tracking-wider px-5 py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Generate Simulation Demo IDs
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Horizontal scroll on compact view */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                  {credentials.map(c => (
                    <CredentialCard key={c.id} credential={c} variant="compact" />
                  ))}
                </div>
                
                {/* Detailed view of list */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-widest text-data-label uppercase">DETAILED OFFLINE CARDS</h4>
                  {credentials.map(c => (
                    <CredentialCard 
                      key={c.id} 
                      credential={c} 
                      variant="featured" 
                      onPresent={() => router.push(`/wallet/present/${c.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Guardian Recovery */}
        {activeTab === 'recovery' && (
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-on-surface">{t.wallet.socialRecovery}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Configure **3-of-5 Social Recovery**. By appointing trusted contacts, you can reconstruct your cryptographic DID keys on a new phone if your device is stolen, broken, or lost in a crisis.
              </p>
            </div>

            {/* Guardian List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Nominate Form */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 h-fit">
                <h4 className="text-xs font-bold text-secondary uppercase">Nominate A Guardian</h4>
                <form onSubmit={handleAddGuardian} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">GUARDIAN NAME</label>
                    <input
                      type="text"
                      value={newGuardianName}
                      onChange={e => setNewGuardianName(e.target.value)}
                      placeholder="e.g. Brother, Local NGO, Priest"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">CONTACT OR DEVICE INFO</label>
                    <input
                      type="text"
                      value={newGuardianPhone}
                      onChange={e => setNewGuardianPhone(e.target.value)}
                      placeholder="e.g. Phone number or details"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-2.5 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    NOMINATE GUARDIAN
                  </button>
                </form>
              </div>

              {/* Right Column: List of Nominees */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-on-surface uppercase">Appointed Guardians ({contacts.length}/5)</h4>
                
                {contacts.length === 0 ? (
                  <p className="text-xs text-on-surface-variant leading-relaxed py-6 text-center">
                    No guardians appointed yet. Appoint 3 to 5 trusted friends or local relief workers to safeguard your identity.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map(contact => (
                      <div key={contact.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-on-surface">{contact.name}</p>
                          <p className="text-[10px] text-secondary font-mono tracking-wider">{contact.shareId}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteGuardian(contact.id)}
                          className="text-red-400 hover:text-red-300 p-1 bg-white/5 border border-white/10 rounded-lg"
                          aria-label="Remove Guardian"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-on-surface">Offline Preferences</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Manage your credentials locally. All data resides strictly in your browser sandboxed storage (IndexedDB) on this browser profile. Disconnecting from networks will not impede access.
              </p>
            </div>

            {/* Emergency Wipe */}
            <div className="glass-card border-red-500/20 bg-red-500/5 rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-red-500 text-6xl">warning</span>
              </div>
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">dangerous</span>
                {t.wallet.wipeTitle}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-xl">
                {t.wallet.wipeDesc}
              </p>
              <button
                onClick={handleEmergencyWipe}
                className="bg-red-500 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all"
              >
                {t.wallet.wipeConfirm}
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />

      {/* ── IMPORT MODAL ── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-white/10 space-y-6 shadow-glass relative">
            <button 
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <h3 className="text-lg font-bold text-on-surface">Import Verifiable Credential</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Receive new signed identity records offline or fetch them from your secure mailbox.
              </p>
            </div>

            {/* Option A: Mailbox Sync */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">sync</span>
                Option 1: Sync Secure Mailbox
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                NGOs issue credentials directly to your Holder DID. Hit Sync to query your temporary offline mailbox.
              </p>
              
              {syncStatus && <p className="text-xs text-secondary font-semibold font-mono">{syncStatus}</p>}
              {importError && <p className="text-xs text-red-400 font-semibold">{importError}</p>}
              
              <button
                onClick={checkMailbox}
                className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-2.5 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Sync Mailbox Credentials
              </button>
            </div>

            {/* Option B: Manual copy paste */}
            <form onSubmit={handleManualImport} className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">content_paste</span>
                Option 2: Paste Signed JSON Payload
              </h4>
              <textarea
                value={importPayload}
                onChange={e => setImportPayload(e.target.value)}
                placeholder='Paste raw credential JSON here. E.g. {"@context": [...], "id": "...", ...}'
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-xs font-mono text-secondary focus:border-secondary transition-all"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-white/5 border border-white/10 text-on-surface px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-surface-dim px-5 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
                >
                  Save to Wallet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
