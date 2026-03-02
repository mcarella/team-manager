# deploy-checklist Skill

Checklist pre-deploy per team-manager.

## Trigger
Prima di ogni deploy in produzione.

## Checklist

### Quality Gates
- [ ] `pnpm test` — tutti i test passano
- [ ] `pnpm typecheck` — nessun errore TypeScript
- [ ] `pnpm lint` — nessun warning
- [ ] `pnpm build` — build completa senza errori

### Database
- [ ] Migration Drizzle applicata
- [ ] Nessun breaking change sullo schema
- [ ] Backup DB effettuato

### Environment Variables
- [ ] `DATABASE_URL` configurato
- [ ] `SUPABASE_URL` e `SUPABASE_ANON_KEY` configurati
- [ ] `JWT_SECRET` configurato

### Functionality
- [ ] Self Assessment flow funziona end-to-end
- [ ] CVF assessment flow funziona end-to-end
- [ ] Skills assessment funziona
- [ ] Kiviat diagram si renderizza correttamente
- [ ] Permission levels rispettati (testa almeno manager-led e self-managing)
