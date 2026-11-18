# Solução: A agenda só se atualiza enquanto está na tela

**Causa.** O efeito do `AgendaPage` (`client/src/pages/AgendaPage.tsx`) cria um `setInterval` toda vez que roda, e a limpeza dele nunca o cancela. O efeito roda quando a agenda abre e a cada mudança de `day`, então cada troca de dia e cada visita acrescenta um temporizador que vive até a aba ser recarregada. Os temporizadores antigos continuam pedindo os dias antigos; as respostas são ignoradas (`current` é falso), e por isso a tela parece certa.

## Passo a passo

1. **Conte os temporizadores.** Na aba Network, o número de requisições de cada rodada de 15 segundos cresce em um a cada troca de dia, e as rodadas continuam depois que você sai da agenda.
2. **Guarde o id do intervalo e cancele-o na limpeza.**

   ```tsx
   void load();
   const timer = window.setInterval(load, REFRESH_MS);
   return () => {
     current = false;
     window.clearInterval(timer);
   };
   ```

   O React chama a função devolvida antes de rodar o efeito de novo (o dia mudou) e quando o componente é removido (o usuário foi para outra tela).
3. **Mantenha o `current = false`.** Ele continua protegendo a tela de uma resposta que já estava a caminho.

A referência também adiciona um teste de regressão, `client/src/pages/AgendaPage.refresh.test.tsx`: com temporizadores falsos, a agenda se atualiza enquanto está aberta, para depois que o usuário sai e mantém uma atualização só depois que o dia muda.

Depois rode `npm test`, repita a contagem na aba Network e mova o card para **Em QA**.
