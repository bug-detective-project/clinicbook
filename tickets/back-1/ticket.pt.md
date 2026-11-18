# CB-201: Consulta cancelada pode ser confirmada de novo

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (consultas) |
| Rótulos | `consultas`, `status`, `regras` |
| Sprint | CB Sprint 2 |
| Criado em | 09/03/2026 15:20 |

## Descrição

Uma paciente ligou para cancelar, e eu cancelei a consulta na minha mesa. Alguns segundos depois a minha colega, na outra mesa, clicou em **Confirm** na mesma consulta: a tela dela ainda não tinha atualizado e mostrava a consulta como agendada. A consulta voltou à vida como "Confirmed".

Nesse meio-tempo eu já tinha dado aquele horário a outro paciente. Os dois vieram. A médica não achou graça.

A regra da clínica é simples: consulta cancelada continua cancelada. Se o paciente muda de ideia, marcamos outra.

## Passos para reproduzir

No terminal do VS Code, com o app rodando (a consulta 9 dos dados de exemplo está cancelada):

```sh
curl -i -X POST http://localhost:3001/api/appointments/9/confirm
curl http://localhost:3001/api/appointments/9
```

Ou com duas janelas do navegador na agenda: cancele uma consulta em uma, e clique em **Confirm** nela na outra antes que essa atualize.

## Resultado esperado

O servidor recusa: `409` com `{ "error": "A cancelled appointment cannot be confirmed" }`, e a consulta continua cancelada. A agenda já mostra a mensagem que o servidor envia e carrega a lista de novo.

## Resultado atual

`200`, e a consulta fica confirmada.

## Critérios de aceite

- [ ] Confirmar uma consulta cancelada responde 409 com a mensagem acima, e a consulta continua cancelada.
- [ ] O horário de uma consulta cancelada continua livre para outros pacientes.
- [ ] Uma consulta agendada ainda pode ser confirmada.

## Ambiente

- ClinicBook 1.0
- Dois computadores da recepção na mesma agenda

## Atividade

**Renata Siqueira** · 09/03/2026 15:44
> Cancelar a mesma coisa duas vezes já dá erro, "This appointment is already cancelled". Então alguma regra existe em algum lugar. Parece que confirmar só não pergunta a ela.
