# EHFI — apresentação e cadastro profissional para web

**Data:** 2026-10-30  
**Status:** escopo autorizado para implementação pelo usuário

## Intenção

Transformar o starter Next.js em uma experiência web responsiva para apresentar a EHFI e conduzir profissionais por um cadastro demonstrativo. O Expo é a referência funcional e visual. O resultado deve manter a identidade existente e adaptar a disposição para celular e desktop, sem copiar a navegação de painéis que não faz parte deste recorte.

## Objetivos

- Apresentar a marca, sua proposta e o acesso profissional em uma tela inicial acolhedora.
- Recriar o cadastro profissional em duas etapas, com todos os campos, validações e ramificações existentes no Expo.
- Fazer transições de tela e de etapa, progressão, feedback de seleção e conclusão com Motion, sem atrasar a interação.
- Reutilizar os componentes shadcn/ui já presentes no projeto, as fontes Outfit e Inter, os tokens EHFI e ícones da família Ionicons.
- Oferecer layouts móveis e desktop com hierarquia consistente, campos agrupados e áreas de toque acessíveis.
- Preservar os gradientes suaves claro e escuro do Expo e permitir alternância visível de tema.
- Manter os dados em memória durante o cadastro e deixar explícito que nada é enviado ou salvo.

## Fora de escopo

- Login, autenticação, cadastro de aluno, banco de dados, API ou persistência de campos.
- Upload real de documentos, armazenamento local dos dados ou criação de funcionalidades de painel.
- Recriar o drawer e as abas de Aluno/Instrutor existentes no Expo.
- Criar, gerar ou redimensionar imagens. Os ícones PWA já fornecidos em public/pwa serão usados sem alteração.
- Garantia de operação offline ou inclusão de service worker.

## Jornada e navegação

1. / apresenta a marca EHFI, uma chamada curta, uma descrição da proposta e as opções de perfil.
2. A opção profissional abre /profissional/cadastro.
3. O cadastro inicia na etapa 1 de 2. Avançar valida os dados e mantém os valores ao retornar da etapa 2.
4. A etapa 2 apresenta dados acadêmicos condicionais e uma seleção simulada de comprovante PDF.
5. A conclusão abre /profissional/sucesso, com texto que identifica o resultado como demonstrativo e informa que os dados não foram enviados nem salvos.
6. O CTA de conclusão abre /profissional/plataforma, que informa que a área profissional estará disponível em breve, sem painel ou ações fictícias.

### Decisões de apresentação

- O cartão de aluno continua visível como contexto da EHFI, marcado como “Em breve” e sem ação. Assim ele não se comporta como um botão quebrado.
- Na etapa final, a rota de plataforma continua existindo, mas a tela vazia vira um aviso simples e honesto de disponibilidade futura.
- O fluxo de sucesso não afirma que uma conta real foi criada.

## Campos e validação

### Etapa 1 — Dados pessoais

Agrupar em quatro painéis: Identificação, Contato, Localização e Presença profissional.

- Nome completo — obrigatório; exigir pelo menos nome e sobrenome.
- Data de nascimento — obrigatória; aceitar apenas data válida que não esteja no futuro, no formato DD/MM/AAAA.
- CPF — obrigatório; formatar e aceitar onze dígitos nesta demonstração.
- E-mail — obrigatório; validação simples de formato.
- Telefone/WhatsApp — obrigatório; aceitar dez ou onze dígitos com DDD.
- Cidade — obrigatória.
- Estado — obrigatório; aceitar sigla de duas letras.
- Instagram profissional — opcional.

Os erros aparecem junto ao campo depois de tentar avançar. Máscaras e teclados apropriados devem ser usados sem impedir edição.

### Etapa 2 — Formação acadêmica

