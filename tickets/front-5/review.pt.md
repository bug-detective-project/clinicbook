# Code review: CB-105, um menu que fecha como um menu

Abrir um menu é uma linha de estado. Fechar direito é onde entra a plataforma web. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Eventos que acontecem fora de um componente: o componente precisa escutar no `document`, e precisa parar.
- Distinguir "dentro" de "fora" com o próprio DOM (`contains`), e não com coordenadas.
- Deixar quem usa o teclado onde estava: fechar com Esc e devolver o foco ao botão.

## Por que a referência é construída assim

- Um efeito só, ligado ao `open`. Os listeners existem apenas enquanto o menu está aberto, e a limpeza do efeito os remove quando ele fecha ou quando a linha some. Uma lista de 200 pacientes não adiciona nenhum listener até alguém abrir um menu.
- `pointerdown` e não `click`: ele dispara para mouse, toque e caneta, e dispara antes do clique, então o menu antigo já sumiu quando o novo abre.
- `containerRef.current.contains(event.target)` cobre o botão e tudo o que está dentro do menu, espaçamento incluído, com uma conferência só.
- Depois do Esc o foco vai para o botão. Sem isso, o foco fica em um elemento que não existe mais e o próximo Tab começa do topo da página.
- "Um menu aberto por vez" não precisou de código próprio: um clique em outro botão é um clique fora.

## Compare com o que você construiu

- Você adicionou os listeners uma vez, para todo menu, aberto ou fechado? Funciona, e faz cada clique na página rodar uma função por paciente.
- Você esqueceu de removê-los na limpeza? Cada abre-e-fecha deixa um listener para trás, e uma linha removida continua respondendo.
- Você fechou o menu no `blur`? Clicar em um item do menu tira o foco do botão antes, e o menu pode fechar antes de o clique chegar.
- Você usou uma camada transparente sobre a página para pegar o clique? Ela também engole aquele clique: o usuário precisa clicar duas vezes para alcançar o que está embaixo.
- Você guardou "qual menu está aberto" na página, um estado para a lista inteira? Também é um bom desenho, e deixa explícito o "um por vez".

## Fique de olho da próxima vez

- Sempre que um componente adicionar um listener ao `document` ou à `window`, escreva a remoção na mesma hora.
- Teste todo componente novo só com o teclado: abra, ande por dentro, saia, e veja onde o foco vai parar.
