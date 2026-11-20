# Code review: CB-207, the check digits of a CPF

A CPF carries its own check, and now the server reads it. Here is the reference approach, so you can compare it with yours.

## Why the rule was missing

- The project read the shape of a CPF (11 digits, with or without dots) and stopped there. A typo in one digit still had the shape.
- The arithmetic was already in the project, in `cpfFrom`, to build valid CPFs for the sample patients. Nobody used it to check one.

## Why the reference fix is right

- `isValidCpf` lives next to `cpfDigits` and `cpfFrom`: everything about a CPF is in one file, and it reuses `checkDigit` instead of writing the arithmetic twice.
- It is called in `inputOf`, the one place both `POST` and `PATCH` go through, so a patient can neither be registered nor changed to a wrong CPF.
- The answer is a 400 for the field `cpf`, the same shape as every other field the API refuses, so the form shows it next to the CPF without a change on the client.
- The all-the-same CPFs are refused on purpose: `111.111.111-11` passes the arithmetic and belongs to nobody.

## Compare with your fix

- Did you check only the first check digit? Half the typos pass.
- Did you write the weights as a fixed list per position? It works; the weight `length + 1 - index` is the same rule for both digits.
- Did you validate on the client only? The API is what the plans' bills come from, and the screen is one client among others.
- Did you check the CPF in the JSON schema with a pattern? A pattern sees the shape, not the arithmetic.

## Watch for next time

- Numbers with check digits (CPF, CNPJ, card numbers, ISBN, barcodes) tell you when they were typed wrong. Check them where the data comes in.
- Keep a rule about a kind of value in one module, and call it from every way in.
