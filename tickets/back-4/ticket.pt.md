# CB-204: Impedir que erros do banco cheguem ao usuário com a consulta SQL

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (tratamento de erros) |
| Rótulos | `api`, `erros`, `segurança` |
| Sprint | CB Sprint 2 |
| Criado em | 13/03/2026 11:00 |

## Descrição

A recepção me mandou uma foto da tela. Tentaram cadastrar um paciente com um e-mail que já estava em uso, e embaixo do formulário, em vermelho, estava isto:

> UNIQUE constraint failed: patients.email (query: insert into "patients" ("name", "phone", "email", "birth_date", "created_at") values (?, ?, ?, ?, ?) returning "id", "name", "phone", "email", "birth_date")

Remover um paciente que tem consultas mostra um paredão de texto parecido. A recepcionista não sabe o que fazer com aquilo, e eu não quero os nomes das nossas tabelas e colunas em uma tela que os pacientes enxergam por cima do balcão.

O servidor tem um tratador de erros que já responde bem a uma requisição com campos inválidos e às recusas das nossas próprias regras ("Patient not found", "An appointment cannot be booked in the past"). Para todo o resto, ele envia a mensagem do erro do jeito que ela vem. Essa última parte nunca foi construída.

## O que já existe

- O `handleError` em `server/src/app.ts` é o tratador de erros da API inteira: tudo o que uma rota lança termina ali.
- Uma consulta que o banco recusa é lançada como `QueryError` (`server/src/errors.ts`). O `code` dele é o código do SQLite, como `SQLITE_CONSTRAINT_UNIQUE` e `SQLITE_CONSTRAINT_FOREIGNKEY`; a `message` leva o SQL, que é útil no log e em nenhum outro lugar.
- Os erros do próprio Fastify, como um corpo que não é JSON válido, trazem um `statusCode` entre 400 e 499 e uma mensagem escrita para quem fez a requisição.
- `request.log.error(error)` grava um erro no log do servidor.

## O que construir

Termine o `handleError`, nesta ordem, depois dos dois casos que ele já tem:

| Erro | Status | Corpo |
| --- | --- | --- |
| Um `QueryError` cujo `code` é `SQLITE_CONSTRAINT_UNIQUE` | 409 | `{ "error": "This record already exists" }` |
| Um `QueryError` cujo `code` é `SQLITE_CONSTRAINT_FOREIGNKEY` | 409 | `{ "error": "This record is in use and cannot be removed" }` |
| Um erro com `statusCode` de 400 a 499 | aquele status | `{ "error": <a mensagem do erro> }`, como hoje |
| Qualquer outra coisa | 500 | `{ "error": "Internal server error" }` |

- No último caso, o erro é gravado no log do servidor antes da resposta, para a equipe ainda conseguir descobrir o que aconteceu.
- Nenhuma resposta pode levar o SQL, o nome de uma tabela ou de uma coluna, nem o nome do banco.
- As respostas que já estão certas não mudam: 400 com `fields` para uma requisição inválida, e o status e a mensagem das nossas regras (404, 409, 400).

## Critérios de aceite

- [ ] Cadastrar um paciente com um e-mail já cadastrado responde 409 com "This record already exists".
- [ ] Remover um paciente que tem consultas responde 409 com "This record is in use and cannot be removed", e o paciente continua lá.
- [ ] Nenhuma resposta da API contém o SQL nem nomes de tabelas e colunas.
- [ ] Um erro que ninguém previu responde 500 com "Internal server error" e vai para o log.
- [ ] Um corpo que não é JSON continua respondendo 400 com o motivo; campos inválidos e as recusas das regras respondem como antes.
- [ ] As telas mostram as mensagens simples.

## Ambiente

- ClinicBook 1.0

## Atividade

**Otávio Brandt** · 13/03/2026 11:24
> Mantenham o erro completo no log, por favor. Quando algo quebra de verdade às 7 da manhã, o log é tudo o que eu tenho.
