# CB-106: Construir o seletor de horário do formulário de marcação

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Formulário de marcação |
| Rótulos | `marcação`, `componente` |
| Sprint | CB Sprint 2 |
| Criado em | 11/03/2026 13:10 |

## Descrição

Para marcar ou remarcar uma consulta, digitamos o horário em um campo de texto, "HH:MM". Precisamos saber de cabeça quando cada médico atende e olhar a agenda para ver o que está ocupado. A gente erra: o servidor recusa um horário fora do expediente, e nada nos impede de digitar um horário que outro paciente já tem.

O servidor já sabe os horários livres de cada médico em cada dia. Queremos que o formulário os mostre como opções e nos deixe escolher uma. O campo de texto sempre foi provisório.

## O que já existe

- `listSlots(doctorId, day)` em `client/src/api/doctors.ts` chama `GET /api/doctors/:id/slots?day=` e devolve os horários livres como textos, em ordem: `['08:00', '08:30', '10:00']`. Um dia em que o médico não atende devolve uma lista vazia.
- `client/src/pages/BookingPage.tsx` é o formulário de marcar e de remarcar. Ele guarda o horário escolhido no estado `time` (`''` enquanto nenhum foi escolhido), que pode vir preenchido pelo endereço (`&time=10:30`), e envia `time` ao servidor. O campo de texto provisório está marcado ali.
- Os estilos de formulário estão em `client/src/components/ui.module.css`; um componente tem o próprio `*.module.css` ao lado (veja o `PatientMenu`).

## O que construir

**O componente.** `TimeSlotPicker` em `client/src/components/TimeSlotPicker.tsx`, exportado pelo nome, com as props:

| Prop | Tipo | Significado |
| --- | --- | --- |
| `slots` | `string[]` | Os horários livres, como `HH:MM`, na ordem em que aparecem |
| `value` | `string` | O horário escolhido, ou `''` enquanto nenhum foi escolhido |
| `onChange` | `(time: string) => void` | Chamada com o horário que o usuário escolhe |

- Ele mostra uma opção por horário: um botão de rádio (`<input type="radio">`) cujo `value` é o horário e cujo rótulo é o horário. Todos pertencem a um grupo só para o teclado: as setas passam de um para o seguinte.
- As opções ficam dentro de um elemento com `role="radiogroup"` e o nome acessível `Time`.
- A opção igual a `value` é a marcada; com `value` igual a `''`, nenhuma é.
- O componente não guarda o horário escolhido: ele chama `onChange` e mostra o que recebe em `value`.
- Com `slots` vazio, ele mostra o texto `No free times on this day.` e nenhum grupo.

**No formulário.** O `BookingPage` mostra o seletor no lugar do campo de texto, para marcar e para remarcar:

- ele pede os horários livres sempre que o médico ou o dia muda, e mostra o seletor com eles;
- um horário que veio pelo endereço, ou que foi escolhido antes de o médico ou o dia mudar, continua escolhido só se estiver entre os novos horários livres;
- enquanto não há médico ou dia escolhido, não há o que escolher: um texto curto no lugar do seletor basta, e outro enquanto os horários carregam.

## Critérios de aceite

- [ ] O formulário oferece uma opção por horário livre do médico escolhido no dia escolhido, em ordem, em um grupo chamado `Time`.
- [ ] Um horário já ocupado não é oferecido.
- [ ] Escolher uma opção marca só aquela, e **Book** marca aquele horário.
- [ ] Um horário no endereço (`&time=10:30`) chega escolhido.
- [ ] As opções funcionam com o teclado (Espaço escolhe, as setas andam).
- [ ] Um dia em que o médico não atende mostra `No free times on this day.`
- [ ] Trocar o médico ou o dia troca as opções.
- [ ] O formulário de remarcar usa o mesmo seletor.

## Ambiente

- ClinicBook 1.0, Chrome

## Atividade

**Renata Siqueira** · 11/03/2026 13:36
> Botões lado a lado seria perfeito, como os dos dias na agenda. A aparência fica com vocês; para nós importa só poder escolher o que está livre.
