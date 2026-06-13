import http from 'k6/http'
import { check } from 'k6'
import { HTTP_TIMEOUT, buildUrl } from './config.js'

function mergeParams(params = {}, method, endpoint, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(params.headers || {}),
  }

  return {
    timeout: params.timeout || HTTP_TIMEOUT,
    ...params,
    headers,
    tags: {
      method: method.toUpperCase(),
      endpoint,
      name: endpoint,
      ...(params.tags || {}),
    },
  }
}

export function get(path, options = {}) {
  const { params, token, endpoint = path } = options
  return http.get(buildUrl(path), mergeParams(params, 'get', endpoint, token))
}

export function post(path, body = {}, options = {}) {
  const { params, token, endpoint = path } = options
  return http.post(buildUrl(path), JSON.stringify(body), mergeParams(params, 'post', endpoint, token))
}

export function put(path, body = {}, options = {}) {
  const { params, token, endpoint = path } = options
  return http.put(buildUrl(path), JSON.stringify(body), mergeParams(params, 'put', endpoint, token))
}

export function patch(path, body = {}, options = {}) {
  const { params, token, endpoint = path } = options
  return http.patch(buildUrl(path), JSON.stringify(body), mergeParams(params, 'patch', endpoint, token))
}

export function del(path, body = null, options = {}) {
  const { params, token, endpoint = path } = options
  return http.del(buildUrl(path), body ? JSON.stringify(body) : null, mergeParams(params, 'delete', endpoint, token))
}

export function assertOk(response, label, extraChecks = {}) {
  return check(response, {
    [`${label} status is 2xx`]: (res) => res.status >= 200 && res.status < 300,
    ...extraChecks,
  })
}

export function parseJson(response) {
  try {
    return response.json()
  } catch (_error) {
    return null
  }
}
