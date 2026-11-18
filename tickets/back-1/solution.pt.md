# Solução: Consulta cancelada continua cancelada

**Causa.** O `confirmAppointment` em `server/src/appointments.ts` confere que a consulta existe e grava o status `confirmed` sem olhar o status que ela tinha. A regra que proíbe isso existe (`assertTransition` em `server/src/rules.ts`: nada vem depois de `cancelled`), e o `cancelAppointment` a usa; o `confirmAppointment` nunca a chama.

## Passo a passo

1. **Reproduza sem a tela.** `POST /api/appointments/9/confirm` responde 200 para uma consulta cancelada.
2. **Compare as duas irmãs.** O `cancelAppointment` chama `assertTransition(appointment.status, 'cancelled')` antes de gravar.
3. **Pergunte à regra antes de confirmar.**

   ```ts
   export async function confirmAppointment(db: Db, id: number): Promise<Appointment> {
     const appointment = await requireAppointment(db, id);
     assertTransition(appointment.status, 'confirmed');
     return setAppointmentStatus(db, id, 'confirmed');
   }
   ```

   Para uma consulta cancelada, o `assertTransition` lança um `ConflictError`, e o tratador de erros responde 409 com "A cancelled appointment cannot be confirmed".

A referência também adiciona um teste de regressão, `server/src/confirm-rules.test.ts`: uma consulta cancelada, uma cancelada um instante antes, uma já confirmada e uma agendada, que continua sendo confirmada.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **Em QA**.
