# EHFI — agenda profissional e atividades para alunos

**Status:** aprovado pelo usuário para implementação em 2026-11-03  
**Data:** 2026-11-03

## Intenção

Transformar as áreas profissionais e de aluno, hoje demonstrativas, em uma primeira experiência de uso conectada à conta EHFI e ao Supabase. A implementação ocorrerá no app web atual em `ehfi` (Next.js). O projeto Expo em `ehfi-expo` é a referência visual e de fluxo, não o destino desta etapa.

O profissional deve conseguir publicar atividades com data, horário, duração, local, preço e limite de participantes e acompanhar sua agenda. O aluno deve conseguir descobrir atividades e acompanhar seus compromissos. A interface deve conservar a composição, os ícones, as cores, a tipografia e a densidade já definidos no Expo, adaptando-os ao app web responsivo.

## O que a revisão encontrou

- `ehfi-expo/app/(drawer)/(instrutor)/index.tsx` tem um painel com métricas e próximas aulas fixas; os botões “Nova aula”, “Agenda” e “Ver todas” não executam navegação ou ações reais.
- `ehfi-expo/app/(drawer)/(instrutor)/two.tsx` contém a agenda visual, filtros, linha do tempo e formulário inferior de nova aula. Os registros iniciais são mockados e salvar apenas espera e altera estado local. O evento usa `dayOffset`, sem data absoluta; os exemplos reaparecem quando a semana muda.
- `ehfi-expo/app/(drawer)/(aluno)/index.tsx` contém conteúdo de apresentação; as chamadas “Explorar profissionais” e “Minha jornada” não navegam.
- `ehfi-expo/app/(drawer)/(aluno)/two.tsx` exibe reservas e profissionais recomendados fixos, sem carregamento, detalhe, reserva ou cancelamento.
- `ehfi-expo/theme/tokens.ts` define as cores, Outfit/Inter, espaçamentos e raios da marca; `theme/tabBar.tsx` e `components/navigation/BrandTabBar.tsx` definem as abas em dock, com ícones Ionicons e estado ativo.
- `ehfi/app/aluno/plataforma/page.tsx` e `app/profissional/plataforma/page.tsx` já protegem as rotas por sessão e papel, mas ainda renderizam `PlatformPlaceholder`.
- `ehfi/supabase/migrations/202611030001_ehfi_auth_profiles.sql` cria perfis, papéis, registros de saúde, documentos e consentimentos. Não existem tabelas de atividades ou reservas. As tabelas de domínio existentes aceitam leitura por RLS segundo propriedade; gravações de cadastro usam RPCs `security definer`.
- O cadastro profissional finaliza todo perfil com `practice_status = 'review_pending'`. Não há fluxo administrativo no app para aprová-lo. O cadastro do aluno pode definir `student_profiles.review_status = 'review_pending'` a partir das respostas de saúde; também não há fluxo de revisão no app.
- O projeto web já usa Next.js 16.4.3, Supabase SSR, componentes shadcn/Base UI, paleta e fontes EHFI equivalentes às do Expo. O pacote Expo não declara Supabase nem persistência de dados de agenda.

## Objetivos

- Fazer da rota profissional uma visão real do dia e da semana, com contagens calculadas dos dados existentes.
- Permitir ao profissional criar atividades em datas específicas e acompanhar vagas e participantes.
- Oferecer ao aluno atividades disponíveis e sua agenda de compromissos, com estado vindo do Supabase.
- Permitir que profissionais publiquem e que alunos reservem mesmo enquanto seus respectivos `review_status`/`practice_status` estejam `review_pending`, conforme decisão do usuário.
- Substituir mocks, links sem ação, métricas inventadas e placeholders apenas nas áreas de aluno e profissional.
- Reutilizar a identidade visual do Expo: hierarquia de herói, cards, filtros, chips de dia, linha do tempo, ação destacada, abas, ícones Ionicons, cores, gradientes, Outfit/Inter e temas claro/escuro.
- Respeitar autorização por sessão e `user_roles`; aplicar RLS a todas as operações e manter dados de saúde, documentos, CPF, data de nascimento e contatos privados.
- Manter interface responsiva para uso instalado como PWA e em navegadores móveis/desktop.

