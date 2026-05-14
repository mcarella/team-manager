import { useState, useEffect, useCallback, useMemo } from "react";

// ─── DATA: 86 Adjectives mapped to factors ───
const ADJECTIVES = [
  // Factor A - Dominance (HIGH)
  { id:"a01", en:"Assertive", it:"Assertivo", factor:"A", w:0.9 },
  { id:"a02", en:"Independent", it:"Indipendente", factor:"A", w:0.8 },
  { id:"a03", en:"Determined", it:"Determinato", factor:"A", w:0.85 },
  { id:"a04", en:"Self-confident", it:"Sicuro di sé", factor:"A", w:0.8 },
  { id:"a05", en:"Competitive", it:"Competitivo", factor:"A", w:0.9 },
  { id:"a06", en:"Bold", it:"Audace", factor:"A", w:0.85 },
  { id:"a07", en:"Forceful", it:"Energico", factor:"A", w:0.95 },
  { id:"a08", en:"Authoritative", it:"Autorevole", factor:"A", w:0.9 },
  { id:"a09", en:"Decisive", it:"Deciso", factor:"A", w:0.8 },
  { id:"a10", en:"Demanding", it:"Esigente", factor:"A", w:0.7 },
  // Factor A - Dominance (LOW)
  { id:"a11", en:"Cooperative", it:"Cooperativo", factor:"A", w:-0.8 },
  { id:"a12", en:"Agreeable", it:"Conciliante", factor:"A", w:-0.85 },
  { id:"a13", en:"Accommodating", it:"Accomodante", factor:"A", w:-0.9 },
  { id:"a14", en:"Supportive", it:"Di supporto", factor:"A", w:-0.7 },
  { id:"a15", en:"Compliant", it:"Compiacente", factor:"A", w:-0.95 },
  { id:"a16", en:"Collaborative", it:"Collaborativo", factor:"A", w:-0.6 },
  { id:"a17", en:"Humble", it:"Umile", factor:"A", w:-0.7 },
  { id:"a18", en:"Deferential", it:"Deferente", factor:"A", w:-0.8 },
  { id:"a19", en:"Yielding", it:"Cedevole", factor:"A", w:-0.85 },
  { id:"a20", en:"Diplomatic", it:"Diplomatico", factor:"A", w:-0.5 },
  // Factor B - Extraversion (HIGH)
  { id:"b01", en:"Sociable", it:"Socievole", factor:"B", w:0.85 },
  { id:"b02", en:"Persuasive", it:"Persuasivo", factor:"B", w:0.9 },
  { id:"b03", en:"Outgoing", it:"Estroverso", factor:"B", w:0.9 },
  { id:"b04", en:"Talkative", it:"Loquace", factor:"B", w:0.8 },
  { id:"b05", en:"Enthusiastic", it:"Entusiasta", factor:"B", w:0.85 },
  { id:"b06", en:"Friendly", it:"Amichevole", factor:"B", w:0.7 },
  { id:"b07", en:"Influential", it:"Influente", factor:"B", w:0.85 },
  { id:"b08", en:"Expressive", it:"Espressivo", factor:"B", w:0.8 },
  { id:"b09", en:"Convincing", it:"Convincente", factor:"B", w:0.9 },
  { id:"b10", en:"Charming", it:"Carismatico", factor:"B", w:0.75 },
  { id:"b11", en:"Empathetic", it:"Empatico", factor:"B", w:0.7 },
  // Factor B - Extraversion (LOW)
  { id:"b12", en:"Reserved", it:"Riservato", factor:"B", w:-0.9 },
  { id:"b13", en:"Introspective", it:"Introspettivo", factor:"B", w:-0.85 },
  { id:"b14", en:"Analytical", it:"Analitico", factor:"B", w:-0.7 },
  { id:"b15", en:"Task-oriented", it:"Orientato al compito", factor:"B", w:-0.8 },
  { id:"b16", en:"Private", it:"Discreto", factor:"B", w:-0.9 },
  { id:"b17", en:"Reflective", it:"Riflessivo", factor:"B", w:-0.75 },
  { id:"b18", en:"Serious", it:"Serio", factor:"B", w:-0.6 },
  { id:"b19", en:"Quiet", it:"Silenzioso", factor:"B", w:-0.85 },
  { id:"b20", en:"Observant", it:"Osservatore", factor:"B", w:-0.5 },
  { id:"b21", en:"Selective", it:"Selettivo", factor:"B", w:-0.65 },
  { id:"b22", en:"Formal", it:"Formale", factor:"B", w:-0.55 },
  // Factor C - Patience (HIGH)
  { id:"c01", en:"Calm", it:"Calmo", factor:"C", w:0.9 },
  { id:"c02", en:"Patient", it:"Paziente", factor:"C", w:0.95 },
  { id:"c03", en:"Steady", it:"Costante", factor:"C", w:0.85 },
  { id:"c04", en:"Relaxed", it:"Rilassato", factor:"C", w:0.8 },
  { id:"c05", en:"Consistent", it:"Coerente", factor:"C", w:0.85 },
  { id:"c06", en:"Methodical", it:"Metodico", factor:"C", w:0.8 },
  { id:"c07", en:"Easy-going", it:"Alla mano", factor:"C", w:0.75 },
  { id:"c08", en:"Tolerant", it:"Tollerante", factor:"C", w:0.7 },
  { id:"c09", en:"Predictable", it:"Prevedibile", factor:"C", w:0.65 },
  { id:"c10", en:"Careful", it:"Prudente", factor:"C", w:0.7 },
  // Factor C - Patience (LOW)
  { id:"c11", en:"Intense", it:"Intenso", factor:"C", w:-0.9 },
  { id:"c12", en:"Urgent", it:"Urgente", factor:"C", w:-0.85 },
  { id:"c13", en:"Fast-paced", it:"Dinamico", factor:"C", w:-0.8 },
  { id:"c14", en:"Restless", it:"Irrequieto", factor:"C", w:-0.85 },
  { id:"c15", en:"Impatient", it:"Impaziente", factor:"C", w:-0.9 },
  { id:"c16", en:"Driven", it:"Motivato", factor:"C", w:-0.7 },
  { id:"c17", en:"Spontaneous", it:"Spontaneo", factor:"C", w:-0.65 },
  { id:"c18", en:"Tense", it:"Teso", factor:"C", w:-0.75 },
  { id:"c19", en:"Energetic", it:"Energetico", factor:"C", w:-0.6 },
  // Factor D - Formality (HIGH)
  { id:"d01", en:"Precise", it:"Preciso", factor:"D", w:0.9 },
  { id:"d02", en:"Strict", it:"Rigoroso", factor:"D", w:0.95 },
  { id:"d03", en:"Organized", it:"Organizzato", factor:"D", w:0.85 },
  { id:"d04", en:"Disciplined", it:"Disciplinato", factor:"D", w:0.9 },
  { id:"d05", en:"Detail-oriented", it:"Attento ai dettagli", factor:"D", w:0.85 },
  { id:"d06", en:"Cautious", it:"Cauto", factor:"D", w:0.8 },
  { id:"d07", en:"Meticulous", it:"Meticoloso", factor:"D", w:0.9 },
  { id:"d08", en:"Vigilant", it:"Vigile", factor:"D", w:0.75 },
  { id:"d09", en:"Thorough", it:"Scrupoloso", factor:"D", w:0.85 },
  { id:"d10", en:"Rule-following", it:"Rispettoso delle regole", factor:"D", w:0.8 },
  // Factor D - Formality (LOW)
  { id:"d11", en:"Flexible", it:"Flessibile", factor:"D", w:-0.85 },
  { id:"d12", en:"Impulsive", it:"Impulsivo", factor:"D", w:-0.9 },
  { id:"d13", en:"Uninhibited", it:"Disinibito", factor:"D", w:-0.85 },
  { id:"d14", en:"Informal", it:"Informale", factor:"D", w:-0.8 },
  { id:"d15", en:"Casual", it:"Disinvolto", factor:"D", w:-0.7 },
  { id:"d16", en:"Improvising", it:"Improvvisatore", factor:"D", w:-0.75 },
  { id:"d17", en:"Adaptable", it:"Adattabile", factor:"D", w:-0.6 },
  { id:"d18", en:"Unconventional", it:"Anticonvenzionale", factor:"D", w:-0.8 },
  { id:"d19", en:"Risk-taking", it:"Propenso al rischio", factor:"D", w:-0.7 },
  // Factor E - Objectivity
  { id:"e01", en:"Objective", it:"Obiettivo", factor:"E", w:0.8 },
  { id:"e02", en:"Logical", it:"Logico", factor:"E", w:0.85 },
  { id:"e03", en:"Rational", it:"Razionale", factor:"E", w:0.8 },
  { id:"e04", en:"Intuitive", it:"Intuitivo", factor:"E", w:-0.75 },
  { id:"e05", en:"Emotional", it:"Emotivo", factor:"E", w:-0.8 },
  { id:"e06", en:"Sensitive", it:"Sensibile", factor:"E", w:-0.7 },
];

