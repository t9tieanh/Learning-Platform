import { Request } from 'express';

/**
 * Repeated query keys (e.g. `?jobId=a&jobId=b` or single `?jobId=a`).
 */
export function parseRepeatedStringQueryParam(req: Request, paramName: string): string[] {
  const raw = req.query[paramName];
  if (raw === undefined || raw === '') return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(String).filter(Boolean);
}

export function parseJobIdsFromQuery(req: Request): string[] {
  return parseRepeatedStringQueryParam(req, 'jobId');
}