## Fora do escopo proposto

- Área de empresa e cadastro/autenticação já existentes.
- Pagamentos, repasses, notas fiscais, reembolso ou cálculo de taxas.
- Recorrência automática de atividades; a primeira versão trata cada atividade como uma sessão datada.
- Chat, avaliações, notificações push, calendário externo, teleatendimento e relatórios avançados.
- Reescrever o Expo ou duplicar a lógica de produto nele.
- Expor dados de anamnese, saúde, documentos, CPF, data de nascimento, e-mail ou telefone em listagens públicas ou para outros usuários.

## Proposta de experiência

### Profissional

1. Entrar pela rota já protegida `/profissional/plataforma`.
2. Ver uma saudação e métricas calculadas (aulas do dia e participantes com reserva ativa), seguidas das próximas atividades.
3. A partir da ação principal ou da aba “Agenda”, navegar para a semana e selecionar um dia com os mesmos chips, filtros, cards e linha do tempo do Expo.
4. Criar uma sessão no formulário responsivo que mantém a ordem e os campos visuais existentes: data, hora, nome, local, duração, preço, capacidade e observações.
5. Consultar participantes de uma sessão própria e cancelar/editar a sessão, com confirmação clara quando já houver reservas.

Estados de disponibilidade — aberta, últimas vagas e lotada — devem ser calculados pela capacidade e pelas reservas ativas. “Confirmada” descreve uma reserva/compromisso, não uma opção escolhida manualmente pelo profissional.

### Aluno

1. Entrar pela rota já protegida `/aluno/plataforma`.
2. Ver próximos compromissos reais e uma chamada para explorar atividades abertas.
3. Consultar sessões publicadas, data, local, perfil público do profissional, preço e vagas; abrir seus detalhes.
4. Reservar/cancelar uma vaga e acompanhar o estado da reserva, inclusive quando seu perfil estiver em `review_pending`.

Os cards de “recomendados” do protótipo não justificam uma recomendação algorítmica. Na primeira entrega, a proposta é exibir uma lista objetiva de atividades disponíveis, ordenada por data, sem pontuação personalizada baseada em dados de saúde.

## Modelo de domínio proposto

Usar tabelas relacionais próprias em uma nova migração Supabase, sem guardar agenda ou reservas em JSONB:

- `activities`: dono profissional, título, descrição opcional, início/fim com fuso representado de forma inequívoca, local, preço em unidade monetária mínima (por exemplo, centavos), capacidade, estado de publicação e timestamps.
- `activity_bookings`: atividade, aluno, estado da reserva e timestamps; restrições para evitar duplicidade e manter a capacidade.
- `professional_public_profiles`: campos de apresentação que o próprio profissional controla, separados do cadastro privado; proposta inicial: nome público, apresentação curta, especialidades/áreas de atuação, cidade/UF e estado de publicação. O perfil público não reutiliza nem expõe automaticamente o JSONB de cadastro.

O perfil público inicial não terá upload de foto; o cartão usa avatar de iniciais/ícone já compatível com o visual do Expo. E-mail, telefone, CPF, data de nascimento, Instagram e documentos não serão publicados. O profissional controla o nome e os demais campos públicos e pode retirar o perfil da descoberta sem apagar sua conta. Ao ocultá-lo, atividades futuras saem da descoberta e novas reservas são bloqueadas; reservas existentes continuam visíveis e válidas.

O nome final das tabelas e colunas pode seguir o vocabulário acordado, mas uma atividade da primeira versão sempre representa uma sessão com data e hora próprias. A disponibilidade é derivada das reservas que ocupam vaga; não é aceita do cliente como valor confiável.

Reserva de vaga deve passar por uma operação transacional no Postgres (RPC), que verifica sessão, papel, publicação, capacidade, duplicidade, conflito temporal do próprio aluno e demais regras acordadas. A contagem de vagas e a criação da reserva não podem depender apenas de validação na tela, para evitar sobrelotação em reservas simultâneas.

### Estados e regras propostas para a primeira versão

