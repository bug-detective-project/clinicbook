# Code review: CB-202, o texto inteiro precisa ser um telefone

Faltavam dois caracteres, e uma validação que parecia rígida deixava passar quase tudo. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O esquema confere `phone` com um padrão. O padrão descrevia um telefone corretamente e não dizia que o telefone tinha que ser o texto inteiro.
- Uma expressão regular sem âncoras procura um trecho que case em qualquer lugar. `call 11 98888-7777` contém um telefone válido, então passava, com a palavra junto.
- A recusa de `1234` fazia a validação parecer viva. Uma conferência que falha para algumas entradas ruins não diz nada sobre as outras.
- O estrago apareceu longe da causa: nos lembretes, dias depois, de outros pacientes.

## Por que a correção de referência está certa

- `^` e `$` em volta do mesmo padrão: o texto precisa ser um telefone do primeiro ao último caractere.
- Os limites passam a valer. O `{8,20}` só contava os caracteres do trecho que casava; ancorado, ele conta o texto inteiro.
- A correção fica na porta. Tudo o que vem depois dela, a começar pelos lembretes, pode agora confiar que um telefone gravado dá para discar.

## Compare com a sua correção

- Você limpou o telefone na rota (tirou o que não é dígito) e o manteve? `11 98888-7777 / 11 3555-4004` vira um número de 21 dígitos: dado errado, gravado sem reclamar. Recusar deixa a pessoa da recepção corrigir.
- Você fez os lembretes pularem um telefone que não conseguem discar? É uma boa segunda defesa, para os telefones que já estão no banco. Não substitui a conferência na porta, e este ticket era sobre a porta.
- Você escreveu a conferência à mão na rota, antes ou depois do esquema? Agora há duas definições de "telefone" para manter iguais.
- Você ancorou só uma ponta? O `^` sozinho ainda aceita `11 98888-7777 (mom)`.

## Fique de olho da próxima vez

- Leia um padrão de validação como uma pergunta: "o valor inteiro tem esta forma?". Se ele não tem `^` e `$`, está perguntando outra coisa.
- Teste uma validação com entradas erradas de jeitos diferentes: curta demais, longa demais, certa no meio e errada nas pontas.
- Quando um registro ruim derruba um lote para todo mundo, olhe como o registro entrou e como o lote trata uma falha. São dois consertos separados.
