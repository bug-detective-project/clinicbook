# CB-203: Lembretes saem mesmo com a opção desligada

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Altíssima |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | Configuração do servidor |
| Rótulos | `configuração`, `lembretes` |
| Sprint | CB Sprint 2 |
| Criado em | 13/03/2026 08:15 |

## Descrição

Abrimos uma segunda unidade da clínica na semana passada. Ela não está pronta para enviar lembretes: os pacientes de lá ainda não concordaram em receber mensagens, e enviar mesmo assim é um problema jurídico para nós.

Por isso subi o servidor daquela unidade com `REMINDERS_ENABLED=false`, como diz o README. A tela Reminders continua mostrando o botão, a recepção clicou nele no primeiro dia, e doze pacientes receberam uma mensagem que nunca pediram.

Conferi três vezes que a variável está definida, e está. O servidor a lê e faz o contrário.

## Passos para reproduzir

No terminal do VS Code (pare o servidor antes, se ele estiver rodando):

```sh
REMINDERS_ENABLED=false npm run dev
```

Depois, em outro terminal:

```sh
curl http://localhost:3001/api/reminders
curl -X POST http://localhost:3001/api/reminders/run
```

Ou abra **Reminders** no navegador.

## Resultado esperado

Com `REMINDERS_ENABLED=false`: o `GET /api/reminders` diz `"enabled": false`, o `POST /api/reminders/run` responde `{ "enabled": false, "sent": 0 }` e não envia nada, e a tela diz que os lembretes estão desligados, sem o botão.

Sem a variável, os lembretes continuam ligados, como hoje.

## Resultado atual

`"enabled": true`, e a rodada envia os lembretes de amanhã.

## Critérios de aceite

- [ ] `REMINDERS_ENABLED=false` desliga os lembretes: nada é enviado, não importa quantas vezes a rodada seja pedida.
- [ ] `false` funciona com maiúsculas e minúsculas (`FALSE`, `False`), e `0` também desliga.
- [ ] Sem a variável, com `true` ou com `1`, os lembretes ficam ligados.
- [ ] A tela Reminders diz que eles estão desligados e não oferece nada para enviar.

## Ambiente

- ClinicBook 1.0, o servidor da segunda unidade
- A QA roda o app com `REMINDERS_ENABLED=false`

## Atividade

**Otávio Brandt** · 13/03/2026 08:40
> Para constar, também tentei `REMINDERS_ENABLED=0` e `REMINDERS_ENABLED=no`. Continuaram ligados. A única coisa que desligou foi `REMINDERS_ENABLED=` sem nada depois do sinal de igual, que achei por acaso e em que não confio.
