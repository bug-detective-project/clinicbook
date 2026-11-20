# CB-105: Fazer o menu do paciente fechar ao clicar fora e com Esc

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Média |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Pacientes (menu de um paciente) |
| Rótulos | `pacientes`, `menu`, `teclado` |
| Sprint | CB Sprint 2 |
| Criado em | 11/03/2026 09:20 |

## Descrição

Cada paciente da lista tem um botão "⋯" que abre um menu pequeno: **Open record**, **Book appointment**, **Remove patient**. O menu abre, e é só isso que ele faz: o único jeito de fechá-lo é clicar de novo no mesmo botão.

Então clicamos em outro lugar, o menu fica, abrimos o menu de outro paciente, e agora há dois menus abertos, um em cima dos nomes. A Marlene, que trabalha só com o teclado, aperta Esc por hábito e nada acontece.

O menu foi entregue pela metade. Por favor, terminem o fechamento.

## O que já existe

- `client/src/components/PatientMenu.tsx` renderiza o botão e, enquanto o estado `open` é verdadeiro, o menu. O botão já tem `aria-haspopup`, `aria-expanded` e o rótulo `Actions for <nome do paciente>`; o menu tem `role="menu"` e o mesmo rótulo.
- O botão abre e fecha o menu, os dois links navegam, e **Remove patient** fecha o menu e pede à página que remova o paciente.
- Os estilos estão em `client/src/components/PatientMenu.module.css`. Nada neles precisa mudar.

## O que construir

- **Um clique fora fecha o menu.** Qualquer clique ou toque na página que não seja no botão nem dentro do menu o fecha. Um clique dentro do menu, em um item ou no espaçamento dele, não fecha.
- **Abrir outro menu fecha este.** No máximo um menu fica aberto na página.
- **Esc fecha o menu** onde quer que o foco esteja, e o foco volta para o botão "⋯" daquele menu, para quem usa o teclado continuar de onde estava.
- **Um menu fechado não escuta nada.** A página reage a cliques e teclas só enquanto um menu está aberto; Esc com todos os menus fechados não muda nada na tela.
- O botão mantém o `aria-expanded` de acordo com o menu em todos os casos acima.

## Critérios de aceite

- [ ] Um clique em qualquer outro lugar da página fecha o menu aberto.
- [ ] Um clique dentro do menu não o fecha, e os itens continuam funcionando.
- [ ] Abrir o menu de outro paciente deixa um menu aberto.
- [ ] Esc fecha o menu e o foco volta para o botão dele.
- [ ] O `aria-expanded` do botão é `false` sempre que o menu está fechado.

## Ambiente

- ClinicBook 1.0, Chrome
- Mouse e teclado

## Atividade

**Renata Siqueira** · 11/03/2026 09:41
> Sem animação, por favor. Ele só precisa se comportar como todos os outros menus que a gente conhece.
