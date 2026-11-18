# Solução: O texto inteiro precisa ser um telefone

**Causa.** O `PHONE_PATTERN` em `server/src/schemas.ts` é `'\\+?[0-9 ()-]{8,20}'`, sem âncoras. O Fastify confere com ele o `phone` de um paciente novo, e um padrão sem `^` e `$` se satisfaz com um trecho que case em qualquer ponto do texto. Qualquer telefone que contenha 8 caracteres permitidos em sequência é aceito, com o que vier antes ou depois. Mais tarde, o `toDial` em `server/src/reminders.ts` não consegue transformar um telefone desses em dígitos e lança um erro, e a rodada inteira de lembretes falha.

## Passo a passo

1. **Reproduza na API.** O `curl` do ticket responde 201 para `11 9888-77AB`.
2. **Ache quem confere o telefone.** A rota `POST /api/patients` declara `schema: { body: patientBody }`; no `patientBody`, o `phone` tem `pattern: PHONE_PATTERN`.
3. **Ancore o padrão.**

   ```ts
   /** A phone: digits, spaces, dashes and parentheses, with an optional + in front; 8 to 20 characters. */
   export const PHONE_PATTERN = '^\\+?[0-9 ()-]{8,20}$';
   ```

   O comentário acima da constante já descrevia isso; agora o padrão diz o mesmo.
4. **Confira os dois lados.** Os telefones do ticket respondem 400 com a mensagem do campo, e `(11) 98888-7777`, `+55 11 98888-7777` e `3555-4004` continuam respondendo 201.

A referência também adiciona um teste de regressão, `server/src/patient-phone.test.ts`: seis telefones que não são telefones, os formatos que a clínica usa, e os lembretes saindo normalmente depois de um cadastro recusado.

Depois rode `npm test`, teste o formulário no navegador e mova o card para **Em QA**.
