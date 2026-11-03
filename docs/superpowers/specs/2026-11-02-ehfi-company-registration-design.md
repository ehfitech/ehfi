# Cadastro demonstrativo de empresas EHFI

## Intento

Adicionar um terceiro fluxo de cadastro para empresas, com a mesma linguagem visual, comportamento de etapas, validação, animação e acessibilidade dos cadastros atuais de aluno e profissional. O fluxo deve coletar informações para uma futura conexão com profissionais de Educação Física e reduzir digitação dos dados cadastrais consultando o Open CNPJ pelo CNPJ informado.

## Objetivos

- Adicionar à página inicial o card “Sou empresa”. No celular, os três cards ficam empilhados; em telas maiores, aparecem em uma única linha com espaço legível.
- Criar o cadastro empresarial em no máximo seis etapas, com indicador de progresso e campos condicionais.
- Aplicar máscara numérica de CNPJ e consultar `https://kitana.opencnpj.com/cnpj/{cnpj}` após o usuário digitar os 14 dígitos e parar de digitar por 450 ms.
- Pré-preencher razão social, nome fantasia, logradouro, número, complemento, bairro, cidade, UF e CEP retornados pela API. Exibir a atividade principal/CNAE e a situação cadastral como referência; a pessoa escolhe a categoria ampla de atividade.
- Permitir revisar e editar os dados pré-preenchidos. Nenhum erro, ausência ou indisponibilidade da API deve impedir a continuação manual do cadastro.
- Explicar que esta experiência é demonstrativa. Nenhum dado do formulário é enviado ou salvo pelo EHFI; o CNPJ digitado é enviado ao Open CNPJ para consulta.

## Fora do escopo

- Criar conta autenticada ou perfil persistente de empresa.
- Salvar cadastro, solicitar profissionais, receber propostas, contratar, exibir histórico ou fazer compatibilidade automática.
- Consultar CNPJ alfanumérico; esta versão aceita somente 14 dígitos numéricos, conforme decidido pelo usuário.
- Preencher os dados do responsável usando telefone ou e-mail público da empresa; esses dados permanecem campos próprios do responsável.
- Inferir a categoria ampla do ramo a partir do CNAE. A descrição do CNAE será mostrada e a empresa selecionará sua categoria.

## Usuários e sucesso

O usuário é uma pessoa que representa uma empresa interessada em ginástica laboral. O fluxo é bem-sucedido quando consegue preencher dados da empresa e do responsável, informar estrutura, horários e preferências, revisar o resumo e concluir a demonstração sem depender da disponibilidade da consulta externa.

## Etapas e conteúdo

1. **Dados da empresa** — razão social, nome fantasia, CNPJ, categoria principal (Indústria, Comércio, Saúde, Educação, Serviços, Tecnologia, Logística, Administrativo ou Outro), CNAE principal consultado, endereço completo (logradouro, número, complemento opcional, bairro, cidade, UF e CEP) e site/redes sociais opcionais. Endereço registrado na Receita é a origem do preenchimento automático; todos os campos permanecem editáveis para corrigir dados ou informar o local de atendimento. Todos são obrigatórios, exceto complemento e site/redes sociais.
2. **Responsável** — nome completo, cargo/função, setor, e-mail, telefone/WhatsApp e melhor horário (manhã, tarde, noite ou qualquer horário). Todos são obrigatórios.
3. **Estrutura e funcionamento** — faixa de colaboradores (até 10; 11–30; 31–50; 51–100; 101–200; 201–500; mais de 500), com opção para informar quantidade exata; setores existentes (Administrativo, Recursos Humanos, Produção, Comercial/Vendas, Financeiro, Logística, Atendimento, Operacional e Outro); modalidade presencial/remota/híbrida; disponibilidade de espaço (amplo, limitado, sem espaço específico ou não sabe); dias e horários gerais; informação sobre turnos e turno noturno; horários de turnos; horário por setor. Campos são obrigatórios, exceto o número exato de colaboradores.
4. **Modelo e frequência** — sessões coletivas, por setor e/ou por turno, ou orientação do EHFI; capacidade de espaço para a opção coletiva (sim, não ou precisa avaliar); frequência (uma, duas ou três vezes por semana, dias úteis, ações pontuais ou ainda não definido) e duração (5–10, 10–15, 15–20, 20–30 minutos ou orientação profissional). Deve haver pelo menos um modelo selecionado.
5. **Contratação e objetivos** — interesse inicial (sessão experimental, pacote mensal, serviço contínuo, ação especial ou conhecer planos/valores), previsão de início (imediatamente, até 15 dias, até 30 dias, próximos três meses ou sem previsão), status de orçamento (sim, não ou deseja conhecer valores) e valor mensal opcional, um ou mais objetivos, experiência anterior (oferece atualmente, interrompeu ou primeira experiência) e necessidades específicas opcionais.
6. **Revisão e confirmações** — resumo editável por navegação do stepper; aceite dos Termos de Uso desta demonstração e ciência da Política de Privacidade; autorização de contato do EHFI sobre esta solicitação; confirmação da veracidade das informações. As confirmações obrigatórias devem ser independentes.

