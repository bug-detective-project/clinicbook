# CB-107: Construir a rota da ficha do paciente, com abas

| Campo | Valor |
| --- | --- |
| Projeto | ClinicBook (CB) |
| Tipo de item | História |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Dra. Helena Prado (Diretora clínica) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Pacientes (ficha) |
| Rótulos | `pacientes`, `rotas`, `abas` |
| Sprint | CB Sprint 2 |
| Criado em | 12/03/2026 08:30 |

## Descrição

Todo nome na agenda e todo **Open record** na lista de pacientes leva a "Page not found". A ficha do paciente foi planejada desde o começo, as duas partes dela estão escritas, e a página que as reúne nunca foi feita.

Quero abrir um paciente e ver os dados dele, e passar para as consultas dele, passadas e futuras. E quero mandar a uma colega o link exato do que estou vendo: "olha as consultas deste paciente" tem que ser um endereço, e não uma lista de instruções.

## O que já existe

- O `PatientDetails` (`client/src/components/PatientDetails.tsx`) mostra o telefone, o e-mail e a data de nascimento de um paciente. O `PatientAppointments` (`client/src/components/PatientAppointments.tsx`) carrega e lista as consultas de um paciente. Os dois recebem uma prop, `patient`.
- `getPatient(id)` em `client/src/api/patients.ts` devolve um paciente, e falha com um `ApiError` de `status` 404 quando o paciente não existe.
- As rotas do app estão em `client/src/App.tsx`. Os links para `/patients/<id>` já existem na agenda e no menu de cada paciente, e em nenhum outro lugar.
- `client/src/components/Layout.tsx` mostra como a navegação principal marca a página atual: o `NavLink` do React Router põe `aria-current="page"` no link do endereço atual.

## O que construir

Uma página para a ficha de um paciente, `PatientRecord` em `client/src/pages/PatientRecord.tsx`, e as rotas dela:

| Endereço | Mostra |
| --- | --- |
| `/patients/:id` | A ficha na aba **Details** (`PatientDetails`) |
| `/patients/:id/appointments` | A ficha na aba **Appointments** (`PatientAppointments`) |

- A página carrega o paciente do endereço e mostra o nome como título da página (um título de nível 2, como nas outras telas).
- Abaixo do título, uma navegação com o nome acessível `Patient record` tem dois links, **Details** e **Appointments**, cada um para o seu endereço. O link da aba que está na tela tem `aria-current="page"`; o outro não tem.
- Trocar de aba troca o endereço e mantém o título; o paciente não é carregado de novo por isso. Voltar e Avançar do navegador andam entre as abas, e recarregar a página fica na mesma aba.
- Outro id no endereço mostra outro paciente.
- Para um paciente que não existe, em qualquer dos dois endereços, a página mostra o título `Patient not found` e um link `Back to the patients` para `/patients`, sem abas.
- Enquanto o paciente carrega, um texto curto basta.

## Critérios de aceite

- [ ] `/patients/:id` mostra o nome do paciente e a aba Details.
- [ ] `/patients/:id/appointments` abre direto nas consultas do paciente, também depois de recarregar.
- [ ] As duas abas são links dentro de uma navegação chamada `Patient record`, e só a atual tem `aria-current="page"`.
- [ ] Voltar e Avançar do navegador andam entre as abas.
- [ ] Um paciente que não existe mostra `Patient not found` e o caminho de volta.
- [ ] **Open record** na lista de pacientes e os nomes na agenda abrem a ficha.
- [ ] Os outros endereços do app funcionam como antes, inclusive "Page not found" para um endereço desconhecido.

## Ambiente

- ClinicBook 1.0, Chrome

## Atividade

**Dra. Helena Prado** · 12/03/2026 08:52
> Duas abas por enquanto. Vamos pedir uma terceira (exames) mais adiante, então, por favor, deixem fácil de acrescentar.
