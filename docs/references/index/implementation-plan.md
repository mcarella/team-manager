# Behavioral & Cognitive Assessment Platform — Implementation Plan

> Ispirato al modello Predictive Index. Assessment comportamentale + cognitivo con profilazione automatica.

---

## 1. Overview del Prodotto

### Obiettivo
Piattaforma di assessment che misura **profilo comportamentale** (tramite selezione aggettivi) e **abilità cognitiva** (tramite test a tempo) per generare un profilo lavorativo completo con Reference Profile e report di sintesi.

### Utenti target
- **Admin/HR**: Creano job target, invitano candidati, consultano risultati
- **Candidati**: Completano i due assessment
- **Manager**: Consultano profili del team, confrontano con job target

### Stack consigliato
| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 14+ (App Router), React 18, TypeScript |
| Styling | Tailwind CSS + Radix UI primitives |
| State | Zustand (client) + React Query (server) |
| Backend | Next.js API Routes oppure Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js / Clerk |
| Deploy | Vercel + Supabase (o Railway per DB) |
| Analytics | PostHog / Mixpanel (opzionale) |

---

## 2. Architettura Dati

### 2.1 Schema Database (Prisma-style)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role      @default(CANDIDATE)
  assessments   Assessment[]
  createdAt     DateTime  @default(now())
}

enum Role {
  ADMIN
  MANAGER
  CANDIDATE
}

model Assessment {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  behavioralResult  BehavioralResult?
  cognitiveResult   CognitiveResult?
  status            AssessmentStatus @default(PENDING)
  invitedAt         DateTime @default(now())
  completedAt       DateTime?
}

enum AssessmentStatus {
  PENDING
  BEHAVIORAL_DONE
  COGNITIVE_DONE
  COMPLETED
}

model BehavioralResult {
  id              String     @id @default(cuid())
  assessmentId    String     @unique
  assessment      Assessment @relation(fields: [assessmentId], references: [id])
  
  // Raw selections (array di ID aggettivi)
  selfConceptSelections  Json   // string[]
  selfSelections         Json   // string[]
  
  // Computed scores (0-100 scale, sigmoide)
  selfConcept_A    Float  // Dominance
  selfConcept_B    Float  // Extraversion
  selfConcept_C    Float  // Patience
  selfConcept_D    Float  // Formality
  self_A           Float
  self_B           Float
  self_C           Float
  self_D           Float
  synthesis_A      Float  // Media pesata Self + SelfConcept
  synthesis_B      Float
  synthesis_C      Float
  synthesis_D      Float
  
  factorE          Float  // Objectivity (derivato)
  mScore           Int    // Totale aggettivi selezionati
  
  referenceProfile ReferenceProfile
  matchScore       Float? // vs Job Target (opzionale)
  completedAt      DateTime @default(now())
}

model CognitiveResult {
  id              String     @id @default(cuid())
  assessmentId    String     @unique
  assessment      Assessment @relation(fields: [assessmentId], references: [id])
  
  totalQuestions   Int      @default(50)
  correctAnswers   Int
  answeredCount    Int
  timeUsedSeconds  Int
  
  numericalScore   Int
  verbalScore      Int
  abstractScore    Int
  
  scaledScore      Int    // 100-450 scala normalizzata
  percentile       Int?
  completedAt      DateTime @default(now())
}

