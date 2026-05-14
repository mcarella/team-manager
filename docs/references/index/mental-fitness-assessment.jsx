import { useState, useMemo, useCallback } from "react";

// ─── SABOTEUR DATA ───
const SABOTEURS = {
  judge: { name:"Il Giudice", icon:"⚖️", color:"#dc2626", universal:true, desc:"Trova difetti in te, negli altri e nelle circostanze. Causa colpa, vergogna e ansia.", lie:"Senza di me, non migliorerai mai", strength:"Discernimento", sage:["empathize","explore"] },
  stickler: { name:"Il Perfezionista", icon:"📐", color:"#7c3aed", desc:"Perfezionismo e bisogno di ordine estremo. Frustrazione quando le cose non sono 'giuste'.", lie:"La perfezione è la via per il successo", strength:"Precisione e attenzione ai dettagli", sage:["innovate","activate"] },
  pleaser: { name:"Il Compiacente", icon:"🤗", color:"#ec4899", desc:"Cerca accettazione aiutando gli altri, trascurando i propri bisogni.", lie:"Devo guadagnarmi l'amore aiutando", strength:"Empatia e generosità", sage:["empathize","navigate"] },
  hyper_achiever: { name:"L'Iperperformante", icon:"🏆", color:"#f59e0b", desc:"Dipendente dalla performance costante. Ogni successo viene subito sminuito.", lie:"La felicità è nel prossimo traguardo", strength:"Ambizione e drive", sage:["empathize","navigate"] },
  victim: { name:"La Vittima", icon:"😢", color:"#6366f1", desc:"Impotenza e autocommiserazione per attirare attenzione e simpatia.", lie:"La sofferenza mi rende speciale", strength:"Sensibilità emotiva", sage:["empathize","activate"] },
  hyper_rational: { name:"L'Iper-razionale", icon:"🧮", color:"#06b6d4", desc:"Focus esclusivo sulla logica, anche nelle relazioni. Percepito come freddo.", lie:"La razionalità è sempre superiore", strength:"Pensiero analitico", sage:["empathize","explore"] },
  hyper_vigilant: { name:"L'Ipervigilante", icon:"👁️", color:"#84cc16", desc:"Ansia continua su pericoli e rischi. Vigilanza che non riposa mai.", lie:"Devo stare sempre all'erta", strength:"Prudenza e prevenzione", sage:["explore","activate"] },
  restless: { name:"L'Irrequieto", icon:"🦋", color:"#f97316", desc:"Ricerca costante di nuovi stimoli. Non riesce a godersi il presente.", lie:"La prossima cosa mi renderà felice", strength:"Energia e adattabilità", sage:["navigate","empathize"] },
  controller: { name:"Il Controllore", icon:"🎮", color:"#ef4444", desc:"Bisogno ansioso di controllare tutto e tutti. Ansia quando non è possibile.", lie:"Senza il mio controllo, tutto crolla", strength:"Determinazione e azione", sage:["empathize","innovate"] },
  avoider: { name:"L'Evitatore", icon:"🙈", color:"#10b981", desc:"Evita conflitti, problemi e compiti spiacevoli. Procrastina.", lie:"Evitare i problemi mantiene la pace", strength:"Diplomazia e positività", sage:["activate","navigate"] },
};

const SAGE_POWERS = {
  empathize: { name:"Empathize", icon:"💚", desc:"Compassione per te stesso e gli altri" },
  explore: { name:"Explore", icon:"🔍", desc:"Curiosità aperta, mente da principiante" },
  innovate: { name:"Innovate", icon:"💡", desc:"Creatività e pensiero laterale" },
  navigate: { name:"Navigate", icon:"🧭", desc:"Allineamento con i tuoi valori profondi" },
  activate: { name:"Activate", icon:"⚡", desc:"Azione chiara e decisa" },
};

