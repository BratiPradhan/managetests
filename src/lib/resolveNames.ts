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
