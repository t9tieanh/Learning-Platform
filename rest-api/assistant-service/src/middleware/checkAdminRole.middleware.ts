import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from './ApiError'

function scopeItemIsAdmin(item: unknown): boolean {
  if (typeof item === 'string') {
    return item.toLowerCase() === 'admin'
  }
  if (typeof item === 'object' && item !== null && 'name' in item) {
    return String((item as { name: unknown }).name).toLowerCase() === 'admin'
  }
  return false
}

export function hasAdminRole(scope: unknown): boolean {
  if (!scope) return false
  if (Array.isArray(scope)) {
    return scope.some(scopeItemIsAdmin)
  }
  return false
}

/**
 * Requires JWT with admin role in scope claim.
 * Scope items may be strings or { name: string } objects (same as user-service JWT).
 */
export const checkAdminRole = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub
    if (!userId) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: missing user'))
    }

    if (!hasAdminRole(req.user?.scope)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: admin role required'))
    }

    next()
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    next(new ApiError(err.status || StatusCodes.INTERNAL_SERVER_ERROR, err.message || 'Internal Server Error'))
  }
}
