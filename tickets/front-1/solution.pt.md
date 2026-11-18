# Solução: Um clique ou vários, uma consulta

**Causa.** O `submit` em `client/src/pages/BookingPage.tsx` envia `POST /api/appointments` toda vez que roda, e nada avisa a ele que já existe uma requisição a caminho. Um clique duplo, ou Enter apertado duas vezes, roda a função duas vezes antes de a primeira resposta chegar, e o servidor grava as duas.

## Passo a passo

1. **Veja as duas requisições.** Com a aba Network aberta e uma conexão lenta, um clique duplo em **Book** mostra dois `POST /api/appointments`.
2. **Guarde que uma marcação está sendo enviada.** Crie um estado e saia cedo do `submit` enquanto ele estiver ligado:

   ```tsx
   const [saving, setSaving] = useState(false);

   async function submit(event: FormEvent) {
     event.preventDefault();
     if (saving) {
       return;
     }
     // ...a conferência dos campos continua aqui...
     setSaving(true);
     setError('');
     try {
       // ...a requisição e a navegação...
     } catch (failure) {
       setError(failure instanceof ApiError ? failure.message : 'The appointment could not be saved.');
       setSaving(false);
     }
   }
   ```

3. **Mostre isso no botão.**

   ```tsx
   <button type="submit" className={ui.primary} disabled={saving}>
   ```

4. **Deixe o estado ligado depois de um sucesso.** A página navega para a agenda; só uma falha religa o botão.

A referência também adiciona um teste de regressão, `client/src/pages/BookingPage.submit.test.tsx`: um clique duplo envia uma requisição, o botão fica desligado enquanto o servidor não responde, e uma marcação recusada pode ser enviada de novo.

Depois rode `npm test`, teste o clique duplo com uma conexão lenta e mova o card para **Em QA**.
