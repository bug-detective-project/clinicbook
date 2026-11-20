# Code review: CB-108, cada toast mantém o próprio tempo

Um cronômetro que depende de uma função criada a cada renderização recomeça a cada renderização. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- O cronômetro de um toast mora num efeito, e um efeito roda de novo quando uma das dependências muda, depois de desfazer o que fez antes.
- O `dismiss` era uma função comum no corpo do provider: uma nova a cada renderização. Cada toast que aparecia ou saía fazia o provider renderizar, dava a cada toast um `dismiss` novo e recomeçava todos os cronômetros.
- Um toast por vez parecia certo, e foi assim que as telas foram testadas.

## Por que o conserto da referência está certo

- `useCallback` com `[]` dá ao `dismiss` uma identidade só durante a vida do provider. Pode, porque ele só chama `setToasts` com uma função e não lê mais nada da renderização.
- O efeito mantém a lista honesta de dependências. Nada fica escondido do linter.
- O `show` já era escrito assim, então as duas funções do provider agora concordam.

## Compare com o seu conserto

- Você tirou o `dismiss` das dependências do efeito? O linter reclama, e a próxima mudança que fizer o `dismiss` ler estado traz de volta um bug de closure velha.
- Você guardou os cronômetros num ref do provider, um por id? Funciona, e tira a vida de um toast do componente que o mostra.
- Você memorizou o `ToastItem` com `memo`? Ele continua recebendo um `dismiss` novo, então renderiza e o efeito roda de novo.

## Para a próxima vez

- Antes de pôr uma função nas dependências de um efeito, pergunte se ela é estável. Se é criada numa renderização, não é, a menos que `useCallback` ou `useMemo` a deixe.
- Cronômetros são os efeitos em que um recomeço passa despercebido com facilidade: teste com dois deles perto um do outro.
