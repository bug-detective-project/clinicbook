# CB-102: O total do dia não muda quando uma consulta é cancelada

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Agenda |
| Rótulos | `agenda`, `total` |
| Sprint | CB Sprint 2 |
| Criado em | 09/03/2026 10:15 |

## Descrição

Acima da lista, a agenda diz quantas consultas o dia tem, sem contar as canceladas. Lemos esse número em voz alta para os médicos no começo de cada turno.

Quando cancelo uma consulta, a linha vira "Cancelled" na hora, e o número acima continua o mesmo. Um tempo depois ele se corrige, e recarregar a página também corrige. Nesse meio-tempo o número e a lista discordam, e é bem aí que alguém me pergunta "quantas hoje?".

## Passos para reproduzir

1. Abra a agenda de um dia com algumas consultas e anote o total acima da lista.
2. Clique em **Cancel** em uma delas.
3. Olhe o total logo em seguida.

## Resultado esperado

O total diminui em um assim que a linha mostra "Cancelled".

## Resultado atual

A linha mostra "Cancelled" e o total continua com o número antigo por vários segundos.

## Critérios de aceite

- [ ] Cancelar uma consulta diminui o total na hora, todas as vezes.
- [ ] Confirmar uma consulta não muda o total.
- [ ] O total na tela é sempre o que uma recarga mostraria.

## Ambiente

- ClinicBook 1.0, Chrome

## Atividade

**Renata Siqueira** · 09/03/2026 10:32
> Nunca está errado quando abro a agenda. Só depois que mudo alguma coisa naquela tela.