enum ReferenceProfile {
  ANALYZER
  CONTROLLER
  SPECIALIST
  STRATEGIST
  VENTURER
  ALTRUIST
  CAPTAIN
  COLLABORATOR
  MAVERICK
  PERSUADER
  PROMOTER
  ADAPTER
  ARTISAN
  GUARDIAN
  OPERATOR
  INDIVIDUALIST
  SCHOLAR
}
```

### 2.2 Data Model: Aggettivi

```typescript
interface Adjective {
  id: string;           // "adj_001"
  label_en: string;     // "Assertive"
  label_it: string;     // "Assertivo"
  factor: 'A' | 'B' | 'C' | 'D' | 'E';
  weight: number;       // -1.0 to +1.0 (contributo al fattore)
  polarity: 'high' | 'low'; // se indica punteggio alto o basso
}
```

Servono **86 aggettivi** distribuiti approssimativamente così:
- Fattore A (Dominanza): ~20 aggettivi (10 alta, 10 bassa)
- Fattore B (Estroversione): ~22 aggettivi (11 alta, 11 bassa)
- Fattore C (Pazienza): ~20 aggettivi (10 alta, 10 bassa)
- Fattore D (Formalità): ~18 aggettivi (9 alta, 9 bassa)
- Fattore E (Oggettività): ~6 aggettivi (contributi incrociati)

### 2.3 Data Model: Domande Cognitive

```typescript
interface CognitiveQuestion {
  id: string;
  category: 'numerical' | 'verbal' | 'abstract';
  subcategory: string;  // es. "number_series", "antonym", "pattern_sequence"
  difficulty: 1 | 2 | 3;
  prompt: string;
  options: string[];    // 4 opzioni (3 per verbal analysis)
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;    // per abstract reasoning
}
```

Distribuzione delle 50 domande:
- Numerico: 18 (serie=6, word_problems=6, quantity=6)
- Verbale: 17 (antonimi=6, analogie=6, comprensione=5)
- Astratto: 15 (sequenze=5, relazioni=5, odd_one_out=5)

### 2.4 Data Model: 17 Reference Profile

```typescript
interface ReferenceProfileDefinition {
  id: ReferenceProfile;
  name: string;
  group: 'analytical' | 'social' | 'stabilizing' | 'persistent';
  icon: string;         // emoji o icona
  centroid: {           // coordinate prototipiche (scala 0-100)
    A: number;
    B: number;
    C: number;
    D: number;
  };
  description: string;
  strengths: string[];
  cautionAreas: string[];
  idealEnvironment: string;
  communicationStyle: string;
}
```

---

## 3. Algoritmo di Scoring

### 3.1 Behavioral Scoring

```
STEP 1: Conteggio raw
  Per ciascun fattore F ∈ {A, B, C, D}:
    raw_F = Σ (weight_i) per ogni aggettivo selezionato dove factor_i == F

STEP 2: Normalizzazione (scala 0-100 tramite sigmoide)
  Per evitare valori estremi con pochi/molti aggettivi:
  normalized_F = 100 / (1 + e^(-k * (raw_F - midpoint_F)))
  dove k = fattore di scala, midpoint_F = mediana attesa

STEP 3: Tre pattern
  Self-Concept = scores dalla Lista 1
  Self = scores dalla Lista 2
  Synthesis = 0.6 * Self + 0.4 * Self-Concept
  (il Self pesa di più perché riflette i drive naturali)

STEP 4: Factor E (Oggettività)
  E = f(A, B, C, D) — formula derivata:
  E ≈ (D + A) / 2 - B * 0.3
  (alta formalità + alta dominanza + bassa estroversione = più oggettivo)

STEP 5: M Score
  M = numero totale aggettivi selezionati (per lista)
  Valido se 6 ≤ M ≤ 80

STEP 6: Reference Profile Assignment
  Per ciascuno dei 17 profili P:
    distance_P = √((synth_A - centroid_P.A)² + 
                    (synth_B - centroid_P.B)² + 
                    (synth_C - centroid_P.C)² + 
                    (synth_D - centroid_P.D)²)
  Profilo assegnato = argmin(distance_P)

STEP 7: Match Score (opzionale, vs Job Target)
  matchScore = 10 - (distance_to_jobTarget / max_possible_distance) * 9
  Scala 1-10
```

### 3.2 Cognitive Scoring

```
STEP 1: Raw Score
  raw = numero risposte corrette (0-50)

STEP 2: Scaled Score (100-450)
  scaled = 100 + (raw / 50) * 350
  
STEP 3: Sub-scores
  numerical_pct = correct_numerical / total_numerical * 100
  verbal_pct = correct_verbal / total_verbal * 100
  abstract_pct = correct_abstract / total_abstract * 100

STEP 4: Target Score Matching (per ruolo)
  Confronto con range target definiti dall'HR:
  - Entry level: 150-250
  - Professional: 250-320
  - Manager: 280-350
  - Executive: 320-400+
