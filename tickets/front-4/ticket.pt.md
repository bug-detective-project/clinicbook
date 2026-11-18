# CB-104: A agenda continua atualizando depois que saio da tela

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Otávio Brandt (TI e operações) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Agenda |
| Rótulos | `agenda`, `atualização`, `desempenho` |
| Sprint | CB Sprint 2 |
| Criado em | 10/03/2026 14:30 |

## Descrição

A agenda pede as consultas ao servidor a cada 15 segundos, para que as duas mesas vejam as mudanças uma da outra. Isso está certo enquanto a agenda está na tela.

Eu estava olhando o log do servidor e achei outra coisa. Um computador da recepção que está aberto desde cedo envia dezenas de requisições da agenda a cada 15 segundos, também enquanto a recepcionista está em **Patients** ou em **Reminders**, e de dias que ninguém está olhando. À tarde esses computadores ficam lentos e com a ventoinha alta. Recarregar a página acalma tudo, por um tempo.

## Passos para reproduzir

1. Abra a agenda com a aba Network do DevTools aberta e filtre por `appointments`.
2. Espere: uma requisição a cada 15 segundos. Isso é o esperado.
3. Vá para **Patients** e espere: as requisições da agenda continuam chegando.
4. Volte para a agenda, clique em **Next day** algumas vezes e espere: a cada 15 segundos agora vem uma rajada de requisições, de vários dias.

## Resultado esperado

Enquanto a agenda está na tela, uma requisição a cada 15 segundos, do dia que está na tela. Em qualquer outra tela, nenhuma.

## Resultado atual

As requisições nunca param, e cada visita à agenda e cada troca de dia acrescenta mais uma a cada rodada.

## Critérios de aceite

- [ ] Com a agenda aberta, ela pede as consultas de novo a cada 15 segundos.
- [ ] Depois que vou para outra tela, nenhuma requisição da agenda é feita.
- [ ] Depois que troco o dia, cada rodada tem uma requisição, do dia que está na tela.
- [ ] Sair da agenda e voltar não acrescenta requisições.

## Ambiente

- ClinicBook 1.0, Chrome
- Visto no log do servidor e na aba Network

## Atividade

**Otávio Brandt** · 10/03/2026 15:02
> Por favor, mantenham a atualização em si. A recepção depende dela.
