# CB-111: "Fora do horário" erra nas bordas de um período

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Dra. Helena Prado (Diretora clínica) |
| Trilha | Front-end |
| Versão afetada | 1.1 |
| Componente | Página do médico |
| Rótulos | `médicos`, `horários`, `semana` |
| Sprint | CB Sprint 3 |
| Criado em | 19/03/2026 13:20 |

## Descrição

Quando mudamos os horários de um médico, a página do médico aponta as consultas que agora estão fora do horário, para ligarmos para esses pacientes. Mudei o fim da minha segunda de 17:00 para 14:00. A consulta das 14:00 aparece normal, e a das 08:00, o meu primeiro horário do dia, diz "Outside the working hours".

Está exatamente ao contrário nas bordas: o primeiro horário de um período é uma consulta normal, e uma consulta na hora em que o período termina está fora dele, porque terminaria depois de o médico ir embora.

## Passos para reproduzir

1. Marque uma consulta com a Dra. Helena Prado na próxima segunda às 14:00 (ela já tem uma às 08:00).
2. Em **Doctors**, Dra. Helena Prado, **Edit**: mude a segunda para terminar às 14:00 e salve.
3. Na página dela, vá para **Next week** e olhe a segunda.

## Resultado esperado

A consulta das 08:00 é uma consulta normal. A consulta das 14:00 diz "Outside the working hours".

## Resultado atual

A consulta das 08:00 diz "Outside the working hours", e a das 14:00 não.

## Critérios de aceite

- [ ] Uma consulta na hora em que um período começa está dentro do horário.
- [ ] Uma consulta na hora em que um período termina está fora do horário.
- [ ] Consultas no meio de um período estão dentro, e no intervalo entre dois períodos, fora.

## Ambiente

- ClinicBook 1.1
