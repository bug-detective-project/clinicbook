# Solução: O formulário começa de uma cópia do paciente

**Causa raiz.** O `formOf` em `client/src/components/PatientDialog.tsx` preparava os campos com `Object.assign(patient, { phone: …, email: patient.email ?? '', birthDate: patient.birthDate ?? '', cpf: … })`. O `Object.assign` muda o primeiro argumento: o paciente que a ficha guarda ganhava um e-mail vazio, uma data de nascimento vazia e um CPF com máscara no momento em que o formulário abria, e a ficha os mostrava depois do **Cancel**.

## Passo a passo

1. **Reproduza** num paciente sem e-mail: **Edit**, **Cancel**, e a linha do e-mail fica vazia.
2. **Ache o que escreve no paciente**: nada salva, então algo muda o próprio objeto. O `Object.assign(patient, …)` muda.
3. **Monte o formulário como um objeto novo:**

   ```ts
   function formOf(patient: Patient | undefined): typeof EMPTY_FORM {
     if (patient === undefined) {
       return EMPTY_FORM;
     }
     return {
       name: patient.name,
       phone: maskPhone(patient.phone),
       email: patient.email ?? '',
       birthDate: patient.birthDate ?? '',
       cpf: maskCpf(patient.cpf),
       healthPlan: patient.healthPlan,
     };
   }
   ```

A referência também acrescenta um teste de regressão, `client/src/components/PatientDetails.cancel.test.tsx`: depois de um cancelamento, o objeto do paciente e a ficha estão como antes, também para um paciente sem e-mail e sem data de nascimento.

Depois rode `npm test`, tente **Edit** e **Cancel** na Elisa Gomes e mova o card para **In QA**.
