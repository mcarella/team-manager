# Saboteur Assessment — Developer Implementation Plan

> Documento operativo per costruire l'app di Mental Fitness Assessment.
> Tutto ciò che serve a uno sviluppatore per andare da zero a produzione.

---

## 0. TL;DR — Cosa stiamo costruendo

Un'app che in **~10 minuti** fa queste cose:

1. **Saboteur Assessment** (50 affermazioni, Likert 1-5) → identifica i tuoi top saboteur tra 10 archetipi
2. **PQ Score Assessment** (24 coppie emozioni, Likert 1-5) → misura il rapporto Sage/Saboteur (0-100)
3. **Report** → radar chart, ranking, schede saboteur, PQ gauge, Sage Powers consigliate, piano d'azione

Tutto in-browser, zero backend per la v1. Persistenza opzionale per la v2.

---

## 1. Architettura Tecnica

### 1.1 Stack — V1 (Static, Zero Backend)

```
┌─────────────────────────────┐
│         Next.js 14+         │
│  App Router + TypeScript    │
├─────────────────────────────┤
│  UI: Tailwind + Framer      │
│  Charts: Recharts / D3      │
│  State: Zustand              │
│  PDF Export: jsPDF           │
├─────────────────────────────┤
│  Deploy: Vercel (static)    │
│  Analytics: PostHog          │
└─────────────────────────────┘
```

Tutti i dati (domande, scoring, profili) sono **hardcoded nel bundle**.
I risultati restano in memory o localStorage. Nessun server, nessun DB.

### 1.2 Stack — V2 (Con persistenza + coach portal)

```
┌──────────────────────────────────────────────┐
│                  Frontend                     │
│  Next.js 14 + App Router + TypeScript         │
│  Tailwind + Framer Motion + Recharts          │
├──────────────────────────────────────────────┤
│                  Backend                      │
│  Next.js API Routes (o tRPC)                  │
│  Supabase (Auth + PostgreSQL + Realtime)      │
│  Resend (email inviti + report)               │
├──────────────────────────────────────────────┤
│                  Infra                        │
│  Vercel (frontend + API)                      │
│  Supabase (DB + Auth + Storage)               │
│  Upstash Redis (rate limiting, cache)         │
└──────────────────────────────────────────────┘
```

### 1.3 Struttura Cartelle (V1)

```
src/
├── app/
│   ├── page.tsx                    # Landing / Welcome
│   ├── assessment/
│   │   ├── saboteur/page.tsx       # Saboteur assessment flow
│   │   ├── pq-score/page.tsx       # PQ score assessment flow
│   │   └── results/page.tsx        # Full results page
│   └── layout.tsx
├── components/
│   ├── assessment/
│   │   ├── LikertScale.tsx         # Riusabile: scala 1-5
│   │   ├── QuestionCard.tsx        # Card singola domanda
│   │   ├── ProgressBar.tsx         # Barra progresso
│   │   ├── EmotionPair.tsx         # Coppia emozioni PQ
│   │   └── QuestionNav.tsx         # Navigazione tra domande
│   ├── results/
│   │   ├── RadarChart.tsx          # Radar 10 saboteur
│   │   ├── PQGauge.tsx             # Gauge semicircolare
│   │   ├── SaboteurCard.tsx        # Card dettaglio saboteur
│   │   ├── SagePowerCard.tsx       # Card sage power
│   │   ├── FactorBarChart.tsx      # Barre orizzontali
│   │   └── ActionPlan.tsx          # Piano d'azione
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── data/
│   ├── saboteurs.ts                # 10 profili saboteur completi
│   ├── sage-powers.ts              # 5 sage powers
│   ├── questions-saboteur.ts       # 50 domande
│   ├── questions-pq.ts             # 24 coppie emozioni
│   └── scoring.ts                  # Costanti di scoring
├── lib/
│   ├── scoring-engine.ts           # Algoritmi di calcolo
│   ├── profile-matcher.ts          # Assegnazione profili
│   └── report-generator.ts         # Generazione PDF
├── store/
│   └── assessment-store.ts         # Zustand store
└── types/
    └── index.ts                    # TypeScript types
```

---

## 2. Data Model Completo

### 2.1 Types

