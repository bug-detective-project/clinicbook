# Code review: CB-106, o seletor de horário

Um componente pequeno é feito principalmente de decisões: o que ele recebe, o que é dele, e qual elemento do navegador trabalha por ele. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Transformar uma especificação escrita (três props e uma lista de comportamentos) em um componente.
- Manter o componente "controlado": o formulário é o dono do horário escolhido, o seletor só o mostra e avisa de uma escolha.
- Ligá-lo a dados que chegam depois e mudam: os horários livres dependem do médico e do dia.

## Por que a referência é construída assim

- As opções são botões de rádio de verdade. O navegador já dá a um grupo de rádios tudo o que o ticket pede: uma escolha por vez, Espaço para escolher, setas para andar, e os anúncios certos para um leitor de tela. O CSS esconde o círculo e estiliza o rótulo como um botão.
- O seletor não tem estado. O `value` entra e o `onChange` sai, então o formulário, o endereço (`&time=`) e o seletor nunca discordam sobre o horário escolhido.
- O caso vazio é tarefa do seletor. Quem usa o componente não precisa lembrar de tratar um dia sem horários livres.
- No formulário, um efeito depende do médico e do dia, carrega os horários livres e descarta um horário escolhido que não está entre eles. O mesmo código serve para marcar e para remarcar, porque os dois são o mesmo formulário.

## Compare com o que você construiu

- Você usou elementos `<button>` e uma classe para o escolhido? Dá para fazer funcionar; aí você fica devendo ao teclado e ao leitor de tela tudo o que os rádios davam de graça (`aria-pressed` ou `aria-checked`, setas, uma parada só do Tab).
- O seletor guardou um estado `selected` próprio? Funciona até o formulário mudar o horário por fora (o endereço, um médico novo), e aí os dois discordam.
- O seletor chamou o `listSlots` ele mesmo? Ele fica preso a esta API e não dá para mostrá-lo nem testá-lo com uma lista simples.
- Você deixou um horário escolhido no lugar depois que o médico mudou? O formulário pode então enviar um horário que o novo médico não tem.
- Você deu um `name` diferente a cada rádio, ou nenhum? Cada um vira o próprio grupo: as setas param de andar entre eles e vários podem ficar marcados.

## Fique de olho da próxima vez

- Antes de escrever um componente de interface, procure o elemento nativo que já se comporta daquele jeito.
- Decida quem é o dono de cada estado antes de escrever o componente. "O pai é o dono" é a resposta mais vezes do que parece.
