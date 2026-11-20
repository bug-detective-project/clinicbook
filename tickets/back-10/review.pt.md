# Code review: CB-210, o último dia de um período incluído

Um caractere decidia se o último dia de toda semana existia. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- Um período pode ser escrito com o fim incluído (de `from` a `to`, os dois dentro) ou excluído (de `from` até antes de `to`). Os dois são comuns; misturar é o bug.
- A rota, o esquema dela e as telas queriam dizer "os dois incluídos". A consulta usava "fim excluído".
- O último dia de uma semana é um domingo, o dia em que a clínica fecha. O buraco ficou invisível até um médico começar a atender aos domingos.

## Por que o conserto da referência está certo

- `<=` faz a consulta querer dizer o que a API diz. Nada mais precisou mudar: as telas já pediam de segunda a domingo.
- Os dias continuam texto e se comparam como texto, o que é seguro para `YYYY-MM-DD`.

## Compare com o seu conserto

- Você somou um dia a `to` na rota? Funciona, e esconde uma convenção ("fim excluído") dentro da consulta enquanto a API diz o contrário. Prefira que a consulta diga o que a API diz.
- Você mudou as telas para pedirem um dia a mais? Todo chamador teria de saber o truque.
- Você converteu os dias para objetos `Date` para comparar? Isso traz fusos horários para um projeto que guarda dias como texto de propósito.

## Para a próxima vez

- Quando uma função recebe um período, escreva se o fim está incluído, e teste as bordas: um período de um dia, e um item no último dia.
- Um resultado vazio para "de hoje até hoje" é o teste mais rápido das bordas.
