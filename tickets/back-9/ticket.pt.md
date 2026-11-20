# CB-209: Períodos sobrepostos passam quando chegam fora de ordem

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (médicos) |
| Rótulos | `médicos`, `horários`, `regras` |
| Sprint | CB Sprint 3 |
| Criado em | 17/03/2026 14:15 |

## Descrição

A nossa exportação da escala manda os horários de um médico para a API na ordem em que estão na planilha, sem ordenar. Ontem ela deu à Dra. Prado uma terça com 11:00 às 15:00, 16:00 às 18:00 e 08:00 às 12:00. O servidor aceitou. Dois períodos cobrem 11:00 às 12:00, e os horários livres daquela manhã saíram errados.

Quando eu mando os mesmos períodos ordenados, o servidor recusa com "Tuesday: two periods overlap", como deveria. A regra depende da ordem em que os períodos chegam.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl -i -X PATCH http://localhost:3001/api/doctors/3 -H 'content-type: application/json' \
  -d '{"name":"Dr. Yuki Tanabe","specialty":"Dermatology","hours":[{"weekday":2,"startsAt":"11:00","endsAt":"15:00"},{"weekday":2,"startsAt":"16:00","endsAt":"18:00"},{"weekday":2,"startsAt":"08:00","endsAt":"12:00"}]}'
```

## Resultado esperado

`400` com `{ "hours": "Tuesday: two periods overlap" }` em `fields`, e os horários do médico ficam como estavam.

## Resultado atual

`200`, e o médico fica com os períodos sobrepostos.

## Critérios de aceite

- [ ] Períodos do mesmo dia que se sobrepõem são recusados em qualquer ordem de chegada, também com outros períodos (daquele dia ou de outro) entre eles.
- [ ] O mesmo vale para um médico novo (`POST /api/doctors`).
- [ ] Períodos que chegam fora de ordem sem se sobrepor continuam aceitos.

## Ambiente

- ClinicBook 1.1
- A exportação da escala da TI