// Shuffle helper
const shuffle = (arr) => {
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
};

// ─── DATA: 17 Reference Profiles with centroids ───
const PROFILES = [
  { id:"ANALYZER", name:"Il Ricercatore", icon:"🔬", group:"analytical", c:{A:55,B:25,C:25,D:80}, desc:"Metodico e orientato ai dati. Approfondisce ogni dettaglio prima di agire.", strengths:["Analisi approfondita","Precisione","Pensiero critico","Standard elevati"], cautions:["Può sembrare distaccato","Rischio di paralisi da analisi"] },
  { id:"CONTROLLER", name:"Il Direttore", icon:"🎯", group:"analytical", c:{A:80,B:20,C:20,D:80}, desc:"Risultati sopra ogni cosa. Lavora con precisione e determinazione.", strengths:["Focus sui risultati","Autodisciplina","Efficienza","Competenza tecnica"], cautions:["Può essere percepito come rigido","Difficoltà a delegare"] },
  { id:"SPECIALIST", name:"L'Esperto", icon:"🔧", group:"analytical", c:{A:50,B:25,C:60,D:80}, desc:"Competenza profonda e lavoro meticoloso. Eccelle in aree specifiche.", strengths:["Expertise tecnica","Affidabilità","Coerenza","Lavoro di qualità"], cautions:["Resistenza al cambiamento","Preferisce lavorare da solo"] },
  { id:"STRATEGIST", name:"Il Visionario", icon:"♟️", group:"analytical", c:{A:80,B:50,C:20,D:75}, desc:"Pensa in grande e pianifica a lungo termine. Unisce visione e rigore.", strengths:["Pensiero strategico","Leadership intellettuale","Innovazione","Pianificazione"], cautions:["Può sottovalutare l'esecuzione","Impaziente con i dettagli operativi"] },
  { id:"VENTURER", name:"Il Pioniere", icon:"🚀", group:"analytical", c:{A:85,B:25,C:15,D:25}, desc:"Intraprendente e orientato all'azione. Sfida lo status quo.", strengths:["Iniziativa","Coraggio","Indipendenza","Velocità decisionale"], cautions:["Può essere troppo diretto","Trascura le regole"] },
  { id:"ALTRUIST", name:"L'Armonizzatore", icon:"🤝", group:"social", c:{A:30,B:75,C:55,D:55}, desc:"Costruisce armonia nel team. Socievole, collaborativo e organizzato.", strengths:["Team building","Empatia","Comunicazione","Organizzazione sociale"], cautions:["Evita i conflitti","Può sacrificare le proprie esigenze"] },
  { id:"CAPTAIN", name:"Il Capitano", icon:"⚡", group:"social", c:{A:80,B:80,C:20,D:30}, desc:"Leader carismatico che guida con energia e visione.", strengths:["Leadership naturale","Carisma","Gestione del cambiamento","Motivazione"], cautions:["Può dominare le conversazioni","Impaziente con la lentezza"] },
  { id:"COLLABORATOR", name:"Il Mediatore", icon:"💚", group:"social", c:{A:30,B:75,C:70,D:30}, desc:"Paziente, empatico e orientato al consenso. Il collante del team.", strengths:["Ascolto attivo","Pazienza","Diplomazia","Supporto al team"], cautions:["Lento nel prendere decisioni","Evita il confronto"] },
  { id:"MAVERICK", name:"Il Ribelle", icon:"🔥", group:"social", c:{A:85,B:80,C:15,D:20}, desc:"Audace e carismatico. Sfida le convenzioni con energia sociale.", strengths:["Innovazione radicale","Persuasione","Coraggio","Energia"], cautions:["Insofferente all'autorità","Può creare caos organizzativo"] },
  { id:"PERSUADER", name:"Il Persuasore", icon:"🎤", group:"social", c:{A:75,B:85,C:20,D:45}, desc:"Comunicatore nato. Motiva e convince con passione.", strengths:["Negoziazione","Motivazione","Networking","Vendita di idee"], cautions:["Può sembrare manipolativo","Impaziente con processi lenti"] },
  { id:"PROMOTER", name:"L'Ambasciatore", icon:"🌟", group:"social", c:{A:50,B:80,C:25,D:25}, desc:"Socievole e ottimista. Costruisce relazioni e promuove idee.", strengths:["Relazioni","Entusiasmo","Comunicazione","Adattabilità sociale"], cautions:["Può mancare di follow-through","Evita i dettagli"] },
  { id:"ADAPTER", name:"Il Camaleonte", icon:"🦎", group:"stabilizing", c:{A:50,B:50,C:50,D:50}, desc:"Versatile e bilanciato. Si adatta a qualsiasi situazione.", strengths:["Versatilità","Equilibrio","Adattabilità","Lavoro di squadra"], cautions:["Profilo meno definito","Può sembrare indeciso"] },
  { id:"ARTISAN", name:"L'Artigiano", icon:"✋", group:"stabilizing", c:{A:25,B:20,C:75,D:80}, desc:"Preciso e riflessivo. Esegue con maestria e attenzione.", strengths:["Esecuzione impeccabile","Osservazione","Affidabilità","Cura del dettaglio"], cautions:["Lento ad adattarsi","Necessita direzione chiara"] },
  { id:"GUARDIAN", name:"Il Guardiano", icon:"🛡️", group:"stabilizing", c:{A:20,B:25,C:80,D:85}, desc:"Stabile, strutturato e affidabile. Il pilastro dell'organizzazione.", strengths:["Affidabilità totale","Precisione","Stabilità","Rispetto delle procedure"], cautions:["Resistente al cambiamento","Può sembrare troppo rigido"] },
  { id:"OPERATOR", name:"L'Operatore", icon:"⚙️", group:"stabilizing", c:{A:25,B:25,C:80,D:25}, desc:"Cooperativo, paziente e concreto. Lavora con calma e costanza.", strengths:["Calma sotto pressione","Cooperazione","Costanza","Pragmatismo"], cautions:["Può evitare i conflitti necessari","Lento ad agire"] },
  { id:"INDIVIDUALIST", name:"L'Individualista", icon:"🏔️", group:"persistent", c:{A:80,B:20,C:70,D:80}, desc:"Indipendente, metodico e determinato. Lavora meglio in autonomia.", strengths:["Autonomia","Competenza profonda","Tenacia","Standard elevati"], cautions:["Difficoltà nel teamwork","Può sembrare distante"] },
  { id:"SCHOLAR", name:"Lo Studioso", icon:"📚", group:"persistent", c:{A:75,B:20,C:50,D:80}, desc:"Esperto e rigoroso. Cerca la conoscenza con determinazione.", strengths:["Expertise","Pensiero critico","Rigore","Indipendenza intellettuale"], cautions:["Può isolarsi","Difficoltà a comunicare le idee"] },
];

