'use client'
/**
 * AnchorID – WebAuthn Biometric Authentication
 * Uses the browser's native WebAuthn/FIDO2 API for passkey-based
 * wallet unlock. No passwords stored. Works offline.
 */

const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const RP_NAME = 'AnchorID'
const CREDENTIAL_KEY = 'anchor-passkey-id'

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Check Support ─────────────────────────────────────────────────────────

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof navigator.credentials?.create === 'function'
  )
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// ── Register Passkey ──────────────────────────────────────────────────────

export async function registerPasskey(
  userId: string,
  userName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'WebAuthn is not supported in this browser.' }
  }

  const userIdBuffer = new TextEncoder().encode(userId)

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { id: RP_ID, name: RP_NAME },
        user: {
          id: userIdBuffer,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential

    const credentialId = bufferToBase64url(credential.rawId)
    // Persist credential ID to IndexedDB settings
    localStorage.setItem(CREDENTIAL_KEY, credentialId)

    return { success: true, credentialId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('NotAllowedError') || msg.includes('AbortError')) {
      return { success: false, error: 'Biometric registration was cancelled.' }
    }
    return { success: false, error: `Registration failed: ${msg}` }
  }
}

// ── Authenticate with Passkey ─────────────────────────────────────────────

export async function authenticatePasskey(): Promise<{
  success: boolean
  error?: string
}> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'WebAuthn is not supported.' }
  }

  const storedCredId = localStorage.getItem(CREDENTIAL_KEY)
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const allowCredentials: PublicKeyCredentialDescriptor[] = storedCredId
    ? [{ type: 'public-key', id: base64urlToBuffer(storedCredId) }]
    : []

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials,
        userVerification: 'required',
        timeout: 60000,
      },
    }) as PublicKeyCredential

    if (assertion) {
      return { success: true }
    }
    return { success: false, error: 'Authentication failed.' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('NotAllowedError') || msg.includes('AbortError')) {
      return { success: false, error: 'Biometric authentication was cancelled.' }
    }
    return { success: false, error: `Authentication failed: ${msg}` }
  }
}

// ── Check if Passkey is Set Up ────────────────────────────────────────────

export function hasPasskeyRegistered(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(CREDENTIAL_KEY)
}

export function clearPasskey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CREDENTIAL_KEY)
}
