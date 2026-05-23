'use client'

import { useState, useEffect } from 'react'
import MeshGradient from '@/components/MeshGradient'
import TopNav from '@/components/layout/TopNav'
import { translations } from '@/lib/i18n'

export default function AdminConsole() {
  const [lang] = useState<'en' | 'sw' | 'fr' | 'ar'>('en')
  const t = translations[lang]

  const [issuers, setIssuers] = useState<any[]>([])
  const [newIssuerDid, setNewIssuerDid] = useState('')
  const [newIssuerName, setNewIssuerName] = useState('')
  const [newIssuerEmail, setNewIssuerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Simulated audit logs
  const [auditLogs] = useState([
    { actor: 'unhcr-admin-01', action: 'issuer_approved', target: 'WHO Health Authority', time: '10 mins ago' },
    { actor: 'ngo-imc-desk', action: 'credential_revoked', target: 'MedicalRecord #88b12', time: '2 hours ago' },
    { actor: 'unhcr-admin-01', action: 'revocation_list_published', target: 'RevocationList2020Status', time: '4 hours ago' },
    { actor: 'system-agent', action: 'audit_trail_flushed', target: 'Database Backup', time: '1 day ago' }
  ])

  useEffect(() => {
    loadIssuers()
  }, [])

  async function loadIssuers() {
    try {
      const res = await fetch('/api/issuers')
      const data = await res.json()
      if (data.success) {
        setIssuers(data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveIssuer = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setAdding(true)

    if (!newIssuerDid.startsWith('did:key:')) {
      setErrorMsg('Issuer DID must be a valid DID Key (did:key:...).')
      setAdding(false)
      return
    }

    try {
      const res = await fetch('/api/issuers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: newIssuerDid,
          name: newIssuerName,
          email: newIssuerEmail
        })
      })

      const data = await res.json()
      if (data.success) {
        setNewIssuerDid('')
        setNewIssuerName('')
        setNewIssuerEmail('')
        // Reload list
        loadIssuers()
        alert('New humanitarian issuer successfully approved in trust registry!')
      } else {
        setErrorMsg(data.error || 'Failed to approve issuer.')
      }
    } catch (err) {
      setErrorMsg('Database connection failure.')
    } finally {
      setAdding(false)
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
    <div className="min-h-screen pb-24 relative">
      <MeshGradient animated />
      <TopNav variant="issuer" />

      <main className="max-w-6xl mx-auto px-6 pt-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">Humanitarian Admin Console</h1>
            <p className="text-xs text-on-surface-variant">Global governance, trusted NGO authorization, and compliance analytics.</p>
          </div>
        </div>

        {/* Analytics row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <AnalyticsCard label="TOTAL SIGNED CREDENTIALS" value="8,402" color="text-secondary" icon="badge" />
          <AnalyticsCard label="ACTIVE NGO ISSUERS" value={issuers.length.toString()} color="text-primary" icon="domain" />
          <AnalyticsCard label="REVOKED CREDENTIALS" value="14" color="text-red-400" icon="cancel" />
        </section>

        {/* Administration views */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Issuer management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* List */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                Approved Trust Registry ({issuers.length})
              </h3>
              
              <div className="space-y-3">
                {issuers.map(issuer => (
                  <div key={issuer.did} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-on-surface">{issuer.name}</h4>
                        <span className="text-[8px] font-bold tracking-widest text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full">
                          APPROVED
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-mono truncate max-w-sm sm:max-w-md">
                        DID: {issuer.did}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">Email: {issuer.email}</p>
                    </div>
                    
                    <button className="text-[10px] font-bold text-secondary bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg hover:bg-white/10 transition-colors">
                      MANAGE ACCESS
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add_moderator</span>
                Approve New Humanitarian Issuer
              </h3>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleApproveIssuer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-widest text-data-label uppercase">ORGANIZATION NAME</label>
                  <input
                    type="text"
                    value={newIssuerName}
                    onChange={e => setNewIssuerName(e.target.value)}
                    placeholder="e.g. Red Cross Regional Office"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-widest text-data-label uppercase">CONTACT EMAIL</label>
                  <input
                    type="email"
                    value={newIssuerEmail}
                    onChange={e => setNewIssuerEmail(e.target.value)}
                    placeholder="e.g. safety@redcross.org"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-on-surface focus:border-secondary"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold tracking-widest text-data-label uppercase">ORGANIZATION DECENTRALIZED ID (DID)</label>
                  <input
                    type="text"
                    value={newIssuerDid}
                    onChange={e => setNewIssuerDid(e.target.value)}
                    placeholder="e.g. did:key:z6Mk..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-secondary font-mono focus:border-secondary"
                    required
                  />
                </div>
                
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full bg-secondary text-surface-dim font-bold text-xs tracking-wider py-3 rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">security_update_good</span>
                    {adding ? 'APPROVING...' : 'AUTHORIZE ISSUING LICENSE'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Column 3: Audit events */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 h-fit">
              <div>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Compliance Audit Logs</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Real-time system events catalog.</p>
              </div>

              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={index} className="space-y-1.5 border-l-2 border-secondary/35 pl-3 py-0.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-secondary">{log.action.toUpperCase()}</span>
                      <span className="text-on-surface-variant font-mono text-[9px]">{log.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface leading-tight">{log.target}</p>
                    <p className="text-[9px] text-on-surface-variant">Actor: {log.actor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  )
}

function AnalyticsCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between relative overflow-hidden cyan-glow-effect">
      <div className="space-y-1.5 z-10">
        <span className="text-[10px] font-bold tracking-widest text-data-label uppercase">{label}</span>
        <h2 className={`text-3xl font-extrabold ${color}`}>{value}</h2>
      </div>
      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
        <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
      </div>
    </div>
  )
}
