# Code review: CB-212, um médico com consultas fica

O banco disse não, por um bom motivo, e o código o fez dizer sim. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- Apagar um médico falhava com um erro de chave estrangeira. O jeito rápido de fazer um erro sumir é apagar antes o que aponta para o médico.
- Esse erro era a regra da clínica, garantida pelo banco: consultas não podem apontar para ninguém. Apagá-las não é conserto, é perder dados.
- A tela pede confirmação e confia que o servidor recuse o que não pode ser feito. Ela estava certa em confiar.

## Por que o conserto da referência está certo

- A função apaga os horários (que pertencem só ao médico) e o médico, numa transação. As consultas não são dela para apagar.
- A recusa vem do banco e chega ao usuário pelo tratador de erros, o mesmo 409 e a mesma mensagem de um paciente com consultas: uma regra, uma resposta.
- A transação importa: os horários são apagados antes, e o rollback os traz de volta quando o médico fica.

## Compare com o seu conserto

- Você contou as consultas do médico na rota e respondeu 409 você mesmo? Funciona, e repete uma regra que o banco já guarda; entre a contagem e a remoção, uma consulta nova pode ser marcada. Se você mantiver a conferência por uma mensagem mais clara, mantenha a regra do banco também.
- Você continuou apagando as consultas, mas só as passadas? As consultas passadas são o histórico dos pacientes.
- Você escondeu o botão para médicos com consultas? A tela não sabe, e é a API que tem de recusar.
- Você tirou a transação? Os horários se perderiam quando o médico fica.

## Para a próxima vez

- Quando o banco recusa algo, leia por que antes de contornar. Uma restrição muitas vezes é a regra que pediram para você manter.
- "Apagar antes o que aponta para ele" é o movimento certo para dados que pertencem só à linha (os horários dela), nunca para dados com vida própria (consultas, pedidos, pagamentos).
