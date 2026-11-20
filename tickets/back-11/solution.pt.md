# Solução: Um campo que não é mandado mantém o valor

**Causa raiz.** A rota `PATCH /api/patients/:id` em `server/src/routes/patients.ts` preenche o e-mail e a data de nascimento com `body.email ?? null` e `body.birthDate ?? null`. Um campo que fica fora do corpo é `undefined`, e `undefined ?? null` é `null`: o campo é apagado como se tivesse sido mandado como `null`.

## Passo a passo

1. **Reproduza** com o `curl` do ticket: o plano muda, e o e-mail e a data de nascimento viram `null`.
2. **Separe os três casos.** Ausente mantém o valor, `null` apaga, um valor muda. O `in` pergunta se o campo foi mandado:

   ```ts
   const merged: PatientBody = {
     name: body.name ?? patient.name,
     phone: body.phone ?? patient.phone,
     email: 'email' in body ? body.email : patient.email,
     birthDate: 'birthDate' in body ? body.birthDate : patient.birthDate,
     cpf: body.cpf ?? patient.cpf,
     healthPlan: body.healthPlan ?? patient.healthPlan,
   };
   ```

   Os campos obrigatórios podem continuar com `??`: o esquema nunca deixa que sejam `null`.

A referência também acrescenta um teste de regressão, `server/src/patient-partial-change.test.ts`: só o plano, só o telefone, e uma data de nascimento mandada como `null`.

Depois rode `npm test`, repita o `curl` do ticket e mova o card para **In QA**.
