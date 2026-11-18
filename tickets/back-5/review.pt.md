# Code review: CB-205, os horários livres de um médico

Um endpoint como este é um algoritmo pequeno com uma rota em volta, e cada metade fica mais fácil quando a outra não está no caminho. Aqui está a abordagem de referência, para você comparar com a sua.

## Do que este ticket tratava

- Listar as respostas de um endpoint antes de escrevê-lo: o sucesso, os dois casos vazios, o 404 e o 400.
- Gerar uma sequência (os horários de um período) e tirar um conjunto dela (os horários marcados).
- Concordar com uma regra que já existe: o que este endpoint oferece, a marcação tem que aceitar.

## Por que a referência é construída assim

- A conta é uma função pura, `freeSlots(periods, booked)`, em um arquivo próprio. Ela não precisa de banco nem de requisição, então pode ser lida, testada e reaproveitada sozinha.
- Ela trabalha em minutos. `"08:30"` como 510 transforma "o próximo horário" em uma soma e "cabe?" em uma comparação; os textos só voltam no fim.
- O laço termina em `start + SLOT_MINUTES <= until`, a mesma condição do `isWorkingTime`. O último horário de uma manhã que termina às 12:00 é 11:30, dos dois lados.
- Os horários marcados vão para um `Set`, então conferir cada horário não percorre a lista de novo.
- A rota só decide em qual caso está, em uma ordem que põe as recusas mais baratas primeiro, e delega o resto. As consultas dela já estavam no repositório.
- O `bookedTimes` deixa as consultas canceladas de fora, então um horário cancelado volta a ser oferecido sem nenhuma linha de código aqui.

## Compare com o que você construiu

- Você escreveu os 14 horários de um dia como uma lista fixa? Bate com os médicos de exemplo e quebra no dia em que alguém mudar uma linha de `working_hours`.
- Você fez o laço com `start < until`? Um período que termina às 12:15 ofereceria então 12:00, uma consulta que termina depois que o médico saiu.
- Você comparou textos, `"9:00" < "10:00"`? A comparação de texto só funciona enquanto toda hora tem dois dígitos; minutos não têm essa armadilha.
- Você filtrou as consultas em JavaScript depois de carregar todas? Está correto, e o banco foi consultado por muito mais do que a pergunta pedia.
- Você respondeu 404 para um dia em que o médico não atende? O médico existe e a pergunta é válida; a resposta é "nenhum", que é uma lista vazia.
- Você pôs o laço dentro da rota? Funciona; a próxima pessoa que precisar dos horários livres (um relatório, os lembretes) vai ter que copiá-lo de lá.

## Fique de olho da próxima vez

- Quando dois trechos de código precisam concordar (o que é oferecido e o que é aceito), faça-os compartilhar a regra, ou pelo menos a condição, e teste um contra o outro.
- Converta para a representação que deixa a aritmética trivial, faça a conta e converta de volta na borda.
