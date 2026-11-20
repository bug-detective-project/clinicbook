# CB-207: Validar o CPF do paciente: os dígitos verificadores

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (pacientes) |
| Rótulos | `pacientes`, `cpf`, `validação` |
| Sprint | CB Sprint 3 |
| Criado em | 16/03/2026 10:05 |

## Descrição

Os planos de saúde começaram a devolver as nossas cobranças: "CPF inválido". A recepcionista digita o CPF do paciente, a tela formata como `000.000.000-00`, e o servidor guarda quaisquer 11 dígitos. Um erro de digitação vira um número com cara de válido que ninguém tem, e só descobrimos um mês depois, quando o plano se recusa a pagar.

O CPF já diz se foi digitado certo: os dois últimos dígitos são verificadores, calculados a partir dos nove primeiros. Queremos que o servidor recuse um CPF cujos dígitos verificadores não batem, do mesmo jeito que recusa um telefone que não é telefone.

## Como funcionam os dígitos verificadores

Pegue os nove primeiros dígitos. Multiplique-os por 10, 9, 8, … 2, da esquerda para a direita, e some os resultados. Multiplique a soma por 10 e tire o resto da divisão por 11; um resto 10 vale 0. Esse é o primeiro dígito verificador, o 10º dígito do CPF.

Para o segundo, faça o mesmo com os dez primeiros dígitos (os nove e o primeiro verificador), com os pesos 11, 10, … 2. O resultado é o 11º dígito.

`529.982.247-25`: 5×10 + 2×9 + 9×8 + 9×7 + 8×6 + 2×5 + 2×4 + 4×3 + 7×2 = 295; 2950 mod 11 = 2, o primeiro verificador. Com o 2 no fim e os pesos de 11 a 2, o segundo dá 5.

Um CPF com todos os dígitos iguais (`111.111.111-11`, `000.000.000-00`) passa nessa conta e também não é válido.

## O que já existe

- `server/src/cpf.ts` lê os 11 dígitos de um CPF escrito com ou sem os pontos e o traço (`cpfDigits`), e monta um CPF válido a partir de nove dígitos para os dados de exemplo (`cpfFrom`). Veja como o `cpfFrom` calcula um dígito verificador.
- `server/src/routes/patients.ts` confere o CPF em `inputOf`, usado no cadastro (`POST /api/patients`) e na mudança (`PATCH /api/patients/:id`) de um paciente. Hoje ele só recusa um CPF que não tem 11 dígitos.
- Um `InvalidError` com `{ cpf: '…' }` vira um 400 com o campo, e o formulário mostra a mensagem ao lado do CPF.

## Critérios de aceite

- [ ] Cadastrar ou mudar um paciente com um CPF cujo primeiro ou segundo dígito verificador não bate responde 400 com uma mensagem para o campo `cpf`, e nada é salvo.
- [ ] Um CPF com todos os dígitos iguais é recusado do mesmo jeito.
- [ ] Um CPF de verdade continua aceito, escrito com ou sem os pontos e o traço, e um CPF que pertence a outro paciente continua respondendo 409.

## Atividade

**Otávio Brandt** · 16/03/2026 10:31
> Mensagem que usamos nos outros sistemas: "Enter a valid CPF: its check digits do not match". O mesmo texto aqui seria bom.
