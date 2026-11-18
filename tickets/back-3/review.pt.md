# Code review: CB-203, "false" é um texto

A variável estava definida, o código a lia, e a resposta ainda saía errada. O bug inteiro está em uma conversão. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- Todo valor do ambiente é um texto. `REMINDERS_ENABLED=false` entrega ao programa as cinco letras `false`.
- A configuração era feita com `Boolean(...)`. Para um texto, o `Boolean` é verdadeiro a não ser que o texto esteja vazio. `'false'`, `'0'` e `'no'` são todos verdadeiros.
- O padrão escondia o problema. Ninguém define `REMINDERS_ENABLED=true`, então o único valor que alguém já usou era justamente o que não funcionava.
- Os testes das rotas passam um objeto de configuração pronto, com um `false` de verdade. A passagem de texto para configuração era o único passo que nada exercitava.

## Por que a correção de referência está certa

- O `readFlag` compara textos: `true` e `1` ligam, `false` e `0` desligam, com qualquer combinação de maiúsculas e com espaços em volta.
- Uma variável ausente ou vazia cai no padrão, então os servidores que nunca a definiram se comportam como antes.
- Qualquer outro valor para o servidor na subida, com uma mensagem que diz o nome da variável. Para uma opção com peso jurídico, "o servidor se recusa a subir" é muito melhor que um palpite.
- É uma função com nome, que recebe o nome da variável: a próxima opção de liga e desliga do servidor é lida do mesmo jeito.

## Compare com a sua correção

- Você escreveu `env.REMINDERS_ENABLED !== 'false'`? Resolve o caso relatado. `FALSE`, `0` e um erro de digitação como `flase` deixam os lembretes ligados, em silêncio.
- Você escreveu `env.REMINDERS_ENABLED === 'true'`? Agora os lembretes ficam desligados quando a variável falta: todo servidor existente muda de comportamento no próximo deploy.
- Você usou `JSON.parse`? Ele lê bem `false` e `0`, e lança um `SyntaxError` pouco útil para `no` ou para um valor vazio.
- Você pôs a conferência na rota dos lembretes? A configuração continua errada para quem a ler depois; a tela Reminders também a lê.

## Fique de olho da próxima vez

- Converta a configuração uma vez, na borda do programa, para o tipo que o código quer. Dali em diante ninguém deveria ver o texto cru.
- Para cada opção, escreva três respostas: o que liga, o que desliga, e o que acontece com qualquer outra coisa.
- Teste a própria leitura da configuração, com os textos que um operador digitaria de verdade.
