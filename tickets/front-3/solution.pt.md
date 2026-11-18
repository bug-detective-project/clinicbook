# Solução: Um dia aparece como o dia que ele é

**Causa.** O `toDate` em `client/src/dates.ts` transforma o texto de um dia em um `Date` com `new Date(day)`. Para um texto que só tem data, o JavaScript entende meia-noite em UTC. O `formatDay` e o `formatShortDay` então escrevem aquele instante no fuso do computador: em São Paulo (UTC-3) são 21:00 do dia anterior, e toda data aparece um dia antes. O dado nunca muda; só a leitura dele.

## Passo a passo

1. **Confie no dado e depois siga o caminho dele.** A API responde `2026-03-10` (aba Network). O título da agenda vem de `formatDay(day)`, e todas as outras datas das telas vêm de `formatShortDay` ou de `formatDay` também.
2. **Reproduza.** Com o DevTools fingindo estar em São Paulo, `new Date('2026-03-10').toString()` no console diz "Mon Mar 09 2026 21:00:00".
3. **Monte a data no calendário do computador.** Em `client/src/dates.ts`:

   ```ts
   /** The day as a date of this computer's calendar, at midnight. */
   function toDate(day: string): Date {
     const [year, month, date] = day.split('-').map(Number);
     return new Date(year, month - 1, date);
   }
   ```

   Os meses começam em 0 nesse construtor, daí o `month - 1`. As duas funções de formatação usam o `toDate`, então as duas ficam corrigidas.

A referência também adiciona um teste de regressão, `client/src/dates.timezone.test.ts`, que põe `process.env.TZ` em São Paulo e em Tóquio antes de formatar: os outros testes do projeto rodam em UTC (veja `vitest.config.ts`), onde o bug não aparece.

Depois rode `npm test`, abra a agenda do dia 10 com o DevTools em São Paulo e mova o card para **Em QA**.
