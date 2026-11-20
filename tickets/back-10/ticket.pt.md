# CB-210: O último dia some da semana e do mês

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Dra. Helena Prado (Diretora clínica) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (agenda) |
| Rótulos | `agenda`, `período`, `datas` |
| Sprint | CB Sprint 3 |
| Criado em | 18/03/2026 11:20 |

## Descrição

O Dr. Oliveira começou a atender aos domingos este mês. A Giovana marcou a primeira, para o domingo dia 15, e a consulta está lá na agenda daquele dia. Mas a semana de 9 a 15 não mostra o domingo, como se ele não tivesse nada.

Olhei mais: qualquer que seja o período que a agenda pede, as consultas do último dia não aparecem. No mês aparece menos, porque o último dia da grade é um domingo do mês seguinte, mas é a mesma coisa.

## Passos para reproduzir

No terminal do VS Code, com o app rodando (as consultas de hoje dos dados de exemplo são no dia 9):

```sh
curl "http://localhost:3001/api/appointments?day=2026-03-09"
curl "http://localhost:3001/api/schedule?from=2026-03-09&to=2026-03-09"
```

## Resultado esperado

O período de um dia a outro tem as consultas de todos os dias, o primeiro e o último incluídos: as duas respostas acima têm as mesmas consultas.

## Resultado atual

O período de 9 a 9 vem vazio, e uma semana deixa de fora o último dia.

## Critérios de aceite

- [ ] `GET /api/schedule` tem as consultas do dia em `to`, como tem as do dia em `from`, para todos os médicos e para um.
- [ ] A semana da agenda mostra uma consulta do domingo dela.
- [ ] O resto continua igual: a ordem, o filtro de médico e o limite de 42 dias.

## Ambiente

- ClinicBook 1.1
