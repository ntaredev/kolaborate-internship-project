import { NextResponse } from 'next/server'

// In-memory fallback database for local-first execution without Supabase environment variables
let mockIssuers = [
  {
    did: 'did:key:z6MkqB3Ne4Gj4N4a54T7J8g7g6g5g4g3',
    name: 'UNHCR Regional Office',
    email: 'issuance@unhcr-regional.org',
    isActive: true,
    created_at: new Date().toISOString()
  },
  {
    did: 'did:key:z6MkfP2G3G4G5G6G7G8G9G0G1G2G3G4G',
    name: 'WHO Health Authority',
    email: 'verify@who-health.org',
    isActive: true,
    created_at: new Date().toISOString()
  },
  {
    did: 'did:key:z6Mkj7K8K9K0K1K2K3K4K5K6K7K8K9K0',
    name: 'Ministry of Interior',
    email: 'civil-registry@moi.gov',
    isActive: true,
    created_at: new Date().toISOString()
  }
]

export async function GET() {
  try {
    // If Supabase was configured, we would perform:
    // const { data } = await supabase.from('issuers').select('*')
    // But we use mock database as instant-start fallback
    return NextResponse.json({ success: true, data: mockIssuers })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { did, name, email } = body

    if (!did || !name || !email) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 })
    }

    const newIssuer = {
      did,
      name,
      email,
      isActive: true,
      created_at: new Date().toISOString()
    }

    mockIssuers.push(newIssuer)

    return NextResponse.json({ success: true, data: newIssuer })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