### Comportamentos condicionais

- Turnos e horários de turnos só aparecem quando a empresa informa que trabalha com turnos; horário noturno aparece quando aplicável. Os turnos iniciais são primeiro, segundo e terceiro, com possibilidade de adicionar outros.
- A categoria “Outro” em atividade, setor ou objetivo abre campo de texto correspondente.
- A opção de sessão coletiva abre a pergunta sobre espaço para todos.
- Coletiva, por setor e por turno são seleções múltiplas; “Quero orientação” é exclusiva.
- “Outro” em atividade, setor e objetivos exige a descrição correspondente; escolhas múltiplas de setor e objetivo exigem pelo menos uma seleção.
- As seções de horários por setor são editáveis por setor, usando os horários gerais como referência; só precisam ser detalhadas quando houver diferença ou quando a empresa quiser informar a programação específica.
- “Informar quantidade exata” substitui a faixa estimada. Se preenchida, a faixa fica derivada do número exato para evitar respostas contraditórias.
- O CNAE principal consultado não seleciona automaticamente uma das categorias amplas; o valor oficial fica visível como referência.

## Consulta ao Open CNPJ

- A máscara visual é `00.000.000/0000-00`; a consulta recebe apenas os 14 dígitos sem pontuação.
- A consulta começa somente quando há 14 dígitos e 450 ms sem alteração. Alterações antes do prazo reiniciam o debounce; respostas antigas são canceladas ou ignoradas.
- A interface distingue aguardando, carregando, encontrado, não encontrado e indisponível/erro. Erro de rede, limite, resposta inválida ou ausência de registro deixa a empresa continuar manualmente.
- Ao trocar de um CNPJ completo para outro CNPJ completo, limpar os dados cadastrais e de identificação da empresa anteriores, inclusive correções manuais, para evitar misturar dados de empresas. Durante a edição parcial do CNPJ, limpar apenas valores preenchidos pela busca; não deixar uma resposta atrasada atualizar campos do CNPJ atual.
- Uma Route Handler do Next.js consulta o endpoint externo e normaliza os campos retornados. O endpoint local valida 14 dígitos antes de encaminhar a consulta.
- Não armazenar o payload nem respostas da empresa. Não registrar o CNPJ em logs da aplicação.
- O endereço consultado é o endereço cadastral da inscrição e pode não ser o local da ginástica laboral. A interface informa isso e permite edição.
- A situação cadastral é informativa; não bloqueia a demonstração.
- A documentação pública atual do Open CNPJ informa limite de 300 requisições por minuto e alerta que a atualização/disponibilidade depende das fontes. A interface não promete que os dados são completos ou atuais.

## Validação e interação

