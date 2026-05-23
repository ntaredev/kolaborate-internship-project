-- AnchorID – Supabase Database Schema
-- Production-quality PostgreSQL tables with performance indexes and audits.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Organizations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    website_url TEXT,
    trust_score INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Approved Issuers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issuers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    did VARCHAR(255) UNIQUE NOT NULL, -- e.g. did:key:z6Mk... or did:web:...
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Revocation Registry ──────────────────────────────────────────────────
-- Stores the revocation status of credentials. Keep raw refugee data OUT.
CREATE TABLE IF NOT EXISTS revocation_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of credential for lookup without sensitive data
    issuer_did VARCHAR(255) REFERENCES issuers(did) ON DELETE CASCADE,
    is_revoked BOOLEAN DEFAULT TRUE,
    revocation_reason VARCHAR(255),
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. Verifier Access & Trust Logs ──────────────────────────────────────────
-- Standard compliance log, storing hashes to preserve privacy.
CREATE TABLE IF NOT EXISTS verifier_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verifier_name VARCHAR(255) DEFAULT 'Anonymous Verifier',
    presentation_nonce VARCHAR(64),
    credential_hash VARCHAR(64) NOT NULL,
    verification_status VARCHAR(50) NOT NULL, -- 'valid', 'expired', 'revoked', 'invalid'
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 5. Social Recovery Registry ──────────────────────────────────────────────
-- Stores encrypted recovery tokens. Contacts can confirm slices offline.
CREATE TABLE IF NOT EXISTS recovery_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holder_did VARCHAR(255) NOT NULL,
    guardian_index INT NOT NULL, -- 1 to 5
    guardian_name VARCHAR(255) NOT NULL,
    encrypted_slice TEXT NOT NULL, -- JWT / encrypted payload of the DID private key slice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(holder_did, guardian_index)
);

-- ── 6. System Audit Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(255) NOT NULL, -- e.g., 'system-admin', 'issuer-unhcr-01'
    action_type VARCHAR(100) NOT NULL, -- 'issuer_created', 'credential_revoked', 'verifier_checked'
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes for Optimized Queries ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_issuers_did ON issuers(did);
CREATE INDEX IF NOT EXISTS idx_revocation_registry_hash ON revocation_registry(credential_hash);
CREATE INDEX IF NOT EXISTS idx_verifier_logs_hash ON verifier_logs(credential_hash);
CREATE INDEX IF NOT EXISTS idx_recovery_did ON recovery_registry(holder_did);

-- ── Insert Default Demo Data for MVP ────────────────────────────────────────
INSERT INTO organizations (name, logo_url, website_url, trust_score)
VALUES 
('UNHCR Regional Office', 'https://www.unhcr.org/favicon.ico', 'https://unhcr.org', 100),
('Ministry of Interior', NULL, 'https://moi.gov', 95),
('WHO Health Authority', 'https://www.who.int/favicon.ico', 'https://who.int', 100),
('Damascus University', NULL, 'https://damascus.edu', 80),
('International Medical Corps', NULL, 'https://internationalmedicalcorps.org', 90)
ON CONFLICT (name) DO NOTHING;

INSERT INTO issuers (did, name, email, is_active)
VALUES
('did:key:z6MkqB3Ne4Gj4N4a54T7J8g7g6g5g4g3', 'UNHCR Regional Office', 'issuance@unhcr-regional.org', TRUE),
('did:key:z6MkfP2G3G4G5G6G7G8G9G0G1G2G3G4G', 'WHO Health Authority', 'verify@who-health.org', TRUE),
('did:key:z6Mkj7K8K9K0K1K2K3K4K5K6K7K8K9K0', 'Ministry of Interior', 'civil-registry@moi.gov', TRUE)
ON CONFLICT (did) DO NOTHING;