- A atividade é uma sessão datada; horários são interpretados em `America/Sao_Paulo` e armazenados como `timestamptz`.
- Estados da atividade: `draft`, `published`, `cancelled`, `completed`. O profissional pode publicar em `practice_status = 'review_pending'`; não alterar esse status pela publicação.
- Estados da reserva: `reserved`, `cancelled_by_student`, `cancelled_by_professional`, `attended`, `no_show`. Somente `reserved` ocupa vaga.
- O aluno pode cancelar até o início da atividade; o cancelamento libera a vaga e conserva o registro histórico. O profissional pode cancelar uma sessão a qualquer momento, mantendo as reservas associadas com estado de cancelamento pelo profissional.
- A lista privada de participantes usa primeiro nome e inicial do sobrenome, sem e-mail ou telefone, somente nas atividades próprias do profissional.
- Ocultar o perfil público tira as atividades da descoberta e bloqueia novas reservas, sem invalidar compromissos já reservados; alunos inscritos continuam vendo os detalhes necessários de suas reservas e podem cancelá-las.
- Para não mudar compromissos já aceitos, o profissional não altera horário, local nem capacidade de uma sessão com reservas ativas; pode cancelar e criar uma nova sessão. Capacidade não pode ser reduzida abaixo do número de reservas ativas.
- A primeira versão não permite sobreposição de sessões publicadas para o mesmo profissional, nem reservas ativas do mesmo aluno em sessões sobrepostas. Não há exceção por modalidade/local nesta versão.
- Preço é exibido como informativo e não é cobrado nesta etapa.

## Autorização e privacidade

- Reutilizar o cliente Supabase SSR com a sessão do usuário, `getAuthorizedProfile` e o padrão de acesso do usuário autenticado; não usar `service_role` para ações normais de agenda.
- Profissional só cria, altera, cancela e vê participantes das próprias atividades.
- Aluno só vê e altera as próprias reservas; atividades descobertas precisam estar publicadas e pertencer a um profissional com perfil público publicado. Se o perfil for ocultado, um aluno já inscrito ainda vê os detalhes necessários da reserva existente.
- A lista de participantes obtém uma projeção restrita gerada no servidor/banco com primeiro nome e inicial do sobrenome. Não conceder ao profissional acesso de leitura a `user_profiles` do aluno nem a seus contatos.
- Não fazer `select` público de `professional_profiles.data`: o JSONB reúne informações pessoais e comprovantes de cadastro. A listagem deve expor somente uma projeção explícita dos dados permitidos (idealmente uma tabela pública de apresentação separada ou uma view cuidadosamente configurada).
- `practice_status = 'review_pending'` não impede o profissional de criar/publicar atividades. A interface pode informar ao próprio profissional que documentos/credenciais seguem em análise; nenhum selo ou copy pode sugerir verificação concluída.
- Enquanto `practice_status = 'review_pending'`, a página pública informa “Credenciais em análise”; quando estiver `active`, pode mostrar o estado validado somente se o processo de verificação correspondente realmente o tiver marcado.
- `student_profiles.review_status = 'review_pending'` não impede descobrir, reservar ou cancelar.
- Dados e motivos de saúde permanecem inacessíveis ao fluxo de agenda e a profissionais. A reserva não dá acesso à anamnese.
- Na lista privada de participantes de uma atividade própria, o profissional vê apenas primeiro nome e inicial do sobrenome do aluno, sem e-mail ou telefone.
- Criar grants, RLS, índices, constraints, RPCs e tipos TypeScript Supabase na mesma alteração de contrato; conceder somente as leituras e gravações necessárias a cada papel.

## Direção visual e navegação

