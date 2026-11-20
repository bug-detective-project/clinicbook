# Solução: Cada toast mantém o próprio tempo

**Causa raiz.** Em `client/src/ToastContext.tsx`, o efeito de cada `ToastItem` começa o cronômetro e depende de `dismiss`. O provider criava o `dismiss` de novo a cada renderização, e ele renderiza de novo sempre que um toast aparece ou sai. Cada `dismiss` novo rodava de novo o efeito de todos os toasts da tela: o cronômetro antigo era apagado e um novo, do tempo inteiro, começava.

## Passo a passo

1. **Reproduza** como no ticket: a primeira mensagem fica até uns 4 segundos depois da segunda.
2. **Leia as dependências** do efeito do `ToastItem`: `[toast.id, toast.tone, dismiss]`. O id e o tom nunca mudam num toast; o `dismiss` muda a cada renderização do provider.
3. **Mantenha o `dismiss` estável**, como o `show` logo abaixo:

   ```ts
   const dismiss = useCallback((id: number) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);
   ```

   Ele usa a forma com função do `setToasts`, então não precisa de nada da renderização, e `[]` é a lista certa de dependências.

A referência também acrescenta um teste de regressão, `client/src/toasts.timing.test.tsx`: um toast some 4 segundos depois de aparecer embora outro tenha vindo no meio-tempo, e dois toasts seguidos somem os dois alguns segundos depois.

Depois rode `npm test`, confirme duas consultas seguidas na agenda e mova o card para **In QA**.
