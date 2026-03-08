# Component Reuse Audit

**Date**: 2026-03-08

## Summary

13 duplication issues across 16 components and 6 pages. Biggest wins: extracting repeated constants and small UI patterns that appear 8-10+ times.

---

## Phase 1: Extract Constants (LOW effort, HIGH impact)

Create `apps/web/src/components/constants/` directory.

### 1. `archetypeColors.ts` — 10+ duplications

**Files affected**:
- `components/ArchetypeCard.tsx` (lines 161-167)
- `components/ArchetypeChart.tsx` (lines 4-10) — hex format variant
- `components/ArchetypeSpectrum.tsx` (lines 5-11) — includes role labels
- `components/MemberList.tsx` (lines 5-11)
- `components/MemberProfileModal.tsx` (lines 12-18)
- `components/TeamMemberComparisonTable.tsx` (lines 4-10)
- `pages/ManagerHomePage.tsx` (lines 21-25)
- `pages/LeadershipAssessmentPage.tsx` (lines 24-28)
- `pages/ReteamingPage.tsx`

**Current duplication**:
```tsx
// ArchetypeCard.tsx
const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-800',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-800',
  peer:        'bg-blue-50 border-blue-200 text-blue-800',
  coach:       'bg-green-50 border-green-200 text-green-800',
  strategist:  'bg-purple-50 border-purple-200 text-purple-800',
}

// MemberList.tsx — different shade variant
const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700',
  coordinator: 'bg-orange-100 text-orange-700',
  peer:        'bg-blue-100 text-blue-700',
  coach:       'bg-green-100 text-green-700',
  strategist:  'bg-purple-100 text-purple-700',
}
```

**Target export**:
```tsx
export const ARCHETYPE_COLORS = { ... }       // Tailwind classes (light variant)
export const ARCHETYPE_COLORS_CARD = { ... }  // Card variant with border
export const ARCHETYPE_COLORS_HEX = { ... }   // Hex strings for charts
```

---

### 2. `skillLevels.ts` — 8+ duplications (includes inconsistency bug)

**Files affected**:
- `components/SkillsChart.tsx` (line 3)
- `components/MemberProfileModal.tsx` (lines 27-33)
- `components/TeamMemberComparisonTable.tsx` (lines 11-13)
- `components/TeamSkillsMatrix.tsx` (lines 4-5) — **BUG: uses "Theory" instead of "Know theory"**
- `pages/MemberDetailPage.tsx` (lines 12-17)
- `pages/SkillsAssessmentPage.tsx` (lines 8-14)
- `pages/ManagerHomePage.tsx` (lines 9-14)
- `pages/RateManagerPage.tsx`

**Inconsistency bug**:
```tsx
// Most files:
const LEVEL_LABELS = ["Don't know", 'Know theory', 'Autonomous', 'Master', 'Can teach']

// TeamSkillsMatrix.tsx — different!
const LEVEL_LABELS = ["Don't know", 'Theory', 'Autonomous', 'Master', 'Can teach']
```

**Target export**:
```tsx
export const SKILL_LEVEL_LABELS = {
  0: "Don't know",
  1: 'Know theory',
  2: 'Autonomous',
  3: 'Master',
  4: 'Can teach',
} as const

export const SKILL_LEVEL_COLORS = {
  0: 'bg-gray-400',
  1: 'bg-blue-500',
  2: 'bg-green-600',
  3: 'bg-purple-600',
  4: 'bg-amber-500',
} as const
```

---

### 3. `cvfQuadrants.ts` — 6+ duplications

**Files affected**:
- `components/CVFResultCard.tsx` (lines 3-8) — `QUADRANT_META`
- `components/CVFCategoryRow.tsx` (lines 65-70) — `QUADRANT_STYLE`
- `components/CVFRadarChart.tsx` (lines 4-9, 11-12) — `CVF_COLORS`, `QUADRANTS`
- `components/InlineCVFEditor.tsx` (lines 4-16) — `QUADRANTS`, `LABELS`, `HINTS`
- `components/TeamCVFComparisonTable.tsx` (lines 4-5)
- `pages/MemberDetailPage.tsx` (lines 18-21)

