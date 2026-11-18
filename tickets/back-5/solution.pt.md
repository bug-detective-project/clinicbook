# Solução: O endpoint dos horários livres de um médico

**O que faltava.** O cliente chama `GET /api/doctors/:id/slots?day=` e o servidor não tinha essa rota: a resposta era o 404 de um endereço desconhecido, e o formulário de marcação não tinha o que oferecer. As peças existiam (os períodos de expediente, os horários marcados, as funções de minutos); a conta e a rota, não.

## Passo a passo

1. **Escreva a conta sozinha**, em `server/src/slots.ts`:

   ```ts
   import { minutesOf, timeOf } from './dates.ts';
   import { SLOT_MINUTES } from './schedule.ts';
   import type { Period } from './schedule.ts';

   export function freeSlots(periods: Period[], booked: string[]): string[] {
     const taken = new Set(booked);
     const slots: string[] = [];
     for (const period of periods) {
       const until = minutesOf(period.endsAt);
       for (let start = minutesOf(period.startsAt); start + SLOT_MINUTES <= until; start += SLOT_MINUTES) {
         const time = timeOf(start);
         if (!taken.has(time)) {
           slots.push(time);
         }
       }
     }
     return slots.sort();
   }
   ```

2. **Adicione a rota**, em `server/src/routes/doctors.ts` (a função passa a receber também `today` do contexto):

   ```ts
   app.get<{ Params: { id: string }; Querystring: { day: string } }>(
     '/api/doctors/:id/slots',
     { schema: { querystring: requiredDayQuery } },
     async (request) => {
       const id = Number(request.params.id);
       const { day } = request.query;
       if (!Number.isInteger(id) || !(await findDoctor(db, id))) {
         throw new NotFoundError('Doctor not found');
       }
       if (!isDay(day)) {
         throw new InvalidError('The day must be a date, as YYYY-MM-DD', { day: 'Not a date' });
       }
       if (day < today()) {
         return { day, slots: [] };
       }
       const periods = await workingPeriods(db, id, weekdayOf(day));
       return { day, slots: freeSlots(periods, await bookedTimes(db, id, day)) };
     },
   );
   ```

3. **Confira os casos do ticket** com `curl http://localhost:3001/api/doctors/1/slots?day=<um dia>`: um dia útil tem os dois períodos sem o almoço, um domingo é vazio, ontem é vazio, o médico 999 é um 404, e sem `day` é um 400.
4. **Confira o formulário.** O **Book appointment** agora mostra os horários, e um horário marcado some quando o formulário é aberto de novo.

A referência também adiciona um teste de regressão, `server/src/slots.test.ts`, com esses casos e mais um: todo horário que o endpoint oferece é aceito por uma marcação.

Depois rode `npm test` e mova o card para **Em QA**.