```typescript
// ── types/index.ts ──

// Saboteur identifiers
export type SaboteurId = 
  | 'judge' | 'stickler' | 'pleaser' | 'hyper_achiever'
  | 'victim' | 'hyper_rational' | 'hyper_vigilant'
  | 'restless' | 'controller' | 'avoider';

// Sage Power identifiers
export type SagePowerId = 
  | 'empathize' | 'explore' | 'innovate' | 'navigate' | 'activate';

// Likert scale value
export type LikertValue = 1 | 2 | 3 | 4 | 5;

// ── Saboteur Question ──
export interface SaboteurQuestion {
  id: string;               // "sab_j01"
  saboteurId: SaboteurId;   // "judge"
  text: string;             // Affermazione in italiano
  text_en?: string;         // Opzionale: versione inglese
  reverseScored: boolean;   // Se true: score = 6 - answer
  weight: number;           // 1.0 default, 0.8-1.2 per bilanciamento
}

// ── PQ Emotion Pair ──
export interface PQEmotionPair {
  id: string;               // "pq_01"
  positive: string;         // "Calma, serenità"
  negative: string;         // "Ansia, preoccupazione"
  category?: string;        // "emotional_regulation" | "social" | "purpose"
}

// ── Saboteur Profile (static data) ──
export interface SaboteurProfile {
  id: SaboteurId;
  name: string;             // "Il Giudice"
  originalName: string;     // "Judge"
  icon: string;             // Emoji
  color: string;            // Hex color
  isUniversal: boolean;     // true solo per Judge
  description: string;
  thoughts: string[];       // 3-5 pensieri tipici
  feelings: string[];       // 3-5 emozioni generate
  justificationLie: string; // La bugia che racconta
  originalStrength: string; // La forza che nasconde
  sageAntidotes: SagePowerId[];  // 2 sage powers antidoto
  survivalOrigin: string;   // Come si è formato nell'infanzia
  interceptTip: string;     // Consiglio pratico per intercettarlo
}

// ── Sage Power (static data) ──
export interface SagePower {
  id: SagePowerId;
  name: string;
  icon: string;
  color: string;
  description: string;
  howToUse: string;
  countersSaboteurs: SaboteurId[];
  dailyExercise: string;    // Esercizio quotidiano
}

// ── Assessment State ──
export interface AssessmentState {
  // Saboteur assessment
  saboteurAnswers: Record<number, LikertValue>;  // questionIndex → answer
  saboteurCurrentIndex: number;
  saboteurCompleted: boolean;
  
  // PQ assessment
  pqAnswers: Record<number, { pos: LikertValue; neg: LikertValue }>;
  pqCurrentIndex: number;
  pqCompleted: boolean;
  
  // Results
  results: AssessmentResults | null;
}

// ── Computed Results ──
export interface AssessmentResults {
  // Saboteur scores (0-10 each)
  saboteurScores: Record<SaboteurId, number>;
  
  // Ranked saboteurs (highest first)
  rankedSaboteurs: Array<{
    id: SaboteurId;
    score: number;
    rank: number;
  }>;
  
  // Top 3 saboteurs
  topSaboteurs: SaboteurId[];
  
  // PQ Score (0-100)
  pqScore: number;
  pqInterpretation: PQInterpretation;
  
  // Recommended Sage Powers
  recommendedSagePowers: SagePowerId[];
  
  // Action plan items
  actionPlan: ActionPlanItem[];
  
  // Metadata
  completedAt: string;     // ISO timestamp
  durationSeconds: number;
}

export interface PQInterpretation {
  level: 'critical' | 'mixed' | 'good' | 'excellent' | 'mastery';
  label: string;
  description: string;
  color: string;
}

export interface ActionPlanItem {
  priority: number;
  saboteurId: SaboteurId;
  sagePowerId: SagePowerId;
  title: string;
  action: string;
  dailyPractice: string;
}
```

### 2.2 Zustand Store

```typescript
// ── store/assessment-store.ts ──

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store extends AssessmentState {
  // Actions - Saboteur
  setSaboteurAnswer: (index: number, value: LikertValue) => void;
  nextSaboteurQuestion: () => void;
  prevSaboteurQuestion: () => void;
  goToSaboteurQuestion: (index: number) => void;
  completeSaboteur: () => void;
  
  // Actions - PQ
  setPQPositive: (index: number, value: LikertValue) => void;
  setPQNegative: (index: number, value: LikertValue) => void;
  nextPQPair: () => void;
  prevPQPair: () => void;
  completePQ: () => void;
  
  // Actions - Results
  computeResults: () => void;
  
  // Actions - Reset
  resetAll: () => void;
  
  // Computed
  saboteurProgress: () => number;  // 0-100
  pqProgress: () => number;        // 0-100
  canProceedToResults: () => boolean;
}
```

---

## 3. Question Bank Completo

### 3.1 Saboteur Assessment — 50 Affermazioni

Scala: 1 = Per niente vero → 5 = Molto vero per me