**Target export**:
```tsx
export const CVF_QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const

export const CVF_METADATA: Record<CVFQuadrant, {
  label: string
  color: string
  bgColor: string
  lightBg: string
  description: string
  hint: string
}> = {
  clan:      { label: 'Clan',      color: 'bg-green-500',  bgColor: '...', lightBg: '...', description: 'People-first, collaborative culture', hint: 'People first, collaboration, mentoring' },
  adhocracy: { label: 'Adhocracy', color: 'bg-yellow-500', bgColor: '...', lightBg: '...', description: 'Innovation, creativity, risk-taking', hint: 'Innovation, agility, experimentation' },
  market:    { label: 'Market',    color: 'bg-red-500',    bgColor: '...', lightBg: '...', description: 'Results-driven, competitive focus', hint: 'Results, competition, achievement' },
  hierarchy: { label: 'Hierarchy', color: 'bg-blue-500',   bgColor: '...', lightBg: '...', description: 'Stability, control, process', hint: 'Stability, control, efficiency' },
}
```

---

### 4. `coverageColors.ts` — 2 exact duplicates

**Files affected**:
- `components/ReliabilityCoverage.tsx` (lines 3-15)
- `components/TeamCoverageTable.tsx` (lines 23-28)

**Target export**:
```tsx
export function getCoverageColor(pct: number): string {
  if (pct <= 10)  return 'bg-red-500'
  if (pct < 50)   return 'bg-orange-400'
  if (pct < 80)   return 'bg-yellow-400'
  return 'bg-green-500'
}

export function getCoveragePillColor(pct: number): string {
  if (pct <= 10)  return 'bg-red-100 text-red-700'
  if (pct < 50)   return 'bg-orange-100 text-orange-700'
  if (pct < 80)   return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}
```

---

### 5. `behaviorLabels.ts` — 2 duplications

**Files affected**:
- `pages/ManagerHomePage.tsx` (lines 16-19)
- `pages/LeadershipAssessmentPage.tsx` (lines 13-16)

---

## Phase 2: Shared Components (MEDIUM effort, HIGH impact)

### 6. `<SkillLevelBar>` — replaces 8+ inline patterns

**Files affected**:
- `components/MemberProfileModal.tsx` (lines 162-169, 207-214)
- `components/MemberList.tsx`
- `pages/MemberDetailPage.tsx` (lines 203-213)
- `pages/SkillsAssessmentPage.tsx`
- `pages/ManagerHomePage.tsx` (lines 143-149, 151-157)

**Current inline pattern**:
```tsx
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-500 w-28 shrink-0 truncate">{skillName}</span>
  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${LEVEL_BAR[level]}`} style={{ width: `${(level / 4) * 100}%` }} />
  </div>
  <span className="text-xs text-gray-400 w-24 shrink-0">{level} — {LEVEL_LABELS[level]}</span>
</div>
```

**Target component**:
```tsx
interface SkillLevelBarProps {
  label: string
  level: number
  maxLevel?: number
  showLabel?: boolean
  compact?: boolean
}

export function SkillLevelBar({ label, level, maxLevel = 4, showLabel = true }: SkillLevelBarProps) { ... }
```

---

### 7. `<ArchetypeBadge>` — replaces 8+ inline patterns

**Files affected**:
- `components/MemberList.tsx` (line 78)
- `components/MemberProfileModal.tsx` (lines 114-119)
- `components/TeamMemberComparisonTable.tsx` (lines 100-107)
- `pages/MemberDetailPage.tsx`
- `pages/ManagerHomePage.tsx` (line 180)
- `pages/LeadershipAssessmentPage.tsx`

**Current inline pattern**:
```tsx
<span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ARCHETYPE_COLORS[archetype] ?? 'bg-gray-100 text-gray-600'}`}>
  {archetype}
</span>
```