- Cada etapa valida apenas os campos requeridos naquela etapa e só avança se estiver válida. A conclusão leva a primeira etapa inválida e aponta o campo.
- E-mail e telefones usam validação de formato e DDD; CNPJ numérico requer 14 dígitos. Campos explicitamente opcionais não bloqueiam o avanço.
- Dias, setores, objetivos e modelos de atendimento com escolha múltipla exigem pelo menos uma opção quando aplicável. “Nenhum/ainda não definido” é exclusivo quando aparecer junto a outras opções.
- Campos condicionais ocultos deixam de ser requeridos e não devem manter erros ativos.
- Usar botões de voltar/continuar, foco e alertas de erro, rolagem ao primeiro campo inválido, indicador compartilhado `SignupStepper`, animações existentes e respeito a `prefers-reduced-motion`.
- No celular, ações de navegação permanecem acessíveis junto ao fim da tela, sem esconder campos nem o aviso de consulta.

## Consentimento, privacidade e termos

- O aviso de privacidade acrescentará uma seção específica para dados empresariais, finalidade demonstrativa e consulta pública do CNPJ pelo Open CNPJ.
- O aviso de demonstração distingue o envio do CNPJ ao Open CNPJ das demais respostas, que ficam apenas na memória da página e não são enviadas ao EHFI nem salvas.
- Criar uma página “Termos de Uso da demonstração” com afirmações operacionais verificáveis: é um protótipo; não cria conta, contrato, pedido de atendimento ou proposta; o usuário deve revisar os dados; a busca externa pode falhar; evitar inserir dados pessoais reais do responsável. O CNPJ informado é enviado ao Open CNPJ para consulta de dados públicos. O texto não se apresenta como termos jurídicos da operação futura.
- “Autorizo contato do EHFI sobre esta solicitação” é confirmação separada do aceite/ciente dos documentos e necessária para concluir, conforme o formulário fornecido.
- A tela de sucesso informa que os dados não foram enviados ao EHFI nem salvos e que somente o CNPJ foi consultado no Open CNPJ.

## Experiência visual

- Página inicial mantém introdução, tema, identidade e motion existentes. A composição passa a apresentar a introdução antes da área dos cards, permitindo três cards em linha em desktop sem espremê-los na coluna atual.
- “Sou empresa” recebe ícone de negócio, copy curta e o mesmo link-card interativo, foco visível e tratamento de movimento reduzido dos demais papéis.
- Cadastro usa painéis, hierarquia, cores, ícones, botões, transições de etapa e indicador existentes.
- Cada tela mantém conteúdo de uma etapa por vez. Em telas grandes os campos podem usar duas colunas; em celular ficam em uma coluna.

## Rotas previstas

- `/empresa/cadastro` — fluxo interativo.
- `/empresa/sucesso` — conclusão demonstrativa.
- `/api/cnpj/[cnpj]` — consulta externa normalizada, sem persistência.
- `/termos-de-uso` — termos explicativos da demonstração.
- `/privacidade#cadastro-empresa` — seção de privacidade empresarial.

## Restrições

- Manter a stack e dependências instaladas; não instalar pacote novo.
- Seguir os padrões do App Router e da versão instalada do Next.js 16.4.3.
- Não incluir perfil, autenticação ou persistência.
- Não executar `git`, `typecheck`, `build`, `lint` ou comandos de teste; não criar testes automatizados.

## Decisões deixadas à implementação

- O horário de contato usa as opções claras “manhã”, “tarde”, “noite” e “qualquer horário”.
- O formato de trabalho é escolha única; modalidades de atendimento e objetivos permitem múltipla escolha.
- O ramo usa uma categoria principal (Indústria, Comércio, Saúde, Educação, Serviços, Tecnologia, Logística, Administrativo e Outro).
- Contagem de setores é derivada dos setores adicionados, evitando pedir o mesmo total duas vezes.
- “Termos de Uso” desta versão são apenas os termos operacionais da demonstração descritos nesta spec.
