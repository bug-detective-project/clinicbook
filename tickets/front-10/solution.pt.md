# Solução: A semana de um domingo termina nesse domingo

**Causa raiz.** O `mondayOf` em `client/src/calendar.ts` voltava o dia `getUTCDay()` dias, mais um. O `getUTCDay()` conta do domingo (0) ao sábado (6), então para um domingo ele andava um dia **para a frente**, até a segunda seguinte. A semana de um domingo mostrava a semana seguinte, e um mês que começa num domingo perdia o primeiro dia.

## Passo a passo

1. **Reproduza**: `/week?day=2026-03-15` mostra "Mar 16 – Mar 22, 2026".
2. **Confira a numeração**: o `getUTCDay()` dá 0 para um domingo. A semana da clínica precisa que o domingo seja o 7º dia.
3. **Use a numeração da clínica**, que o `calendar.ts` já tem:

   ```ts
   export function mondayOf(day: string): string {
     return addDays(day, 1 - weekdayOf(day));
   }
   ```

   O `weekdayOf` é 1 para segunda e 7 para domingo, então um domingo volta seis dias.

A referência também acrescenta um teste de regressão, `client/src/calendar.sunday.test.tsx`: a semana de um domingo, as mesmas consultas da segunda dela, e **Previous week** a partir dele.

Depois rode `npm test`, abra a semana de um domingo e o mês de março de 2026 e mova o card para **In QA**.
