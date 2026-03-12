export const BEHAVIOR_LABELS: Record<string, string> = {
  catalyzing: 'Catalyzing', envisioning: 'Envisioning', demanding: 'Demanding',
  coaching: 'Coaching', conducting: 'Conducting', directing: 'Directing',
}

export const GOLEMAN_MOTTOS: Record<string, string> = {
  catalyzing: '"See the whole picture"', envisioning: '"Come with me"',
  demanding: '"Do as I do, now"', coaching: '"Try this"',
  conducting: '"What do you think?"', directing: '"Do what I tell you"',
}

export const BEHAVIOR_PAIRS = [
  'catalyzing', 'envisioning', 'demanding', 'coaching', 'conducting', 'directing',
] as const

export function thirdPersonQuestions(name: string): string[] {
  return [
    `${name} is good at encouraging teams to challenge their assumptions and break through to new levels of performance`,
    `${name} is good at getting people on board, motivating them towards compelling strategic goals`,
    `${name} believes in modeling desired behaviors and expecting others to follow their lead`,
    `${name} believes that their solution is never going to be as effective as one their people come up with by themselves`,
    `${name} encourages people to work together while making sure they are meeting their targets`,
    `${name} ensures high quality by being very clear about what they expect of people`,
    `${name} makes sure that individuals can get access to the people and resources they need to do their jobs`,
    `${name} makes sure the right work is always allocated to the right people`,
    `${name} shares goals to reach for, rather than tasks to complete`,
    `${name} prioritizes long-term individual and team growth over short-term results`,
    `${name} takes a back seat from active team leadership and instead supports the team to govern themselves`,
    `${name} delegates tasks but reserves the right to resume control if people are not performing adequately`,
  ]
}
