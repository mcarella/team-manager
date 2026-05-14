# Mental Fitness Assessment Platform — Implementation Plan

> Ispirato al modello Positive Intelligence® di Shirzad Chamine. Saboteur Assessment + PQ Score + Sage Powers.

---

## 1. Overview del Prodotto

### Cosa misura
La piattaforma Positive Intelligence si basa su un framework di **mental fitness** che misura tre componenti:

1. **Saboteur Assessment** — Identifica i 10 pattern mentali negativi (sabotatori interni)
2. **PQ Score Assessment** — Misura il quoziente di intelligenza positiva (rapporto Sage vs Saboteur)
3. **Sage Powers** — 5 poteri positivi da sviluppare come antidoto

### Il modello scientifico
- **Ricerca**: Basata su 500.000+ partecipanti, analisi fattoriale su 458.867 record unici
- **Assessment Saboteur**: Originariamente 54 item, raffinato a 49, poi analizzato con 45 item su scala Likert a 5 punti
- **PQ Assessment**: 24 coppie di emozioni positive/negative su scala Likert a 5 punti
- **Tipping point**: PQ Score di 75 = il Sage opera il 75% del tempo vs Saboteur al 25%
- **Validazione**: Cronbach's α ≥ 0.70 per tutte le 10 scale Saboteur; α = 0.84 per il Judge

### Utenti target
- **Individui**: Assessment self-service per consapevolezza personale
- **Coach**: Somministrano assessment a clienti, consultano report
- **Team Leader**: Assessment di team, dinamiche di gruppo
- **Organizzazioni**: Programmi di mental fitness su scala

### Stack consigliato
| Layer | Tecnologia |
|---|---|
| Frontend | Next.js 14+, React 18, TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand (client) |
| Backend | Next.js API Routes / Supabase Functions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth / Clerk |
| Deploy | Vercel + Supabase |
| Mobile | React Native o PWA |

---

## 2. Il Framework: 10 Saboteur + 1 Judge + 5 Sage Powers

### 2.1 Il Judge (Saboteur Universale)

Il Judge è presente in **tutti**. Non è uno dei 9 "complici" ma il master saboteur che li attiva.

```
JUDGE
├── Giudica se stesso → colpa, vergogna, rimpianto
├── Giudica gli altri → rabbia, delusione, risentimento  
└── Giudica le circostanze → ansia, frustrazione, pessimismo

Bugia giustificativa: "Senza di me che ti punisco per gli errori, 
non imparerai mai e diventerai pigro."
```

### 2.2 I 9 Saboteur "Complici"

| # | Saboteur | Descrizione | Pensiero tipico | Emozione | Bugia giustificativa | Forza originaria |
|---|---|---|---|---|---|---|
| 1 | **Stickler** | Perfezionismo e bisogno di ordine estremo | "Se non è perfetto, non è abbastanza buono" | Frustrazione, irritabilità, rigidità | "La perfezione è la via per il rispetto e il successo" | Attenzione ai dettagli, precisione |
| 2 | **Pleaser** | Cerca accettazione aiutando/compiacendo gli altri | "Devo mettere i bisogni degli altri prima dei miei" | Risentimento, burnout | "Se aiuto gli altri, sarò amato" | Empatia, generosità |
| 3 | **Hyper-Achiever** | Dipendente dalla performance per autostima | "Valgo solo se raggiungo risultati eccezionali" | Vuoto dopo ogni successo, workaholism | "La felicità arriva solo col prossimo traguardo" | Ambizione, drive |
| 4 | **Victim** | Senso di impotenza, autocommiserazione | "Perché queste cose capitano sempre a me?" | Autocommiserazione, passività | "Il dolore e la sofferenza mi rendono speciale" | Sensibilità, profondità emotiva |
| 5 | **Hyper-Rational** | Focus esclusivo sulla logica, freddezza emotiva | "Le emozioni sono una perdita di tempo" | Distacco, arroganza intellettuale | "L'approccio razionale è sempre il migliore" | Pensiero analitico |
| 6 | **Hyper-Vigilant** | Ansia continua su pericoli e rischi | "Quando cade la prossima tegola?" | Ansia cronica, paranoia, cinismo | "La vita è piena di pericoli, devo stare all'erta" | Prudenza, prevenzione |
| 7 | **Restless** | Ricerca costante di nuovi stimoli e attività | "Non posso essere felice se non sto facendo qualcosa di nuovo" | Irrequietezza, FOMO, insoddisfazione | "La prossima cosa mi renderà felice" | Energia, entusiasmo, adattabilità |
| 8 | **Controller** | Bisogno di controllo su situazioni e persone | "Se non controllo io, tutto andrà a rotoli" | Ansia quando non si ha il controllo, aggressività | "Il controllo è necessario per ottenere risultati" | Determinazione, capacità di azione |
| 9 | **Avoider** | Evita conflitti, problemi e compiti spiacevoli | "Se lo ignoro, forse si risolve da solo" | Procrastinazione, passivo-aggressività | "L'armonia è più importante di affrontare i problemi" | Desiderio di pace, positività |

