import http from 'k6/http'
import { BASE_URL, HTTP_TIMEOUT, buildUrl, credentials } from './config.js'

function extractToken(payload) {
  return (
    payload?.result?.accessToken ||
    payload?.data?.accessToken ||
    payload?.accessToken ||
    payload?.token ||
    null
  )
}

function extractRefreshToken(payload) {
  return payload?.result?.refreshToken || payload?.data?.refreshToken || payload?.refreshToken || null
}

function extractUserId(payload) {
  return payload?.result?.userId || payload?.data?.userId || payload?.userId || null
}

export function buildAuthHeaders(token, extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

export function login(loginValue, password, tags = {}) {
  if (!loginValue || !password) {
    throw new Error('Missing login credentials for POST /auth')
  }

  const response = http.post(
    buildUrl('/auth'),
    JSON.stringify({ username: loginValue, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: HTTP_TIMEOUT,
      tags: { name: 'auth_login', endpoint: 'auth_login', ...tags },
    }
  )

  const payload = response.json()
  const accessToken = extractToken(payload)

  if (!accessToken) {
    throw new Error(`Login succeeded without access token. status=${response.status} body=${response.body}`)
  }

  return {
    response,
    payload,
    accessToken,
    refreshToken: extractRefreshToken(payload),
    userId: extractUserId(payload),
    role: payload?.result?.role || payload?.data?.role || payload?.role || null,
  }
}

export function getRoleAuth(role, tags = {}) {
  const entry = credentials[role]
  if (!entry) {
    throw new Error(`Unsupported role "${role}"`)
  }

  if (entry.token) {
    return {
      accessToken: entry.token,
      refreshToken: null,
      userId: null,
      role,
      response: null,
      payload: null,
      fromEnvToken: true,
    }
  }

  return {
    ...login(entry.login, entry.password, tags),
    fromEnvToken: false,
  }
}

export { extractToken, extractRefreshToken, extractUserId, BASE_URL }
