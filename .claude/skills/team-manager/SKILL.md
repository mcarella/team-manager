# team-manager Domain Skill

Conoscenza di dominio completa per team-manager.

## ORGANIC agility Leadership Model

### 12 Questions → 6 Behaviors

| Q pair  | Behavior    | Description                                      |
|---------|-------------|--------------------------------------------------|
| 1 + 11  | Catalyzing  | Challenge assumptions, self-governing teams      |
| 2 + 9   | Envisioning | Strategic vision, shared goals                  |
| 3 + 12  | Demanding   | High standards, model behavior                  |
| 4 + 10  | Coaching    | Servant leadership, team autonomy               |
| 5 + 7   | Conducting  | Coordination, cooperation                       |
| 6 + 8   | Directing   | Authority, clear expectations                   |

### Archetype Determination Algorithm

```
scores = { catalyzing, envisioning, demanding, coaching, conducting, directing }
sorted = sort(scores, desc)
top1 = sorted[0].behavior
top2 = sorted[1].behavior

archetype = match(top1, top2):
  directing  + demanding   → expert
  demanding  + conducting  → coordinator
  conducting + coaching    → peer
  coaching   + catalyzing  → coach
  catalyzing + coaching    → strategist
  (fallback: use top1 only)
```

### Goleman Mapping

| ORGANIC      | Goleman Style  | Impact on Climate | When to use             |
|--------------|----------------|-------------------|-------------------------|
| Directing    | Coercive       | Negative (-0.26)  | Crisis, turnaround      |
| Envisioning  | Authoritative  | Highly Positive   | New direction needed    |
| Demanding    | Pacesetting    | Negative (-0.25)  | Self-motivated experts  |
| Conducting   | Democratic     | Positive          | Build consensus         |
| Coaching     | Coaching       | Positive          | Develop strengths       |
| Catalyzing   | Visionary      | Highly Positive   | High autonomy teams     |

## CVF Model (Competing Values Framework)

### 6 Assessment Categories
1. How do you see the organization?
2. How do you see the leaders?
3. What reflects most the employee management?
4. What holds things together?
5. What boosts the organization?
6. The company definition of success

### 4 Quadrants
- **Clan/Collaborate**: people, trust, loyalty, teamwork
- **Ad-hocracy/Create**: innovation, risk-taking, entrepreneurship
- **Market/Compete**: results, competition, achievement
- **Hierarchy/Control**: stability, efficiency, formal processes

### Scoring
- Ogni categoria: 4 valori che sommano a 100
- Risultato per quadrante: somma dei 6 valori (range 0-600)
- Normalizzazione per radar: valore / 600 × 100

## Skill Assessment

### 5-Level Dreyfus-inspired Scale
| Level | Label           | Description                                    |
|-------|-----------------|------------------------------------------------|
| 0     | Don't know      | No knowledge of the topic                      |
| 1     | Know theory     | Theoretical knowledge, no practical experience |
| 2     | Autonomous      | Works independently on standard tasks          |
| 3     | Master          | Solves complex problems, deep expertise        |
| 4     | Can teach       | Mentors others, creates learning materials     |

## Team Kiviat Diagram

### Dimensions
1. **Archetype spread** — percentuale di ogni archetipo nel team
2. **Cultural quadrants** — media CVF del team
3. **Skills coverage** — media per skill × membro

### Balance Heuristics
- Almeno 3 archetipi diversi per team resiliente
- Nessun quadrante CVF sotto 10% (evita monocultura)
- Skill critica: almeno 1 membro a livello 3+

## Permission Model

### Hackman Authority Matrix
```
                   ┌─────────────────────────────────────┐
Level              │ Task  │ Process │ Design │ Direction │
───────────────────┼───────┼─────────┼────────┼───────────┤
Manager-led        │  team │ manager │manager │  manager  │
Self-managing      │  team │  team   │manager │  manager  │
Self-designing     │  team │  team   │  team  │  manager  │
Self-governing     │  team │  team   │  team  │   team    │
```

### App Permission Mapping
```typescript
const permissions = {
  'manager-led': {
    fillOwnAssessment: false,  // manager fills for member
    viewOwnProfile: true,
    viewOtherProfiles: false,
    composeTeams: false,
    manageSkills: false,
    manageOrg: false,
  },
  'self-managing': {
    fillOwnAssessment: true,
    viewOwnProfile: true,
    viewOtherProfiles: false,
    composeTeams: false,
    manageSkills: false,
    manageOrg: false,
  },
  'self-designing': {
    fillOwnAssessment: true,
    viewOwnProfile: true,
    viewOtherProfiles: true,
    composeTeams: true,        // can propose, manager approves
    manageSkills: false,
    manageOrg: false,
  },
  'self-governing': {
    fillOwnAssessment: true,
    viewOwnProfile: true,
    viewOtherProfiles: true,
    composeTeams: true,
    manageSkills: true,
    manageOrg: false,          // some org settings still manager-only
  },
}
```