// ─── DATA: Cognitive Questions (20 questions for mock) ───
const COG_QUESTIONS = [
  // NUMERICAL - Series
  { id:"n1", cat:"numerical", sub:"Serie", q:"Quale numero completa la serie? 2, 6, 18, 54, ___", opts:["108","148","162","216"], correct:2, explain:"×3 ad ogni passo: 54×3=162" },
  { id:"n2", cat:"numerical", sub:"Serie", q:"Quale numero completa la serie? 3, 7, 15, 31, ___", opts:["47","59","63","67"], correct:2, explain:"+4, +8, +16, +32 → 31+32=63" },
  { id:"n3", cat:"numerical", sub:"Serie", q:"Quale numero completa la serie? 1, 4, 9, 16, 25, ___", opts:["30","36","42","49"], correct:1, explain:"Quadrati perfetti: 1²,2²,3²,4²,5²,6²=36" },
  // NUMERICAL - Word Problems
  { id:"n4", cat:"numerical", sub:"Problema", q:"4 colleghi hanno un'età media di 30 anni. Un quinto collega ha 40 anni. Qual è la nuova media?", opts:["31","32","33","34"], correct:1, explain:"(4×30+40)/5 = 160/5 = 32" },
  { id:"n5", cat:"numerical", sub:"Problema", q:"Un prodotto costa €80. Dopo uno sconto del 25%, viene applicata un'IVA del 10%. Qual è il prezzo finale?", opts:["€62","€66","€68","€70"], correct:1, explain:"80−25%=60, 60+10%=66" },
  { id:"n6", cat:"numerical", sub:"Confronto", q:"Qual è il valore PIÙ GRANDE tra:", opts:["3/8","0.36","37%","0.4"], correct:3, explain:"3/8=0.375, 37%=0.37, 0.36, 0.4 → 0.4 è il più grande" },
  { id:"n7", cat:"numerical", sub:"Confronto", q:"Qual è il valore PIÙ PICCOLO tra:", opts:["1/3","0.35","30%","0.28"], correct:3, explain:"1/3≈0.333, 0.35, 30%=0.30, 0.28 → 0.28" },
  // VERBAL - Antonyms
  { id:"v1", cat:"verbal", sub:"Antonimo", q:"Quale parola è il CONTRARIO di 'DILIGENTE'?", opts:["Negligente","Attento","Preciso","Rapido"], correct:0, explain:"Diligente=accurato, il contrario è negligente" },
  { id:"v2", cat:"verbal", sub:"Antonimo", q:"Quale parola è il CONTRARIO di 'PRAGMATICO'?", opts:["Realistico","Idealista","Concreto","Efficace"], correct:1, explain:"Pragmatico=pratico/concreto, il contrario è idealista" },
  { id:"v3", cat:"verbal", sub:"Antonimo", q:"Quale parola è il CONTRARIO di 'PROLISSO'?", opts:["Verboso","Conciso","Eloquente","Lento"], correct:1, explain:"Prolisso=troppo lungo, il contrario è conciso" },
  // VERBAL - Analogies
  { id:"v4", cat:"verbal", sub:"Analogia", q:"MEDICO : PAZIENTE = AVVOCATO : ___", opts:["Giudice","Cliente","Tribunale","Legge"], correct:1, explain:"Il medico ha il paziente, l'avvocato ha il cliente" },
  { id:"v5", cat:"verbal", sub:"Analogia", q:"PENNELLO : PITTORE = BISTURI : ___", opts:["Dottore","Chirurgo","Infermiere","Ospedale"], correct:1, explain:"Lo strumento specifico del chirurgo" },
  // VERBAL - Comprehension
  { id:"v6", cat:"verbal", sub:"Sillogismo", q:"Tutti i manager devono fare report mensili. Marco è un manager. Quindi:", opts:["Marco fa report settimanali","Marco deve fare report mensili","Marco potrebbe fare report","I report sono opzionali"], correct:1, explain:"Sillogismo: se tutti i manager → report, e Marco è manager → Marco fa report" },
  { id:"v7", cat:"verbal", sub:"Sillogismo", q:"Nessun progetto approvato ha superato il budget. Il progetto X ha superato il budget. Quindi:", opts:["Il progetto X è stato approvato","Il progetto X non è stato approvato","Il progetto X è in attesa","Non si può determinare"], correct:1, explain:"Se nessun approvato supera il budget, e X lo supera, X non è approvato" },
  // ABSTRACT - Patterns
  { id:"ab1", cat:"abstract", sub:"Pattern", q:"Osserva la sequenza: ◯ △ ◯◯ △△ ◯◯◯ — Cosa viene dopo?", opts:["◯◯◯◯","△△△","△△","◯◯"], correct:1, explain:"Il pattern alterna ◯ e △, raddoppiando: 1,1,2,2,3 → 3 triangoli" },
  { id:"ab2", cat:"abstract", sub:"Pattern", q:"In una sequenza, ogni figura ruota di 90° in senso orario e cambia colore (bianco→nero→bianco). Se la 3ª figura è un triangolo nero punta a destra, la 4ª è:", opts:["Triangolo bianco punta in basso","Triangolo nero punta in basso","Triangolo bianco punta a sinistra","Triangolo nero punta in alto"], correct:0, explain:"Ruota 90° (destra→basso) e cambia colore (nero→bianco)" },
  { id:"ab3", cat:"abstract", sub:"Odd-one-out", q:"Quale NON appartiene al gruppo? A: ▲ B: ◆ C: ★ D: ●", opts:["A (triangolo)","B (rombo)","C (stella)","D (cerchio)"], correct:3, explain:"A, B, C hanno vertici/angoli; D (cerchio) no" },
  // NUMERICAL bonus
  { id:"n8", cat:"numerical", sub:"Serie", q:"Quale numero completa la serie? 5, 10, 20, 40, ___", opts:["60","70","80","100"], correct:2, explain:"×2 ad ogni passo: 40×2=80" },
  { id:"n9", cat:"numerical", sub:"Problema", q:"Un team di 6 persone completa un progetto in 12 giorni. Quanti giorni servirebbero a 9 persone?", opts:["6","8","9","10"], correct:1, explain:"6×12=72 person-days. 72/9=8 giorni" },
  { id:"v8", cat:"verbal", sub:"Antonimo", q:"Quale parola è il CONTRARIO di 'ALTRUISTA'?", opts:["Generoso","Egoista","Gentile","Modesto"], correct:1, explain:"Altruista pensa agli altri, egoista pensa a sé" },
];

