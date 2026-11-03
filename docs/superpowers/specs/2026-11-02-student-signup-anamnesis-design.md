# Cadastro de aluno e anamnese EHFI

## Intenção

Ativar a opção de aluno na tela inicial e oferecer um cadastro demonstrativo de seis etapas, incluindo dados de conta, perfil físico e a ficha de anamnese fornecida.

## Objetivos

- Coletar nome, e-mail, telefone e senha, além das respostas previstas na ficha.
- Organizar a jornada em no máximo seis etapas, com navegação direta e acessível entre elas.
- Reutilizar o padrão visual da EHFI: ícones, cartões, divisões por assunto, animações discretas, layout responsivo e respeito a movimento reduzido.
- Validar cada etapa ao avançar e validar toda a jornada em ordem ao concluir, preservando as respostas ao navegar.
- Exigir a declaração de veracidade, a autorização de tratamento dos dados de saúde e, para menores de 18 anos, identificação/contato e confirmação do responsável legal.
- Impedir a conclusão quando houver resposta afirmativa ou incerta que exija revisão profissional; explicar que a demonstração não encaminha os dados para avaliação.
- Deixar claro que o protótipo não cria conta, não envia respostas e não guarda os dados.

## Fora de escopo

- Autenticação, persistência, envio de e-mail, associação real com profissional ou envio de alertas.
- Verificação real de identidade/tutela do responsável.
- Avaliação, diagnóstico ou liberação clínica automática para exercício.
- Alteração do cadastro profissional além da extração do stepper compartilhado, mantendo os cinco passos atuais.

## Etapas

1. **Conta:** nome completo, e-mail, telefone, senha e confirmação de senha.
2. **Perfil físico:** nascimento, altura, peso atual opcional e nível de condicionamento.
3. **Movimento e rotina:** prática atual, tempo de prática regular, modalidades, sono, rotina diária e alimentação/hidratação.
4. **Histórico de saúde:** condições diagnosticadas, medicamentos e sintomas.
5. **Cuidados e limitações:** dores/limitações atuais, cirurgia/lesão importante, restrições de exercício, gestação/pós-parto e outra informação de saúde.
6. **Objetivos e confirmações:** objetivos, informação que o aluno deseja compartilhar, declaração de veracidade e autorização de tratamento de dados de saúde. Se a data de nascimento indicar menos de 18 anos, mostrar nome e contato do responsável e uma confirmação separada.

## Regras dos campos e validação

- Nome completo, e-mail, telefone, senha e confirmação de senha são obrigatórios. A senha demonstrativa deve cumprir os cinco critérios definidos em `2026-11-02-student-password-strength-design.md` e corresponder à confirmação; não é enviada nem salva.
- Data de nascimento válida e não futura, altura positiva em centímetros e nível de condicionamento são obrigatórios. Peso deve ser positivo quando preenchido.
- Perguntas de escolha fechada são obrigatórias, exceto quando a própria ficha oferece “Prefiro não responder”.
- Modalidades e objetivos aceitam várias escolhas. “Outra modalidade” e “Outro objetivo” abrem descrição obrigatória.
- “Nenhuma” em condições, sintomas e limitações é exclusiva das demais opções.
- Se houver condição de saúde, solicitar o estado de controle; a descrição da condição permanece opcional, conforme a ficha.
- Se houver medicamento, exigir nome; finalidade é opcional.
- Se houver sintomas, exigir contexto e se ainda ocorrem.
- Se houver limitação atual, exigir região, duração e movimentos desconfortáveis.
- Se houver histórico de cirurgia/lesão importante, exigir breve descrição.
- Se a pessoa responder “Sim” à recomendação de restrições, exigir quais são. “Não tenho certeza” continua sendo uma resposta válida, sinaliza revisão e bloqueia a conclusão.
- Gestação ou pós-parto exige informar o tempo correspondente; “Prefiro não responder” é válido.
- Respostas abertas marcadas opcionais continuam opcionais.
- A declaração de veracidade e a autorização para tratar os dados de saúde são obrigatórias. Sem autorização, a demonstração não avança para conclusão.
- Para menores, nome, um meio de contato do responsável e confirmação de responsabilidade legal são obrigatórios. A confirmação é apenas declaratória na demonstração.
- A necessidade de revisão é derivada localmente de respostas afirmativas/incertas em saúde e segurança: condições, medicação, sintomas, limitações atuais, lesão/cirurgia, restrição, gestação/pós-parto ou informação de saúde adicional. Essa situação bloqueia a conclusão no protótipo; não há encaminhamento real nem avaliação clínica automática.
- Quando uma resposta deixa de ser aplicável, limpar suas respostas condicionais ocultas; ao corrigir a data para maioridade, limpar dados do responsável.

## Navegação e movimento

- Stepper compartilhado de cinco etapas profissionais e seis etapas de aluno; qualquer etapa pode ser aberta diretamente.
- Navegar preserva respostas e não valida por si só. **Continuar** valida a etapa corrente; **Concluir** valida as seis na ordem e leva à primeira inválida, com foco no primeiro campo inválido.
- Um conector avança somente quando **Continuar** valida a etapa de origem.
- Manter botões de voltar/continuar acessíveis no celular, respeitar o teclado virtual e `prefers-reduced-motion`, e preservar layout durante as animações.
- Ao concluir, navegar para uma confirmação de demonstração sem transportar respostas de saúde pela URL.
- Limpar todo o estado do formulário, incluindo credenciais e dados de saúde, antes de navegar para a confirmação.

## Privacidade no protótipo

- Mostrar antes dos campos que se deve usar dados fictícios: nada é transmitido ou salvo, incluindo senha e anamnese.
- Atualizar o aviso de privacidade para descrever as categorias de dados do aluno, o uso futuro informado na ficha, a participação de responsável para menores e a não persistência desta demonstração.
- A necessidade de revisão é apresentada nas etapas de saúde e bloqueia a conclusão; nenhuma resposta chega a profissional algum.

## Restrições

- Seguir a implementação instalada do Next.js 16.4.3 e seus guias locais.
- Não instalar dependências.
- Não executar `git`, `typecheck`, `build`, `lint` ou `test`, conforme as instruções do projeto; não criar nem executar testes.
- Fazer revisão estática manual do fluxo, validações, acessibilidade aparente, responsividade e animações.
