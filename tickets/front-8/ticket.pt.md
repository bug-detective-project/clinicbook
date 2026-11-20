# CB-108: Uma mensagem de sucesso fica na tela enquanto eu continuo trabalhando

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.1 |
| Componente | Toasts |
| Rótulos | `toasts`, `agenda`, `timers` |
| Sprint | CB Sprint 3 |
| Criado em | 16/03/2026 09:15 |

## Descrição

De manhã eu confirmo as consultas do dia uma atrás da outra. Cada confirmação mostra uma mensagem verde no pé da tela ("The appointment of … was confirmed."), e cada mensagem deveria sumir depois de alguns segundos.

Elas não somem. Enquanto eu continuo confirmando, a primeira mensagem nunca sai; elas se empilham e cobrem a agenda. Só quando eu paro um pouco é que somem todas. Uma mensagem vermelha (um erro) fica mais ainda: ela recomeça a contar toda vez que outra mensagem aparece ou sai.

## Passos para reproduzir

1. Abra a agenda de hoje.
2. Clique em **Confirm** numa consulta.
3. Uns três segundos depois, clique em **Confirm** em outra.
4. Olhe a primeira mensagem.

## Resultado esperado

Cada mensagem fica o seu tempo (4 segundos para um sucesso, 7 para um erro) a partir do momento em que aparece, não importa o que as outras mensagens façam no meio-tempo.

## Resultado atual

A primeira mensagem fica até uns 4 segundos depois de a segunda aparecer. Com um clique a cada poucos segundos, ela nunca some.

## Critérios de aceite

- [ ] Uma mensagem some o seu tempo depois de aparecer, mesmo quando outras mensagens aparecem ou saem no meio-tempo.
- [ ] Duas mensagens mostradas uma depois da outra somem as duas alguns segundos depois.
- [ ] **Dismiss** continua fechando uma mensagem na hora.

## Ambiente

- ClinicBook 1.1
- Qualquer navegador
