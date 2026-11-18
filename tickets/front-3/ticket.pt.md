# CB-103: Consulta marcada para o dia 10 aparece no dia 9

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Altíssima |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Agenda, ficha do paciente |
| Rótulos | `datas`, `agenda` |
| Sprint | CB Sprint 2 |
| Criado em | 10/03/2026 08:10 |

## Descrição

Toda data nas nossas telas está um dia atrasada. Marco uma consulta para terça, dia 10; a agenda abre com o título "Monday, March 9", e a ficha do paciente diz que a consulta é no dia 9. A consulta em si está no lugar certo: ela está na lista do dia 10, embaixo do título errado.

Ontem uma paciente veio um dia antes porque eu li a data da tela para ela.

A parte estranha: o Otávio abriu a mesma agenda do escritório de Lisboa e a tela dele estava certa. Aqui em São Paulo, em todos os computadores da recepção, está errado.

## Passos para reproduzir

Em um computador no horário de São Paulo (UTC-3):

1. Abra a agenda e clique em **Next day** até o endereço terminar em `day=2026-03-10`.
2. Leia o título da página.
3. Abra a ficha de um paciente e olhe os dias das consultas e a data de nascimento.

Se o seu computador está em outro fuso: o DevTools do navegador consegue fingir que está em outro lugar (o painel **Sensors**, em "Location", tem "São Paulo").

## Resultado esperado

A agenda de `2026-03-10` tem o título "Tuesday, March 10", e toda tela mostra um dia como o dia que ele é, em São Paulo, em Lisboa ou em qualquer lugar.

## Resultado atual

Em São Paulo, toda data aparece como o dia anterior: o título da agenda, os dias na ficha do paciente, a data de nascimento.

## Critérios de aceite

- [ ] Em um computador em São Paulo, a agenda de um dia tem aquele dia no título.
- [ ] A ficha de um paciente mostra os dias das consultas e a data de nascimento como foram cadastrados.
- [ ] O primeiro dia de um mês continua no mês dele.
- [ ] As datas continuam certas em computadores adiantados em relação ao UTC.

## Ambiente

- ClinicBook 1.0, Chrome
- Computadores da recepção: São Paulo (UTC-3). Errado em todos
- Escritório de Lisboa (UTC+0): certo

## Atividade

**Otávio Brandt** · 10/03/2026 08:47
> Conferi o banco com o suporte: a consulta está gravada como `2026-03-10`. O servidor também envia `2026-03-10`. O que quer que aconteça, acontece depois disso.
