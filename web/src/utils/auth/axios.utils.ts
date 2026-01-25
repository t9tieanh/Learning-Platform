import { useAuthStore } from '@/stores/useAuth.stores'

class AxiosAuthUtils {
    public isRefreshing = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private failedQueue: any[] = []

    getAccessToken(): string | null {
        try {
            const tokenFromStore = useAuthStore.getState().data?.accessToken
            if (tokenFromStore) return tokenFromStore
        } catch {
            // ignore
        }
        try {
            const persisted = localStorage.getItem('user-storage')
            if (persisted) {
                const parsed = JSON.parse(persisted)
                const token = parsed?.state?.data?.accessToken as string | undefined
                if (token) return token
            }
        } catch {
            // ignore
        }
        const legacy = localStorage.getItem('access_token')
        return legacy
    }

    getRefreshToken(): string | null {
        try {
            const tokenFromStore = useAuthStore.getState().data?.refreshToken
            if (tokenFromStore) return tokenFromStore
        } catch {
            // ignore
        }
        try {
            const persisted = localStorage.getItem('user-storage')
            if (persisted) {
                const parsed = JSON.parse(persisted)
                const token = parsed?.state?.data?.refreshToken as string | undefined
                if (token) return token
            }
        } catch {
            // ignore
        }
        return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToFailedQueue(promise: { resolve: (value: unknown) => void; reject: (reason?: any) => void }) {
        this.failedQueue.push(promise)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error)
            } else {
                prom.resolve(token)
            }
        })

        this.failedQueue = []
    }
}

export default new AxiosAuthUtils()
