import type { ProfileReliability, ReliabilityStatus } from '@team-manager/shared'

export function computeProfileReliability(
  evaluators: number,
  teamSize: number,
  threshold = 0.6,
): ProfileReliability {
  const peers = Math.max(0, teamSize - 1)
  const rawCoverage = peers === 0 ? 0 : evaluators / peers
  const coverage = Math.min(1, rawCoverage)

  let status: ReliabilityStatus
  if (evaluators === 0 || peers === 0) {
    status = 'none'
  } else if (coverage >= threshold) {
    status = 'reliable'
  } else {
    status = 'partial'
  }

  return { evaluators, teamSize, peers, coverage, status }
}
