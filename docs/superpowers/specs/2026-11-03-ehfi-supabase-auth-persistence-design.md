# EHFI — autenticação e persistência Supabase

## Intenção

Transformar os três cadastros demonstrativos do EHFI em criação de contas utilizáveis, com autenticação Supabase, perfis persistidos, rascunhos temporários e acesso separado por tipo de perfil.

## Estado atual

- A página inicial apresenta aluno, profissional e empresa; cada card abre diretamente seu cadastro.
- O cadastro do aluno tem seis etapas e email/senha. O profissional tem cinco etapas e email, mas sem senha. A empresa tem seis etapas e email do responsável, mas sem senha.
- Os formulários são estados de componentes client-side. Não há persistência dos cadastros, login, sessão ou integração Supabase.
- As páginas de sucesso dizem que nada foi salvo. O único endpoint existente é a consulta pública de CNPJ.
- Os documentos acadêmicos e de CREF são seleções de arquivos fictícios de demonstração; não há upload real.
- A política de privacidade é de protótipo e deixa dados operacionais e jurídicos para definição antes da operação.

## Objetivos

- Trocar a entrada atual por uma seleção de perfil com opções de entrar ou criar conta.
- Dar a aluno, profissional e empresa uma identidade de autenticação por email e senha.
- Persistir todos os campos do perfil, consentimentos e declarações necessários ao fluxo, exceto senha e confirmação de senha.
- Preservar os cadastros específicos por perfil, sem forçar a ficha de saúde, formação/CREF e dados empresariais em um formulário genérico.
- Salvar rascunhos no servidor por até 30 dias de inatividade e removê-los após conclusão ou expiração.
- Manter sessões e autorizações no servidor, com RLS e políticas por usuário/perfil.
- Permitir acesso imediato após cadastro sem confirmação de email, conforme decisão do usuário.

## Decisões aprovadas

- A confirmação de email fica desativada por ora. Cadastro concluído deve iniciar uma sessão e permitir acesso imediato.
- Email e senha serão campos comuns de autenticação nos três tipos. O email atual do aluno, email pessoal do profissional e email do contato da empresa serão usados como identidade de login.
- A política de senha existente do aluno será a política comum: mínimo de oito caracteres, número, minúscula, maiúscula e caractere especial; a validação também ocorrerá no servidor.
- Uma identidade Supabase poderá ter mais de um perfil EHFI. A seleção de perfil na entrada escolhe o contexto de navegação; o servidor valida se a conta tem esse perfil.
- O cadastro final continua criando a conta somente após o envio completo. Rascunhos pré-conta serão mantidos no servidor com token opaco em cookie `httpOnly`, validade deslizante de 30 dias e sem credenciais.
- A autorização de tratamento de dados de saúde será apresentada antes da primeira pergunta de saúde e registrada com versão e data antes de salvar essas respostas. Sem autorização, o cadastro de aluno não é criado e as respostas de saúde não são coletadas.
- A anamnese fica acessível ao próprio aluno. O acesso profissional dependerá de uma associação explícita aluno-profissional e de uma política separada, que ainda não existe.
- Menores de 18 anos podem criar conta e usar a plataforma na primeira versão. Nome/contato do responsável e confirmação continuam declaratórios; a interface não os apresenta como identidade ou autorização verificadas.
- Um sinal de revisão clínica ou CREF não impede a criação da conta; restringe a funcionalidade que depender de liberação/revisão.
- Os campos de PDF de demonstração serão substituídos por upload real em armazenamento privado para persistir documentos profissionais. Nenhum arquivo ou URL pública ficará acessível sem autorização.
- Se um email já tiver uma identidade Supabase, o cadastro orienta a pessoa a entrar antes de adicionar outro perfil à mesma conta; não será criada uma identidade duplicada.
- As exigências atuais de documentos por situação acadêmica/CREF serão preservadas. O upload acontece durante o rascunho, usa acesso temporário de servidor e os objetos abandonados expiram junto com o rascunho.
- A interface de sucesso e a política serão atualizadas para descrever o funcionamento real. O texto não inventará controlador, bases legais, fornecedores, transferências ou prazos de retenção de dados completos.
- A entrega tem como alvo uso por pessoas reais; não será limitada a desenvolvimento/staging. A publicação operacional depende das informações obrigatórias de privacidade listadas abaixo.
- Nenhum comando `git`, `typecheck`, `build`, `lint` ou `test` será executado; nenhum teste será criado.

