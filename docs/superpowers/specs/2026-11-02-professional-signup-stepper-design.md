# Stepper navegável do cadastro profissional

## Intenção

Substituir a barra percentual e o rótulo de etapa atual por um stepper que mostre as quatro etapas do cadastro profissional, indique o progresso de forma clara e permita abrir qualquer etapa diretamente.

## Objetivos

- Exibir todas as etapas ao mesmo tempo: **Seus dados**, **Formação**, **Registro CREF** e **Termos**.
- Permitir navegação direta para qualquer etapa ao clicar no stepper, inclusive etapas futuras.
- Preservar integralmente os dados preenchidos ao trocar de etapa.
- Animar o preenchimento dos círculos e das conexões com movimento suave e discreto.
- Impedir que a navegação livre contorne a validação: ao concluir, validar as etapas na ordem e direcionar à primeira etapa inválida.
- Manter responsividade, acessibilidade, suporte a movimento reduzido e a identidade visual existente do EHFI.

## Comportamento

### Estados visuais

Cada etapa tem um dos seguintes estados:

- **Atual:** círculo realçado e etapa identificada como corrente, mesmo quando ainda incompleta.
- **Válida:** círculo preenchido com marca de conclusão.
- **Incompleta:** círculo numerado, sem preenchimento de conclusão.

O estado atual tem prioridade visual sobre o estado válido. Para etapas fora da atual, a conclusão é calculada pela validação correspondente. A conexão entre etapas só fica preenchida depois que a pessoa clica em **Continuar** naquela etapa e a validação permite avançar; preencher os campos obrigatórios, por si só, não preenche a linha. Esses estados não dependem somente de cor: usar número, ícone, rótulo e semântica acessível.

Uma etapa CREF marcada como válida significa apenas que os campos exigidos para a resposta escolhida foram preenchidos. Isso não representa validação da habilitação profissional nem altera a restrição de oferta/atendimento até a validação do CREF.

### Navegação

- As quatro etapas são botões no stepper e qualquer uma pode ser aberta diretamente.
- Trocar de etapa preserva os formulários em memória e não executa validação apenas por navegar.
- Os controles atuais **Voltar**, **Continuar** e **Concluir cadastro** permanecem disponíveis e conservam sua validação por etapa.
- Como o stepper permite abrir etapas futuras, **Concluir cadastro** valida todas as etapas na ordem: dados pessoais, formação, CREF e termos. Ao encontrar erros, retorna para a primeira etapa inválida, apresenta seus erros e direciona o foco para o primeiro campo inválido. Só navega para a tela de sucesso se todas estiverem válidas.

### Aparência e movimento

- Desktop: stepper horizontal, quatro itens com rótulos e conectores alinhados.
- Celular: quatro itens continuam visíveis em uma única linha sem rolagem horizontal; os rótulos podem usar versões curtas visuais, preservando os nomes completos para leitores de tela.
- Círculos têm área de toque mínima de 44 × 44 px; o tratamento visual do círculo pode ser menor dentro dessa área.
- O avanço válido pelo botão **Continuar** preenche a conexão correspondente com animação `scaleX` a partir da esquerda. A validade do formulário pode alterar o estado do círculo, mas não preenche a linha. Não animar largura/layout.
- Usar a curva de movimento `ehfiEase` já existente e duração curta, de aproximadamente 220–280 ms. Desativar transições quando movimento reduzido estiver ativo.
- A animação não deve deslocar o layout nem alterar a rolagem da página.

## Arquitetura

- Criar `components/ehfi/professional-signup-stepper.tsx` para apresentar os passos, estados, conectores, botões e semântica acessível.
- Manter estado, validação, navegação e submissão em `components/ehfi/professional-signup.tsx`.
- Derivar validade com `validatePersonal`, `validateAcademic`, `validateCref` e `validateSignupTerms`, sem duplicar regras em um novo estado manual de conclusão.
- Reutilizar `ehfiEase`, `useReducedMotion`, React, Tailwind e os componentes/tokens já instalados.

## Acessibilidade

- Expor a lista como navegação identificada, por exemplo `nav` com nome “Etapas do cadastro profissional” contendo uma lista ordenada.
- Identificar o item atual com `aria-current="step"`; botões têm nomes que incluem número e estado (atual, válido ou incompleto).
- Garantir foco visível, operação por teclado, área de toque suficiente e nomes completos disponíveis a leitores de tela.
- Ao falhar a conclusão, apresentar os erros da primeira etapa inválida, mover o foco após a transição da etapa e não depender somente da animação ou da cor para comunicar o erro.
- Respeitar `prefers-reduced-motion`.

## Fora de escopo

- Persistência, backend, revisão administrativa ou validação real de CREF.
- Alterar as regras legais de elegibilidade profissional ou a cópia da declaração CREF.
- Alterar dados coletados, o conteúdo da Política de Privacidade ou a tela de sucesso.

## Restrições do repositório

- Não instalar dependências.
- Não executar `git`, `typecheck`, `build`, `lint` ou `test`, conforme instruções do projeto.
- Fazer revisão estática manual do fluxo, dos estados, das animações e da acessibilidade aparente.