### 2.3 I 5 Sage Powers (Antidoti)

| # | Sage Power | Descrizione | Quando usarla |
|---|---|---|---|
| 1 | **Empathize** | Compassione per sé e per gli altri | Contro il Judge (auto-critica), Victim, Pleaser |
| 2 | **Explore** | Curiosità aperta, mente da principiante | Contro Judge (giudizio degli altri), Hyper-Rational, Hyper-Vigilant |
| 3 | **Innovate** | Creatività, pensiero fuori dagli schemi | Contro Stickler, Controller, Hyper-Rational |
| 4 | **Navigate** | Allineamento con valori profondi, bussola interiore | Contro Hyper-Achiever, Restless, Avoider |
| 5 | **Activate** | Azione chiara e decisa senza interferenze Saboteur | Contro Avoider, Victim, Hyper-Vigilant |

---

## 3. Architettura Dati

### 3.1 Schema Database

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  assessments   Assessment[]
  createdAt     DateTime  @default(now())
}

model Assessment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  type            AssessmentType
  status          Status   @default(IN_PROGRESS)
  
  // Raw responses (JSON array of {questionId, answer})
  responses       Json
  
  // Computed results
  saboteurScores  Json?    // {judge: 7.2, stickler: 5.1, ...}
  pqScore         Int?     // 0-100
  topSaboteurs    String[] // ["judge", "hyper_achiever", "pleaser"]
  
  startedAt       DateTime @default(now())
  completedAt     DateTime?
}

enum AssessmentType {
  SABOTEUR
  PQ_SCORE
  FULL        // Both combined
}

enum Status {
  IN_PROGRESS
  COMPLETED
}
```

### 3.2 Struttura delle Domande

```typescript
// ── SABOTEUR ASSESSMENT ──
// 45-50 affermazioni su scala Likert 1-5
// (1 = Per niente vero, 5 = Molto vero)
// ~5 item per saboteur, randomizzati

interface SaboteurQuestion {
  id: string;
  text: string;                // "Mi critico spesso per i miei errori"
  saboteur: SaboteurType;      // "judge"
  subFactor?: string;          // "judging_self" | "judging_others" | "judging_circumstances"
  reverseScored: boolean;      // false = punteggio diretto
}

// ── PQ SCORE ASSESSMENT ──
// 24 coppie di emozioni (positiva vs negativa)
// Scala Likert 1-5: "In una giornata tipica, quanto spesso provi..."

