# Code review: CB-204, o que o usuário lê quando algo dá errado

Um erro tem dois leitores: a pessoa diante da tela e a pessoa que vai consertar. Elas precisam de coisas diferentes, e uma mensagem só não serve às duas. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Separar os erros por quem os causou: a requisição (4xx, e quem chamou pode fazer algo a respeito) ou o servidor (5xx, e quem chamou não pode).
- Decidir, para cada tipo, o que vai na resposta e o que vai no log.
- Manter essa decisão em um lugar só, o tratador de erros, em vez de em cada rota.

## Por que a referência é construída assim

- Os casos vão do mais específico para o mais geral, e o último pega tudo. Um tipo novo de erro em que ninguém pensou cai em "500, Internal server error", que é o lado seguro.
- Os dois erros de banco que um usuário consegue causar viram 409 com uma frase que uma recepcionista entende. Eles são reconhecidos pelo `code` do SQLite, nunca procurando no texto da mensagem.
- As mensagens só são repassadas para erros que foram escritos para quem chamou: os nossos `HttpError` e os 4xx do Fastify. Todo o resto recebe um texto fixo.
- O erro não previsto é registrado inteiro, com o SQL, antes da resposta. O log é o lugar daquele detalhe.
- As rotas não mudaram. Elas continuam lançando, e uma função decide o que o lado de fora vê.

## Compare com o que você construiu

- Você pôs `try/catch` nas rotas de paciente? Aquelas duas rotas ficam corrigidas, e a próxima rota que mexer em uma coluna única vaza de novo. O tratador é a única porta por onde todo erro passa.
- Você testou `error.message.includes('UNIQUE')`? Funciona até o texto mudar; o `code` é a parte estável.
- Você respondeu 500 para o e-mail repetido, com uma mensagem limpa? A mensagem é segura, e o status diz ao cliente que o servidor quebrou quando o problema era a requisição. O formulário não teria como dizer ao usuário para trocar o e-mail.
- Você enviou o 500 genérico para tudo, inclusive os 4xx do Fastify? "Body is not valid JSON" era útil para quem chamou e inofensivo; agora está escondido.
- Você tirou o SQL do próprio `QueryError`? A resposta fica limpa, e o log perde o único detalhe que torna rápido o conserto de um erro de banco.
- Você esqueceu de registrar o último caso? O usuário vê "Internal server error", e a equipe também: ninguém sabe o que aconteceu.

## Fique de olho da próxima vez

- Trate todo `error.message` em uma resposta como uma decisão: esta mensagem foi escrita para quem vai lê-la?
- Faça do último ramo de um tratador de erros o ramo seguro. O que ninguém listou não pode vazar.
