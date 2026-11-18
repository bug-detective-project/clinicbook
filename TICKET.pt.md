# CB-205: Construir o endpoint dos horários livres de um médico

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Altíssima |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (médicos) |
| Rótulos | `médicos`, `api`, `endpoint` |
| Sprint | CB Sprint 2 |
| Criado em | 12/03/2026 14:10 |

## Descrição

O formulário de marcação deveria mostrar os horários livres do médico escolhido no dia escolhido, para a gente escolher só o que existe. Hoje ele diz "The free times could not be loaded" e não oferece nada: a tela está pronta e pergunta ao servidor, e o servidor não tem esse endpoint. Não conseguimos marcar nem remarcar pelo formulário.

Toda consulta ocupa um horário de 30 minutos. Um médico tem expediente para cada dia da semana, às vezes em dois períodos (manhã e tarde, com o almoço no meio). Um horário está livre quando é o começo de um horário daquele expediente e nenhuma consulta ainda válida o ocupa.

## O que já existe

- O cliente chama `GET /api/doctors/:id/slots?day=AAAA-MM-DD` (`listSlots` em `client/src/api/doctors.ts`) e espera `{ "day": "...", "slots": ["08:00", "08:30", ...] }`.
- `server/src/routes/doctors.ts` tem a outra rota dos médicos. As rotas recebem `db` e `today()`, o dia que o servidor chama de hoje.
- `server/src/repository.ts` tem `findDoctor(db, id)`, `workingPeriods(db, doctorId, weekday)` (os períodos de um dia da semana, o mais cedo primeiro, cada um com `startsAt` e `endsAt` como `HH:MM`) e `bookedTimes(db, doctorId, day)` (os horários das consultas daquele dia que não estão canceladas).
- `server/src/dates.ts` tem `isDay`, `weekdayOf` (1 é segunda-feira), `minutesOf` (`"08:30"` é 510) e `timeOf` (510 é `"08:30"`). `server/src/schedule.ts` tem `SLOT_MINUTES` e `isWorkingTime`, a regra que uma marcação usa para aceitar um horário.
- `server/src/schemas.ts` tem `requiredDayQuery`, o esquema de uma query que precisa trazer um `day`. Os erros de `server/src/errors.ts` (`NotFoundError`, `InvalidError`) viram as respostas certas sozinhos.

## O que construir

`GET /api/doctors/:id/slots?day=AAAA-MM-DD`

- Responde 200 com `{ "day": <o dia pedido>, "slots": [...] }`. `slots` tem todos os horários livres do médico naquele dia, como `HH:MM`, em ordem, o mais cedo primeiro.
- Os horários de um período começam no `startsAt` e seguem de 30 em 30 minutos; o último é o que termina exatamente no `endsAt`. Um período das 08:00 às 12:00 tem 08:00, 08:30, ..., 11:30. Um dia com dois períodos tem os horários dos dois.
- Um horário ocupado por uma consulta agendada ou confirmada fica de fora. O horário de uma consulta cancelada está livre.
- Um dia da semana em que o médico não atende responde uma lista vazia.
- Um dia anterior a hoje responde uma lista vazia: nada pode ser marcado no passado.
- Um médico que não existe responde 404 com `{ "error": "Doctor not found" }`.
- Uma requisição sem `day`, ou com um `day` que não é uma data de verdade (`tomorrow`, `2026-02-30`), responde 400.
- Todo horário que o endpoint oferece precisa ser aceito por uma marcação (`POST /api/appointments`), e depois de marcado ele deixa de ser oferecido.

## Critérios de aceite

- [ ] Um dia sem consultas lista todos os horários dos períodos do médico, em ordem.
- [ ] Horários ocupados ficam de fora; o horário de uma consulta cancelada é oferecido.
- [ ] Um dia em que o médico não atende e um dia que já passou respondem `"slots": []`.
- [ ] 404 para um médico desconhecido; 400 sem dia ou com um dia que não é data.
- [ ] Todo horário oferecido pode ser marcado, e um horário marcado sai da lista.
- [ ] O formulário de marcação mostra os horários livres e marca um.

## Ambiente

- ClinicBook 1.0
- Dados de exemplo: a Dra. Helena Prado atende de segunda a sexta, das 08:00 às 12:00 e das 14:00 às 17:00; o Dr. Marcos Oliveira, segunda, quarta e sexta, das 09:00 às 13:00; a Dra. Yuki Tanabe, terça e quinta, das 13:00 às 18:00, e sábado, das 08:00 às 12:00

## Atividade

**Renata Siqueira** · 12/03/2026 14:32
> Por favor, não ofereçam o horário do almoço. A Dra. Helena já foi marcada às 12:30 uma vez, à mão, e ela lembra.
