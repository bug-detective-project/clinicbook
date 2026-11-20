# CB-212: Remover um médico com consultas marcadas apaga as consultas junto

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Altíssima |
| Relator | Dra. Helena Prado (Diretora clínica) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (médicos) |
| Rótulos | `médicos`, `consultas`, `regras` |
| Sprint | CB Sprint 3 |
| Criado em | 19/03/2026 09:10 |

## Descrição

Uma recepcionista removeu o Dr. Oliveira por engano na tela de edição; ela queria mudar a especialidade dele. A tela pediu confirmação, ela clicou em **Remove**, e ele sumiu. Isso já é ruim. Pior: todas as consultas dele foram junto. Os pacientes da semana sumiram da agenda, e ninguém ligou para eles. Dois vieram a uma consulta que não existia mais.

A tela deixa tentar remover qualquer médico, e tudo bem: quem sabe quem tem consultas é o servidor. A regra da clínica é a mesma dos pacientes: um médico com consultas fica.

## Passos para reproduzir

No terminal do VS Code, com o app rodando (a Dra. Prado, médica 1, tem consultas hoje):

```sh
curl "http://localhost:3001/api/appointments?day=2026-03-09"
curl -i -X DELETE http://localhost:3001/api/doctors/1
curl "http://localhost:3001/api/appointments?day=2026-03-09"
```

Ou na tela: **Doctors**, um médico, **Edit**, **Remove doctor**, **Remove**.

## Resultado esperado

`409` com `{ "error": "This record is in use and cannot be removed" }`. O médico, os horários e as consultas ficam. A tela de edição mostra a mensagem, como a lista de pacientes faz para um paciente com consultas.

## Resultado atual

`204`: o médico, os horários e todas as consultas do médico são apagados.

## Critérios de aceite

- [ ] Remover um médico com consultas responde 409 com a mensagem acima, e o médico, os horários e as consultas ficam.
- [ ] A tela de edição mostra a mensagem e continua aberta.
- [ ] Um médico sem consultas ainda pode ser removido, com os horários.

## Ambiente

- ClinicBook 1.1

## Atividade

**Otávio Brandt** · 19/03/2026 09:40
> Os pacientes já têm essa regra: remover um com consultas dá 409. Eu esperaria que os médicos funcionassem do mesmo jeito.