```typescript
// ── data/questions-saboteur.ts ──

export const SABOTEUR_QUESTIONS: SaboteurQuestion[] = [
  // ═══ JUDGE (8 item) ═══
  // Judge-Self (3)
  { id:"sab_j01", saboteurId:"judge", text:"Mi critico spesso per i miei errori, anche quelli piccoli.", reverseScored:false, weight:1.0 },
  { id:"sab_j02", saboteurId:"judge", text:"Sono raramente soddisfatto/a dei miei risultati, anche quando gli altri li apprezzano.", reverseScored:false, weight:1.0 },
  { id:"sab_j03", saboteurId:"judge", text:"Mi rimprovero per cose successe anche molto tempo fa.", reverseScored:false, weight:0.9 },
  // Judge-Others (3)
  { id:"sab_j04", saboteurId:"judge", text:"Tendo a focalizzarmi su ciò che non va nelle persone piuttosto che sui loro pregi.", reverseScored:false, weight:1.0 },
  { id:"sab_j05", saboteurId:"judge", text:"Giudico spesso le scelte degli altri come inferiori alle mie.", reverseScored:false, weight:1.0 },
  { id:"sab_j06", saboteurId:"judge", text:"Quando qualcosa va storto, la mia prima reazione è cercare di chi è la colpa.", reverseScored:false, weight:0.9 },
  // Judge-Circumstances (2)
  { id:"sab_j07", saboteurId:"judge", text:"Mi sveglio spesso di notte preoccupandomi di cose che potrebbero andare male.", reverseScored:false, weight:1.0 },
  { id:"sab_j08", saboteurId:"judge", text:"Quando qualcosa non funziona, fatico a vederci qualcosa di positivo o un'opportunità.", reverseScored:false, weight:1.0 },

  // ═══ STICKLER (5 item) ═══
  { id:"sab_s01", saboteurId:"stickler", text:"Mi frustra profondamente quando le cose non sono fatte nel modo 'giusto'.", reverseScored:false, weight:1.0 },
  { id:"sab_s02", saboteurId:"stickler", text:"Dedico più tempo del necessario a perfezionare dettagli che altri non noterebbero.", reverseScored:false, weight:1.0 },
  { id:"sab_s03", saboteurId:"stickler", text:"Mi irrito quando gli altri non mantengono i miei stessi standard di qualità.", reverseScored:false, weight:1.0 },
  { id:"sab_s04", saboteurId:"stickler", text:"Preferisco rifare qualcosa io piuttosto che accettare un lavoro imperfetto di un collega.", reverseScored:false, weight:0.9 },
  { id:"sab_s05", saboteurId:"stickler", text:"L'idea di 'abbastanza buono' mi mette a disagio — le cose devono essere fatte bene o non fatte.", reverseScored:false, weight:1.1 },

  // ═══ PLEASER (5 item) ═══
  { id:"sab_p01", saboteurId:"pleaser", text:"Mi è molto difficile dire 'no' alle richieste degli altri, anche quando sono sovraccarico/a.", reverseScored:false, weight:1.0 },
  { id:"sab_p02", saboteurId:"pleaser", text:"Tendo a mettere i bisogni degli altri prima dei miei, quasi automaticamente.", reverseScored:false, weight:1.0 },
  { id:"sab_p03", saboteurId:"pleaser", text:"Mi sento ferito/a o risentito/a quando gli altri non riconoscono quanto faccio per loro.", reverseScored:false, weight:1.0 },
  { id:"sab_p04", saboteurId:"pleaser", text:"Cerco di guadagnare l'affetto delle persone attraverso l'aiuto e la disponibilità costante.", reverseScored:false, weight:1.0 },
  { id:"sab_p05", saboteurId:"pleaser", text:"Mi sento in colpa quando dedico tempo esclusivamente a me stesso/a.", reverseScored:false, weight:0.9 },

  // ═══ HYPER-ACHIEVER (5 item) ═══
  { id:"sab_ha01", saboteurId:"hyper_achiever", text:"La mia autostima dipende fortemente dai miei risultati professionali.", reverseScored:false, weight:1.0 },
  { id:"sab_ha02", saboteurId:"hyper_achiever", text:"Dopo un successo, passo rapidamente al prossimo obiettivo senza concedermi di festeggiare.", reverseScored:false, weight:1.0 },
  { id:"sab_ha03", saboteurId:"hyper_achiever", text:"Mi sento a disagio o in colpa quando non sto facendo qualcosa di 'produttivo'.", reverseScored:false, weight:1.0 },
  { id:"sab_ha04", saboteurId:"hyper_achiever", text:"Tendo a valutare il valore delle persone (incluso il mio) in base ai loro risultati.", reverseScored:false, weight:0.9 },
  { id:"sab_ha05", saboteurId:"hyper_achiever", text:"Ho paura che senza successi costanti e visibili, le persone mi rispetterebbero meno.", reverseScored:false, weight:1.1 },

  // ═══ VICTIM (4 item) ═══
  { id:"sab_v01", saboteurId:"victim", text:"Sento spesso che le cose brutte capitano proprio a me più che agli altri.", reverseScored:false, weight:1.0 },
  { id:"sab_v02", saboteurId:"victim", text:"A volte mi concentro sui miei problemi in modo che gli altri mi mostrino simpatia e comprensione.", reverseScored:false, weight:1.0 },
  { id:"sab_v03", saboteurId:"victim", text:"Mi sento impotente di fronte alle circostanze della mia vita, come se non potessi cambiarle.", reverseScored:false, weight:1.1 },
  { id:"sab_v04", saboteurId:"victim", text:"Tendo a lamentarmi di come le cose non siano giuste nei miei confronti.", reverseScored:false, weight:1.0 },

  // ═══ HYPER-RATIONAL (4 item) ═══
  { id:"sab_hr01", saboteurId:"hyper_rational", text:"Tendo a processare tutto attraverso la logica e l'analisi, incluse le relazioni personali.", reverseScored:false, weight:1.0 },
  { id:"sab_hr02", saboteurId:"hyper_rational", text:"Mi impazientisco quando le persone si lasciano guidare dalle emozioni invece che dai fatti.", reverseScored:false, weight:1.0 },
  { id:"sab_hr03", saboteurId:"hyper_rational", text:"Preferisco analizzare un problema piuttosto che parlare di come mi fa sentire.", reverseScored:false, weight:1.0 },
  { id:"sab_hr04", saboteurId:"hyper_rational", text:"Altre persone mi hanno detto che a volte sembro freddo/a o emotivamente distaccato/a.", reverseScored:false, weight:1.1 },

  // ═══ HYPER-VIGILANT (5 item) ═══
  { id:"sab_hv01", saboteurId:"hyper_vigilant", text:"Mi preoccupo costantemente di cosa potrebbe andare storto, anche quando le cose vanno bene.", reverseScored:false, weight:1.0 },
  { id:"sab_hv02", saboteurId:"hyper_vigilant", text:"Faccio fatica a fidarmi delle reali intenzioni degli altri.", reverseScored:false, weight:1.0 },
  { id:"sab_hv03", saboteurId:"hyper_vigilant", text:"Cerco rassicurazione nelle regole, nelle procedure e nelle figure di autorità.", reverseScored:false, weight:0.9 },
  { id:"sab_hv04", saboteurId:"hyper_vigilant", text:"Quando le cose vanno bene, dentro di me aspetto che succeda qualcosa di brutto.", reverseScored:false, weight:1.1 },
  { id:"sab_hv05", saboteurId:"hyper_vigilant", text:"Sono spesso cinico/a o scettico/a riguardo alle motivazioni delle persone.", reverseScored:false, weight:1.0 },

  // ═══ RESTLESS (4 item) ═══
  { id:"sab_r01", saboteurId:"restless", text:"Mi annoio facilmente e cerco costantemente nuovi stimoli o attività.", reverseScored:false, weight:1.0 },
  { id:"sab_r02", saboteurId:"restless", text:"Ho difficoltà a stare fermo/a e a godermi il momento presente.", reverseScored:false, weight:1.0 },
  { id:"sab_r03", saboteurId:"restless", text:"Mi distraggo facilmente e tendo a saltare da un'attività all'altra senza completarle.", reverseScored:false, weight:1.0 },
  { id:"sab_r04", saboteurId:"restless", text:"Ho paura di perdere esperienze o opportunità (FOMO).", reverseScored:false, weight:1.0 },

  // ═══ CONTROLLER (5 item) ═══
  { id:"sab_c01", saboteurId:"controller", text:"Sento un bisogno forte di avere il controllo su situazioni e persone intorno a me.", reverseScored:false, weight:1.0 },
  { id:"sab_c02", saboteurId:"controller", text:"Provo ansia intensa quando non posso influenzare o determinare il risultato di qualcosa.", reverseScored:false, weight:1.0 },
  { id:"sab_c03", saboteurId:"controller", text:"Tendo a dire agli altri cosa fare e come farlo, anche quando non richiesto.", reverseScored:false, weight:1.0 },
  { id:"sab_c04", saboteurId:"controller", text:"Mi è molto difficile delegare perché penso che io lo farei meglio.", reverseScored:false, weight:0.9 },
  { id:"sab_c05", saboteurId:"controller", text:"Quando non sono al comando o non ho voce in capitolo, mi sento irrequieto/a e ansioso/a.", reverseScored:false, weight:1.0 },

  // ═══ AVOIDER (5 item) ═══
  { id:"sab_a01", saboteurId:"avoider", text:"Tendo a rimandare conversazioni difficili o scomode, sperando che si risolvano da sole.", reverseScored:false, weight:1.0 },
  { id:"sab_a02", saboteurId:"avoider", text:"Preferisco concentrarmi sugli aspetti positivi di una situazione piuttosto che affrontare i problemi reali.", reverseScored:false, weight:1.0 },
  { id:"sab_a03", saboteurId:"avoider", text:"Ho difficoltà ad affrontare conflitti direttamente — preferisco evitarli.", reverseScored:false, weight:1.0 },
  { id:"sab_a04", saboteurId:"avoider", text:"Quando sono stressato/a, mi rifugio in routine confortanti o attività piacevoli invece di affrontare la causa.", reverseScored:false, weight:0.9 },
  { id:"sab_a05", saboteurId:"avoider", text:"Dico spesso 'va tutto bene' anche quando non è affatto vero.", reverseScored:false, weight:1.1 },
];
```

