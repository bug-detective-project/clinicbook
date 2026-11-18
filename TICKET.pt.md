# CB-206: Terminar a remarcação: funciona ao marcar e falha ao alterar

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (consultas) |
| Rótulos | `consultas`, `remarcação`, `endpoint` |
| Sprint | CB Sprint 2 |
| Criado em | 13/03/2026 14:00 |

## Descrição

Toda consulta da agenda tem um botão **Reschedule**. Ele abre o mesmo formulário que usamos para marcar, escolhemos o novo dia e horário, clicamos em **Reschedule**, e a resposta é "Rescheduling is not available yet".

Então hoje remarcamos à mão: cancelamos a consulta e marcamos outra. O paciente fica com uma consulta cancelada na ficha a cada mudança, e duas vezes nesta semana cancelamos e esquecemos de marcar a nova.

A equipe nos disse que a funcionalidade foi começada e nunca terminada. A tela está pronta e marcar funciona; a parte do servidor que altera uma consulta que já existe é a que falta.

## O que já existe

- O cliente chama `PATCH /api/appointments/:id` com `{ "day": "AAAA-MM-DD", "time": "HH:MM" }` (`rescheduleAppointment` em `client/src/api/appointments.ts`) e espera a consulta como ela fica depois da mudança.
- A rota existe em `server/src/routes/appointments.ts`: o Fastify confere o corpo com `rescheduleBody`, a rota acha a consulta (404 quando não há), e então responde 501. Um comentário marca onde o trabalho parou.
- `server/src/appointments.ts` tem as regras da clínica. O `bookAppointment` mostra o que uma marcação confere, por meio do `assertBookable`: o médico existe, o dia é uma data de verdade e não está no passado, e o horário é um horário do expediente do médico.
- `moveAppointment(db, id, day, time)` em `server/src/repository.ts` grava o novo dia e horário e devolve a consulta. Ainda não é chamada de lugar nenhum.

## O que construir

Termine o `PATCH /api/appointments/:id`:

- Ele move a consulta para o novo dia e horário, com o mesmo paciente, médico e motivo, e responde 200 com a consulta como ela está agora, no mesmo formato das outras rotas.
- **O novo dia e horário seguem as regras de uma marcação**, para o médico da consulta: um dia no passado, um dia ou um horário fora do expediente do médico, um horário que não é o começo de um horário e um dia que não é uma data de verdade são recusados com 400 e as mesmas mensagens que uma marcação dá.
- **Uma consulta cancelada não pode ser remarcada**: 409 com `{ "error": "A cancelled appointment cannot be rescheduled" }`.
- **Uma consulta remarcada espera uma nova confirmação.** Agendada continua agendada; confirmada volta para agendada.
- Quando a requisição é recusada, a consulta fica exatamente como estava.
- Uma consulta que não existe responde 404, como hoje, e um corpo sem `day` ou `time` responde 400 com os campos, como hoje.
- Como no resto do servidor, a rota lê a requisição e responde, e a regra mora com as outras regras em `server/src/appointments.ts`.

## Critérios de aceite

- [ ] Uma consulta agendada vai para o novo dia e horário e mantém paciente, médico e motivo.
- [ ] Uma consulta confirmada volta para agendada quando é movida.
- [ ] Uma consulta cancelada responde 409 com a mensagem acima e não se move.
- [ ] Um horário fora do expediente, um horário no meio de um horário e um dia no passado respondem 400, como em uma marcação, e a consulta não se move.
- [ ] 404 para uma consulta que não existe; 400 para um corpo sem o dia ou o horário.
- [ ] O formulário **Reschedule** da agenda move a consulta e a mostra no novo dia.

## Ambiente

- ClinicBook 1.0

## Atividade

**Renata Siqueira** · 13/03/2026 14:21
> Só com o mesmo médico. Se o paciente quer outro médico, é uma consulta nova, e por nós tudo bem marcá-la como nova.
