# Solução: O servidor confere os dígitos de um CPF

**O que faltava.** `inputOf` em `server/src/routes/patients.ts` guardava quaisquer 11 dígitos como CPF. Nada comparava os dois últimos dígitos com os nove primeiros.

## Passo a passo

1. **Reproduza.** `POST /api/patients` com `"cpf": "123.456.789-00"` responde 201.
2. **Escreva a regra ao lado da leitura do CPF**, em `server/src/cpf.ts`, usando o `checkDigit` que o `cpfFrom` já tem:

   ```ts
   /** True for the 11 digits of a real CPF: both check digits match, and the digits are not all the same. */
   export function isValidCpf(digits: string): boolean {
     if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
       return false;
     }
     return checkDigit(digits.slice(0, 9)) === Number(digits[9]) && checkDigit(digits.slice(0, 10)) === Number(digits[10]);
   }
   ```

3. **Use-a onde o CPF é lido**, para o cadastro e a mudança de um paciente recusarem:

   ```ts
   const cpf = cpfDigits(body.cpf);
   if (cpf === null || !isValidCpf(cpf)) {
     throw new InvalidError('Some fields are not valid', { cpf: 'Enter a valid CPF: its check digits do not match' });
   }
   ```

A referência também acrescenta um teste de regressão, `server/src/cpf-check-digits.test.ts`: primeiro e segundo verificadores errados, todos os dígitos iguais, um CPF de verdade escrito dos dois jeitos e uma mudança para um CPF errado.

Depois rode `npm test`, cadastre na tela um paciente com um CPF errado e mova o card para **In QA**.
