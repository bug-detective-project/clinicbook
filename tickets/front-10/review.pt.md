# Code review: CB-110, a semana de um domingo

O `getDay()` começa a semana no domingo; a clínica começa na segunda. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- O JavaScript numera os dias da semana do domingo (0) ao sábado (6). A maior parte do mundo, e a clínica, tem semanas de segunda a domingo.
- "O dia menos o dia da semana, mais um" está certo de segunda a sábado e errado só no domingo, um dia em sete. Um teste numa quarta passa.
- O projeto já tinha o `weekdayOf`, que transforma a numeração do JavaScript na da clínica. O `mondayOf` fazia a conta de novo à mão.

## Por que o conserto da referência está certo

- O `mondayOf` usa o `weekdayOf`: um lugar converte a numeração, e toda função do calendário concorda com ele.
- A semana, a grade do mês e a semana do médico usam o `mondayOf`, então um conserto chega aos três.

## Compare com o seu conserto

- Você escreveu `(date.getUTCDay() + 6) % 7`? É a mesma conversão do `weekdayOf`, escrita uma segunda vez.
- Você acrescentou `if (day === 0) day = 7`? Certo, e ainda uma cópia da regra.
- Você mudou as telas para pedirem o dia anterior quando é domingo? O bug continuaria para todo outro chamador do `mondayOf`.

## Para a próxima vez

- Toda função sobre semanas tem um caso de domingo. Teste-o de propósito, e no primeiro e no último dia de um mês.
- Quando um projeto já converte uma convenção (a numeração dos dias, dinheiro em centavos, fusos horários), use essa conversão em vez de fazer a conta de novo.
