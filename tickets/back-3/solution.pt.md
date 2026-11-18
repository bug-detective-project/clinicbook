# Solução: REMINDERS_ENABLED=false desliga os lembretes

**Causa.** O `readSettings` em `server/src/config.ts` calcula `remindersEnabled` com `Boolean(env.REMINDERS_ENABLED ?? true)`. Uma variável de ambiente é sempre um texto, e o `Boolean` de qualquer texto que não esteja vazio é `true`: `'false'` liga a opção do mesmo jeito que `'true'`. Só um valor vazio dava `false`.

## Passo a passo

1. **Reproduza.** Suba o servidor com `REMINDERS_ENABLED=false npm run dev`; o `GET /api/reminders` responde `"enabled": true`.
2. **Ache a conversão.** As rotas só leem `settings.remindersEnabled`; a configuração é feita no `readSettings`.
3. **Leia a opção comparando textos.** Em `server/src/config.ts`:

   ```ts
   export function readFlag(name: string, value: string | undefined, fallback: boolean): boolean {
     const text = (value ?? '').trim().toLowerCase();
     if (text === '') {
       return fallback;
     }
     if (text === 'true' || text === '1') {
       return true;
     }
     if (text === 'false' || text === '0') {
       return false;
     }
     throw new Error(`${name} must be "true" or "false", and it is "${value}"`);
   }
   ```

   e no `readSettings`:

   ```ts
   remindersEnabled: readFlag('REMINDERS_ENABLED', env.REMINDERS_ENABLED, true),
   ```

4. **Confira os três casos.** Sem a variável, os lembretes ficam ligados; com `false`, desligados; com `maybe`, o servidor para com uma mensagem que diz o nome da variável.

A referência também adiciona um teste de regressão, `server/src/config.test.ts`, que lê a configuração a partir de textos (`false`, `FALSE`, `0`, `true`, `1`, vazio, ausente) e sobe o app com ela.

Depois rode `npm test`, repita os passos do ticket e mova o card para **Em QA**.
