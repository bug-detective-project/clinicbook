# Code review: CB-111, as bordas de um período

Um intervalo tem duas bordas, e cada uma precisa ser decidida de propósito. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- "Dentro de um período" estava escrito como `início < hora <= fim`. A maioria das consultas fica no meio de um período, onde as duas bordas concordam, então o aviso parecia certo.
- Consultas nas bordas só aparecem quando os horários mudam depois da marcação, que é justamente quando o aviso importa.

## Por que o conserto da referência está certo

- `início <= hora < fim`, um intervalo semiaberto: o primeiro horário entra, o fim fica fora. É a regra que o servidor usa para aceitar uma marcação, então a tela e a API agora concordam sobre o que é "dentro do horário".
- A comparação continua nos textos `HH:MM`, segura porque eles têm largura fixa.

## Compare com o seu conserto

- Você converteu os horários para minutos? Certo, e mais código para a mesma comparação.
- Você conferiu que a consulta termina antes de o período terminar (`hora + 30 <= fim`)? Mesmo resultado com horários de 30 minutos, e mais fiel a "a consulta cabe". Precisa da duração do horário no cliente.
- Você consertou só o início? O caso das 14:00 é o que a clínica precisa ligar.

## Para a próxima vez

- Para cada intervalo, diga se cada borda está incluída, e teste as duas bordas e um passo além de cada uma.
- Intervalos semiabertos (`início <= x < fim`) são a escolha usual para tempo: dois intervalos que se encostam nunca se sobrepõem, e a duração é `fim - início`.
