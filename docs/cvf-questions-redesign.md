# CVF Questions Redesign

**Date**: 2026-03-08

## Problems with Current Questions

The existing statements follow the classic OCAI format almost verbatim. From a user research / ethnography perspective:

1. **Leading language** — Statements like "sometimes pushy" or "very controlled" carry negative connotations. Respondents avoid allocating points to options that sound bad, skewing results away from Market and Hierarchy.

2. **Abstract jargon** — "Entrepreneurs and changemakers", "cutting-edge innovators", "smooth-running efficiency" are corporate buzzwords. People nod along without connecting them to lived experience.

3. **Double-barreled statements** — Category 1 Clan packs socializing + humor + self-disclosure into one sentence. A respondent who sees trust but no humor doesn't know what to score.

4. **Aspirational bias** — The statements describe idealized states. People answer what they *wish* the org looked like, not what it *actually* looks like. Ethnographic best practice: anchor to observable behaviors, not values.

5. **Inconsistent abstraction level** — Some statements are concrete ("fast releases"), others philosophical ("human development"). This makes point distribution unreliable across categories.

6. **Missing temporal anchor** — No framing for "right now" vs "in general" vs "ideally". The original OCAI has a NOW vs PREFERRED split; these have neither.

---

## Proposed Replacement Questions

Each category uses a **behavioral anchor** — a concrete situation people can recognize from their last 2-4 weeks of work. Statements are written in neutral, equally-desirable language to reduce social desirability bias.

### Category 1 — When a decision needs to be made

| Quadrant | Statement |
|----------|-----------|
| Clan | We gather input from the people affected and look for a solution everyone can support. |
| Adhocracy | Someone proposes a bold option, we run a quick experiment, and adjust based on what we learn. |
| Market | We look at the data, pick the option most likely to hit our target, and move fast. |
| Hierarchy | We follow the established decision-making process and escalate when the decision is above our level. |

### Category 2 — When a new person joins the team

| Quadrant | Statement |
|----------|-----------|
| Clan | We pair them with a buddy, introduce them to everyone, and make sure they feel welcome before anything else. |
| Adhocracy | We give them a small real problem on day one so they can learn by doing and bring fresh eyes. |
| Market | We set clear goals for their first 30/60/90 days so they know exactly what success looks like. |
| Hierarchy | We walk them through our processes, tools and standards so they can work consistently with the rest of the team. |

### Category 3 — When something goes wrong in production / delivery

| Quadrant | Statement |
|----------|-----------|
| Clan | We rally together, nobody blames anyone, and we make sure the person closest to the issue feels supported. |
| Adhocracy | We treat it as a learning opportunity — we dig into root causes and redesign the part that failed. |
| Market | We fix it as fast as possible, communicate impact to stakeholders, and get back on track. |
| Hierarchy | We follow the incident process, document what happened, and update procedures to prevent recurrence. |

### Category 4 — What gets recognized and rewarded

| Quadrant | Statement |
|----------|-----------|
| Clan | Helping a colleague grow, mentoring someone, or stepping in when the team needs support. |
| Adhocracy | Trying something new — even if it doesn't fully work — and sharing what was learned. |
| Market | Delivering measurable results, closing deals, shipping on time, hitting KPIs. |
| Hierarchy | Consistency, reliability, and following through on commitments without cutting corners. |

### Category 5 — How conflict or disagreement is handled

| Quadrant | Statement |
|----------|-----------|
| Clan | We talk it out openly, prioritize the relationship, and look for common ground. |
| Adhocracy | We welcome the tension — different viewpoints push us toward a better, non-obvious solution. |
| Market | We focus on which position gets us closer to the goal and decide quickly so we don't lose momentum. |
| Hierarchy | We refer to roles, responsibilities or existing guidelines to settle who has the call. |

### Category 6 — What "a good week" looks like

| Quadrant | Statement |
|----------|-----------|
| Clan | People had meaningful conversations, helped each other, and nobody felt left out. |
| Adhocracy | We tried something we hadn't done before and learned something that changes how we'll work next. |
| Market | We shipped what we promised, moved the needle on our metrics, and stayed ahead of competitors. |
| Hierarchy | Everything ran smoothly — no surprises, no firefighting, plans were followed and deadlines met. |

---

## Design Principles Applied

| Principle | Old questions | New questions |
|-----------|--------------|---------------|
| **Behavioral anchoring** | Describe abstract values ("trust, openness") | Describe observable actions ("we pair them with a buddy") |
| **Neutral desirability** | Hierarchy/Market sound negative | All four options sound reasonable and attractive |
| **Single-barreled** | Multiple concepts per sentence | One clear behavior per statement |
| **Temporal anchor** | No time reference | Situational ("when X happens") grounds in recent memory |
| **Equal length** | Uneven — some 5 words, some 20 | Comparable length reduces anchoring bias |
| **Ethnographic validity** | Academic/textbook tone | Written in language people actually use at work |

---

## Implementation

Update `apps/web/src/components/CVFCategoryRow.tsx` — replace the `CATEGORIES` array with the new questions above. No changes needed to scoring logic, form layout, or data model.