```

---

## 4. Screens & User Flow

### 4.1 Flow Candidato

```
[Email Invito] 
    → [Landing / Auth] 
    → [Istruzioni Behavioral]
    → [Lista 1: Self-Concept] (selezione aggettivi)
    → [Lista 2: Self] (selezione aggettivi)
    → [Transizione]
    → [Istruzioni Cognitive]
    → [Test Cognitivo] (50 domande, timer 12 min)
    → [Completamento]
    → [Report Personale] (opzionale, configurabile dall'admin)
```

### 4.2 Screens dettagliati

#### S1 — Welcome / Istruzioni Behavioral
- Titolo assessment
- Spiegazione formato (2 liste, aggettivi, nessun limite di tempo)
- Rassicurazione: "Non ci sono risposte giuste o sbagliate"
- CTA: "Inizia Assessment"

#### S2 — Lista 1: Self-Concept
- Prompt: "Seleziona gli aggettivi che descrivono come ritieni ci si aspetti che tu ti comporti al lavoro"
- Griglia di 86 aggettivi (chip/toggle selezionabili)
- Contatore aggettivi selezionati
- Warning se < 6 o > 80
- Zona consigliata: 20-50
- CTA: "Continua"

#### S3 — Lista 2: Self
- Prompt: "Seleziona gli aggettivi che descrivono realmente come sei"
- Stessa griglia, selezione indipendente
- Stesso contatore e warning
- CTA: "Completa Assessment Comportamentale"

#### S4 — Transizione
- "Hai completato l'assessment comportamentale!"
- Preview: "Ora inizierà l'assessment cognitivo — 50 domande in 12 minuti"
- CTA: "Inizia Assessment Cognitivo"

#### S5 — Test Cognitivo
- Timer prominente (countdown da 12:00)
- Domanda corrente con 4 opzioni
- Progress bar (domanda X di 50)
- Navigazione: Avanti / Indietro tra domande
- Flag domanda per revisione
- Auto-submit a tempo scaduto

#### S6 — Report Finale
- **Sezione Behavioral:**
  - Grafico a barre dei 4 fattori (Self, Self-Concept, Synthesis)
  - Reference Profile assegnato con icona e descrizione
  - Punti di forza e aree di cautela
  - M Score e Factor E
- **Sezione Cognitive:**
  - Punteggio totale e scaled score
  - Breakdown per area (numerico, verbale, astratto)
  - Percentile (se disponibili dati normativi)

### 4.3 Screens Admin (v2)

- Dashboard con lista candidati e stati
- Creazione Job Target (selezione livelli fattori desiderati)
- Confronto candidato vs Job Target (match score)
- Team view: mappa comportamentale del team
- Export report PDF

---

## 5. Content Bank da produrre

### 5.1 Behavioral — 86 Aggettivi

| # | Aggettivo (EN) | Aggettivo (IT) | Fattore | Polarità | Peso |
|---|---|---|---|---|---|
| 1 | Assertive | Assertivo | A | high | +0.9 |
| 2 | Independent | Indipendente | A | high | +0.8 |
| 3 | Determined | Determinato | A | high | +0.85 |
| 4 | Self-confident | Sicuro di sé | A | high | +0.8 |
| 5 | Competitive | Competitivo | A | high | +0.9 |
| 6 | Bold | Audace | A | high | +0.85 |
| 7 | Forceful | Energico | A | high | +0.95 |
| 8 | Authoritative | Autoritario | A | high | +0.9 |
| 9 | Decisive | Deciso | A | high | +0.8 |
| 10 | Demanding | Esigente | A | high | +0.7 |
| 11 | Cooperative | Cooperativo | A | low | -0.8 |
| 12 | Agreeable | Conciliante | A | low | -0.85 |
| 13 | Accommodating | Accomodante | A | low | -0.9 |
| 14 | Supportive | Di supporto | A | low | -0.7 |
| 15 | Compliant | Compiacente | A | low | -0.95 |
| 16 | Collaborative | Collaborativo | A | low | -0.6 |
| 17 | Humble | Umile | A | low | -0.7 |
| 18 | Deferential | Deferente | A | low | -0.8 |
| 19 | Yielding | Cedevole | A | low | -0.85 |
| 20 | Diplomatic | Diplomatico | A | low | -0.5 |
| 21 | Sociable | Socievole | B | high | +0.85 |
| 22 | Persuasive | Persuasivo | B | high | +0.9 |
| 23 | Outgoing | Estroverso | B | high | +0.9 |
| 24 | Talkative | Loquace | B | high | +0.8 |
| 25 | Enthusiastic | Entusiasta | B | high | +0.85 |
| 26 | Friendly | Amichevole | B | high | +0.7 |
| 27 | Influential | Influente | B | high | +0.85 |
| 28 | Expressive | Espressivo | B | high | +0.8 |
| 29 | Convincing | Convincente | B | high | +0.9 |
| 30 | Charming | Affascinante | B | high | +0.75 |
| 31 | Empathetic | Empatico | B | high | +0.7 |
| 32 | Reserved | Riservato | B | low | -0.9 |
| 33 | Introspective | Introspettivo | B | low | -0.85 |
| 34 | Analytical | Analitico | B | low | -0.7 |
| 35 | Task-oriented | Orientato al compito | B | low | -0.8 |
| 36 | Private | Riservato/Discreto | B | low | -0.9 |
| 37 | Reflective | Riflessivo | B | low | -0.75 |
| 38 | Serious | Serio | B | low | -0.6 |
| 39 | Quiet | Silenzioso | B | low | -0.85 |
| 40 | Observant | Osservatore | B | low | -0.5 |
| 41 | Selective | Selettivo | B | low | -0.65 |
| 42 | Formal | Formale | B | low | -0.55 |
| 43 | Calm | Calmo | C | high | +0.9 |
| 44 | Patient | Paziente | C | high | +0.95 |
| 45 | Steady | Costante | C | high | +0.85 |
| 46 | Relaxed | Rilassato | C | high | +0.8 |
| 47 | Consistent | Coerente | C | high | +0.85 |
| 48 | Methodical | Metodico | C | high | +0.8 |
| 49 | Easy-going | Accomodante | C | high | +0.75 |
| 50 | Tolerant | Tollerante | C | high | +0.7 |
| 51 | Predictable | Prevedibile | C | high | +0.65 |
| 52 | Careful | Attento | C | high | +0.7 |
| 53 | Intense | Intenso | C | low | -0.9 |
| 54 | Urgent | Urgente | C | low | -0.85 |
| 55 | Fast-paced | Dal ritmo veloce | C | low | -0.8 |
| 56 | Restless | Irrequieto | C | low | -0.85 |
| 57 | Impatient | Impaziente | C | low | -0.9 |
| 58 | Dynamic | Dinamico | C | low | -0.6 |
| 59 | Driven | Motivato | C | low | -0.7 |
| 60 | Spontaneous | Spontaneo | C | low | -0.65 |
| 61 | Tense | Teso | C | low | -0.75 |
| 62 | Precise | Preciso | D | high | +0.9 |
| 63 | Strict | Rigoroso | D | high | +0.95 |
| 64 | Organized | Organizzato | D | high | +0.85 |
| 65 | Disciplined | Disciplinato | D | high | +0.9 |
| 66 | Detail-oriented | Orientato al dettaglio | D | high | +0.85 |
| 67 | Cautious | Cauto | D | high | +0.8 |
| 68 | Meticulous | Meticoloso | D | high | +0.9 |
| 69 | Vigilant | Vigile | D | high | +0.75 |
| 70 | Thorough | Scrupoloso | D | high | +0.85 |
| 71 | Rule-following | Rispettoso delle regole | D | high | +0.8 |
| 72 | Flexible | Flessibile | D | low | -0.85 |
| 73 | Impulsive | Impulsivo | D | low | -0.9 |
| 74 | Uninhibited | Disinibito | D | low | -0.85 |
| 75 | Informal | Informale | D | low | -0.8 |
| 76 | Casual | Disinvolto | D | low | -0.7 |
| 77 | Improvising | Improvvisatore | D | low | -0.75 |
| 78 | Adaptable | Adattabile | D | low | -0.6 |
| 79 | Unconventional | Anticonvenzionale | D | low | -0.8 |
| 80 | Risk-taking | Propenso al rischio | D | low | -0.7 |
| 81 | Objective | Obiettivo | E | high | +0.8 |
| 82 | Logical | Logico | E | high | +0.85 |
| 83 | Rational | Razionale | E | high | +0.8 |
| 84 | Intuitive | Intuitivo | E | low | -0.75 |
| 85 | Emotional | Emotivo | E | low | -0.8 |
| 86 | Empathic | Empatico (decisionale) | E | low | -0.7 |

### 5.2 Cognitive — Question Bank (minimo 150 domande)

Per la v1 servono almeno **3 pool** da 50 domande ciascuno (per evitare ripetizioni).

**Numerico (54 domande totali):**
- 18× Serie numeriche (6 easy, 6 medium, 6 hard)
- 18× Word problems (6 easy, 6 medium, 6 hard)
- 18× Confronto quantità (6 easy, 6 medium, 6 hard)

**Verbale (51 domande totali):**
- 18× Antonimi (6 easy, 6 medium, 6 hard)
- 18× Analogie (6 easy, 6 medium, 6 hard)
- 15× Comprensione/Sillogismi (5 easy, 5 medium, 5 hard)

**Astratto (45 domande totali):**
- 15× Sequenze figure (5 easy, 5 medium, 5 hard)
- 15× Relazioni coppie (5 easy, 5 medium, 5 hard)
- 15× Odd-one-out (5 easy, 5 medium, 5 hard)

### 5.3 Reference Profile Descriptions

Servono 17 schede complete, ciascuna con:
- Nome e icona
- Gruppo (Analytical/Social/Stabilizing/Persistent)
- Centroide fattori (A, B, C, D su scala 0-100)
- Descrizione (1 paragrafo)
- 4-5 Punti di forza
- 3-4 Aree di cautela
- Ambiente ideale
- Stile di comunicazione
- Ruoli tipici
- Come gestirli (per i manager)

---

## 6. Roadmap di sviluppo

### Fase 1 — MVP (4 settimane)

| Settimana | Deliverable |
|---|---|
| W1 | Setup progetto, schema DB, data model, content bank aggettivi (86), seed 50 domande cognitive |
| W2 | UI Behavioral Assessment (2 liste + scoring + assegnazione profilo) |
| W3 | UI Cognitive Assessment (timer, 50 domande, scoring) |
| W4 | Report finale, flow completo, testing, deploy staging |

**Scope MVP:**
- ✅ Assessment completo (behavioral + cognitive)
- ✅ Scoring automatico
- ✅ Assegnazione Reference Profile
- ✅ Report candidato
- ❌ NO admin panel
- ❌ NO job target matching
- ❌ NO team view

### Fase 2 — Admin & Job Matching (3 settimane)

- Admin dashboard
- CRUD inviti candidati
- Job Target builder (slider per ogni fattore)
- Match Score candidato vs target
- Export PDF report

### Fase 3 — Team & Management (3 settimane)

- Team view (mappa comportamentale)
- Relationship guide (come lavorano insieme 2 profili)
- Manager coaching tips per profilo
- Employee development pathways

### Fase 4 — Scale & Polish (2 settimane)

- Question bank ampliato (300+ domande cognitive)
- Multilingua completo (IT, EN, ES, DE, FR, PT)
- Integrazioni ATS (API)
- Analytics e dashboard avanzate
- Accessibility audit (WCAG 2.1 AA)

---

## 7. Considerazioni legali

> ⚠️ **IMPORTANTE**: Questo tool è ispirato al Predictive Index ma NON è il Predictive Index.

- **Non utilizzare** il nome "Predictive Index" né i nomi esatti dei 17 Reference Profile nel prodotto
- Creare **nomi originali** per gli archetipi (es. "Strategist" → "Il Visionario", "Analyzer" → "Il Ricercatore")
- L'algoritmo e i fattori (DISC-like) sono di dominio pubblico; la specifica implementazione PI è proprietaria
- La lista dei 86 aggettivi esatta è IP di PI — crearne una **equivalente ma originale**
- Includere disclaimer: "Assessment comportamentale basato su teorie psicometriche consolidate"
- Per uso commerciale: consultare un legale specializzato in proprietà intellettuale

---

## 8. Metriche di successo

| Metrica | Target |
|---|---|
| Completion rate behavioral | > 95% |
| Completion rate cognitive | > 85% |
| Tempo medio behavioral | < 8 min |
| Tempo medio cognitive | 12 min (fisso) |
| Correlazione profilo con job performance | r > 0.30 (da validare) |
| User satisfaction (candidato) | > 4.2/5 |

---

## 9. Appendice: Centroidi dei 17 Profili

```json
{
  "ANALYZER":       { "A": 55, "B": 25, "C": 25, "D": 80 },
  "CONTROLLER":     { "A": 80, "B": 20, "C": 20, "D": 80 },
  "SPECIALIST":     { "A": 50, "B": 25, "C": 60, "D": 80 },
  "STRATEGIST":     { "A": 80, "B": 50, "C": 20, "D": 75 },
  "VENTURER":       { "A": 85, "B": 25, "C": 15, "D": 25 },
  "ALTRUIST":       { "A": 30, "B": 75, "C": 55, "D": 55 },
  "CAPTAIN":        { "A": 80, "B": 80, "C": 20, "D": 30 },
  "COLLABORATOR":   { "A": 30, "B": 75, "C": 70, "D": 30 },
  "MAVERICK":       { "A": 85, "B": 80, "C": 15, "D": 20 },
  "PERSUADER":      { "A": 75, "B": 85, "C": 20, "D": 45 },
  "PROMOTER":       { "A": 50, "B": 80, "C": 25, "D": 25 },
  "ADAPTER":        { "A": 50, "B": 50, "C": 50, "D": 50 },
  "ARTISAN":        { "A": 25, "B": 20, "C": 75, "D": 80 },
  "GUARDIAN":        { "A": 20, "B": 25, "C": 80, "D": 85 },
  "OPERATOR":       { "A": 25, "B": 25, "C": 80, "D": 25 },
  "INDIVIDUALIST":  { "A": 80, "B": 20, "C": 70, "D": 80 },
  "SCHOLAR":        { "A": 75, "B": 20, "C": 50, "D": 80 }
}
```
