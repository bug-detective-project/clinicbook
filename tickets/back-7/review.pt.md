# Code review: CB-207, os dígitos verificadores de um CPF

O CPF carrega a própria conferência, e agora o servidor a lê. Esta é a abordagem da referência, para você comparar com a sua.

## Por que a regra faltava

- O projeto lia o formato de um CPF (11 dígitos, com ou sem pontos) e parava ali. Um erro em um dígito ainda tinha o formato.
- A conta já estava no projeto, no `cpfFrom`, para montar CPFs válidos para os pacientes de exemplo. Ninguém a usava para conferir um.

## Por que o conserto da referência está certo

- `isValidCpf` mora ao lado de `cpfDigits` e `cpfFrom`: tudo sobre o CPF fica num arquivo só, e ele reaproveita o `checkDigit` em vez de escrever a conta duas vezes.
- Ele é chamado em `inputOf`, o único lugar por onde passam o `POST` e o `PATCH`, então um paciente não pode ser cadastrado nem mudado para um CPF errado.
- A resposta é um 400 para o campo `cpf`, no mesmo formato de todo campo que a API recusa, então o formulário a mostra ao lado do CPF sem mudança no cliente.
- Os CPFs com todos os dígitos iguais são recusados de propósito: `111.111.111-11` passa na conta e não é de ninguém.

## Compare com o seu conserto

- Você conferiu só o primeiro verificador? Metade dos erros de digitação passa.
- Você escreveu os pesos como uma lista fixa por posição? Funciona; o peso `length + 1 - index` é a mesma regra para os dois dígitos.
- Você validou só no cliente? É da API que saem as cobranças dos planos, e a tela é um cliente entre outros.
- Você conferiu o CPF no esquema JSON com um pattern? Um pattern vê o formato, não a conta.

## Para a próxima vez

- Números com dígito verificador (CPF, CNPJ, número de cartão, ISBN, código de barras) dizem quando foram digitados errado. Confira-os onde o dado entra.
- Guarde uma regra sobre um tipo de valor num módulo só, e chame-a de todos os caminhos de entrada.
