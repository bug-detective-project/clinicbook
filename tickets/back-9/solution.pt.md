# Solução: Os períodos são ordenados antes de serem comparados

**Causa raiz.** `hoursProblem` em `server/src/routes/doctors.ts` compara cada período com o que vem logo antes, na ordem da requisição. Períodos sobrepostos que não são vizinhos nessa ordem nunca são comparados.

## Passo a passo

1. **Reproduza** com o `curl` do ticket: 200 para 11:00–15:00, 16:00–18:00, 08:00–12:00.
2. **Ordene antes de comparar.** Numa lista ordenada por dia e início, qualquer sobreposição aparece entre dois vizinhos:

   ```ts
   const sorted = [...hours].sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
   for (let index = 1; index < sorted.length; index += 1) {
     const before = sorted[index - 1]!;
     const period = sorted[index]!;
     if (period.weekday === before.weekday && period.startsAt < before.endsAt) {
       return `${WEEKDAYS[period.weekday - 1]}: two periods overlap`;
     }
   }
   ```

   `[...hours]` ordena uma cópia: os horários que são salvos mantêm a ordem em que chegaram.

A referência também acrescenta um teste de regressão, `server/src/hours-out-of-order.test.ts`: sobreposições com um período do mesmo dia ou de outro dia entre elas, um médico novo, e períodos só fora de ordem, que são aceitos.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **In QA**.
