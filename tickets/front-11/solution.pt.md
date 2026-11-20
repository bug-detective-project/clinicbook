# Solução: Um período inclui o início e exclui o fim

**Causa raiz.** O `insideHours` em `client/src/components/WeekGrid.tsx` conferia `time > period.startsAt && time <= period.endsAt`. Um período da clínica começa em `startsAt` (o primeiro horário está lá) e termina em `endsAt` (nada pode começar ali). As comparações estavam trocadas nas duas bordas.

## Passo a passo

1. **Reproduza** com os passos do ticket: 08:00 aparece marcada, 14:00 não.
2. **Escreva o intervalo como o servidor faz** (uma marcação é aceita quando começa no início ou depois e termina no fim ou antes):

   ```ts
   function insideHours(hours: Hours[], weekday: number, time: string): boolean {
     return hours.some((period) => period.weekday === weekday && time >= period.startsAt && time < period.endsAt);
   }
   ```

   Os horários são textos `HH:MM`, que se comparam na ordem do relógio.

A referência também acrescenta um teste de regressão, `client/src/components/WeekGrid.edges.test.tsx`: o primeiro horário de cada período, o fim de cada período, o meio e o intervalo.

Depois rode `npm test`, siga de novo os passos do ticket e mova o card para **In QA**.