### 3.2 PQ Score Assessment — 24 Coppie

```typescript
// ── data/questions-pq.ts ──

export const PQ_EMOTION_PAIRS: PQEmotionPair[] = [
  { id:"pq01", positive:"Calma, serenità", negative:"Ansia, preoccupazione", category:"regulation" },
  { id:"pq02", positive:"Gioia, entusiasmo", negative:"Tristezza, abbattimento", category:"mood" },
  { id:"pq03", positive:"Curiosità, apertura mentale", negative:"Cinismo, chiusura mentale", category:"openness" },
  { id:"pq04", positive:"Compassione, empatia", negative:"Giudizio, critica severa", category:"social" },
  { id:"pq05", positive:"Gratitudine, apprezzamento", negative:"Risentimento, invidia", category:"gratitude" },
  { id:"pq06", positive:"Fiducia, ottimismo", negative:"Paura, pessimismo", category:"outlook" },
  { id:"pq07", positive:"Senso di scopo, significato", negative:"Vuoto, mancanza di senso", category:"purpose" },
  { id:"pq08", positive:"Creatività, ispirazione", negative:"Blocco mentale, stagnazione", category:"creativity" },
  { id:"pq09", positive:"Energia, vitalità", negative:"Esaurimento, stanchezza cronica", category:"energy" },
  { id:"pq10", positive:"Connessione, senso di appartenenza", negative:"Isolamento, solitudine", category:"social" },
  { id:"pq11", positive:"Accettazione, pace interiore", negative:"Frustrazione, irritazione", category:"regulation" },
  { id:"pq12", positive:"Determinazione, chiarezza", negative:"Confusione, indecisione", category:"agency" },
  { id:"pq13", positive:"Giocosità, leggerezza", negative:"Pesantezza, serietà eccessiva", category:"mood" },
  { id:"pq14", positive:"Coraggio, fiducia in sé", negative:"Insicurezza, dubbio su di sé", category:"confidence" },
  { id:"pq15", positive:"Generosità, apertura verso altri", negative:"Chiusura, difensività", category:"social" },
  { id:"pq16", positive:"Meraviglia, stupore", negative:"Noia, apatia", category:"openness" },
  { id:"pq17", positive:"Pazienza, tolleranza", negative:"Impazienza, agitazione", category:"regulation" },
  { id:"pq18", positive:"Presenza, mindfulness", negative:"Distrazione, ruminazione", category:"awareness" },
  { id:"pq19", positive:"Autenticità, libertà espressiva", negative:"Costrizione, portare una maschera", category:"identity" },
  { id:"pq20", positive:"Soddisfazione, appagamento", negative:"Insoddisfazione cronica", category:"contentment" },
  { id:"pq21", positive:"Perdono, capacità di lasciar andare", negative:"Rancore, senso di colpa", category:"regulation" },
  { id:"pq22", positive:"Equilibrio, armonia interiore", negative:"Caos, sopraffazione", category:"balance" },
  { id:"pq23", positive:"Speranza, senso di possibilità", negative:"Disperazione, senso di impotenza", category:"outlook" },
  { id:"pq24", positive:"Amore, tenerezza", negative:"Rabbia, ostilità", category:"emotion" },
];
```

---

## 4. Algoritmo di Scoring — Implementazione

