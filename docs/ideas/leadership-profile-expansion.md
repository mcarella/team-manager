# Leadership Profile Expansion — Brainstorm Summary

> Risultato del brainstorm architetturale per espandere il profilo di leadership
> con PI behavioral profiles e Saboteur/Sage mental fitness.

---

## Elevator Pitch (IT)

Immagina un sistema che in 3 minuti ti dice **come guidi** (OA Assessment),
in 10 minuti ti dice **chi sei davvero** (PI Behavioral), e in 15 minuti
ti mostra **cosa ti blocca** (Saboteur Radar).

Il tutto parlando una sola lingua: i **6 stili di Goleman**.

Non ti etichettiamo. Ti diamo un linguaggio per capire quando cambiare stile
in base al contesto — perche i leader migliori non hanno uno stile preferito,
hanno una **sacca da golf piena** e scelgono la mazza giusta per ogni colpo.

E quando non riesci a cambiare? Li entrano i Saboteur: pattern mentali che
ti tengono incollato al tuo default. Il Coach che non riesce a dire "basta,
decido io". L'Expert che non riesce a mollare il controllo. Lo Strategist
che non si ferma mai ad ascoltare.

Il Saboteur Radar non ti giudica — ti da le **metafore** per parlarne in
una conversazione di coaching e un piano concreto (Sage Powers) per superarli.

**Tre layer, un linguaggio, zero guinea pig.**

---

## 0. Core Thesis

> Great leadership = mastery of all styles + contextual awareness of when
> to switch + mental fitness to overcome the saboteurs that keep you stuck
> in your default.

Three sources converge:

- **Goleman (HBR 2000)**: "Leaders with the best results do not rely on only
  one leadership style; they use most of them in a given week — seamlessly."
- **ORGANIC agility / Hackman**: Archetypes exist on a maturity spectrum from
  manager-led to self-governing. Growing means learning to inhabit all of them.
- **Cynefin (Snowden)**: The context (Clear, Complicated, Complex, Chaotic)
  dictates which style is appropriate. Sticking to one style regardless of
  context is the failure mode.

---

## 1. Three-Layer Architecture

```
Layer 1: OA Assessment (ORGANIC agility)
  | quick, 12 questions, ~3 min
  | Result: archetype + Goleman styles + behavior scores
  | "How do you lead?"
  |
  v
Layer 2: PI Behavioral Assessment (opt-in)
  | deeper, 4 factors (Dominanza, Estroversione, Pazienza, Formalita)
  | Result: 6-axis Goleman radar + descriptive sub-profile
  | "Who are you as a person?"
  | Soft enrichment: adds nuance to OA, does NOT recalculate scores
  |
  v
Layer 3: Saboteur Assessment (separate module)
  | 50 items (Likert 1-5) + 24 PQ emotion pairs
  | Result: saboteur radar, PQ score, sage powers
  | "What holds you back and how to grow?"
  | Coaching tool linked to archetype-switching
```

Layers stack but don't replace each other. OA is always the foundation.
PI sharpens the picture. Saboteurs add a coaching/growth dimension.

---

## 2. Goleman as Shared Language

### Design principle: minimum entropy for the user

The user learns ONE vocabulary: Goleman's 6 leadership styles.
Everything else maps to it.

| Goleman Style | Motto | ORGANIC Behavior | OA Archetype (when dominant pair) |
|---|---|---|---|
| **Coercive** | "Do what I tell you" | Directing | Expert |
| **Authoritative** | "Come with me" | Envisioning | Strategist |
| **Democratic** | "What do you think?" | Conducting | Coordinator |
| **Pacesetting** | "Do as I do, now" | Demanding | Expert / Coordinator |
| **Coaching** | "Try this" | Coaching | Coach |
| **Visionary** | "See the whole picture" | Catalyzing | Strategist / Coach |

### OA Archetype → Goleman Style Mapping

| OA Archetype | Primary Goleman | Secondary Goleman | Hackman Level |
|---|---|---|---|
| Expert | Coercive | Pacesetting | Manager-led |
| Coordinator | Pacesetting | Democratic | Manager-led / Self-managing |
| Peer | Democratic | Coaching | Self-managing |
| Coach | Coaching | Visionary | Self-designing |
| Strategist | Visionary | Coaching | Self-governing |

