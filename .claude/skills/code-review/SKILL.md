# code-review Skill

model: claude-sonnet-4-6

Review del codice prodotto nello step di implementazione.

## Trigger
Allo Step 9 del workflow `/implement`.

## Checklist

### Logic
- [ ] Scoring leadership corretto (pair sums, archetype mapping)
- [ ] CVF validation: ogni categoria somma a 100
- [ ] Skill levels within bounds (0-4)
- [ ] Permission checks rispettano Hackman level dell'org
- [ ] Nessuna logica di business nel layer UI

### Security
- [ ] Permission middleware applicato su tutte le route protette
- [ ] Input validation con Zod su tutti gli endpoint
- [ ] Nessun dato sensibile (profili utente) esposto a livelli non autorizzati

### Code Quality
- [ ] Tipi TypeScript corretti (no `any`)
- [ ] Test coprono edge cases
- [ ] Nessuna duplicazione non necessaria

### Domain
- [ ] Archetype calculation usa i criteri ORGANIC agility corretti
- [ ] Goleman mapping è consistente con la tabella in CLAUDE.md
- [ ] Kiviat data è normalizzata correttamente