**Target component**:
```tsx
interface ArchetypeBadgeProps {
  archetype: Archetype
  size?: 'xs' | 'sm' | 'md'
}

export function ArchetypeBadge({ archetype, size = 'xs' }: ArchetypeBadgeProps) { ... }
```

---

### 8. `<CVFQuadrantGrid>` — replaces 3 duplicates

**Files affected**:
- `components/MemberProfileModal.tsx` (lines 182-190)
- `pages/MemberDetailPage.tsx` (lines 141-149)
- `components/CVFResultCard.tsx` (lines 26-45)

**Current inline pattern**:
```tsx
<div className="grid grid-cols-2 gap-3">
  {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(q => (
    <div key={q} className={`rounded-xl px-4 py-3 text-center ${CVF_COLORS[q]}`}>
      <p className="text-xs capitalize opacity-70 mb-1">{q}</p>
      <p className="text-2xl font-bold">{cvf.results[q]}</p>
      <p className="text-xs opacity-50">/ 600</p>
    </div>
  ))}
</div>
```

**Target component**:
```tsx
interface CVFQuadrantGridProps {
  scores: CVFScores
  compact?: boolean
}

export function CVFQuadrantGrid({ scores, compact = false }: CVFQuadrantGridProps) { ... }
```

---

### 9. `<DeltaBadge>` — replaces 4+ inline patterns

**Files affected**:
- `components/MemberProfileModal.tsx` (lines 229-241, 245-257)
- `pages/MemberDetailPage.tsx`
- `pages/ManagerHomePage.tsx` (lines 131-137, 202-207)

**Current inline pattern**:
```tsx
<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
  Math.abs(delta) <= 0.5 ? 'bg-green-100 text-green-700' :
  delta < 0 ? 'bg-amber-100 text-amber-700' :
  'bg-blue-100 text-blue-700'
}`}>
  {Math.abs(delta) <= 0.5 ? 'Aligned' : delta < 0 ? '⚠ Blind spot' : '✨ Hidden strength'}
</span>
```

**Target component**:
```tsx
interface DeltaBadgeProps {
  delta: number
  threshold?: number
}

export function DeltaBadge({ delta, threshold = 0.5 }: DeltaBadgeProps) { ... }
```

---

## Phase 3: Polish Components (LOW effort, LOW-MEDIUM impact)

### 10. `<TabsPanel>` — replaces 3+ custom tab layouts

**Files affected**: MemberDetailPage, LeadershipAssessmentPage, CVFAssessmentPage

```tsx
interface Tab { id: string; label: string; content: React.ReactNode }
interface TabsPanelProps { tabs: Tab[]; defaultId?: string }
```

---

### 11. `<Avatar>` — replaces 8+ inline avatar circles

**Current inline pattern**:
```tsx
<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
  {user.name.charAt(0).toUpperCase()}
</div>
```

```tsx
interface AvatarProps { name: string; size?: 'sm' | 'md' | 'lg' }
```

---

### 12. `<EmptyState>` — replaces 3+ inline empty messages

**Current inline pattern**:
```tsx
<p className="text-sm text-gray-400 text-center py-4">No members yet.</p>
```

```tsx
interface EmptyStateProps { message: string; icon?: React.ReactNode }
```

---

## Checklist

- [ ] **Phase 1**: Create `components/constants/` with 5 files, replace all imports
- [ ] **Phase 1**: Fix "Theory" vs "Know theory" inconsistency in TeamSkillsMatrix
- [ ] **Phase 2**: Create `<SkillLevelBar>` and replace 8+ inline patterns
- [ ] **Phase 2**: Create `<ArchetypeBadge>` and replace 8+ inline patterns
- [ ] **Phase 2**: Create `<CVFQuadrantGrid>` and replace 3 duplicates
- [ ] **Phase 2**: Create `<DeltaBadge>` and replace 4+ inline patterns
- [ ] **Phase 3**: Create `<TabsPanel>`, `<Avatar>`, `<EmptyState>`
- [ ] Run `pnpm typecheck` and `pnpm build` after each phase
