# Solution: The server checks the digits of a CPF

**What was missing.** `inputOf` in `server/src/routes/patients.ts` kept any 11 digits as a CPF. Nothing compared the last two digits with the first nine.

## Step by step

1. **Reproduce it.** `POST /api/patients` with `"cpf": "123.456.789-00"` answers 201.
2. **Write the rule next to the reading of the CPF**, in `server/src/cpf.ts`, using the `checkDigit` that `cpfFrom` already has:

   ```ts
   /** True for the 11 digits of a real CPF: both check digits match, and the digits are not all the same. */
   export function isValidCpf(digits: string): boolean {
     if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
       return false;
     }
     return checkDigit(digits.slice(0, 9)) === Number(digits[9]) && checkDigit(digits.slice(0, 10)) === Number(digits[10]);
   }
   ```

3. **Use it where the CPF is read**, so registering and changing a patient both refuse:

   ```ts
   const cpf = cpfDigits(body.cpf);
   if (cpf === null || !isValidCpf(cpf)) {
     throw new InvalidError('Some fields are not valid', { cpf: 'Enter a valid CPF: its check digits do not match' });
   }
   ```

The reference also adds a regression test, `server/src/cpf-check-digits.test.ts`: wrong first and second check digits, all the digits the same, a real CPF written both ways, and a change to a wrong CPF.

Then run `npm test`, register a patient with a wrong CPF on the screen, and move the card to **In QA**.