// ─── SCORING UTILS ───
function computeFactorScores(selectedIds) {
  const scores = { A:0, B:0, C:0, D:0, E:0 };
  const counts = { A:0, B:0, C:0, D:0, E:0 };
  selectedIds.forEach(id => {
    const adj = ADJECTIVES.find(a => a.id === id);
    if(adj) { scores[adj.factor] += adj.w; counts[adj.factor]++; }
  });
  // Normalize to 0-100 via sigmoid-like
  const normalize = (raw, factor) => {
    const maxPossible = ADJECTIVES.filter(a=>a.factor===factor&&a.w>0).reduce((s,a)=>s+a.w,0);
    const minPossible = ADJECTIVES.filter(a=>a.factor===factor&&a.w<0).reduce((s,a)=>s+a.w,0);
    const range = maxPossible - minPossible;
    if(range === 0) return 50;
    return Math.max(0, Math.min(100, ((raw - minPossible) / range) * 100));
  };
  return {
    A: normalize(scores.A, 'A'),
    B: normalize(scores.B, 'B'),
    C: normalize(scores.C, 'C'),
    D: normalize(scores.D, 'D'),
    E: normalize(scores.E, 'E'),
    M: selectedIds.length,
  };
}

function synthesize(selfConcept, self_) {
  return {
    A: self_.A * 0.6 + selfConcept.A * 0.4,
    B: self_.B * 0.6 + selfConcept.B * 0.4,
    C: self_.C * 0.6 + selfConcept.C * 0.4,
    D: self_.D * 0.6 + selfConcept.D * 0.4,
  };
}

