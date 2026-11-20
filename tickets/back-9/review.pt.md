# Code review: CB-209, sobreposições achadas em qualquer ordem

A conferência estava certa para listas ordenadas, e a API nunca prometeu uma. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- Comparar vizinhos é o jeito clássico de achar sobreposições, e só funciona numa lista ordenada.
- A tela manda os períodos de cada dia em ordem, então todo teste pelo formulário passava. A API recebe requisições de outros lugares também.
- O laço também comparava períodos de dias diferentes que por acaso eram vizinhos, o que só deixava mais difícil ver o que ele conferia.

## Por que o conserto da referência está certo

- Ordenar por dia e início, depois comparar vizinhos: numa lista ordenada, dois períodos de um dia se sobrepõem exatamente quando um começa antes de o anterior terminar.
- Ele ordena uma cópia, então a conferência não muda os dados que confere.
- A mensagem e o 400 continuam iguais, então o formulário não precisa de mudança.

## Compare com o seu conserto

- Você comparou todos os pares (dois laços)? Está certo e serve bem para uma semana de períodos. Ordenar diz a ideia de forma mais direta e escala.
- Você ordenou `hours` no lugar? Funciona aqui, e muda a lista que quem chamou tem na mão. Prefira ordenar uma cópia numa função que só confere.
- Você ordenou só pelo início, sem o dia? Períodos de dias diferentes se misturam, e a conferência de dia de cada comparação pula sobreposições de verdade.
- Você consertou a exportação em vez disso? O próximo cliente traria o mesmo problema. A API não pode depender da ordem do que recebe.

## Para a próxima vez

- Um algoritmo que compara vizinhos supõe uma ordem. Deixe a ordem explícita onde a conferência roda.
- Teste regras com a entrada na ordem em que usuários e outros sistemas a mandam, não só na ordem da tela.
