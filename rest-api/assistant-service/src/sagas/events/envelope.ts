export interface EventEnvelope<T = unknown> {
  type: string
  version?: string
  correlationId?: string
  causationId?: string
  source?: string
  timestamp: string
  payload: T
}