---

## 3. PI Behavioral Layer (Soft Enrichment)

### What it does

The PI assessment measures 4 behavioral factors (0-100 each):

- **Dominanza** — drive to control outcomes and people
- **Estroversione** — drive for social interaction and influence
- **Pazienza** — drive for stability, patience, consistency
- **Formalita** — drive for structure, rules, precision

### How it enriches OA

PI factors produce a **6-axis Goleman radar** (score 0-100 per style):

```
High Dom + Low Estr + High Form  → Coercive strength
High Dom + High Estr + Low Paz   → Authoritative strength
Low Dom + High Estr + High Paz   → Democratic strength (consensus)
High Dom + Low Estr + Low Paz    → Pacesetting strength
Low Dom + High Paz + High Form   → Coaching strength
High Dom + High Estr + Low Form  → Visionary strength
```

The radar shows your "golf bag" — which clubs are strong and which need work.

### Sub-profiles (descriptive flavor text)

The 17 PI reference profiles become **optional labels** shown in detailed reports.
They are NOT a separate taxonomy. They're narrative enrichment mapped under
Goleman families:

| Goleman Family | PI Sub-profiles | Key behavioral pattern |
|---|---|---|
| **Coercive** | Il Direttore (Controller), L'Individualista (Individualist) | High Dom, high Form, low Estr — controls through authority and process |
| **Authoritative** | Il Visionario (Strategist), Il Capitano (Captain) | High Dom, high Estr — inspires through vision and charisma |
| **Democratic** | Il Ricercatore (Analyzer), Il Mediatore (Collaborator) | Moderate Dom, high Estr/Paz — builds consensus through data or empathy |
| **Pacesetting** | L'Esperto (Specialist), Lo Studioso (Scholar), Il Pioniere (Venturer), Il Ribelle (Maverick) | High standards — through deep expertise, intellectual rigor, or bold action |
| **Coaching** | L'Armonizzatore (Altruist), L'Operatore (Operator), L'Artigiano (Artisan), Il Guardiano (Guardian) | Low Dom, high Paz — develops others through patience and consistency |
| **Visionary** | Il Persuasore (Persuader), L'Ambasciatore (Promoter) | High Estr, low Form — connects and inspires through relationships |

**Discarded**: Il Camaleonte (Adapter) — all factors at 50 produces a "you're balanced
everywhere" non-answer that feels unsatisfying and unactionable.

### UX: how it's shown

After OA assessment:
> "You're a **Coach** archetype (Coaching + Visionary). Your dominant Goleman styles
> are Coaching and Visionary."

After PI refinement:
> "Your Goleman radar shows strong Coaching (82) and Visionary (75), with moderate
> Democratic (55). Your behavioral pattern resembles **L'Armonizzatore** — you build
> team harmony through empathy and active listening."

PI adds color. It doesn't change the archetype label.

---

## 4. Saboteur Module (Coaching Layer)

### Purpose

Saboteurs are the **mental patterns that keep you stuck in your default archetype**
when the context demands you switch. They're not labels — they're **metaphors for
coaching conversations**.

### The 10 Saboteurs

| Saboteur | Pattern | Forza Originaria (hijacked strength) |
|---|---|---|
| **Judge** (universal) | Finds faults in self, others, circumstances | Discernment, evaluation |
| **Stickler** | Perfectionism, impossible standards | Attention to detail, precision |
| **Pleaser** | Compulsive helping, can't say no | Genuine empathy, generosity |
| **Hyper-Achiever** | Identity fused with performance | Ambition, drive, execution |
| **Victim** | Helplessness, focus on suffering | Emotional sensitivity, empathy |
| **Hyper-Rational** | Pure logic, emotions are noise | Analytical power, objectivity |
| **Hyper-Vigilant** | Constant anxiety about danger | Prudence, risk prevention |
| **Restless** | FOMO, can't stay still | Energy, enthusiasm, adaptability |
| **Controller** | Must control everything and everyone | Determination, direct leadership |
| **Avoider** | Avoids conflict and unpleasant tasks | Desire for peace, diplomacy |

### The 5 Sage Powers (antidotes)

