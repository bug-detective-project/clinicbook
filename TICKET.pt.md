# CB-110: A semana aberta num domingo mostra a semana seguinte

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Dra. Helena Prado (Diretora clínica) |
| Trilha | Front-end |
| Versão afetada | 1.1 |
| Componente | Agenda |
| Rótulos | `agenda`, `semana`, `datas` |
| Sprint | CB Sprint 3 |
| Criado em | 18/03/2026 08:55 |

## Descrição

No domingo à noite eu planejo a semana, e escolhi o domingo, dia 15, em **Go to a day** na semana da agenda. A agenda abriu a semana de 16 a 22, a semana seguinte. A semana de um domingo é a que termina nele, de 9 a 15, aqui e em todo calendário da clínica.

O mês tem o mesmo problema de outra forma: março de 2026 começa num domingo, e o calendário de março começa na segunda, dia 2. O dia 1 nem aparece na grade.

## Passos para reproduzir

1. Abra a agenda e a aba **Week**.
2. Em **Go to a day**, escolha o domingo, 15 de março de 2026 (ou abra `/week?day=2026-03-15`).
3. Depois abra a aba **Month** em março de 2026.

## Resultado esperado

A semana do dia 15 é "Mar 9 – Mar 15, 2026", e **Previous week** vai para "Mar 2 – Mar 8, 2026". O mês de março de 2026 começa a grade na segunda, 23 de fevereiro, então o dia 1º de março está lá.

## Resultado atual

A semana do dia 15 é "Mar 16 – Mar 22, 2026". O mês de março começa no dia 2.

## Critérios de aceite

- [ ] Uma semana aberta num domingo é a semana da segunda anterior até aquele domingo.
- [ ] Um mês que começa num domingo mostra o primeiro dia, com os dias do mês anterior antes dele.
- [ ] Todo outro dia da semana continua abrindo a semana certa.

## Ambiente

- ClinicBook 1.1
