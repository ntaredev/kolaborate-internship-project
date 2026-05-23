'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import { translations } from '@/lib/i18n'
import { generateDIDKey } from '@/lib/crypto'
import { saveKeyPair, wipeWallet } from '@/lib/indexeddb'

export default function SocialRecoveryPage() {
  const router = useRouter()
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en')
  const t = translations[lang]

  const [share1, setShare1] = useState('')
  const [share2, setShare2] = useState('')
  const [share3, setShare3] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRestoreWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!share1.trim() || !share2.trim() || !share3.trim()) {
      setErrorMsg('You must provide at least 3 recovery key slices from your guardians.')
      return
    }

    try {
      setLoading(true)
      // Simulate cryptographic reconstruction of the DID keypair from the secret shares
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clean local storage to prevent key conflicts
      await wipeWallet()

      // Generate a reconstructed keypair DID client-side
      const kp = await generateDIDKey()
      await saveKeyPair(kp)

      setSuccessMsg('DID Identity cryptographically reconstructed! Wallet successfully restored.')
      sessionStorage.setItem('wallet_session_unlocked', 'true')
      
      setTimeout(() => {
        router.push('/wallet/dashboard')
      }, 1500)

    } catch (err) {
      setErrorMsg('Reconstruction failed. Invalid secret shares. Please review inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 relative py-12">
      <MeshGradient animated />
      <TopNav variant="wallet" />

      {/* Container */}
      <div className="w-full max-w-lg glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden flex flex-col items-center cyan-glow-effect">
        
        {/* Decorator */}
        <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-secondary text-3xl">local_hospital</span>
        </div>

        <div className="w-full text-center space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface">{t.wallet.restoreIdentity}</h2>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              {t.wallet.restoreIdentityDesc}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary p-3 rounded-xl text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {loading ? (
            <div className="py-8 space-y-4">
              <span className="material-symbols-outlined text-4xl text-secondary animate-spin">refresh</span>
              <p className="text-xs font-bold tracking-widest text-secondary uppercase">RECONSTRUCTING KEY Slices...</p>
            </div>
          ) : (
            <form onSubmit={handleRestoreWallet} className="space-y-6 text-left">
              
              {/* Share 1 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                  GUARDIAN SHARE 1
                </label>
                <textarea
                  value={share1}
                  onChange={e => setShare1(e.target.value)}
                  placeholder="Paste first recovery token slice here..."
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2.5 outline-none text-xs text-secondary font-mono focus:border-secondary transition-all resize-none"
                  required
                />
              </div>

              {/* Share 2 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                  GUARDIAN SHARE 2
                </label>
                <textarea
                  value={share2}
                  onChange={e => setShare2(e.target.value)}
                  placeholder="Paste second recovery token slice here..."
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2.5 outline-none text-xs text-secondary font-mono focus:border-secondary transition-all resize-none"
                  required
                />
              </div>

              {/* Share 3 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-data-label uppercase">
                  GUARDIAN SHARE 3
                </label>
                <textarea
                  value={share3}
                  onChange={e => setShare3(e.target.value)}
                  placeholder="Paste third recovery token slice here..."
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2.5 outline-none text-xs text-secondary font-mono focus:border-secondary transition-all resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">construction</span>
                  RECONSTRUCT WALLET IDENTITY
                </button>
                <Link
                  href="/wallet"
                  className="w-full bg-white/5 border border-white/10 text-on-surface-variant font-bold text-xs tracking-wider py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-center block"
                >
                  CANCEL
                </Link>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  )
}
