# CB-109: Cancelar a edição de um paciente muda a ficha

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Renata Siqueira (Líder da recepção) |
| Trilha | Front-end |
| Versão afetada | 1.1 |
| Componente | Ficha do paciente |
| Rótulos | `pacientes`, `ficha`, `formulário` |
| Sprint | CB Sprint 3 |
| Criado em | 17/03/2026 11:30 |

## Descrição

Abri a ficha da Elisa Gomes, cliquei em **Edit** para conferir uma coisa e fechei o formulário com **Cancel** sem mudar nada. A ficha dela agora não diz nada na linha do e-mail, onde um segundo antes dizia "No e-mail". Num paciente sem data de nascimento, a linha do nascimento diz "Invalid Date".

Nada foi salvo (quando recarrego a página a ficha volta ao normal), mas a tela mostra o paciente diferente depois de um cancelamento, e as recepcionistas acham que os dados se perderam.

## Passos para reproduzir

1. Abra **Patients** e a ficha da Elisa Gomes (ela não tem e-mail).
2. Clique em **Edit**, depois em **Cancel**.
3. Olhe a linha do e-mail da ficha.

## Resultado esperado

Depois do **Cancel**, a ficha mostra o paciente exatamente como antes: "No e-mail", "Not informed", o mesmo telefone, plano e CPF.

## Resultado atual

A linha do e-mail fica vazia. Um paciente sem data de nascimento mostra "Invalid Date" na linha do nascimento.

## Critérios de aceite

- [ ] Cancelar a edição de um paciente deixa a ficha exatamente como estava, não importa o que foi digitado no formulário.
- [ ] Um paciente sem e-mail ou sem data de nascimento continua dizendo isso depois de uma edição cancelada.
- [ ] Abrir o formulário de novo mostra os dados do paciente, e salvar continua funcionando.

## Ambiente

- ClinicBook 1.1