## Informações obrigatórias antes da operação

- Identificação do controlador EHFI e canal real de privacidade/contato.
- Finalidades e bases legais aprovadas por categoria, em especial para dados de saúde; texto/versionamento dos avisos e consentimentos.
- Prazo de retenção de perfis completos, anamneses e documentos; os 30 dias aprovados cobrem somente rascunhos.
- Fornecedores de email/SMTP, região do projeto Supabase e compartilhamentos/transferências aplicáveis.
- Avaliação jurídica das bases aplicáveis e dos requisitos de melhor interesse/proteção por idade; a primeira versão permite menores sem verificação do responsável, conforme decisão do usuário.

## Fluxo de entrada e cadastro

1. `/` apresenta a escolha entre aluno, profissional e empresa, com ações de entrar e criar conta.
2. O login recebe perfil, email e senha. Após autenticação, verifica a associação do perfil no banco. Selecionar um perfil sem associação não concede acesso.
3. Recuperação de senha permanece disponível por email. O projeto precisa de SMTP de saída configurado para recuperação confiável.
4. O cadastro preserva os campos atuais de cada formulário e adiciona senha/confirmação onde faltam. Senhas são enviadas ao Supabase Auth e nunca entram em rascunho, tabela de perfil, log ou metadado customizado.
5. O navegador salva rascunhos por ações/rotas do Next. Um cookie seguro contém um token aleatório; somente o servidor valida o token e altera seu registro temporário. O token é armazenado como hash no banco.
6. A validação de cada etapa continua na interface por usabilidade, e o servidor valida novamente o formulário completo antes de criar a conta.
7. No envio final, o servidor cria a identidade Supabase com confirmação de email desativada, recebe uma sessão e associa os dados completos aos perfis autorizados.
8. A gravação das tabelas de perfil ocorre em uma transação SQL idempotente. Como Auth e Postgres são operações distintas, a conclusão registra estado recuperável; em falha de persistência, a tela não mostra sucesso e a tentativa pode ser retomada sem criar perfil duplicado.
9. Após sucesso, o rascunho é removido e a pessoa é encaminhada para uma área protegida do perfil. O profissional reutiliza a área placeholder existente; aluno e empresa recebem rotas protegidas placeholder, sem dashboards funcionais nesta entrega.

## Modelo de dados

- `auth.users`: email e identidade/senha geridos pelo Supabase Auth.
- `user_profiles`: dados comuns mínimos e estado de onboarding.
- `user_roles`: associação entre identidade e perfis `student`, `professional` ou `company`.
- `student_profiles`: perfil físico, rotina, objetivos e dados não sensíveis do aluno.
- `student_health_records`: respostas de saúde e dados do responsável, com acesso restrito ao próprio aluno até existir associação autorizada.
- `professional_profiles`: dados pessoais de perfil, formação, CREF, disponibilidade e preferências de atuação. Documentos guardam caminhos/metadados privados de Storage, nunca conteúdo público.
- `companies` e `company_members`: empresa e pessoas autorizadas a agir em seu nome. O contato cadastrado inicia como membro responsável.
- `company_intakes`: endereço, CNAE, estrutura, horários, modelo, orçamento, objetivos e confirmações da solicitação empresarial.
- `consent_records`: tipo de aceite, versão do aviso/termo, data, usuário e, quando necessário, tipo de representante.
- `registration_drafts`: tipo de perfil, payload temporário, hash do token e `expires_at`/`updated_at`; senhas são excluídas.
- Arrays e estruturas aninhadas atuais podem ser armazenados como JSONB nesta primeira entrega, com validação server-side e separação das respostas de saúde.