```typescript
// ── lib/scoring-engine.ts ──

import { SABOTEUR_QUESTIONS } from '@/data/questions-saboteur';
import { PQ_EMOTION_PAIRS } from '@/data/questions-pq';
import { SABOTEUR_PROFILES } from '@/data/saboteurs';
import { SAGE_POWERS_DATA } from '@/data/sage-powers';

// ══════════════════════════════════════
// STEP 1: Saboteur Raw Scoring
// ══════════════════════════════════════

export function computeSaboteurScores(
  answers: Record<number, LikertValue>,
  questions: SaboteurQuestion[]
): Record<SaboteurId, number> {
  
  // Accumulate weighted scores per saboteur
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  
  ALL_SABOTEUR_IDS.forEach(id => { sums[id] = 0; counts[id] = 0; });
  
  questions.forEach((q, index) => {
    const rawAnswer = answers[index];
    if (rawAnswer === undefined) return;
    
    // Reverse scoring if needed
    const answer = q.reverseScored ? (6 - rawAnswer) : rawAnswer;
    
    // Apply weight
    sums[q.saboteurId] += answer * q.weight;
    counts[q.saboteurId] += q.weight;  // weighted count
  });
  
  // Normalize to 0-10 scale
  const scores: Record<SaboteurId, number> = {} as any;
  ALL_SABOTEUR_IDS.forEach(id => {
    if (counts[id] === 0) {
      scores[id] = 0;
    } else {
      const mean = sums[id] / counts[id];  // 1-5 range
      scores[id] = ((mean - 1) / 4) * 10;  // 0-10 range
      scores[id] = Math.round(scores[id] * 10) / 10;  // 1 decimal
    }
  });
  
  return scores;
}

// ══════════════════════════════════════
// STEP 2: PQ Score Computation
// ══════════════════════════════════════

export function computePQScore(
  answers: Record<number, { pos: LikertValue; neg: LikertValue }>
): number {
  let totalPos = 0;
  let totalNeg = 0;
  let answeredPairs = 0;
  
  PQ_EMOTION_PAIRS.forEach((_, index) => {
    const pair = answers[index];
    if (pair?.pos && pair?.neg) {
      totalPos += pair.pos;
      totalNeg += pair.neg;
      answeredPairs++;
    }
  });
  
  if (answeredPairs === 0) return 50;  // default
  
  // PQ = positive / (positive + negative) × 100
  const raw = (totalPos / (totalPos + totalNeg)) * 100;
  return Math.round(raw);
}

// ══════════════════════════════════════
// STEP 3: PQ Interpretation
// ══════════════════════════════════════

export function interpretPQ(score: number): PQInterpretation {
  if (score >= 85) return {
    level: 'mastery',
    label: 'Mental fitness eccellente',
    description: 'Il tuo Sage è solidamente al comando. Hai una rara capacità di rispondere alle sfide con calma, chiarezza e positività. Continua a praticare per mantenere questo livello.',
    color: '#059669'
  };
  if (score >= 75) return {
    level: 'excellent',
    label: 'Sopra il tipping point',
    description: 'Hai superato la soglia critica di 75! Il tuo Sage opera per la maggior parte del tempo. I saboteur ci sono ancora ma non dominano più. Stai raccogliendo i frutti della tua mental fitness.',
    color: '#10b981'
  };
  if (score >= 65) return {
    level: 'good',
    label: 'Quasi al tipping point',
    description: 'Sei vicino alla soglia dei 75. Il Sage si fa sentire ma i saboteur interferiscono ancora in momenti cruciali. Con pratica costante puoi raggiungere il tipping point in poche settimane.',
    color: '#f59e0b'
  };
  if (score >= 50) return {
    level: 'mixed',
    label: 'Zona mista',
    description: 'I tuoi saboteur e il tuo Sage si contendono il controllo quasi alla pari. Nei momenti di stress, i saboteur prendono il sopravvento. C\'è un enorme potenziale di miglioramento.',
    color: '#f97316'
  };
  return {
    level: 'critical',
    label: 'I saboteur dominano',
    description: 'I tuoi saboteur controllano la maggior parte delle tue reazioni. Questo non è un giudizio — è il punto di partenza. La buona notizia è che il margine di miglioramento è enorme e i primi risultati arrivano in settimane.',
    color: '#ef4444'
  };
}

// ══════════════════════════════════════
// STEP 4: Rank & Select Top Saboteurs
// ══════════════════════════════════════

export function rankSaboteurs(
  scores: Record<SaboteurId, number>
): Array<{ id: SaboteurId; score: number; rank: number }> {
  return Object.entries(scores)
    .map(([id, score]) => ({ id: id as SaboteurId, score }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// ══════════════════════════════════════
// STEP 5: Sage Power Recommendations
// ══════════════════════════════════════

export function recommendSagePowers(
  topSaboteurs: SaboteurId[]
): SagePowerId[] {
  // Collect sage antidotes from top saboteurs, score by frequency
  const powerScores: Record<string, number> = {};
  
  topSaboteurs.forEach((sabId, index) => {
    const profile = SABOTEUR_PROFILES.find(s => s.id === sabId);
    if (!profile) return;
    
    const weight = 3 - index;  // top1 = 3pts, top2 = 2pts, top3 = 1pt
    profile.sageAntidotes.forEach(powerId => {
      powerScores[powerId] = (powerScores[powerId] || 0) + weight;
    });
  });
  
  // Return top 3 by score
  return Object.entries(powerScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id as SagePowerId);
}

// ══════════════════════════════════════
// STEP 6: Action Plan Generation
// ══════════════════════════════════════

export function generateActionPlan(
  topSaboteurs: SaboteurId[],
  sagePowers: SagePowerId[]
): ActionPlanItem[] {
  return topSaboteurs.slice(0, 3).map((sabId, index) => {
    const sab = SABOTEUR_PROFILES.find(s => s.id === sabId)!;
    const bestSage = sab.sageAntidotes[0];
    const sage = SAGE_POWERS_DATA.find(s => s.id === bestSage)!;
    
    return {
      priority: index + 1,
      saboteurId: sabId,
      sagePowerId: bestSage,
      title: `Intercetta ${sab.name}`,
      action: `Quando senti la voce di ${sab.name} ("${sab.thoughts[0]}"), fermati e attiva ${sage.name}.`,
      dailyPractice: sage.dailyExercise,
    };
  });
}

// ══════════════════════════════════════
// STEP 7: Full Results Assembly
// ══════════════════════════════════════

export function computeFullResults(
  sabAnswers: Record<number, LikertValue>,
  pqAnswers: Record<number, { pos: LikertValue; neg: LikertValue }>,
  startTime: number
): AssessmentResults {
  
  const saboteurScores = computeSaboteurScores(sabAnswers, SABOTEUR_QUESTIONS);
  const rankedSaboteurs = rankSaboteurs(saboteurScores);
  const topSaboteurs = rankedSaboteurs.slice(0, 3).map(s => s.id);
  
  const pqScore = computePQScore(pqAnswers);
  const pqInterpretation = interpretPQ(pqScore);
  
  const recommendedSagePowers = recommendSagePowers(topSaboteurs);
  const actionPlan = generateActionPlan(topSaboteurs, recommendedSagePowers);
  
  return {
    saboteurScores,
    rankedSaboteurs,
    topSaboteurs,
    pqScore,
    pqInterpretation,
    recommendedSagePowers,
    actionPlan,
    completedAt: new Date().toISOString(),
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
  };
}
```

