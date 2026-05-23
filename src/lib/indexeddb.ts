'use client'
/**
 * AnchorID – IndexedDB Storage Layer
 * All credential data stays local on device, never sent to a server.
 * Uses the `idb` wrapper for a clean Promise-based API.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AnchorCredential, AnchorKeyPair, RecoveryContact } from './types'

// ── Schema ────────────────────────────────────────────────────────────────

interface AnchorDB extends DBSchema {
  credentials: {
    key: string
    value: AnchorCredential
    indexes: { 'by-type': string; 'by-stored': string }
  }
  keypair: {
    key: string
    value: AnchorKeyPair
  }
  recovery: {
    key: string
    value: RecoveryContact
  }
  settings: {
    key: string
    value: { key: string; value: unknown }
  }
}

const DB_NAME = 'anchorid-wallet'
const DB_VERSION = 1

let _db: IDBPDatabase<AnchorDB> | null = null

async function getDb(): Promise<IDBPDatabase<AnchorDB>> {
  if (_db) return _db
  _db = await openDB<AnchorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Credentials store
      const credStore = db.createObjectStore('credentials', { keyPath: 'id' })
      credStore.createIndex('by-type', '_meta.credentialType')
      credStore.createIndex('by-stored', '_meta.storedAt')

      // KeyPair store (one active keypair at a time)
      db.createObjectStore('keypair', { keyPath: 'did' })

      // Recovery contacts
      db.createObjectStore('recovery', { keyPath: 'id' })

      // Generic settings
      db.createObjectStore('settings', { keyPath: 'key' })
    },
  })
  return _db
}

// ── Credentials ───────────────────────────────────────────────────────────

export async function saveCredential(credential: AnchorCredential): Promise<void> {
  const db = await getDb()
  await db.put('credentials', credential)
}

export async function getCredential(id: string): Promise<AnchorCredential | undefined> {
  const db = await getDb()
  return db.get('credentials', id)
}

export async function getAllCredentials(): Promise<AnchorCredential[]> {
  const db = await getDb()
  const all = await db.getAll('credentials')
  // Sort newest first
  return all.sort((a, b) =>
    new Date(b._meta.storedAt).getTime() - new Date(a._meta.storedAt).getTime()
  )
}

export async function deleteCredential(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('credentials', id)
}

export async function clearAllCredentials(): Promise<void> {
  const db = await getDb()
  await db.clear('credentials')
}

// ── KeyPair ───────────────────────────────────────────────────────────────

export async function saveKeyPair(kp: AnchorKeyPair): Promise<void> {
  const db = await getDb()
  await db.put('keypair', kp)
}

export async function getActiveKeyPair(): Promise<AnchorKeyPair | undefined> {
  const db = await getDb()
  const all = await db.getAll('keypair')
  return all[0]
}

export async function deleteKeyPair(did: string): Promise<void> {
  const db = await getDb()
  await db.delete('keypair', did)
}

// ── Recovery Contacts ─────────────────────────────────────────────────────

export async function saveRecoveryContact(contact: RecoveryContact): Promise<void> {
  const db = await getDb()
  await db.put('recovery', contact)
}

export async function getRecoveryContacts(): Promise<RecoveryContact[]> {
  const db = await getDb()
  return db.getAll('recovery')
}

export async function deleteRecoveryContact(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('recovery', id)
}

// ── Settings ──────────────────────────────────────────────────────────────

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  await db.put('settings', { key, value })
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  const row = await db.get('settings', key)
  return row?.value as T | undefined
}

// ── Wallet Wipe (GDPR / Emergency) ───────────────────────────────────────

export async function wipeWallet(): Promise<void> {
  const db = await getDb()
  await Promise.all([
    db.clear('credentials'),
    db.clear('keypair'),
    db.clear('recovery'),
    db.clear('settings'),
  ])
}
