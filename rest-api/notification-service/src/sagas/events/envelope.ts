export interface EventEnvelope<T = any> {
  type: string
  version?: string
  correlationId?: string
  causationId?: string
  source?: string
  timestamp: string
  payload: T
}

export function createEnvelope<T = any>(opts: {
  type: string
  payload: T
  correlationId?: string
  causationId?: string
  version?: string
  source?: string
}): EventEnvelope<T> {
  return {
    type: opts.type,
    version: opts.version ?? '1',
    correlationId: opts.correlationId,
    causationId: opts.causationId,
    source: opts.source ?? process.env.SERVICE_NAME ?? 'sale-service',
    timestamp: new Date().toISOString(),
    payload: opts.payload
  }
}
