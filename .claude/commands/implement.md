# /implement — TDD Workflow

Implementa una feature seguendo il workflow TDD di team-manager.

## Usage
```
/implement <feature description>
```

## Steps

### 1. Classifica
Dichiara: `logic` | `ui` | `config`

### 2. Branch
```bash
git checkout -b <feat|fix|chore>/<slug>
```

### 3. Explore
Usa @explorer per trovare codice rilevante.

### 4. Plan
Scrivi max 7 step. Attendi approvazione prima di procedere.

### 5. [LOGIC ONLY] Test First
Usa skill `test-gen` per generare test.
Esegui: `pnpm test:run --testPathPattern=<pattern>`
I test DEVONO fallire (RED).

### 6. Implement
Scrivi il codice minimo per far passare i test.

### 7. [LOGIC ONLY] Verify GREEN
```bash
pnpm test:run --testPathPattern=<pattern>
```
I test DEVONO passare.

### 8. Refactor
Pulisci il codice. I test devono rimanere green.

### 9. Review
Usa skill `code-review`.

### 10. Report
Riporta cosa è stato fatto. Chiedi se committare.