function assignProfile(synthesis) {
  let minDist = Infinity, best = PROFILES[0];
  PROFILES.forEach(p => {
    const d = Math.sqrt(
      (synthesis.A - p.c.A)**2 +
      (synthesis.B - p.c.B)**2 +
      (synthesis.C - p.c.C)**2 +
      (synthesis.D - p.c.D)**2
    );
    if(d < minDist) { minDist = d; best = p; }
  });
  return best;
}

// ─── STYLES ───
const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  surface2: "#1a1a26",
  border: "#2a2a3a",
  accent: "#6366f1",
  accent2: "#8b5cf6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  cyan: "#06b6d4",
  text: "#e2e8f0",
  muted: "#64748b",
  dimmed: "#475569",
};

const FACTOR_COLORS = { A:"#ef4444", B:"#f59e0b", C:"#10b981", D:"#6366f1", E:"#06b6d4" };
const FACTOR_NAMES = { A:"Dominanza", B:"Estroversione", C:"Pazienza", D:"Formalità", E:"Oggettività" };
const GROUP_COLORS = { analytical:"#6366f1", social:"#f59e0b", stabilizing:"#10b981", persistent:"#ef4444" };
const GROUP_NAMES = { analytical:"Analitico", social:"Sociale", stabilizing:"Stabilizzante", persistent:"Persistente" };

// ─── COMPONENTS ───

