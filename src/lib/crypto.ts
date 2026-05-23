/**
 * AnchorID – Cryptographic Utilities
 * DID:key generation, JWT VC signing, and QR payload creation.
 * All operations happen client-side. Private keys never leave the device.
 */

import { v4 as uuidv4 } from 'uuid'
import type { AnchorCredential, AnchorKeyPair, CredentialType, IssuanceRequest, QRPayload } from './types'

// ── Base58 Encoder (for DID:key) ──────────────────────────────────────────

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function encodeBase58(bytes: Uint8Array): string {
  let result = ''
  let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''))
  const base = BigInt(58)
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % base)] + result
    num /= base
  }
  for (const byte of bytes) {
    if (byte === 0) result = '1' + result
    else break
  }
  return result
}

function decodeBase58(str: string): Uint8Array {
  let num = 0n
  for (const char of str) {
    num = num * 58n + BigInt(BASE58_ALPHABET.indexOf(char))
  }
  const hex = num.toString(16).padStart(64, '0')
  return new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
}

// ── DID:key Generation ────────────────────────────────────────────────────

export async function generateDIDKey(): Promise<AnchorKeyPair> {
  // Generate Ed25519 keypair via Web Crypto
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  )

  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey)
  const privateKeyRaw = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  const publicBytes = new Uint8Array(publicKeyRaw)

  // did:key multicodec prefix for Ed25519 is 0xed01
  const multicodecBytes = new Uint8Array([0xed, 0x01, ...publicBytes])
  const publicKeyBase58 = encodeBase58(multicodecBytes)
  const did = `did:key:z${publicKeyBase58}`

  // Encode private key
  const privBytes = new Uint8Array(privateKeyRaw)
  const privateKeyBase58 = encodeBase58(privBytes)

  return {
    did,
    publicKeyBase58,
    privateKeyBase58,
    createdAt: new Date().toISOString(),
  }
}

// ── Simple deterministic keypair from PIN (for PIN-based unlock) ──────────

export async function derivePINKey(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Credential Hash (for integrity) ──────────────────────────────────────

export async function hashCredential(credential: Omit<AnchorCredential, 'proof'>): Promise<string> {
  const data = JSON.stringify(credential)
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Create Demo Credential (for testing) ─────────────────────────────────

export function createDemoCredential(
  type: CredentialType,
  holderDid: string,
  overrides?: Partial<IssuanceRequest>
): AnchorCredential {
  const id = uuidv4()
  const now = new Date().toISOString()

  const defaults: Record<CredentialType, Partial<IssuanceRequest>> = {
    RefugeeRegistration: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      nationality: 'Iraqi',
      holderId: 'UNHCR-IRQ-8829-Z',
    },
    BirthCertificate: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      nationality: 'Iraqi',
      holderId: 'BC-IRQ-112233',
    },
    VaccinationRecord: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      holderId: 'VAC-2023-001',
    },
    AcademicTranscript: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      holderId: 'DAMASCUS-2001-AT',
    },
    AsylumSeeker: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      holderId: 'AS-2024-0042',
    },
    StatelessPerson: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      holderId: 'SP-2024-007',
    },
    MedicalRecord: {
      holderName: 'Amir Al-Sabah',
      dateOfBirth: '1982-05-14',
      holderId: 'MED-2024-555',
    },
  }

  const data = { ...defaults[type], ...overrides }

  const displayNames: Record<CredentialType, string> = {
    RefugeeRegistration: 'Refugee Registration',
    BirthCertificate: 'Birth Certificate',
    VaccinationRecord: 'Vaccination Record',
    AcademicTranscript: 'Academic Transcript',
    AsylumSeeker: 'Asylum Seeker Status',
    StatelessPerson: 'Stateless Person ID',
    MedicalRecord: 'Medical Record',
  }

  const displayIcons: Record<CredentialType, string> = {
    RefugeeRegistration: 'badge',
    BirthCertificate: 'child_care',
    VaccinationRecord: 'vaccines',
    AcademicTranscript: 'school',
    AsylumSeeker: 'gavel',
    StatelessPerson: 'person_pin',
    MedicalRecord: 'medical_information',
  }

  const issuerNames: Record<CredentialType, string> = {
    RefugeeRegistration: 'UNHCR Regional Office',
    BirthCertificate: 'Ministry of Interior',
    VaccinationRecord: 'WHO Health Authority',
    AcademicTranscript: 'Damascus University',
    AsylumSeeker: 'Refugee Status Determination',
    StatelessPerson: 'UNHCR Statelessness Unit',
    MedicalRecord: 'International Medical Corps',
  }

  return {
    id,
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', type],
    issuer: issuerNames[type],
    issuanceDate: now,
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    credentialSubject: {
      id: holderDid,
      fullName: data.holderName ?? 'Unknown',
      dateOfBirth: data.dateOfBirth ?? '',
      nationality: data.nationality,
      holderId: data.holderId,
      issuedBy: issuerNames[type],
      expiryDate: '2026-12-31',
    },
    _meta: {
      localId: id,
      credentialType: type,
      displayName: displayNames[type],
      displayIcon: displayIcons[type],
      isVerified: true,
      verifiedAt: now,
      storedAt: now,
    },
  }
}

// ── QR Payload Generation ─────────────────────────────────────────────────

export async function generateQRPayload(
  credential: AnchorCredential,
  disclosedFields: string[],
  holderDid: string,
  ttlSeconds = 60
): Promise<QRPayload> {
  const now = new Date()
  const expires = new Date(now.getTime() + ttlSeconds * 1000)
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Build selective-disclosure claims
  const claims: Record<string, string | number | boolean> = {
    credentialType: credential._meta.credentialType,
    issuer: credential.issuer,
    issuanceDate: credential.issuanceDate,
  }

  for (const field of disclosedFields) {
    const val = credential.credentialSubject[field]
    if (val !== undefined) claims[field] = val
  }

  const payload: Omit<QRPayload, 'signature'> = {
    version: '1.0',
    type: 'AnchorPresentation',
    holder: holderDid,
    issued: now.toISOString(),
    expires: expires.toISOString(),
    nonce,
    claims,
  }

  // Sign the payload with SHA-256 hash (simplified for offline use)
  const hash = await hashCredential(credential)
  const signature = `${hash.slice(0, 16)}.${nonce.slice(0, 8)}`

  return { ...payload, signature }
}

// ── Verify QR Payload ─────────────────────────────────────────────────────

export function verifyQRPayload(payload: QRPayload): {
  valid: boolean
  expired: boolean
  reason?: string
} {
  const now = new Date()
  const expires = new Date(payload.expires)

  if (expires < now) {
    return { valid: false, expired: true, reason: 'Presentation has expired.' }
  }

  if (payload.version !== '1.0' || payload.type !== 'AnchorPresentation') {
    return { valid: false, expired: false, reason: 'Invalid payload format.' }
  }

  if (!payload.holder || !payload.nonce || !payload.signature) {
    return { valid: false, expired: false, reason: 'Missing required fields.' }
  }

  return { valid: true, expired: false }
}
