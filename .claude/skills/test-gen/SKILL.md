# test-gen Skill

model: claude-haiku-4-5-20251001

Genera test Vitest per logica di business di team-manager.

## Trigger
Attivato allo Step 4 del workflow `/implement` per feature di tipo `logic`.

## Input
- Path del file da testare
- Descrizione della logica da testare

## Output
File di test con casi che coprono:
1. Happy path
2. Edge cases (score limite, distribuzione 0/100, skill level bounds)
3. Validazione input (CVF somma != 100, answers fuori range 1-10)

## Test patterns per domain

### Leadership scoring
```typescript
it('should calculate archetype from dominant behavior pair', () => {
  const scores = { directing: 18, demanding: 16, ... }
  expect(calculateArchetype(scores)).toBe('expert')
})
```

### CVF validation
```typescript
it('should reject CVF category that does not sum to 100', () => {
  expect(() => validateCVFCategory([30, 30, 30, 20])).not.toThrow()
  expect(() => validateCVFCategory([30, 30, 30, 15])).toThrow()
})
```

### Skill aggregation
```typescript
it('should calculate team skill average', () => {
  const members = [{ skillId: 'ts', level: 4 }, { skillId: 'ts', level: 2 }]
  expect(calculateSkillAverage(members, 'ts')).toBe(3)
})
```