- Instituição, curso, tipo de formação, situação acadêmica e ano — obrigatórios.
- Tipos: Bacharelado, Licenciatura, Tecnólogo, Pós-graduação/Especialização e Outro. Outro revela um campo de descrição obrigatório.
- Situação: Formação concluída ou Em andamento.
- A situação determina o rótulo e os limites do ano.
- Concluída: perguntar se o diploma está disponível. Se estiver, exigir diploma demonstrativo; se não, escolher histórico acadêmico ou declaração de conclusão.
- Em andamento: exigir histórico acadêmico demonstrativo.
- O comprovante permanece simulado: um diálogo apresenta um nome de PDF de exemplo e permite substituir ou remover a seleção. Nenhum arquivo do aparelho é aberto ou enviado.

## Direção visual

- Paleta e gradientes de tela do Expo:
  - Claro: #F8F7FF, #FFF3F7, #F2EEFF.
  - Escuro: #09090B, #14111C, #1A1023.
- Usar coral EHFI como primário, violeta como acento, superfícies claras/escuras e bordas discretas.
- Outfit nos títulos e Inter em campos, rótulos e textos.
- Aplicar os componentes existentes Button, Card, Field, Input, Label, Progress, RadioGroup, Select e Dialog onde forem adequados.
- Usar react-icons/io5, já disponível no web, para manter a linguagem Ionicons usada no Expo. Ícones acompanham rótulos e não carregam significado sozinhos.
- Usar o ícone PWA existente em /pwa/icon-192.png nas telas. Não produzir novos assets.
- Na apresentação, manter a hierarquia do Expo. No celular o conteúdo flui em uma coluna; em desktop o hero e as ações aproveitam uma composição de duas colunas.
- No formulário, separar os grupos em painéis distintos. Campos relacionados podem compartilhar linhas em telas largas; no celular todos fluem para uma coluna.
- A ação principal fica acessível na parte inferior do celular e acompanha o teclado. Em desktop, fica alinhada ao fim do conteúdo da etapa.

## Movimento e interação

- Adicionar a dependência Motion ao projeto web porque ela não está instalada atualmente; usar imports de motion/react apenas em componentes client.
- Entrada da apresentação em sequência curta: marca, chamada, apoio e opções. Atrasos entre itens ficam entre 40–70 ms.
- Entrada e saída das etapas usam opacidade e deslocamento curto, com saída mais rápida que entrada.
- A barra de progresso acompanha a mudança de etapa e expande suavemente.
- Ramificações acadêmicas surgem com transição de altura e opacidade; não reiniciar animações de todo o formulário a cada digitação.
- Botões têm resposta de pressionamento sutil. Seleção de cards e diálogo de comprovante têm feedback claro.
- UI em movimento usa curvas ease-out/ease-in-out e durações entre 150–280 ms. Nenhuma animação bloqueia toque.
- Respeitar prefers-reduced-motion: retirar deslocamentos e reduzir atrasos, mantendo feedback de opacidade e estado.

## Acessibilidade e comportamento responsivo

- Usar HTML semântico, rótulos associados, mensagens de erro anunciáveis, estados de seleção e foco visível.
- As opções em cards funcionam por teclado e leitor de tela.
- Não limitar zoom nem depender de hover.
- Os controles permanecem utilizáveis com teclado virtual aberto, telas baixas e ampliação de texto.
- O tema inicial acompanha a preferência do sistema; um controle visível permite alterná-lo manualmente.
- A navegação por links mantém URLs navegáveis e suporte ao botão voltar do navegador.

## Restrições do projeto

- O alvo de implementação é o Next.js App Router em ehfi; ehfi-expo é referência somente leitura.
- Reutilizar o conjunto de componentes e dependências existente quando possível.
- Não executar Git, build, lint, typecheck ou testes; o projeto não permite esses comandos e o usuário não quer testes.
- Revisar o código e a apresentação manualmente, sem alegar validação automatizada.

## Referências

- ehfi-expo/app/index.tsx
- ehfi-expo/app/profissional/cadastro.tsx
- ehfi-expo/app/profissional/sucesso.tsx
- ehfi-expo/theme/tokens.ts
- ehfi/app/page.tsx, ehfi/app/globals.css e componentes shadcn/ui existentes
- Não há arquivo Figma; usar o Expo e as especificações existentes como fonte da interface.
