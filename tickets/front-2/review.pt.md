# Code review: CB-102, o total que acompanha a lista

Dois estados que dizem a mesma coisa vão discordar mais cedo ou mais tarde. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- A página tinha `appointments` e, ao lado, `total`: a contagem das consultas que não estão canceladas.
- Carregar a lista gravava os dois. O `change`, que roda depois de **Cancel** e **Confirm**, trocava uma consulta na lista e não mexia no `total`.
- A atualização de 15 em 15 segundos carrega a lista de novo, então o número se curava sozinho. Por isso parecia um atraso, e não um número errado.

## Por que a correção de referência está certa

- O `total` deixou de ser estado. Ele é calculado a partir de `appointments` a cada renderização: `appointments.filter(...).length`.
- Existe uma fonte só da verdade. Todo caminho que muda a lista (carregar, atualizar, cancelar, confirmar e o que vier depois) muda o número junto, sem nenhum código para lembrar.
- Contar algumas dezenas de linhas a cada renderização não custa nada que valha a pena economizar.

## Compare com a sua correção

- Você adicionou `setTotal` dentro do `change`? Resolve este ticket. A próxima função que mudar a lista vai precisar lembrar disso também, e nada avisa quem esquecer.
- Você recalculou o `total` em um `useEffect` que observa `appointments`? Funciona com uma renderização de atraso: a tela pinta primeiro o número antigo. Derivar na renderização não tem esse quadro.
- Você carregou a lista inteira de novo depois de um cancelamento? O número fica certo, ao preço de uma requisição por algo que a página já sabia.
- Você embrulhou a contagem em `useMemo`? Tudo bem, e não é necessário neste tamanho.

## Fique de olho da próxima vez

- Antes de criar um `useState`, pergunte se o valor pode ser calculado a partir de um estado que já existe. Se pode, calcule.
- "Se corrige sozinho depois de um tempo" costuma indicar uma cópia que outra coisa está atualizando.
