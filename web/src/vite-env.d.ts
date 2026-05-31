/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string
  readonly VITE_BACKEND_URI?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_GOOGLE_AUTH_URI?: string
  readonly VITE_GOOGLE_REDIRECT_URI?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** true = show checkout payment methods without dev password */
  readonly VITE_ENABLE_CHECKOUT_PAYMENT?: string
  readonly VITE_CHECKOUT_PAYMENT_DEV_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
