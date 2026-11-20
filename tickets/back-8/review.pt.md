# Code review: CB-208, as gravações de um médico juntas

Três gravações que andam juntas eram feitas uma de cada vez. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- Mudar os horários de um médico é "apagar os períodos antigos, inserir os novos". Entre os dois, o médico fica sem horário.
- Cada comando era uma transação própria. Quando a inserção falhou, a remoção já tinha acontecido, e a mudança do nome também.
- A validação da rota (`hoursProblem`) pega a maioria dos erros antes de qualquer gravação, e isso escondia o problema. O banco tem uma regra que a rota não repete, o dia da clínica, e essa falha no meio.

## Por que o conserto da referência está certo

- Uma transação em volta das três gravações: ou o médico fica com os dados e os horários novos, ou nada mudou.
- `trx` é usado em cada gravação lá dentro. Uma gravação por `db` dentro do callback rodaria fora da transação e sobreviveria ao rollback.
- O erro não é engolido: ele sai da transação, a transação é desfeita, e o tratador responde como antes.
- O `createDoctor` já funcionava assim, então as duas gravações de um médico agora se comportam igual.

## Compare com o seu conserto

- Você inseriu primeiro e apagou depois? Os períodos novos seriam apagados junto com os antigos. Só a ordem não deixa várias gravações seguras.
- Você conferiu o intervalo de 06:00 a 22:00 na rota? É uma boa conferência para ter, e fecha este caso, mas a próxima regra do banco falha do mesmo jeito. É a transação que deixa qualquer falha segura.
- Você pegou o erro e inseriu os períodos antigos de novo à mão? Isso é uma transação escrita à mão, com mais jeitos de falhar.
- Você usou `db` dentro do `db.transaction().execute`? Olhe de novo: só o `trx` está dentro da transação.

## Para a próxima vez

- Sempre que uma mudança precisa de mais de uma gravação, pergunte como os dados ficam se ela parar entre duas delas. Se a resposta for "errados", ela precisa de uma transação.
- Gravações de substituir tudo (apagar tudo, inserir a lista nova) são o caso clássico.