## Acesso e segurança

- Usar `@supabase/ssr` com cliente de navegador e cliente server-side baseados em cookies; no Next.js 16, manter a convenção `proxy.ts` para atualização de sessão.
- Configurar `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`; o arquivo continua ignorado pelo Git.
- Usar a chave publishable apenas nos locais públicos previstos. A chave secret é somente server-side e reservada ao endpoint controlado de rascunhos, tarefas administrativas necessárias e limpeza; ela ignora RLS.
- Habilitar RLS e conceder privilégios mínimos para todas as tabelas alcançáveis pelo Data API. As políticas relacionam linhas à sessão verificada e às associações de perfil/empresa.
- Não confiar em papel recebido de URL, formulário ou `user_metadata`. Validar identidade e associação nos Server Actions/Route Handlers e nas políticas Postgres.
- O proxy atualiza a sessão; cada operação protegida valida `getClaims()` e autorização no contexto da operação.
- Limitar upload a PDFs em bucket privado, com tamanho máximo definido na implementação, nomes de objeto gerados pelo servidor, acesso por políticas e URLs assinadas de curta duração quando necessário.
- Habilitar controles de abuso/rate limit do Supabase e erros genéricos no login/cadastro. Sem confirmação de email, o sistema não prova que a pessoa controla o endereço digitado; emails errados podem impedir recuperação de senha.

## Retenção e privacidade

- Apagar rascunhos após 30 dias sem alteração e também ao concluir o cadastro; executar a remoção agendada diariamente com Supabase Cron.
- Excluir também os uploads temporários vinculados a rascunhos expirados ou concluídos, após mover os documentos aceitos para caminhos privados do usuário/empresa.
- Definir retenção para contas incompletas e dados de saúde/profissionais/empresas antes da operação real; 30 dias é apenas o prazo aprovado para rascunhos.
- A política atual precisa ser reescrita antes da operação com pessoas reais usando as informações operacionais acima; o sistema não inventará esses dados.
- O fluxo atual de menores coleta declaração e contato do responsável sem verificar identidade ou autoridade. A primeira versão permite esses cadastros; a interface e os dados não podem sugerir que a representação legal foi verificada. Os requisitos aplicáveis ao tratamento de dados de crianças/adolescentes e ao serviço digital exigem avaliação específica.
- A atribuição aluno-profissional não existe. Nenhum profissional terá leitura de anamnese enquanto não houver vínculo registrado e política correspondente.

## Fora de escopo

- Dashboards funcionais, contratação/pagamento, associação automática entre aluno e profissional e revisão operacional de CREF/saúde.
- Email de confirmação de conta nesta etapa.
- Uso público de dados pessoais, de saúde ou documentos.
- Determinação jurídica de controlador, bases legais e prazos para dados completos.

## Restrições do projeto

- Aplicação Next.js 16.4.3, App Router; seguir os guias instalados em `node_modules/next/dist/docs/`.
- Preservar os três formulários e validações específicas existentes.
- Não executar `git`, `typecheck`, `build`, `lint` ou `test`; não criar testes.

## Chamadas deixadas à implementação

- Estruturar colunas e JSONB respeitando os nomes/semântica atuais dos tipos e evitar normalização de conjuntos de opções que não tenham consultas independentes nesta entrega.
- Definir tamanho máximo de arquivo PDF adequado à infraestrutura, mantendo a política do bucket privada.
- Escolher entre Server Actions e Route Handlers por operação, mantendo validação e sessão server-side.
- Criar mensagens acessíveis para perfil inválido, falhas de rede, cadastro duplicado e recuperação da sessão após falha de gravação.
