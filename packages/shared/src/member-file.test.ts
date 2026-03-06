import { describe, it, expect } from 'vitest'
import { parseMemberFile } from './member-file.js'

const validFile = {
  version: '1',
  exportedAt: '2026-03-06T10:00:00.000Z',
  user: { id: 'mario.rossi', email: 'mario@example.com', name: 'Mario Rossi', orgId: 'default', role: 'member' as const },
  leadership: null,
  cvf: null,
  skills: [],
}

describe('parseMemberFile', () => {
  it('accepts a valid minimal .member file', () => {
    const result = parseMemberFile(validFile)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.user.id).toBe('mario.rossi')
  })

  it('rejects a non-object input', () => {
    expect(parseMemberFile(null).ok).toBe(false)
    expect(parseMemberFile('string').ok).toBe(false)
    expect(parseMemberFile(42).ok).toBe(false)
  })

  it('rejects when user is missing', () => {
    const { user: _user, ...noUser } = validFile
    const result = parseMemberFile(noUser)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/user/)
  })

  it('rejects when user.id is missing', () => {
    const bad = { ...validFile, user: { ...validFile.user, id: undefined } }
    const result = parseMemberFile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/user\.id/)
  })

  it('rejects when version is missing', () => {
    const { version: _v, ...noVersion } = validFile
    const result = parseMemberFile(noVersion)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/version/)
  })

  it('rejects when exportedAt is missing', () => {
    const { exportedAt: _e, ...noDate } = validFile
    const result = parseMemberFile(noDate)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/exportedAt/)
  })

  it('accepts file with leadership and cvf populated', () => {
    const withAssessments = {
      ...validFile,
      leadership: { userId: 'mario.rossi', answers: Array(12).fill(5), scores: {}, archetype: 'expert', golemansStyles: [], completedAt: new Date().toISOString() },
      cvf: { userId: 'mario.rossi', categories: [], results: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }, completedAt: new Date().toISOString() },
      skills: [{ userId: 'mario.rossi', skillId: 'agile', level: 2 }],
    }
    expect(parseMemberFile(withAssessments).ok).toBe(true)
  })
})
