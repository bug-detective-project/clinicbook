# Code review: CB-107, a ficha do paciente e as abas dela

Abas parecem um estado, e o ticket pediu algo mais forte: cada aba é um lugar com endereço. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Uma rota com parâmetro (`:id`) e uma página que carrega o que o parâmetro nomeia.
- Rotas dentro de uma rota: uma página que fica, e uma parte dela que muda com o resto do endereço.
- Links que sabem se apontam para o endereço atual.

## Por que a referência é construída assim

- O app declara uma rota, `patients/:id/*`. O `*` entrega o resto do endereço ao `PatientRecord`, que decide entre as abas com um `<Routes>` aninhado. A página é o mesmo componente nos dois endereços, então trocar de aba não carrega o paciente de novo.
- As abas são `NavLink`s. Cada uma é um link de verdade (dá para abrir em outra aba do navegador, copiar, mandar a uma colega), e o React Router põe `aria-current="page"` na atual. O `end` em **Details** impede que ela case também com `/patients/1/appointments`.
- O paciente é carregado uma vez, pela página, e entregue às abas como prop. Uma terceira aba é mais um `NavLink` e mais um `<Route>`.
- Os três resultados do carregamento são explícitos: carregando, achou, não achou. As abas não são renderizadas enquanto não há paciente para mostrar.

## Compare com o que você construiu

- Você guardou a aba atual em `useState`? Ela troca, e o endereço continua o mesmo: não há link para uma aba, Voltar sai da ficha, e recarregar volta para a primeira aba. O ticket pediu um endereço por aba.
- Você declarou duas rotas separadas no `App.tsx`, as duas renderizando o `PatientRecord` com uma prop que diz qual aba? Funciona e o endereço fica certo. Cada aba nova vira então uma terceira cópia da rota e da prop, e a página precisa ouvir de fora o que o próprio endereço dela já diz.
- Você usou uma rota pai com `<Outlet />` e rotas filhas? É o outro jeito padrão, tão bom quanto o `<Routes>` aninhado; o paciente então viaja pelo contexto do outlet.
- Você usou botões com `navigate()` para as abas? O endereço muda, e as abas deixam de ser links: não há "abrir em nova aba", e o `aria-current` passa a ser manutenção sua.
- Você esqueceu o `end`? As duas abas ficam marcadas como atuais no endereço de Appointments.

## Fique de olho da próxima vez

- Se um usuário pode querer um link para aquilo, voltar para aquilo ou recarregar ali, aquilo pertence ao endereço.
- Carregue os dados no nível que fica na tela e passe-os para as partes que mudam.
