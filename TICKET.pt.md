# CB-101: Clicar duas vezes em "Book" marca duas consultas

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Formulário de marcação |
| Rótulos | `marcação`, `formulário` |
| Sprint | CB Sprint 2 |
| Criado em | 09/03/2026 08:40 |

## Descrição

O mouse da segunda mesa dá clique duplo sozinho de vez em quando, e a internet da clínica é lenta de manhã. Juntando os dois, o mesmo paciente aparece duas vezes na agenda, no mesmo horário, com o mesmo médico.

Achei três pares desses na semana passada. Em todos tivemos que cancelar um à mão, e um paciente recebeu dois lembretes e ligou perguntando qual das consultas valia.

## Passos para reproduzir

1. Abra **Book appointment** e escolha paciente, médico, dia e horário.
2. Clique em **Book** duas vezes, rápido (ou dê um clique duplo).
3. Olhe a agenda daquele dia.

Com a conexão lenta fica mais fácil de ver: no DevTools do navegador, a aba Network consegue deixar a página mais lenta.

## Resultado esperado

Uma consulta, não importa quantas vezes eu clique.

## Resultado atual

Duas consultas do mesmo paciente, no mesmo horário. A aba Network mostra duas requisições de marcação.

## Critérios de aceite

- [ ] Um clique duplo em **Book** envia uma requisição e marca uma consulta.
- [ ] Enquanto a marcação está sendo enviada, mais cliques em **Book** não fazem nada.
- [ ] Quando o servidor recusa a marcação, o formulário mostra o motivo e eu consigo enviar de novo.

## Ambiente

- ClinicBook 1.0, Chrome
- Mais frequente na conexão lenta da manhã

## Atividade

**Renata Siqueira** · 09/03/2026 09:05
> Também apertamos Enter no formulário quando estamos com pressa. Dá o mesmo resultado do clique duplo.