- Preservar a ordem e a composição dos dois painéis do Expo: início e agenda para profissional; início e aulas para aluno.
- Manter marca no cabeçalho, drawer, dock de abas em cápsula, ícones com label e destaque do item ativo; usar a mesma família de ícones Ionicons já disponível no web (`react-icons/io5`).
- Replicar a paleta EHFI clara/escura, o gradiente rosa/lilás, superfícies, bordas sutis, Outfit nos títulos e Inter no corpo, sem introduzir outra identidade ou novos assets.
- Preservar a hierarquia do painel do profissional (hero, métricas em duas colunas, ações, próximas aulas) e da agenda (seletor semanal, faixa de dias, filtros, timeline e ação “Nova aula”). Adaptar o formulário inferior do Expo para o componente de diálogo/sheet existente ou equivalente já instalado, respeitando teclado, safe area e largura disponível.
- Para aluno, manter hero, resumo dos próximos compromissos e cartões informativos; transformar as ações em rotas concretas para exploração e agenda. Não deixar links sem destino ou botões decorativos.
- Estados de carregamento, falha, agenda vazia, lista vazia, atividade lotada/cancelada e sessão expirada usam a mesma linguagem visual e oferecem recuperação quando possível.
- Preservar foco visível, rótulos para ícones, áreas de toque adequadas, redução de movimento e ordem de leitura em tela pequena.

## Integração Next.js/Supabase proposta

- Componentes de página no servidor carregam os dados iniciais usando o cliente Supabase SSR e a política do usuário autenticado.
- Ações de escrita usam server actions já compatíveis com a organização do app, validam os dados recebidos novamente e persistem com as credenciais da sessão.
- Reserva/cancelamento e mudanças que envolvem capacidade ou várias linhas usam RPC transacional com `auth.uid()`; regras de integridade ficam no Postgres/RLS.
- Atualizar `lib/database.types.ts` conforme o contrato SQL e manter funções de leitura/escrita pequenas, específicas por operação e papel.
- Datas e horários são armazenados de modo estável como `timestamptz`; apresentação e filtros usam um fuso operacional definido para as sessões. **Proposta:** fuso `America/Sao_Paulo` no primeiro lançamento, explicitado em toda conversão de data/horário.

## Decisões confirmadas e escolhas do desenho

1. **Destino:** app atual Next.js; Expo é referência visual. **Confirmado pelo usuário em 2026-11-03.**
2. **Sequência de entrega:** começar pelo fluxo profissional de publicação/agenda como fonte de dados; em seguida, ligar descoberta e compromissos do aluno.
3. **Reservas:** consultar, reservar e cancelar foi confirmado pelo usuário em 2026-11-03.
4. **Publicação profissional:** foi decidido permitir publicação em `review_pending`. O status não será convertido automaticamente para `active`; publicação de atividade e validação de credenciais são estados distintos. A UI não exibirá selo de credencial verificada.
5. **Revisão de aluno:** foi decidido permitir descoberta, reserva e cancelamento em `review_pending`. Nenhum dado ou motivo de saúde será entregue ao profissional no fluxo.
6. **Perfil público:** foi decidido criar campos públicos separados e editáveis pelo profissional. O recorte inicial usa nome público, apresentação curta, especialidades/áreas de atuação, cidade/UF e visibilidade; não inclui upload de imagem nem publica contato, CPF, data de nascimento ou documentos. Ocultar o perfil retira atividades da descoberta e impede novas reservas, preservando reservas existentes.
7. **Cancelamento:** por chamada do desenho, aluno pode cancelar até o início da sessão; profissional cancela a sessão, reservas preservam histórico e a vaga é liberada. Uma sessão com reservas não pode ter horário/local/capacidade alterados.
8. **Conflitos:** por chamada do desenho, impedir sobreposições de sessões publicadas do profissional e de reservas ativas do aluno; sem exceções online/local nesta versão.
9. **Pagamentos:** não houve pedido de cobrança online; por chamada de escopo, preço fica informativo nesta versão. A reserva não cria cobrança nem representa pagamento.
10. **Operação existente:** por chamada do desenho, refletir registros reais do Supabase; não migrar os dados inventados da demonstração.
11. **Participantes:** foi decidido mostrar ao profissional apenas primeiro nome e inicial do sobrenome de cada aluno inscrito em sua atividade, sem dados de contato.

## Limites de execução

- Nenhuma alteração de produto será implementada antes da aprovação deste desenho pelo usuário.
- Não executar `git`, `typecheck`, `build`, `lint` ou `test`; não adicionar nem executar testes.
- Antes de qualquer código Next.js, seguir a regra local e ler a documentação instalada em `node_modules/next/dist/docs/` para os pontos usados.
- A revisão atual cobre o código e as migrações locais. Não consulta nem altera o projeto Supabase remoto e não lê valores de `.env.local`.
