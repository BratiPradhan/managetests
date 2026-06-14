interface NamedEntity {
  id: string
  name: string
}

export function resolveName(name: string | null | undefined, pool: NamedEntity[]): NamedEntity | null {
  if (!name || pool.length === 0) return null
  return pool.find((p) => p.name === name || p.id === name) ?? null
}

export function resolveNames(names: string[], pool: NamedEntity[]): NamedEntity[] {
  if (names.length === 0 || pool.length === 0) return []
  return names
    .map((name) => pool.find((p) => p.name === name || p.id === name))
    .filter((m): m is NamedEntity => !!m)
}

// Subject can arrive from the API as a plain string or a populated `{ name }` object.
export function getSubjectName(subject: unknown): string {
  if (typeof subject === 'string') return subject || '—'
  if (subject && typeof subject === 'object' && typeof (subject as { name?: unknown }).name === 'string') {
    return (subject as { name: string }).name
  }
  return '—'
}
