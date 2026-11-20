# CB-202: Telefone com letras é aceito e quebra os lembretes

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (pacientes) |
| Rótulos | `pacientes`, `validação`, `lembretes` |
| Sprint | CB Sprint 2 |
| Criado em | 12/03/2026 10:05 |

## Descrição

Na terça ninguém recebeu lembrete. A recepção clicou em **Send the reminders of tomorrow** e a tela respondeu "The reminders were not sent: Internal server error". Demorei para achar o motivo: um paciente estava cadastrado com o telefone `11 98888-7777 (mom)`. Os lembretes param no primeiro telefone que não conseguem discar, e aquele paciente derrubou o lembrete de todos os outros.

Corrigi aquele telefone à mão no banco. O problema de verdade é ele ter entrado: o formulário recusa `1234` por ser curto demais, então eu supus que o telefone estava sendo conferido. Ele aceita quase qualquer outra coisa, desde que haja dígitos suficientes em algum ponto do texto.

Um telefone são dígitos, espaços, traços e parênteses, com um `+` opcional na frente, de 8 a 20 caracteres. Nada mais.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl -i -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Vera Xavier","phone":"11 9888-77AB"}'
```

O campo de telefone da tela agora só aceita dígitos, então a tela não consegue mais mandar um telefone assim. A API continua recebendo telefones dos outros sistemas da clínica, como a importação da lista antiga de pacientes que trouxe esse.

## Resultado esperado

`400`, com a mensagem do campo de telefone: "Use only digits, spaces, dashes and parentheses (8 to 20 characters)". O paciente não é cadastrado.

## Resultado atual

`201`. O paciente é cadastrado com aquele telefone, e o próximo lembrete para ele falha para todo mundo.

## Critérios de aceite

- [ ] Um telefone com letras ou palavras, antes, depois ou no meio do número, é recusado com 400 e a mensagem do campo.
- [ ] Um telefone com mais de 20 caracteres é recusado.
- [ ] Os formatos que usamos continuam aceitos: `11988887777`, `(11) 98888-7777`, `+55 11 98888-7777`, `3555-4004`.
- [ ] O formulário mostra a mensagem ao lado do telefone e não cadastra ninguém.

## Ambiente

- ClinicBook 1.0

## Atividade

**Otávio Brandt** · 12/03/2026 10:31
> Outros exemplos que a recepção digitou no último mês: `call 11 98888-7777`, `(11) 98888-7777 ext. 2`, `11 98888-7777 / 11 3555-4004`. Todos aceitos.
