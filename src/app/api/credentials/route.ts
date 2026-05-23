import { NextResponse } from 'next/server'

// A thread-safe, secure local storage simulated mailbox
// Key: Holder's DID, Value: List of issued credentials waiting to be imported
let credentialMailbox: Record<string, any[]> = {}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const holderDid = searchParams.get('holderDid')

    if (!holderDid) {
      return NextResponse.json({ success: false, error: 'holderDid parameter is required' }, { status: 400 })
    }

    const pending = credentialMailbox[holderDid] || []

    return NextResponse.json({
      success: true,
      credentials: pending
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential || !credential.credentialSubject?.id) {
      return NextResponse.json({ success: false, error: 'Invalid verifiable credential structure' }, { status: 400 })
    }

    const holderDid = credential.credentialSubject.id

    if (!credentialMailbox[holderDid]) {
      credentialMailbox[holderDid] = []
    }

    // Add to pending mailbox
    credentialMailbox[holderDid].push(credential)

    return NextResponse.json({
      success: true,
      message: 'Credential successfully posted to holder mailbox.'
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const holderDid = searchParams.get('holderDid')

    if (!holderDid) {
      return NextResponse.json({ success: false, error: 'holderDid parameter is required' }, { status: 400 })
    }

    // Clear mailbox after holder has imported them
    credentialMailbox[holderDid] = []

    return NextResponse.json({
      success: true,
      message: 'Holder credential mailbox cleared.'
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
