# Code review: CB-103, um dia não é um instante

"2026-03-10" dá nome a um quadrado do calendário. Um `Date` em JavaScript dá nome a um instante de um relógio. A maioria dos bugs de data mora na viagem entre os dois. Aqui está a abordagem de referência, para você comparar com a sua.

## Por que o bug aconteceu

- O `toDate` em `client/src/dates.ts` fazia `new Date(day)`. O JavaScript lê um texto que só tem data como meia-noite **em UTC**.
- O `toLocaleDateString` então escrevia aquele instante no fuso do computador. Em São Paulo, meia-noite UTC são 21:00 do dia anterior.
- Lisboa está em UTC em março, então lá a tela estava certa, e os testes também, porque rodam em UTC de propósito. O bug precisava de um computador a oeste de Greenwich.

## Por que a correção de referência está certa

- Ela monta a data pelas partes: `new Date(year, month - 1, date)` é meia-noite no calendário do computador, seja qual for o fuso.
- Montar e formatar agora usam o mesmo calendário, então o dia que entra é o dia que sai.
- O texto `YYYY-MM-DD` continua sendo a única coisa que viaja entre a tela, a API e o banco. O `Date` existe por um instante, só para emprestar os nomes do dia da semana e do mês.

## Compare com a sua correção

- Você usou `new Date(day + 'T00:00:00')`? Uma data com hora e sem fuso é lida como hora local, então funciona, por um motivo fácil de esquecer.
- Você manteve `new Date(day)` e acrescentou `timeZone: 'UTC'` na formatação? Também está correto: as duas pontas combinam em UTC.
- Você somou três horas, ou um dia? Isso conserta São Paulo e quebra todos os outros fusos, e a própria São Paulo se a diferença mudar um dia.
- Você mudou o servidor para enviar data e hora completas? O servidor estava certo; o bug estava em como a página lia um valor correto.

## Fique de olho da próxima vez

- Decida se um valor é um dia ou um instante, e mantenha dias como texto puro pelo máximo de tempo possível.
- Quando um bug aparece em um computador e não em outro, compare as configurações antes do código: fuso, idioma, relógio.
- Uma suíte de testes que roda em um fuso só prova o código para aquele fuso. A referência adiciona testes que rodam em São Paulo e em Tóquio.