// ─── QUESTIONS ───
const SAB_QUESTIONS = [
  // JUDGE (8)
  { id:"j1", sab:"judge", text:"Mi critico spesso per i miei errori, anche quelli piccoli" },
  { id:"j2", sab:"judge", text:"Tendo a focalizzarmi su ciò che non va nelle persone piuttosto che sui pregi" },
  { id:"j3", sab:"judge", text:"Quando qualcosa va storto, cerco subito chi è colpevole" },
  { id:"j4", sab:"judge", text:"Mi sveglio di notte preoccupandomi di cosa potrebbe andare male" },
  { id:"j5", sab:"judge", text:"Sono raramente soddisfatto dei miei risultati" },
  { id:"j6", sab:"judge", text:"Giudico le scelte degli altri come inferiori alle mie" },
  { id:"j7", sab:"judge", text:"Quando qualcosa non funziona, fatico a vederci qualcosa di positivo" },
  { id:"j8", sab:"judge", text:"Mi rimprovero per cose successe molto tempo fa" },
  // STICKLER (5)
  { id:"s1", sab:"stickler", text:"Mi frustra quando le cose non sono fatte nel modo 'giusto'" },
  { id:"s2", sab:"stickler", text:"Dedico più tempo del necessario a perfezionare dettagli" },
  { id:"s3", sab:"stickler", text:"Mi irrito quando gli altri non mantengono i miei standard" },
  { id:"s4", sab:"stickler", text:"Preferisco rifare qualcosa io piuttosto che accettare un lavoro imperfetto" },
  { id:"s5", sab:"stickler", text:"L'idea di 'abbastanza buono' mi mette a disagio" },
  // PLEASER (5)
  { id:"p1", sab:"pleaser", text:"Mi è difficile dire 'no' alle richieste degli altri" },
  { id:"p2", sab:"pleaser", text:"Tendo a mettere i bisogni degli altri prima dei miei" },
  { id:"p3", sab:"pleaser", text:"Mi sento ferito quando non riconoscono quanto faccio per loro" },
  { id:"p4", sab:"pleaser", text:"Cerco di guadagnare affetto attraverso l'aiuto e la disponibilità" },
  { id:"p5", sab:"pleaser", text:"Mi sento in colpa quando dedico tempo a me stesso" },
  // HYPER-ACHIEVER (5)
  { id:"ha1", sab:"hyper_achiever", text:"La mia autostima dipende fortemente dai risultati professionali" },
  { id:"ha2", sab:"hyper_achiever", text:"Dopo un successo, passo rapidamente al prossimo obiettivo" },
  { id:"ha3", sab:"hyper_achiever", text:"Mi sento a disagio quando non sto facendo qualcosa di 'produttivo'" },
  { id:"ha4", sab:"hyper_achiever", text:"Valuto le persone in base ai loro risultati" },
  { id:"ha5", sab:"hyper_achiever", text:"Ho paura che senza successi costanti, perderei il rispetto degli altri" },
  // VICTIM (4)
  { id:"v1", sab:"victim", text:"Sento spesso che le cose brutte capitano proprio a me" },
  { id:"v2", sab:"victim", text:"A volte mi concentro sui miei problemi per ottenere simpatia" },
  { id:"v3", sab:"victim", text:"Mi sento impotente di fronte alle circostanze della vita" },
  { id:"v4", sab:"victim", text:"Tendo a lamentarmi di come le cose non siano giuste" },
  // HYPER-RATIONAL (4)
  { id:"hr1", sab:"hyper_rational", text:"Processo tutto attraverso la logica, incluse le relazioni" },
  { id:"hr2", sab:"hyper_rational", text:"Mi impazientisco quando le persone si lasciano guidare dalle emozioni" },
  { id:"hr3", sab:"hyper_rational", text:"Preferisco analizzare piuttosto che parlare di come mi sento" },
  { id:"hr4", sab:"hyper_rational", text:"Gli altri mi percepiscono a volte come freddo o distaccato" },
  // HYPER-VIGILANT (5)
  { id:"hv1", sab:"hyper_vigilant", text:"Mi preoccupo costantemente di cosa potrebbe andare storto" },
  { id:"hv2", sab:"hyper_vigilant", text:"Faccio fatica a fidarmi delle intenzioni degli altri" },
  { id:"hv3", sab:"hyper_vigilant", text:"Cerco rassicurazione nelle regole e nelle procedure" },
  { id:"hv4", sab:"hyper_vigilant", text:"Quando le cose vanno bene, aspetto che succeda qualcosa di brutto" },
  { id:"hv5", sab:"hyper_vigilant", text:"Mi sento cinico riguardo alle motivazioni delle persone" },
  // RESTLESS (4)
  { id:"r1", sab:"restless", text:"Mi annoio facilmente e cerco costantemente nuovi stimoli" },
  { id:"r2", sab:"restless", text:"Ho difficoltà a stare fermo e godermi il momento presente" },
  { id:"r3", sab:"restless", text:"Mi distraggo facilmente e salto da un'attività all'altra" },
  { id:"r4", sab:"restless", text:"Ho paura di perdere esperienze importanti (FOMO)" },
  // CONTROLLER (5)
  { id:"c1", sab:"controller", text:"Sento il bisogno di avere il controllo sulle situazioni" },
  { id:"c2", sab:"controller", text:"Mi provoca ansia quando non posso influenzare il risultato" },
  { id:"c3", sab:"controller", text:"Tendo a dire agli altri cosa fare e come farlo" },
  { id:"c4", sab:"controller", text:"Mi è difficile delegare perché penso di farlo meglio" },
  { id:"c5", sab:"controller", text:"Quando non sono al comando, mi sento irrequieto" },
  // AVOIDER (5)
  { id:"a1", sab:"avoider", text:"Tendo a rimandare conversazioni difficili" },
  { id:"a2", sab:"avoider", text:"Preferisco concentrarmi sugli aspetti positivi ignorando i problemi" },
  { id:"a3", sab:"avoider", text:"Ho difficoltà ad affrontare conflitti direttamente" },
  { id:"a4", sab:"avoider", text:"Mi rifugio in routine confortanti quando sono stressato" },
  { id:"a5", sab:"avoider", text:"Dico 'va tutto bene' anche quando non è vero" },
];