---

## 5. Scoring Validation & Edge Cases

### 5.1 Validazione Input

```typescript
// Regole di validazione:

// Saboteur Assessment
const SABOTEUR_VALIDATION = {
  minAnsweredPercent: 80,    // Almeno 80% delle domande (40/50)
  minPerSaboteur: 2,         // Almeno 2 risposte per ogni saboteur
  validRange: [1, 5],        // Solo valori 1-5
  maxTimeSeconds: 1800,      // Flag se > 30 min (risposte non spontanee)
  minTimeSeconds: 60,        // Flag se < 1 min (risposte random)
};

// PQ Assessment
const PQ_VALIDATION = {
  minAnsweredPercent: 75,    // Almeno 75% delle coppie (18/24)
  validRange: [1, 5],
  requireBothEmotions: true, // Ogni coppia deve avere sia pos che neg
};

// Se il candidato non raggiunge i minimi:
// → Mostra avviso "Risultati parziali - alcune domande senza risposta"
// → Calcola comunque ma con disclaimer
// → NON bloccare: l'UX deve essere sempre positiva
```

### 5.2 Edge Cases

```
1. Tutte le risposte uguali (es. tutto 3)
   → Tutti i saboteur a 5.0/10
   → Avviso: "I tuoi punteggi sono molto uniformi. 
      Per risultati più accurati, rispondi pensando a situazioni specifiche."

2. Score Judge molto basso (< 2/10)
   → Statisticamente improbabile (ricerca: media Judge = 5.8)
   → Non bloccare, ma il report può menzionare:
      "Il tuo Judge è insolitamente basso. Questo potrebbe indicare 
       un alto livello di consapevolezza o un Avoider molto attivo."

3. PQ Score estremo (> 95 o < 15)
   → Possibile ma raro
   → PQ > 95: "Risultato eccezionale! Se vuoi validare, 
      ripeti l'assessment tra 1 settimana."
   → PQ < 15: "Il tuo PQ è molto basso. Non è un giudizio, 
      è un punto di partenza con enorme potenziale."

4. Candidato abbandona a metà
   → Salva in localStorage comunque
   → Al ritorno: "Vuoi continuare da dove eri rimasto?"
   → Dopo 7 giorni: auto-cancella

5. Tutti i saboteur molto alti (media > 7)
   → Persona probabilmente in fase di stress
   → Report aggiunge: "I tuoi saboteur sono tutti molto attivi. 
      Questo è comune in periodi di forte stress."
```

---

## 6. UI/UX Specification

### 6.1 Design System

```css
/* ── Palette ── */
--bg:       #faf9f7;
--surface:  #ffffff;
--surface2: #f3f1ee;
--border:   #e5e2dc;
--text:     #1a1a1a;
--muted:    #6b6560;
--dimmed:   #9c9590;

/* ── Saboteur Colors ── */
--judge:          #dc2626;
--stickler:       #7c3aed;
--pleaser:        #ec4899;
--hyper-achiever: #f59e0b;
--victim:         #6366f1;
--hyper-rational: #06b6d4;
--hyper-vigilant: #84cc16;
--restless:       #f97316;
--controller:     #ef4444;
--avoider:        #10b981;

/* ── Sage Colors ── */
--sage:           #10b981;
--empathize:      #ec4899;
--explore:        #06b6d4;
--innovate:       #7c3aed;
--navigate:       #10b981;
--activate:       #f59e0b;

/* ── PQ Zones ── */
--pq-critical:    #ef4444;   /* < 50 */
--pq-mixed:       #f97316;   /* 50-64 */
--pq-good:        #f59e0b;   /* 65-74 */
--pq-excellent:   #10b981;   /* 75-84 */
--pq-mastery:     #059669;   /* 85+ */

/* ── Typography ── */
--font-display: 'DM Sans', system-ui, sans-serif;
--font-mono:    'DM Mono', 'JetBrains Mono', monospace;

/* ── Spacing ── */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

### 6.2 Componente Likert Scale

```
┌──────────────────────────────────────────┐
│ "Mi critico spesso per i miei errori"    │
│                                          │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │         │
│  │Per│ │Po │ │Ab │ │Mo │ │To │         │
│  │nie│ │co │ │bas│ │lto│ │tal│         │
│  │nte│ │   │ │tan│ │   │ │men│         │
│  │   │ │   │ │za │ │   │ │te │         │
│  └───┘ └───┘ └───┘ └───┘ └───┘         │
│                                          │
│ Colore:                                  │
│ 1=verde  2=lime  3=amber  4=orange  5=red│
│                                          │
│ Interazione:                             │
│ - Tap/click seleziona                    │
│ - Border accent su selected              │
│ - Sfondo tinted su selected              │
│ - Keyboard: 1-5 per risposta rapida      │
│ - Auto-advance dopo 300ms                │
└──────────────────────────────────────────┘
```

### 6.3 Flow Screens

```
SCREEN 1: Welcome
├── Hero: "Scopri i tuoi saboteur interiori"
├── 2 card: Saboteur Assessment + PQ Score
├── Tempo stimato: ~10 minuti
└── CTA: "Inizia Assessment"

