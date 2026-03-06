import type {
  User,
  LeadershipAssessment,
  CVFAssessment,
  SkillAssessment,
} from './types.js'

export interface MemberFile {
  version: string
  exportedAt: string
  user: User
  leadership: LeadershipAssessment | null
  cvf: CVFAssessment | null
  skills: SkillAssessment[]
}

type ParseResult =
  | { ok: true; data: MemberFile }
  | { ok: false; error: string }

export function parseMemberFile(input: unknown): ParseResult {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Expected an object' }
  }

  const obj = input as Record<string, unknown>

  if (typeof obj['version'] !== 'string') {
    return { ok: false, error: 'Missing or invalid field: version' }
  }

  if (typeof obj['exportedAt'] !== 'string') {
    return { ok: false, error: 'Missing or invalid field: exportedAt' }
  }

  if (typeof obj['user'] !== 'object' || obj['user'] === null) {
    return { ok: false, error: 'Missing or invalid field: user' }
  }

  const user = obj['user'] as Record<string, unknown>
  if (typeof user['id'] !== 'string' || !user['id']) {
    return { ok: false, error: 'Missing or invalid field: user.id' }
  }

  return {
    ok: true,
    data: {
      version: obj['version'],
      exportedAt: obj['exportedAt'],
      user: obj['user'] as User,
      leadership: (obj['leadership'] as LeadershipAssessment | null) ?? null,
      cvf: (obj['cvf'] as CVFAssessment | null) ?? null,
      skills: Array.isArray(obj['skills']) ? (obj['skills'] as SkillAssessment[]) : [],
    },
  }
}