const PQ_PAIRS = [
  { id:"pq1", pos:"Calma, serenità", neg:"Ansia, preoccupazione" },
  { id:"pq2", pos:"Gioia, entusiasmo", neg:"Tristezza, abbattimento" },
  { id:"pq3", pos:"Curiosità, apertura", neg:"Cinismo, chiusura" },
  { id:"pq4", pos:"Compassione, empatia", neg:"Giudizio, critica" },
  { id:"pq5", pos:"Gratitudine", neg:"Risentimento, invidia" },
  { id:"pq6", pos:"Fiducia, ottimismo", neg:"Paura, pessimismo" },
  { id:"pq7", pos:"Senso di scopo", neg:"Vuoto, insensatezza" },
  { id:"pq8", pos:"Creatività, ispirazione", neg:"Blocco, stagnazione" },
  { id:"pq9", pos:"Energia, vitalità", neg:"Esaurimento, stanchezza" },
  { id:"pq10", pos:"Connessione", neg:"Isolamento, solitudine" },
  { id:"pq11", pos:"Accettazione, pace", neg:"Frustrazione, irritazione" },
  { id:"pq12", pos:"Determinazione", neg:"Confusione, indecisione" },
  { id:"pq13", pos:"Leggerezza, gioco", neg:"Pesantezza, serietà" },
  { id:"pq14", pos:"Coraggio, fiducia in sé", neg:"Insicurezza, dubbio" },
  { id:"pq15", pos:"Generosità", neg:"Chiusura, difensività" },
  { id:"pq16", pos:"Meraviglia, stupore", neg:"Noia, apatia" },
  { id:"pq17", pos:"Pazienza, tolleranza", neg:"Impazienza, agitazione" },
  { id:"pq18", pos:"Presenza, mindfulness", neg:"Distrazione, ruminazione" },
];

// Shuffle
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };

// ─── COLORS ───
const C = {
  bg:"#faf9f7", surface:"#ffffff", surface2:"#f3f1ee", border:"#e5e2dc",
  text:"#1a1a1a", muted:"#6b6560", dimmed:"#9c9590",
  accent:"#6366f1", sage:"#10b981", saboteur:"#dc2626", warm:"#f59e0b",
  card:"#ffffff",
};
const LIKERT = [
  { val:1, label:"Per niente", color:"#10b981" },
  { val:2, label:"Poco", color:"#84cc16" },
  { val:3, label:"Abbastanza", color:"#f59e0b" },
  { val:4, label:"Molto", color:"#f97316" },
  { val:5, label:"Totalmente", color:"#ef4444" },
];

