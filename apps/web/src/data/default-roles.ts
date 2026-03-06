import type { SkillRole } from '@team-manager/shared'

export const DEFAULT_ROLES: SkillRole[] = [
  {
    id: 'software-developer',
    name: 'Software Developer',
    skills: [
      { id: 'code-quality', name: 'Code Quality & Review' },
      { id: 'tdd', name: 'TDD & Testing' },
      { id: 'ci-cd', name: 'CI/CD & DevOps' },
      { id: 'system-design', name: 'System Design' },
      { id: 'debugging', name: 'Debugging & Troubleshooting' },
      { id: 'pair-programming', name: 'Pair Programming' },
    ],
  },
  {
    id: 'product-designer',
    name: 'Product Designer',
    skills: [
      { id: 'user-research', name: 'User Research' },
      { id: 'interaction-design', name: 'Interaction Design' },
      { id: 'visual-design', name: 'Visual Design' },
      { id: 'prototyping', name: 'Prototyping' },
      { id: 'design-systems', name: 'Design Systems' },
      { id: 'usability-testing', name: 'Usability Testing' },
    ],
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    skills: [
      { id: 'roadmapping', name: 'Roadmapping & Prioritization' },
      { id: 'stakeholder-mgmt', name: 'Stakeholder Management' },
      { id: 'data-driven', name: 'Data-Driven Decisions' },
      { id: 'user-stories', name: 'User Story Writing' },
      { id: 'market-analysis', name: 'Market Analysis' },
      { id: 'go-to-market', name: 'Go-to-Market Strategy' },
    ],
  },
  {
    id: 'agile-coach',
    name: 'Agile Coach',
    skills: [
      { id: 'scrum-mastery', name: 'Scrum Mastery' },
      { id: 'kanban', name: 'Kanban & Flow' },
      { id: 'team-facilitation', name: 'Team Facilitation' },
      { id: 'org-change', name: 'Organizational Change' },
      { id: 'metrics-improvement', name: 'Metrics & Continuous Improvement' },
      { id: 'conflict-mediation', name: 'Conflict Mediation' },
    ],
  },
  {
    id: 'engineering-manager',
    name: 'Engineering Manager',
    skills: [
      { id: 'one-on-ones', name: '1:1s & Career Development' },
      { id: 'hiring-process', name: 'Hiring & Interviewing' },
      { id: 'perf-management', name: 'Performance Management' },
      { id: 'tech-strategy', name: 'Technical Strategy' },
      { id: 'team-building', name: 'Team Building' },
      { id: 'cross-team', name: 'Cross-Team Coordination' },
    ],
  },
  {
    id: 'hr-people-ops',
    name: 'HR / People Ops',
    skills: [
      { id: 'talent-acquisition', name: 'Talent Acquisition' },
      { id: 'onboarding', name: 'Onboarding & Retention' },
      { id: 'compensation', name: 'Compensation & Benefits' },
      { id: 'employee-relations', name: 'Employee Relations' },
      { id: 'dei', name: 'DEI Initiatives' },
      { id: 'hr-compliance', name: 'HR Compliance & Policy' },
    ],
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    skills: [
      { id: 'sql-querying', name: 'SQL & Data Querying' },
      { id: 'data-viz', name: 'Data Visualization' },
      { id: 'statistical-analysis', name: 'Statistical Analysis' },
      { id: 'ab-testing', name: 'A/B Testing' },
      { id: 'ml-basics', name: 'ML Fundamentals' },
      { id: 'data-pipeline', name: 'Data Pipelines & ETL' },
    ],
  },
  {
    id: 'common',
    name: 'Common / Cross-Role',
    skills: [
      { id: 'agile', name: 'Agile & Scrum' },
      { id: 'coaching', name: 'Coaching' },
      { id: 'facilitation', name: 'Facilitation' },
      { id: 'strategy', name: 'Strategic Thinking' },
      { id: 'tech-lead', name: 'Technical Leadership' },
      { id: 'conflict', name: 'Conflict Resolution' },
      { id: 'feedback', name: 'Giving Feedback' },
      { id: 'hiring', name: 'Hiring & Interviewing' },
    ],
  },
]
