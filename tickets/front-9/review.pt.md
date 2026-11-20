# Code review: CB-109, o formulário começa de uma cópia

O formulário mudava o objeto que a ficha mostrava, e o React não tinha como saber. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- `Object.assign(target, …)` escreve em `target` e o devolve. Usado no paciente, ele transformava o próprio objeto da ficha no formulário.
- O React compara objetos pela identidade. O paciente era o mesmo objeto com outros valores dentro, então nada renderizava de novo até outra coisa renderizar, e aí a ficha mostrava os valores mudados.
- Salvar não passava por esse caminho para a mudança em si, então os dados do servidor estavam certos, o que fazia o bug parecer um defeito de exibição.

## Por que o conserto da referência está certo

- O `formOf` monta um objeto novo com os textos que os campos precisam. O paciente que a ficha guarda é lido, nunca escrito.
- O formulário e a ficha agora são donos cada um dos seus dados: o formulário é jogado fora no **Cancel**, e a ficha fica como estava.

## Compare com o seu conserto

- Você escreveu `Object.assign({}, patient, { … })`? Ele copia antes, então está certo; também põe o `id` no formulário, que o formulário não precisa.
- Você escreveu `{ ...patient, … }`? Igual: certo, com alguns campos a mais.
- Você recarregou o paciente do servidor no **Cancel**? Isso esconde o sintoma e deixa o objeto mudado até a resposta chegar.
- Você copiou o paciente no `PatientDetails` antes de passá-lo? Funciona, e o diálogo continuaria mudando o que recebe.

## Para a próxima vez

- Trate props e estado como somente leitura. Quando precisar de uma versão mudada, crie um objeto novo.
- `Object.assign`, `sort`, `reverse`, `splice` e `push` mudam o que recebem. Em dados que vieram de props ou estado, use as formas que copiam (`{ ...}`, `toSorted`, `toReversed`, `toSpliced`, `[...list, item]`).