// ─── SCORING ───
function computeSaboteurScores(answers) {
  const scores = {};
  const counts = {};
  Object.keys(SABOTEURS).forEach(k => { scores[k]=0; counts[k]=0; });
  SAB_QUESTIONS.forEach((q,i) => {
    if(answers[i] !== undefined) {
      scores[q.sab] += answers[i];
      counts[q.sab]++;
    }
  });
  const normalized = {};
  Object.keys(scores).forEach(k => {
    normalized[k] = counts[k] > 0 ? ((scores[k] / counts[k] - 1) / 4) * 10 : 0;
  });
  return normalized;
}

function computePQScore(pqAnswers) {
  let totalPos=0, totalNeg=0;
  PQ_PAIRS.forEach((_, i) => {
    if(pqAnswers[i]) {
      totalPos += pqAnswers[i].pos || 0;
      totalNeg += pqAnswers[i].neg || 0;
    }
  });
  if(totalPos + totalNeg === 0) return 50;
  return Math.round((totalPos / (totalPos + totalNeg)) * 100);
}

// ─── RADAR CHART (pure SVG) ───
function RadarChart({ scores }) {
  const keys = Object.keys(scores).filter(k => k !== 'judge');
  const allKeys = ['judge', ...keys];
  const n = allKeys.length;
  const cx=160, cy=160, r=120;
  const angleStep = (2*Math.PI) / n;
  const getPoint = (i, val) => {
    const angle = -Math.PI/2 + i * angleStep;
    const dist = (val / 10) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const gridLevels = [2.5, 5, 7.5, 10];
  const dataPoints = allKeys.map((k,i) => getPoint(i, scores[k]));
  const pathD = dataPoints.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 320 320" style={{width:"100%",maxWidth:360,margin:"0 auto",display:"block"}}>
      {gridLevels.map(lv => {
        const pts = allKeys.map((_,i) => getPoint(i, lv));
        return <polygon key={lv} points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#e5e2dc" strokeWidth={1} />;
      })}
      {allKeys.map((k,i) => {
        const end = getPoint(i, 10);
        const label = getPoint(i, 11.5);
        return (
          <g key={k}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e5e2dc" strokeWidth={1} />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={SABOTEURS[k].color} fontWeight={600}>
              {SABOTEURS[k].icon}
            </text>
          </g>
        );
      })}
      <polygon points={dataPoints.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(220,38,38,0.15)" stroke="#dc2626" strokeWidth={2} />
      {dataPoints.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={SABOTEURS[allKeys[i]].color} stroke="#fff" strokeWidth={2} />
      ))}
    </svg>
  );
}