| Sage Power | Core capability | How to use |
|---|---|---|
| **Empathize** | Compassion for self and others | Treat yourself with the kindness you'd show a friend |
| **Explore** | Pure curiosity, beginner's mind | Ask "What's interesting here?" instead of "What's wrong?" |
| **Innovate** | Creative, lateral thinking | Use "Yes, and..." instead of "Yes, but..." |
| **Navigate** | Inner compass, values alignment | Ask "In 10 years, how would I want to have handled this?" |
| **Activate** | Clear, decisive action | Identify the smallest step and do it NOW |

### Shadow Saboteurs: Why You Can't Switch Styles

This is the core coaching data — pre-computed, opinionated, static:

| OA Archetype | Default Goleman styles | Gets stuck because of... | Can't switch to... | Coaching focus |
|---|---|---|---|---|
| **Expert** | Coercive + Pacesetting | Controller ("only I can do it right"), Stickler ("not up to standard"), Hyper-Rational ("feelings aren't relevant") | Coaching, Visionary | Learn to let go of control, trust others' growth, tolerate imperfection |
| **Coordinator** | Democratic + Pacesetting | Hyper-Vigilant ("what could go wrong?"), Stickler ("follow the process"), Pleaser ("can't upset anyone") | Coercive, Authoritative | Learn to make decisive calls, tolerate conflict, set bold direction |
| **Peer** | Democratic + Coaching | Pleaser ("I can't say no"), Avoider ("let's not rock the boat"), Victim ("it's not my call") | Coercive, Pacesetting | Learn to confront, set high standards, claim authority when needed |
| **Coach** | Coaching + Visionary | Pleaser ("they need me"), Hyper-Achiever ("I must grow everyone"), Judge ("they're not trying hard enough") | Coercive, Pacesetting | Learn to set boundaries, accept that growth takes time, focus on outcomes too |
| **Strategist** | Visionary + Coaching | Controller ("trust the vision"), Restless ("next challenge!"), Hyper-Achiever ("bigger impact") | Democratic, Coaching (patient) | Learn to slow down, listen before deciding, build consensus |

### The Coaching Conversation Template

> "You're a **[Archetype]**. Your top saboteur is **[Saboteur]** ([score]/10).
> This makes it hard for you to shift to **[target Goleman style]** when the
> context requires it — for example, when the situation is **[Cynefin domain]**.
>
> Your **[Saboteur]** started as a survival mechanism: **[origin]**.
> Its original strength is **[forza originaria]** — that's real and valuable.
> But when it hijacks you, it becomes **[description of the pattern]**.
>
> Your Sage antidote: **[Sage Power 1]** + **[Sage Power 2]**.
> Practical exercise: **[daily exercise]**."

---

## 5. Cynefin Context Mapping

Which Goleman styles fit which contexts:

| Cynefin Domain | Characteristics | Primary Goleman style | Why | Natural OA archetype |
|---|---|---|---|---|
| **Clear** | Known answers, best practices | Pacesetting, Coercive | Execute with discipline, follow the playbook | Expert |
| **Complicated** | Expert analysis needed | Authoritative, Democratic | Need expert input + organizational buy-in | Coordinator, Strategist |
| **Complex** | Emergent, experiments needed | Coaching, Visionary | Need trust, safe-to-fail probes, emergence | Coach, Peer |
| **Chaotic** | Crisis, no time to think | Coercive → Authoritative | Act first (stabilize), then set direction | Expert → Strategist |
| **Confused** | Don't know which domain | Democratic | Gather perspectives to figure out where you are | Coordinator |

The key insight: **a leader stuck in their default archetype will apply their
preferred style regardless of context.** The saboteur radar explains WHY they're
stuck. The sage powers show HOW to unstick.

---

## 6. What We Build vs. What We Discard