function ProgressBar({ current, total, label }) {
  const pct = (current / total) * 100;
  return (
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{color:COLORS.muted,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{label}</span>
        <span style={{color:COLORS.muted,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{current}/{total}</span>
      </div>
      <div style={{height:4,background:COLORS.surface2,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${COLORS.accent},${COLORS.accent2})`,borderRadius:2,transition:"width 0.4s ease"}}/>
      </div>
    </div>
  );
}

function Timer({ seconds, total }) {
  const pct = (seconds / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 120;
  return (
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:isLow?COLORS.red:COLORS.text,minWidth:90,textAlign:"center"}}>
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
      </div>
      <div style={{flex:1,height:6,background:COLORS.surface2,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:isLow?"#ef4444":`linear-gradient(90deg,${COLORS.accent},${COLORS.green})`,borderRadius:3,transition:"width 1s linear"}}/>
      </div>
    </div>
  );
}

function FactorBar({ factor, value, label }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:13,color:COLORS.text,fontWeight:600}}>{label || FACTOR_NAMES[factor]}</span>
        <span style={{fontSize:13,color:FACTOR_COLORS[factor],fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{Math.round(value)}</span>
      </div>
      <div style={{height:10,background:COLORS.surface2,borderRadius:5,overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:2,background:COLORS.border,zIndex:1}}/>
        <div style={{height:"100%",width:`${value}%`,background:`linear-gradient(90deg,${FACTOR_COLORS[factor]}88,${FACTOR_COLORS[factor]})`,borderRadius:5,transition:"width 0.8s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
        <span style={{fontSize:10,color:COLORS.dimmed}}>Basso</span>
        <span style={{fontSize:10,color:COLORS.dimmed}}>Alto</span>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [phase, setPhase] = useState("welcome"); 
  // welcome → beh_instructions → beh_list1 → beh_list2 → beh_done → cog_instructions → cognitive → results
  const [sel1, setSel1] = useState(new Set());
  const [sel2, setSel2] = useState(new Set());
  const [shuffledAdj] = useState(() => shuffle(ADJECTIVES));
  const [cogAnswers, setCogAnswers] = useState({});
  const [cogIdx, setCogIdx] = useState(0);
  const [cogTime, setCogTime] = useState(720); // 12 min
  const [shuffledQ] = useState(() => shuffle(COG_QUESTIONS));
  const [results, setResults] = useState(null);

  // Cognitive timer
  useEffect(() => {
    if(phase !== "cognitive") return;
    if(cogTime <= 0) { finishAll(); return; }
    const t = setTimeout(() => setCogTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, cogTime]);

  const toggleAdj = useCallback((id, listNum) => {
    const setter = listNum === 1 ? setSel1 : setSel2;
    setter(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const finishAll = useCallback(() => {
    const sc1 = computeFactorScores([...sel1]);
    const sc2 = computeFactorScores([...sel2]);
    const synth = synthesize(sc1, sc2);
    const profile = assignProfile(synth);
    
    let cogCorrect = 0, numC=0, verC=0, absC=0;
    let numT=0, verT=0, absT=0;
    shuffledQ.forEach((q,i) => {
      if(q.cat==="numerical") numT++;
      if(q.cat==="verbal") verT++;
      if(q.cat==="abstract") absT++;
      if(cogAnswers[i] === q.correct) {
        cogCorrect++;
        if(q.cat==="numerical") numC++;
        if(q.cat==="verbal") verC++;
        if(q.cat==="abstract") absC++;
      }
    });
    const answered = Object.keys(cogAnswers).length;
    const scaled = Math.round(100 + (cogCorrect / shuffledQ.length) * 350);

    setResults({
      selfConcept: sc1, self: sc2, synthesis: synth, profile,
      mScore1: sc1.M, mScore2: sc2.M,
      cognitive: { correct: cogCorrect, answered, total: shuffledQ.length, scaled,
        numerical: numT>0 ? Math.round(numC/numT*100) : 0,
        verbal: verT>0 ? Math.round(verC/verT*100) : 0,
        abstract: absT>0 ? Math.round(absC/absT*100) : 0,
      }
    });
    setPhase("results");
  }, [sel1, sel2, cogAnswers, shuffledQ]);

  // ─── RENDER ───
  const container = {
    minHeight:"100vh", background:COLORS.bg, color:COLORS.text,
    fontFamily:"'Instrument Sans','SF Pro Display','Segoe UI',system-ui,sans-serif",
  };
  const card = {
    background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:16,
    padding:32, maxWidth:800, margin:"0 auto",
  };
  const btn = (primary=true) => ({
    padding:"14px 32px", borderRadius:10, border:"none", cursor:"pointer", fontSize:15, fontWeight:600,
    background: primary ? `linear-gradient(135deg,${COLORS.accent},${COLORS.accent2})` : COLORS.surface2,
    color: primary ? "#fff" : COLORS.text,
    transition:"transform 0.15s,box-shadow 0.15s",
  });

  // ── WELCOME ──
  if(phase === "welcome") {
    return (
      <div style={container}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🧠</div>
          <h1 style={{fontSize:36,fontWeight:800,margin:0,background:`linear-gradient(135deg,${COLORS.accent},${COLORS.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Behavioral & Cognitive Assessment
          </h1>
          <p style={{color:COLORS.muted,fontSize:17,lineHeight:1.7,margin:"20px 0 40px"}}>
            Questo assessment misura il tuo profilo comportamentale lavorativo e le tue abilità cognitive. 
            Si compone di due parti: un assessment comportamentale (senza limiti di tempo) e un test cognitivo (12 minuti).
          </p>
          <div style={{...card,textAlign:"left",marginBottom:32}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              <div>
                <div style={{fontSize:13,color:COLORS.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Parte 1</div>
                <div style={{fontSize:17,fontWeight:600,marginBottom:4}}>Assessment Comportamentale</div>
                <div style={{color:COLORS.muted,fontSize:14}}>2 liste di 86 aggettivi · ~6 minuti · Nessun limite di tempo</div>
              </div>
              <div>
                <div style={{fontSize:13,color:COLORS.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Parte 2</div>
                <div style={{fontSize:17,fontWeight:600,marginBottom:4}}>Assessment Cognitivo</div>
                <div style={{color:COLORS.muted,fontSize:14}}>{shuffledQ.length} domande · 12 minuti · Ragionamento numerico, verbale e astratto</div>
              </div>
            </div>
          </div>
          <button style={btn()} onClick={() => setPhase("beh_instructions")}>Inizia Assessment →</button>
        </div>
      </div>
    );
  }

  // ── BEHAVIORAL INSTRUCTIONS ──
  if(phase === "beh_instructions") {
    return (
      <div style={container}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"60px 24px"}}>
          <div style={card}>
            <div style={{fontSize:13,color:COLORS.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Parte 1 — Assessment Comportamentale</div>
            <h2 style={{fontSize:24,fontWeight:700,margin:"0 0 16px"}}>Come funziona</h2>
            <p style={{color:COLORS.muted,lineHeight:1.7,margin:"0 0 16px"}}>
              Ti verranno presentate <strong style={{color:COLORS.text}}>due liste di aggettivi</strong>. Per ciascuna lista, seleziona gli aggettivi che ritieni pertinenti.
            </p>
            <div style={{background:COLORS.surface2,borderRadius:10,padding:20,marginBottom:16}}>
              <p style={{margin:"0 0 12px",fontSize:14}}><strong style={{color:COLORS.accent}}>Lista 1:</strong> Seleziona gli aggettivi che descrivono come <em>gli altri si aspettano</em> che tu ti comporti al lavoro.</p>
              <p style={{margin:0,fontSize:14}}><strong style={{color:COLORS.accent2}}>Lista 2:</strong> Seleziona gli aggettivi che descrivono come <em>sei realmente</em>.</p>
            </div>
            <div style={{background:`${COLORS.amber}15`,border:`1px solid ${COLORS.amber}30`,borderRadius:10,padding:16,marginBottom:24}}>
              <p style={{margin:0,fontSize:13,color:COLORS.amber}}>💡 Non ci sono risposte giuste o sbagliate. Seleziona tra 20 e 50 aggettivi per lista per un risultato ottimale.</p>
            </div>
            <button style={btn()} onClick={() => setPhase("beh_list1")}>Inizia Lista 1 →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── BEHAVIORAL LIST (1 or 2) ──
  if(phase === "beh_list1" || phase === "beh_list2") {
    const listNum = phase === "beh_list1" ? 1 : 2;
    const sel = listNum === 1 ? sel1 : sel2;
    const prompt = listNum === 1 
      ? "Seleziona gli aggettivi che descrivono come gli altri si aspettano che tu ti comporti al lavoro"
      : "Seleziona gli aggettivi che descrivono come sei realmente";
    const count = sel.size;
    const isValid = count >= 6;
    const isOptimal = count >= 20 && count <= 50;

    return (
      <div style={container}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
          <ProgressBar current={listNum} total={2} label={`Lista ${listNum} di 2`} />
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:13,color:COLORS.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
                  Lista {listNum} — {listNum===1?"Self-Concept":"Self"}
                </div>
                <p style={{color:COLORS.muted,fontSize:14,margin:0}}>{prompt}</p>
              </div>
              <div style={{textAlign:"center",minWidth:80}}>
                <div style={{fontSize:32,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:isOptimal?COLORS.green:count<6?COLORS.red:COLORS.amber}}>{count}</div>
                <div style={{fontSize:11,color:COLORS.muted}}>selezionati</div>
              </div>
            </div>
            
            {!isOptimal && count > 0 && (
              <div style={{background:count<6?`${COLORS.red}15`:count>50?`${COLORS.amber}15`:`${COLORS.amber}10`,border:`1px solid ${count<6?COLORS.red:COLORS.amber}30`,borderRadius:8,padding:10,marginBottom:16,fontSize:12,color:count<6?COLORS.red:COLORS.amber}}>
                {count < 6 ? "⚠️ Seleziona almeno 6 aggettivi" : count > 50 ? "⚠️ Stai selezionando molti aggettivi (consigliato: 20-50)" : `💡 Consigliato: 20-50 aggettivi`}
              </div>
            )}

            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {shuffledAdj.map(adj => {
                const isSelected = sel.has(adj.id);
                return (
                  <button key={adj.id}
                    onClick={() => toggleAdj(adj.id, listNum)}
                    style={{
                      padding:"8px 16px", borderRadius:20, border:`1.5px solid ${isSelected?COLORS.accent:COLORS.border}`,
                      background:isSelected?`${COLORS.accent}20`:COLORS.surface2,
                      color:isSelected?COLORS.accent:COLORS.text,
                      fontSize:13, fontWeight:isSelected?600:400, cursor:"pointer",
                      transition:"all 0.15s",
                    }}
                  >
                    {adj.it}
                  </button>
                );
              })}
            </div>

            <div style={{marginTop:28,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {listNum === 2 && <button style={btn(false)} onClick={() => setPhase("beh_list1")}>← Lista 1</button>}
              <div style={{flex:1}}/>
              <button 
                style={{...btn(isValid),opacity:isValid?1:0.4,pointerEvents:isValid?"auto":"none"}} 
                onClick={() => {
                  if(listNum === 1) setPhase("beh_list2");
                  else setPhase("beh_done");
                }}
              >
                {listNum === 1 ? "Continua → Lista 2" : "Completa Assessment →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BEHAVIORAL DONE → COGNITIVE INSTRUCTIONS ──
  if(phase === "beh_done" || phase === "cog_instructions") {
    return (
      <div style={container}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"60px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>✅</div>
          <h2 style={{fontSize:24,fontWeight:700,margin:"0 0 12px"}}>Assessment Comportamentale completato!</h2>
          <p style={{color:COLORS.muted,margin:"0 0 32px"}}>Ora passiamo all'assessment cognitivo.</p>
          <div style={card}>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:13,color:COLORS.green,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Parte 2 — Assessment Cognitivo</div>
              <h3 style={{fontSize:20,fontWeight:600,margin:"0 0 12px"}}>Regole</h3>
              <div style={{color:COLORS.muted,fontSize:14,lineHeight:1.8}}>
                <p>• <strong style={{color:COLORS.text}}>{shuffledQ.length} domande</strong> — ragionamento numerico, verbale e astratto</p>
                <p>• <strong style={{color:COLORS.text}}>12 minuti</strong> di tempo — il timer parte subito</p>
                <p>• Puoi navigare avanti e indietro tra le domande</p>
                <p>• Non ci sono penalità per risposte sbagliate — tenta sempre</p>
              </div>
            </div>
            <div style={{marginTop:24,textAlign:"center"}}>
              <button style={btn()} onClick={() => { setCogTime(720); setPhase("cognitive"); }}>
                Inizia Test Cognitivo — 12:00 ⏱️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── COGNITIVE TEST ──
  if(phase === "cognitive") {
    const q = shuffledQ[cogIdx];
    const catColors = { numerical:COLORS.accent, verbal:COLORS.amber, abstract:COLORS.green };
    const catNames = { numerical:"Numerico", verbal:"Verbale", abstract:"Astratto" };

    return (
      <div style={container}>
        <div style={{maxWidth:700,margin:"0 auto",padding:"32px 24px"}}>
          <Timer seconds={cogTime} total={720} />
          <div style={{marginTop:16}}>
            <ProgressBar current={Object.keys(cogAnswers).length} total={shuffledQ.length} label={`Risposte date`} />
          </div>
          <div style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:catColors[q.cat],background:`${catColors[q.cat]}18`,padding:"4px 12px",borderRadius:6}}>
                {catNames[q.cat]} — {q.sub}
              </span>
              <span style={{color:COLORS.muted,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>
                {cogIdx + 1} / {shuffledQ.length}
              </span>
            </div>
            <h3 style={{fontSize:18,fontWeight:600,margin:"0 0 24px",lineHeight:1.6}}>{q.q}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {q.opts.map((opt, i) => {
                const isSelected = cogAnswers[cogIdx] === i;
                return (
                  <button key={i}
                    onClick={() => setCogAnswers(prev => ({...prev, [cogIdx]: i}))}
                    style={{
                      padding:"14px 20px", borderRadius:10, border:`1.5px solid ${isSelected?COLORS.accent:COLORS.border}`,
                      background:isSelected?`${COLORS.accent}15`:COLORS.surface2,
                      color:isSelected?COLORS.accent:COLORS.text,
                      fontSize:15, fontWeight:isSelected?600:400, cursor:"pointer",
                      textAlign:"left", transition:"all 0.15s",
                      display:"flex", alignItems:"center", gap:12,
                    }}
                  >
                    <span style={{width:28,height:28,borderRadius:7,border:`2px solid ${isSelected?COLORS.accent:COLORS.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:isSelected?COLORS.accent:"transparent",color:isSelected?"#fff":COLORS.muted,flexShrink:0}}>
                      {String.fromCharCode(65+i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
              <button style={{...btn(false),opacity:cogIdx>0?1:0.3}} onClick={() => cogIdx>0 && setCogIdx(cogIdx-1)}>← Precedente</button>
              {cogIdx < shuffledQ.length - 1 ? (
                <button style={btn()} onClick={() => setCogIdx(cogIdx+1)}>Successiva →</button>
              ) : (
                <button style={{...btn(),background:`linear-gradient(135deg,${COLORS.green},#059669)`}} onClick={finishAll}>
                  Termina Assessment ✓
                </button>
              )}
            </div>
            {/* Question nav dots */}
            <div style={{marginTop:20,display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
              {shuffledQ.map((_, i) => (
                <button key={i} onClick={() => setCogIdx(i)} style={{
                  width:24,height:24,borderRadius:6,border:`1px solid ${i===cogIdx?COLORS.accent:COLORS.border}`,
                  background:cogAnswers[i]!==undefined?(i===cogIdx?COLORS.accent:`${COLORS.accent}40`):i===cogIdx?COLORS.surface2:"transparent",
                  color:i===cogIdx?COLORS.text:COLORS.muted,fontSize:10,fontWeight:600,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>{i+1}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if(phase === "results" && results) {
    const { selfConcept, self: self_, synthesis, profile, cognitive } = results;
    return (
      <div style={container}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
          {/* Header */}
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:56,marginBottom:8}}>{profile.icon}</div>
            <h1 style={{fontSize:32,fontWeight:800,margin:"0 0 4px"}}>{profile.name}</h1>
            <span style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:GROUP_COLORS[profile.group],background:`${GROUP_COLORS[profile.group]}18`,padding:"4px 14px",borderRadius:6,display:"inline-block"}}>
              {GROUP_NAMES[profile.group]}
            </span>
            <p style={{color:COLORS.muted,fontSize:16,margin:"16px auto 0",maxWidth:560,lineHeight:1.7}}>{profile.desc}</p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {/* Behavioral Results */}
            <div style={card}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",textTransform:"uppercase",letterSpacing:1,color:COLORS.accent}}>Profilo Comportamentale — Synthesis</h3>
              {["A","B","C","D"].map(f => <FactorBar key={f} factor={f} value={synthesis[f]} />)}
              <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{background:COLORS.surface2,borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:11,color:COLORS.muted,marginBottom:4}}>M Score (Lista 1)</div>
                  <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{results.mScore1}</div>
                </div>
                <div style={{background:COLORS.surface2,borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:11,color:COLORS.muted,marginBottom:4}}>M Score (Lista 2)</div>
                  <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{results.mScore2}</div>
                </div>
              </div>
            </div>

            {/* Cognitive Results */}
            <div style={card}>
              <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",textTransform:"uppercase",letterSpacing:1,color:COLORS.green}}>Assessment Cognitivo</h3>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:52,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",background:`linear-gradient(135deg,${COLORS.green},${COLORS.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                  {cognitive.scaled}
                </div>
                <div style={{color:COLORS.muted,fontSize:13}}>Scaled Score (100-450)</div>
                <div style={{color:COLORS.muted,fontSize:13,marginTop:4}}>
                  {cognitive.correct}/{cognitive.total} corrette · {cognitive.answered} risposte date
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                {[{label:"Numerico",val:cognitive.numerical,col:COLORS.accent},{label:"Verbale",val:cognitive.verbal,col:COLORS.amber},{label:"Astratto",val:cognitive.abstract,col:COLORS.green}].map(s => (
                  <div key={s.label} style={{flex:1,background:COLORS.surface2,borderRadius:10,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:s.col}}>{s.val}%</div>
                    <div style={{fontSize:11,color:COLORS.muted,marginTop:4}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div style={{...card,marginTop:24}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
              <div>
                <h4 style={{fontSize:14,fontWeight:700,color:COLORS.green,margin:"0 0 12px"}}>✦ Punti di forza</h4>
                {profile.strengths.map(s => (
                  <div key={s} style={{padding:"8px 0",borderBottom:`1px solid ${COLORS.border}`,fontSize:14,color:COLORS.text}}>{s}</div>
                ))}
              </div>
              <div>
                <h4 style={{fontSize:14,fontWeight:700,color:COLORS.amber,margin:"0 0 12px"}}>⚠ Aree di attenzione</h4>
                {profile.cautions.map(s => (
                  <div key={s} style={{padding:"8px 0",borderBottom:`1px solid ${COLORS.border}`,fontSize:14,color:COLORS.text}}>{s}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Self vs Self-Concept comparison */}
          <div style={{...card,marginTop:24}}>
            <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 20px",textTransform:"uppercase",letterSpacing:1,color:COLORS.accent2}}>Confronto Self-Concept vs Self</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
              <div>
                <div style={{fontSize:13,color:COLORS.muted,marginBottom:12,fontWeight:600}}>Self-Concept (come ti adatti)</div>
                {["A","B","C","D"].map(f => <FactorBar key={f} factor={f} value={selfConcept[f]} />)}
              </div>
              <div>
                <div style={{fontSize:13,color:COLORS.muted,marginBottom:12,fontWeight:600}}>Self (chi sei realmente)</div>
                {["A","B","C","D"].map(f => <FactorBar key={f} factor={f} value={self_[f]} />)}
              </div>
            </div>
          </div>

          {/* Restart */}
          <div style={{textAlign:"center",marginTop:32,paddingBottom:40}}>
            <button style={btn(false)} onClick={() => {
              setPhase("welcome"); setSel1(new Set()); setSel2(new Set());
              setCogAnswers({}); setCogIdx(0); setCogTime(720); setResults(null);
            }}>
              Ricomincia Assessment ↻
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
