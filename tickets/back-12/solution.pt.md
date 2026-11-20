# Solução: Um médico com consultas fica

**Causa raiz.** `deleteDoctor` em `server/src/repository.ts` apaga as consultas do médico antes do médico, "porque o banco recusa um médico para o qual outras linhas apontam". Essa recusa era a regra da clínica: a função apagava as consultas para passar por ela.

## Passo a passo

1. **Reproduza** com o `curl` do ticket: `204`, e a agenda do dia perde as consultas do médico.
2. **Leia o `deleteDoctor`**: consultas, horários, médico, numa transação.
3. **Deixe o banco recusar.** Apague só o que pertence ao médico e a mais ninguém:

   ```ts
   export async function deleteDoctor(db: Db, id: number): Promise<void> {
     await db.transaction().execute(async (trx) => {
       await rows(trx.deleteFrom('workingHours').where('doctorId', '=', id));
       await rows(trx.deleteFrom('doctors').where('id', '=', id));
     });
   }
   ```

   Para um médico com consultas, a segunda remoção falha com `SQLITE_CONSTRAINT_FOREIGNKEY`, a transação devolve os horários, e o tratador de erros responde 409 com "This record is in use and cannot be removed". A tela de edição já mostra essa mensagem.

A referência também acrescenta um teste de regressão, `server/src/doctor-with-appointments.test.ts`: um médico com consultas é recusado, e o médico, os horários e as consultas ficam.

Depois rode `npm test`, tente **Remove doctor** no Dr. Oliveira e mova o card para **In QA**.
