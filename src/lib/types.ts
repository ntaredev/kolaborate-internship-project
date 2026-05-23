/**
 * AnchorID – Core Type Definitions
 * All credential and identity types used across the platform
 */

// ── DID & Keypair ─────────────────────────────────────────────────────────

export interface AnchorKeyPair {
  did: string              // did:key:z6Mk...
  publicKeyBase58: string
  privateKeyBase58: string
  createdAt: string
}

// ── Verifiable Credential (W3C VC Data Model) ──────────────────────────────

export type CredentialType =
  | 'RefugeeRegistration'
  | 'BirthCertificate'
  | 'VaccinationRecord'
  | 'AcademicTranscript'
  | 'AsylumSeeker'
  | 'StatelessPerson'
  | 'MedicalRecord'

export interface CredentialSubject {
  id: string               // holder DID
  fullName: string
  dateOfBirth: string      // ISO date
  nationality?: string
  holderId?: string        // e.g. UNHCR-IRQ-8829-Z
  issuedBy?: string
  expiryDate?: string
  photo?: string           // base64 data URI
  [key: string]: string | undefined
}

export interface AnchorCredential {
  id: string                         // uuid
  '@context': string[]
  type: ['VerifiableCredential', string]
  issuer: string                     // issuer DID or name
  issuanceDate: string               // ISO datetime
  expirationDate?: string
  credentialSubject: CredentialSubject
  credentialStatus?: {
    id: string
    type: 'RevocationList2020Status'
  }
  proof?: {
    type: string
    created: string
    verificationMethod: string
    proofPurpose: string
    jws?: string
  }
  // Local metadata (not part of the W3C spec, stored locally only)
  _meta: {
    localId: string
    credentialType: CredentialType
    displayName: string
    displayIcon: string
    isVerified: boolean
    verifiedAt?: string
    storedAt: string
    tags?: string[]
  }
}

// ── Verifiable Presentation ────────────────────────────────────────────────

export interface VerifiablePresentation {
  '@context': string[]
  type: ['VerifiablePresentation']
  id: string
  holder: string
  verifiableCredential: AnchorCredential[]
  disclosedFields: string[]
  proof?: {
    type: string
    created: string
    challenge?: string
    domain?: string
    jws?: string
  }
}

// ── Wallet State ───────────────────────────────────────────────────────────

export interface WalletState {
  isUnlocked: boolean
  keyPair: AnchorKeyPair | null
  credentials: AnchorCredential[]
  recoveryContacts: RecoveryContact[]
  lastUnlocked?: string
}

// ── Social Recovery ────────────────────────────────────────────────────────

export interface RecoveryContact {
  id: string
  name: string
  phone?: string
  email?: string
  shareId: string           // unique ID sent to contact
  hasConfirmed: boolean
  addedAt: string
}

// ── QR Payload ─────────────────────────────────────────────────────────────

export interface QRPayload {
  version: '1.0'
  type: 'AnchorPresentation'
  holder: string
  issued: string
  expires: string           // short-lived, e.g. 60s
  nonce: string
  claims: Record<string, string | number | boolean>
  signature: string
}

// ── Issuer Dashboard ───────────────────────────────────────────────────────

export interface IssuanceRequest {
  credentialType: CredentialType
  holderName: string
  holderDid?: string
  dateOfBirth: string
  nationality?: string
  holderId: string
  expiryDate?: string
  additionalClaims?: Record<string, string>
}

// ── Verification Result ────────────────────────────────────────────────────

export type VerificationStatus = 'valid' | 'invalid' | 'expired' | 'revoked' | 'unknown'

export interface VerificationResult {
  status: VerificationStatus
  credential?: Partial<AnchorCredential>
  checkedAt: string
  holderDid?: string
  issuerName?: string
  validUntil?: string
  disclosedFields?: string[]
  errorMessage?: string
}

// ── UI ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
  active?: boolean
}
