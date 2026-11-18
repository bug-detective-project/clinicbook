# Solução: Terminando a remarcação

**O que faltava.** O `PATCH /api/appointments/:id` existia só como casca: o Fastify conferia o corpo, a rota achava a consulta, e a resposta era 501. Nada decidia se a consulta pode ir para o novo dia e horário, e nada chamava o `moveAppointment`, a gravação que estava pronta no repositório.

## Passo a passo

1. **Leia as três camadas.** A rota (`server/src/routes/appointments.ts`) para em um comentário; o `bookAppointment` (`server/src/appointments.ts`) mostra o padrão "conferir e depois gravar" e as conferências de uma marcação, o `assertBookable`; o `moveAppointment` (`server/src/repository.ts`) grava o dia, o horário e o status `scheduled`.
2. **Escreva a regra**, em `server/src/appointments.ts` (acrescente `ConflictError` e `moveAppointment` aos imports):

   ```ts
   export async function rescheduleAppointment(db: Db, today: string, id: number, day: string, time: string): Promise<Appointment> {
     const appointment = await requireAppointment(db, id);
     if (appointment.status === 'cancelled') {
       throw new ConflictError('A cancelled appointment cannot be rescheduled');
     }
     await assertBookable(db, today, appointment.doctorId, day, time);
     return moveAppointment(db, id, day, time);
   }
   ```

3. **Chame-a da rota**, no lugar do 501:

   ```ts
   app.patch<{ Params: Id; Body: { day: string; time: string } }>(
     '/api/appointments/:id',
     { schema: { body: rescheduleBody } },
     (request) => {
       return rescheduleAppointment(db, today(), Number(request.params.id), request.body.day, request.body.time);
     },
   );
   ```

4. **Confira os casos do ticket.** Uma consulta agendada se move; uma confirmada se move e vira agendada; uma cancelada responde 409; 12:30, um sábado e a semana passada respondem 400 para a Dra. Helena Prado; e o formulário **Reschedule** da agenda termina no novo dia, com a consulta nele.

A referência também adiciona um teste de regressão, `server/src/reschedule.test.ts`, com esses casos.

Depois rode `npm test` e mova o card para **Em QA**.
