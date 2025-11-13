export interface CertificateResponse {
    id: string
    name: string
    issuer: string
    credentialId?: string
    credentialUrl: string
    verified: boolean
    verificationSource: 'SYSTEM' | 'MANUAL'
    verifyNote?: string
    verifiedAt?: string
    imageUrl?: string
    status?: string
    reason?: string
}

// Admin API response shape for certificates
export interface AdminCertificateResponse {
    id: string
    title: string
    organization: string
    credentialUrl: string
    imageUrl: string
    issueDate: string
    reason?: string
    status: string // backend enum CertificateStatus; use string to interop in UI
}

export type CertificateUpdateStatus = 'confirmed' | 'rejected'

export interface UpdateCertificateRequest {
    id: string
    status: CertificateUpdateStatus
    reason: string
}