| Item | Verdict | Rationale |
|---|---|---|
| OA Assessment (12 questions) | **KEEP** | Foundation, quick, already built and tested (39 core tests) |
| 6 Goleman styles as shared language | **INTEGRATE** | Rename all user-facing labels. Single vocabulary |
| PI Behavioral Assessment (4 factors) | **INTEGRATE** (opt-in Layer 2) | Produces 6-axis Goleman radar + sub-profile flavor text |
| ~16 PI sub-profile labels | **REMAP** under Goleman families | Descriptive, not classificatory. Camaleonte discarded |
| Saboteur Assessment (50 + 24 items) | **INTEGRATE** (separate Module 3) | Radar chart. Coaching tool for archetype-switching |
| 5 Sage Powers | **INTEGRATE** with Saboteurs | Prescriptive antidote layer. Saboteurs without Sage = diagnosis without treatment |
| Shadow Saboteur mapping | **BUILD** (static coaching data) | Pre-computed archetype-to-saboteur correlations |
| Cynefin context mapping | **BUILD** (static reference data) | Shown in coaching reports. Links context to appropriate style |
| Cognitive assessment (Num/Verb/Astr) | **DISCARD** | Guinea pig UX. Not lightweight. Not aligned with coaching-first philosophy |
| Affiliative as separate OA behavior | **DISCARD** | Already covered by existing Coaching/Conducting behaviors in OA model |

---

## 7. Implementation Priority

### Phase 1: Goleman Unification
- Rename all user-facing behavior labels to Goleman styles
- Update report output to show Goleman radar from OA scores
- Static data: archetype cards with Goleman language, strengths, risks

### Phase 2: PI Behavioral Layer
- New assessment flow (4-factor instrument)
- Scoring engine: PI factors → Goleman radar refinement
- Sub-profile matching algorithm
- Enriched profile card with PI flavor text

### Phase 3: Saboteur Module
- Saboteur assessment flow (50 Likert items)
- PQ score assessment (24 emotion pairs)
- Scoring engine: saboteur scores + PQ score
- Saboteur radar chart (like mappa saboteur in output report mockup)
- Sage Powers recommendation engine
- Shadow Saboteur mapping (static coaching data)

### Phase 4: Coaching Integration
- Cynefin context mapping in reports
- Coaching conversation templates
- Team-level saboteur aggregation ("this team has 4 Controllers")
- Growth tracking: retake assessments, see movement over time

---

## 8. Data Model Additions (sketch)

```typescript
// New types to add to packages/shared/src/types.ts

// --- PI Behavioral Layer ---
interface PIFactors {
  dominanza: number;     // 0-100
  estroversione: number; // 0-100
  pazienza: number;      // 0-100
  formalita: number;     // 0-100
}

type GolemanStyle = 'coercive' | 'authoritative' | 'democratic'
                  | 'pacesetting' | 'coaching' | 'visionary';

type GolemanRadar = Record<GolemanStyle, number>; // 0-100 each

type PISubProfile =
  | 'direttore' | 'individualista'         // Coercive family
  | 'visionario' | 'capitano'              // Authoritative family
  | 'ricercatore' | 'mediatore'            // Democratic family
  | 'esperto' | 'studioso' | 'pioniere' | 'ribelle'  // Pacesetting family
  | 'armonizzatore' | 'operatore' | 'artigiano' | 'guardiano' // Coaching family
  | 'persuasore' | 'ambasciatore';         // Visionary family

interface PIAssessment {
  userId: string;
  factors: PIFactors;
  golemanRadar: GolemanRadar;
  subProfile: PISubProfile;
  completedAt: Date;
}

// --- Saboteur Module ---
type SaboteurId =
  | 'judge' | 'stickler' | 'pleaser' | 'hyper_achiever'
  | 'victim' | 'hyper_rational' | 'hyper_vigilant'
  | 'restless' | 'controller' | 'avoider';

type SagePowerId = 'empathize' | 'explore' | 'innovate' | 'navigate' | 'activate';

interface SaboteurAssessment {
  userId: string;
  saboteurScores: Record<SaboteurId, number>;  // 0-10
  pqScore: number;                              // 0-100
  topSaboteurs: SaboteurId[];                   // ranked, top 3
  sagePowers: SagePowerId[];                    // recommended antidotes
  completedAt: Date;
}

// --- Unified Profile ---
interface UnifiedLeadershipProfile {
  user: User;
  oa: LeadershipAssessment;                     // Layer 1 (always present)
  pi?: PIAssessment;                            // Layer 2 (opt-in)
  saboteur?: SaboteurAssessment;                // Layer 3 (separate module)
  cvf?: CVFAssessment;                          // Existing
  skills: SkillAssessment[];                    // Existing
}
```

---

*Document generated from brainstorm session — 2026-04-02*
*Sources: Goleman HBR 2000, ORGANIC agility Archetypes, PQ Archetypes Reference Guide, TACO Meetup, Saboteur Implementation Plan*
