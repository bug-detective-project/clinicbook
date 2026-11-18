# Solução: O menu do paciente fecha ao clicar fora e com Esc

**O que faltava.** O `PatientMenu` (`client/src/components/PatientMenu.tsx`) tinha o estado `open` e um botão que o alterna, e nada que reagisse ao que acontece fora do menu: nem clique fora, nem Esc, nem a volta do foco.

## Passo a passo

1. **Marque os dois elementos.** Um ref para o contêiner (botão e menu juntos) e um para o botão:

   ```tsx
   const containerRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   ```

   Passe-os como `ref={containerRef}` na `div` de fora e `ref={buttonRef}` no botão.
2. **Escute no documento só enquanto o menu está aberto.**

   ```tsx
   useEffect(() => {
     if (!open) {
       return;
     }
     function onPointerDown(event: PointerEvent) {
       if (!containerRef.current?.contains(event.target as Node)) {
         setOpen(false);
       }
     }
     function onKeyDown(event: KeyboardEvent) {
       if (event.key === 'Escape') {
         setOpen(false);
         buttonRef.current?.focus();
       }
     }
     document.addEventListener('pointerdown', onPointerDown);
     document.addEventListener('keydown', onKeyDown);
     return () => {
       document.removeEventListener('pointerdown', onPointerDown);
       document.removeEventListener('keydown', onKeyDown);
     };
   }, [open]);
   ```

3. **Confira os casos do ticket.** Um clique no título fecha o menu; um clique no espaçamento do menu não fecha; abrir outro menu fecha este, porque aquele clique é fora dele; Esc fecha e o botão "⋯" fica com o foco.

A referência também adiciona um teste de regressão, `client/src/components/PatientMenu.close.test.tsx`, com esses casos.

Depois rode `npm test`, teste o menu com o mouse e só com o teclado e mova o card para **Em QA**.