interface PQQuestion {
  id: string;
  positiveEmotion: string;     // "Calma, serenità"
  negativeEmotion: string;     // "Ansia, preoccupazione"
  // Il rispondente valuta l'intensità di ciascuna emozione
  // PQ = positive / (positive + negative) × 100
}
```

### 3.3 Distribuzione Domande Saboteur Assessment (50 item)

| Saboteur | # Item | Sub-fattori |
|---|---|---|
| Judge | 8 | Giudizio di sé (3), degli altri (3), delle circostanze (2) |
| Stickler | 5 | Perfezionismo, ordine, critica degli errori |
| Pleaser | 5 | Aiuto compulsivo, difficoltà a dire no, risentimento |
| Hyper-Achiever | 5 | Dipendenza dal successo, workaholism, vuoto |
| Victim | 4 | Impotenza, autocommiserazione, ricerca di simpatia |
| Hyper-Rational | 4 | Distacco emotivo, arroganza intellettuale |
| Hyper-Vigilant | 5 | Ansia cronica, aspettativa del peggio, cinismo |
| Restless | 4 | FOMO, irrequietezza, distrazione |
| Controller | 5 | Bisogno di controllo, confronto, ansia senza controllo |
| Avoider | 5 | Evitamento conflitti, procrastinazione, passivo-aggressività |

---

## 4. Algoritmo di Scoring

### 4.1 Saboteur Scoring

```
STEP 1: Raw Score per Saboteur
  Per ciascuno dei 10 saboteur S:
    raw_S = media delle risposte (1-5) per gli item di S
    Se reverseScored: answer = 6 - answer

STEP 2: Normalizzazione (scala 1-10)
  normalized_S = (raw_S - 1) / 4 * 10
  // Scala 1-5 → 0-10
  // Più alto = più forte il saboteur (più è un problema)

STEP 3: Ranking
  Ordina i 10 saboteur per score decrescente
  Top 2-3 = i tuoi saboteur dominanti
  Il Judge è SEMPRE presente (universale)

STEP 4: Profilo Saboteur
  Output: {
    judge: 7.8,           // Sempre misurato
    topAccomplice1: 8.2,  // es. Hyper-Achiever
    topAccomplice2: 6.5,  // es. Pleaser
    ...restanti scores
  }
```

### 4.2 PQ Score

```
STEP 1: Per ciascuna delle 24 coppie
  positive_intensity = risposta emozione positiva (1-5)
  negative_intensity = risposta emozione negativa (1-5)

STEP 2: PQ Score
  total_positive = Σ positive_intensity per tutte le 24 coppie
  total_negative = Σ negative_intensity per tutte le 24 coppie
  
  PQ = (total_positive / (total_positive + total_negative)) × 100
  
  // Range: 0-100
  // 75+ = tipping point positivo (Sage domina)
  // 50 = equilibrio
  // <50 = Saboteur domina

STEP 3: Interpretazione
  PQ < 50:  "I tuoi saboteur dominano. Lavoro urgente sulla mental fitness."
  50-65:    "Zona mista. I saboteur interferiscono spesso."
  65-75:    "Buon livello, ma non hai ancora raggiunto il tipping point."
  75-85:    "Sopra il tipping point! Il tuo Sage è al comando."
  85-100:   "Mental fitness eccellente. Maestria rara."

STEP 4: Trend per età (benchmark dalla ricerca)
  18-25: media PQ = 51
  26-35: media PQ = 54
  36-45: media PQ = 57
  46-55: media PQ = 59
  56-65: media PQ = 61
  65+:   media PQ = 63
```

### 4.3 Saboteur-to-Sage Mapping

```
Per ogni saboteur dominante, suggerisci le Sage Powers più utili:

