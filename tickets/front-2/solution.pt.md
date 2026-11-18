# Solução: O total que acompanha a lista

**Causa.** O `AgendaPage` (`client/src/pages/AgendaPage.tsx`) guarda o total do dia em um estado próprio, `total`, gravado só quando a lista é carregada. O `change`, que roda depois de **Cancel** e **Confirm**, atualiza a consulta dentro de `appointments` e nunca mexe no `total`. O número fica antigo até a agenda se atualizar sozinha, no máximo 15 segundos depois.

## Passo a passo

1. **Ache as duas fontes.** A linha lê `appointments`; o texto acima da lista lê `total`. Só o `load` chama `setTotal`.
2. **Tire a cópia.** Apague o estado `total` e a chamada de `setTotal` no `load`:

   ```tsx
   .then((list) => {
     if (current) {
       setAppointments(list);
     }
   })
   ```

3. **Calcule o número na renderização**, logo antes do `return`:

   ```tsx
   // A cancelled appointment stays on the list, and does not count.
   const total = (appointments ?? []).filter((appointment) => appointment.status !== 'cancelled').length;
   ```

   O JSX continua usando `total`, agora um valor comum.

A referência também adiciona um teste de regressão, `client/src/pages/AgendaPage.total.test.tsx`: o total diminui a cada cancelamento e fica igual depois de uma confirmação.

Depois rode `npm test`, cancele uma consulta no navegador olhando o número e mova o card para **Em QA**.
