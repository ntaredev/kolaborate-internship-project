import { NextResponse } from 'next/server'

// In-memory mock database of revoked credential hashes
// Key is the SHA-256 hash of the credential, value is revocation metadata
let mockRevocationRegistry: Record<string, {
  isRevoked: boolean
  revokedAt: string
  reason?: string
}> = {
  // Demo revoked hash (e.g. for testing)
  'revoked-credential-sha256-hash-demo-value': {
    isRevoked: true,
    revokedAt: new Date().toISOString(),
    reason: 'Reported lost by holder'
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json({ success: false, error: 'Credential hash is required' }, { status: 400 })
    }

    const record = mockRevocationRegistry[hash]

    if (record && record.isRevoked) {
      return NextResponse.json({
        success: true,
        revoked: true,
        revokedAt: record.revokedAt,
        reason: record.reason
      })
    }

    // Default: not revoked
    return NextResponse.json({
      success: true,
      revoked: false
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hash, reason } = body

    if (!hash) {
      return NextResponse.json({ success: false, error: 'Credential hash is required' }, { status: 400 })
    }

    // Mark as revoked
    mockRevocationRegistry[hash] = {
      isRevoked: true,
      revokedAt: new Date().toISOString(),
      reason: reason || 'Revoked by authorized issuer'
    }

    return NextResponse.json({
      success: true,
      hash,
      revoked: true,
      message: 'Credential successfully revoked in registry.'
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