SCREEN 2: Istruzioni Saboteur
├── "Ti presenteremo 50 affermazioni"
├── "Rispondi con il primo istinto, non pensarci troppo"
├── Visual: scala Likert di esempio
└── CTA: "Inizia"

SCREEN 3: Saboteur Assessment (loop × 50)
├── Progress bar (risposte/totale)
├── Numero domanda (es. "12 di 50")
├── Testo affermazione (font grande, centrato)
├── Likert 5 bottoni
├── Navigation: ← Indietro | Avanti →
├── Quick nav: griglia numerata in basso
├── Istruzione: "Rispondi velocemente"
└── Keyboard shortcut: 1-5

SCREEN 4: Transizione → PQ
├── "Saboteur Assessment completato!"
├── Spiegazione PQ: "Ora misuriamo il tuo PQ Score"
├── Regole: 24 coppie, valuta ciascuna emozione
└── CTA: "Inizia PQ Assessment"

SCREEN 5: PQ Assessment (loop × 24)
├── Progress bar
├── Numero coppia
├── DUE scale Likert:
│   ├── ☀️ [Emozione positiva] → scala 1-5 (verde)
│   └── 🌧️ [Emozione negativa] → scala 1-5 (rosso)
├── Navigation
└── Auto-advance quando entrambe sono compilate

SCREEN 6: Loading Results
├── Animazione: "Analizzando le tue risposte..."
├── Micro-step: "Calcolando saboteur..." → "Misurando PQ..." → "Generando report..."
└── 2-3 secondi (artificiale per effetto)

SCREEN 7: Results - Overview
├── PQ Gauge (grande, centrale)
├── Top 3 Saboteur (card con score)
├── Sage Powers consigliate
└── CTA: "Esplora il report completo"

SCREEN 8: Results - Dettaglio
├── TAB 1: Saboteur
│   ├── Radar chart 10 saboteur
│   ├── Ranking completo con barre
│   └── Card espandibili per top 3
├── TAB 2: PQ Score
│   ├── Gauge + interpretazione
│   ├── Benchmark per età
│   └── Trend (se assessment ripetuto)
├── TAB 3: Sage Powers
│   ├── 3 powers consigliate con dettaglio
│   └── Come usarle contro i tuoi top saboteur
├── TAB 4: Piano d'Azione
│   ├── 3 azioni prioritarie
│   ├── Esercizi quotidiani
│   └── "I prossimi 7 giorni"
└── CTA: "Scarica PDF" | "Condividi" | "Rifai tra 1 mese"
```

---

## 7. Report PDF Export

```typescript
// Contenuto del PDF generato:

Page 1: Copertina
  - Nome utente
  - Data assessment
  - PQ Score grande
  - Top 3 saboteur con icone

Page 2: Mappa Saboteur
  - Radar chart 10 saboteur
  - Tabella ranking completa
  - Nota su quanti sono sopra/sotto la media

Page 3-5: Top 3 Saboteur (1 pagina ciascuno)
  - Score e barra visuale
  - Descrizione completa
  - Pensieri tipici
  - Emozioni generate
  - Bugia giustificativa
  - Forza originaria
  - Sage Power antidoto
  - Consiglio pratico personalizzato

Page 6: PQ Score
  - Gauge visuale
  - Interpretazione
  - Benchmark per età
  - Cosa significa per te

Page 7: Sage Powers
  - 3 powers raccomandate
  - Come usarle
  - Esercizi quotidiani

Page 8: Piano d'Azione — I tuoi primi 7 giorni
  - 3 azioni prioritarie
  - Tracking giornaliero
  - "Rifai l'assessment tra 4-6 settimane"
```

---

## 8. API Design (V2)

### 8.1 Endpoints

```
POST   /api/assessments              # Crea nuovo assessment
GET    /api/assessments/:id          # Recupera assessment
PATCH  /api/assessments/:id          # Aggiorna risposte (partial)
POST   /api/assessments/:id/complete # Calcola risultati finali

GET    /api/results/:id              # Recupera risultati
GET    /api/results/:id/pdf          # Genera e scarica PDF

POST   /api/invites                  # Coach invia invito
GET    /api/invites/:token           # Candidato accede via token

GET    /api/coach/clients             # Lista clienti del coach
GET    /api/coach/clients/:id/history # Storico assessment di un cliente
GET    /api/coach/team/:id/map        # Mappa saboteur del team
```

### 8.2 Supabase Schema (V2)

```sql
-- Users & Auth (managed by Supabase Auth)

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('individual', 'coach', 'admin')),
  coach_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  saboteur_answers JSONB DEFAULT '{}',
  pq_answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) UNIQUE NOT NULL,
  saboteur_scores JSONB NOT NULL,    -- {"judge": 7.8, "stickler": 5.2, ...}
  ranked_saboteurs JSONB NOT NULL,   -- [{"id":"judge","score":7.8,"rank":1}, ...]
  top_saboteurs TEXT[] NOT NULL,     -- ["judge", "pleaser", "hyper_achiever"]
  pq_score INTEGER NOT NULL,
  pq_interpretation JSONB NOT NULL,
  recommended_sage_powers TEXT[] NOT NULL,
  action_plan JSONB NOT NULL,
  duration_seconds INTEGER,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- RLS policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches see client assessments" ON assessments
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
  );
