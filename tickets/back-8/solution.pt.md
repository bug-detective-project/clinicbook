# Solução: As gravações de um médico ficam juntas, ou nenhuma fica

**Causa raiz.** `updateDoctor` em `server/src/repository.ts` grava o médico, apaga os períodos e insere os novos como três comandos separados. Quando o banco recusa a inserção (um período fora do dia da clínica), os dois primeiros já foram gravados: o médico fica com o nome novo e sem horários.

## Passo a passo

1. **Reproduza** com o `curl` do ticket: vem o 400, e `GET /api/doctors/3` mostra nenhum horário.
2. **Veja a ordem das gravações** em `updateDoctor`: atualizar, apagar, inserir. Só a inserção falha.
3. **Coloque as três numa transação**, como o `createDoctor` já faz:

   ```ts
   export async function updateDoctor(db: Db, id: number, doctor: { name: string; specialty: string }, hours: Hours[]): Promise<DoctorWithHours> {
     await db.transaction().execute(async (trx) => {
       await rows(trx.updateTable('doctors').set(doctor).where('id', '=', id));
       await rows(trx.deleteFrom('workingHours').where('doctorId', '=', id));
       if (hours.length > 0) {
         await rows(trx.insertInto('workingHours').values(hours.map((period) => ({ doctorId: id, ...period }))));
       }
     });
     return (await findDoctorWithHours(db, id))!;
   }
   ```

   Quando a inserção lança, o Kysely desfaz a transação, e o erro continua chegando ao tratador de erros, que responde 400.

A referência também acrescenta um teste de regressão, `server/src/doctor-hours-saved-together.test.ts`: uma mudança com um período a partir das 05:00 é recusada, e o médico fica exatamente como antes.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **In QA**.
