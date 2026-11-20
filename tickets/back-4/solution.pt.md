# Solução: Erros do banco chegam ao usuário como mensagens simples

**O que faltava.** O `handleError` em `server/src/app.ts` tratava dois tipos de erro (uma requisição que não cabe no esquema, e os nossos `HttpError`) e respondia a todo o resto com o status que o erro trouxesse, ou 500, e `error.message`. Uma consulta que o banco recusa é lançada como `QueryError`, cuja mensagem leva o SQL, então aquele texto ia direto para a tela.

## Passo a passo

1. **Veja acontecer.** `POST /api/patients` com o e-mail `ana.costa@example.com` responde 500 com a consulta no corpo.
2. **Importe a classe do erro.** `import { HttpError, QueryError } from './errors.ts';`
3. **Termine o tratador.** O parâmetro `_request` vira `request`, porque o último caso o usa:

   ```ts
   function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): FastifyReply {
     // A request that does not fit the schema of its route.
     if ('validation' in error && error.validation) {
       return reply.status(400).send({ error: 'Some fields are not valid', fields: fieldsOf(error.validation) });
     }
     // An answer a rule of the clinic gave on purpose.
     if (error instanceof HttpError) {
       return reply.status(error.status).send({ error: error.message, fields: error.fields });
     }
     // The database refused the query to protect the data: the cases a user can cause.
     if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
       return reply.status(409).send({ error: 'This record already exists' });
     }
     if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
       return reply.status(409).send({ error: 'This record is in use and cannot be removed' });
     }
     if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_CHECK') {
       return reply.status(400).send({ error: 'Some values are outside what the clinic allows' });
     }
     // A request Fastify itself refused, such as a body that is not JSON.
     if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
       return reply.status(error.statusCode).send({ error: error.message });
     }
     request.log.error(error);
     return reply.status(500).send({ error: 'Internal server error' });
   }
   ```

4. **Confira cada linha da tabela.** O e-mail repetido e o paciente com consultas respondem 409 com as frases deles; um corpo que não é JSON continua respondendo 400 com o motivo; e o terminal do servidor mostra o erro completo quando acontece um 500.

A referência também adiciona um teste de regressão, `server/src/error-answers.test.ts`: os dois 409, nenhum SQL em nenhuma resposta, um 500 com o texto fixo quando o banco some, e as respostas que continuam como estavam.

Depois rode `npm test`, teste os dois casos nas telas e mova o card para **Em QA**.
