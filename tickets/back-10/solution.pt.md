# Solução: O último dia de um período está no período

**Causa raiz.** `listAppointmentsBetween` em `server/src/repository.ts` guarda os dias `>= from` e `< to`. A API diz que os dois dias estão incluídos, e as telas pedem semanas inteiras (segunda a domingo): o último dia ficava sempre de fora.

## Passo a passo

1. **Reproduza**: `GET /api/schedule?from=2026-03-09&to=2026-03-09` vem vazio, enquanto a agenda do dia 9 tem consultas.
2. **Leia a condição** da consulta sobre `appointments.day`.
3. **Inclua o último dia:**

   ```ts
   let query = appointments(db).where('appointments.day', '>=', from).where('appointments.day', '<=', to);
   ```

   Dias escritos como `YYYY-MM-DD` se comparam como texto na ordem do calendário, então `<=` no texto é `<=` na data.

A referência também acrescenta um teste de regressão, `server/src/schedule-last-day.test.ts`: um período de um dia, de uma semana inteira e de um médico, cada um comparado com as consultas dos seus dias.

Depois rode `npm test`, abra a semana de um dia com consulta no domingo e mova o card para **In QA**.
