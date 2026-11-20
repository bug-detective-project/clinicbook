# CB-208: Salvar os horários de um médico perde todos quando a gravação falha

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Altíssima |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Back-end |
| Versão afetada | 1.1 |
| Componente | API (médicos) |
| Rótulos | `médicos`, `horários`, `banco-de-dados` |
| Sprint | CB Sprint 3 |
| Criado em | 17/03/2026 08:40 |

## Descrição

O Otávio tentou dar à Dra. Tanabe uma quinta-feira mais cedo, a partir das 05:00, pela API (a tela só oferece de 06:00 a 22:00). O servidor disse não, o que está certo: a clínica abre às 06:00. Mas depois disso a Dra. Tanabe ficou sem nenhum horário. O formulário de marcação não mostrava horário livre para ela em dia nenhum, e a página dela dizia "Off" a semana inteira.

Uma mudança recusada não deveria mudar nada. Aqui ela levou tudo o que ela tinha.

## Passos para reproduzir

No terminal do VS Code, com o app rodando:

```sh
curl http://localhost:3001/api/doctors/3
curl -i -X PATCH http://localhost:3001/api/doctors/3 -H 'content-type: application/json' \
  -d '{"name":"Dr. Yuki Tanabe","specialty":"Dermatology","hours":[{"weekday":4,"startsAt":"05:00","endsAt":"09:00"}]}'
curl http://localhost:3001/api/doctors/3
```

## Resultado esperado

A mudança é recusada (`400`), e a médica mantém o nome, a especialidade e todos os períodos que tinha.

## Resultado atual

`400`, e a médica fica sem nenhum horário.

## Critérios de aceite

- [ ] Uma mudança de um médico que o banco recusa deixa o médico exatamente como estava: nome, especialidade e horários.
- [ ] Depois de uma mudança recusada, o médico continua com os horários livres que tinha.
- [ ] Uma mudança aceita continua salvando o nome, a especialidade e os horários novos.

## Ambiente

- ClinicBook 1.1
- A tabela `working_hours` recusa períodos antes das 06:00 ou depois das 22:00

## Atividade

**Otávio Brandt** · 17/03/2026 09:02
> O nome que mandei em outra tentativa foi salvo também, mesmo com o 400. Então parte da mudança passa e parte não.
