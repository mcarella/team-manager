import type { SkillAssessment } from '@team-manager/shared'

/**
 * Pick the top `n` skills the user should improve, ranked by lowest level first.
 *
 * - Skips skills already at level 4 ("can teach/mentor") — they're at the cap.
 * - Ties broken by `skillId` ascending so output is stable across renders.
 * - Returns fewer than `n` entries if not enough sub-cap skills exist.
 */
export function pickTopSkillsToImprove(
  assessments: SkillAssessment[],
  n = 3,
): SkillAssessment[] {
  return [...assessments]
    .filter(a => a.level < 4)
    .sort((a, b) => a.level - b.level || a.skillId.localeCompare(b.skillId))
    .slice(0, n)
}
