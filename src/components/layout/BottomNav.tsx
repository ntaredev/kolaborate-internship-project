'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { label: 'Home', href: '/wallet/dashboard', icon: 'home', activeIcon: 'home' },
  { label: 'Credentials', href: '/wallet/dashboard', icon: 'badge', activeIcon: 'badge' },
  { label: 'Profile', href: '/wallet/profile', icon: 'person', activeIcon: 'person' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 md:hidden
        bg-white/5 backdrop-blur-2xl border-t border-white/10
        flex justify-around items-center px-4 py-3 pb-safe"
      aria-label="Mobile navigation"
    >
      {items.map(item => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl
              transition-all duration-200 active:scale-90 min-w-[56px]
              ${isActive
                ? 'text-secondary bg-secondary/10'
                : 'text-on-surface-variant hover:text-secondary'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`material-symbols-outlined text-2xl
                ${isActive ? 'material-symbols-filled' : ''}`}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
