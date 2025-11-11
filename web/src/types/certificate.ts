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
}