```

---

## 9. Roadmap Dettagliata

### Fase 1 — MVP Static (3 settimane)

| Giorno | Task | Output |
|---|---|---|
| D1-D2 | Setup progetto, types, data files | `/src/types`, `/src/data` |
| D3-D4 | Zustand store + scoring engine | `scoring-engine.ts` + tests |
| D5-D6 | Componenti UI: LikertScale, QuestionCard, ProgressBar | Storybook ready |
| D7-D8 | Screen: Welcome + Istruzioni | Navigazione base |
| D9-D10 | Screen: Saboteur Assessment (50 domande) | Flow completo con nav |
| D11-D12 | Screen: PQ Assessment (24 coppie) | Flow completo con nav |
| D13-D14 | Scoring engine integration + results computation | End-to-end funzionante |
| D15-D16 | Screen: Results Overview (radar, gauge, top 3) | Visualizzazioni |
| D17-D18 | Screen: Results Detail (tabs, cards espandibili) | Report completo |
| D19 | PDF export con jsPDF | Download funzionante |
| D20 | Polish, responsive, a11y, testing | Pronto per deploy |
| D21 | Deploy su Vercel | LIVE |

**Definizione di "fatto" per la Fase 1:**
- [x] Assessment completo in-browser (saboteur + PQ)
- [x] Scoring automatico con tutti gli edge case
- [x] Report visuale (radar, gauge, card, barre)
- [x] PDF scaricabile
- [x] Responsive (mobile-first)
- [x] Accessibilità base (keyboard nav, ARIA labels)
- [x] < 200ms tempo di caricamento
- [x] Zero dipendenze server

### Fase 2 — Persistenza + Auth (2 settimane)

- Supabase Auth (magic link)
- Salvataggio assessment su DB
- Storico assessment personale
- "Rifai tra 1 mese" con confronto prima/dopo
- Sharing: link ai risultati (opzionale, opt-in)

### Fase 3 — Coach Portal (3 settimane)

- Dashboard coach: lista clienti + stati
- Invio assessment via email con token
- Visualizzazione risultati clienti
- Note e annotazioni per sessione
- Confronto temporale (assessment 1 vs 2 vs 3)
- Export Excel per analisi

### Fase 4 — Team Assessment (2 settimane)

- Creazione team (coach aggiunge membri)
- Team Saboteur Map: aggregazione dei saboteur dominanti
- "Quale saboteur domina il team?"
- Dinamiche di gruppo: compatibilità tra saboteur
- Dashboard team con radar chart aggregato

### Fase 5 — PQ Program (4 settimane)

- Moduli settimanali guidati (6-7 settimane)
- PQ Reps quotidiani nell'app (esercizi da 10 secondi)
- Tracking progressi PQ Score nel tempo
- Push notification per PQ Reps
- Journaling: "Oggi il mio saboteur X si è fatto sentire quando..."
- Streak e gamification leggera

### Fase 6 — Scale (ongoing)

- Multilingua (IT, EN, ES, DE, FR, PT)
- White-label per coach/organizzazioni
- API pubblica per integrazioni
- Certificazione coach dentro la piattaforma
- Mobile app nativa (React Native)
- AI coaching assistant (analisi pattern nel journaling)

---

## 10. Testing Strategy

```
Unit Tests (Jest/Vitest):
├── scoring-engine.test.ts
│   ├── All saboteur score correctly from mock answers
│   ├── PQ score computation (boundary cases: all 1s, all 5s, mixed)
│   ├── Reverse scoring works
│   ├── Weight application
│   ├── Edge case: empty answers → defaults
│   ├── Edge case: partial answers → graceful degradation
│   └── PQ interpretation levels match thresholds
├── profile-matcher.test.ts
│   ├── Top 3 saboteur ranking is correct
│   ├── Sage powers recommendation logic
│   └── Action plan generation
└── validation.test.ts
    ├── Minimum answer threshold
    ├── Time-based flags
    └── All-same-answer detection

Component Tests (Testing Library):
├── LikertScale — renders 5 options, handles selection
├── QuestionCard — shows question, handles answer
├── RadarChart — renders with various data shapes
├── PQGauge — renders at boundary values (0, 50, 75, 100)
└── SaboteurCard — expands/collapses, shows all data

E2E Tests (Playwright):
├── Full happy path: welcome → 50 questions → 24 pairs → results
├── Navigation: back/forward, question jumping
├── Keyboard navigation: 1-5 shortcuts
├── Mobile responsive: all screens at 375px width
├── PDF download
└── Performance: full flow completes < 60s (automated)
```

---

## 11. Considerazioni Legali (Ripetizione Critica)

```
⚠️ TRADEMARK & IP:
- "Positive Intelligence", "PQ", "PQ Reps" sono trademark di 
  Positive Intelligence LLC (Shirzad Chamine)
- I nomi specifici dei 10 saboteur (Judge, Stickler, etc.) 
  sono usati nel contesto del framework PI
- L'assessment su scala Likert è un formato standard psicometrico 
  e NON è proprietà di PI

✅ COSA PUOI FARE:
- Creare un assessment con nomenclatura originale
- Usare il concetto generico di "voci interiori negative" (dominio pubblico)
- Misurare rapporto positivo/negativo (concetto psicologico standard)
- Usare 10 archetipi con NOMI DIVERSI

🔄 NOMI SUGGERITI (ORIGINALI):
- "Saboteur" → "Ombra interiore" / "Inner Shadow" / "Voce critica"
- "Judge" → "Il Critico" / "Il Giudicante"
- "PQ Score" → "Mental Fitness Score" / "Inner Balance Index"
- "Sage" → "Guida interiore" / "Inner Compass" / "Voce saggia"
- "PQ Reps" → "Mental Reps" / "Micro-esercizi di consapevolezza"

📋 DISCLAIMER DA INCLUDERE:
"Questo assessment di mental fitness è basato su ricerca consolidata 
in psicologia positiva, psicologia cognitiva e neuroscienze. 
Non è un test diagnostico né un sostituto di supporto psicologico 
professionale. Per problematiche cliniche, consulta uno specialista."
```

---

## 12. Metriche di Successo

| Metrica | Target MVP | Target 6 mesi |
|---|---|---|
| Completion rate (start → results) | > 85% | > 90% |
| Tempo medio completamento | 8-12 min | 8-12 min |
| PDF download rate | > 40% | > 50% |
| Return assessment (dopo 1 mese) | - | > 15% |
| NPS utenti | > 40 | > 55 |
| Coach adoption (v3+) | - | 50 coach attivi |
| Cronbach's α (post-lancio) | > 0.70 | > 0.75 |
