# /cost-check — Token Usage Report

Riporta un sommario dell'utilizzo token nella sessione corrente.

## Output
- Modello usato per ogni operazione
- Stima costo sessione
- Raccomandazioni: usa Haiku per explore/test-gen, Sonnet per implement, Opus per architettura

## Reminders
- @explorer usa Haiku → economico per ricerche
- test-gen usa Haiku → economico per generare test
- pr-prep usa Haiku → economico per PR description
- code-review usa Sonnet → bilancio qualità/costo
- architect usa Opus → solo quando necessario
