# Code review: CB-206, terminando a remarcação

Terminar a metade de outra pessoa é uma habilidade à parte: a maior parte do trabalho é descobrir o que a primeira metade pressupunha. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Ler uma funcionalidade que foi começada: uma rota que para em um comentário, uma gravação que ninguém chama, e uma irmã (a marcação) que está completa.
- Fazer "alterar" obedecer às mesmas regras de "criar", compartilhando-as em vez de copiá-las.
- Acrescentar as regras que só uma alteração tem: o estado em que a consulta está agora, e o estado em que ela fica.

## Por que a referência é construída assim

- O código novo é uma função na camada de regras, `rescheduleAppointment`, e uma linha na rota. A rota continua só lendo a requisição e respondendo.
- Ela reaproveita o `assertBookable` com o médico da consulta. O que uma marcação recusa, uma remarcação recusa com o mesmo status e as mesmas palavras, hoje e depois da próxima mudança nas regras.
- As conferências vêm antes da gravação, e a gravação é um comando só. Uma requisição recusada não tem como deixar a consulta movida pela metade.
- A regra de estado está escrita: cancelada é recusada, e o `moveAppointment` põe o status em agendada, então uma consulta confirmada pede uma nova confirmação.
- O `requireAppointment` dá o 404 de graça, do mesmo jeito que as outras rotas o recebem.

## Compare com o que você construiu

- Você copiou as conferências do `assertBookable` para a função nova? Passa hoje. A próxima regra acrescentada às marcações (um feriado, um limite por dia) vai ser acrescentada em um dos dois lugares.
- Você escreveu as conferências na rota? Elas funcionam ali, e as regras da clínica passam a estar em duas camadas; o próximo leitor vai procurar em `appointments.ts` e não vai achar.
- Você cancelou a consulta antiga e criou uma nova? A consulta ganha um id novo, o lembrete e o histórico dela apontam para a antiga, e a ficha do paciente ganha um cancelamento que nunca aconteceu. Esse é o jeito manual que o ticket queria encerrar.
- Você manteve o status como estava? Uma consulta confirmada continuaria confirmada para um dia e horário que o paciente nunca confirmou.
- Você escreveu um `UPDATE` próprio e deixou o `moveAppointment` sem uso? Funciona; ler o repositório antes teria poupado a consulta.
- Você deixou a requisição trocar o médico? O ticket dizia mesmo médico, e o corpo não tem campo para isso.

## Fique de olho da próxima vez

- Quando "criar" e "editar" discordam, procure a regra que um tem e o outro não. Compartilhar uma função é o conserto que dura.
- Antes de terminar uma funcionalidade feita pela metade, liste o que já existe e não é usado. Costuma ser a primeira metade do seu trabalho.
