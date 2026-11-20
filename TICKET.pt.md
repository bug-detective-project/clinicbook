# CB-211: Mudar só o plano de saúde apaga o e-mail e o nascimento

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (pacientes) |
| Rótulos | `pacientes`, `api`, `patch` |
| Sprint | CB Sprint 3 |
| Criado em | 18/03/2026 16:45 |

## Descrição

O portal dos planos de saúde avisa quando um paciente troca de plano, e um script nosso atualiza o paciente com `PATCH /api/patients/:id` mandando só `{ "healthPlan": "…" }`. É para isso que serve um PATCH: mandar o que mudou.

Desde que o script começou, todo paciente que ele tocou perdeu o e-mail e a data de nascimento. A Ana Beatriz Costa agora tem "No e-mail" e "Not informed" na ficha. O plano está certo.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl http://localhost:3001/api/patients/1
curl -i -X PATCH http://localhost:3001/api/patients/1 -H 'content-type: application/json' -d '{"healthPlan":"Amparo Vida"}'
curl http://localhost:3001/api/patients/1
```

## Resultado esperado

O plano de saúde muda, e todo campo que a requisição não mandou mantém o valor.

## Resultado atual

O plano de saúde muda, e o e-mail e a data de nascimento viram `null`.

## Critérios de aceite

- [ ] Um `PATCH` muda só os campos que manda; o e-mail e a data de nascimento mantêm o valor quando ficam de fora.
- [ ] Um e-mail ou uma data de nascimento mandados como `null` continuam sendo apagados.
- [ ] O formulário da ficha, que manda todos os campos, continua salvando como antes.

## Ambiente

- ClinicBook 1.1
- O script de atualização de planos da TI
