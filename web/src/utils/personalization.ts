import type { MultiSelectOption } from '@/components/common/MultiSelectSearch'

export type CategoryOption = MultiSelectOption & { description: string }

export function parseKeywords(raw: string): string[] {
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export function normalizeSelection(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean))).sort()
}

export function sameSelection(a: string[], b: string[]): boolean {
  const left = normalizeSelection(a)
  const right = normalizeSelection(b)
  if (left.length !== right.length) return false
  return left.every((v, index) => v === right[index])
}