Judge (self)        → Empathize + Explore
Judge (others)      → Empathize + Explore
Judge (circumstances) → Explore + Navigate
Stickler           → Innovate + Activate
Pleaser            → Empathize (self) + Navigate
Hyper-Achiever     → Empathize + Navigate
Victim             → Empathize + Activate
Hyper-Rational     → Empathize + Explore
Hyper-Vigilant     → Explore + Activate
Restless           → Navigate + Empathize
Controller         → Empathize + Innovate
Avoider            → Activate + Navigate
```

---

## 5. Content Bank: Domande

### 5.1 Saboteur Assessment — 50 Affermazioni (Likert 1-5)

**Formato:** "Quanto è vero per te?" — 1 (Per niente) → 5 (Molto vero)

**JUDGE (8 item):**
1. Mi critico spesso per i miei errori, anche quelli piccoli
2. Tendo a focalizzarmi su ciò che non va nelle persone piuttosto che sui loro pregi
3. Quando qualcosa va storto, la mia prima reazione è cercare chi è colpevole
4. Mi sveglio spesso di notte preoccupandomi di cose che potrebbero andare male
5. Sono raramente soddisfatto dei miei risultati
6. Tendo a giudicare le scelte degli altri come inferiori alle mie
7. Quando qualcosa non funziona, fatico a vederci qualcosa di positivo
8. Mi rimprovero per cose che sono successe molto tempo fa

**STICKLER (5 item):**
9. Mi frustra quando le cose non sono fatte nel modo "giusto"
10. Dedico più tempo del necessario a perfezionare dettagli
11. Mi irrito quando gli altri non mantengono i miei stessi standard
12. Preferisco rifare qualcosa io piuttosto che accettare un lavoro imperfetto
13. L'idea di "abbastanza buono" mi mette a disagio

**PLEASER (5 item):**
14. Mi è difficile dire "no" alle richieste degli altri
15. Tendo a mettere i bisogni degli altri prima dei miei
16. Mi sento ferito quando gli altri non riconoscono quanto faccio per loro
17. Cerco di guadagnare l'affetto degli altri attraverso l'aiuto e la disponibilità
18. Mi sento in colpa quando dedico tempo a me stesso

**HYPER-ACHIEVER (5 item):**
19. La mia autostima dipende fortemente dai miei risultati professionali
20. Dopo un successo, passo rapidamente al prossimo obiettivo senza festeggiare
21. Mi sento a disagio quando non sto facendo qualcosa di "produttivo"
22. Tendo a valutare le persone in base ai loro risultati
23. Ho paura che senza costanti successi, le persone mi rispetterebbero meno

**VICTIM (4 item):**
24. Sento spesso che le cose brutte capitano proprio a me
25. A volte mi concentro sui miei problemi per ottenere simpatia dagli altri
26. Mi sento impotente di fronte alle circostanze della mia vita
27. Tendo a lamentarmi di come le cose non siano giuste

**HYPER-RATIONAL (4 item):**
28. Tendo a processare tutto attraverso la logica, incluse le relazioni
29. Mi impazientisco quando le persone si lasciano guidare dalle emozioni
30. Preferisco analizzare i problemi piuttosto che parlare di come mi fanno sentire
31. Gli altri mi percepiscono a volte come freddo o distaccato

**HYPER-VIGILANT (5 item):**
32. Mi preoccupo costantemente di cosa potrebbe andare storto
33. Faccio fatica a fidarmi delle intenzioni degli altri
34. Cerco rassicurazione nelle regole e nelle procedure
35. Quando le cose vanno bene, aspetto che succeda qualcosa di brutto
36. Mi sento cinico riguardo alle motivazioni delle persone

**RESTLESS (4 item):**
37. Mi annoio facilmente e cerco costantemente nuovi stimoli
38. Ho difficoltà a stare fermo e a godermi il momento presente
39. Mi distraggo facilmente e salto da un'attività all'altra
40. Ho paura di perdere esperienze (FOMO)

**CONTROLLER (5 item):**
41. Sento il bisogno di avere il controllo sulle situazioni
42. Mi provoca ansia quando non posso influenzare il risultato
43. Tendo a dire agli altri cosa fare e come farlo
44. Mi è difficile delegare perché penso che io lo farei meglio
45. Quando non sono al comando, mi sento irrequieto

**AVOIDER (5 item):**
46. Tendo a rimandare conversazioni difficili
47. Preferisco concentrarmi sugli aspetti positivi piuttosto che affrontare i problemi
48. Ho difficoltà ad affrontare conflitti direttamente
49. Mi rifugio in routine confortanti quando sono stressato
50. Dico "va tutto bene" anche quando non è vero

### 5.2 PQ Score Assessment — 24 Coppie Emozioni

**Formato:** "In una giornata tipica, quanto intensamente provi ciascuna di queste emozioni?" (1=Mai, 5=Molto spesso)

| # | Emozione Positiva | Emozione Negativa |
|---|---|---|
| 1 | Calma, serenità | Ansia, preoccupazione |
| 2 | Gioia, entusiasmo | Tristezza, abbattimento |
| 3 | Curiosità, apertura | Cinismo, chiusura |
| 4 | Compassione, empatia | Giudizio, critica |
| 5 | Gratitudine, apprezzamento | Risentimento, invidia |
| 6 | Fiducia, ottimismo | Paura, pessimismo |
| 7 | Senso di scopo, significato | Vuoto, insensatezza |
| 8 | Creatività, ispirazione | Blocco, stagnazione |
| 9 | Energia, vitalità | Esaurimento, stanchezza |
| 10 | Connessione, appartenenza | Isolamento, solitudine |
| 11 | Accettazione, pace | Frustrazione, irritazione |
| 12 | Determinazione, chiarezza | Confusione, indecisione |
| 13 | Giocosità, leggerezza | Pesantezza, serietà eccessiva |
| 14 | Coraggio, fiducia in sé | Insicurezza, dubbio su di sé |
| 15 | Generosità, apertura | Chiusura, difensività |
| 16 | Meraviglia, stupore | Noia, apatia |
| 17 | Pazienza, tolleranza | Impazienza, agitazione |
| 18 | Presenza, mindfulness | Distrazione, ruminazione |
| 19 | Autenticità, libertà | Costrizione, maschera |
| 20 | Soddisfazione, appagamento | Insoddisfazione, vuoto |
| 21 | Perdono, lasciar andare | Rancore, colpa |
| 22 | Equilibrio, armonia | Caos, sopraffazione |
| 23 | Speranza, possibilità | Disperazione, impotenza |
| 24 | Amore, tenerezza | Rabbia, ostilità |

---

## 6. Screens & User Flow

### 6.1 Flow Principale

```
[Landing Page]
    → [Saboteur Assessment] (50 domande, ~5-8 min)
        → [Report Saboteur] (top saboteur + grafici)
    → [PQ Score Assessment] (24 coppie, ~3-5 min)
        → [Report PQ] (punteggio + interpretazione)
    → [Report Completo]
        → [Saboteur Profile Cards]
        → [PQ Score + Benchmark]
        → [Sage Powers consigliate]
        → [Piano d'azione personalizzato]
```

### 6.2 Screens Dettagliati

#### S1 — Welcome / Intro
- Spiegazione del framework (Saboteur vs Sage)
- Visual: bilancia Saboteur ↔ Sage
- "Scopri quali saboteur ti stanno frenando"
- CTA: "Inizia l'Assessment (~10 min)"

#### S2 — Saboteur Assessment
- Affermazioni una per volta (o 5 per pagina)
- Scala Likert visuale a 5 punti (da "Per niente" a "Molto vero")
- Progress bar
- Istruzioni: "Rispondi velocemente, segui il primo istinto"

#### S3 — PQ Score Assessment
- Coppie di emozioni con slider o Likert
- Layout a due colonne: positiva | negativa
- Progress bar
- "Pensa a una giornata tipica degli ultimi 7 giorni"

#### S4 — Report Saboteur
- **Radar chart** dei 10 saboteur
- **Top 3 saboteur** con card dettagliate
- Per ciascun saboteur dominante:
  - Descrizione
  - Pensieri tipici
  - Emozioni generate
  - Bugia giustificativa
  - Forza originaria
  - Sage Power antidoto

#### S5 — Report PQ Score
- **Gauge/meter** grande con score 0-100
- Zona colorata (rosso <50, arancione 50-65, giallo 65-75, verde 75+)
- Benchmark per età
- Interpretazione personalizzata
- Tipping point indicator (75)

#### S6 — Report Completo
- Sezione Saboteur
- Sezione PQ Score
- Sezione Sage Powers raccomandate
- Piano d'azione: "I tuoi 3 primi passi"
- CTA: "Inizia il programma PQ" / "Condividi i risultati"

---

## 7. Roadmap

### Fase 1 — MVP (3 settimane)
| Settimana | Deliverable |
|---|---|
| W1 | Setup, data model, 50 domande saboteur + 24 coppie PQ |
| W2 | UI assessment + scoring engine |
| W3 | Report (radar chart, gauge, cards saboteur), flow completo |

### Fase 2 — Coach Portal (3 settimane)
- Dashboard coach con lista clienti
- Invio assessment via link/email
- Comparazione risultati nel tempo
- Note e annotazioni per sessione

### Fase 3 — Team Assessment (2 settimane)
- Team saboteur map (aggregazione profili)
- Analisi dinamiche di gruppo
- "Quale saboteur domina il team?"

### Fase 4 — PQ Program (4 settimane)
- Moduli settimanali guidati (7 settimane)
- PQ Reps quotidiani (esercizi da 10 secondi)
- Tracking progressi PQ Score nel tempo
- Push notification per PQ Reps
- Community/chat di gruppo

---

## 8. Considerazioni Legali

> ⚠️ **IMPORTANTE**: Questo tool è ispirato a Positive Intelligence® ma NON è PI.

- "Positive Intelligence", "PQ", "Saboteur" nel contesto PI sono trademark di Positive Intelligence LLC
- Creare **nomenclatura originale** (es. "Saboteur" → "Ombra interiore", "Inner Critic")
- Il concetto generico di "voci interiori negative" è di dominio psicologico
- L'assessment su scala Likert è un formato standard della psicometria
- Includere disclaimer: "Assessment di mental fitness basato su ricerca in psicologia positiva e neuroscienze"
- Per uso commerciale: consultare legale IP

---

## 9. Appendice: Profili Saboteur Completi

```json
{
  "judge": {
    "name": "Il Giudice",
    "icon": "⚖️",
    "color": "#dc2626",
    "isUniversal": true,
    "description": "Trova difetti in te stesso, negli altri e nelle circostanze.",
    "thoughts": ["Cosa c'è di sbagliato in me?", "Cosa c'è di sbagliato in te?", "Questo risultato è inaccettabile"],
    "feelings": ["Colpa", "Vergogna", "Rimpianto", "Rabbia", "Delusione"],
    "lie": "Senza di me che ti punisco, non migliorerai mai",
    "strength": "Discernimento, valutazione",
    "sageAntidote": ["empathize", "explore"]
  },
  "stickler": {
    "name": "Il Perfezionista",
    "icon": "📐",
    "color": "#7c3aed",
    "description": "Perfezionismo e bisogno di ordine portato all'estremo.",
    "thoughts": ["Deve essere perfetto", "Non è abbastanza buono", "Lo rifarei"],
    "feelings": ["Frustrazione", "Irritazione", "Tensione cronica"],
    "lie": "La perfezione è la via per il successo e il rispetto",
    "strength": "Attenzione ai dettagli, precisione, standard elevati",
    "sageAntidote": ["innovate", "activate"]
  },
  "pleaser": {
    "name": "Il Compiacente",
    "icon": "🤗",
    "color": "#ec4899",
    "description": "Cerca accettazione e affetto aiutando, compiacendo e lusingando.",
    "thoughts": ["Devo mettere gli altri prima di me", "Se dico no, non mi vorranno bene"],
    "feelings": ["Risentimento nascosto", "Burnout", "Senso di colpa"],
    "lie": "Devo guadagnarmi l'amore aiutando gli altri",
    "strength": "Empatia, generosità, cura degli altri",
    "sageAntidote": ["empathize", "navigate"]
  },
  "hyper_achiever": {
    "name": "L'Iperperformante",
    "icon": "🏆",
    "color": "#f59e0b",
    "description": "Dipendente dalla performance costante per autostima e validazione.",
    "thoughts": ["Devo raggiungere il prossimo traguardo", "Valgo quanto i miei risultati"],
    "feelings": ["Vuoto dopo il successo", "Ansia da prestazione", "Workaholism"],
    "lie": "La felicità è nel prossimo traguardo",
    "strength": "Ambizione, drive, capacità di esecuzione",
    "sageAntidote": ["empathize", "navigate"]
  },
  "victim": {
    "name": "La Vittima",
    "icon": "😢",
    "color": "#6366f1",
    "description": "Senso di impotenza e autocommiserazione per ottenere attenzione.",
    "thoughts": ["Perché capita sempre a me?", "Non è giusto", "Non posso farci niente"],
    "feelings": ["Autocommiserazione", "Impotenza", "Passività"],
    "lie": "Il dolore e la sofferenza mi rendono speciale e degno di attenzione",
    "strength": "Sensibilità, profondità emotiva",
    "sageAntidote": ["empathize", "activate"]
  },
  "hyper_rational": {
    "name": "L'Iper-razionale",
    "icon": "🧮",
    "color": "#06b6d4",
    "description": "Focus esclusivo sulla logica in tutto, incluse le relazioni.",
    "thoughts": ["Le emozioni sono irrazionali", "Analizziamo i fatti"],
    "feelings": ["Distacco", "Superiorità intellettuale", "Solitudine"],
    "lie": "L'approccio razionale è sempre superiore",
    "strength": "Pensiero analitico, obiettività",
    "sageAntidote": ["empathize", "explore"]
  },
  "hyper_vigilant": {
    "name": "L'Ipervigilante",
    "icon": "👁️",
    "color": "#84cc16",
    "description": "Ansia continua su pericoli e cose che potrebbero andare male.",
    "thoughts": ["Quando cade la prossima tegola?", "Non mi fido", "Devo stare all'erta"],
    "feelings": ["Ansia cronica", "Cinismo", "Scetticismo"],
    "lie": "La vita è piena di pericoli, se non vigilo io, chi lo fa?",
    "strength": "Prudenza, prevenzione, attenzione ai rischi",
    "sageAntidote": ["explore", "activate"]
  },
  "restless": {
    "name": "L'Irrequieto",
    "icon": "🦋",
    "color": "#f97316",
    "description": "Ricerca costante di eccitazione e nuovi stimoli.",
    "thoughts": ["La prossima cosa sarà migliore", "Mi annoio", "E se mi perdo qualcosa?"],
    "feelings": ["Irrequietezza", "FOMO", "Insoddisfazione cronica"],
    "lie": "La felicità è nella prossima esperienza",
    "strength": "Energia, entusiasmo, adattabilità",
    "sageAntidote": ["navigate", "empathize"]
  },
  "controller": {
    "name": "Il Controllore",
    "icon": "🎮",
    "color": "#ef4444",
    "description": "Bisogno ansioso di prendere il controllo di situazioni e persone.",
    "thoughts": ["Se non controllo io, sarà il caos", "Faccio prima a farlo io"],
    "feelings": ["Ansia da perdita di controllo", "Aggressività", "Impazienza"],
    "lie": "Senza il mio controllo, niente funzionerà",
    "strength": "Determinazione, capacità di azione, leadership",
    "sageAntidote": ["empathize", "innovate"]
  },
  "avoider": {
    "name": "L'Evitatore",
    "icon": "🙈",
    "color": "#10b981",
    "description": "Evita conflitti, problemi e compiti spiacevoli.",
    "thoughts": ["Forse si risolve da solo", "Non voglio rovinare l'armonia", "Va tutto bene"],
    "feelings": ["Procrastinazione", "Passivo-aggressività nascosta", "Negazione"],
    "lie": "Evitare i problemi mantiene la pace",
    "strength": "Desiderio di pace, positività, diplomazia",
    "sageAntidote": ["activate", "navigate"]
  }
}
```
