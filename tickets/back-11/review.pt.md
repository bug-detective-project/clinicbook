# Code review: CB-211, ausente não é null

Um PATCH que apaga o que não recebe é um PUT disfarçado. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- O formulário da ficha sempre manda todos os campos, então todo teste pela tela passava.
- O `??` trata `undefined` e `null` do mesmo jeito. Para um campo obrigatório, tudo bem. Para um campo opcional, "não mandado" e "mandado como null" querem dizer coisas opostas.
- O script dos planos usa a API como um PATCH deve ser usado, e achou o buraco na hora.

## Por que o conserto da referência está certo

- `'email' in body` faz a única pergunta que importa: a requisição falou do campo? Ausente mantém, `null` apaga, um valor muda.
- Os campos obrigatórios continuam com `??`, porque o esquema já recusa `null` para eles.
- A junção continua num lugar só, antes do `inputOf`, então as conferências do CPF e do e-mail ainda rodam sobre o paciente inteiro.

## Compare com o seu conserto

- Você escreveu `body.email === undefined ? patient.email : body.email`? Mesmo resultado para corpos JSON, onde uma chave não pode guardar `undefined`; o `in` diz isso de forma mais direta.
- Você fez o formulário mandar só o que mudou? O formulário estava certo; a API não.
- Você impediu que `null` apagasse o campo? Aí nada mais consegue remover um e-mail.

## Para a próxima vez

- Para cada campo opcional de um PATCH, teste os três casos: ausente, `null` e um valor.
- Quando uma junção usa `??` ou `||`, pergunte o que acontece com `null`, `''` e `0`.
