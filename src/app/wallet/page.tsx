'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import { generateDIDKey, derivePINKey } from '@/lib/crypto'
import { getActiveKeyPair, saveKeyPair, setSetting, getSetting } from '@/lib/indexeddb'
import { registerPasskey, authenticatePasskey, hasPasskeyRegistered } from '@/lib/webauthn'
import { translations } from '@/lib/i18n'

export default function WalletAuthPage() {
  const router = useRouter()
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en') // Default EN
  const t = translations[lang]

  const [hasKeys, setHasKeys] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'biometric' | 'pin'>('biometric')
  
  // Registration state
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'welcome' | 'generating' | 'securing' | 'success'>('welcome')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Unlock state
  const [unlockPin, setUnlockPin] = useState('')

  useEffect(() => {
    async function checkExistingWallet() {
      try {
        const kp = await getActiveKeyPair()
        if (kp) {
          setHasKeys(true)
          if (hasPasskeyRegistered()) {
            setAuthMode('biometric')
          } else {
            setAuthMode('pin')
          }
        }
      } catch (e) {
        console.warn('DB initialization error', e)
      } finally {
        setLoading(false)
      }
    }
    checkExistingWallet()
  }, [])

  // ── Onboarding ──
  const handleOnboardGenerate = async () => {
    setStep('generating')
    setErrorMsg('')
    try {
      // Simulate cryptographic derivation delay for micro-animation feel
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const kp = await generateDIDKey()
      await saveKeyPair(kp)
      
      // Setup default identity name
      await setSetting('identity_name', 'Holder Identity')
      
      setStep('securing')
    } catch (err) {
      setErrorMsg('Failed to derive keys: ' + (err instanceof Error ? err.message : 'Unknown'))
      setStep('welcome')
    }
  }

  const handleRegisterPIN = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setErrorMsg('PIN must be exactly 6 digits.')
      return
    }
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match.')
      return
    }

    try {
      setLoading(true)
      const salt = 'anchorid-salt-string-for-pin-derivation'
      const derivedHash = await derivePINKey(pin, salt)
      await setSetting('pin_hash', derivedHash)
      
      setStep('success')
    } catch (err) {
      setErrorMsg('PIN setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterBiometrics = async () => {
    setErrorMsg('')
    try {
      setLoading(true)
      const res = await registerPasskey('anchorid-holder-uuid', 'AnchorID Holder')
      if (res.success) {
        setStep('success')
      } else {
        setErrorMsg(res.error || 'Biometric registration failed.')
      }
    } catch (err) {
      setErrorMsg('Biometric registration error.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToDashboard = () => {
    // Unlock session locally
    sessionStorage.setItem('wallet_session_unlocked', 'true')
    router.push('/wallet/dashboard')
  }

  // ── Unlock ──
  const handleBiometricUnlock = async () => {
    setErrorMsg('')
    try {
      setLoading(true)
      const res = await authenticatePasskey()
      if (res.success) {
        sessionStorage.setItem('wallet_session_unlocked', 'true')
        router.push('/wallet/dashboard')
      } else {
        setErrorMsg(res.error || 'Biometric auth failed.')
      }
    } catch (err) {
      setErrorMsg('Biometric unlock failed.')
    } finally {
      setLoading(false)
    }
  }

  const handlePINUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (unlockPin.length !== 6 || !/^\d+$/.test(unlockPin)) {
      setErrorMsg('PIN must be 6 digits.')
      return
    }

    try {
      setLoading(true)
      const storedHash = await getSetting<string>('pin_hash')
      if (!storedHash) {
        setErrorMsg('No PIN configured. Try biometrics.')
        return
      }

      const salt = 'anchorid-salt-string-for-pin-derivation'
      const currentHash = await derivePINKey(unlockPin, salt)

      if (currentHash === storedHash) {
        sessionStorage.setItem('wallet_session_unlocked', 'true')
        router.push('/wallet/dashboard')
      } else {
        setErrorMsg('Invalid PIN. Please try again.')
      }
    } catch (err) {
      setErrorMsg('Unlock error. Please try again.')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 relative py-12">
      <MeshGradient />
      <TopNav variant="wallet" />

      {/* Main card box */}
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden flex flex-col items-center cyan-glow-effect">
        
        {/* Top Icon Decoration */}
        <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6 relative">
          <span className="material-symbols-filled text-secondary text-3xl">anchor</span>
        </div>

        {/* ── RETURN HOLDER UNLOCK FLOW ── */}
        {hasKeys && (
          <div className="w-full text-center space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-on-surface">{t.wallet.unlockTitle}</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{t.wallet.unlockDesc}</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            {authMode === 'biometric' ? (
              <div className="space-y-6">
                <button
                  onClick={handleBiometricUnlock}
                  className="w-24 h-24 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mx-auto hover:bg-secondary/25 active:scale-95 transition-all biometric-ring cursor-pointer"
                  aria-label="Unlock with Fingerprint or Face ID"
                >
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '48px' }}>
                    fingerprint
                  </span>
                </button>
                <div className="space-y-3">
                  <button
                    onClick={handleBiometricUnlock}
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 transition-all"
                  >
                    VERIFY BIOMETRICS
                  </button>
                  <button
                    onClick={() => { setErrorMsg(''); setAuthMode('pin'); }}
                    className="text-xs font-bold text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    {t.wallet.pinFallback}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePINUnlock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-data-label block text-left uppercase">
                    {t.wallet.enterPIN}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={unlockPin}
                    onChange={e => setUnlockPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[1.5em] text-lg font-mono bg-white/5 border border-white/10 rounded-xl py-3 text-secondary focus:border-secondary outline-none transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 transition-all"
                  >
                    UNLOCK WALLET
                  </button>
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setAuthMode('biometric'); }}
                    className="text-xs font-bold text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    Use Biometric Unlock
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── FIRST TIME ONBOARDING FLOW ── */}
        {!hasKeys && (
          <div className="w-full">
            {step === 'welcome' && (
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">{t.wallet.firstTimeTitle}</h2>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{t.wallet.firstTimeDesc}</p>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleOnboardGenerate}
                  className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">vpn_key</span>
                  {t.wallet.generateKeys}
                </button>
              </div>
            )}

            {step === 'generating' && (
              <div className="text-center space-y-6 py-6">
                <span className="material-symbols-outlined text-5xl text-secondary animate-spin">settings</span>
                <div>
                  <h3 className="text-base font-bold text-secondary">Securing Browser Storage</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{t.wallet.generatingKeys}</p>
                </div>
              </div>
            )}

            {step === 'securing' && (
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Secure Your Keys</h2>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Set up a biometric passkey or PIN fallback to protect your credentials.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleRegisterBiometrics}
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">fingerprint</span>
                    {t.wallet.setupPasskey}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-on-surface-variant font-mono">OR</span></div>
                  </div>

                  <form onSubmit={handleRegisterPIN} className="space-y-4 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                        6-DIGIT SECURITY PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center tracking-[1em] text-secondary font-mono outline-none focus:border-secondary transition-all"
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                        CONFIRM PIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center tracking-[1em] text-secondary font-mono outline-none focus:border-secondary transition-all"
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-surface-container-high border border-white/10 text-on-surface font-bold text-xs tracking-wider py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                    >
                      {t.wallet.setupPIN}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-tertiary/15 border border-tertiary/20 rounded-full flex items-center justify-center mx-auto verified-glow-effect">
                  <span className="material-symbols-filled text-tertiary text-2xl">check_circle</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-tertiary">{t.wallet.keysSuccess}</h3>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    Your Ed25519 DID is ready. Your wallet is securely stored in your local browser sandbox.
                  </p>
                </div>
                <button
                  onClick={handleProceedToDashboard}
                  className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 transition-all"
                >
                  ENTER WALLET DASHBOARD
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
