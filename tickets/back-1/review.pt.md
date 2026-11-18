# Code review: CB-201, consulta cancelada continua cancelada

A regra existia, estava correta e tinha teste. Uma das duas funções que deveriam perguntar a ela não perguntava. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- Os estados de uma consulta e as passagens entre eles estão em uma tabela só, em `server/src/rules.ts`. O `assertTransition` a lê.
- O `cancelAppointment` perguntava à regra. O `confirmAppointment` só conferia que a consulta existia e gravava `confirmed`.
- A tela escondia o buraco quase sempre: ela só oferece **Confirm** em consultas agendadas. Uma tela com 15 segundos de atraso, uma segunda aba ou uma chamada direta à API passam direto por isso.

## Por que a correção de referência está certa

- Uma linha: `assertTransition(appointment.status, 'confirmed')`, antes de gravar. Confirmar agora segue a mesma tabela de cancelar.
- O 409 e a mensagem vêm da regra, então as duas operações respondem com a mesma voz, e um estado novo acrescentado à tabela é respeitado pelas duas.
- A conferência está no servidor. A agenda mostra a recusa e recarrega a lista, o que também conta à segunda recepcionista o que aconteceu.

## Compare com a sua correção

- Você escreveu `if (appointment.status === 'cancelled') throw ...` dentro do `confirmAppointment`? Isso fecha este ticket e deixa dois lugares que conhecem a regra; eles vão se afastar. E ainda deixa uma consulta confirmada ser "confirmada" de novo.
- Você pôs a conferência na rota? A regra passa a pertencer a uma entrada só. O próximo que chamar `confirmAppointment` pula a regra.
- Você escondeu melhor o botão no cliente? O cliente nunca foi o problema: ele mostrava o que sabia.
- Você mudou a tabela em `rules.ts`? Ela já estava certa.

## Fique de olho da próxima vez

- O que a tela não oferece, a API ainda precisa recusar. A tela é um cliente entre outros, e nunca está totalmente atualizada.
- Quando duas operações são irmãs (confirmar e cancelar, criar e editar), leia as duas lado a lado. A diferença costuma ser o bug.
