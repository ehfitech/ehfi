# Termos, confirmações e aviso de privacidade no cadastro profissional

## Intenção

Completar a criação demonstrativa de conta profissional do EHFI com uma quarta etapa de termos e confirmações e um aviso de privacidade que a pessoa possa ler antes de confirmar a leitura. A etapa deve explicar o uso futuro dos dados e documentos sem afirmar que o protótipo já os armazena ou envia.

## Decisões aprovadas

- A criação do perfil pode ser concluída independentemente da resposta sobre o CREF, desde que os campos obrigatórios daquele ramo sejam preenchidos.
- A conclusão do cadastro e o uso de funções internas não liberam oferta ou atendimento de serviços profissionais. A liberação dependerá de regularização e validação do CREF; a revisão/backoffice fica fora deste escopo.
- A etapa de termos vem depois da etapa de CREF e antes da conclusão do cadastro.
- O aviso de privacidade fica disponível em uma página própria, aberta em nova aba a partir do aceite. Isso preserva os dados em memória do formulário enquanto a pessoa lê.
- O aceite de leitura e a declaração de veracidade são obrigatórios. O aceite de comunicações promocionais é independente, opcional e começa desmarcado.
- O nome legal é destinado à apresentação do perfil. O número e o conselho/UF do CREF só serão apresentados como verificados depois de validação. Cidade/UF, formação acadêmica verificada e Instagram profissional opcional podem compor o perfil público, conforme a decisão de produto já confirmada.
- CPF, data de nascimento, e-mail, telefone, documentos acadêmicos, carteira CREF, protocolos e detalhes da solicitação não devem ser apresentados publicamente.
- O estado do CREF usa o Combobox já adotado para tipo de formação, com busca por nome e sigla.
- Todos os dados e documentos do fluxo são destinados a persistência futura, mas o protótipo atual mantém valores apenas em memória, não envia dados e usa nomes de PDFs de exemplo em vez de arquivos do dispositivo.
- A preferência visual de tema é armazenada localmente pelo provedor de tema; ela não é um dado do cadastro nem é enviada pelo fluxo. Não foi encontrada integração de analytics ativa no cadastro.

## Escopo funcional

### Etapa 4 — Termos e confirmações

Exibir três caixas de seleção com estas mensagens exatas:

1. Obrigatória: “Li o Aviso de Privacidade do EHFI e estou ciente de como meus dados pessoais e documentos serão tratados.”
2. Obrigatória: “Declaro que as informações fornecidas são verdadeiras e que os documentos enviados são autênticos.”
3. Opcional: “Autorizo o recebimento de comunicações sobre novidades, divulgação e outras informações do EHFI.”

Não permitir concluir sem as duas confirmações obrigatórias. A opção promocional não participa da validação e não pode vir marcada por padrão. A ação final encaminha para a tela de sucesso atualmente existente. A escolha das caixas permanece apenas no estado desta sessão no protótipo.

### Aviso de privacidade

Disponibilizar `/privacidade` em uma página legível e responsiva, aberta em nova aba pelo link junto ao primeiro aceite. A página deve:

- Identificar-se como uma versão preliminar para o protótipo e dizer que a persistência ainda não está ativa.
- Explicar que a finalidade do fluxo é criar e operar o perfil profissional, conferir formação e situação de registro, apresentar o perfil e manter informações necessárias ao funcionamento e ao respaldo das atividades profissionais regulamentadas.
- Informar categorias de dados do cadastro: nome legal, nascimento, CPF, contato, cidade/UF, Instagram opcional, formação, instituição, curso, situação/ano acadêmico, documentos acadêmicos, resposta sobre CREF, conselho/UF, número e situação declarada, descrição de pedido de registro e documentos de CREF.
- Diferenciar dados previstos para perfil público (nome legal, cidade/UF, formação verificada, Instagram profissional opcional e CREF apenas quando validado) de dados e documentos internos. Nunca declarar CPF ou documentos como públicos.
- Explicar que a veracidade e os comprovantes são declarados/enviados no fluxo, mas não equivalem à validação de habilitação ou à liberação para ofertar/atender serviços.
- Explicar que o aceite de leitura e a declaração de veracidade são requisitos desta demonstração de cadastro, enquanto marketing é opcional, separado, e futuramente deve poder ser revogado com facilidade.
- Apresentar direitos de titular em linguagem simples: confirmação e acesso, correção, informações sobre uso/compartilhamento, anonimização/bloqueio/exclusão quando cabíveis, portabilidade quando aplicável e revogação de consentimento quando essa for a base utilizada.
- Distinguir a experiência atual do tratamento planejado. Na versão atual, os dados de cadastro não são enviados nem persistidos; nomes de PDFs são demonstrações. No produto futuro, EHFI pretende persistir dados e documentos para as finalidades descritas.
- Descrever separadamente a preferência de tema mantida localmente no navegador, sem tratá-la como dado do cadastro.
- Marcar como informações a completar antes da persistência/operação real: identificação e contato do controlador, canal de privacidade/encarregado, hipóteses legais por finalidade, fornecedores e compartilhamentos, eventual transferência internacional, períodos de retenção, controles de segurança efetivamente implementados e canais/frequência para comunicações promocionais.

O aviso não deve inventar esses dados nem declarar medidas técnicas, prazos, compartilhamentos ou bases legais ainda não definidos. O reconhecimento de leitura não deve ser apresentado como consentimento genérico para todos os tratamentos.

## Fora de escopo

- Banco de dados, envio real de documentos ou armazenamento de consentimentos.
- Implementação de backoffice, aprovação ou revisão de CREF.
- Bloqueio técnico de oferta/atendimento em uma área operacional, que ainda não existe neste protótipo.
- Determinação final de bases legais, prazos, controladores, encarregado, fornecedores ou redação jurídica pronta para produção.
- Exposição pública de dados privados ou documentos.

## Restrições de implementação

- Seguir a estrutura e os componentes existentes da aplicação Next.js e shadcn.
- Usar o Combobox existente para selecionar estado/UF do CREF.
- Preservar navegação, dados da sessão, movimento reduzido, acessibilidade e validação das etapas já existentes.
- Não instalar dependências.
- Não executar Git, typecheck, build, lint ou testes; são restrições explícitas deste repositório.

## Referências de privacidade

- ANPD, direitos dos titulares: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- ANPD, estrutura de aviso de privacidade: https://www.gov.br/anpd/pt-br/acesso-a-informacao/aviso-de-privacidade
- ANPD, Guia orientativo sobre agentes de tratamento e encarregado: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_lgpd_final.pdf

