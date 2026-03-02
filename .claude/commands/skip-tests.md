# /skip-tests — Bypass Test Requirement

Usato per feature di tipo `ui` o `config` dove i test automatici non si applicano.

## Usage
```
/skip-tests <reason>
```

## Behavior
1. Documenta il motivo nel commit message: `[skip-tests: <reason>]`
2. Per UI: usa visual review invece dei test
3. Per config: verifica manuale che la config funzioni

## Valid reasons
- `ui-component` — componente React visuale
- `styling` — modifiche Tailwind/CSS
- `config-tooling` — Vite, ESLint, TypeScript config
- `docker` — Dockerfile o docker-compose
- `ci-cd` — GitHub Actions workflow
