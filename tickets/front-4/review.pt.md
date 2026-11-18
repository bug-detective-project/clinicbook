# Code review: CB-104, um efeito limpa o que ele começa

Nada parecia errado na tela, e por isso este bug viveu tanto. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O efeito do `AgendaPage` carrega o dia e cria um `setInterval` para carregá-lo de novo a cada 15 segundos.
- A limpeza dele só fazia `current = false`, que faz as respostas atrasadas serem ignoradas. O intervalo em si nunca era cancelado.
- Um temporizador pertence à página, não ao componente. Cada troca de dia e cada visita à agenda deixava mais um temporizador rodando até a aba ser recarregada.
- A tela continuava certa porque as respostas dos temporizadores antigos eram descartadas. As requisições continuavam sendo feitas.

## Por que a correção de referência está certa

- O efeito guarda o id do intervalo e a limpeza chama `clearInterval`. O React roda a limpeza antes da próxima execução do efeito e quando o componente sai da tela: os dois momentos em que o temporizador tem que morrer.
- O `current = false` continua. Cancelar o temporizador impede requisições futuras; a marca cobre uma requisição que já estava a caminho quando o usuário saiu.
- A atualização com a agenda aberta fica como estava.

## Compare com a sua correção

- Você cancelou o intervalo e tirou o `current`? Uma resposta que chega depois da troca de dia pode então pôr na tela as consultas do dia antigo.
- Você moveu o temporizador para um `useRef` e o cancela no começo do efeito? Isso resolve a troca de dia e deixa o último temporizador vivo quando o usuário vai para outra tela.
- Você fez o efeito depender de `[]` para rodar uma vez só? Um temporizador, sim, e ele atualiza para sempre o dia com que a página abriu.
- Você conferiu a rota dentro do temporizador e pulou a requisição? As requisições param e os temporizadores continuam se acumulando.

## Fique de olho da próxima vez

- Leia todo efeito como um par: o que ele começa e o que o para. Uma assinatura, um temporizador e um listener precisam todos da segunda metade.
- O linter aponta um intervalo sem limpeza como aviso. Vale ler os avisos antes de um ticket destes ser aberto.
- "Lento depois de horas de uso, bom depois de recarregar" aponta para algo que se acumula.
