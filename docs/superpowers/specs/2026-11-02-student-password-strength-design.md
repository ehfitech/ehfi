# Validador de senha do cadastro de aluno

## Intenção

Deixar os critérios de senha claros enquanto a pessoa preenche o cadastro demonstrativo de aluno, permitir conferir o que digitou e manter o padrão visual EHFI.

## Escopo

- Alterar somente o campo Senha, o campo Confirme sua senha e a validação da etapa Conta.
- Preservar o ícone de escudo à esquerda de cada campo.
- Adicionar controle de revelar/ocultar independente nos dois campos, com ícone de olho.
- Mostrar um medidor segmentado, contador `0/5` e lista dos critérios abaixo do campo Senha.
- Exigir todos os critérios para avançar, mantendo a confirmação exata da senha.
- Não alterar etapas, rotas, persistência, autenticação ou outros campos.

## Critérios de senha

Os cinco critérios, conforme a referência enviada, são:

1. Pelo menos oito caracteres.
2. Pelo menos um número.
3. Pelo menos uma letra minúscula.
4. Pelo menos uma letra maiúscula.
5. Pelo menos um caractere especial.

O medidor atualiza enquanto a pessoa digita. Caracteres especiais são pontuação ou símbolos; espaços não contam. Letras acentuadas continuam sendo letras. O contador é a quantidade de critérios satisfeitos, não uma estimativa de entropia.

## Apresentação e interação

- Manter a lista de critérios visível desde o primeiro render, começando em `0/5`; a altura não muda conforme os critérios passam a ser satisfeitos.
- Usar cinco segmentos compactos: preencher da esquerda para a direita conforme a quantidade de critérios atendidos; a lista continua exibindo o estado real de cada critério individualmente.
- Cada critério mostra ícone e texto; o estado também fica disponível para leitores de tela.
- Colocar o botão de revelar dentro da extremidade direita do campo, mantendo o ícone atual à esquerda.
- Os botões usam nomes acessíveis “Mostrar senha”/“Ocultar senha” e equivalentes para a confirmação, expõem o estado e mantêm foco visível e alvo mínimo de 44 × 44 px.
- Atualizar o tipo entre senha e texto sem limpar ou alterar o valor. Revelação dos dois campos é independente.
- Seguir tokens, ícones e espaçamento existentes, sem adicionar dependências ou expandir o layout de duas colunas.
- Manter a política fictícia de senha: nenhuma credencial é enviada ou persistida.

## Fora de escopo

- Indicador estimado de entropia, regras extras, gerador de senhas, validação de confirmação em tempo real ou alterações no cadastro profissional.
- Mudanças nos textos gerais de privacidade, nas demais etapas ou no fluxo de demonstração.

## Restrições de verificação

- O projeto proíbe `git`, `typecheck`, `build`, `lint` e `test`; não criar nem executar testes.
- Verificar a alteração com formatação e inspeção estática/manual do campo, critérios, acessibilidade aparente e preservação do ícone.