// ─── PQ GAUGE ───
function PQGauge({ score }) {
  const angle = (score / 100) * 180;
  const rad = (a) => (a - 180) * Math.PI / 180;
  const r = 100;
  const endX = 120 + r * Math.cos(rad(angle));
  const endY = 130 + r * Math.sin(rad(angle));
  const color = score >= 75 ? '#10b981' : score >= 65 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444';
  const label = score >= 75 ? 'Sopra il Tipping Point! 🎉' : score >= 65 ? 'Buon livello, quasi al tipping point' : score >= 50 ? 'Zona mista — i saboteur interferiscono' : 'I saboteur dominano';

  return (
    <div style={{textAlign:"center"}}>
      <svg viewBox="0 0 240 140" style={{width:"100%",maxWidth:300,margin:"0 auto",display:"block"}}>
        <path d={`M 20 130 A 100 100 0 0 1 220 130`} fill="none" stroke="#e5e2dc" strokeWidth={16} strokeLinecap="round" />
        <path d={`M 20 130 A 100 100 0 0 1 220 130`} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${(score/100)*314} 314`} />
        <line x1={120} y1={130} x2={endX} y2={endY} stroke={C.text} strokeWidth={3} strokeLinecap="round" />
        <circle cx={120} cy={130} r={6} fill={C.text} />
        <text x={20} y={138} fontSize={10} fill={C.muted}>0</text>
        <text x={116} y={20} fontSize={10} fill={C.muted} textAnchor="middle">50</text>
        <text x={215} y={138} fontSize={10} fill={C.muted}>100</text>
        <text x={168} y={35} fontSize={9} fill="#10b981" fontWeight={600}>75</text>
      </svg>
      <div style={{fontSize:42,fontWeight:800,color,marginTop:-8,fontFamily:"'DM Mono','JetBrains Mono',monospace"}}>{score}</div>
      <div style={{fontSize:13,color:C.muted,marginTop:4}}>{label}</div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [phase, setPhase] = useState("welcome");
  const [sabAnswers, setSabAnswers] = useState({});
  const [sabIdx, setSabIdx] = useState(0);
  const [pqAnswers, setPqAnswers] = useState({});
  const [pqIdx, setPqIdx] = useState(0);
  const [results, setResults] = useState(null);
  const [shuffledSab] = useState(() => shuffle(SAB_QUESTIONS));

  const finishAll = useCallback(() => {
    // Re-map shuffled answers back to original order
    const origAnswers = {};
    shuffledSab.forEach((q, shuffledIdx) => {
      const origIdx = SAB_QUESTIONS.findIndex(oq => oq.id === q.id);
      if(sabAnswers[shuffledIdx] !== undefined) origAnswers[origIdx] = sabAnswers[shuffledIdx];
    });
    const sabScores = computeSaboteurScores(origAnswers);
    const pq = computePQScore(pqAnswers);
    const sorted = Object.entries(sabScores).sort((a,b) => b[1] - a[1]);
    setResults({ sabScores, pq, sorted });
    setPhase("results");
  }, [sabAnswers, pqAnswers, shuffledSab]);

  const wrap = { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans','Instrument Sans','SF Pro Display',system-ui,sans-serif" };
  const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" };
  const btn = (primary=true, clr) => ({
    padding:"14px 32px", borderRadius:12, border:"none", cursor:"pointer", fontSize:15, fontWeight:600,
    background:primary ? (clr||C.accent) : C.surface2, color:primary?"#fff":C.text, transition:"all 0.15s",
  });

  // ── WELCOME ──
  if(phase === "welcome") return (
    <div style={wrap}>
      <div style={{maxWidth:620,margin:"0 auto",padding:"72px 24px",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:12}}>🧠</div>
        <h1 style={{fontSize:34,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.02em"}}>Mental Fitness Assessment</h1>
        <p style={{color:C.muted,fontSize:17,lineHeight:1.7,margin:"0 0 36px"}}>
          Scopri quali <strong style={{color:C.saboteur}}>saboteur interiori</strong> ti frenano e misura la forza del tuo <strong style={{color:C.sage}}>Sage</strong> — la parte saggia della tua mente.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:36,textAlign:"left"}}>
          <div style={{...card,borderLeft:`4px solid ${C.saboteur}`}}>
            <div style={{fontSize:13,color:C.saboteur,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Parte 1</div>
            <div style={{fontWeight:600,marginBottom:4}}>Saboteur Assessment</div>
            <div style={{color:C.muted,fontSize:13}}>{SAB_QUESTIONS.length} domande · ~5 min</div>
          </div>
          <div style={{...card,borderLeft:`4px solid ${C.sage}`}}>
            <div style={{fontSize:13,color:C.sage,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Parte 2</div>
            <div style={{fontWeight:600,marginBottom:4}}>PQ Score</div>
            <div style={{color:C.muted,fontSize:13}}>{PQ_PAIRS.length} coppie emozioni · ~3 min</div>
          </div>
        </div>
        <button style={btn(true)} onClick={() => setPhase("sab_assess")}>Inizia Assessment →</button>
      </div>
    </div>
  );

  // ── SABOTEUR ASSESSMENT ──
  if(phase === "sab_assess") {
    const q = shuffledSab[sabIdx];
    const progress = Object.keys(sabAnswers).length;
    const total = SAB_QUESTIONS.length;
    return (
      <div style={wrap}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"40px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12,color:C.saboteur,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Saboteur Assessment</span>
            <span style={{fontSize:12,color:C.muted,fontFamily:"monospace"}}>{progress}/{total} risposte</span>
          </div>
          <div style={{height:4,background:C.surface2,borderRadius:2,overflow:"hidden",marginBottom:32}}>
            <div style={{height:"100%",width:`${(progress/total)*100}%`,background:`linear-gradient(90deg,${C.saboteur},${C.warm})`,borderRadius:2,transition:"width 0.3s"}}/>
          </div>
          <div style={card}>
            <div style={{fontSize:12,color:C.dimmed,marginBottom:16}}>Domanda {sabIdx+1} di {total}</div>
            <p style={{fontSize:18,fontWeight:600,lineHeight:1.6,margin:"0 0 28px"}}>{q.text}</p>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {LIKERT.map(l => {
                const sel = sabAnswers[sabIdx] === l.val;
                return (
                  <button key={l.val} onClick={() => setSabAnswers(p => ({...p,[sabIdx]:l.val}))}
                    style={{
                      flex:1, padding:"14px 4px", borderRadius:12, border:`2px solid ${sel?l.color:C.border}`,
                      background:sel?`${l.color}12`:C.surface, cursor:"pointer", transition:"all 0.15s", textAlign:"center",
                    }}>
                    <div style={{fontSize:22,fontWeight:800,color:sel?l.color:C.dimmed,fontFamily:"monospace"}}>{l.val}</div>
                    <div style={{fontSize:10,color:sel?l.color:C.muted,marginTop:4}}>{l.label}</div>
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
              <button style={{...btn(false),opacity:sabIdx>0?1:0.3}} onClick={() => sabIdx>0 && setSabIdx(sabIdx-1)}>← Indietro</button>
              {sabIdx < total - 1 ? (
                <button style={{...btn(sabAnswers[sabIdx]!==undefined),opacity:sabAnswers[sabIdx]!==undefined?1:0.4}} onClick={() => sabAnswers[sabIdx]!==undefined && setSabIdx(sabIdx+1)}>Avanti →</button>
              ) : (
                <button style={{...btn(true,C.sage),opacity:progress>=total*0.9?1:0.4}} onClick={() => setPhase("pq_intro")}>Vai al PQ Score →</button>
              )}
            </div>
          </div>
          {/* Quick nav */}
          <div style={{marginTop:16,display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
            {shuffledSab.map((_,i) => (
              <button key={i} onClick={() => setSabIdx(i)} style={{
                width:20,height:20,borderRadius:5,fontSize:8,fontWeight:600,cursor:"pointer",
                border:`1px solid ${i===sabIdx?C.accent:C.border}`,
                background:sabAnswers[i]!==undefined?(i===sabIdx?C.accent:`${C.accent}30`):"transparent",
                color:sabAnswers[i]!==undefined&&i===sabIdx?"#fff":C.muted,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>{i+1}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PQ INTRO ──
  if(phase === "pq_intro") return (
    <div style={wrap}>
      <div style={{maxWidth:560,margin:"0 auto",padding:"60px 24px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <h2 style={{fontSize:24,fontWeight:700,margin:"0 0 12px"}}>Saboteur Assessment completato!</h2>
        <p style={{color:C.muted,margin:"0 0 32px"}}>Ora misuriamo il tuo PQ Score — il quoziente di intelligenza positiva.</p>
        <div style={{...card,textAlign:"left"}}>
          <div style={{fontSize:13,color:C.sage,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>PQ Score Assessment</div>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.7,margin:"0 0 8px"}}>
            Ti verranno presentate <strong style={{color:C.text}}>{PQ_PAIRS.length} coppie di emozioni</strong> (una positiva, una negativa).
          </p>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.7,margin:"0 0 16px"}}>
            Per ciascuna, indica quanto spesso la provi in <strong style={{color:C.text}}>una giornata tipica</strong>.
          </p>
          <div style={{background:`${C.sage}10`,border:`1px solid ${C.sage}30`,borderRadius:10,padding:12,fontSize:13,color:C.sage}}>
            💡 Il PQ Score misura quanto della tua giornata è guidata dal Sage (positivo) vs dai Saboteur (negativo). Il tipping point è 75.
          </div>
        </div>
        <button style={{...btn(true,C.sage),marginTop:24}} onClick={() => setPhase("pq_assess")}>Inizia PQ Assessment →</button>
      </div>
    </div>
  );

  // ── PQ ASSESSMENT ──
  if(phase === "pq_assess") {
    const pair = PQ_PAIRS[pqIdx];
    const current = pqAnswers[pqIdx] || {};
    const bothAnswered = current.pos && current.neg;
    const answered = Object.values(pqAnswers).filter(v => v && v.pos && v.neg).length;
    return (
      <div style={wrap}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"40px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:C.sage,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>PQ Score</span>
            <span style={{fontSize:12,color:C.muted,fontFamily:"monospace"}}>{answered}/{PQ_PAIRS.length}</span>
          </div>
          <div style={{height:4,background:C.surface2,borderRadius:2,overflow:"hidden",marginBottom:32}}>
            <div style={{height:"100%",width:`${(answered/PQ_PAIRS.length)*100}%`,background:C.sage,borderRadius:2,transition:"width 0.3s"}}/>
          </div>
          <div style={card}>
            <div style={{fontSize:12,color:C.dimmed,marginBottom:20}}>Coppia {pqIdx+1} di {PQ_PAIRS.length} · "Quanto spesso provi questa emozione?"</div>
            {/* Positive */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:20}}>☀️</span>
                <span style={{fontWeight:600,color:C.sage}}>{pair.pos}</span>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setPqAnswers(p => ({...p,[pqIdx]:{...p[pqIdx],pos:v}}))} style={{
                    flex:1,padding:"10px 0",borderRadius:10,border:`2px solid ${current.pos===v?C.sage:C.border}`,
                    background:current.pos===v?`${C.sage}12`:C.surface,cursor:"pointer",textAlign:"center",
                  }}>
                    <div style={{fontSize:18,fontWeight:700,color:current.pos===v?C.sage:C.dimmed}}>{v}</div>
                    <div style={{fontSize:9,color:C.muted}}>{["Mai","Poco","A volte","Spesso","Sempre"][v-1]}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Negative */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:20}}>🌧️</span>
                <span style={{fontWeight:600,color:C.saboteur}}>{pair.neg}</span>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setPqAnswers(p => ({...p,[pqIdx]:{...p[pqIdx],neg:v}}))} style={{
                    flex:1,padding:"10px 0",borderRadius:10,border:`2px solid ${current.neg===v?C.saboteur:C.border}`,
                    background:current.neg===v?`${C.saboteur}10`:C.surface,cursor:"pointer",textAlign:"center",
                  }}>
                    <div style={{fontSize:18,fontWeight:700,color:current.neg===v?C.saboteur:C.dimmed}}>{v}</div>
                    <div style={{fontSize:9,color:C.muted}}>{["Mai","Poco","A volte","Spesso","Sempre"][v-1]}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
              <button style={{...btn(false),opacity:pqIdx>0?1:0.3}} onClick={() => pqIdx>0 && setPqIdx(pqIdx-1)}>←</button>
              {pqIdx < PQ_PAIRS.length - 1 ? (
                <button style={{...btn(bothAnswered,C.sage),opacity:bothAnswered?1:0.4}} onClick={() => bothAnswered && setPqIdx(pqIdx+1)}>Avanti →</button>
              ) : (
                <button style={{...btn(true,C.accent)}} onClick={finishAll}>Vedi Risultati ✦</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if(phase === "results" && results) {
    const { sabScores, pq, sorted } = results;
    const top3 = sorted.slice(0, 3);
    // Collect unique sage powers from top 3
    const sageSet = new Set();
    top3.forEach(([k]) => SABOTEURS[k].sage.forEach(s => sageSet.add(s)));
    const topSages = [...sageSet].slice(0, 3);

    return (
      <div style={wrap}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <h1 style={{fontSize:30,fontWeight:800,margin:"0 0 8px",letterSpacing:"-0.02em"}}>Il tuo Profilo di Mental Fitness</h1>
            <p style={{color:C.muted,fontSize:15}}>Ecco i tuoi saboteur dominanti e il tuo PQ Score</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
            {/* Radar */}
            <div style={card}>
              <h3 style={{fontSize:14,fontWeight:700,color:C.saboteur,textTransform:"uppercase",letterSpacing:1,margin:"0 0 16px"}}>Mappa Saboteur</h3>
              <RadarChart scores={sabScores} />
              <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:12}}>
                {sorted.map(([k,v]) => (
                  <span key={k} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:`${SABOTEURS[k].color}12`,color:SABOTEURS[k].color,fontWeight:600}}>
                    {SABOTEURS[k].icon} {Math.round(v*10)/10}
                  </span>
                ))}
              </div>
            </div>
            {/* PQ Gauge */}
            <div style={card}>
              <h3 style={{fontSize:14,fontWeight:700,color:C.sage,textTransform:"uppercase",letterSpacing:1,margin:"0 0 16px"}}>PQ Score</h3>
              <PQGauge score={pq} />
              <div style={{marginTop:20,background:C.surface2,borderRadius:12,padding:16}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:8}}>Benchmark per età</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dimmed}}>
                  {[{age:"18-25",pq:51},{age:"36-45",pq:57},{age:"56-65",pq:61},{age:"65+",pq:63}].map(b => (
                    <div key={b.age} style={{textAlign:"center"}}>
                      <div style={{fontWeight:700,color:C.text}}>{b.pq}</div>
                      <div>{b.age}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Saboteurs */}
          <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 16px",color:C.saboteur}}>I tuoi Top {top3.length} Saboteur</h3>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${top3.length},1fr)`,gap:16,marginBottom:24}}>
            {top3.map(([k, v], i) => {
              const s = SABOTEURS[k];
              return (
                <div key={k} style={{...card,borderTop:`4px solid ${s.color}`,position:"relative"}}>
                  {i===0 && <div style={{position:"absolute",top:-12,right:16,background:s.color,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:10}}>DOMINANTE</div>}
                  <div style={{fontSize:36,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:24,fontWeight:800,color:s.color,fontFamily:"monospace",marginBottom:8}}>{Math.round(v*10)/10}<span style={{fontSize:12,color:C.muted}}>/10</span></div>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"0 0 12px"}}>{s.desc}</p>
                  <div style={{background:`${s.color}08`,borderRadius:8,padding:10,marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:600,color:s.color,marginBottom:4}}>La sua bugia</div>
                    <div style={{fontSize:12,color:C.text,fontStyle:"italic"}}>"{s.lie}"</div>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>
                    <strong>Forza originaria:</strong> {s.strength}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sage Powers */}
          <h3 style={{fontSize:16,fontWeight:700,margin:"0 0 16px",color:C.sage}}>Sage Powers consigliate</h3>
          <div style={{display:"flex",gap:12,marginBottom:32}}>
            {topSages.map(sk => {
              const sp = SAGE_POWERS[sk];
              return (
                <div key={sk} style={{...card,flex:1,borderTop:`4px solid ${C.sage}`,textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:6}}>{sp.icon}</div>
                  <div style={{fontWeight:700,marginBottom:4}}>{sp.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{sp.desc}</div>
                </div>
              );
            })}
          </div>

          {/* All scores table */}
          <div style={card}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 16px",textTransform:"uppercase",letterSpacing:1}}>Tutti i punteggi Saboteur</h3>
            {sorted.map(([k,v]) => (
              <div key={k} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:600}}>{SABOTEURS[k].icon} {SABOTEURS[k].name}</span>
                  <span style={{fontSize:13,fontWeight:700,color:SABOTEURS[k].color,fontFamily:"monospace"}}>{Math.round(v*10)/10}</span>
                </div>
                <div style={{height:8,background:C.surface2,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(v/10)*100}%`,background:SABOTEURS[k].color,borderRadius:4,transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:"center",marginTop:32,paddingBottom:48}}>
            <button style={btn(false)} onClick={() => { setPhase("welcome"); setSabAnswers({}); setSabIdx(0); setPqAnswers({}); setPqIdx(0); setResults(null); }}>
              Ricomincia ↻
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
