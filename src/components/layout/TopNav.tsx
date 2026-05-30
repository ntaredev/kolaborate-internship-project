'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/lib/types'

interface TopNavProps {
  variant?: 'public' | 'wallet' | 'issuer' | 'verifier'
}

const walletNavItems: NavItem[] = [
  { label: 'HOME', href: '/wallet/dashboard', icon: 'home' },
  { label: 'CREDENTIALS', href: '/wallet/dashboard', icon: 'badge' },
  { label: 'PROFILE', href: '/wallet/dashboard', icon: 'person' },
]

export default function TopNav({ variant = 'public' }: TopNavProps) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6
      bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-glass">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group" aria-label="AnchorID home">
        <img
          src="/logo.png"
          alt="AnchorID Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-cover rounded-md group-hover:scale-110 transition-transform duration-200"
        />
        <span className="text-xl font-bold text-secondary tracking-tight">AnchorID</span>
      </Link>

      {/* Nav links */}
      {variant === 'public' && (
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex gap-1">
            {[
              { label: 'FOR REFUGEES', href: '/#how-it-works' },
              { label: 'FOR ISSUERS', href: '/issuer' },
              { label: 'FOR VERIFIERS', href: '/verifier' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[10px] font-bold tracking-widest text-on-surface-variant
                  hover:text-secondary hover:bg-white/10 transition-all px-3 py-2 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="h-4 w-px bg-white/15 mx-2" />
          <Link
            href="/wallet"
            className="text-[10px] font-bold tracking-widest bg-secondary text-surface-dim
              px-4 py-2 rounded-lg hover:scale-105 transition-all"
          >
            OPEN WALLET
          </Link>
        </div>
      )}

      {variant === 'wallet' && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1">
            {walletNavItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[10px] font-bold tracking-widest px-3 py-2 rounded-lg transition-all
                  ${pathname === item.href
                    ? 'text-secondary bg-secondary/10'
                    : 'text-on-surface-variant hover:text-secondary hover:bg-white/10'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="w-9 h-9 rounded-full border border-white/15 bg-surface-container-high
            flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-secondary text-lg">person</span>
          </div>
        </div>
      )}

      {variant === 'issuer' && (
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant">ISSUER PORTAL</span>
          <div className="h-4 w-px bg-white/15" />
          <Link href="/" className="text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
            EXIT
          </Link>
        </div>
      )}

      {variant === 'verifier' && (
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant">VERIFIER PORTAL</span>
          <div className="h-4 w-px bg-white/15" />
          <Link href="/" className="text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
            EXIT
          </Link>
        </div>
      )}
    </header>
  )
}
