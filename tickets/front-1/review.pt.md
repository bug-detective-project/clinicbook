# Code review: CB-101, um clique ou vários, uma consulta

Um formulário que envia algo para um servidor tem um estado que quase todo formulário esquece: "enviado, esperando a resposta". Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `submit` começava uma requisição a cada chamada e não guardava nada sobre ela.
- Um clique duplo são dois eventos de clique com poucos milissegundos de intervalo. Uma requisição demora muito mais que isso, então o segundo clique sempre encontrava o formulário pronto para enviar.
- Não havia nada de errado em nenhuma das requisições. O bug estava no que a página fazia entre elas.

## Por que a correção de referência está certa

- Um estado `saving` é gravado antes de a requisição começar. O `submit` retorna na hora enquanto ele está ligado, e o botão fica desabilitado com ele.
- Os dois usos cobrem caminhos diferentes. O botão desabilitado segura o mouse; o retorno antecipado segura também o Enter, que envia um formulário sem passar pelo botão.
- O estado só volta para `false` quando a requisição falha. Depois de um sucesso a página navega para outra tela, e religar o botão por um instante reabriria a janela que a correção fecha.

## Compare com a sua correção

- Você só desabilitou o botão? Teste o Enter em um campo de texto do formulário: o formulário ainda é enviado.
- Você usou um temporizador ("ignorar cliques por um segundo")? Ele falha em uma conexão mais lenta que o temporizador, que é justamente quando o bug mais aparece.
- Você desligou o `saving` em um `finally`? Funciona, e religa o botão no sucesso por uma renderização; aqui não faz mal porque a página sai, e é arriscado em um formulário que fica na tela.
- Você guardou a marca em um `useRef` em vez de estado? Isso barra a segunda requisição, e o usuário não recebe nenhum sinal de que algo está acontecendo.

## Fique de olho da próxima vez

- Todo botão que começa uma requisição precisa de uma resposta para "e se clicarem de novo antes de a resposta chegar?".
- A página só consegue tornar a repetição improvável. Um servidor que nunca pode aceitar a mesma requisição duas vezes precisa recusá-la ele mesmo; essa é uma regra da API, e um trabalho à parte.
